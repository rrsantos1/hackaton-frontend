"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { FaPlus, FaListUl } from "react-icons/fa";
import { useAuth } from "@/context/authContext";

const actions = [
  {
    name: "Criar Nova Atividade",
    description: "Inicie a criação de uma nova atividade pedagógica.",
    icon: <FaPlus size={40} className="text-blue-500" />,
    route: "/activities/createMenu",
  },
  {
    name: "Listar Atividades",
    description: "Veja todas as atividades já criadas.",
    icon: <FaListUl size={40} className="text-green-500" />,
    route: "/activities/allActivities",
  },
];

export default function ActivityPage() {
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
      if (!token) router.push("/");
    }, [token, router]);

  return (
    <div className="h-full bg-green-100 w-full py-12 px-8">
      <div className="max-w mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Atividades</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {actions.map((action, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex flex-col items-center hover:scale-105"
              onClick={() => router.push(action.route)}
            >
              <div className="mb-4">{action.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{action.name}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                {action.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}