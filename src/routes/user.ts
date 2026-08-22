import { Express } from "express";
import passport from "passport";
import { AddressValidator, CustomerValidator, 
    ValidationResults, getData, isValid } from "../data/validation";
import { customer_repository } from "../data";
import bcrypt from 'bcrypt';
import { upload,compressImage } from "./user_helpers";
import { Customer } from "../data/customer_models";
import { AddressModel, OrderModel, ProductSelectionModel } from "../data/orm/models/order_models";
import { CustomerModel } from "../data/orm/models/customer_models";
import { ProductModel } from "../data/orm/models";

export const createUserRoutes = (app: Express) => {
    app.get("/signup/google", passport.authenticate("customer-auth"));
    
    app.get("/signin-google", passport.authenticate("customer-auth",
        { successRedirect: "/signin_success", failureFlash: "/signup", keepSessionInfo: true }));

    app.get("/signup", async (req, resp) => {
        const isAuthenticated = req.isAuthenticated();
        console.log(req.session,req.user, req.user?.avatar);
        if(isAuthenticated){
            return resp.render("profile", {user: req.user, file: req.file,show_cart: true});
        }

        if(!req.session.orderData && req.user){
            req.session.orderData = {
                customer: await CustomerValidator.validate(req.user),
                address: await AddressValidator.validate(
                    await customer_repository.getCustomerAddress(
                        req.user?.id ?? 0) ?? {})
            }
        }
        req.session.pageSize = 
                req.session.pageSize ?? req.query.pageSize?.toString() ?? "3"; 
        resp.render("signup", {
            order: req.session.orderData,
            page: 1,
            pageSize: req.session.pageSize,
            show_cart: true
        })
    });

    app.post("/signup", async (req, resp) => {
        const { name, email, password } = req.body.customer;
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await customer_repository.getCustomerByEmail(email);
        if (existingUser) {
            return resp.status(400).send("Email is already registered!");
        }
        const newCustomer = await customer_repository.storeCustomer({
            name,email,password:hashedPassword
        })
        req.user = {
            id: newCustomer.id,name: newCustomer.name, email: newCustomer.email
        }
        //console.log(await customer_repository.getAllCustomers());
        resp.redirect("/");
    })

    app.get("/signin", (req,resp) => {
        resp.render("signin",{show_cart:true});
    })
    app.get("/signin/google", passport.authenticate("customer-auth", { scope: ["profile", "email"] }));

    app.get("/signin-google", 
        passport.authenticate("customer-auth", { successRedirect: "/signin_success", failureRedirect: "/signin" })
    );

    app.post("/signin", passport.authenticate("cusomter-local", {
        successRedirect: "/signin_success",   
        failureRedirect: "/signin_fail"       
    }));

    app.get("/signin_success", (req,resp) => {
        console.log(req.session);
        resp.render("signin_message",{ show_cart: true, message: "successfully"})
    })

    app.get("/signin_fail", (req,resp) => {
        console.log(req.session);
        resp.render("signin_message",{ show_cart: true, message: "fail"})
    })

    app.get("/signout", (req, resp,next) => {
        req.logout((err) => {
            if (err) return next(err);
            resp.redirect("/");
        });
    });
    
    app.post("/upload", upload.single('avatar'),compressImage, async(req,resp) => {
        if(req.user){
            let avatar = req.user.avatar;
            if (req.file){
                avatar = `/uploads/${req.file.filename}`;
            }
            const updateData: Partial<Customer> = {};
            updateData.avatar = avatar;
            if(req.user.id){
                const updateCustomer = await customer_repository.updateCustomer(req.user.id, updateData);
                console.log("Database update result:", updateCustomer);
            }
            req.user.avatar = avatar;
            resp.redirect("/signup");
        }
    })

    app.get("/edit_profile", (req,resp) => {
        resp.render("profile_editor", {
            user:req.user,show_cart: true
        })
    })

    app.post("/edit_profile", async(req,resp) => {
        if(req.user){
            const updateData: Partial<Customer> = {};
            updateData.name = req.body.name;
            updateData.email = req.body.email;
            updateData.password = await bcrypt.hash(req.body.password,10);
            if(req.user.id){
                const updateCustomer = await customer_repository.updateCustomer(req.user?.id, updateData);
            }
            req.user.name = req.body.name;
            req.user.email = req.body.email;
            resp.redirect("/signup")
        }
    })

    app.get("/order_profile", async(req,resp) => {
        const customerId = req.user?.id;
        const orders = (await OrderModel.findAll({
            where:{ customerId },
            include: [
                { model: CustomerModel, as: "customer"},
                { model: AddressModel, as: "address"},
                { model: ProductSelectionModel, as: "selections",
                    include: [{ model: ProductModel, as: "product"}]
                }
            ],
            order: ["shipped", "id"]
        })).map(o => o.toJSON());
        console.log(orders);
        resp.render("user_order_table", { orders,show_cart:true });
    })
}