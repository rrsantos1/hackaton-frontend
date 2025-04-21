"use client";

import { useAuth } from "@/context/authContext";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="h-full bg-gradient-to-br from-green-100 to-blue-50 py-12 px-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow text-gray-800">
        <h1 className="text-2xl font-bold mb-6">Informações da Conta</h1>
      
        {/* Perfil */}
        <div className="mb-8 border border-gray-300 rounded-xl p-4 shadow-sm bg-white">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Meu Perfil</h2>
          {user ? (
            <div className="space-y-2">
              <p><strong>Nome:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Perfil:</strong> {user.role}</p>
            </div>
          ) : (
            <p className="text-gray-600">Carregando perfil...</p>
          )}
        </div>
      </div> 
    </div>
  );
}