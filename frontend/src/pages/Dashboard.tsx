import { useAppContext } from "../contexts/AppContext";
import AdminDashboard from "./DashboardPages/AdminDashboard";
import AgentDashboard from "./DashboardPages/AgentDashboard";
import UserDashboard from "./DashboardPages/UserDashboard";
import Sidebar from "../components/Sidebar";



const Dashboard = () => {
  const { role } = useAppContext();

  return (
    <div className="">
        <Sidebar />
      <div className="flex-1 p-12 bg-gradient-to-br from-blue-100 via-gray-200 to-blue-200 min-h-screen">
        {role === "ADMIN" && <AdminDashboard />}
        {role === "AGENT" && <AgentDashboard />}
        {role !== "ADMIN" && role !== "AGENT" && <UserDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;