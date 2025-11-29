import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import notesRoutes from "./routes/notes.js";

dotenv.config();
connectDB();

const app = express();

// CORS SETTINGS — must be AFTER app is created
app.use(
  cors({
    origin: "*", // change to your frontend deployed URL later
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Routes
app.get("/api/auth/warmup", (req, res) => {
  res.json({ live: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is running");
});

// PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
