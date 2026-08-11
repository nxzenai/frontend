"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";

import useAuth from "@/hooks/useAuth";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    try {
      setLoading(true);

      await login(email, password);

      toast.success("Welcome to NxZen NxZenAI Studio");

      router.push("/dashboard");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
          "Invalid Credentials"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>

        <label className="mb-2 block text-sm font-medium text-slate-300">
          Email Address
        </label>

        <input
          type="email"
          required
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="
            w-full
            rounded-xl
            border
            border-slate-700
            bg-slate-950
            p-3
            text-white
            outline-none
            transition
            focus:border-blue-500
          "
        />

      </div>

      <div>

        <label className="mb-2 block text-sm font-medium text-slate-300">
          Password
        </label>

        <div className="relative">

          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            required
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="
              w-full
              rounded-xl
              border
              border-slate-700
              bg-slate-950
              p-3
              pr-12
              text-white
              outline-none
              transition
              focus:border-blue-500
            "
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }
            className="absolute right-4 top-3 text-slate-400"
          >
            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>

        </div>

      </div>

      <button
        disabled={loading}
        className="
          w-full
          rounded-xl
          bg-blue-600
          py-3
          text-lg
          font-semibold
          text-white
          transition
          hover:bg-blue-700
          disabled:opacity-50
        "
      >
        {loading
          ? "Signing In..."
          : "Sign In"}
      </button>

      <div className="text-center text-sm text-slate-400">

        Don't have an account?

        <button
          type="button"
          onClick={() =>
            router.push("/register")
          }
          className="ml-2 font-semibold text-blue-400 hover:text-blue-300"
        >
          Create Account
        </button>

      </div>

    </form>
  );
}