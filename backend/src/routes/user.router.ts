import { Router } from "express";
import { loginUser } from "../controllers/user.controller";

export const userRouter = Router();

userRouter.post("/login", loginUser);
