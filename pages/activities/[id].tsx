"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import WordSearchGame from "../../components/wordsearchGame";
import QuizGameAll from "../../components/quizGameAll";
import QuizGameInteractive from "../../components/quizGameInteractive";
import ClozeGame from "../../components/clozeGame";
import DragDropGame from "../../components/dragDropGame";
import MultipleChoiceGame from "@/components/multipleChoiceGame";

// Define as interfaces para as questões de quiz e cloze
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

// Atualize a interface base para o content para incluir pairs para dragdrop
interface ActivityContentBase {
  words?: string[];
  grid?: string[][];
  wordPositions?: { word: string; row: number; col: number; direction: string }[];
  clues?: { word: string; clue: string; row: number; col: number; direction: "across" | "down"; number: number }[];
  pairs?: { word: string; translation: string }[]; // Adicionado para drag_drop
}

// O content pode conter questões de quiz ou de cloze:
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

const API_URL = "http://localhost:3001";

const ActivityDetail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  // Obtém o id da URL (definido no arquivo [id].tsx)
  const id = params?.id ?? null;
  // Obtém o modo do quiz da URL, com valor padrão "all"
  const quizModeFromUrl = searchParams.get("mode") ?? "all";

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      console.error("ID não foi fornecido.");
      setError("ID da atividade não foi fornecido.");
      setLoading(false);
      return;
    }
  
    const fetchActivity = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/activity/${id}`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        setActivity(res.data);
        console.log("Atividade ID:", res.data);
      } catch (err) {
        console.error("Erro ao carregar a atividade:", err);
        setError("Erro ao carregar a atividade.");
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [id]);

  if (loading)
    return (
      <p className="text-center mt-10 text-xl font-medium">Carregando...</p>
    );
  if (error)
    return (
      <p className="text-center text-red-500 mt-10 text-xl font-medium">
        {error}
      </p>
    );
  if (!activity)
    return (
      <p className="text-center mt-10 text-xl font-medium">
        Atividade não encontrada.
      </p>
    );

  // Para word_search e crossword, definimos um objeto config com valores padrão
  const gridConfig = {
    time: activity.config?.time ?? 60, // tempo padrão de 60 segundos
    rows: activity.config?.rows ?? 10,
    cols: activity.config?.cols ?? 10,
  };

  return (
    <div className="p-8 bg-gradient-to-br from-green-100 to-blue-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-4">
        {activity.title}
      </h1>
      <p className="text-xl text-center text-gray-700 mb-6">
        {activity.description}
      </p>
  
      {activity.type === "word_search" && activity.content && activity.config ? (
        <WordSearchGame
          grid={activity.content.grid!}
          words={activity.content.words!}
          positions={activity.content.wordPositions!}
          config={gridConfig}
        />
      ) : activity.type === "quiz" && activity.content && activity.content.questions ? (
        quizModeFromUrl === "interactive" ? (
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
      ) : activity.type === "cloze" && activity.content?.questions ? (
        <ClozeGame
          questions={activity.content.questions as ClozeQuestion[]}
          config={activity.config}
        />
      ) : activity.type === "drag_drop" && activity.content?.pairs ? (
        <DragDropGame
          pairs={activity.content.pairs}
          config={activity.config}
        />
      ) : activity.type === "multiple_choice" && activity.content?.pairs ? (
        <MultipleChoiceGame
          pairs={activity.content.pairs}
          config={activity.config}
        />
      ) : (
        <p className="text-gray-600 text-center text-xl">
          Tipo de atividade não suportado.
        </p>
      )}
      
      {/* Botão para voltar para a lista */}
      <div className="mt-8 text-center">
        <button
          onClick={() => router.push("/activities/allActivities")}
          className="px-6 py-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          Voltar para a lista
        </button>
      </div>
    </div>
  );
};

export default ActivityDetail;