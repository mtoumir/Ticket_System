import { useEffect, useState } from "react";
import { getAssignedTickets, solveTicket, addMessageToTicket } from "../../api-client";

type Ticket = {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "ASSIGNED" | "SOLVED" | "APPROVED" | "CLOSED";
  createdAt: string;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  };
  messages: {
    id: string;
    content: string;
    author: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  }[];
};

const AgentDashboard = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [messageContent, setMessageContent] = useState<Record<string, string>>({});

  const fetchTickets = async () => {
    try {
      const data = await getAssignedTickets();
      setTickets(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSolve = async (ticketId: string) => {
    try {
      await solveTicket(ticketId);
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMessage = async (ticketId: string) => {
    const content = messageContent[ticketId];
    if (!content || content.trim() === "") return;

    try {
      await addMessageToTicket(ticketId, content);
      setMessageContent((prev) => ({ ...prev, [ticketId]: "" }));
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Agent Dashboard</h1>

      {tickets.map((ticket) => (
        <div key={ticket.id} className="border p-4 rounded mb-4 shadow">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">{ticket.title}</h2>
            <span className={`px-2 py-1 rounded text-white ${
              ticket.status === "ASSIGNED" ? "bg-blue-500" :
              ticket.status === "SOLVED" ? "bg-green-500" :
              ticket.status === "APPROVED" ? "bg-yellow-500" : "bg-gray-500"
            }`}>
              {ticket.status}
            </span>
          </div>
          <p className="mb-2">{ticket.description}</p>
          <p className="text-sm text-gray-500 mb-2">
            Owner: {ticket.owner.firstName} {ticket.owner.lastName} ({ticket.owner.email})
          </p>

          <div className="mb-2">
            <h3 className="font-semibold">Messages:</h3>
            {ticket.messages.map((msg) => (
              <div key={msg.id} className="border p-2 rounded mb-1">
                <span className="font-semibold">{msg.author.firstName} {msg.author.lastName}:</span> {msg.content}
              </div>
            ))}
          </div>

          {ticket.status === "ASSIGNED" && (
            <button
              onClick={() => handleSolve(ticket.id)}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition mb-2"
            >
              Mark as Solved
            </button>
          )}

          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Add message"
              value={messageContent[ticket.id] || ""}
              onChange={(e) =>
                setMessageContent((prev) => ({ ...prev, [ticket.id]: e.target.value }))
              }
              className="border px-2 py-1 rounded w-full"
            />
            <button
              onClick={() => handleAddMessage(ticket.id)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
            >
              Send
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgentDashboard;
