// src/components/engagements/TenantStatisticsTab.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Grid,
  LinearProgress,
  Tooltip,
  Chip,
} from "@mui/material";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import HotelOutlinedIcon from "@mui/icons-material/HotelOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import { TenantStatistics } from "../../types/tenant";
import { fetchTenantStatistics } from "../../services/engagementService";

// ─── Palette for bars ────────────────────────────────────────────────────────
const BAR_COLORS = [
  "rgb(128, 22, 44)",
  "rgb(172, 45, 70)",
  "rgb(197, 100, 122)",
  "rgb(218, 148, 163)",
  "rgb(236, 195, 205)",
];

function barColor(index: number): string {
  return BAR_COLORS[Math.min(index, BAR_COLORS.length - 1)];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, sub }) => (
  <Paper
    elevation={4}
    sx={{
      p: 2,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 0.5,
      borderRadius: 2,
      height: "100%",
      background: "linear-gradient(145deg, #f3f3f3 50%, rgba(128,22,44,0.07) 100%)",
      borderTop: "3px solid rgb(128, 22, 44)",
      minWidth: "200px",
    }}
  >
    <Box sx={{ color: "rgb(128, 22, 44)", display: "flex", alignItems: "center" }}>{icon}</Box>
    <Typography variant="h5" fontWeight={700} color="text.primary" lineHeight={1.1}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary" align="center" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
      {label}
    </Typography>
    {sub && (
      <Typography variant="caption" color="text.secondary" align="center">
        {sub}
      </Typography>
    )}
  </Paper>
);

interface DistributionListProps {
  title: string;
  data: Record<string, number>;
  total: number;
  maxItems?: number;
}

const DistributionList: React.FC<DistributionListProps> = ({ title, data, total, maxItems = 10 }) => {
  const [expanded, setExpanded] = useState(false);
  const allEntries = Object.entries(data);
  const visibleEntries = expanded ? allEntries : allEntries.slice(0, maxItems);
  const maxVal = allEntries.length > 0 ? allEntries[0][1] : 1;
  const hiddenCount = allEntries.length - maxItems;

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, mb: 1 }}>
        {title}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        {visibleEntries.map(([key, count], i) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <Tooltip key={key} title={`${count} Bewohner (${pct}%)`} placement="right" arrow>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{ minWidth: 120, maxWidth: 150, flexShrink: 0, color: "text.primary", fontSize: "0.78rem" }}
                >
                  {key}
                </Typography>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(count / maxVal) * 100}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: "rgba(0,0,0,0.06)",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 5,
                        backgroundColor: barColor(i),
                      },
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ minWidth: 38, textAlign: "right", fontSize: "0.78rem", color: "text.secondary" }}>
                  {count} <span style={{ opacity: 0.6, fontSize: "0.7rem" }}>({pct}%)</span>
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
        {hiddenCount > 0 && (
          <Typography
            variant="caption"
            onClick={() => setExpanded((v) => !v)}
            sx={{
              mt: 0.5,
              cursor: "pointer",
              color: "rgb(128, 22, 44)",
              fontWeight: 600,
              userSelect: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {expanded ? "Weniger anzeigen" : `+${hiddenCount} weitere anzeigen`}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

interface SectionCardProps {
  children: React.ReactNode;
  sx?: object;
}

const SectionCard: React.FC<SectionCardProps> = ({ children, sx }) => (
  <Paper elevation={3} sx={{ p: 2, borderRadius: 2, height: "100%", background: "linear-gradient(160deg, #fff 70%, rgba(128,22,44,0.04) 100%)", ...sx }}>
    {children}
  </Paper>
);

// ─── Main component ───────────────────────────────────────────────────────────

const TenantStatisticsTab: React.FC = () => {
  const [scope, setScope] = useState<"current" | "all">("current");
  const [data, setData] = useState<TenantStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (s: "current" | "all") => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTenantStatistics(s);
      setData(result);
    } catch {
      setError("Statistiken konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(scope);
  }, [scope, loadData]);

  const handleScopeChange = (_: React.MouseEvent<HTMLElement>, val: "current" | "all" | null) => {
    if (val) setScope(val);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Scope Toggle */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <ToggleButtonGroup
          value={scope}
          exclusive
          onChange={handleScopeChange}
          size="small"
          sx={{
            "& .MuiToggleButton-root.Mui-selected": {
              backgroundColor: "rgb(128, 22, 44)",
              color: "#fff",
              "&:hover": { backgroundColor: "rgb(110, 18, 36)" },
            },
          }}
        >
          <ToggleButton value="current">Aktuelle Bewohner</ToggleButton>
          <ToggleButton value="all">Alle Bewohner</ToggleButton>
        </ToggleButtonGroup>
        {data && (
          <Chip
            label={`${data.total_tenants} Bewohner`}
            size="small"
            sx={{ backgroundColor: "rgba(128,22,44,0.1)", color: "rgb(128, 22, 44)", fontWeight: 600 }}
          />
        )}
      </Box>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
          <CircularProgress sx={{ color: "rgb(128, 22, 44)" }} />
        </Box>
      )}

      {/* Error */}
      {!loading && error && <Alert severity="error">{error}</Alert>}

      {/* Content */}
      {!loading && !error && data && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* ── Row 1: Summary KPIs ── */}
          <Grid container spacing={2}>
            {[
              {
                icon: <PeopleAltOutlinedIcon sx={{ fontSize: 28 }} />,
                label: "Bewohner gesamt",
                value: data.total_tenants,
                sub: "\u00a0",
              },
              {
                icon: <CakeOutlinedIcon sx={{ fontSize: 28 }} />,
                label: "Ø Alter",
                value: `${data.age.average.toFixed(1)} J.`,
                sub: `${data.age.min}–${data.age.max} Jahre`,
              },
              {
                icon: <HotelOutlinedIcon sx={{ fontSize: 28 }} />,
                label: "Ø Aufenthalt",
                value: `${(data.stay_duration.average_months / 12).toFixed(1)} J.`,
                sub: `${(data.stay_duration.min_days / 365).toFixed(1)}–${(data.stay_duration.max_days / 365).toFixed(1)} Jahre`,
              },
              {
                icon: <StarOutlineIcon sx={{ fontSize: 28 }} />,
                label: "Ø Punkte",
                value: data.points.average.toFixed(1),
                sub: `Gesamt: ${data.points.total}`,
              },
              {
                icon: <EmojiEventsOutlinedIcon sx={{ fontSize: 28 }} />,
                label: "Mit Engagement",
                value: `${Math.round((data.engagements.tenants_with_any_engagement / data.total_tenants) * 100)}%`,
                sub: `${data.engagements.tenants_with_any_engagement} von ${data.total_tenants}`,
              },
            ].map((card) => (
              <Grid key={card.label} size={{ xs: 12, sm: 4, md: 12 / 5 }} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <StatCard {...card} />
              </Grid>
            ))}
          </Grid>

          {/* ── Row 2: Gender + Points detail + Engagements ── */}
          <Grid container spacing={2}>
            {/* Gender */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SectionCard>
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5 }}>
                  Geschlechterverteilung
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {Object.entries(data.gender_distribution).map(([gender, count], i) => {
                    const pct = data.total_tenants > 0 ? Math.round((count / data.total_tenants) * 100) : 0;
                    return (
                      <Box key={gender}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.25 }}>
                          <Typography variant="body2" fontWeight={500}>{gender}</Typography>
                          <Typography variant="body2" color="text.secondary">{count} ({pct}%)</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: "rgba(0,0,0,0.07)",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 6,
                              backgroundColor: barColor(i),
                            },
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </SectionCard>
            </Grid>

            {/* Points detail */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SectionCard>
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5 }}>
                  Punkte
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {[
                    { label: "Durchschnitt", val: data.points.average.toFixed(2) },
                    { label: "Minimum", val: data.points.min.toFixed(1) },
                    { label: "Maximum", val: data.points.max.toFixed(1) },
                    { label: "Gesamt", val: data.points.total.toFixed(0) },
                  ].map(({ label, val }) => (
                    <Box key={label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                      <Typography variant="body2" fontWeight={700}>{val}</Typography>
                    </Box>
                  ))}
                </Box>
              </SectionCard>
            </Grid>

            {/* Engagements */}
            <Grid size={{ xs: 12, sm: 12, md: 4 }}>
              <SectionCard>
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5 }}>
                  <GroupsOutlinedIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} />
                  Engagements
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {[
                    { label: "Mit Engagement", val: data.engagements.tenants_with_any_engagement, total: data.total_tenants },
                    { label: "Ohne Engagement", val: data.engagements.tenants_without_engagement, total: data.total_tenants },
                  ].map(({ label, val, total }, i) => {
                    const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                    return (
                      <Box key={label}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.25 }}>
                          <Typography variant="body2" fontWeight={500}>{label}</Typography>
                          <Typography variant="body2" color="text.secondary">{val} ({pct}%)</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: "rgba(0,0,0,0.07)",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 5,
                              backgroundColor: i === 0 ? "rgb(128, 22, 44)" : "rgba(128,22,44,0.3)",
                            },
                          }}
                        />
                      </Box>
                    );
                  })}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Ø pro Bewohner</Typography>
                    <Chip
                      label={data.engagements.average_per_tenant.toFixed(2)}
                      size="small"
                      sx={{ backgroundColor: "rgba(128,22,44,0.12)", color: "rgb(128, 22, 44)", fontWeight: 700 }}
                    />
                  </Box>
                </Box>
              </SectionCard>
            </Grid>
          </Grid>

          {/* ── Row 3: Nationalitäten full-width ── */}
          <SectionCard>
            <DistributionList
              title="Nationalitäten"
              data={data.nationalities}
              total={data.total_tenants}
              maxItems={12}
            />
          </SectionCard>

          {/* ── Row 4: Universitäten + Studienfächer ── */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard>
                <DistributionList
                  title="Universitäten"
                  data={data.universities}
                  total={data.total_tenants}
                  maxItems={10}
                />
              </SectionCard>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard>
                <DistributionList
                  title="Studienfächer"
                  data={data.study_fields}
                  total={data.total_tenants}
                  maxItems={10}
                />
              </SectionCard>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default TenantStatisticsTab;
