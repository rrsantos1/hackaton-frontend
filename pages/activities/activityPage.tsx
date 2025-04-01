"use client";
import React, { useState } from "react";
import { useRouter } from "next/router";
import CreateActivityModal from "../../components/createActivityModal";

export default function ActivityPage() {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  return (
    <div className="h-full bg-green-100 w-full py-12 px-8">
      <h1 className="text-3xl font-bold mb-6">Atividades</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card Criar Atividade */}
        <div
          className="border-dashed border-2 border-gray-300 rounded p-4 flex items-center justify-center cursor-pointer hover:bg-gray-100"
          onClick={() => setShowModal(true)}
        >
          <span className="text-xl font-semibold text-gray-600">Criar Nova Atividade</span>
        </div>

        {/* Card Listar Atividades */}
        <div
          className="border-dashed border-2 border-gray-300 rounded p-4 flex items-center justify-center cursor-pointer hover:bg-gray-100"
          onClick={() => router.push("/activities/allActivities")}
        >
          <span className="text-xl font-semibold text-gray-600">Listar Atividades</span>
        </div>
      </div>

      {showModal && (
        <CreateActivityModal isOpen={showModal} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}