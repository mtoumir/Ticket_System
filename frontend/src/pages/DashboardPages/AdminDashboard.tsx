import { useEffect, useState } from "react";
import { 
  getAllUsers, 
  updateUserRole, 
  deleteUser, 
  getAllTickets, 
  assignTicketToAgent 
} from "../../api-client";

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

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      const data = await getAllTickets();
      setTickets(data);
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // Ticket actions
  const handleAssignTicket = async (ticketId: string, agentId: string) => {
    try {
      await assignTicketToAgent(ticketId, agentId);
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const agents = users.filter(u => u.role === "AGENT");

  return (
    <div className="p-6 space-y-8">
      {/* Users Table */}
      <div>
        <h2 className="text-2xl font-bold mb-4">User Management</h2>
        <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden mb-8">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2">{user.firstName} {user.lastName}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">
                  <select
                    value={user.role}
                    onChange={e => handleRoleChange(user.id, e.target.value as User["role"])}
                    className="border border-gray-300 rounded px-2 py-1"
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
      <div>
        <h2 className="text-2xl font-bold mb-4">Ticket Management</h2>
        <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Owner ID</th>
              <th className="px-4 py-2 text-left">Assign Agent</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id} className="border-t">
                <td className="px-4 py-2">{ticket.title}</td>
                <td className="px-4 py-2">{ticket.description}</td>
                <td className="px-4 py-2">{ticket.status}</td>
                <td className="px-4 py-2">{ticket.ownerId}</td>
                <td className="px-4 py-2">
                  <select
                    value={ticket.agentId || ""}
                    onChange={e => handleAssignTicket(ticket.id, e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1"
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
