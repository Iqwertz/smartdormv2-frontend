import React, { useState, useEffect } from "react";
import "../../styles/Sidebar.scss"; // Import your sidebar styles
// Material UI Icons
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import ChatIcon from "@mui/icons-material/Chat";
import PieChartIcon from "@mui/icons-material/PieChart";
import FolderIcon from "@mui/icons-material/Folder";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import CodeIcon from "@mui/icons-material/Code";

/* interface SidebarProps {
  // Add any props you need here
} */

const Sidebar: React.FC<SidebarProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle sidebar toggle
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Check if screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
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
          {/* <li>
            <SearchIcon className="search-icon" onClick={toggleSidebar} />
            <input type="text" placeholder="Search..." />
            <span className="tooltip">Search</span>
          </li> */}
          <li>
            <a href="#">
              <HomeIcon />
              <span className="links_name">Dashboard</span>
            </a>
            <span className="tooltip">Dashboard</span>
          </li>
          <li>
            <a href="#">
              <PersonIcon />
              <span className="links_name">User</span>
            </a>
            <span className="tooltip">User</span>
          </li>
          <li>
            <a href="#">
              <ChatIcon />
              <span className="links_name">Messages</span>
            </a>
            <span className="tooltip">Messages</span>
          </li>
          <li>
            <a href="#">
              <PieChartIcon />
              <span className="links_name">Analytics</span>
            </a>
            <span className="tooltip">Analytics</span>
          </li>
          <li>
            <a href="#">
              <FolderIcon />
              <span className="links_name">File Manager</span>
            </a>
            <span className="tooltip">Files</span>
          </li>
          <li>
            <a href="#">
              <ShoppingCartIcon />
              <span className="links_name">Order</span>
            </a>
            <span className="tooltip">Order</span>
          </li>
          <li>
            <a href="#">
              <FavoriteIcon />
              <span className="links_name">Saved</span>
            </a>
            <span className="tooltip">Saved</span>
          </li>
          <li>
            <a href="#">
              <SettingsIcon />
              <span className="links_name">Setting</span>
            </a>
            <span className="tooltip">Setting</span>
          </li>
          <li className="profile">
            <div className="profile-details">
              <div className="name_job">
                <div className="name">Prem Shahi</div>
                <div className="job">Web designer</div>
              </div>
            </div>
            <LogoutIcon className="logout-icon" />
          </li>
        </ul>
      </div>
      {renderMobileMenuButton()}
    </>
  );
};

export default Sidebar;
