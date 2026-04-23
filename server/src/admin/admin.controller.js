import adminService from "./admin.service.js";

class adminController {
    static async login(req, res) {
        return adminService.login(req.body, req, res);
    }

    static async me(req, res) {
        return adminService.me(req, res);
    }

    static async logout(req, res) {
        return adminService.logout(req, res);
    }

    static async dashboardOverview(req, res) {
        return adminService.dashboardOverview(req, res);
    }

    static async listUsers(req, res) {
        return adminService.listUsers(req, res);
    }

    static async getUserDetail(req, res) {
        return adminService.getUserDetail(req, res);
    }

    static async updateUserStatus(req, res) {
        return adminService.updateUserStatus(req, res);
    }

    static async forceFaceVerify(req, res) {
        return adminService.forceFaceVerify(req, res);
    }

    static async deleteUser(req, res) {
        return adminService.deleteUser(req, res);
    }

    static async listVerifications(req, res) {
        return adminService.listVerifications(req, res);
    }

    static async approveVerification(req, res) {
        return adminService.approveVerification(req, res);
    }

    static async rejectVerification(req, res) {
        return adminService.rejectVerification(req, res);
    }

    static async listProgressReviews(req, res) {
        return adminService.listProgressReviews(req, res);
    }

    static async approveProgress(req, res) {
        return adminService.approveProgress(req, res);
    }

    static async rejectProgress(req, res) {
        return adminService.rejectProgress(req, res);
    }

    static async listMediaQueue(req, res) {
        return adminService.listMediaQueue(req, res);
    }

    static async approveMedia(req, res) {
        return adminService.approveMedia(req, res);
    }

    static async rejectMedia(req, res) {
        return adminService.rejectMedia(req, res);
    }

    static async listReports(req, res) {
        return adminService.listReports(req, res);
    }

    static async getReport(req, res) {
        return adminService.getReport(req, res);
    }

    static async resolveReport(req, res) {
        return adminService.resolveReport(req, res);
    }

    static async dismissReport(req, res) {
        return adminService.dismissReport(req, res);
    }

    static async financialOverview(req, res) {
        return adminService.financialOverview(req, res);
    }

    static async getSettings(req, res) {
        return adminService.getSettings(req, res);
    }

    static async updateSettings(req, res) {
        return adminService.updateSettings(req, res);
    }
}

export default adminController;
