import { Link } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import SignOutButton from "./SignOutButton";

const Sidebar = () => {
  const { isLoggedIn } = useAppContext();

  return (
    <div className="bg-gray-900 shadow-md">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        {/* Brand */}
        <span className="text-lg font-semibold text-white tracking-wide hover:text-blue-400 transition-colors">
          <Link to="/">Tickets System</Link>
        </span>
        <span className="text-blue-300 font-medium">Welcome!</span>


        {/* Auth */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <SignOutButton />
            </>
          ) : (
            <Link
              to="/sign-in"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
