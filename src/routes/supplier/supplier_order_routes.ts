import { Router } from "express";
import { AddressModel, OrderModel, ProductSelectionModel } from "../../data/orm/models/order_models";
import { CustomerModel } from "../../data/orm/models/customer_models";
import { ProductModel } from "../../data/orm/models";

export const createSupplierOrderRoutes = (router: Router) => {
    router.get("/table", async(req, resp) => {
        const orders = (await OrderModel.findAll({
            include: [
                { model: CustomerModel, as: "customer"},
                { model: AddressModel, as: "address"},
                { model: ProductSelectionModel, as: "selections",
                    include: [
                        { 
                            model: ProductModel, 
                            as: "product",
                            where: { supplierId: req.user?.id } // 這裡加上篩選條件
                        }
                    ]
                }
            ],
            order: ["shipped", "id"]
        })).map(o => o.toJSON());
        console.log(orders[0].selections);
        resp.render("supplier/order_table", { orders });
    })

    router.post("/ship", async (req,resp) => {
        const { id, shipped } = req.body;
        const [rows] = await OrderModel.update({ shipped }, { where: {id}});
        if(rows === 1) {
            resp.redirect(303, "/api/supplier_orders/table");
        } else {
            throw new Error(`Expected 1 row updated, but got ${rows}`);
        }
    });
}