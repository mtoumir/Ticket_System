import { useEffect, useState } from "react";
import { createTicket, getMyTickets, approveTicket } from "../../api-client";

type Ticket = {
  id: string;
  description: string;
  title: string;
  status: "PENDING" | "ASSIGNED" | "SOLVED" | "APPROVED" | "CLOSED";
  createdAt: string;
};

const UserDashboard = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");

  const fetchTickets = async () => {
    const data = await getMyTickets();
    setTickets(data);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async () => {
    if (!description) return;
    if (!title) return;
    await createTicket(title, description);
    setDescription("");
    setTitle("");
    fetchTickets();
  };

  const handleApprove = async (ticketId: string) => {
    await approveTicket(ticketId);
    fetchTickets();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
  <h1 className="text-4xl font-bold mb-6 text-gray-800">My Tickets</h1>

  {/* Create Ticket Form */}
  <div className="mb-8 flex flex-col md:flex-row gap-4 bg-white shadow-md rounded-lg p-4">
    <input
      type="text"
      placeholder="Ticket description"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
    <input
      type="text"
      placeholder="Ticket title"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
    <button
      onClick={handleCreateTicket}
      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-md transition"
    >
      Create
    </button>
  </div>

  {/* Ticket List */}
  <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {tickets.map((t) => (
      <li
        key={t.id}
        className="bg-white shadow-lg rounded-lg p-4 flex flex-col justify-between hover:shadow-xl transition"
      >
        <div className="mb-3">
          <h2 className="text-xl font-semibold text-gray-700 mb-1">{t.title}</h2>
          <p className="text-gray-600">{t.description}</p>
        </div>
        <div className="flex justify-between items-center mt-4">
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
          <span className="text-gray-400 text-sm">{new Date(t.createdAt).toLocaleDateString()}</span>
        </div>

        {t.status === "SOLVED" && (
          <button
            onClick={() => handleApprove(t.id)}
            className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-md transition"
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
