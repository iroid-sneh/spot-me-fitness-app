export const successResponse = (res, message, data = null, status = 200) =>
    res.status(status).json({
        success: true,
        message,
        data,
    });

export const errorResponse = (res, message, errorCode = null, status = 500) =>
    res.status(status).json({
        success: false,
        message,
        errorCode,
    });
