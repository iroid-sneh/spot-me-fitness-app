import { Exception, HttpStatus } from "../utils/errorException.js";

export default (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
        return next(new Exception("Unauthorized", HttpStatus.UNAUTHORIZED, "UNAUTHORIZED"));
    }
    if (!allowedRoles.includes(req.user.role)) {
        return next(new Exception("Forbidden - insufficient permissions", HttpStatus.FORBIDDEN, "FORBIDDEN"));
    }
    next();
};
