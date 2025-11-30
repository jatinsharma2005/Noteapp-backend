// middleware/auth.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const auth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "No token, authorization denied" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Token is not valid" });
  }
};
