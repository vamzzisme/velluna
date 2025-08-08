import { useEffect, useState } from "react";
import StartupScreen from "@/os/components/StartupScreen";
import LoginScreen from "@/os/components/LoginScreen";
import Desktop from "@/os/components/Desktop";

const Index = () => {
  const [stage, setStage] = useState<'startup' | 'login' | 'desktop'>('startup');
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setStage('login'), 2000);
    return () => clearTimeout(t);
  }, []);

  if (stage === 'startup') return <StartupScreen />;
  if (!user) return <LoginScreen onLogin={(u) => { setUser(u); setStage('desktop'); }} />;
  return <Desktop userId={user} onLogout={() => { setUser(null); setStage('login'); }} />;
};

export default Index;
