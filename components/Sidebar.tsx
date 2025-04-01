// components/Sidebar.tsx
import Link from "next/link";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = "" }: SidebarProps) {
  return (
    <aside className={`w-64 bg-gray-200 p-4 overflow-y-auto ${className}`}>
      <nav>
        <ul>
        <li>
            <Link href="/dashboard" className="block py-2 px-4 hover:bg-gray-200 rounded">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/activities/activityPage" className="block py-2 px-4 hover:bg-gray-200 rounded">
              Atividades
            </Link>
          </li>          
        </ul>
      </nav>
    </aside>
  );
}