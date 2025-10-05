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

const STATUS_CONFIG = {
  PENDING: { 
    color: "#F59E0B", 
    bgColor: "#FEF3C7", 
    label: "Pending",

  },
  ASSIGNED: { 
    color: "#3B82F6", 
    bgColor: "#DBEAFE", 
    label: "Assigned",

  },
  SOLVED: { 
    color: "#10B981", 
    bgColor: "#D1FAE5", 
    label: "Solved",

  },
  APPROVED: { 
    color: "#8B5CF6", 
    bgColor: "#EDE9FE", 
    label: "Approved",

  },
  CLOSED: { 
    color: "#6B7280", 
    bgColor: "#F3F4F6", 
    label: "Closed",
  }
};

const AgentDashboard = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [messageContent, setMessageContent] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: "SUCCESS" | "ERROR" } | null>(null);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

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

  const toggleExpand = (ticketId: string) => {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
  };

  return (
    <div className="min-h-screen ">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Agent Dashboard</h1>
              <p className="text-gray-600">Manage and resolve customer support tickets</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center bg-white rounded-2xl shadow-sm p-4 min-w-32">
                <div className="text-2xl font-bold text-blue-600">{tickets.length}</div>
                <div className="text-sm text-gray-500">Total Tickets</div>
              </div>
              <div className="text-center bg-white rounded-2xl shadow-sm p-4 min-w-32">
                <div className="text-2xl font-bold text-green-600">
                  {tickets.filter(t => t.status === "SOLVED" || t.status === "APPROVED").length}
                </div>
                <div className="text-sm text-gray-500">Resolved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              {/* Header with Status */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                      {ticket.title}
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {ticket.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: STATUS_CONFIG[ticket.status].bgColor,
                        color: STATUS_CONFIG[ticket.status].color
                      }}
                    >
                      {STATUS_CONFIG[ticket.status].label}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Client Info */}
                <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {ticket.owner.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-800 font-medium text-sm">
                      {ticket.owner.firstName} {ticket.owner.lastName}
                    </div>
                    <div className="text-gray-500 text-xs truncate">
                      {ticket.owner.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Section */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="mr-2">💬</span>
                    Conversation
                    {ticket.messages.length > 0 && (
                      <span className="ml-2 text-blue-600 text-sm font-normal bg-blue-50 px-2 py-1 rounded-full">
                        {ticket.messages.length} messages
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => toggleExpand(ticket.id)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                  >
                    {expandedTicket === ticket.id ? "Collapse" : "Expand"}
                  </button>
                </div>

                {/* Messages */}
                <div className={`space-y-3 mb-4 transition-all duration-300 ${
                  expandedTicket === ticket.id ? 'max-h-96' : 'max-h-32'
                } overflow-y-auto`}>
                  {ticket.messages.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="text-3xl mb-2">💭</div>
                      <p className="text-gray-500 text-sm">No messages yet</p>
                      <p className="text-gray-400 text-xs">Start the conversation below</p>
                    </div>
                  ) : (
                    ticket.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${
                          msg.author.firstName === ticket.owner.firstName ? '' : 'flex-row-reverse'
                        }`}
                      >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                          msg.author.firstName === ticket.owner.firstName 
                            ? 'bg-gradient-to-br from-orange-400 to-amber-400' 
                            : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                        }`}>
                          {msg.author.firstName[0]}
                        </div>
                        
                        {/* Message Bubble */}
                        <div className={`flex-1 max-w-[80%] ${
                          msg.author.firstName === ticket.owner.firstName ? '' : 'text-right'
                        }`}>
                          <div className={`inline-block rounded-2xl px-4 py-3 ${
                            msg.author.firstName === ticket.owner.firstName
                              ? 'bg-gray-100 border border-gray-200 text-gray-800'
                              : 'bg-blue-500 text-white shadow-sm'
                          }`}>
                            <div className="text-sm leading-relaxed">{msg.content}</div>
                            <div className={`text-xs mt-1 ${
                              msg.author.firstName === ticket.owner.firstName 
                                ? 'text-gray-500' 
                                : 'text-blue-100'
                            }`}>
                              {msg.author.firstName} • {new Date(msg.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  {/* Solve Button */}
                  {ticket.status === "ASSIGNED" && (
                    <button
                      onClick={() => handleSolve(ticket.id)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
                    >
                      <span>Mark as Solved</span>
                    </button>
                  )}

                  {/* Message Input */}
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Type your response..."
                      value={messageContent[ticket.id] || ""}
                      onChange={(e) =>
                        setMessageContent((prev) => ({ ...prev, [ticket.id]: e.target.value }))
                      }
                      onKeyPress={(e) => e.key === 'Enter' && handleAddMessage(ticket.id)}
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      onClick={() => handleAddMessage(ticket.id)}
                      disabled={!messageContent[ticket.id]?.trim()}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <span>📨</span>
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {tickets.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Assigned Tickets</h3>
            <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
              You're all caught up! New tickets will appear here when assigned to you.
            </p>
            <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-6 py-3 rounded-xl border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Ready for new assignments</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;