import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function VerifyPage() {
  const router = useRouter();
  const { token } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    async function verifyEmail() {
      try {
        if (!token) {
          setError("Token de verificação ausente.");
          setLoading(false);
          return;
        }

        // 🔹 Chama o endpoint de verificação de email
        const response = await axios.get('http://localhost:3001/verifyEmail', {
          params: { token }
        });

        if (response.status === 200) {
          // 🔹 Salva uma mensagem de sucesso no localStorage
          localStorage.setItem("verificationSuccess", "Email verificado com sucesso!");

          // 🔹 Redireciona para a página inicial
          router.push('/');
        } else {
          setError("Falha na verificação de email.");
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error ?? "Erro ao verificar email.");
        } else {
          setError("Erro ao verificar email.");
        }
      } finally {
        setLoading(false);
      }
    }

    verifyEmail();
  }, [router.isReady, token, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Processando verificação...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return <div>Redirecionando...</div>;
}