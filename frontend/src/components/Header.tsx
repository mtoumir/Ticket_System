import { Link } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import SignOutButton from "./SignOutButton";

const Header = () => {
  const { isLoggedIn } = useAppContext();

  return (
    <div className="bg-gray-800 py-6">
      <div className="container mx-auto flex justify-between">
        <span className="text-xl text-white font-medium tracking-tight">
          <Link to="/">This is a technical test for tython</Link>
        </span>
        <span className="flex space-x-2">
          {isLoggedIn ? (
            <>  
              <span className="flex  items-center text-blue-200 px-3 font-bold">
                Welcome!
              </span>
              <SignOutButton />
            </>
          ) : (
            <Link
              to="/sign-in"
              className="flex bg-white items-center text-blue-600 px-3 font-bold hover:bg-gray-100"
            >
              Sign In
            </Link>
          )}
        </span>
      </div>
    </div>
  );
};

export default Header;
