import { baseUrl } from "../../common/helper.js";

export default class getUserResources {
    constructor(data) {
        this.id = data.id;
        this.email = data.email;
        this.isVerified = data.is_verified;
        this.faceVerifiedStatus = data.face_verified_status;
        this.accountStatus = data.account_status;
        this.role = data.role;
        this.lastLoginAt = data.last_login_at;
    }
}
