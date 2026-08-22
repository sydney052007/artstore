import { Express } from "express";

export const createHomeRoutes = (app: Express) => {
    app.get("/home", async (req,resp) => {
        resp.render("home");
    });
}