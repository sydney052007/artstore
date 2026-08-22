import multer from 'multer';
import path from "path";
import sharp from 'sharp';
import { storeImageBuffer } from "../helpers/image_storage";

export const uploadDir = path.resolve(__dirname, "../admin/pics/uploads");

export const upload = multer({
    storage: multer.memoryStorage(),
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

    try {
        const compressed = await sharp(req.file.buffer)
            .resize(500) // 限制最大寬度
            .jpeg({ quality: 80 }) // 壓縮 JPEG 圖片
            .toBuffer();

        const filename = `compressed_${Date.now()}.jpg`;
        req.file.path = await storeImageBuffer(compressed, filename, uploadDir);
        req.file.filename = filename;
        next();
    } catch (error) {
        console.error("圖片壓縮失敗:", error);
        next(error);
    }
};
