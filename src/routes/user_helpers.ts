import multer from 'multer';
import path from "path";
import fs from 'fs';
import sharp from 'sharp';

export const uploadDir = path.resolve(__dirname, "../admin/pics/uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

export const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,uploadDir);
    },
    filename: function (req, file, cb){
        cb(null, Date.now() + path.extname(file.originalname));
    }
})

export const upload = multer({
    storage: storage,
    limits: { fileSize: 1 *1024 * 1024},
    fileFilter: function(req,file,cb){
        const fileTypes = /jpeg|jpg|png/i;
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);
        if(extName && mimeType){
            return cb(null, true);
        }else {
            return cb(new Error("only .jpeg, .jpg, .png file"))
        }
    }
})

export const compressImage = async (req, res, next) => {
    if (!req.file) return next();

    const inputPath = req.file.path;
    const outputPath = path.join(uploadDir, `compressed_${req.file.filename}`);

    try {
        await sharp(inputPath)
            .resize(500) // 限制最大寬度
            .jpeg({ quality: 80 }) // 壓縮 JPEG 圖片
            .toFile(outputPath);

        // 刪除原始檔案
        fs.unlinkSync(inputPath);

        // 更新 req.file 路徑
        req.file.path = outputPath;
        req.file.filename = `compressed_${req.file.filename}`;
        next();
    } catch (error) {
        console.error("圖片壓縮失敗:", error);
        next(error);
    }
};