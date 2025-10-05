import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import verifyToken from "../middleware/auth";
import checkRole from "../middleware/role";

const router = express.Router();
const prisma = new PrismaClient();

router.post(
  "/register",
  [
    check("firstName", "First Name is required").isString(),
    check("lastName", "Last Name is required").isString(),
    check("email", "Email is required").isEmail(),
    check("password", "Password with 6 or more characters required").isLength({
      min: 6,
    }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    try {
      let user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 8);

      user = await prisma.user.create({
        data: { firstName, lastName, email, password: hashedPassword, role: "USER" },
      });

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET_KEY as string,
        { expiresIn: "1h" }
      );

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 86400000,
      });

      return res.status(200).send({ message: "User registered OK" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Something went wrong" });
    }
  }
);

router.post("/tickets/:id/messages", verifyToken, checkRole("USER"), async (req: Request, res: Response) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === "") {
        return res.status(400).json({ message: "Message content is required" });
    }

    try {
        const ticket = await prisma.ticket.findUnique({ where: { id } });

        if (!ticket || ticket.ownerId !== req.userId) {
            return res.status(404).json({ message: "Ticket not found or not owned by you" });
        }

        const message = await prisma.message.create({
            data: {
                ticketId: id,
                authorId: req.userId,
                content,
            },
            include: {
                author: { select: { id: true, firstName: true, lastName: true } },
            },
        });

        res.json(message);
    } catch (error) {
        res.status(500).json({ message: "Failed to add message" });
    }
});

router.delete(
  "/tickets/:id",
  verifyToken,
  checkRole("USER"),
  async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const ticket = await prisma.ticket.findUnique({ where: { id } });

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      if (ticket.ownerId !== req.userId) {
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this ticket" });
      }

      // Delete messages first (to avoid foreign key errors)
      await prisma.message.deleteMany({ where: { ticketId: id } });

      // Then delete the ticket
      await prisma.ticket.delete({ where: { id } });

      res.json({ message: "Ticket deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to delete ticket" });
    }
  }
);


export default router;
