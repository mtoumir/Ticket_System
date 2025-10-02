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

  // Ticket actions
  const handleAssignTicket = async (ticketId: string, agentId: string) => {
    try {
      await assignTicketToAgent(ticketId, agentId);
      fetchTickets();
      showToast("Ticket assigned successfully", "SUCCESS");
    } catch (err) {
      console.error(err);
      showToast("Failed to assign ticket", "ERROR");
    }
  };

  const agents = users.filter(u => u.role === "AGENT");

  // Analytics
  const ticketsByStatus = tickets.reduce((acc: any, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const ticketsChartData = Object.entries(ticketsByStatus).map(([status, value]) => ({ name: status, value }));

  const usersByRole = users.reduce((acc: any, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  const usersChartData = Object.entries(usersByRole).map(([role, value]) => ({ name: role, value }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-medium text-gray-500">Total Users</h3>
          <p className="text-3xl font-bold text-gray-800">{users.length}</p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-medium text-gray-500">Total Tickets</h3>
          <p className="text-3xl font-bold text-gray-800">{tickets.length}</p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-medium text-gray-500">Assigned Tickets</h3>
          <p className="text-3xl font-bold text-gray-800">{tickets.filter(t => t.status === "ASSIGNED").length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Tickets by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={ticketsChartData} dataKey="value" nameKey="name" outerRadius={80} fill="#8884d8" label>
                {ticketsChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Users by Role</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={usersChartData} dataKey="value" nameKey="name" outerRadius={80} fill="#82ca9d" label>
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

      {/* Users Table */}
      <div className="bg-white shadow-lg rounded-lg p-6 overflow-x-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">User Management</h2>
        <table className="min-w-full divide-y divide-gray-200 table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Email</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Role</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-2">{user.firstName} {user.lastName}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">
                  <select
                    value={user.role}
                    onChange={e => handleRoleChange(user.id, e.target.value as User["role"])}
                    className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="AGENT">Agent</option>
                    <option value="USER">User</option>
                  </select>
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tickets Table */}
      <div className="bg-white shadow-lg rounded-lg p-6 overflow-x-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Ticket Management</h2>
        <table className="min-w-full divide-y divide-gray-200 table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Title</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Description</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Owner ID</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Assign Agent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tickets.map(ticket => (
              <tr key={ticket.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-2">{ticket.title}</td>
                <td className="px-4 py-2">{ticket.description}</td>
                <td className="px-4 py-2">{ticket.status}</td>
                <td className="px-4 py-2">{ticket.ownerId}</td>
                <td className="px-4 py-2">
                  <select
                    value={ticket.agentId || ""}
                    onChange={e => handleAssignTicket(ticket.id, e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
  );
};

export default AdminDashboard;
