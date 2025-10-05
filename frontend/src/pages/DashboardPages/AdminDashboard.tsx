import { useEffect, useState } from "react";
import { 
  getAllUsers, 
  updateUserRole, 
  deleteUser, 
  getAllTickets, 
  assignTicketToAgent 
} from "../../api-client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import Toast from "../../components/Toast";
import { PieLabelRenderProps } from "recharts";
import { CheckCircleIcon, TicketIcon, UserGroupIcon } from "@heroicons/react/24/solid";


type User = {
  id: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "AGENT" | "USER";
  email: string;
  createdAt: string;
};

type Ticket = {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "ASSIGNED" | "SOLVED" | "APPROVED" | "CLOSED";
  ownerId: string;
  agentId?: string;
  createdAt: string;
};

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00bfff"];

const STATUS_CONFIG = {
  PENDING: { color: "#F59E0B", bgColor: "#FEF3C7", label: "Pending" },
  ASSIGNED: { color: "#3B82F6", bgColor: "#DBEAFE", label: "Assigned" },
  SOLVED: { color: "#10B981", bgColor: "#D1FAE5", label: "Solved" },
  APPROVED: { color: "#8B5CF6", bgColor: "#EDE9FE", label: "Approved" },
  CLOSED: { color: "#6B7280", bgColor: "#F3F4F6", label: "Closed" }
};

// Type for chart data
type ChartData = {
  name: string;
  value: number;
};

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "SUCCESS" | "ERROR" } | null>(null);

  const showToast = (message: string, type: "SUCCESS" | "ERROR") => {
    setToast({ message, type });
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch users", "ERROR");
    }
  };

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      const data = await getAllTickets();
      setTickets(data);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch tickets", "ERROR");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTickets();
  }, []);

  // User actions
  const handleRoleChange = async (userId: string, newRole: User["role"]) => {
    try {
      await updateUserRole(userId, newRole);
      fetchUsers();
      showToast("User role updated successfully", "SUCCESS");
    } catch (err) {
      console.error(err);
      showToast("Failed to update user role", "ERROR");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      fetchUsers();
      showToast("User deleted successfully", "SUCCESS");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete user", "ERROR");
    }
  };

  // Ticket actions - fixed to handle unassigning
  const handleAssignTicket = async (ticketId: string, agentId: string) => {
    try {
      // If agentId is empty string, pass null to unassign
      const agentToAssign = agentId === "" ? null : agentId;
      await assignTicketToAgent(ticketId, agentToAssign);
      fetchTickets();
      showToast(agentToAssign ? "Ticket assigned successfully" : "Ticket unassigned successfully", "SUCCESS");
    } catch (err) {
      console.error(err);
      showToast("Failed to assign ticket", "ERROR");
    }
  };

  const agents = users.filter(u => u.role === "AGENT");

  // Analytics
  const ticketsByStatus = tickets.reduce((acc: Record<string, number>, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const ticketsChartData: ChartData[] = Object.entries(ticketsByStatus).map(([status, value]) => ({ 
    name: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status, 
    value 
  }));

  const usersByRole = users.reduce((acc: Record<string, number>, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  const usersChartData: ChartData[] = Object.entries(usersByRole).map(([role, value]) => ({ 
    name: role, 
    value 
  }));

  // Custom label for pie charts
  const renderLabel = ({ name, value }: PieLabelRenderProps & { name?: string; value?: number }) => {
    return `${name} (${value})`;
  };

  // Status progress line for tickets (ClickUp style)
  const StatusProgressLine = ({ status }: { status: Ticket["status"] }) => {
    const statuses: Ticket["status"][] = ["PENDING", "ASSIGNED", "SOLVED", "APPROVED", "CLOSED"];
    const currentIndex = statuses.indexOf(status);
    
    return (
      <div className="flex items-center w-full max-w-md">
        {statuses.map((s, index) => (
          <div key={s} className="flex items-center flex-1">
            <div
              className={`w-3 h-3 rounded-full border-2 ${
                index <= currentIndex ? '' : "bg-gray-200 border-gray-300"
              }`}
              style={index <= currentIndex ? { 
                backgroundColor: STATUS_CONFIG[s].color, 
                borderColor: STATUS_CONFIG[s].color 
              } : {}}
            />
            {index < statuses.length - 1 && (
              <div
                className={`flex-1 h-0.5 ${
                  index < currentIndex ? '' : "bg-gray-200"
                }`}
                style={index < currentIndex ? { 
                  backgroundColor: STATUS_CONFIG[statuses[index + 1]].color 
                } : {}}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen ">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage users, tickets, and monitor system analytics</p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{users.length}</p>
            </div>
            <div className="w-12 h-12  rounded-xl flex items-center justify-center">
              <UserGroupIcon />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Tickets</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{tickets.length}</p>
            </div>
            <div className="w-12 h-12  rounded-xl flex items-center justify-center">
              <TicketIcon />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Assigned Tickets</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {tickets.filter(t => t.status === "ASSIGNED").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircleIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Tickets by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie 
                data={ticketsChartData} 
                dataKey="value" 
                nameKey="name" 
                outerRadius={80}
                label={renderLabel}
              >
                {ticketsChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Users by Role</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie 
                data={usersChartData} 
                dataKey="value" 
                nameKey="name" 
                outerRadius={80}
                label={renderLabel}
              >
                {usersChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
            <p className="text-sm text-gray-600 mt-1">Manage user roles and permissions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={e => handleRoleChange(user.id, e.target.value as User["role"])}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="AGENT">Agent</option>
                        <option value="USER">User</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tickets Table - ClickUp Style */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Ticket Management</h2>
            <p className="text-sm text-gray-600 mt-1">Assign and track ticket progress</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{ticket.title}</p>
                          <p className="text-sm text-gray-500 truncate mt-1">{ticket.description}</p>
                          <div className="mt-2">
                            <StatusProgressLine status={ticket.status} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: STATUS_CONFIG[ticket.status].bgColor,
                          color: STATUS_CONFIG[ticket.status].color
                        }}
                      >
                        {STATUS_CONFIG[ticket.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={ticket.agentId || ""}
                        onChange={e => handleAssignTicket(ticket.id, e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full max-w-xs"
                      >
                        <option value="">Unassigned</option>
                        {agents.map(agent => (
                          <option key={agent.id} value={agent.id}>
                            {agent.firstName} {agent.lastName}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;