import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";

export const optimizeImage = async (inputPath) => {
    const dir = path.dirname(inputPath);
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(dir, `${baseName}.webp`);

    await sharp(inputPath)
        .rotate()
        .resize({ width: 1080, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(outputPath);

    if (inputPath !== outputPath) {
        try {
            fs.unlinkSync(inputPath);
        } catch {}
    }

    const { size } = fs.statSync(outputPath);
    return { path: outputPath, size_bytes: size, mime_type: "image/webp" };
};

export const getVideoDuration = (filePath) =>
    new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) return reject(err);
            const duration = metadata?.format?.duration;
            if (duration == null) return reject(new Error("Could not read video duration"));
            resolve(parseFloat(duration.toFixed(2)));
        });
    });
