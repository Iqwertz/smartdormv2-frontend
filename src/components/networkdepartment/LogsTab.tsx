import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Box, Chip, CircularProgress, Divider, MenuItem, Paper, TextField, Typography } from "@mui/material";
import logService, { LogEntry } from "../../services/logService";
import { useNotification } from "../../context/NotificationContext";

const PAGE_SIZE = 50;

const levelStyles: Record<string, { color: string; borderColor: string; backgroundColor: string }> = {
  ERROR: { color: "#ff6b6b", borderColor: "#ff6b6b", backgroundColor: "rgba(255, 107, 107, 0.08)" },
  WARNING: { color: "#f4c542", borderColor: "#f4c542", backgroundColor: "rgba(244, 197, 66, 0.08)" },
  INFO: { color: "#64b5f6", borderColor: "#64b5f6", backgroundColor: "rgba(100, 181, 246, 0.08)" },
  DEBUG: { color: "#9e9e9e", borderColor: "#9e9e9e", backgroundColor: "rgba(158, 158, 158, 0.06)" },
};

const levelOptions = ["ALL", "ERROR", "WARNING", "INFO", "DEBUG"];

const LogsTab: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(0);
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const versionRef = useRef(0);
  const { showNotification } = useNotification();

  const requestParams = useMemo(
    () => ({
      limit: PAGE_SIZE,
      level: levelFilter === "ALL" ? undefined : levelFilter,
      search: search.trim() || undefined,
    }),
    [levelFilter, search],
  );

  const loadLogs = useCallback(
    async (nextCursor = 0, reset = false) => {
      const requestVersion = versionRef.current;

      if (reset) {
        setInitialLoading(true);
        setError(null);
      } else {
        setLoading(true);
      }

      try {
        const data = await logService.fetchLogs({
          cursor: nextCursor,
          ...requestParams,
        });

        if (versionRef.current !== requestVersion) {
          return;
        }

        setLogs((prev) => (reset ? data.items : [...prev, ...data.items]));
        setCursor(data.nextCursor ?? nextCursor);
        setHasMore(data.hasMore);
      } catch (err) {
        if (versionRef.current !== requestVersion) {
          return;
        }

        const message = "Log-Einträge konnten nicht geladen werden.";
        setError(message);
        showNotification(message, "error");
      } finally {
        if (versionRef.current === requestVersion) {
          setLoading(false);
          setInitialLoading(false);
        }
      }
    },
    [requestParams, showNotification],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    versionRef.current += 1;
    setLogs([]);
    setCursor(0);
    setHasMore(true);
    loadLogs(0, true);
  }, [loadLogs, levelFilter, search]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || loading || initialLoading || !hasMore) {
      return;
    }

    if (container.scrollHeight <= container.clientHeight + 20) {
      loadLogs(cursor ?? logs.length, false);
    }
  }, [cursor, hasMore, initialLoading, loading, loadLogs, logs.length]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || loading || initialLoading || !hasMore) {
      return;
    }

    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceToBottom < 180) {
      loadLogs(cursor ?? logs.length, false);
    }
  };

  const handleLevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLevelFilter(event.target.value);
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 2, minHeight: 0 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "220px 1fr" }, gap: 2 }}>
          <TextField select label="Log-Level" value={levelFilter} onChange={handleLevelChange} size="small" fullWidth>
            {levelOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Suche in Logs"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            size="small"
            fullWidth
            placeholder="z. B. error, username, endpoint..."
          />
        </Box>
      </Paper>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Paper
        variant="outlined"
        ref={containerRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          backgroundColor: "background.default",
        }}
      >
        {initialLoading ? (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 280 }}>
            <CircularProgress />
          </Box>
        ) : logs.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Keine Logs gefunden.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
            {logs.map((log, index) => {
              const styles = levelStyles[log.level] ?? levelStyles.INFO;
              return (
                <Paper
                  key={`${log.timestamp}-${log.level}-${log.logger}-${index}`}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderLeft: "4px solid",
                    borderLeftColor: styles.borderColor,
                    backgroundColor: styles.backgroundColor,
                  }}
                >
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center", mb: 0.75 }}>
                    <Typography variant="caption" sx={{ fontFamily: "monospace", color: "text.secondary" }}>
                      {log.timestamp}
                    </Typography>
                    <Chip
                      size="small"
                      label={log.level}
                      sx={{
                        height: 20,
                        fontSize: "0.7rem",
                        backgroundColor: styles.borderColor,
                        color: "#fff",
                      }}
                    />
                    <Typography variant="caption" sx={{ fontFamily: "monospace", color: styles.color }}>
                      {log.logger}
                    </Typography>
                  </Box>
                  <Typography
                    component="pre"
                    variant="body2"
                    sx={{
                      m: 0,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                      lineHeight: 1.5,
                    }}
                  >
                    {log.message}
                  </Typography>
                </Paper>
              );
            })}

            <Divider />

            <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
              {loading ? <CircularProgress size={24} /> : null}
              {!loading && !hasMore ? (
                <Typography variant="caption" color="text.secondary">
                  Keine weiteren Logs vorhanden.
                </Typography>
              ) : null}
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default LogsTab;
