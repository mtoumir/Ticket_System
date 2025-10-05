import express, { Request, Response } from "express";
import { PrismaClient, TicketStatus } from "@prisma/client";
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


// ticket management routes for admin
router.get("/tickets", verifyToken, checkRole("ADMIN"), async (req: Request, res: Response) => {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        owner: { select: { id: true, email: true, firstName: true, lastName: true } },
        agent: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// PATCH /admin/tickets/:id/assign - Admin: Assign ticket to an agent
router.patch("/tickets/:id/assign", verifyToken, checkRole("ADMIN"), async (req: Request, res: Response) => {
  const { agentId } = req.body;
  const { id } = req.params;

  try {
    // If agentId is null or empty, unassign the ticket
    if (!agentId) {
      const unassignedTicket = await prisma.ticket.update({
        where: { id },
        data: { agentId: null, status: TicketStatus.PENDING },
        include: {
          owner: { select: { id: true, email: true, firstName: true, lastName: true } },
          agent: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      });

      return res.json(unassignedTicket);
    }

    // Otherwise, assign normally
    const agent = await prisma.user.findUnique({ where: { id: agentId } });
    if (!agent || agent.role !== "AGENT") {
      return res.status(400).json({ message: "Invalid agent" });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { agentId, status: TicketStatus.ASSIGNED },
      include: {
        owner: { select: { id: true, email: true, firstName: true, lastName: true } },
        agent: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });

    res.json(updatedTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not assign/unassign ticket" });
  }
});


router.delete("/tickets/:id", verifyToken, checkRole("ADMIN"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingTicket = await prisma.ticket.findUnique({ where: { id } });
    if (!existingTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    await prisma.ticket.delete({ where: { id } });
    res.json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete ticket" });
  }
});

export default router;
