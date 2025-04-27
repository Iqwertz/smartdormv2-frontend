// src/components/shared/Sidebar.tsx
import React, { useState, useEffect, MouseEvent } from "react";
import "../../styles/Sidebar.scss";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../../context/AuthContext";

// Define the types for our props
export interface SidebarItemProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  path: string;
  groups?: string[];
}

interface SidebarProps {
  items: SidebarItemProps[];
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ items, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { authState } = useAuth();

  // Handle sidebar toggle (used by the explicit button)
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Check if screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 1100);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Close sidebar on mobile if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      // Use globalThis.MouseEvent
      const target = event.target as HTMLElement;
      if (isMobile && isOpen && !target.closest(".sidebar")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, isOpen]);

  // Check access
  const hasAccess = (item: SidebarItemProps): boolean => {
    if (!item.groups || item.groups.length === 0) return true;
    if (!authState?.user?.groups || authState.user.groups.length === 0) return false;
    if (authState.user == null) {
      console.error("user not authenticated");
      return false;
    }
    return item.groups.some((group) => authState.user?.groups.includes(group));
  };

  // Render mobile menu button only when collapsed
  const renderMobileMenuButton = () => {
    if (isMobile && !isOpen) {
      return (
        <div className="mobile-menu-btn" onClick={toggleSidebar}>
          <MenuIcon />
        </div>
      );
    }
    return null;
  };

  // --- New Handler for Clicking the Sidebar Background ---
  const handleSidebarClick = (event: MouseEvent<HTMLDivElement>) => {
    // Only proceed if the sidebar is currently closed
    if (isOpen) {
      return;
    }

    // Get the element that was actually clicked
    const target = event.target as HTMLElement;

    // Check if the click originated from an interactive element (link, button, specific icons)
    // We use closest() to see if the click happened *on or inside* these elements.
    if (target.closest("a, button, .menu-btn, .logout-icon")) {
      // If it's an interactive element, do nothing here; let their own handlers work.
      return;
    }

    // If the click was not on an interactive element and the sidebar is closed, open it.
    setIsOpen(true);
  };

  return (
    <>
      <div
        className={`sidebar ${isOpen ? "open" : ""} ${isMobile && !isOpen ? "mobile-collapsed" : ""}`}
        onClick={handleSidebarClick}
      >
        <div className="logo-details">
          <img src="/logo.svg" alt="logo" />
          <div className="logo_name">Smartdorm</div>
          {/* Menu button's onClick already handles toggling */}
          {(isOpen || !isMobile) && (
            <div className="menu-btn" onClick={toggleSidebar}>
              {isOpen ? <MenuOpenIcon /> : <MenuIcon />}
            </div>
          )}
        </div>
        <ul className="nav-list">
          {items.map(
            (item) =>
              hasAccess(item) && (
                <li key={item.id}>
                  <a href={item.path}>
                    {item.icon}
                    <span className="links_name">{item.title}</span>
                  </a>
                  <span className="tooltip">{item.title}</span>
                </li>
              )
          )}
          <li className="profile">
            <div className="profile-details">
              <div className="name_job">
                <div className="name">{authState?.user?.username || "Loading..."}</div>
                <div className="job">{authState?.user?.name || "Loading..."}</div>
              </div>
            </div>
            <LogoutIcon className="logout-icon" onClick={onLogout} />
          </li>
        </ul>
      </div>
      {renderMobileMenuButton()}
    </>
  );
};

export default Sidebar;
