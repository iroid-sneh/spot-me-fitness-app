import progressService from "./progress.service.js";

class progressController {
    static async upload(req, res) {
        const data = req.body || {};
        const file = req.file || null;
        return await progressService.upload(data, file, req, res);
    }

    static async listMine(req, res) {
        return await progressService.listMine(req, res);
    }

    static async listByUser(req, res) {
        return await progressService.listByUser(req, res);
    }

    static async remove(req, res) {
        return await progressService.remove(req, res);
    }

    static async badgeStatus(req, res) {
        return await progressService.badgeStatus(req, res);
    }
}

export default progressController;
