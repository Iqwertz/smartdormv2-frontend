import React, { useState, useEffect, MouseEvent, useMemo, useRef } from "react"; // Added useRef
import { Link, useLocation } from "react-router-dom";
import "../../styles/Sidebar.scss";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../../context/AuthContext";
import { getSidebarItems, AppRoute } from "../../routesConfig";

export interface AppSidebarItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  path: string;
  requiredGroups?: string[];
}

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { authState, logout } = useAuth();
  const location = useLocation();
  const previousPathnameRef = useRef(location.pathname);

  const sidebarItems: AppSidebarItem[] = useMemo(() => {
    if (authState.user?.groups) {
      return getSidebarItems(authState.user.groups).map((route: AppRoute) => ({
        id: route.id,
        icon: route.icon,
        title: route.title!,
        path: route.path,
        requiredGroups: route.requiredGroups,
      }));
    }
    return [];
  }, [authState.user?.groups]);

  const handleLogout = async () => {
    await logout();
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

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

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
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

  useEffect(() => {
    if (isMobile && isOpen && location.pathname !== previousPathnameRef.current) {
      setIsOpen(false);
    }
    previousPathnameRef.current = location.pathname;
  }, [location.pathname, isMobile, isOpen]);

  const hasAccess = (item: AppSidebarItem): boolean => {
    if (!item.requiredGroups || item.requiredGroups.length === 0) return true;
    if (!authState?.user?.groups || authState.user.groups.length === 0) return false;
    if (authState.user == null) {
      console.error("User not authenticated for sidebar access check");
      return false;
    }
    return item.requiredGroups.some((group) => authState.user?.groups.includes(group));
  };

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

  const handleSidebarClick = (event: MouseEvent<HTMLDivElement>) => {
    if (isOpen) {
      return;
    }
    const target = event.target as HTMLElement;
    if (target.closest("a, button, .menu-btn, .logout-icon")) {
      return;
    }
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
          {(isOpen || !isMobile) && (
            <div className="menu-btn" onClick={toggleSidebar}>
              {isOpen ? <MenuOpenIcon /> : <MenuIcon />}
            </div>
          )}
        </div>
        <ul className="nav-list">
          {sidebarItems.map(
            (item) =>
              hasAccess(item) && (
                <li key={item.id} className={location.pathname === item.path ? "active" : ""}>
                  <Link to={item.path}>
                    {item.icon}
                    <span className="links_name">{item.title}</span>
                  </Link>
                  <span className="tooltip">{item.title}</span>
                </li>
              )
          )}
          <li className="profile">
            <div className="profile-details">
              <div className="name_job">
                <div className="name">{authState?.user?.username || "Laden..."}</div>
                <div className="job">{authState?.user?.name || "Laden..."}</div>
              </div>
            </div>
            <LogoutIcon className="logout-icon" onClick={handleLogout} />
          </li>
        </ul>
      </div>
      {renderMobileMenuButton()}
    </>
  );
};

export default Sidebar;
