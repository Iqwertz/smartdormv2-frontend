import React, { useState, useEffect } from "react";
import "../../styles/Sidebar.scss"; // Import your sidebar styles
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
  groups?: string[]; // Optional groups property for access control
}

interface SidebarProps {
  items: SidebarItemProps[];
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ items, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { authState } = useAuth();

  // Handle sidebar toggle
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Check if screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 1100);
    };

    // Initial check
    checkIfMobile();

    // Add resize listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Close sidebar on mobile if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  // Check if user has access to a sidebar item based on groups
  const hasAccess = (item: SidebarItemProps): boolean => {
    // If no groups are specified for the item, everyone has access
    if (!item.groups || item.groups.length === 0) {
      return true;
    }

    // If no user or no user groups, deny access to group-restricted items
    if (!authState?.user?.groups || authState.user.groups.length === 0) {
      return false;
    }

    if (authState.user == null) {
      console.error("user not authenticated");
      return false;
    }

    // Check if there's an overlap between user groups and required groups
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

  return (
    <>
      <div className={`sidebar ${isOpen ? "open" : ""} ${isMobile && !isOpen ? "mobile-collapsed" : ""}`}>
        <div className="logo-details">
          <img src="./logo.svg" alt="logo" />
          <div className="logo_name">Smartdorm</div>
          {(isOpen || !isMobile) && (
            <div className="menu-btn" onClick={toggleSidebar}>
              {isOpen ? <MenuOpenIcon /> : <MenuIcon />}
            </div>
          )}
        </div>
        <ul className="nav-list">
          {/* Map through the items prop and only render items the user has access to */}
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
