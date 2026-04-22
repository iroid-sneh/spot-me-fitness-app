import mediaService from "./media.service.js";

class mediaController {
    static async list(req, res) {
        return await mediaService.listMine(req, res);
    }

    static async upload(req, res) {
        const data = req.body || {};
        const file = req.file || null;
        return await mediaService.upload(data, file, req, res);
    }

    static async setMain(req, res) {
        return await mediaService.setMain(req, res);
    }

    static async markFitness(req, res) {
        return await mediaService.markFitness(req.body, req, res);
    }

    static async reorder(req, res) {
        return await mediaService.reorder(req.body, req, res);
    }

    static async remove(req, res) {
        return await mediaService.remove(req, res);
    }
}

export default mediaController;
