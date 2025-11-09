import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Box, Paper, Typography, ButtonBase, useTheme, useMediaQuery } from "@mui/material";
import { useAuth } from "../../context/AuthContext";

interface Tab {
  label: string;
  content: React.ReactNode;
  authGroups?: string[]; // Optional: restrict tab visibility based on auth groups
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
  const { authState } = useAuth();

  // Filter tabs based on auth groups
  const visibleTabs = useMemo(() => {
    return tabs.filter((tab) => {
      if (!tab.authGroups || tab.authGroups.length === 0) {
        return true; // No restriction, show tab
      }
      const userGroups = authState.user?.groups || [];
      return tab.authGroups.some((group) => userGroups.includes(group));
    });
  }, [tabs, authState.user?.groups]);

  // Ensure activeTab is valid after filtering
  useEffect(() => {
    if (activeTab >= visibleTabs.length) {
      setActiveTab(Math.max(0, visibleTabs.length - 1));
    }
  }, [visibleTabs.length, activeTab]);

  const checkFades = useCallback(() => {
    const el = tabsContainerRef.current;
    if (!el) return;

    const isScrollable = el.scrollWidth > el.clientWidth;
    if (!isScrollable) {
      setShowLeftFade(false);
      setShowRightFade(false);
      return;
    }

    const isAtStart = el.scrollLeft < 5;
    const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;

    setShowLeftFade(!isAtStart);
    setShowRightFade(!isAtEnd);
  }, [setShowLeftFade, setShowRightFade]);

  useEffect(() => {
    const el = tabsContainerRef.current;
    if (!el) return;

    checkFades();

    const observer = new ResizeObserver(checkFades);
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [visibleTabs, checkFades]);

  useEffect(() => {
    setTimeout(checkFades, 0);
  }, [activeTab, visibleTabs, checkFades]);

  if (!visibleTabs || visibleTabs.length === 0) {
    return null;
  }

  return (
    <Box sx={{ position: "relative", mt: 4 }}>
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

        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            flexGrow: isMobile ? 0 : 1,
            width: isMobile ? "100%" : "auto",
          }}
        >
          <Box
            ref={tabsContainerRef}
            onScroll={checkFades}
            sx={{
              overflowX: "auto",
              display: "flex",
              gap: 1,
              py: 1,
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
              "-ms-overflow-style": "none",
            }}
          >
            {visibleTabs.map((tab, index) => (
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
        <Box sx={{ ...contentSx }}>{visibleTabs[activeTab].content}</Box>
      </Paper>
    </Box>
  );
};

export default TabbedDashboardCard;
