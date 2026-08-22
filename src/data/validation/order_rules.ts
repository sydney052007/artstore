import { Validator } from "./validator";
import { required, minLength, email, no_op } from "./basic_rules";
import { Address } from "../order_models";
import { Customer } from "../customer_models";

export const CustomerValidator = new Validator<Customer> ({
    name: [required, minLength(3)],
    email: email,
    password: no_op,
    avatar: no_op,
    federatedId: no_op
});
export const AddressValidator = new Validator<Address>({
    street: required,
    city: required,
    zip: no_op
});