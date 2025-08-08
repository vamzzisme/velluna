import { useEffect, useState } from "react";
import { formatVellunaDate } from "@/os/utils/vellunaDate";

export interface TaskbarProps {
  onToggleMenu: () => void;
  userId?: string;
  onLogout?: () => void;
}

const Taskbar = ({ onToggleMenu, userId }: TaskbarProps) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed bottom-0 inset-x-0 h-12 border-t bg-card/80 backdrop-blur flex items-center justify-between px-3">
      <button
        id="start-trigger"
        onClick={onToggleMenu}
        className="px-3 py-1 rounded-md bg-secondary text-foreground border hover:bg-secondary/80 transition font-medium"
        aria-label="Open start menu"
      >
        <span className="mr-2">{userId === 'bottle-cap' ? '🦎' : userId === 'scooty-pep' ? '🐣' : '💗'}</span>
        ~VA
      </button>

      <div className="text-sm text-muted-foreground">{formatVellunaDate(now)}</div>
    </div>
  );
};

export default Taskbar;
