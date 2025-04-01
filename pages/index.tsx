import { useEffect, useState } from 'react';
import SignupForm from '../components/SignupForm';

export default function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // 🔹 Verifica se há mensagem de sucesso no localStorage
    const successMessage = localStorage.getItem("verificationSuccess");
    if (successMessage) {
      setMessage(successMessage);
      localStorage.removeItem("verificationSuccess"); // 🔹 Remove a mensagem após exibição
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center bg-green-100 h-full w-full py-12 px-4">
      {/* 🔹 Mensagem de sucesso visível quando existir */}
      {message && (
        <div className="bg-green-500 text-white px-6 py-3 rounded-lg mb-6 text-center">
          {message}
        </div>
      )}

      <h1 className="text-3xl font-bold mb-4">Bem-vindo ao Hackaton</h1>
      <p className="mb-8 text-center max-w-xl">
        Inscreva-se para ter acesso ao nosso conteúdo exclusivo e aprimorar seu aprendizado.
      </p>
      <SignupForm />
    </div>
  );
}