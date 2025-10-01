import { useAppContext } from "../contexts/AppContext";
import AdminDashboard from "./DashboardPages/AdminDashboard";
import AgentDashboard from "./DashboardPages/AgentDashboard";
import UserDashboard from "./DashboardPages/UserDashboard";

const Dashboard = () => {
    const { role } = useAppContext()

    switch (role) {
        case "ADMIN":
            return <AdminDashboard />;
        case "AGENT":
            return <AgentDashboard />;
        case "USER":
            return <UserDashboard />;
        default:
            return <div>Invalid role</div>;
    }
}
export default Dashboard;