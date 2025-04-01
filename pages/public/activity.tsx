"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import WordSearchGame from "@/components/wordsearchGame";
import CrosswordGame from "@/components/crosswordGame";
import QuizGameAll from "@/components/quizGameAll";
import QuizGameInteractive from "@/components/quizGameInteractive";
import ClozeGame from "@/components/clozeGame";
import DragDropGame from "@/components/dragDropGame";
import MultipleChoiceGame from "@/components/multipleChoiceGame";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface ClozeQuestion {
  sentence: string;
  correctAnswers: string[];
  options?: string[];
}

interface ActivityContentBase {
  words?: string[];
  grid?: string[][];
  wordPositions?: { word: string; row: number; col: number; direction: string }[];
  clues?: { word: string; clue: string; row: number; col: number; direction: "across" | "down"; number: number }[];
  pairs?: { word: string; translation: string }[];
}

type ActivityContent = ActivityContentBase & (
  | { questions?: QuizQuestion[] }
  | { questions?: ClozeQuestion[] }
);

interface Activity {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  config?: {
    // Para word_search ou crossword:
    time?: number;
    rows?: number;
    cols?: number;
    // Para quiz, cloze ou drag_drop:
    timeLimit?: number;
    shuffleQuestions?: boolean;
  };
  content?: ActivityContent;
  coverImage?: string;
}

export default function PublicActivityPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const API_URL = "http://localhost:3001";

  useEffect(() => {
    // Se token for null, apenas espere (não definir erro imediatamente)
    if (token === null) {
      // Enquanto o token não estiver disponível, não faz nada
      return;
    }

    const fetchActivity = async () => {
      try {
        // O backend decodifica o token e retorna os dados da atividade
        const response = await axios.get(`${API_URL}/public/activity`, {
          params: { token },
        });
        setActivity(response.data);
        console.log("Atividade:", response.data);
      } catch (err) {
        console.error("Erro ao buscar atividade:", err);
        setError("Erro ao carregar a atividade.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [token]);

  // Se token ainda não estiver disponível, mostra um carregamento
  if (token === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Carregando informações da URL...
      </div>
    );
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Carregando...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  if (!activity)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Atividade não encontrada.
      </div>
    );

  // Configuração para word_search e crossword
  const gridConfig = {
    time: activity.config?.time ?? 60,
    rows: activity.config?.rows ?? 10,
    cols: activity.config?.cols ?? 10,
  };

  // Função para renderizar a atividade conforme seu tipo
  const renderActivity = () => {
    switch (activity.type) {
      case "word_search":
        return activity.content && activity.config ? (
          <WordSearchGame
            grid={activity.content.grid!}
            words={activity.content.words!}
            positions={activity.content.wordPositions!}
            config={gridConfig}
          />
        ) : null;
      case "crossword":
        return activity.content && activity.config ? (
          <CrosswordGame
            grid={activity.content.grid!}
            clues={activity.content.clues!}
            config={gridConfig}
          />
        ) : null;
      case "quiz":
        const mode = searchParams.get("mode") ?? "all";
        return activity.content && activity.content.questions ? (
          mode === "interactive" ? (
            <QuizGameInteractive
              questions={activity.content.questions as QuizQuestion[]}
              config={activity.config}
            />
          ) : (
            <QuizGameAll
              questions={activity.content.questions as QuizQuestion[]}
              config={activity.config}
            />
          )
        ) : null;
      case "cloze":
        return activity.content?.questions ? (
          <ClozeGame
            questions={activity.content.questions as ClozeQuestion[]}
            config={activity.config}
          />
        ) : null;
      case "drag_drop":
        return activity.content?.pairs ? (
          <DragDropGame
            pairs={activity.content.pairs}
            config={activity.config}
          />
        ) : null;
      case "multiple_choice":
        return activity.content?.pairs ? (
          <MultipleChoiceGame
            pairs={activity.content.pairs}
            config={activity.config}
          />
        ) : null;
      default:
        return (
          <p className="text-gray-600 text-center text-xl">
            Tipo de atividade não suportado.
          </p>
        );
    }
  };

  return (
    // Layout minimalista: somente o container da atividade
    <div className="p-6 bg-gradient-to-br from-blue-50 to-green-100 min-h-screen flex flex-col items-center">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-4">
        {activity.title}
      </h1>
      <p className="text-xl text-center text-gray-700 mb-6">
        {activity.description}
      </p>
      {renderActivity()}
      {/* Se necessário, um botão para voltar para uma página pública ou home */}
      <div className="mt-8">
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}