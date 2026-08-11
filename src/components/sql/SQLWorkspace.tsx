"use client";

import { useEffect } from "react";

import useSQL from "@/hooks/useSQL";

import SchemaExplorer from "./SchemaExplorer";
import SQLEditor from "./SQLEditor";
import SQLToolbar from "./SQLToolbar";
import SQLResultTable from "./SQLResultTable";

export default function SQLWorkspace() {

  //////////////////////////////////////////////////////
  // Hook
  //////////////////////////////////////////////////////

  const {
    query,
    setQuery,
    loading,
    result,
    execute,
    tables,
    error,
  } = useSQL();

  //////////////////////////////////////////////////////
  // Ctrl + Enter Listener
  //////////////////////////////////////////////////////

  useEffect(() => {

    function handleExecute() {
      execute();
    }

    window.addEventListener(
      "sql-execute",
      handleExecute,
    );

    return () => {

      window.removeEventListener(
        "sql-execute",
        handleExecute,
      );

    };

  }, [execute]);

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////

  return (

    <div className="flex h-full gap-6">

      {/* Left Sidebar */}

      <div className="w-72 flex-shrink-0">

        <SchemaExplorer
          tables={tables}
        />

      </div>

      {/* Main Workspace */}

      <div className="flex flex-1 flex-col gap-6">

        {/* SQL Editor */}

        <SQLEditor
          query={query}
          onChange={setQuery}
        />

        {/* Toolbar */}

        <SQLToolbar
          loading={loading}
          onExecute={execute}
        />

        {/* Results */}

        <SQLResultTable
          result={result}
          error={error}
        />

      </div>

    </div>

  );

}