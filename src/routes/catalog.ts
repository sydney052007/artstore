import { Express } from "express";
import { catalog_repository } from "../data";

export const createCatalogRoutes = (app: Express) => {
    app.get("/", async (req,resp) => {
        const page = Number.parseInt(req.query.page?.toString() ?? "1");
        const pageSize = Number.parseInt(req.query.pageSize?.toString() ?? "3");
        const searchTerm = req.query.searchTerm?.toString();
        const category = Number.parseInt(req.query.category?.toString() ?? "");

        const res = await catalog_repository.getProducts({ page, pageSize, searchTerm, category});

        const products = res.products.map(p=> ({
            ...p,
            rent_date:p.rent_date
        }))
        //console.log(products);
        resp.render("index", {...res, page, pageSize,
            products,pageCount: Math.ceil(res.totalCount / (pageSize ?? 1)),
            searchTerm, category, show_cart: true, show_categories: true});
    });

    app.post("/more", async(req, resp) => {
        const data = req.body;
        let product = (await catalog_repository.getProductDetails([data.productId]))[0];

        console.log(data,product);
        resp.render("product_detail", {data,product});
    })
    
    /*app.get("/err", (req,resp) => {
        throw new Error ("Something bad happened");
    });

    app.get("asyncerr", async(req,resp) => {
        throw new Error ("Something bad happened asyncronously");
    });*/
}