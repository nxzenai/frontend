import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LearningWorkspace from "@/components/learning/LearningWorkspace";
export default async function Page({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  return <ProtectedRoute><DashboardLayout><LearningWorkspace initialModule={module} /></DashboardLayout></ProtectedRoute>;
}
