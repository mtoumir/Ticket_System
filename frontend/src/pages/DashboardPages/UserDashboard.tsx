import { useEffect, useState } from "react";
import { createTicket, getMyTickets, approveTicket, addUserMessageToTicket, userDeleteTicket } from "../../api-client";
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
  const [messageContent, setMessageContent] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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

  const handleAddMessage = async (ticketId: string) => {
    const content = messageContent[ticketId];
    if (!content || content.trim() === "") {
      showToast("Message cannot be empty", "ERROR");
      return;
    }

    try {
      await addUserMessageToTicket(ticketId, content);
      setMessageContent((prev) => ({ ...prev, [ticketId]: "" }));
      fetchTickets();
      showToast("Message added successfully!", "SUCCESS");
    } catch (err) {
      console.error(err);
      showToast("Failed to add message", "ERROR");
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      await userDeleteTicket(ticketId);
      setDeleteConfirm(null);
      fetchTickets();
      showToast("Ticket deleted successfully!", "SUCCESS");
    } catch (error) {
      console.error(error);
      showToast("Failed to delete ticket", "ERROR");
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

  // Check if ticket can receive messages (not closed or approved)
  const canAddMessage = (ticket: Ticket) => {
    return ticket.status !== "CLOSED" && ticket.status !== "APPROVED";
  };

  // Check if ticket can be deleted (typically only pending or assigned tickets)
  const canDeleteTicket = (ticket: Ticket) => {
    return ticket.status === "PENDING" || ticket.status === "ASSIGNED" || ticket.status === "CLOSED";
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
            className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 relative"
          >
            {/* Delete Button */}
            {canDeleteTicket(ticket) && (
              <div className="absolute top-4 right-4 z-10">
                {deleteConfirm === ticket.id ? (
                  <div className="flex items-center space-x-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
                    <span className="text-xs text-gray-700 whitespace-nowrap">Delete?</span>
                    <button
                      onClick={() => handleDeleteTicket(ticket.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium p-1"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium p-1"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(ticket.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all shadow-sm hover:shadow-md"
                    title="Delete ticket"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}

            <div className="h-2 bg-gradient-to-r from-blue-400 to-indigo-500" />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 mr-12">
                  <h3 className="text-lg font-semibold text-gray-800 truncate mb-1">{ticket.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{ticket.description}</p>
                </div>
              </div>

              {/* Messages Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-semibold text-gray-800 flex items-center">
                    <span className="mr-2">💬</span>
                    Conversation
                    {ticket.messages && ticket.messages.length > 0 && (
                      <span className="ml-2 text-blue-600 text-sm font-normal bg-blue-50 px-2 py-1 rounded-full">
                        {ticket.messages.length} messages
                      </span>
                    )}
                  </h4>
                  {ticket.messages && ticket.messages.length > 1 && (
                    <button
                      onClick={() => setExpandedTicketId(expandedTicketId === ticket.id ? null : ticket.id)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                    >
                      {expandedTicketId === ticket.id ? "Collapse" : "Expand"}
                    </button>
                  )}
                </div>

                {/* Messages Display */}
                <div className={`space-y-3 mb-4 transition-all duration-300 ${
                  expandedTicketId === ticket.id ? 'max-h-96' : 'max-h-48'
                } overflow-y-auto bg-gray-50/80 rounded-xl p-4 border border-gray-100`}>
                  {!ticket.messages || ticket.messages.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="text-3xl mb-2">💭</div>
                      <p className="text-gray-500 text-sm">No messages yet</p>
                      <p className="text-gray-400 text-xs">Start the conversation below</p>
                    </div>
                  ) : (
                    ticket.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${
                          msg.author.firstName === "Agent" ? 'flex-row-reverse' : ''
                        }`}
                      >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                          msg.author.firstName === "Agent" 
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                            : 'bg-gradient-to-br from-orange-400 to-amber-400'
                        }`}>
                          {msg.author.firstName === "Agent" ? "A" : "U"}
                        </div>
                        
                        {/* Message Bubble */}
                        <div className={`flex-1 max-w-[80%] ${
                          msg.author.firstName === "Agent" ? 'text-right' : ''
                        }`}>
                          <div className={`inline-block rounded-2xl px-4 py-3 ${
                            msg.author.firstName === "Agent"
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'bg-gray-100 border border-gray-200 text-gray-800'
                          }`}>
                            <div className="text-sm leading-relaxed">{msg.content}</div>
                            <div className={`text-xs mt-1 ${
                              msg.author.firstName === "Agent" 
                                ? 'text-blue-100' 
                                : 'text-gray-500'
                            }`}>
                              {msg.author.firstName} • {new Date(msg.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input - Only show for active tickets */}
                {canAddMessage(ticket) && (
                  <div className="flex gap-2 mt-4">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={messageContent[ticket.id] || ""}
                      onChange={(e) =>
                        setMessageContent((prev) => ({ ...prev, [ticket.id]: e.target.value }))
                      }
                      onKeyPress={(e) => e.key === 'Enter' && handleAddMessage(ticket.id)}
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    />
                    <button
                      onClick={() => handleAddMessage(ticket.id)}
                      disabled={!messageContent[ticket.id]?.trim()}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
                    >
                      <span>📨</span>
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                )}

                {/* Message Disabled State */}
                {!canAddMessage(ticket) && (
                  <div className="text-center py-3 bg-gray-100 rounded-xl border border-gray-200">
                    <p className="text-gray-500 text-sm">
                      {ticket.status === "CLOSED" 
                        ? "This ticket is closed and cannot receive new messages" 
                        : "This ticket is approved and cannot receive new messages"}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
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

                <div className="flex items-center space-x-2">
                  {ticket.status === "SOLVED" && (
                    <button
                      onClick={() => handleApprove(ticket.id)}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                    >
                      Approve
                    </button>
                  )}
                  
                  {/* Delete button for mobile */}
                  {canDeleteTicket(ticket) && (
                    <button
                      onClick={() => setDeleteConfirm(ticket.id)}
                      className="md:hidden bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all shadow-sm hover:shadow-md"
                      title="Delete ticket"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
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