import Navbar from "./Navbar";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { ReactNode } from "react";
import { useAuth } from "../context/authContext"; // importe o contexto

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isLoggedIn } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-grow min-h-0 overflow-hidden">
        {isLoggedIn && <Sidebar className="hidden md:block" />}
        <main className="flex-1 overflow-auto min-h-0">{children}</main>
      </div>
      <Footer />
    </div>
  );
}