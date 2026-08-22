import multer from 'multer';
import path from "path";
import sharp from 'sharp';
import { ProductModel } from '../../data/orm/models';
import { CategoryModel } from '../../data/orm/models';
import { Express } from 'express';
import { storeImageBuffer } from "../../helpers/image_storage";

declare module "express" {
    interface Request {
        categoryFolder?: string;
    }
}

export const uploadDir = path.resolve(__dirname, "../admin/pics/colorpencil");

export async function setCategoryFolder(req, res, next) {
    const id = req.params.id;
    try {
        const product = await ProductModel.findByPk(id, {
            include: [{ model: CategoryModel, as: 'category' }],
            raw: true
        });
        if (!product) return res.status(404).send('Product not found');
        const categoryFolder = product['category.name'] || 'default';
        req.categoryFolder = categoryFolder;
        next();
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving category');
    }
}

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

export const storeUploadedPhoto = async (req): Promise<string | undefined> => {
    if (!req.file) return undefined;
    const categoryFolder = req.categoryFolder ?? "";
    const filename = Date.now() + path.extname(req.file.originalname);
    return storeImageBuffer(req.file.buffer, filename, path.join(uploadDir, categoryFolder));
};

export const compressImage = async (req, res, next) => {
    if (!req.file) return next();

    try {
        const compressed = await sharp(req.file.buffer)
            .resize(500) // 限制最大寬度
            .jpeg({ quality: 80 }) // 壓縮 JPEG 圖片
            .toBuffer();

        const categoryFolder = req.categoryFolder ?? "";
        const filename = `compressed_${Date.now()}.jpg`;
        req.file.path = await storeImageBuffer(compressed, filename, path.join(uploadDir, categoryFolder));
        req.file.filename = filename;
        next();
    } catch (error) {
        console.error("圖片壓縮失敗:", error);
        next(error);
    }
};
