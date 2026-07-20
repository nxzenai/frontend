import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          <h1 className="text-3xl font-bold">
            NxZenAI CRM
          </h1>

          <div className="flex gap-8">

            <Link href="/admin">
              Dashboard
            </Link>

            <Link href="/admin/leads">
              Leads
            </Link>

            <Link href="/admin/analytics">
              Analytics
            </Link>

            <Link href="/admin/settings">
              Settings
            </Link>

          </div>

          <button className="bg-red-600 px-4 py-2 rounded-lg">
            Logout
          </button>

        </div>
      </nav>

      {children}
    </div>
  );
}