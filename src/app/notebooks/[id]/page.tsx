import NotebookEditor from "@/components/notebook/NotebookEditor";
import { NotebookEditorProvider } from "@/contexts/NotebookEditorContext";

export default async function NotebookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <NotebookEditorProvider notebookId={id}>
      <NotebookEditor />
      
    </NotebookEditorProvider>
  );
}