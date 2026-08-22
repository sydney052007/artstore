import { Express } from "express";
import { getConfig, getSecret } from "./config";
import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } 
    from "passport-google-oauth20";
import { Strategy as LocalStrategy } from 'passport-local';
import { customer_repository } from "./data";
import { supplier_repository } from "./data";
import { Supplier } from "./data/supplier_models ";
import { Customer } from "./data/customer_models";
import bcrypt from 'bcrypt';

const callbackURL: string = getConfig("auth:openauth:redirectionUrl");
const clientID = getSecret("GOOGLE_CLIENT_ID");
const clientSecret = getSecret("GOOGLE_CLIENT_SECRET");

const authCallbackURL: string = getConfig("admin:openauth:redirectionUrl");

const supplierCallbackURL: string = getConfig("supplier:openauth:redirectionUrl");

declare global{
    namespace Express{
        interface User extends Customer{
            adminUser?: boolean;
        }
    }
}
console.log(callbackURL,authCallbackURL,supplierCallbackURL)
export const createAuthentication = (app: Express) => {
    passport.use("admin-auth", new GoogleStrategy({
        clientID, clientSecret, callbackURL: authCallbackURL,
        scope:["email", "profile"],
        state: true
    },(accessToken: string, refreshToken: string,
    profile: Profile, callback: VerifyCallback) => {
        return callback(null, {
            name: profile.displayName,
            email: profile.emails?.[0].value ?? "",
            federatedId: profile.id,
            adminUser: true,
        })
    }) )

    passport.use("supplier-auth",new GoogleStrategy({
        clientID, clientSecret, callbackURL: supplierCallbackURL,
        scope: ["email", "profile"],
        state: true
    }, async (accessToken: string, refreshToken: string,
        profile: Profile, callback: VerifyCallback) => {
        const emailAddr = profile.emails?.[0].value ?? "";
        const supplier = await supplier_repository.storeSupplier({
            name: profile.displayName, email: emailAddr, avatar:undefined, password:undefined,
            federatedId: profile.id
        });
        const { id, name, email } = supplier;
        console.log(supplier_repository.getAllSuppliers());
        return callback(null, { id, name, email});
    }));

    passport.use("customer-auth",new GoogleStrategy({
        clientID, clientSecret, callbackURL,
        scope: ["email", "profile"],
        state: true
    }, async (accessToken: string, refreshToken: string,
        profile: Profile, callback: VerifyCallback) => {
        const emailAddr = profile.emails?.[0].value ?? "";
        const customer = await customer_repository.storeCustomer({
            name: profile.displayName, email: emailAddr, avatar:undefined, password:undefined,
            federatedId: profile.id
        });
        const { id, name, email } = customer;
        console.log(customer_repository.getAllCustomers());
        return callback(null, { id, name, email});
    }));

    passport.use("supplier-local",new LocalStrategy(
        { usernameField: "email", passwordField: "password" },
        async (email, password, done) => {
            
            let supplier = await supplier_repository.getSupplierByEmail(email);
            console.log(supplier, email, password)
            if (!supplier) {
                return done(null, false, { message: "Incorrect email" });
            }
            if (!supplier.password) {
                return done(null, false, { message: "Please sign in using Google." });
            }
    
            const isMatch = await bcrypt.compare(password, supplier.password);
            console.log(isMatch)
            if (!isMatch) {
                return done(null, false, { message: "Incorrect password." });
            }

            return done(null, supplier);
        }
    ));
    
    passport.use("customer-local",new LocalStrategy(
        { usernameField: "email", passwordField: "password" },
        async (email, password, done) => {
            
            let user = await customer_repository.getCustomerByEmail(email);
            console.log(user, email, password)
            if (!user) {
                return done(null, false, { message: "Incorrect email" });
            }
            if (!user.password) {
                return done(null, false, { message: "Please sign in using Google." });
            }
    
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: "Incorrect password." });
            }

            return done(null, user);
        }
    ));
    
    
    passport.serializeUser((user, callback) => {
        callback(null, user.adminUser ? JSON.stringify(user) : user.id);
    })

    passport.deserializeUser((id: number | string, callbackFunc) => {
        if (typeof id == "string"){
            callbackFunc(null, JSON.parse(id));
        } else {
            customer_repository.getCustomer(id).then(user => {
                if(user){
                    const {id, name, email,avatar, federatedId} = user;
                    callbackFunc(null, { id, name, email,avatar, federatedId});
                }else {
                    supplier_repository.getSupplier(id).then(supplier => {
                        if(supplier){
                            const {id, name, email,avatar, federatedId} = supplier;
                            callbackFunc(null, { id, name, email,avatar, federatedId});
                        }
                    })
                }
            })
        }
    })

    app.use(passport.session()); 
}