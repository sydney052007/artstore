import { Model, CreationOptional, InferAttributes, 
    InferCreationAttributes, HasManySetAssociationsMixin, 
    ForeignKey} from "sequelize";
import { ProductModel } from "./catalog_models"; 
import { CustomerModel } from "./customer_models";
import { SupplierModel } from "./supplier_models";
import { Address, Order, ProductSelection } from "../../order_models";

export class OrderModel extends Model<InferAttributes<OrderModel>,
    InferCreationAttributes<OrderModel>> implements OrderModel {
        declare id?: CreationOptional<number>;
        declare shipped: boolean;

        declare customerId: ForeignKey<CustomerModel["id"]>;
        declare customer?: InferAttributes<CustomerModel>;

        declare addressId: ForeignKey<AddressModel["id"]>;
        declare address?: InferAttributes<AddressModel>;

        declare selections?: InferAttributes<ProductSelectionModel>[];

        declare setSelections:
            HasManySetAssociationsMixin<ProductSelectionModel, number>;
}

export class ProductSelectionModel extends Model<InferAttributes<ProductSelectionModel>,
    InferCreationAttributes<ProductSelectionModel>> implements ProductSelectionModel {
        declare id?: CreationOptional<number>;
        declare productId: ForeignKey<ProductModel["id"]>;
        declare product?: InferAttributes<ProductModel>;

        declare quantity: number;
        declare type: string;
        declare rent_date: string;
        declare price: number;

        declare supplierId: ForeignKey<SupplierModel["id"]>;
        declare supplier?: InferAttributes<SupplierModel>;

        declare orderId: ForeignKey<OrderModel["id"]>;
        declare order?: InferAttributes<OrderModel>;
}

export class AddressModel extends Model<InferAttributes<AddressModel>,
    InferCreationAttributes<AddressModel>> implements AddressModel {
        declare id?: CreationOptional<number>;
        declare street: string;
        declare city: string;
        declare zip: string;
}