// validators/auth.js
import { body } from "express-validator";

// =========================
// REGISTER VALIDATION
// =========================
export const registerValidator = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),

  body("email")
    .isEmail()
    .withMessage("Valid email required")
    .custom((value) => {
      if (!value.endsWith("@gmail.com")) {
        throw new Error("Only Gmail accounts are allowed (@gmail.com)");
      }
      return true;
    }),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least 1 uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least 1 number")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must contain at least 1 symbol"),
];

// =========================
// LOGIN VALIDATION
// =========================
export const loginValidator = [
  body("email").isEmail().withMessage("Valid email required"),

  body("password").notEmpty().withMessage("Password is required"),
];
