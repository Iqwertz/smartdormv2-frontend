import React, { useState, useRef, useEffect, useCallback } from "react";
import { Box, Paper, Typography, ButtonBase, useTheme, useMediaQuery } from "@mui/material";

interface Tab {
  label: string;
  content: React.ReactNode;
}

interface TabbedDashboardCardProps {
  title?: string;
  tabs: Tab[];
  cardSx?: object;
  contentSx?: object;
  initialTab?: number;
}

const TabbedDashboardCard: React.FC<TabbedDashboardCardProps> = ({
  title,
  tabs,
  cardSx = {},
  contentSx = {},
  initialTab = 0,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeTab, setActiveTab] = useState(initialTab);
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  // Fixed: Include state setters in dependencies (or use functional updates if needed)
  const checkFades = useCallback(() => {
    const el = tabsContainerRef.current;
    if (!el) return;

    const isScrollable = el.scrollWidth > el.clientWidth;
    // Hide fades if not scrollable
    if (!isScrollable) {
      setShowLeftFade(false);
      setShowRightFade(false);
      return;
    }

    const isAtStart = el.scrollLeft < 5;
    const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;

    setShowLeftFade(!isAtStart);
    setShowRightFade(!isAtEnd);
  }, [setShowLeftFade, setShowRightFade]); // ← Added dependencies

  // Check for fades on mount, resize, and when tabs change.
  useEffect(() => {
    const el = tabsContainerRef.current;
    if (!el) return;

    checkFades();

    const observer = new ResizeObserver(checkFades);
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [tabs, checkFades]);

  // Fixed: Add a separate useEffect to handle initial check and tab changes
  useEffect(() => {
    // Use setTimeout to ensure DOM is updated
    setTimeout(checkFades, 0);
  }, [activeTab, tabs, checkFades]);

  if (!tabs || tabs.length === 0) {
    return null;
  }

  return (
    <Box sx={{ position: "relative", mt: 4 }}>
      {/* Title & Tabs Container */}
      <Box
        sx={{
          display: "flex",
          alignItems: isMobile ? "stretch" : "center",
          flexDirection: isMobile ? "column" : "row",
          position: "absolute",
          top: isMobile ? -32 : -16,
          left: 20,
          zIndex: 10,
          gap: 1,
          width: isMobile ? "calc(100% - 40px)" : "auto",
        }}
      >
        {/* Main Title */}
        {title && (
          <Paper
            elevation={3}
            sx={{
              backgroundColor: "rgb(128, 22, 44);",
              px: 2,
              py: 0.5,
              borderRadius: 1,
              flexShrink: 0,
              width: isMobile ? "fit-content" : "auto",
            }}
          >
            <Typography variant="h6" color="#f1f1f1">
              {title}
            </Typography>
          </Paper>
        )}

        {/* Scrollable Tabs Wrapper */}
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            flexGrow: isMobile ? 0 : 1,
            width: isMobile ? "100%" : "auto",
          }}
        >
          {/* Fixed: Move the scroll handler to the actual scrollable element */}
          <Box
            ref={tabsContainerRef}
            onScroll={checkFades}
            sx={{
              overflowX: "auto",
              display: "flex",
              gap: 1,
              py: 1,
              // Hide scrollbar style
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
              "-ms-overflow-style": "none",
            }}
          >
            {/* Tab Buttons */}
            {tabs.map((tab, index) => (
              <ButtonBase
                key={index}
                onClick={() => setActiveTab(index)}
                sx={{
                  px: 2,
                  py: 0.5,
                  mx: 0.2,
                  borderRadius: 1,
                  transition: "all 0.2s ease-in-out",
                  whiteSpace: "nowrap",
                  ...(activeTab === index
                    ? {
                        backgroundColor: "primary.main",
                        color: "primary.contrastText",
                        boxShadow: 3,
                      }
                    : {
                        backgroundColor: "background.paper",
                        color: "text.secondary",
                        boxShadow: 1,
                        "&:hover": {
                          outline: "1px solid",
                          outlineColor: theme.palette.primary.main,
                          color: "text.primary",
                          filter: "brightness(0.9)",
                        },
                      }),
                }}
              >
                <Typography variant="button">{tab.label}</Typography>
              </ButtonBase>
            ))}
          </Box>
          {/* Fade Effects */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 30,
              background: `linear-gradient(to right, ${theme.palette.background.default}, transparent)`,
              opacity: showLeftFade ? 1 : 0,
              transition: "opacity 0.3s",
              pointerEvents: "none",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: 30,
              background: `linear-gradient(to left, ${theme.palette.background.default}, transparent)`,
              opacity: showRightFade ? 1 : 0,
              transition: "opacity 0.3s",
              pointerEvents: "none",
            }}
          />
        </Box>
      </Box>

      {/* Main Card */}
      <Paper
        elevation={6}
        sx={{
          position: "relative",
          zIndex: 2,
          backgroundColor: "rgba(255, 255, 255, 1)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderRadius: 2,
          overflow: "hidden",
          pt: isMobile ? 8 : 4,
          ...cardSx,
        }}
      >
        <Box sx={{ ...contentSx }}>{tabs[activeTab].content}</Box>
      </Paper>
    </Box>
  );
};

export default TabbedDashboardCard;
