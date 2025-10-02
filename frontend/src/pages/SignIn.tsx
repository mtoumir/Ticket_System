import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import * as apiClient from "../api-client";
import { useAppContext } from "../contexts/AppContext";
import { Link, useNavigate } from "react-router-dom";

export type SignInFormData = {
  email: string;
  password: string;
};

const SignIn = () => {
  const { showToast } = useAppContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<SignInFormData>();

  const mutation = useMutation(apiClient.signIn, {
    onSuccess: async () => {
      showToast({ message: "Sign in Successful!", type: "SUCCESS" });
      await queryClient.invalidateQueries("validateToken");
      navigate("/");
    },
    onError: (error: Error) => {
      showToast({ message: error.message, type: "ERROR" });
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  return (
    <div className="mt-28 flex items-center justify-center ">
      <form
        className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md space-y-6"
        onSubmit={onSubmit}
      >
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Sign In
        </h2>

        {/* Email Field */}
        <div className="flex flex-col">
          <label className="mb-2 font-semibold text-gray-700">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className={`border rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            {...register("email", { required: "This field is required" })}
          />
          {errors.email && (
            <span className="text-red-500 mt-1">{errors.email.message}</span>
          )}
        </div>

        {/* Password Field */}
        <div className="flex flex-col">
          <label className="mb-2 font-semibold text-gray-700">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className={`border rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            {...register("password", {
              required: "This field is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />
          {errors.password && (
            <span className="text-red-500 mt-1">{errors.password.message}</span>
          )}
        </div>

        {/* Links and Button */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4">
          <Link
            className="text-sm text-blue-600 hover:underline"
            to="/register"
          >
            Not Registered? Create an account
          </Link>
          <button
            type="submit"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-200"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
