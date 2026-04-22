import { Op } from "sequelize";
import moment from "moment";
import { ProgressCapture, VerificationBadge } from "../../models/index.js";
import commonService from "../common/utils/common.service.js";
import { BADGE_ACTIVE_WINDOW_DAYS } from "../common/constants/index.js";

class badgeService {
    static async recomputeBadge(userId) {
        const windowStart = moment().subtract(BADGE_ACTIVE_WINDOW_DAYS, "days").toDate();

        const recent = await ProgressCapture.findOne({
            where: {
                user_id: userId,
                created_at: { [Op.gte]: windowStart },
            },
            order: [["created_at", "DESC"]],
        });

        const [badge] = await VerificationBadge.findOrCreate({
            where: { user_id: userId },
            defaults: { user_id: userId, status: "inactive" },
        });

        const newStatus = recent ? "active" : "inactive";
        if (
            badge.status !== newStatus ||
            (recent && badge.last_activity_at?.getTime() !== recent.created_at.getTime())
        ) {
            await badge.update({
                status: newStatus,
                last_activity_at: recent?.created_at || badge.last_activity_at,
                last_updated: new Date(),
            });
        }

        return badge;
    }

    static async recomputeAllBadges() {
        const badges = await commonService.findAll(VerificationBadge, {}, { attributes: ["user_id"] });
        for (const b of badges) {
            await badgeService.recomputeBadge(b.user_id);
        }
    }
}

export default badgeService;
