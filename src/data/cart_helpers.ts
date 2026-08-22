import { catalog_repository } from ".";
import { Cart } from "./cart_models";
import { Product } from "./catalog_models";

export interface CartDetail {
    lines: {
        product: Product,
        quantity: number,
        price: number,
        type: string,
        rent_date: string,
        subtotal: number
    }[],
    total: number;
}

export const getCartDetail = async (cart: Cart) : Promise<CartDetail> => {
    const ids = cart.lines.map(l => l.productId);
    const db_data = await catalog_repository.getProductDetails(ids);

    const products = Object.fromEntries(db_data.map(p => [p.id, p]));

    const lines = cart.lines.map(line =>( {
        product: products[line.productId],
        price: products[line.productId][line.price] as number,
        quantity: line.quantity,
        type: line.type,
        rent_date: line.rent_date,
        subtotal: products[line.productId][line.price] * line.quantity
    }));

    //console.log(lines);

    const total = lines.reduce((total, line) => total + line.subtotal, 0);

    return { lines, total };
}