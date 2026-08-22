import { Express } from "express";
import { escape, unescape } from "querystring";
import { Cart, addLine, createCart, removeLine } from "../data/cart_models";
import * as cart_helpers from "../data/cart_helpers";
import { catalog_repository } from "../data";
import { ProductModel } from "../data/orm/models";

declare module "express-session"{
    interface SessionData{
        cart?: Cart;
    }
}

export const createCartMiddleware = (app: Express) => {
    app.use((req, resp, next) => {
        resp.locals.cart = req.session.cart = req.session.cart ?? createCart();
        next();
    })
}

export const createCartRoutes = (app: Express) => {
    app.post("/cart", async(req, resp) => {
        const productId = Number.parseInt(req.body.productId);
        if(isNaN(productId)) {
            throw new Error("ID must be an integer");
        }
        addLine(req.session.cart as Cart, productId, 1, req.body.type, req.body.price,
             req.body.rent_date,req.body.supplierId);
        if(req.body.type === "rent"){
            await catalog_repository.updateRentDate(productId, req.body.rent_date)
        }
        resp.redirect(`/cart?returnUrl=${escape(req.body.returnUrl ?? "/")}`);
    });

    app.get("/cart", async (req, resp) => {
        const cart = req.session.cart as Cart;
        console.log(cart);
        resp.render("cart", {
            cart: await cart_helpers.getCartDetail(cart),
            returnUrl: unescape(req.query.returnUrl?.toString() ?? "/")
        });
    });

    app.post("/cart/remove", async (req, resp) => {
         const id = Number.parseInt(req.body.id);
         const type = req.body.type;
         const rent_date = req.body.rent_date;
         if(!isNaN(id)){
            removeLine(req.session.cart as Cart, id, type, rent_date);
         }
         const product = await ProductModel.findByPk(id);
         if(type === "rent" && product){  
            let rentDates = JSON.parse(product.rent_date ?? "");
            if (typeof rentDates === "string") {
                rentDates = JSON.parse(rentDates);
            }

            rentDates = rentDates.filter(date => date !== rent_date);
            product.rent_date = JSON.stringify(rentDates);
            await product.save();
         }
         resp.redirect(`/cart?returnUrl=${escape(req.body.returnUrl ?? "/")}`);
    })
}
