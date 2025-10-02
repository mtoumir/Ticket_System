import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import * as apiClient from "../api-client";
import { useAppContext } from "../contexts/AppContext";
import { useNavigate, Link } from "react-router-dom";

export type RegisterFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const Register = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showToast } = useAppContext();

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const mutation = useMutation(apiClient.register, {
    onSuccess: async () => {
      showToast({ message: "Registration Success!", type: "SUCCESS" });
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
    <div className="mt-12 flex items-center justify-center">
      <form
        onSubmit={onSubmit}
        className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-lg space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Create an Account
        </h2>

        {/* Name Fields */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">First Name</label>
            <input
              className={`border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
              {...register("firstName", { required: "This field is required" })}
            />
            {errors.firstName && (
              <span className="text-red-500 mt-1">{errors.firstName.message}</span>
            )}
          </div>
          <div className="flex-1 flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Last Name</label>
            <input
              className={`border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
              {...register("lastName", { required: "This field is required" })}
            />
            {errors.lastName && (
              <span className="text-red-500 mt-1">{errors.lastName.message}</span>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="mb-2 font-semibold text-gray-700">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className={`border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            {...register("email", { required: "This field is required" })}
          />
          {errors.email && (
            <span className="text-red-500 mt-1">{errors.email.message}</span>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col">
          <label className="mb-2 font-semibold text-gray-700">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className={`border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
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

        {/* Confirm Password */}
        <div className="flex flex-col">
          <label className="mb-2 font-semibold text-gray-700">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password"
            className={`border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            }`}
            {...register("confirmPassword", {
              validate: (val) => {
                if (!val) return "This field is required";
                if (watch("password") !== val) return "Your passwords do not match";
              },
            })}
          />
          {errors.confirmPassword && (
            <span className="text-red-500 mt-1">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-md transition duration-200"
        >
          Create Account
        </button>

        {/* Already have an account */}
        <p className="text-center text-gray-600 mt-2">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
