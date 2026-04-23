import { Op, fn, col, literal } from "sequelize";
import authHelper from "../common/authHelper.js";
import { successResponse } from "../common/utils/response.js";
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
} from "../common/utils/errorException.js";
import {
    User,
    LoginSession,
    Profile,
    FitnessDetails,
    Lifestyle,
    UserMedia,
    FaceVerificationLog,
    ProgressCapture,
    VerificationBadge,
    AdminActionLog,
    Report,
    MediaModerationQueue,
    Subscription,
    PurchaseReceipt,
    PurchaseEntitlement,
    AppSetting,
    sequelize,
} from "../../models/index.js";

const ADMIN_ROLES = ["admin", "super_admin"];
const DEFAULT_SETTINGS = {
    minMediaUpload: 4,
    maxVideoLength: 7,
    faceVerificationRequired: true,
    autoRejectThreshold: 3,
    reportAutoFlag: 5,
    banAppealWindow: 30,
    premiumFeatures: {
        rewind: true,
        profileBoost: true,
        unlockPrompt: true,
        superLike: true,
        priorityQueue: true,
    },
};

const getDisplayName = (user) => user?.profile?.full_name || user?.email || `User #${user?.id}`;

const parseAmount = (value) => Number.parseFloat(value || 0);
const normalizeJsonValue = (value, fallback = {}) => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        } catch {
            return fallback;
        }
    }
    return value;
};
const normalizeArrayValue = (value) => {
    const normalized = normalizeJsonValue(value, []);
    return Array.isArray(normalized) ? normalized : [];
};
const normalizeSettingsValue = (value) => {
    const normalized = normalizeJsonValue(value, DEFAULT_SETTINGS);
    return {
        ...DEFAULT_SETTINGS,
        ...normalized,
        premiumFeatures: {
            ...DEFAULT_SETTINGS.premiumFeatures,
            ...normalizeJsonValue(normalized?.premiumFeatures, DEFAULT_SETTINGS.premiumFeatures),
        },
    };
};

const ensureSettings = async () => {
    const [record] = await AppSetting.findOrCreate({
        where: { setting_key: "admin_panel" },
        defaults: {
            value: DEFAULT_SETTINGS,
            description: "Admin-managed platform configuration",
        },
    });
    return record;
};

const logAdminAction = async (adminUserId, actionType, targetType, targetId, payload = null) => {
    await AdminActionLog.create({
        admin_user_id: adminUserId,
        action_type: actionType,
        target_type: targetType,
        target_id: targetId,
        payload,
    });
};

const getAdminUser = async (userId) => {
    const user = await User.findByPk(userId, {
        include: [{ model: Profile, as: "profile" }],
    });
    if (!user || !ADMIN_ROLES.includes(user.role)) {
        throw new UnauthorizedException("Admin account not found", "ADMIN_NOT_FOUND");
    }
    return user;
};

const buildUserSummary = (user) => ({
    id: user.id,
    email: user.email,
    name: getDisplayName(user),
    role: user.role,
    isVerified: user.is_verified,
    faceVerifiedStatus: user.face_verified_status,
    accountStatus: user.account_status,
    createdAt: user.createdAt,
    profileStatus: user.profile?.profile_status || "pending",
    avatar: (user.profile?.full_name || user.email || "A").slice(0, 2).toUpperCase(),
    fitnessGoals: normalizeArrayValue(user.fitness?.fitness_goals),
    workoutFrequency: user.fitness?.workout_frequency || null,
    trainingStyles: normalizeArrayValue(user.fitness?.training_styles),
    dietStyle: user.fitness?.diet_style || null,
});

class adminService {
    static async login(data, req, res) {
        const user = await User.findOne({ where: { email: data.email } });
        if (!user || !ADMIN_ROLES.includes(user.role)) {
            throw new UnauthorizedException("Invalid admin credentials", "INVALID_CREDENTIALS");
        }

        const isPasswordValid = await authHelper.matchHashedPassword(data.password, user.password_hash);
        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid admin credentials", "INVALID_CREDENTIALS");
        }

        if (user.account_status === "banned") {
            throw new ForbiddenException("Admin account is banned", "ACCOUNT_BANNED");
        }

        const { accessToken, jti, expiresIn } = await authHelper.tokensGenerator(user.id, { role: user.role });
        await LoginSession.create({
            user_id: user.id,
            device_id: req.headers["x-device-id"] || "admin-web",
            ip_address: req.ip,
            user_agent: req.headers["user-agent"],
            jti,
            access_granted_at: new Date(),
            session_status: "active",
        });
        await user.update({ last_login_at: new Date() });

        await logAdminAction(user.id, "admin_login", "auth", user.id, { ip: req.ip });

        return successResponse(res, "Admin login successful", {
            token: accessToken,
            expiresIn,
            admin: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    }

    static async me(req, res) {
        const admin = await getAdminUser(req.user.userId);
        return successResponse(res, "Admin profile fetched", {
            admin: {
                id: admin.id,
                email: admin.email,
                role: admin.role,
                name: getDisplayName(admin),
                lastLoginAt: admin.last_login_at,
            },
        });
    }

    static async logout(req, res) {
        if (req.user?.jti) {
            await LoginSession.update(
                { revoked_at: new Date(), session_status: "revoked" },
                { where: { jti: req.user.jti, user_id: req.user.userId } }
            );
        }
        await logAdminAction(req.user.userId, "admin_logout", "auth", req.user.userId);
        return successResponse(res, "Admin logout successful");
    }

    static async dashboardOverview(req, res) {
        const [
            totalUsers,
            verifiedUsers,
            activeProfiles,
            flaggedUsers,
            pendingVerifications,
            pendingMediaReviews,
            pendingReports,
            pendingProgressReviews,
            activePremium,
            monthlyUsers,
            premiumFeatureUsage,
        ] = await Promise.all([
            User.count({ where: { role: "user" } }),
            User.count({ where: { role: "user", is_verified: true } }),
            Profile.count({ where: { profile_status: "active" } }),
            User.count({ where: { role: "user", account_status: { [Op.in]: ["flagged", "suspended"] } } }),
            FaceVerificationLog.count({ where: { admin_review_status: "pending" } }),
            MediaModerationQueue.count({ where: { status: "pending" } }),
            Report.count({ where: { status: "open" } }),
            ProgressCapture.count({ where: { review_status: "pending" } }),
            Subscription.count({ where: { status: "active" } }),
            User.findAll({
                where: { role: "user" },
                attributes: [
                    [fn("DATE_FORMAT", col("created_at"), "%b"), "month"],
                    [fn("COUNT", col("id")), "users"],
                ],
                group: [literal("DATE_FORMAT(created_at, '%Y-%m')"), literal("DATE_FORMAT(created_at, '%b')")],
                order: [[literal("MIN(created_at)"), "ASC"]],
                raw: true,
                limit: 6,
            }),
            PurchaseEntitlement.findAll({
                attributes: ["type", [fn("SUM", col("quantity_remaining")), "count"]],
                group: ["type"],
                raw: true,
            }),
        ]);

        const userGrowth = monthlyUsers.map((row) => ({
            month: row.month,
            users: Number(row.users),
        }));

        const premiumFeatures = premiumFeatureUsage.map((row) => ({
            feature: row.type,
            count: Number(row.count || 0),
        }));

        const totalReportsClosed = await Report.count({ where: { status: "resolved" } });
        const reportDelta = totalReportsClosed > 0 ? `-${Math.min(99, totalReportsClosed)}%` : "0%";
        const premiumConversions = totalUsers > 0 ? ((activePremium / totalUsers) * 100).toFixed(1) : "0.0";

        return successResponse(res, "Admin dashboard overview fetched", {
            stats: [
                {
                    label: "Total Users",
                    value: totalUsers,
                    change: `${verifiedUsers} verified`,
                    positive: true,
                },
                {
                    label: "Active Profiles",
                    value: activeProfiles,
                    change: `${flaggedUsers} flagged`,
                    positive: flaggedUsers === 0,
                },
                {
                    label: "Premium Conversions",
                    value: `${premiumConversions}%`,
                    change: `${activePremium} active premium`,
                    positive: activePremium >= 0,
                },
                {
                    label: "Reports Pending",
                    value: pendingReports,
                    change: reportDelta,
                    positive: totalReportsClosed > 0,
                },
            ],
            queues: {
                pendingVerifications,
                pendingMediaReviews,
                pendingReports,
                pendingProgressReviews,
            },
            userGrowth,
            premiumFeatures,
            health: {
                totalUsers,
                verifiedUsers,
                activeProfiles,
                flaggedUsers,
                activePremium,
            },
        });
    }

    static async listUsers(req, res) {
        const search = req.query.search?.trim();
        const status = req.query.status?.trim();
        const verificationStatus = req.query.verificationStatus?.trim();
        const profileStatus = req.query.profileStatus?.trim();
        const limit = Math.min(Number(req.query.limit || 20), 100);
        const page = Math.max(Number(req.query.page || 1), 1);
        const offset = (page - 1) * limit;

        const where = { role: "user" };
        if (status) where.account_status = status;
        if (verificationStatus) where.face_verified_status = verificationStatus;

        const profileWhere = {};
        if (profileStatus) profileWhere.profile_status = profileStatus;
        if (search) {
            where[Op.or] = [{ email: { [Op.like]: `%${search}%` } }];
            profileWhere[Op.or] = [{ full_name: { [Op.like]: `%${search}%` } }];
        }

        const { count, rows } = await User.findAndCountAll({
            where,
            include: [
                {
                    model: Profile,
                    as: "profile",
                    required: !!search || !!profileStatus,
                    where: Object.keys(profileWhere).length ? profileWhere : undefined,
                },
                { model: FitnessDetails, as: "fitness" },
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset,
            distinct: true,
        });

        return successResponse(res, "Admin users fetched", {
            items: rows.map(buildUserSummary),
            pagination: {
                page,
                limit,
                total: count,
                totalPages: Math.max(Math.ceil(count / limit), 1),
            },
        });
    }

    static async getUserDetail(req, res) {
        const user = await User.findByPk(req.params.id, {
            include: [
                { model: Profile, as: "profile", include: [{ model: UserMedia, as: "mainPhoto" }] },
                { model: FitnessDetails, as: "fitness" },
                { model: Lifestyle, as: "lifestyle" },
                { model: UserMedia, as: "media", paranoid: false },
                { model: ProgressCapture, as: "progress", paranoid: false },
                { model: VerificationBadge, as: "badge" },
                { model: FaceVerificationLog, as: "faceLogs" },
                { model: Report, as: "receivedReports" },
                { model: Subscription, as: "subscriptions" },
                { model: PurchaseEntitlement, as: "entitlements" },
            ],
        });

        if (!user || user.role !== "user") {
            throw new NotFoundException("User not found", "USER_NOT_FOUND");
        }

        return successResponse(res, "Admin user detail fetched", {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isVerified: user.is_verified,
                faceVerifiedStatus: user.face_verified_status,
                accountStatus: user.account_status,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                profile: user.profile,
                fitness: user.fitness ? {
                    ...user.fitness.toJSON(),
                    training_styles: normalizeArrayValue(user.fitness.training_styles),
                    fitness_goals: normalizeArrayValue(user.fitness.fitness_goals),
                } : null,
                lifestyle: user.lifestyle,
                media: user.media,
                progress: user.progress,
                badge: user.badge,
                verificationHistory: user.faceLogs,
                reports: user.receivedReports,
                subscriptions: user.subscriptions,
                entitlements: user.entitlements,
            },
        });
    }

    static async updateUserStatus(req, res) {
        const user = await User.findByPk(req.params.id);
        if (!user || user.role !== "user") {
            throw new NotFoundException("User not found", "USER_NOT_FOUND");
        }

        await user.update({
            account_status: req.body.status,
            face_verified_status: req.body.status === "banned" ? "failed" : user.face_verified_status,
        });

        await logAdminAction(req.user.userId, "user_status_updated", "user", user.id, req.body);

        return successResponse(res, "User status updated", {
            user: {
                id: user.id,
                accountStatus: user.account_status,
            },
        });
    }

    static async forceFaceVerify(req, res) {
        const user = await User.findByPk(req.params.id);
        if (!user || user.role !== "user") {
            throw new NotFoundException("User not found", "USER_NOT_FOUND");
        }

        await user.update({
            face_verified_status: "pending",
            account_status: user.account_status === "banned" ? "flagged" : user.account_status,
        });
        await FaceVerificationLog.create({
            user_id: user.id,
            result: "pending",
            attempt_count: 0,
            admin_review_status: "pending",
            reason: "Admin requested face re-verification",
        });

        await logAdminAction(req.user.userId, "force_face_verify", "user", user.id);

        return successResponse(res, "Face verification re-triggered");
    }

    static async deleteUser(req, res) {
        const user = await User.findByPk(req.params.id);
        if (!user || user.role !== "user") {
            throw new NotFoundException("User not found", "USER_NOT_FOUND");
        }
        await user.destroy();
        await logAdminAction(req.user.userId, "soft_delete_user", "user", user.id);
        return successResponse(res, "User deleted");
    }

    static async listVerifications(req, res) {
        const rows = await FaceVerificationLog.findAll({
            include: [
                {
                    model: User,
                    as: "user",
                    include: [
                        {
                            model: Profile,
                            as: "profile",
                            include: [{ model: UserMedia, as: "mainPhoto" }],
                        },
                    ],
                },
            ],
            order: [["createdAt", "DESC"]],
            limit: 50,
        });

        return successResponse(res, "Verification reviews fetched", {
            items: rows.map((row) => ({
                id: row.id,
                userId: row.user_id,
                userName: getDisplayName(row.user),
                livePhoto: row.attempt_image_url,
                profilePhoto: row.user?.profile?.mainPhoto?.url || null,
                submittedDate: row.createdAt,
                status: row.admin_review_status,
                result: row.result,
                attemptCount: row.attempt_count,
                reason: row.reason,
            })),
        });
    }

    static async approveVerification(req, res) {
        const row = await FaceVerificationLog.findByPk(req.params.id);
        if (!row) throw new NotFoundException("Verification review not found", "VERIFICATION_NOT_FOUND");

        await row.update({
            admin_review_status: "approved",
            admin_review_note: req.body.note || null,
            reviewed_at: new Date(),
        });
        await User.update(
            { face_verified_status: "approved", account_status: "active" },
            { where: { id: row.user_id } }
        );
        await logAdminAction(req.user.userId, "verification_approved", "face_verification", row.id, req.body);

        return successResponse(res, "Verification approved");
    }

    static async rejectVerification(req, res) {
        const row = await FaceVerificationLog.findByPk(req.params.id);
        if (!row) throw new NotFoundException("Verification review not found", "VERIFICATION_NOT_FOUND");

        await row.update({
            admin_review_status: "rejected",
            admin_review_note: req.body.note || null,
            reviewed_at: new Date(),
        });
        await User.update(
            { face_verified_status: "failed", account_status: "flagged" },
            { where: { id: row.user_id } }
        );
        await logAdminAction(req.user.userId, "verification_rejected", "face_verification", row.id, req.body);

        return successResponse(res, "Verification rejected");
    }

    static async listProgressReviews(req, res) {
        const rows = await ProgressCapture.findAll({
            include: [
                { model: User, as: "user", include: [{ model: Profile, as: "profile" }, { model: VerificationBadge, as: "badge" }] },
            ],
            order: [["createdAt", "DESC"]],
            limit: 50,
        });

        return successResponse(res, "Progress capture reviews fetched", {
            items: rows.map((row) => ({
                id: row.id,
                userId: row.user_id,
                userName: getDisplayName(row.user),
                avatar: getDisplayName(row.user).slice(0, 2).toUpperCase(),
                thumbnail: row.media_url,
                timestamp: `${row.captured_month}/${row.captured_year}`,
                workoutType: row.workout_type,
                badgeGranted: row.user?.badge?.status === "active",
                status: row.review_status,
                caption: row.caption,
                rawVerified: row.is_raw_verified,
            })),
        });
    }

    static async approveProgress(req, res) {
        const row = await ProgressCapture.findByPk(req.params.id);
        if (!row) throw new NotFoundException("Progress capture not found", "PROGRESS_NOT_FOUND");
        await row.update({
            review_status: "approved",
            review_note: req.body.note || null,
            is_raw_verified: true,
        });
        await logAdminAction(req.user.userId, "progress_approved", "progress_capture", row.id, req.body);
        return successResponse(res, "Progress capture approved");
    }

    static async rejectProgress(req, res) {
        const row = await ProgressCapture.findByPk(req.params.id);
        if (!row) throw new NotFoundException("Progress capture not found", "PROGRESS_NOT_FOUND");
        await row.update({
            review_status: "rejected",
            review_note: req.body.note || null,
            is_raw_verified: false,
        });
        await logAdminAction(req.user.userId, "progress_rejected", "progress_capture", row.id, req.body);
        return successResponse(res, "Progress capture rejected");
    }

    static async listMediaQueue(req, res) {
        const type = req.query.type;
        const where = {};
        if (type) where.source_type = type;

        const queueRows = await MediaModerationQueue.findAll({
            where,
            include: [
                { model: User, as: "user", include: [{ model: Profile, as: "profile" }] },
                { model: UserMedia, as: "media" },
                { model: ProgressCapture, as: "progressCapture" },
            ],
            order: [["createdAt", "DESC"]],
            limit: 100,
        });

        const items = queueRows.map((row) => ({
            id: row.id,
            queueId: row.id,
            userId: row.user_id,
            userName: getDisplayName(row.user),
            type: row.source_type,
            thumbnail: row.media?.url || row.progressCapture?.media_url || null,
            mediaId: row.media_id,
            progressId: row.progress_capture_id,
            status: row.status,
            flaggedBy: row.flagged_by,
            aiScore: row.ai_score,
            createdAt: row.createdAt,
        }));

        return successResponse(res, "Media moderation queue fetched", { items });
    }

    static async approveMedia(req, res) {
        const queueRow = await MediaModerationQueue.findByPk(req.params.id);
        if (!queueRow) throw new NotFoundException("Queue item not found", "QUEUE_NOT_FOUND");

        await sequelize.transaction(async (transaction) => {
            await queueRow.update(
                { status: "approved", reviewer_note: req.body.note || null, reviewed_at: new Date() },
                { transaction }
            );
            if (queueRow.media_id) {
                await UserMedia.update(
                    { moderation_status: "approved", moderation_reason: req.body.note || null },
                    { where: { id: queueRow.media_id }, transaction }
                );
            }
            if (queueRow.progress_capture_id) {
                await ProgressCapture.update(
                    { review_status: "approved", review_note: req.body.note || null, is_raw_verified: true },
                    { where: { id: queueRow.progress_capture_id }, transaction }
                );
            }
        });

        await logAdminAction(req.user.userId, "media_approved", "media_queue", queueRow.id, req.body);
        return successResponse(res, "Media approved");
    }

    static async rejectMedia(req, res) {
        const queueRow = await MediaModerationQueue.findByPk(req.params.id);
        if (!queueRow) throw new NotFoundException("Queue item not found", "QUEUE_NOT_FOUND");

        await sequelize.transaction(async (transaction) => {
            await queueRow.update(
                { status: "rejected", reviewer_note: req.body.note || null, reviewed_at: new Date() },
                { transaction }
            );
            if (queueRow.media_id) {
                await UserMedia.update(
                    { moderation_status: "rejected", moderation_reason: req.body.note || null },
                    { where: { id: queueRow.media_id }, transaction }
                );
            }
            if (queueRow.progress_capture_id) {
                await ProgressCapture.update(
                    { review_status: "rejected", review_note: req.body.note || null, is_raw_verified: false },
                    { where: { id: queueRow.progress_capture_id }, transaction }
                );
            }
        });

        await logAdminAction(req.user.userId, "media_rejected", "media_queue", queueRow.id, req.body);
        return successResponse(res, "Media rejected");
    }

    static async listReports(req, res) {
        const rows = await Report.findAll({
            include: [
                { model: User, as: "reporter", include: [{ model: Profile, as: "profile" }] },
                { model: User, as: "reportedUser", include: [{ model: Profile, as: "profile" }] },
                { model: UserMedia, as: "relatedMedia" },
                { model: ProgressCapture, as: "relatedProgress" },
            ],
            order: [["createdAt", "DESC"]],
            limit: 100,
        });

        return successResponse(res, "Reports fetched", {
            items: rows.map((row) => ({
                id: row.id,
                reportedUser: getDisplayName(row.reportedUser),
                reporter: getDisplayName(row.reporter),
                reason: row.reason_category,
                date: row.createdAt,
                status: row.status === "open" ? "Open" : row.status === "resolved" ? "Resolved" : "Dismissed",
                evidence: row.description,
                adminNote: row.admin_note,
                reportedUserId: row.reported_user_id,
                reporterId: row.reporter_id,
                relatedMediaUrl: row.relatedMedia?.url || null,
                relatedProgressUrl: row.relatedProgress?.media_url || null,
            })),
        });
    }

    static async getReport(req, res) {
        const row = await Report.findByPk(req.params.id, {
            include: [
                { model: User, as: "reporter", include: [{ model: Profile, as: "profile" }] },
                { model: User, as: "reportedUser", include: [{ model: Profile, as: "profile" }] },
                { model: UserMedia, as: "relatedMedia" },
                { model: ProgressCapture, as: "relatedProgress" },
            ],
        });
        if (!row) throw new NotFoundException("Report not found", "REPORT_NOT_FOUND");

        return successResponse(res, "Report fetched", {
            report: {
                id: row.id,
                reportedUser: getDisplayName(row.reportedUser),
                reporter: getDisplayName(row.reporter),
                reason: row.reason_category,
                date: row.createdAt,
                status: row.status,
                evidence: row.description,
                adminNote: row.admin_note,
                relatedMediaUrl: row.relatedMedia?.url || null,
                relatedProgressUrl: row.relatedProgress?.media_url || null,
                reportedUserId: row.reported_user_id,
            },
        });
    }

    static async resolveReport(req, res) {
        const report = await Report.findByPk(req.params.id);
        if (!report) throw new NotFoundException("Report not found", "REPORT_NOT_FOUND");

        const { note, userAction = "none" } = req.body;
        const user = await User.findByPk(report.reported_user_id);
        if (!user) throw new NotFoundException("Reported user not found", "USER_NOT_FOUND");

        if (userAction === "suspend") {
            await user.update({ account_status: "suspended" });
        } else if (userAction === "ban") {
            await user.update({ account_status: "banned", face_verified_status: "failed" });
        }

        await report.update({
            status: "resolved",
            admin_note: note || null,
            resolved_at: new Date(),
        });

        await logAdminAction(req.user.userId, "report_resolved", "report", report.id, req.body);
        return successResponse(res, "Report resolved");
    }

    static async dismissReport(req, res) {
        const report = await Report.findByPk(req.params.id);
        if (!report) throw new NotFoundException("Report not found", "REPORT_NOT_FOUND");

        await report.update({
            status: "dismissed",
            admin_note: req.body.note || null,
            resolved_at: new Date(),
        });
        await logAdminAction(req.user.userId, "report_dismissed", "report", report.id, req.body);
        return successResponse(res, "Report dismissed");
    }

    static async financialOverview(req, res) {
        const [subscriptions, receipts, entitlements] = await Promise.all([
            Subscription.findAll({
                include: [{ model: User, as: "user", include: [{ model: Profile, as: "profile" }] }],
                order: [["createdAt", "DESC"]],
                limit: 50,
            }),
            PurchaseReceipt.findAll({
                include: [{ model: User, as: "user", include: [{ model: Profile, as: "profile" }] }],
                order: [["createdAt", "DESC"]],
                limit: 50,
            }),
            PurchaseEntitlement.findAll(),
        ]);

        const totalRevenue = receipts
            .filter((row) => row.verified)
            .reduce((sum, row) => sum + parseAmount(row.amount), 0);

        const transactions = [
            ...subscriptions.map((row) => ({
                id: `subscription-${row.id}`,
                userName: getDisplayName(row.user),
                type: "Premium Subscription",
                item: row.plan,
                amount: "$0.00",
                date: row.createdAt,
            })),
            ...receipts.map((row) => ({
                id: `receipt-${row.id}`,
                userName: getDisplayName(row.user),
                type: row.purchase_type === "subscription" ? "Premium Subscription" : "One-Time Purchase",
                item: row.product_id,
                amount: `$${parseAmount(row.amount).toFixed(2)}`,
                date: row.createdAt,
            })),
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        return successResponse(res, "Financial overview fetched", {
            stats: [
                { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}` },
                { label: "Premium Subscriptions", value: subscriptions.length },
                { label: "One-Time Purchases", value: receipts.filter((row) => row.purchase_type !== "subscription").length },
                {
                    label: "Avg Revenue Per User",
                    value: receipts.length ? `$${(totalRevenue / receipts.length).toFixed(2)}` : "$0.00",
                },
            ],
            transactions,
            entitlements: entitlements.map((row) => ({
                id: row.id,
                type: row.type,
                quantityRemaining: row.quantity_remaining,
                grantedAt: row.granted_at,
            })),
        });
    }

    static async getSettings(req, res) {
        const record = await ensureSettings();
        return successResponse(res, "Settings fetched", { settings: normalizeSettingsValue(record.value) });
    }

    static async updateSettings(req, res) {
        const record = await ensureSettings();
        await record.update({ value: req.body });
        await logAdminAction(req.user.userId, "settings_updated", "settings", record.id, req.body);
        return successResponse(res, "Settings updated", { settings: normalizeSettingsValue(record.value) });
    }
}

export default adminService;
