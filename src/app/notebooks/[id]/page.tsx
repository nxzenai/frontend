import NotebookEditor from "@/components/notebook/NotebookEditor";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { NotebookEditorProvider } from "@/contexts/NotebookEditorContext";
import LearningReturnLink from "@/components/learning/LearningReturnLink";

export default async function NotebookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ProtectedRoute>
      <NotebookEditorProvider notebookId={id}>
        <LearningReturnLink /><NotebookEditor />
      </NotebookEditorProvider>
    </ProtectedRoute>
  );
}
