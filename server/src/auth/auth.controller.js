import authService from "./auth.service.js";

class authController {
    static async signup(req, res) {
        return await authService.signup(req.body, req, res);
    }

    static async verifyOtp(req, res) {
        return await authService.verifyOtp(req.body, req, res);
    }

    static async login(req, res) {
        return await authService.login(req.body, req, res);
    }

    static async forgotPassword(req, res) {
        return await authService.forgotPassword(req.body, req, res);
    }

    static async resetPassword(req, res) {
        return await authService.resetPassword(req.body, req, res);
    }

    static async resendOtp(req, res) {
        return await authService.resendOtp(req.body, req, res);
    }

    static async faceVerify(req, res) {
        return await authService.faceVerify(req.body, req, res);
    }

    static async logout(req, res) {
        return await authService.logout(req, res);
    }

    static async me(req, res) {
        return await authService.me(req, res);
    }
}

export default authController;
