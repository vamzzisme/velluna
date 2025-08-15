import { useEffect, useState } from "react";
import { formatVellunaDate } from "@/os/utils/vellunaDate";
import { BatteryFull } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface TaskbarProps {
  onToggleMenu: () => void;
  userId?: string;
  onLogout?: () => void;
}

const Taskbar = ({ onToggleMenu, userId, onLogout }: TaskbarProps) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 border-t bg-card/80 backdrop-blur flex items-center justify-between px-3 z-50">
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              aria-label="OS battery" 
              className="p-1 rounded-md border bg-card hover:bg-secondary"
            >
              <BatteryFull className="h-4 w-4 text-primary" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" align="center" className="animate-scale-in">
            This OS runs on 3 things: Hope, Heartbeats, and You
          </TooltipContent>
        </Tooltip>
        <button
          id="start-trigger"
          onClick={onToggleMenu}
          className="px-3 py-1 rounded-md bg-secondary text-foreground border hover:bg-secondary/80 transition font-medium"
          aria-label="Open start menu"
        >
          <span className="mr-2">{userId === 'bottle-cap' ? '🦎' : userId === 'scooty-pep' ? '🐣' : '💗'}</span>
          ~VA
        </button>
      </div>

      <div className="flex items-center gap-3">
        {onLogout && (
          <button
            onClick={onLogout}
            className="px-3 py-1 rounded-md border bg-card hover:bg-secondary text-sm"
            aria-label="Log out"
          >
            Logout
          </button>
        )}
        <div className="text-sm text-muted-foreground">{formatVellunaDate(now)}</div>
      </div>
    </div>
  );
};

export default Taskbar;
