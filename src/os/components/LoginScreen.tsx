import { useState } from "react";
import { Lock, User } from "lucide-react";

const credentials: Record<string, string> = {
  "scooty-pep": "pumpkin",
  "bottle-cap": "her",
};

export interface LoginScreenProps {
  onLogin: (userId: string) => void;
}

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const tryLogin = () => {
    if (credentials[userId] && credentials[userId] === password) {
      setError("");
      onLogin(userId);
    } else {
      setError("Invalid ID or password");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-full max-w-sm p-6 rounded-2xl bg-card border shadow-lg animate-scale-in">
        <h2 className="font-display text-2xl text-center mb-6">Wanna Swim..!!?</h2>
        <div className="space-y-3">
          <label className="block text-sm text-muted-foreground">Lock 🕺🏼</label>
          <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <input
              className="flex-1 bg-transparent outline-none text-foreground"
              placeholder="scooty-pep or bottle-cap"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && tryLogin()}
            />
          </div>

          <label className="block text-sm text-muted-foreground mt-4">Key 💃🏼</label>
          <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <input
              className="flex-1 bg-transparent outline-none text-foreground"
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && tryLogin()}
            />
          </div>

          {error && (
            <p className="text-destructive text-sm mt-2">{error}</p>
          )}

          <button
            className="mt-5 w-full rounded-lg bg-primary text-primary-foreground py-2 font-medium hover:opacity-90 transition"
            onClick={tryLogin}
          >
            Dive
          </button>

          <div className="text-xs text-muted-foreground mt-4 text-center">
            sorryuuu 😉 needed some confidentiality...
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
