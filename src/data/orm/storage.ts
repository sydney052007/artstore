import { Transaction } from "sequelize";
import { Category, Product } from "../catalog_models";
import { CategoryModel, ProductModel } from "./models";
import { BaseRepo, Constructor } from "./core";
import { Supplier } from "../supplier_models ";
import { SupplierModel } from "./models/supplier_models";

export function AddStorage<TBase extends Constructor<BaseRepo>>(Base: TBase) {
    return class extends Base{
        storeProduct(p: Product){
            return this.sequelize.transaction(async (transaction) => {
                if(p.category){
                    p.category = await this.storeCategory(p.category)
                }
                if(p.supplier){
                    p.supplier = await this.storeSupplier(p.supplier)
                }

                const [stored] = await ProductModel.upsert({
                    id:p.id, name: p.name, description: p.description,
                    sale: p.sale, sale_price: p.sale_price,
                    rent: p.rent, rent_price: p.rent_price,
                    available: p.available, photo_URL: p.photo_URL,
                    categoryId: p.category?.id,supplierId: p.supplier?.id,
                })
                return stored;
            })
        }

        async storeCategory(c: Category, transaction?: Transaction) {
            const [stored] = await CategoryModel.upsert({
                id: c.id, name: c.name
            }, { transaction });
            return stored;
        }

        async storeSupplier(s: Supplier, transaction?: Transaction) {
            const [stored] = await SupplierModel.upsert({
                id: s.id, name: s.name, email: s.email
            }, {transaction});
            return stored;
        }
    }
}