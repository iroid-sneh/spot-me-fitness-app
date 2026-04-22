import fs from "fs";
import path from "path";

export const baseUrl = (filePath = "") => {
    const base = process.env.APP_URL || `${process.env.BASE_URL}:${process.env.PORT}`;
    if (!filePath) return base;
    return `${base}${filePath.startsWith("/") ? filePath : "/" + filePath}`;
};

export const apiBaseUrl = (filePath = "") => {
    const base = `${process.env.APP_URL || `${process.env.BASE_URL}:${process.env.PORT}`}/api/v1`;
    if (!filePath) return base;
    return `${base}${filePath.startsWith("/") ? filePath : "/" + filePath}`;
};

export const haversineKm = (lat1, lon1, lat2, lon2) => {
    if ([lat1, lon1, lat2, lon2].some((v) => v == null)) return null;
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export const deleteFileSafe = (absPath) => {
    try {
        if (absPath && fs.existsSync(absPath)) fs.unlinkSync(absPath);
    } catch {}
};

export const absolutePathFromUrl = (url) => {
    if (!url) return null;
    const rel = url.startsWith("/") ? url.slice(1) : url;
    return path.join(process.cwd(), rel);
};

export const safeRelativeUrl = (absPath) => {
    const cwd = process.cwd();
    const rel = path.relative(cwd, absPath).replace(/\\/g, "/");
    return `/${rel}`;
};
