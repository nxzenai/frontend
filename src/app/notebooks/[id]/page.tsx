import NotebookEditor from "@/components/notebook/NotebookEditor";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { NotebookEditorProvider } from "@/contexts/NotebookEditorContext";

export default async function NotebookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ProtectedRoute>
      <NotebookEditorProvider notebookId={id}>
        <NotebookEditor />
      </NotebookEditorProvider>
    </ProtectedRoute>
  );
}
