import express, { Request, Response } from "express";
import { PrismaClient, TicketStatus } from "@prisma/client";
import verifyToken from "../middleware/auth";
import checkRole from "../middleware/role";

const router = express.Router();
const prisma = new PrismaClient();

// GET /agent/tickets - Get all tickets assigned to the logged-in agent
router.get("/tickets", verifyToken, checkRole("AGENT"), async (req: Request, res: Response) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { agentId: req.userId },
      include: {
        owner: { select: { id: true, email: true, firstName: true, lastName: true } },
        messages: {
          include: { author: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// PATCH /agent/tickets/:id/status - Agent can mark ticket as SOLVED
router.patch("/tickets/:id/status", verifyToken, checkRole("AGENT"), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id } });

    if (!ticket || ticket.agentId !== req.userId) {
      return res.status(404).json({ message: "Ticket not found or not assigned to you" });
    }

    if (ticket.status !== TicketStatus.ASSIGNED) {
      return res.status(400).json({ message: "Only ASSIGNED tickets can be updated" });
    }

    if (status !== TicketStatus.SOLVED) {
      return res.status(400).json({ message: "Agents can only change status to SOLVED" });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { status: TicketStatus.SOLVED },
    });

    res.json(updatedTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update ticket status" });
  }
});

// POST /agent/tickets/:id/messages - Agent can comment on their tickets
router.post("/tickets/:id/messages", verifyToken, checkRole("AGENT"), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === "") {
    return res.status(400).json({ message: "Message content is required" });
  }

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id } });

    if (!ticket || ticket.agentId !== req.userId) {
      return res.status(404).json({ message: "Ticket not found or not assigned to you" });
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
    console.error(error);
    res.status(500).json({ message: "Failed to add message" });
  }
});

export default router;
