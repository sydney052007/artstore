import { Model, CreationOptional, ForeignKey, InferAttributes
    ,InferCreationAttributes} from "sequelize";
import { SupplierModel } from "./supplier_models";

export class ProductModel extends Model<InferAttributes<ProductModel>,
    InferCreationAttributes<ProductModel>> {
        declare id?: CreationOptional<number>;

        declare name: string;
        declare description: string;
        declare available: boolean;
        declare photo_URL?: string;

        declare sale: boolean;
        declare sale_price?: number;
        declare rent: boolean;
        declare rent_price?: number;
        declare rent_date?: string;

        declare categoryId: ForeignKey<CategoryModel["id"]>;
        declare supplierId: ForeignKey<SupplierModel["id"]>;

        declare catgeory?: InferAttributes<CategoryModel>;
        declare supplier?: InferAttributes<SupplierModel>;
}

export class CategoryModel extends Model<InferAttributes<CategoryModel>,
    InferCreationAttributes<CategoryModel>>{
        declare id?: CreationOptional<number>;
        declare name: string;

        declare product?: InferAttributes<ProductModel>[];
}


