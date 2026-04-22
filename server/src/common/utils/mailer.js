import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = () => {
    if (transporter) return transporter;
    transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT, 10) || 587,
        secure: parseInt(process.env.MAIL_PORT, 10) === 465,
        auth: process.env.MAIL_USER
            ? { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
            : undefined,
    });
    return transporter;
};

export const sendMail = async ({ to, subject, html, text }) => {
    if (!process.env.MAIL_HOST || !process.env.MAIL_USER) {
        console.log(`[MAIL STUB] To: ${to} | Subject: ${subject}\n${text || html}`);
        return { stubbed: true };
    }
    const info = await getTransporter().sendMail({
        from: `"${process.env.APP_NAME}" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html,
        text,
    });
    return info;
};

export const sendOtpMail = async (to, otp, type) => {
    const subjectMap = {
        1: "Verify your Spot Me account",
        2: "Reset your Spot Me password",
    };
    const subject = subjectMap[type] || "Spot Me verification";
    const text = `Your ${process.env.APP_NAME} verification code is: ${otp}\nThis code expires in 10 minutes.`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; background: #0b0b0b; color: #fff; border-radius: 12px;">
            <h2 style="color: #00ff88;">${process.env.APP_NAME}</h2>
            <p>Your verification code is:</p>
            <h1 style="letter-spacing: 4px; font-size: 40px; color: #00ff88;">${otp}</h1>
            <p style="color: #aaa; font-size: 12px;">This code expires in 10 minutes.</p>
        </div>
    `;
    return sendMail({ to, subject, html, text });
};
