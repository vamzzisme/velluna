import { Heart } from "lucide-react";

const StartupScreen = () => {
  return (
    <div className="fixed inset-0 grid place-items-center bg-background">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="p-8 rounded-2xl bg-secondary shadow-lg animate-glow">
          <Heart className="h-16 w-16 text-primary animate-heartbeat" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">
          Velluna OS
        </h1>
        <p className="text-muted-foreground">Blooming with love…</p>
      </div>
    </div>
  );
};

export default StartupScreen;
