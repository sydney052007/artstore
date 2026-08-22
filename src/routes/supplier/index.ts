import { Express, Router } from "express";
import { Request,Response,NextFunction } from "express";
import { createSupplierCatalogRoutes } from "./supplier_catalog_rotues";
import { createSupplierOrderRoutes } from "./supplier_order_routes";
import passport from "passport";
import { supplier_repository } from "../../data";
import bcrypt from 'bcrypt';

export const createSupplierRoutes = (app: Express) => {
    app.use((req, resp, next) => {
        resp.locals.layout = false;
        resp.locals.user = req.user;
        next();
    });

    app.get("/supplier/signin", (req,resp) => resp.render("supplier/signin"));

    app.post("/supplier/signout", (req, resp) =>
        req.logOut(() => { resp.redirect("/supplier/signin")}));

    app.get("/supplier/google",passport.authenticate("supplier-auth"));

    app.get("/supplier-signin-google", passport.authenticate("supplier-auth", {
        successRedirect: "/supplier/signin_success", 
        failureRedirect: "/supplier/signin",  
        keepSessionInfo: true
    }))

    app.get("/supplier/signup/google", passport.authenticate("supplier-auth"));
        
    app.get("/supplier-signin-google", passport.authenticate("supplier-auth",
        { successRedirect: "/supplier/signin_success", failureFlash: "/supplier/signup", keepSessionInfo: true }));

    app.get("/supplier/signup", async (req, resp) => {
        const isAuthenticated = req.isAuthenticated();
        console.log(req.session,req.user, req.user?.avatar);
        if(isAuthenticated){
            return resp.redirect("/supplier");
        }
        req.session.pageSize = 
                req.session.pageSize ?? req.query.pageSize?.toString() ?? "3"; 
        resp.render("supplier/signup")
    });

    app.post("/supplier/signup", async (req, resp) => {
        const { name, email, password } = req.body.supplier;
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await supplier_repository.getSupplierByEmail(email);
        if (existingUser) {
            return resp.status(400).send("Email is already registered!");
        }
        const newCustomer = await supplier_repository.storeSupplier({
            name,email,password:hashedPassword
        })
        console.log("CUSTOMER",newCustomer)
        req.user = {
            id: newCustomer.id,name: newCustomer.name, email: newCustomer.email
        }
        console.log("USER",req.user);
        resp.redirect("/supplier");
    })

    
    app.post("/supplier/signin", passport.authenticate("supplier-local", {
        successRedirect: "/supplier/signin_success",   
        failureRedirect: "/supplier/signin"       
    }));

    app.get("/supplier/signin_success", (req,resp) => {
        console.log(req.user);
        resp.render("supplier/signin_message", {message: "successfully"})
    })

    const cat_router = Router();
    createSupplierCatalogRoutes(cat_router);
    app.use("/api/supplier_products", cat_router);

    const order_router = Router();
    createSupplierOrderRoutes(order_router);
    app.use("/api/supplier_orders", order_router);

    const userAuth = (req, resp, next) => {
        if (!req.user) {
            console.log(req.user);
            return resp.redirect("/supplier/signin")
        }
        next();
    };
    

    app.get("/supplier", userAuth,(req, resp) => resp.redirect("/supplier/supplier_products"));

    app.get("/supplier/supplier_products",userAuth, (req, resp) => {
        resp.locals.content = "/api/supplier_products/table";
        resp.render("supplier/supplier_layout");
    });

    app.get("/supplier/supplier_products/edit/:id", userAuth,(req, resp) => {
        resp.locals.content = `/api/supplier_products/edit/${req.params.id}`;
        resp.render("supplier/supplier_layout");
    });
    
    
    app.get("/supplier/supplier_orders",userAuth, (req,resp) => {
        resp.locals.content = "/api/supplier_orders/table";
        resp.render("supplier/supplier_layout");
    });
}