import { useAuth } from "../context/authContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function UserDropdown() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleToggle = () => setOpen(prev => !prev);

  const handleNavigate = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <div className="relative z-50">
      <button
        onClick={handleToggle}
        className="bg-white text-green-700 px-4 py-2 rounded font-semibold hover:bg-gray-200 transition"
      >
        {user?.name?.split(" ")[0]} ▼
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white text-green-700 rounded shadow-lg"
          >
            <button
              onClick={() => handleNavigate("/profile")}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Meu Perfil
            </button>            
            <hr className="my-1 border-gray-200" />
            <button
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
            >
              Sair
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}