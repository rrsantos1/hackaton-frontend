import Link from "next/link";
import { useAuth } from "../context/authContext";
import UserDropdown from "./UserDropdown";

export default function Navbar() {
  const { isLoggedIn } = useAuth();

  return (
    <header className="bg-green-700 text-white w-full py-4">
      <div className="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <Link href={isLoggedIn ? "/activities/activityPage" : "/"}>
          <p>Hacklearning</p>
        </Link>

        <nav className="flex space-x-4 mb-4 md:mb-0 font-semibold">
          {!isLoggedIn && (
            <Link href="/" className="bg-white text-green-700 px-4 py-2 rounded hover:bg-gray-200 transition">
              Início
            </Link>
          )}
          <Link href="/about" className="bg-white text-green-700 px-4 py-2 rounded hover:bg-gray-200 transition">
            Sobre
          </Link>

          {isLoggedIn && <UserDropdown />}
        </nav>
      </div>
    </header>
  );
}
