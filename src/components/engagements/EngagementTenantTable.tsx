// src/components/engagements/EngagementTenantTable.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Alert,
  CircularProgress,
  List,
  ListItemText,
  Collapse,
  IconButton,
  ListItemButton,
  TextField,
  Typography,
  ListItem,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { fetchEngagementOverviewData } from "../../services/engagementService";
import { AdminEngagement, EngagementOverviewGroup } from "../../types/tenant";

const GroupedTenantsBySemester: React.FC<{ engagements: AdminEngagement[] }> = ({ engagements }) => {
  const groupedBySemester = useMemo(() => {
    return engagements.reduce((acc, eng) => {
      (acc[eng.semester] = acc[eng.semester] || []).push(eng);
      return acc;
    }, {} as Record<string, AdminEngagement[]>);
  }, [engagements]);

  const sortedSemesters = useMemo(() => Object.keys(groupedBySemester).sort().reverse(), [groupedBySemester]);

  return (
    <Box sx={{ pl: 4 }}>
      {sortedSemesters.map((semester) => (
        <Box key={semester} sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            {semester}
          </Typography>
          <List dense disablePadding>
            {groupedBySemester[semester]
              .sort((a, b) => a.tenant.surname.localeCompare(b.tenant.surname))
              .map((eng) => (
                <ListItem key={eng.id}>
                  <ListItemText
                    primary={`${eng.tenant.name} ${eng.tenant.surname}`}
                    secondary={`Zimmer: ${eng.tenant.current_room || "N/A"} | Punkte: ${eng.points}`}
                  />
                </ListItem>
              ))}
          </List>
        </Box>
      ))}
    </Box>
  );
};

const EngagementTenantTable: React.FC = () => {
  const [data, setData] = useState<EngagementOverviewGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setLoading(true);
    fetchEngagementOverviewData()
      .then((data) => {
        setData(data);
        setError(null);
      })
      .catch(() => setError("Referatsübersicht konnte nicht geladen werden."))
      .finally(() => setLoading(false));
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerCaseSearch = searchTerm.toLowerCase();

    return data
      .map((group) => {
        const matchingEngagements = group.engagements.filter(
          (eng) =>
            `${eng.tenant.name} ${eng.tenant.surname}`.toLowerCase().includes(lowerCaseSearch) ||
            eng.semester.toLowerCase().includes(lowerCaseSearch)
        );
        if (group.department_full_name.toLowerCase().includes(lowerCaseSearch) || matchingEngagements.length > 0) {
          return {
            ...group,
            engagements: group.department_full_name.toLowerCase().includes(lowerCaseSearch)
              ? group.engagements
              : matchingEngagements,
          };
        }
        return null;
      })
      .filter((g): g is EngagementOverviewGroup => g !== null);
  }, [data, searchTerm]);

  const handleToggleExpand = (deptId: number) => {
    setExpanded((prev) => ({ ...prev, [deptId]: !prev[deptId] }));
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 1 }}>
      <TextField
        fullWidth
        label="Suche nach Referat, Person, Semester..."
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
        size="small"
      />
      <List>
        {filteredData.map((group) => (
          <React.Fragment key={group.department_id}>
            <ListItemButton onClick={() => handleToggleExpand(group.department_id)}>
              <ListItemText
                primary={group.department_full_name}
                secondary={`${group.engagements.length} Einträge`}
                primaryTypographyProps={{ fontWeight: "medium" }}
              />
              <IconButton edge="end">{expanded[group.department_id] ? <ExpandLess /> : <ExpandMore />}</IconButton>
            </ListItemButton>
            <Collapse in={expanded[group.department_id]} timeout="auto" unmountOnExit>
              <GroupedTenantsBySemester engagements={group.engagements} />
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default EngagementTenantTable;
