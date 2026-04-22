import profileService from "./profile.service.js";

class profileController {
    static async setupComplete(req, res) {
        return await profileService.setupComplete(req.body, req, res);
    }

    static async myProfile(req, res) {
        return await profileService.myProfile(req, res);
    }

    static async getById(req, res) {
        return await profileService.getPublicProfile(req, res);
    }

    static async editProfile(req, res) {
        return await profileService.editProfile(req.body, req, res);
    }

    static async editFitness(req, res) {
        return await profileService.editFitness(req.body, req, res);
    }

    static async editLifestyle(req, res) {
        return await profileService.editLifestyle(req.body, req, res);
    }

    static async updateLocation(req, res) {
        return await profileService.updateLocation(req.body, req, res);
    }
}

export default profileController;
