"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const menuItems = [
  { label: "Atividades", href: "/activities/activityPage", icon: <BookOpen size={18} /> },
];

export default function Sidebar({ className = "" }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`w-48 bg-white border-r border-gray-200 p-4 shadow-md ${className}`}
    >
      <nav>
        <ul className="space-y-2">
          {menuItems.map(({ label, href, icon }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {icon}
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}