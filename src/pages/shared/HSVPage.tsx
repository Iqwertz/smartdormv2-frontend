import "../../styles/global.scss";
import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  Link,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  EmailOutlined,
  PhoneOutlined,
  MeetingRoomOutlined,
  LocationCityOutlined,
} from "@mui/icons-material";
import { HsvEngagementGroup, HsvTenant } from "../../types/tenant";
import apiClient from "../../services/api";
import DashboardCard from "../../components/tenants/dashboard/DashboardCard";

const HSVPage: React.FC = () => {
  const [engagementGroups, setEngagementGroups] = useState<HsvEngagementGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<HsvEngagementGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    apiClient
      .get<any[]>("/api/tenants/hsv")
      .then((response) => {
        const groupsWithId = response.data.map((group) => ({
          ...group,
          group_id: `${group.department_id}_${group.semester}`,
        }));
        setEngagementGroups(groupsWithId);
        setFilteredGroups(groupsWithId);
        const initialExpandedState = groupsWithId.reduce((acc, group) => {
          acc[group.group_id] = false;
          return acc;
        }, {} as Record<string, boolean>);
        setExpanded(initialExpandedState);
        setError(null);
      })
      .catch((err) => {
        setError("Failed to load HSV data.");
        console.error("Error fetching HSV data:", err);
        setEngagementGroups([]);
        setFilteredGroups([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filtering useEffect remains the same
  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    if (!lowerCaseSearchTerm) {
      setFilteredGroups(engagementGroups);
      return;
    }
    const filtered = engagementGroups
      .map((group) => {
        const groupTitle = `${group.department_full_name} ${group.semester}`.toLowerCase();
        const groupMatches = groupTitle.includes(lowerCaseSearchTerm);
        const matchingTenants = group.tenants.filter(
          (tenant) =>
            `${tenant.name} ${tenant.surname}`.toLowerCase().includes(lowerCaseSearchTerm) ||
            (tenant.email && tenant.email.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (tenant.tel_number && tenant.tel_number.includes(lowerCaseSearchTerm)) ||
            (tenant.current_room && tenant.current_room.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (tenant.current_floor && tenant.current_floor.toLowerCase().includes(lowerCaseSearchTerm))
        );
        if (groupMatches || matchingTenants.length > 0) {
          return {
            ...group,
            tenants: groupMatches ? group.tenants : matchingTenants,
          };
        }
        return null;
      })
      .filter((group): group is HsvEngagementGroup => group !== null);
    setFilteredGroups(filtered);
    setExpanded((prevExpanded) => {
      const newExpanded: Record<string, boolean> = {};
      filtered.forEach((group) => {
        newExpanded[group.group_id] = prevExpanded[group.group_id] ?? false;
      });
      return newExpanded;
    });
  }, [searchTerm, engagementGroups]);

  const handleToggleExpand = (groupId: string) => {
    setExpanded((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const renderTenantDetails = (tenant: HsvTenant) => (
    <ListItem
      key={`${tenant.name}-${tenant.surname}-${tenant.email || "noemail"}`}
      sx={{ pl: 4, alignItems: "flex-start" }}
      dense
    >
      <ListItemText
        primary={`${tenant.name} ${tenant.surname}`}
        secondary={
          <Box
            component="span"
            sx={{ display: "flex", flexDirection: "column", fontSize: "0.8rem", color: "text.secondary", mt: 0.5 }}
          >
            <Box component="span" sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <EmailOutlined fontSize="inherit" sx={{ mr: 0.5, flexShrink: 0 }} />
              {tenant.email ? (
                <Link href={`mailto:${tenant.email}`} color="inherit" underline="hover">
                  {tenant.email}
                </Link>
              ) : (
                "N/A"
              )}
            </Box>
            <Box component="span" sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <PhoneOutlined fontSize="inherit" sx={{ mr: 0.5, flexShrink: 0 }} />
              {tenant.tel_number ? (
                <Link href={`tel:${tenant.tel_number.replace(/\s+/g, "")}`} color="inherit" underline="hover">
                  {tenant.tel_number}
                </Link>
              ) : (
                "N/A"
              )}
            </Box>
            <Box component="span" sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <MeetingRoomOutlined fontSize="inherit" sx={{ mr: 0.5, flexShrink: 0 }} />
              Zimmer: {tenant.current_room || "N/A"}
            </Box>
            <Box component="span" sx={{ display: "flex", alignItems: "center" }}>
              <LocationCityOutlined fontSize="inherit" sx={{ mr: 0.5, flexShrink: 0 }} />
              Flur: {tenant.current_floor || "N/A"}
            </Box>
          </Box>
        }
      />
    </ListItem>
  );

  // --- Function to group tenants by floor ---
  const groupTenantsByFloor = (tenants: HsvTenant[]): Record<string, HsvTenant[]> => {
    return tenants.reduce((acc, tenant) => {
      const floorKey = tenant.current_floor?.trim() || "N/A"; // Group null/empty floors as 'N/A'
      if (!acc[floorKey]) {
        acc[floorKey] = [];
      }
      acc[floorKey].push(tenant);
      return acc;
    }, {} as Record<string, HsvTenant[]>);
  };

  // --- Function to sort floor keys logically ---
  const sortFloorKeys = (floorKeys: string[]): string[] => {
    return floorKeys.sort((a, b) => {
      if (a === "N/A") return 1; // Put "N/A" last
      if (b === "N/A") return -1;
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      // Handle cases where floor might not be a pure number (though less likely for FS)
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      // Fallback for non-numeric strings (e.g., "EG") - simple string compare
      return a.localeCompare(b);
    });
  };

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 3,
        maxWidth: "900px",
        margin: "0 auto",
        height: "100vh",
      }}
    >
      <DashboardCard title="Suche">
        <TextField
          fullWidth
          label="Suche nach Referat, Semester, Name, E-Mail, Telefon, Zimmer..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
        />
      </DashboardCard>

      <DashboardCard title="HSV">
        {loading && (
          <Box display="flex" justifyContent="center" p={5}>
            <CircularProgress />
          </Box>
        )}
        {error && !loading && <Alert severity="error">{error}</Alert>}
        {!loading && !error && filteredGroups.length === 0 && (
          <Typography sx={{ textAlign: "center", mt: 4 }}>
            {searchTerm ? "Keine passenden Einträge gefunden." : "Keine HSV-Daten für diesen Semester verfügbar."}
          </Typography>
        )}

        {!loading && !error && filteredGroups.length > 0 && (
          <Paper elevation={0} sx={{ overflow: "hidden" }}>
            <List disablePadding>
              {filteredGroups.map((group, index) => {
                // --- Special FS Grouping Logic ---
                const isFlursprecher = group.department_name === "FS";
                let groupedByFloor: Record<string, HsvTenant[]> | null = null;
                let sortedFloorKeys: string[] = [];
                if (isFlursprecher) {
                  groupedByFloor = groupTenantsByFloor(group.tenants);
                  sortedFloorKeys = sortFloorKeys(Object.keys(groupedByFloor));
                }
                // --- End Special FS Logic ---

                return (
                  <React.Fragment key={group.group_id}>
                    <ListItem
                      button
                      onClick={() => handleToggleExpand(group.group_id)}
                      sx={{ backgroundColor: "rgba(0, 0, 0, 0.03)" }}
                    >
                      <ListItemText
                        // Use department_full_name here
                        primary={`${group.department_full_name} (${group.semester})`}
                        primaryTypographyProps={{ fontWeight: "medium" }}
                        secondary={`${group.tenants.length} Referenten`}
                      />
                      <IconButton edge="end" size="small">
                        {expanded[group.group_id] ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </ListItem>
                    <Collapse in={expanded[group.group_id]} timeout="auto" unmountOnExit>
                      {/* --- Conditional Rendering based on FS --- */}
                      {isFlursprecher && groupedByFloor ? (
                        // Render FS grouped by floor
                        <List component="div" disablePadding dense sx={{ pl: 2 }}>
                          {" "}
                          {/* Indent floor groups */}
                          {sortedFloorKeys.map((floorKey) => (
                            <React.Fragment key={floorKey}>
                              <Typography
                                variant="overline"
                                sx={{
                                  display: "block",
                                  pl: 2,
                                  mt: 1,
                                  fontSize: 15,
                                  fontWeight: "bold",
                                  color: "primary.main",
                                }}
                              >
                                {floorKey}
                              </Typography>
                              {groupedByFloor![floorKey].map((tenant) => renderTenantDetails(tenant))}
                            </React.Fragment>
                          ))}
                        </List>
                      ) : // Render other departments normally
                      group.tenants.length > 0 ? (
                        <List component="div" disablePadding dense>
                          {group.tenants.map((tenant) => renderTenantDetails(tenant))}
                        </List>
                      ) : (
                        <Typography sx={{ p: 2, pl: 4, fontStyle: "italic", color: "text.secondary" }}>
                          Keine Referenten gefunden (basierend auf Filterung).
                        </Typography>
                      )}
                      {/* --- End Conditional Rendering --- */}
                    </Collapse>
                    {index < filteredGroups.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>
        )}
      </DashboardCard>
    </Box>
  );
};

export default HSVPage;
