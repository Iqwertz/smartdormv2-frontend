import React from "react";
import { Box, Button, Typography } from "@mui/material";
import {
  LinkOutlined,
  DescriptionOutlined,
  CloudOutlined,
  MenuBookOutlined,
  MeetingRoomOutlined,
} from "@mui/icons-material";

// JSON configuration for quick links
const quickLinksConfig = [
  {
    id: "notion",
    label: "Notion Page",
    icon: <DescriptionOutlined fontSize="small" />,
    url: "https://rounded-drizzle-262.notion.site/d54f89e5c0284894987ad876773fc03e?v=25b2286eb82c47c8b578121e6fce1972",
  },
  {
    id: "cloud",
    label: "SchollCloud",
    icon: <CloudOutlined fontSize="small" />,
    url: "https://cloud.Schollheim.net",
  },
  {
    id: "wiki",
    label: "Wiki",
    icon: <MenuBookOutlined fontSize="small" />,
    url: "https://wiki.Schollheim.net",
  },
  {
    id: "rooms",
    label: "Rooms",
    icon: <MeetingRoomOutlined fontSize="small" />,
    url: "https://rooms.Schollheim.net",
  },
];

const QuickLinks = () => {
  return (
    <>
      <Box display="flex" flexDirection="column">
        {quickLinksConfig.map((link) => (
          <Button
            key={link.id}
            variant="text"
            color="primary"
            fullWidth
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              justifyContent: "flex-start",
              margin: 0,
              padding: "5px 12px",
              borderRadius: "8px",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
              fontWeight: 400,
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Typography
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                }}
              >
                {link.icon}
              </Typography>
              <Typography>{link.label}</Typography>
              <LinkOutlined fontSize="small" />
            </Box>
          </Button>
        ))}
      </Box>
    </>
  );
};

export default QuickLinks;
