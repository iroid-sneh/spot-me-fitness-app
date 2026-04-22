import sequelize from "./connection.js";
import User from "./User.js";
import EmailOTP from "./EmailOTP.js";
import FaceVerificationLog from "./FaceVerificationLog.js";
import LoginSession from "./LoginSession.js";
import Profile from "./Profile.js";
import FitnessDetails from "./FitnessDetails.js";
import Lifestyle from "./Lifestyle.js";
import UserMedia from "./UserMedia.js";
import ProgressCapture from "./ProgressCapture.js";
import VerificationBadge from "./VerificationBadge.js";
import PromptQuestion from "./PromptQuestion.js";
import ProfilePromptAnswer from "./ProfilePromptAnswer.js";

User.hasOne(Profile, { foreignKey: "user_id", as: "profile", onDelete: "CASCADE" });
Profile.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasOne(FitnessDetails, { foreignKey: "user_id", as: "fitness", onDelete: "CASCADE" });
FitnessDetails.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasOne(Lifestyle, { foreignKey: "user_id", as: "lifestyle", onDelete: "CASCADE" });
Lifestyle.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasMany(UserMedia, { foreignKey: "user_id", as: "media", onDelete: "CASCADE" });
UserMedia.belongsTo(User, { foreignKey: "user_id", as: "user" });

Profile.belongsTo(UserMedia, { foreignKey: "main_profile_photo_id", as: "mainPhoto" });

User.hasMany(ProgressCapture, { foreignKey: "user_id", as: "progress", onDelete: "CASCADE" });
ProgressCapture.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasOne(VerificationBadge, { foreignKey: "user_id", as: "badge", onDelete: "CASCADE" });
VerificationBadge.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasMany(EmailOTP, { foreignKey: "user_id", as: "otps", onDelete: "CASCADE" });
EmailOTP.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasMany(FaceVerificationLog, { foreignKey: "user_id", as: "faceLogs", onDelete: "CASCADE" });
FaceVerificationLog.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasMany(LoginSession, { foreignKey: "user_id", as: "sessions", onDelete: "CASCADE" });
LoginSession.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasMany(ProfilePromptAnswer, { foreignKey: "user_id", as: "promptAnswers", onDelete: "CASCADE" });
ProfilePromptAnswer.belongsTo(User, { foreignKey: "user_id", as: "user" });
ProfilePromptAnswer.belongsTo(PromptQuestion, { foreignKey: "prompt_question_id", as: "question" });
PromptQuestion.hasMany(ProfilePromptAnswer, { foreignKey: "prompt_question_id", as: "answers" });

export {
    sequelize,
    User,
    EmailOTP,
    FaceVerificationLog,
    LoginSession,
    Profile,
    FitnessDetails,
    Lifestyle,
    UserMedia,
    ProgressCapture,
    VerificationBadge,
    PromptQuestion,
    ProfilePromptAnswer,
};
