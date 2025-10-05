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

const STATUS_CONFIG = {
  PENDING: { color: "#F59E0B", bgColor: "#FEF3C7", label: "Pending" },
  ASSIGNED: { color: "#3B82F6", bgColor: "#DBEAFE", label: "Assigned" },
  SOLVED: { color: "#10B981", bgColor: "#D1FAE5", label: "Solved" },
  APPROVED: { color: "#8B5CF6", bgColor: "#EDE9FE", label: "Approved" },
  CLOSED: { color: "#6B7280", bgColor: "#F3F4F6", label: "Closed" },
};

const UserDashboard = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "SUCCESS" | "ERROR" } | null>(null);
  const [activeTab, setActiveTab] = useState<"ALL" | Ticket["status"]>("ALL");
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

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

  const filteredTickets =
    activeTab === "ALL"
      ? tickets
      : tickets.filter((ticket) => ticket.status === activeTab);

  const getStatusCount = (status: Ticket["status"] | "ALL") => {
    if (status === "ALL") return tickets.length;
    return tickets.filter((t) => t.status === status).length;
  };

  return (
    <div className="min-h-screen w-full md:p-10 overflow-y-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">User Dashboard</h1>
        <p className="text-gray-600 text-lg">Create and track tickets for support</p>
      </header>

      {/* Create Ticket */}
      <section className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-md border border-gray-100 p-6 mb-10 hover:shadow-lg transition-all">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Ticket</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              placeholder="Enter your ticket title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              placeholder="Describe your issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>
          <button
            onClick={handleCreateTicket}
            className="w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 hover:from-indigo-600 hover:to-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            + Create Ticket
          </button>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {["ALL", "PENDING", "ASSIGNED", "SOLVED", "APPROVED", "CLOSED"].map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm transition-all ${
              activeTab === status
                ? "text-white bg-gradient-to-r from-indigo-500 to-blue-600 shadow-md"
                : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span>
              {status === "ALL" ? "All Tickets" : STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].label}
            </span>
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-black/20">
              {getStatusCount(status as any)}
            </span>
          </button>
        ))}
      </div>

      {/* Tickets */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
          >
            <div className="h-2 bg-gradient-to-r from-blue-400 to-indigo-500" />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-800 truncate mb-1">{ticket.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{ticket.description}</p>
                </div>
              </div>

              {/* Messages */}
              {ticket.messages && ticket.messages.length > 0 && (
                <div className="mb-4 bg-gray-50/80 rounded-xl p-3 border border-gray-100 shadow-inner">
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-gray-700">Messages</span>
                  </div>

                  {expandedTicketId === ticket.id
                    ? ticket.messages.map((msg) => (
                        <div key={msg.id} className="mb-2 text-sm text-gray-700">
                          <div className="font-semibold">
                            {msg.author.firstName} {msg.author.lastName}
                          </div>
                          <p>{msg.content}</p>
                          <div className="text-xs text-gray-400">
                            {new Date(msg.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))
                    : (
                        <div className="text-sm text-gray-600">
                          <div className="font-medium mb-1">
                            {ticket.messages[ticket.messages.length - 1].author.firstName}{" "}
                            {ticket.messages[ticket.messages.length - 1].author.lastName}:
                          </div>
                          <p className="line-clamp-2">
                            {ticket.messages[ticket.messages.length - 1].content}
                          </p>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(ticket.messages[ticket.messages.length - 1].createdAt).toLocaleString()}
                          </div>
                        </div>
                      )}

                  {ticket.messages.length > 1 && (
                    <button
                      onClick={() =>
                        setExpandedTicketId(
                          expandedTicketId === ticket.id ? null : ticket.id
                        )
                      }
                      className="w-full mt-3 text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 border border-gray-200 rounded-lg hover:bg-blue-50 transition"
                    >
                      {expandedTicketId === ticket.id
                        ? "Hide messages"
                        : `View all ${ticket.messages.length} messages`}
                    </button>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: STATUS_CONFIG[ticket.status].bgColor,
                      color: STATUS_CONFIG[ticket.status].color,
                    }}
                  >
                    {STATUS_CONFIG[ticket.status].label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {ticket.status === "SOLVED" && (
                  <button
                    onClick={() => handleApprove(ticket.id)}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                  >
                    Approve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty */}
      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">🎫</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
          <p className="text-gray-500">
            {activeTab === "ALL"
              ? "You haven't created any tickets yet."
              : `You don't have any ${STATUS_CONFIG[activeTab as keyof typeof STATUS_CONFIG]?.label.toLowerCase()} tickets.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
