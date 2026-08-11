export interface SQLExecuteRequest {
    query: string;
}

export interface SQLExecuteResponse {
    columns: string[];
    rows: any[][];
    execution_time: number;
}

export interface TableSchema {
    name: string;
    columns: string[];
}

export interface SchemaResponse {
    tables: TableSchema[];
}