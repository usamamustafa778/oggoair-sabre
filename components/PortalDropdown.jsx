import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function PortalDropdown({ children, show, style = {} }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !show) return null;

  return createPortal(
    <div
      style={{ position: "fixed", zIndex: 9999, ...style }}
      className="max-w-[600px] min-w-[500px] min-h-[500px]"
      data-portal-dropdown="true"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  );
}
