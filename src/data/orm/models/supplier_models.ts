import { Model, CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { Supplier } from "../../supplier_models ";

export class SupplierModel extends Model<InferAttributes<SupplierModel>,
    InferCreationAttributes<SupplierModel>> implements Supplier {
        declare id?: CreationOptional<number>;
        declare name: string;
        declare email: string;
        declare password?: string;
        declare avatar?: string;

        declare federatedId?: string;
    }