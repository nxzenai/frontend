import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LearningWorkspace from "@/components/learning/LearningWorkspace";
export default async function Page({ params }: { params: Promise<{ module: string; topic: string }> }) {
  const { module, topic } = await params;
  return <ProtectedRoute><DashboardLayout><LearningWorkspace initialModule={module} initialTopic={topic} /></DashboardLayout></ProtectedRoute>;
}
