import { DataTypes, Sequelize } from "sequelize";
import { SupplierModel } from "./supplier_models";

export const initializeSupplierModels = (sequelize: Sequelize) => {
    SupplierModel.init({
        id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
        name: { type: DataTypes.STRING},
        email: { type: DataTypes.STRING},
        password: {type: DataTypes.STRING},
        avatar: { type: DataTypes.STRING},
        federatedId: { type: DataTypes.STRING},
    }, { sequelize });
}