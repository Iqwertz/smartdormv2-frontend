import apiClient from "./api";

export interface LogEntry {
  timestamp: string;
  level: "DEBUG" | "INFO" | "WARNING" | "ERROR" | string;
  logger: string;
  message: string;
}

export interface LogPageResponse {
  items: LogEntry[];
  nextCursor: number | null;
  hasMore: boolean;
  total: number;
  limit: number;
  cursor: number;
}

export interface FetchLogsParams {
  cursor?: number;
  limit?: number;
  level?: string;
  search?: string;
}

const LOGS_API = "/api/engagements/logs/";

const logService = {
  fetchLogs: async (params: FetchLogsParams = {}) => {
    const response = await apiClient.get<LogPageResponse>(LOGS_API, {
      params: {
        cursor: params.cursor ?? 0,
        limit: params.limit ?? 100,
        level: params.level || undefined,
        search: params.search || undefined,
      },
    });
    return response.data;
  },
};

export default logService;
