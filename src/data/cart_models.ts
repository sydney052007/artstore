export interface CartLine{
    productId: number;
    supplierId: number;
    quantity: number;
    type: string;
    price: string;
    rent_date: string;
}

export interface Cart {
    lines: CartLine[];
}

export const createCart = () : Cart => ({ lines: [] });

export const addLine = (cart: Cart, productId: number, quantity: number, 
    type: string, price: string, rent_date: string, supplierId: number) => {
    if (type === "rent") {
        cart.lines.push({ productId, supplierId,quantity, type, price, rent_date });
        return;
    }

    const line = cart.lines.find(l => l.productId === productId && l.type === type);
    if(line !== undefined) {
        line.quantity += quantity;
        line.supplierId = supplierId
        line.type = type;
        line.price = price;
        line.rent_date = rent_date;
    } else {
        cart.lines.push({ productId,supplierId, quantity, type, price, rent_date})
    }
}

export const removeLine = (cart: Cart, productId: number, type: string, 
    rent_date: string) => {
    console.log(cart, productId,type,rent_date)
    cart.lines = cart.lines.filter(l => !(l.productId === productId && l.type === type
         && l.rent_date === rent_date ));
}