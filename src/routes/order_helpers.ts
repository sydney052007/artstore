import { catalog_repository, order_repository } from "../data";
import { Cart } from "../data/cart_models";
import { Customer } from "../data/customer_models";
import { Address, Order } from "../data/order_models";

export const createAndStoreOrder = async (customer: Customer, 
    address: Address, cart: Cart) : Promise<Order> => {
        const product_ids = cart.lines.map(l => l.productId) ?? [];

        const product_details = Object.fromEntries((await 
            catalog_repository.getProductDetails(product_ids))
            .map(p => [p.id ?? 0,{sale_price: p.sale_price ?? 0,rent_price:p.rent_price ?? 0}]));
        console.log("create",product_details);

        const selections = cart.lines.map(l => ({
            productId: l.productId, quantity: l.quantity,
            type: l.type,rent_date: l.rent_date,supplierId: l.supplierId,
            price: product_details[l.productId]?.[l.price] ?? 0}));
        console.log("selection", selections);
        
        return order_repository.storeOrder({
            customer, address, selections, shipped: false
        })
    }