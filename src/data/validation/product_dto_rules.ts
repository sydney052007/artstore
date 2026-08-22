import { Validator } from "./validator";
import { required, minLength, notnull, no_op } from "./basic_rules";
import { ValidationStatus } from ".";
import { CategoryModel } from "../orm/models";
import { SupplierModel } from "../orm/models/supplier_models";

type ProductDTO = {
    name: string, description: string, available: boolean,
    sale: boolean, rent: boolean, sale_price: number, rent_price: number,
    categoryId: number,supplierId: number, photo_URL: string
}

const supplierExists = async (status: ValidationStatus) => {
    const count = await SupplierModel.count({ where: { id: status.value } });
    if(count !== 1) {
        status.setInvalid(true);
        status.message.push("A valid supplier is required");
    }
}

const categoryExists = async (status: ValidationStatus) => {
    const count = await CategoryModel.count({ where: { id: status.value } });
    if(count !== 1){
        status.setInvalid(true);
        status.message.push("A valid category is required");
    }
}

export const ProductDTOValidator = new Validator<ProductDTO>({
    name: [required, minLength(3)],
    description: required,
    available: no_op,
    sale: no_op,
    rent: no_op,
    sale_price: required,
    rent_price: required,
    categoryId: categoryExists,
    supplierId: supplierExists,
    photo_URL: no_op,
});