import { RegisterFormData } from "./pages/Register";
import { SignInFormData } from "./pages/SignIn";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const register = async (formData: RegisterFormData) => {
  const response = await fetch(`${API_BASE_URL}/api/users/register`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const responseBody = await response.json();

  if (!response.ok) {
    throw new Error(responseBody.message);
  }
};

export const signIn = async (formData: SignInFormData) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message);
  }
  return body;
};

export const validateToken = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/validate-token`, {
    credentials: "include",
  });


  if (!response.ok) {
    throw new Error("Token invalid");
  }

  return response.json();
};

export const signOut = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    credentials: "include",
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Error during sign out");
  }
};


//admin

export const getAllUsers = async () => {
  const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};

export const updateUserRole = async (userId: string, role: string) => {
  const res = await fetch(`${API_BASE_URL}/api/admin/${userId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error("Failed to update role");
  return res.json();
};

export const deleteUser = async (userId: string) => {
  const res = await fetch(`${API_BASE_URL}/api/admin/${userId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete user");
  return res.json();
};

export const getAllTickets = async () => {
  const res = await fetch(`${API_BASE_URL}/api/admin/tickets`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch tickets");
  return res.json();
};

export const assignTicketToAgent = async (ticketId: string, agentId: string) => {
  const res = await fetch(`${API_BASE_URL}/api/admin/tickets/${ticketId}/assign`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId }),
  });
  if (!res.ok) throw new Error("Failed to assign ticket");
  return res.json();
};




//user
export const createTicket = async (title: string, description: string ) => {
  const response = await fetch(`${API_BASE_URL}/api/tickets`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description }),
  });

  if (!response.ok) {
    throw new Error("Failed to create ticket");
  }

  return response.json();
};

export const getMyTickets = async () => {
  const res = await fetch(`${API_BASE_URL}/api/tickets`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch tickets");
  return res.json();
};

export const approveTicket = async (ticketId: string) => {
  const res = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/approve`, {
    method: "PATCH",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to approve ticket");
  return res.json();
};


//agent 

// agent APIs

export const getAssignedTickets = async () => {
  const res = await fetch(`${API_BASE_URL}/api/agent/tickets`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch assigned tickets");
  return res.json();
};

export const solveTicket = async (ticketId: string) => {
  const res = await fetch(`${API_BASE_URL}/api/agent/tickets/${ticketId}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "SOLVED" }),
  });
  if (!res.ok) throw new Error("Failed to update ticket status");
  return res.json();
};

export const addMessageToTicket = async (ticketId: string, content: string) => {
  const res = await fetch(`${API_BASE_URL}/api/agent/tickets/${ticketId}/messages`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to add message");
  return res.json();
};

