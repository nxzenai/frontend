"use client";

import { useCallback, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { ChevronRight, FileCode2, Folder, FolderOpen } from "lucide-react";
import agenticService from "@/services/agentic.service";
import type { AgenticVersion, GeneratedFile, SourceTreeNode } from "@/types/agentic";

function TreeItem({ node, selected, onSelect }: {
  node: SourceTreeNode;
  selected: string | null;
  onSelect: (path: string) => void;
}) {
  const [open, setOpen] = useState(true);
  if (node.type === "file") {
    return (
      <button
        onClick={() => node.path && onSelect(node.path)}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs ${selected === node.path ? "bg-cyan-500/15 text-cyan-200" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
      >
        <FileCode2 className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{node.name}</span>
      </button>
    );
  }
  return (
    <div>
      <button onClick={() => setOpen(value => !value)} className="flex w-full items-center gap-1.5 px-1 py-1.5 text-left text-xs font-medium text-slate-300 hover:text-white">
        <ChevronRight className={`h-3.5 w-3.5 transition ${open ? "rotate-90" : ""}`} />
        {open ? <FolderOpen className="h-3.5 w-3.5 text-cyan-400" /> : <Folder className="h-3.5 w-3.5 text-cyan-400" />}
        <span className="truncate">{node.name}</span>
      </button>
      {open && <div className="ml-3 border-l border-slate-800 pl-2">{node.children?.map(child => <TreeItem key={`${child.type}-${child.path ?? child.name}`} node={child} selected={selected} onSelect={onSelect} />)}</div>}
    </div>
  );
}

function firstFile(nodes: SourceTreeNode[]): string | null {
  for (const node of nodes) {
    if (node.type === "file" && node.path) return node.path;
    const nested = firstFile(node.children ?? []);
    if (nested) return nested;
  }
  return null;
}

export default function SourceBrowser({ projectId, version }: { projectId: string; version: AgenticVersion }) {
  const [tree, setTree] = useState<SourceTreeNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [file, setFile] = useState<GeneratedFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectFile = useCallback(async (path: string) => {
    setSelectedPath(path);
    setLoading(true);
    setError(null);
    try {
      setFile(await agenticService.sourceFile(projectId, version.id, path));
    } catch {
      setError("The selected source file could not be loaded.");
      setFile(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, version.id]);

  useEffect(() => {
    let active = true;
    agenticService.sourceTree(projectId, version.id).then(nodes => {
      if (!active) return;
      setTree(nodes);
      const initial = firstFile(nodes);
      if (initial) void selectFile(initial);
      else setLoading(false);
    }).catch(() => {
      if (active) {
        setError("The source tree could not be loaded.");
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [projectId, version.id, selectFile]);

  return (
    <div className="grid min-h-[620px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 lg:grid-cols-[260px_minmax(0,1fr)]" data-source-browser>
      <aside className="max-h-[620px] overflow-auto border-b border-slate-800 bg-slate-950/60 p-3 lg:border-b-0 lg:border-r">
        <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Source · V{version.version_number}</div>
        {tree.map(node => <TreeItem key={`${node.type}-${node.path ?? node.name}`} node={node} selected={selectedPath} onSelect={path => void selectFile(path)} />)}
      </aside>
      <section className="min-w-0">
        <div className="flex h-11 items-center border-b border-slate-800 px-4 text-xs text-slate-400">{selectedPath ?? "Select a source file"}{file && <span className="ml-auto">{file.size_bytes.toLocaleString()} bytes</span>}</div>
        {loading ? <div className="flex h-[575px] items-center justify-center text-sm text-slate-500">Loading source...</div> : error ? <div role="alert" className="flex h-[575px] items-center justify-center text-sm text-red-300">{error}</div> : file ? (
          <Editor
            height="575px" theme="vs-dark" language={file.language ?? "plaintext"} value={file.content}
            options={{ readOnly: true, domReadOnly: true, minimap: { enabled: false }, automaticLayout: true, scrollBeyondLastLine: false, fontSize: 13, wordWrap: "off" }}
          />
        ) : <div className="flex h-[575px] items-center justify-center text-sm text-slate-500">No source files in this version.</div>}
      </section>
    </div>
  );
}
