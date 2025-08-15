import { Heart } from "lucide-react";

const StartupScreen = () => {
  return (
    <div className="fixed inset-0 grid place-items-center bg-background">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="p-4 rounded-full shadow-lg animate-glow">
          <img src="/logo.ico" alt="" className="h-60 w-60 text-primary animate-fade-in"/>
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
