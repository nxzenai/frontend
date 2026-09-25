"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join NxZenAI Studio"
    >
      <RegisterForm />
    </AuthLayout>
  );
}