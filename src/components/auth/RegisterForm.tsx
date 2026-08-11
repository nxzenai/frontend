"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";

import AuthService from "@/services/auth.service";

export default function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  function updateField(
    key: string,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await AuthService.register({
        full_name: form.full_name,
        username: form.username,
        email: form.email,
        password: form.password,
      });

      toast.success(
        "Account created successfully."
      );

      router.push("/login");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
          "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">
          Full Name
        </label>

        <input
          required
          value={form.full_name}
          onChange={(e) =>
            updateField(
              "full_name",
              e.target.value
            )
          }
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white outline-none transition focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">
          Username
        </label>

        <input
          required
          value={form.username}
          onChange={(e) =>
            updateField(
              "username",
              e.target.value
            )
          }
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white outline-none transition focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">
          Email
        </label>

        <input
          type="email"
          required
          value={form.email}
          onChange={(e) =>
            updateField(
              "email",
              e.target.value
            )
          }
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white outline-none transition focus:border-blue-500"
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
            value={form.password}
            onChange={(e) =>
              updateField(
                "password",
                e.target.value
              )
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 pr-12 text-white outline-none transition focus:border-blue-500"
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

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">
          Confirm Password
        </label>

        <div className="relative">
          <input
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            required
            value={form.confirmPassword}
            onChange={(e) =>
              updateField(
                "confirmPassword",
                e.target.value
              )
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 pr-12 text-white outline-none transition focus:border-blue-500"
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(
                !showConfirmPassword
              )
            }
            className="absolute right-4 top-3 text-slate-400"
          >
            {showConfirmPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
        </div>
      </div>

      <button
        disabled={loading}
        className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading
          ? "Creating Account..."
          : "Create Account"}
      </button>

      <p className="text-center text-sm text-slate-400">
        Already have an account?

        <button
          type="button"
          onClick={() =>
            router.push("/login")
          }
          className="ml-2 font-semibold text-blue-400 hover:text-blue-300"
        >
          Sign In
        </button>
      </p>
    </form>
  );
}