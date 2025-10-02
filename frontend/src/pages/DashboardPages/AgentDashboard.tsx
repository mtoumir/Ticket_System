import { useEffect, useState } from "react";
import { getAssignedTickets, solveTicket, addMessageToTicket } from "../../api-client";
import Toast from "../../components/Toast";
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
  const [toast, setToast] = useState<{ message: string; type: "SUCCESS" | "ERROR" } | null>(null);

  const fetchTickets = async () => {
    try {
      const data = await getAssignedTickets();
      setTickets(data);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch tickets", "ERROR");
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const showToast = (message: string, type: "SUCCESS" | "ERROR") => {
    setToast({ message, type });
  };

  const handleSolve = async (ticketId: string) => {
    try {
      await solveTicket(ticketId);
      fetchTickets();
      showToast("Ticket marked as solved!", "SUCCESS");
    } catch (err) {
      console.error(err);
      showToast("Failed to mark ticket as solved", "ERROR");
    }
  };

  const handleAddMessage = async (ticketId: string) => {
    const content = messageContent[ticketId];
    if (!content || content.trim() === "") {
      showToast("Message cannot be empty", "ERROR");
      return;
    }

    try {
      await addMessageToTicket(ticketId, content);
      setMessageContent((prev) => ({ ...prev, [ticketId]: "" }));
      fetchTickets();
      showToast("Message added successfully!", "SUCCESS");
    } catch (err) {
      console.error(err);
      showToast("Failed to add message", "ERROR");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Agent Dashboard</h1>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition-all duration-300"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-gray-800">{ticket.title}</h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
                ticket.status === "ASSIGNED"
                  ? "bg-blue-500"
                  : ticket.status === "SOLVED"
                  ? "bg-yellow-500"
                  : ticket.status === "APPROVED"
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
            >
              {ticket.status}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-2">{ticket.description}</p>
          <p className="text-sm text-gray-500 mb-4">
            Owner: {ticket.owner.firstName} {ticket.owner.lastName} ({ticket.owner.email})
          </p>

          {/* Messages */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Messages</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {ticket.messages.length === 0 ? (
                <p className="text-gray-400 italic">No messages yet.</p>
              ) : (
                ticket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="bg-gray-50 border border-gray-200 rounded-md p-2"
                  >
                    <span className="font-semibold text-gray-700">
                      {msg.author.firstName} {msg.author.lastName}:
                    </span>{" "}
                    {msg.content}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            {ticket.status === "ASSIGNED" && (
              <button
                onClick={() => handleSolve(ticket.id)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition w-full sm:w-auto"
              >
                Mark as Solved
              </button>
            )}
            <input
              type="text"
              placeholder="Add message..."
              value={messageContent[ticket.id] || ""}
              onChange={(e) =>
                setMessageContent((prev) => ({ ...prev, [ticket.id]: e.target.value }))
              }
              className="border border-gray-300 px-3 py-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={() => handleAddMessage(ticket.id)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition w-full sm:w-auto"
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
