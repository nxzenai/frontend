export interface SQLExecuteRequest {
    query: string;
}

export interface SQLExecuteResponse {
    columns: string[];
    rows: any[][];
    execution_time: number;
    message?: string | null;
    database_changed?: boolean;
}

export interface TableSchema {
    name: string;
    columns: string[];
}

export interface SchemaResponse {
    tables: TableSchema[];
    active_database: string;
    databases: string[];
}
