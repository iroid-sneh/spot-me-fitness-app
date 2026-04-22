import argon2 from "argon2";
import { User, PromptQuestion } from "../models/index.js";

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

        console.log("Database seeding completed.");
    } catch (error) {
        console.error("Seeding error:", error.message);
    }
};

export default seedDatabase;
