"use client";

import { useCallback, useEffect, useState } from "react";

import SQLService from "@/services/sql.service";

import {
  SQLExecuteResponse,
  TableSchema,
} from "@/types/sql";

export default function useSQL() {

  //////////////////////////////////////////////////////
  // State
  //////////////////////////////////////////////////////

  const [query, setQuery] = useState(
`SELECT *
FROM employees;
`
  );

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState<SQLExecuteResponse | null>(
      null,
    );

  const [tables, setTables] =
    useState<TableSchema[]>([]);

  const [error, setError] =
    useState("");

  //////////////////////////////////////////////////////
  // Execute Query
  //////////////////////////////////////////////////////

  const execute = useCallback(
    async () => {

      setLoading(true);

      setError("");

      try {

        const data =
          await SQLService.execute(
            query,
          );

        setResult(data);

      } catch (err: any) {

        setResult(null);

        setError(

          err?.response?.data?.detail ??

          err?.response?.data?.message ??

          "Query execution failed."

        );

      } finally {

        setLoading(false);

      }

    },
    [query],
  );

  //////////////////////////////////////////////////////
  // Load Database Schema
  //////////////////////////////////////////////////////

  const loadSchema = useCallback(
    async () => {

      try {

        const data =
          await SQLService.schema();

        setTables(
          data.tables,
        );

      } catch (err) {

        console.error(
          "Failed to load schema",
          err,
        );

      }

    },
    [],
  );

  //////////////////////////////////////////////////////
  // Initial Load
  //////////////////////////////////////////////////////

  useEffect(() => {

    loadSchema();

  }, [loadSchema]);

  //////////////////////////////////////////////////////
  // Exports
  //////////////////////////////////////////////////////

  return {

    query,

    setQuery,

    loading,

    result,

    error,

    execute,

    tables,

    reloadSchema: loadSchema,

  };

}