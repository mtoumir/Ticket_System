import { useEffect, useState } from "react";
import { createTicket, getMyTickets, approveTicket } from "../../api-client";
import Toast from "../../components/Toast";

type Message = {
  id: string;
  content: string;
  author: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
};

type Ticket = {
  id: string;
  description: string;
  title: string;
  status: "PENDING" | "ASSIGNED" | "SOLVED" | "APPROVED" | "CLOSED";
  createdAt: string;
  messages?: Message[];
};

const UserDashboard = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "SUCCESS" | "ERROR" } | null>(null);

  const fetchTickets = async () => {
    const data = await getMyTickets();
    setTickets(data);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const showToast = (message: string, type: "SUCCESS" | "ERROR") => {
    setToast({ message, type });
  };

  const handleCreateTicket = async () => {
    if (!description || !title) {
      showToast("Please enter both title and description", "ERROR");
      return;
    }

    try {
      await createTicket(title, description);
      setDescription("");
      setTitle("");
      fetchTickets();
      showToast("Ticket created successfully!", "SUCCESS");
    } catch (error) {
      console.error(error);
      showToast("Failed to create ticket", "ERROR");
    }
  };

  const handleApprove = async (ticketId: string) => {
    try {
      await approveTicket(ticketId);
      fetchTickets();
      showToast("Ticket approved successfully!", "SUCCESS");
    } catch (error) {
      console.error(error);
      showToast("Failed to approve ticket", "ERROR");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold mb-6 text-gray-900">My Tickets</h1>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Create Ticket Form */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 bg-white shadow-lg rounded-xl p-6">
        <input
          type="text"
          placeholder="Ticket title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          placeholder="Ticket description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleCreateTicket}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md hover:shadow-lg"
        >
          Create
        </button>
      </div>

      {/* Ticket List */}
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((t) => (
          <li
            key={t.id}
            className="bg-white shadow-lg rounded-xl p-6 flex flex-col justify-between hover:shadow-2xl transition-all duration-300"
          >
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">{t.title}</h2>
              <p className="text-gray-700">{t.description}</p>
            </div>

            {/* Messages */}
            {t.messages && t.messages.length > 0 && (
              <div className="mb-4 bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                <h3 className="font-semibold text-gray-800 mb-2">Agent Messages</h3>
                {t.messages.map((msg) => (
                  <div key={msg.id} className="mb-3 border-l-4 border-blue-400 pl-3">
                    <span className="font-semibold text-gray-700">
                      {msg.author.firstName} {msg.author.lastName}:
                    </span>{" "}
                    <span className="text-gray-700">{msg.content}</span>
                    <div className="text-xs text-gray-400">
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Status and Date */}
            <div className="flex justify-between items-center mb-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  t.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : t.status === "ASSIGNED"
                    ? "bg-blue-100 text-blue-800"
                    : t.status === "SOLVED"
                    ? "bg-purple-100 text-purple-800"
                    : t.status === "APPROVED"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {t.status}
              </span>
              <span className="text-gray-400 text-sm">
                {new Date(t.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Approve Button */}
            {t.status === "SOLVED" && (
              <button
                onClick={() => handleApprove(t.id)}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition shadow-md hover:shadow-lg"
              >
                Approve
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserDashboard;
