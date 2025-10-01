import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import verifyToken from "../middleware/auth";
import checkRole from "../middleware/role";

const router = express.Router();
const prisma = new PrismaClient();

// GET /users - Admin: Get all users
router.get("/users", verifyToken, checkRole("ADMIN"), async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET /users/:id - Admin: Get user by ID
router.get("/users/:id", verifyToken, checkRole("ADMIN"), async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// PATCH /users/:id - Admin: Update only role
router.patch("/:id", verifyToken, checkRole("ADMIN"), async (req: Request, res: Response) => {
  const { role } = req.body;

  if (!role || !["ADMIN", "AGENT", "USER"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// DELETE /users/:id - Admin: Delete user
router.delete("/:id", verifyToken, checkRole("ADMIN"), async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
