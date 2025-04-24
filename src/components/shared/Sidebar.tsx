// src/components/shared/Sidebar.tsx
import React, { useState } from "react";
import { Sidebar, Menu, MenuItem, Submenu, Logo } from "react-mui-sidebar";
import { Link } from "react-router-dom";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import { useAuth } from "../../context/AuthContext"; // Import useAuth

// Import Icons (Add any others you need for your dynamic items)
import CottageOutlinedIcon from "@mui/icons-material/CottageOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined"; // Example for 'wiki' group

// Define the structure for menu items, including required groups
interface MenuItemConfig {
  id: string;
  title: string;
  icon?: React.ReactElement;
  link?: string;
  component?: React.ElementType;
  target?: string;
  requiredGroups?: string[]; // Groups required to see this item
  children?: MenuItemConfig[]; // For submenus
}

// Define your menu structure
// Add 'requiredGroups' array to items that need permission checks
const menuConfig: MenuItemConfig[] = [
  {
    id: "home",
    title: "HOME", // This will become a SubHeading
    children: [
      { id: "dashboard", title: "Dashboard", icon: <CottageOutlinedIcon />, link: "/tenant" },
      { id: "profile", title: "Profile", icon: <AccountCircleOutlinedIcon />, link: "/tenant/profile" }, // Example link
    ],
  },
  {
    id: "apps",
    title: "APPS",
    children: [
      { id: "calendar", title: "Calendar", icon: <EventNoteOutlinedIcon />, link: "/tenant/calendar" }, // Example link
      { id: "payments", title: "Payments", icon: <PaymentOutlinedIcon />, link: "/tenant/payments" }, // Example link
      {
        id: "wiki",
        title: "Wiki",
        icon: <GroupOutlinedIcon />,
        link: "/tenant/wiki",
        requiredGroups: ["wiki", "admin"],
      }, // Example: Only for 'wiki' or 'admin' group
    ],
  },
  {
    id: "settings",
    title: "ACCOUNT",
    children: [{ id: "settings", title: "Settings", icon: <SettingsOutlinedIcon />, link: "/tenant/settings" }],
  },
  // Example Admin link (conditionally shown based on user type in ProtectedRoute, but could also be group-based)
  // {
  //   id: "admin-link",
  //   title: "ADMIN AREA",
  //   requiredGroups: ['admin'], // Or check user_type if needed here too
  //   children: [
  //       { id: 'admin-dashboard', title: 'Admin Panel', icon: <AdminPanelSettingsOutlinedIcon/>, link: '/admin' }
  //   ]
  // }
];

const SidebarLayout: React.FC = () => {
  const { authState } = useAuth(); // Get auth state
  const user = authState.user;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Collapse on medium screens and below

  // State to control collapsed status programmatically if needed, but auto-collapse via breakpoint is preferred
  const [collapsed] = useState(false);

  // Function to filter menu items based on user groups
  const filterMenuItems = (items: MenuItemConfig[]): MenuItemConfig[] => {
    if (!user) return []; // No user, no menu items

    return items
      .map((item) => {
        // Check top-level item permissions first (if it's a group heading that needs restriction)
        const hasTopLevelPermission =
          !item.requiredGroups ||
          item.requiredGroups.length === 0 ||
          item.requiredGroups.some((group) => user.groups.includes(group));

        if (!hasTopLevelPermission) {
          return null;
        }

        // If it has children, filter them recursively
        if (item.children) {
          const filteredChildren = filterMenuItems(item.children);
          // Only keep the parent if it has visible children or is a link itself
          if (filteredChildren.length > 0 || item.link) {
            return { ...item, children: filteredChildren };
          } else {
            return null; // No visible children and not a link itself
          }
        }

        // If it's a direct menu item, check its permissions
        const hasPermission =
          !item.requiredGroups ||
          item.requiredGroups.length === 0 ||
          item.requiredGroups.some((group) => user.groups.includes(group));

        return hasPermission ? item : null;
      })
      .filter((item): item is MenuItemConfig => item !== null); // Type guard to remove nulls
  };

  const visibleMenuItems = filterMenuItems(menuConfig);

  // Helper to render menus and submenus
  const renderMenuItems = (items: MenuItemConfig[]) => {
    return items.map((item) => {
      if (item.children && item.children.length > 0) {
        // Render as a Menu (SubHeading) or Submenu
        if (item.link) {
          // It's a Submenu with a clickable title
          return (
            <Submenu key={item.id} title={item.title} icon={item.icon}>
              {renderMenuItems(item.children)}
            </Submenu>
          );
        } else {
          // It's a Menu section (SubHeading)
          return (
            <Menu key={item.id} subHeading={item.title}>
              {renderMenuItems(item.children)}
            </Menu>
          );
        }
      } else if (item.link) {
        // Render as a direct MenuItem
        return (
          <MenuItem
            key={item.id}
            icon={item.icon}
            component={Link}
            link={item.link} // Use 'link' prop for react-router-dom Link
            target={item.target}
            // Add isSelected logic if needed based on current route
          >
            {item.title}
          </MenuItem>
        );
      }
      return null; // Should not happen if filtering works correctly
    });
  };

  return (
    // Removed the absolutely positioned Box
    <Sidebar
      // --- Responsiveness ---
      // Collapsed state controlled by screen size (or manually via `collapsed` prop if preferred)
      // `defaultCollapsed` prop seems to handle initial state based on breakpoint
      // Check documentation for exact prop names if `breakpoint` or `defaultCollapsed` doesn't work as expected
      // Using breakpoint 'md' to auto-collapse on medium and smaller screens
      // Adjust 'md' (900px) to 'sm' (600px) or 'lg' (1200px) as needed
      breakpoint="md" // Auto-collapse below this breakpoint
      defaultCollapsed={isMobile} // Start collapsed on mobile if needed
      width="270px" // Keep your desired width
      backgroundColor={theme.palette.primary.dark} // Use theme color for background
      color={theme.palette.getContrastText(theme.palette.primary.dark)} // Use contrast text color
      collapsedWidth="80px" // Width when collapsed
    >
      {/* Toggle Button (Optional but recommended for manual control) */}
      {/* Place it where you want it, usually inside or outside the sidebar */}
      {/* <SidebarToggleButton /> */}

      <Logo
        component={Link}
        href="/" // Use 'href' prop for Logo component Link behavior
        img="/img/logo.svg" // Path relative to public folder
        imgHeight="30px" // Adjust height as needed
        imgWidth="auto" // Let width adjust based on height
        style={{ padding: "16px 24px", display: "flex", alignItems: "center" }} // Add some padding
      >
        {/* Text "smartdorm" handled by SVG in this case, or add Typography here if logo is just an icon */}
        {/* <Typography variant="h6" sx={{ ml: 1, color: 'inherit', display: collapsed ? 'none' : 'block' }}>smartdorm</Typography> */}
      </Logo>

      {/* Render dynamic menus */}
      {renderMenuItems(visibleMenuItems)}

      {/* User Info Footer */}
      <Box
        sx={{
          p: collapsed ? 1 : 2, // Adjust padding when collapsed
          mt: "auto", // Pushes to the bottom
          borderTop: `1px solid ${theme.palette.divider}`, // Use theme divider
          backgroundColor: "rgba(0,0,0,0.1)", // Slightly different background for footer
          overflow: "hidden", // Hide text overflow when collapsed
          whiteSpace: "nowrap", // Prevent text wrapping
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "inherit",
            textAlign: collapsed ? "center" : "left", // Center text when collapsed
            display: "block", // Ensure Typography takes space
          }}
        >
          {/* Display username or full name */}
          {user ? `${user.name} ${user.surname}` : "User"}
        </Typography>
        {/* Maybe add a small logout icon button here too if desired */}
      </Box>
    </Sidebar>
  );
};

export default SidebarLayout;
