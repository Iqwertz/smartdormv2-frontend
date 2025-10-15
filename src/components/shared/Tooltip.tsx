import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import ReactDOM from "react-dom";
import "../../styles/Sidebar.scss";

interface TooltipProps {
  children: React.ReactElement;
  text: string;
  disabled?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text, disabled = false }) => {
  const triggerRef = useRef<HTMLElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // This effect calculates the position when the tooltip should appear
  useLayoutEffect(() => {
    if (isHovering && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 18,
      });
    }
  }, [isHovering]);

  // This effect controls the fade-in animation
  useEffect(() => {
    if (isHovering) {
      // Use a tiny timeout to allow the element to mount first with opacity 0,
      // then add the 'visible' class to trigger the transition.
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [isHovering]);

  const handleMouseEnter = () => {
    // Only show the tooltip if it's not disabled
    if (!disabled) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const trigger = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  } as React.HTMLAttributes<HTMLElement>);

  return (
    <>
      {trigger}
      {/* Only render the portal if the user is hovering */}
      {isHovering &&
        ReactDOM.createPortal(
          <div
            className={`portal-tooltip ${isAnimating ? "visible" : ""}`}
            style={{ top: position.top, left: position.left }}
          >
            {text}
          </div>,
          document.body
        )}
    </>
  );
};

export default Tooltip;
