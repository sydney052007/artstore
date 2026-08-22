import { DataTypes, Sequelize } from "sequelize";
import { CategoryModel, ProductModel } from "./catalog_models";
import { SupplierModel } from "./supplier_models";

const primaryKey = {
    id: {type: DataTypes.INTEGER,autoIncrement: true, primaryKey: true}
};

export const initializeCatalogModels = (sequelize: Sequelize) => {
    ProductModel.init({
        ...primaryKey,
        name: { type: DataTypes.STRING},
        description: { type: DataTypes.STRING},
        sale: { type: DataTypes.BOOLEAN},
        sale_price: { type: DataTypes.INTEGER},
        rent: { type: DataTypes.BOOLEAN},
        rent_price: { type: DataTypes.INTEGER},
        rent_date: { type: DataTypes.JSON},
        available: { type: DataTypes.BOOLEAN},
        photo_URL: { type: DataTypes.STRING}
    }, { sequelize })

    CategoryModel.init({
        ...primaryKey,
        name: { type: DataTypes.STRING},
    },{ sequelize })

    ProductModel.belongsTo(CategoryModel,
        { foreignKey: "categoryId", as: "category"});
    ProductModel.belongsTo(SupplierModel,
        { foreignKey: "supplierId", as: "supplier"});
    CategoryModel.hasMany(ProductModel,
        { foreignKey: "categoryId", as: "products"});
    SupplierModel.hasMany(ProductModel,
        { foreignKey: "supplierId", as: "products"});
}