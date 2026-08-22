import { Model, CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { Customer } from "../../customer_models";
import { Cart } from "../../cart_models";
import { Order, Address } from "../../order_models";

export class CustomerModel extends Model<InferAttributes<CustomerModel>,
    InferCreationAttributes<CustomerModel>> implements Customer {
        declare id?: CreationOptional<number>;
        declare name: string;
        declare email: string;
        declare password?: string;
        declare avatar?: string;

        declare federatedId?: string;
    }