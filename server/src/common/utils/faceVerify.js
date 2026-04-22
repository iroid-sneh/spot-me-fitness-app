const isStubAllowed = () =>
    process.env.FACE_VERIFY_PROVIDER === "stub" ||
    ["development", "test"].includes(process.env.NODE_ENV || "development");

/**
 * Pluggable face verification provider interface.
 * Swap this stub with a real provider (AWS Rekognition, Azure Face, etc.) later.
 */
export const compareFaces = async ({ liveImageUrl, referenceImageUrl }) => {
    if (isStubAllowed()) {
        return {
            match: true,
            confidence: 0.95,
            provider: "stub",
        };
    }
    return { match: false, confidence: 0, provider: "unconfigured" };
};

export const detectFace = async ({ imageUrl }) => {
    if (isStubAllowed()) {
        return {
            hasFace: true,
            faceCount: 1,
            isClear: true,
            provider: "stub",
        };
    }
    return { hasFace: false, faceCount: 0, isClear: false, provider: "unconfigured" };
};
