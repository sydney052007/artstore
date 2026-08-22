import { Express } from "express";
import { createCatalogRoutes } from "./catalog";
import { createCartMiddleware, createCartRoutes } from "./cart";
import { createOrderRoutes } from "./order";
import { createAdminRoutes } from "./admin";
import { createHomeRoutes } from "./home";
import { createUserRoutes } from "./user";
import { createSupplierRoutes } from "./supplier";

export const createRoutes = (app: Express) => {
    createCartMiddleware(app);

    createUserRoutes(app);
    createCatalogRoutes(app);
    createCartRoutes(app);
    createOrderRoutes(app);
    createAdminRoutes(app);
    createSupplierRoutes(app);
    createHomeRoutes(app);
}