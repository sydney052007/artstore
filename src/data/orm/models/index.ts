import { Sequelize } from "sequelize";
import { initializeCatalogModels } from "./catalog_helpers";
import { initializeCustomerModels } from "./customer_helpers";
import { initializeOrderModels } from "./order_helpers";
import { initializeSupplierModels } from "./supplier_helpers";

export { ProductModel, CategoryModel } from "./catalog_models";

export const initializeModels = (sequelize: Sequelize) => {
    initializeSupplierModels(sequelize);
    initializeCatalogModels(sequelize);
    initializeCustomerModels(sequelize);
    initializeOrderModels(sequelize);
}