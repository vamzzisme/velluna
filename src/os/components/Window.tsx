import { ReactNode, useEffect, useState } from "react";
import { X } from "lucide-react";

export interface WindowProps {
  id: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

const Window = ({ id, title, onClose, children }: WindowProps) => {
  const [pos, setPos] = useState({ x: 120 + Math.random() * 80, y: 80 + Math.random() * 60 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dragging) return;
      setPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };
    const up = () => setDragging(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [dragging, offset.x, offset.y]);

  return (
    <div
      className="fixed w-[min(90vw,700px)] h-[min(70vh,520px)] bg-card border rounded-xl shadow-lg ring-1 ring-border overflow-hidden"
      style={{ left: pos.x, top: pos.y, zIndex: 40 }}
    >
      <div
        className="h-10 bg-secondary border-b flex items-center justify-between px-3 cursor-move"
        style={{ backgroundImage: 'var(--gradient-primary)' }}
        onMouseDown={(e) => {
          setDragging(true);
          const rect = (e.currentTarget.parentElement as HTMLDivElement).getBoundingClientRect();
          setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
      >
        <div className="font-medium text-foreground">{title}</div>
        <div className="flex items-center gap-2">
          <button
            className="p-1 rounded bg-destructive text-destructive-foreground hover:opacity-90"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className={"w-full h-[calc(100%-2.5rem)] p-3 overflow-auto bg-background "}>{children}</div>
    </div>
  );
};

export default Window;
