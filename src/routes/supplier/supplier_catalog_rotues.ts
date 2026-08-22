import { Router } from "express";
import { SupplierModel } from "../../data/orm/models/supplier_models";
import { CategoryModel, ProductModel} from "../../data/orm/models";
import { catalog_repository } from "../../data";
import { supplier_repository } from "../../data";
import { ProductDTOValidator, getData, isValid } from "../../data/validation";
import { Sequelize } from "sequelize";
import { setCategoryFolder,upload,storeUploadedPhoto } from "./helper";

export const createSupplierCatalogRoutes = (router: Router) => {
    router.get("/table", async (req,resp) => {
        console.log(req.user);
        if(req.user){
            const supplier = await supplier_repository.getSupplierByEmail(req.user.email);
            const products = await ProductModel.findAll(
                {
                where: { supplierId: supplier?.id},
                include: [
                    {model: SupplierModel, as: "supplier"},
                    {model: CategoryModel, as: "category"}],
                raw: true, nest: true
            });
            console.log("PRODUCT:",products);
            console.log(supplier);
            resp.render("supplier/product_table", { products });
        }
        
    });

    router.delete("/:id", async(req,resp) => {
        const id = req.params.id;
        const count = await ProductModel.destroy({ where: { id }});
        if(count == 1){
            resp.end();
        }else {
            throw Error(`Unexpected deletion count result: ${count}`)
        }
    });

    router.get("/edit/:id" ,async(req,resp) => {
        const id = req.params.id;
        const data = {
            product: { id: { value: id},
            ...await ProductDTOValidator.validate(
                await ProductModel.findByPk(id, { raw: true}))},
            suppliers: await SupplierModel.findOne({where:{id:id},raw: true}),
            categories: await CategoryModel.findAll({raw: true})
        };
        const photo_data =await ProductModel.findByPk(id, {
            attributes: ['photo_URL', 'categoryId',
                [Sequelize.col('category.name'), 'categoryName']
            ],
            include: [{
                model: CategoryModel,
                as: 'category',
                attributes: ['name'] 
            }],
            raw: true
        });
        
        console.log("photo",photo_data)
        console.log("D", data);
        
        resp.render("supplier/product_editor", {data,photo_data});
    });

    router.put("/:id",async (req, resp) => {
        const validation = await ProductDTOValidator.validate(req.body);
        console.log(validation)
        if(isValid(validation)) {
            await ProductModel.update(
                getData(validation), { where: { id: req.params.id}}
            );
            console.log("success")
            resp.redirect(303, "/api/supplier_products/table");
        } else {
            console.log("fail")
            resp.render("supplier/product_editor", {
                product: { id: { value: req.params.id }, ...validation },
                suppliers: await SupplierModel.findOne({where:{id:req.params.id},raw: true}),
                categories: await CategoryModel.findAll({raw:true})
            })
        }
    });

    router.get("/create", async(req, resp) => {
        console.log(req.user);
        const suppliers = await SupplierModel.findOne(
            { where:{id: req.user?.id},
                raw: true});
        const data = {
            product: {},
            suppliers: suppliers,
            categories: await CategoryModel.findAll({raw: true}),
            create: true
        };
        resp.render("supplier/product_editor", data);
    })

    router.post("/create", async(req, resp) => {
        const validation = await ProductDTOValidator.validate(req.body);
        console.log(validation)
        if(isValid(validation)) {
            await ProductModel.create(getData(validation));
            resp.redirect(303, "/api/supplier_products/table");
        } else {
            resp.render("supplier/product_editor", {
                product: validation,
                suppliers: await SupplierModel.findOne(
                    { where:{id: req.user?.id},
                        raw: true}),
                categories: await CategoryModel.findAll({raw: true}),
                create: true
            })
        }
    })

    router.get("/photo_edit/:id", async(req, resp) => {
        const id = req.params.id;
        const photo_data =await ProductModel.findByPk(id, {
            attributes: ['photo_URL', 'categoryId',
                [Sequelize.col('category.name'), 'categoryName']
            ],
            include: [{
                model: CategoryModel,
                as: 'category',
                attributes: ['name'] 
            }],
            raw: true
        });
        console.log(photo_data);
        resp.render("supplier/photo_editor", {photo_data});
    })
    
    router.put("photo_edit/:id",setCategoryFolder, upload.single('photo'), async(req, resp) => {
        const id = req.params.id;
        const file = req.file;
        const validation = await ProductDTOValidator.validate(req.body);
        console.log(validation);

        if (isValid(validation)) {
            let updateData = getData(validation);

            if (file) {
                updateData.photo_URL = await storeUploadedPhoto(req) as string;
            }

            await ProductModel.update(updateData, { where: { id } });
            console.log("success");
            resp.redirect(303, "/api/supplier_products/table");
        } else {
            console.log("fail");
            resp.render("supplier/photo_editor", {
                photo_data: { id: { value: req.params.id }, ...validation },
                categories: await CategoryModel.findAll({ raw: true })
            });
        }
    });

}
