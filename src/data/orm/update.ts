import {  Product } from "../catalog_models";
import { ProductModel} from "./models";
import { BaseRepo, Constructor } from "./core";


export function AddUpdate<TBase extends Constructor<BaseRepo>>(Base: TBase) {
    return class extends Base{
        async updateRentDate(id: number,d: string){
            const product = await ProductModel.findByPk(id);
            if(!product || !d) return null;

            console.log("Before Update:", product.rent_date, typeof product.rent_date);
            let rentDates: string[] = product.rent_date ? JSON.parse(product.rent_date) : [];
            console.log(rentDates);
            
            rentDates.push(d);
            product.rent_date = JSON.stringify(rentDates) ; 
            await product.save();
            const updatedProduct = await ProductModel.findByPk(id);
            console.log("Updated product:", updatedProduct?.get()); 
            return product;
        }
    }
}