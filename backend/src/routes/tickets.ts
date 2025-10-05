import express, { Request, Response } from "express";
import { PrismaClient, TicketStatus } from "@prisma/client";
import verifyToken from "../middleware/auth";
import checkRole from "../middleware/role";

const router = express.Router();
const prisma = new PrismaClient();

// Create a ticket (user only)
router.post("/", verifyToken, checkRole("USER"), async (req: Request, res: Response) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required" });
  }

  try {
    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        ownerId: req.userId,
        status: TicketStatus.PENDING, // default status
      },
    });
    res.status(201).json(ticket);
  } catch (err) {
    console.error("Error creating ticket:", err);
    res.status(500).json({ message: "Could not create ticket" });
  }
});

// Get all tickets of the user
// Get all tickets of the user with messages and agent info
router.get("/", verifyToken, checkRole("USER"), async (req: Request, res: Response) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { ownerId: req.userId },
      include: {
        agent: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        messages: {
          include: {
            author: {
              select: { id: true, firstName: true, lastName: true, role: true },
            },
          },
          orderBy: { createdAt: "asc" }, // so messages show in chronological order
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch tickets" });
  }
});


// Update ticket status from SOLVED to APPROVED
// Update ticket status from SOLVED to APPROVED
router.patch("/:id/approve", verifyToken, checkRole("USER"), async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (ticket.ownerId !== req.userId) return res.status(403).json({ message: "Not authorized" });
    if (ticket.status !== TicketStatus.SOLVED)
      return res.status(400).json({ message: "Only SOLVED tickets can be approved" });

    // Update to APPROVED
    const updated = await prisma.ticket.update({
      where: { id },
      data: { status: TicketStatus.APPROVED },
    });

    // Auto-close ticket after 30 seconds
    setTimeout(async () => {
      try {
        await prisma.ticket.update({
          where: { id },
          data: { status: TicketStatus.CLOSED },
        });
        console.log(`Ticket ${id} automatically closed after 30 seconds`);
      } catch (err) {
        console.error(`Failed to auto-close ticket ${id}:`, err);
      }
    }, 30000); // 30000ms = 30 seconds

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update ticket" });
  }
});

export default router;
