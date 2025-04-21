// pages/activities/createMenu.tsx
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { 
  FaSearch, 
  FaPuzzlePiece, 
  FaQuestionCircle, 
  FaAlignJustify, 
  FaArrowsAlt,
  FaListAlt,
  FaSort
} from "react-icons/fa";
import { useAuth } from "@/context/authContext";

const activityOptions = [
  {
    type: "word_search",
    name: "Caça-Palavras",
    description: "Crie atividades de caça-palavras para encontrar termos escondidos.",
    icon: <FaSearch size={40} className="text-blue-500" />,
  },
  {
    type: "crossword",
    name: "Palavra Cruzada",
    description: "Configure palavras cruzadas desafiadoras com dicas interativas.",
    icon: <FaPuzzlePiece size={40} className="text-green-500" />,
  },
  {
    type: "quiz",
    name: "Quiz",
    description: "Elabore quizzes para testar conhecimentos de forma dinâmica.",
    icon: <FaQuestionCircle size={40} className="text-red-500" />,
  },
  {
    type: "cloze",
    name: "Completar Frases",
    description: "Desafie os usuários a completar frases com lacunas.",
    icon: <FaAlignJustify size={40} className="text-purple-500" />,
  },
  {
    type: "drag_drop",
    name: "Arrastar e Soltar",
    description: "Crie atividades interativas onde itens são arrastados para suas posições.",
    icon: <FaArrowsAlt size={40} className="text-orange-500" />,
  },
  {
    type: "multiple_choice",
    name: "Múltipla Escolha",
    description: "Crie atividades onde o usuário pode escolher a alternativa correta dentre várias opções.",
    icon: <FaListAlt size={40} className="text-teal-500" />,
  },
  {
    type: "sentence_order",
    name: "Ordenar Frase",
    description: "Monte a sequência correta de palavras ou frases.",
    icon: <FaSort size={40} className="text-indigo-500" />,
  },
];

const CreateActivityMenu = () => {
  const router = useRouter();
  const { token } = useAuth();
  
  useEffect(() => {
      if (!token) router.push("/");
  }, [token, router]);

  const handleOptionClick = (type: string) => {
    router.push(`/activities/create/${type}`);
  };

  return (
    <div className="h-full bg-green-100 w-full py-12 px-8">
      <div className="max-w mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Escolha o Tipo de Atividade</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {activityOptions.map((option) => (
            <div
              key={option.type}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:bg-gray-100 transition-colors flex flex-col items-center hover:scale-105"
              onClick={() => handleOptionClick(option.type)}
            >
              <div className="mb-4">{option.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{option.name}</h3>
              <p className="text-gray-600 text-center">
                {option.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreateActivityMenu;