import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import userRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import cookieParser from "cookie-parser";
import path from "path";


const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/", adminRoutes);

app.listen(7000, () => {
  console.log("server running on localhost:7000");
});
