// src/components/admin/MyEngagements.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Collapse, // Import Collapse
  IconButton, // Import IconButton for expand/collapse
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material"; // Import icons
import { Engagement } from "../../../../types/tenant";
import apiClient from "../../../../services/api";

const MyEngagements: React.FC = () => {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // State to track expanded items: key is engagement ID, value is boolean
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setLoading(true);
    apiClient
      .get<Engagement[]>("/api/tenants/my-engagements")
      .then((response) => {
        setEngagements(response.data);
        setError(null);
      })
      .catch((err) => {
        setError("Failed to load engagements.");
        console.error("Error fetching engagements:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Function to toggle the expansion state for a specific item
  const handleToggleExpand = (id: number) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle the boolean value for the given id
    }));
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box p={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      );
    }

    if (engagements.length === 0) {
      return (
        <Typography variant="body1" sx={{ p: 2, textAlign: "center" }}>
          Keine Referate gefunden.
        </Typography>
      );
    }

    return (
      // Remove dense if you want more spacing
      <List sx={{ width: "100%", py: 0 }}>
        {engagements.map((engagement, index) => {
          const isExpanded = !!expanded[engagement.id]; // Check if current item is expanded
          const hasNote = engagement.note && engagement.note.trim() !== ""; // Check if there's a note

          return (
            <React.Fragment key={engagement.id}>
              <ListItem
                // Make item clickable only if there's a note to expand/collapse
                button={hasNote} // Add button prop for visual feedback if clickable
                onClick={hasNote ? () => handleToggleExpand(engagement.id) : undefined}
                // Add alignment and potentially disableGutters if needed
                alignItems="flex-start"
                sx={{ pr: hasNote ? 7 : 2 }} // Add padding-right if expand icon is present
              >
                {/* Main content */}
                <ListItemText
                  disableTypography // Allows custom Typography elements below
                  primary={
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                      {/* Title */}
                      <Typography variant="body1" sx={{ fontWeight: "medium", flexGrow: 1, mr: 1 }}>
                        {`${engagement.department.name} - ${engagement.semester}`}
                      </Typography>
                      {/* Chips */}
                      <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                        <Chip
                          label={`${engagement.points} Punkte`}
                          size="small"
                          variant="outlined"
                          sx={{ height: "auto", "& .MuiChip-label": { py: 0.2, px: 0.8 } }}
                        />
                        {engagement.compensate && (
                          <Chip
                            label="Vergütet"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ height: "auto", "& .MuiChip-label": { py: 0.2, px: 0.8 } }}
                          />
                        )}
                      </Box>
                    </Box>
                  }
                  // Remove secondary from here, it will be in Collapse
                />
                {/* Expand/Collapse Icon (only if there's a note) */}
                {hasNote && (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent ListItem onClick from firing again
                      handleToggleExpand(engagement.id);
                    }}
                    size="small"
                    sx={{
                      position: "absolute",
                      right: 8,
                      top: 8, // Adjust vertical position if needed
                    }}
                  >
                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                )}
              </ListItem>

              {/* Collapsible Note Area (only if there's a note) */}
              {hasNote && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box sx={{ pl: 2, pr: 2, pb: 1, pt: 0 }}>
                    {" "}
                    {/* Adjust padding as needed */}
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
                      {engagement.note}
                    </Typography>
                  </Box>
                </Collapse>
              )}

              {/* Divider */}
              {index < engagements.length - 1 && <Divider component="li" sx={{ ml: 2 }} />}
            </React.Fragment>
          );
        })}
      </List>
    );
  };

  return (
    <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
      {" "}
      {/* Make the list scrollable */}
      {renderContent()}
    </Box>
  );
};

export default MyEngagements;
