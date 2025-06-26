// pages/index.tsx
import { useSession, signIn, signOut } from "next-auth/react";
import Dashboard from "@/components/Dashboard";
import Login from "@/components/Login";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;

  return session ? (
      <Dashboard onLogout={() => signOut()} />
  ) : (
      <Login onLogin={() => signIn()} />
  );
}
