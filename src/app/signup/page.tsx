"use client";

import { useEffect } from "next/navigation";
import { useRouter } from "next/navigation";

<<<<<<<< HEAD:src/app/signup/page.tsx
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
========
export default function RegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/register");
  }, [router]);

  return null;
}
>>>>>>>> origin/main:src/app/register/page.tsx
