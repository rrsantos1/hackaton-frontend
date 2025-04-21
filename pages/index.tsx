import { useEffect, useState } from "react";
import SignupForm from "../components/SignupForm";
import SignInForm from "@/components/SignInForm";
import Image from "next/image";

export default function Home() {
  const [message, setMessage] = useState("");
  const [accessForm, setAccessForm] = useState("signin");

  useEffect(() => {
    // 🔹 Verifica se há mensagem de sucesso no localStorage
    const successMessage = localStorage.getItem("verificationSuccess");
    if (successMessage) {
      setMessage(successMessage);
      localStorage.removeItem("verificationSuccess"); // 🔹 Remove a mensagem após exibição
    }
  }, []);

  return (
    <div className="flex flex-row gap-16 flex-wrap items-center justify-center bg-white h-full w-full py-12 px-4">
      <div className="w-full max-w-lg ">
        <Image className="w-full h-full" src="/home_bg.jpg" alt="learning" width={800} height={800} />
      </div>

      <div className="bg-white p-6 rounded w-full max-w-md">
        <div className="flex flex-col text-center">
          <h1 className="text-3xl font-bold mb-4">Bem-vindo ao Hacklearning</h1>
          <p className="mb-8 max-w-xl">Inscreva-se para ter acesso ao nosso conteúdo exclusivo e aprimorar seu aprendizado.</p>
        </div>

        {/* 🔹 Mensagem de sucesso visível quando existir */}
        {message && <div className="bg-green-500 text-white px-6 py-3 rounded-lg mb-6 text-center">{message}</div>}

        {accessForm === "signup" && (
          <>
            <SignupForm />
            <p className="text-center mt-2"> ou </p>
            <button className="text-center w-full mt-2 text-green-500 cursor-pointer" onClick={() => setAccessForm("signin")}>
              acesse sua conta
            </button>
          </>
        )}

        {accessForm === "signin" && (
          <>
            <SignInForm />
            <p className="text-center mt-2"> ou </p>
            <button className="text-center w-full mt-2 text-green-500 cursor-pointer" onClick={() => setAccessForm("signup")}>
              crie uma conta
            </button>
          </>
        )}
      </div>
    </div>
  );
}
