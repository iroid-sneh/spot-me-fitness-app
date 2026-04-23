import argon2 from "argon2";
import {
    User,
    PromptQuestion,
    AppSetting,
    Report,
    PurchaseReceipt,
    PurchaseEntitlement,
    Subscription,
} from "../models/index.js";

const DEFAULT_PROMPTS = [
    "What keeps you consistent?",
    "What is your current goal?",
    "What is your favorite workout day?",
    "What are you training for right now?",
    "Describe your ideal training partner.",
    "What's the best fitness advice you've received?",
    "Morning workouts or evening workouts?",
    "What does discipline mean to you?",
    "Your go-to post-workout meal?",
    "A fitness milestone you're proud of?",
    "What keeps you motivated on hard days?",
    "Your weakness at the gym?",
    "Favorite exercise of all time?",
    "Rest day rituals?",
    "What do you enjoy outside the gym?",
];

const seedDatabase = async () => {
    try {
        const adminEmail = "admin@spotme.com";
        const exists = await User.findOne({ where: { email: adminEmail } });
        if (!exists) {
            const password_hash = await argon2.hash("admin123");
            await User.create({
                email: adminEmail,
                password_hash,
                is_verified: true,
                face_verified_status: "approved",
                account_status: "active",
                role: "super_admin",
            });
            console.log("Admin seeded.");
        }

        const promptCount = await PromptQuestion.count();
        if (promptCount === 0) {
            await PromptQuestion.bulkCreate(DEFAULT_PROMPTS.map((text) => ({ text, is_active: true })));
            console.log("Prompt questions seeded.");
        }

        const settingsCount = await AppSetting.count({ where: { setting_key: "admin_panel" } });
        if (settingsCount === 0) {
            await AppSetting.create({
                setting_key: "admin_panel",
                value: {
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
                },
                description: "Admin-managed platform configuration",
            });
            console.log("Admin settings seeded.");
        }

        const admin = await User.findOne({ where: { email: adminEmail } });
        if (admin) {
            const reportCount = await Report.count();
            if (reportCount === 0) {
                await Report.create({
                    reporter_id: admin.id,
                    reported_user_id: admin.id,
                    reason_category: "System",
                    description: "Initial placeholder report for admin panel testing.",
                    status: "dismissed",
                    admin_note: "Seeded placeholder",
                    resolved_at: new Date(),
                });
                console.log("Seed report inserted.");
            }

            const receiptCount = await PurchaseReceipt.count();
            if (receiptCount === 0) {
                const receipt = await PurchaseReceipt.create({
                    user_id: admin.id,
                    platform: "internal",
                    product_id: "profile_boost",
                    transaction_id: "seed-profile-boost",
                    purchase_type: "one_time",
                    amount: 2.99,
                    currency: "USD",
                    verified: true,
                    raw_payload: { seeded: true },
                });
                await PurchaseEntitlement.findOrCreate({
                    where: { user_id: admin.id, type: "profile_boost" },
                    defaults: {
                        quantity_remaining: 1,
                        granted_at: new Date(),
                        source_receipt_id: receipt.id,
                    },
                });
                await Subscription.findOrCreate({
                    where: { user_id: admin.id, plan: "Seed Premium", platform: "internal" },
                    defaults: {
                        status: "active",
                        started_at: new Date(),
                        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        auto_renew: false,
                    },
                });
                console.log("Seed financial data inserted.");
            }
        }

        console.log("Database seeding completed.");
    } catch (error) {
        console.error("Seeding error:", error.message);
    }
};

export default seedDatabase;
