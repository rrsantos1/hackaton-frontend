"use client";

import { useState, useEffect, useMemo } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { shuffle } from "lodash";
import confetti from "canvas-confetti";

interface DragDropPair {
  word: string;
  translation: string;
  image?: string; // Optional image field
}

interface ExtendedDragDropPair extends DragDropPair {
  color: string;
}

interface DropResult {
  word: string;
  isCorrect: boolean;
}

interface DragDropGameProps {
  pairs: DragDropPair[];
  config?: {
    timeLimit?: number;
    shuffleWords?: boolean;
    shuffleTranslations?: boolean;
    useImages?: boolean;
  };
}

const getRandomColor = () => {
  const colors = [
    "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500",
    "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const DraggableWord = ({ id, children, color, image }: { id: string; children: string; color: string; image?: string; }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab px-4 py-2 text-white rounded shadow-md hover:scale-105 transition-all duration-200 w-40 h-16 flex items-center justify-center ${color} transform-gpu active:scale-95`}
      style={{ transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : "none", perspective: "1000px", boxShadow: "3px 3px 6px rgba(0,0,0,0.2)" }}
    >
      {image ? <img src={image} alt={children} className="w-full h-full object-contain" /> : children}
    </div>
  );
};

interface DroppableSlotProps {
  id: string;
  onDrop: (word: string, translation: string) => void;
  dropResult?: DropResult;
  color?: string;
  submitted: boolean;
}

const DroppableSlot = ({ id, dropResult, color, submitted }: DroppableSlotProps) => {
  const { setNodeRef } = useDroppable({ id });
  const feedbackStyle = submitted && dropResult ? (dropResult.isCorrect ? "bg-green-200 border-green-500" : "bg-red-200 border-red-500") : "";
  const feedbackIcon = submitted && dropResult ? (dropResult.isCorrect ? "✅" : "❌") : "";
    
  return (
    <div
      ref={setNodeRef}
      className={`w-40 h-16 flex flex-col items-center justify-center border-2 rounded bg-gray-100 shadow-md p-2 ${feedbackStyle}`}
    >
      <span className="text-gray-700 font-semibold">{id}</span>
      {dropResult && (
        <div className={`mt-2 px-2 py-1 text-white rounded shadow-md ${color}`}> 
          {submitted && <span className="mr-1">{feedbackIcon}</span>}
          {dropResult.word}
        </div>
      )}
    </div>
  );
};

const DragDropGame = ({ pairs, config }: DragDropGameProps) => {
  const shuffleWords = config?.shuffleWords !== false;
  const shuffleTranslations = config?.shuffleTranslations === true;
  
  // Lista com cores fixas
  const [extendedPairs, setExtendedPairs] = useState<ExtendedDragDropPair[]>([]);
  // matches guarda: chave = translation, valor = objeto com a palavra dropada e se está correta
  const [matches, setMatches] = useState<Record<string, DropResult>>({});
  // Histórico de movimentos para permitir desfazer
  const [moveHistory, setMoveHistory] = useState<{ translation: string; word: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    config?.timeLimit ? config.timeLimit * 60 : null
  );

  // Inicializa os pares com cores
  useEffect(() => {
    const baseArray = pairs.map(pair => ({
      ...pair,
      color: getRandomColor()
    }));
    setExtendedPairs(baseArray);
  }, [pairs]);

  // Computa as palavras disponíveis (não dropadas)
  const availableWords = useMemo(() => {
    const dropped = new Set(Object.values(matches).map(result => result.word));
    return extendedPairs.filter(pair => !dropped.has(pair.word));
  }, [extendedPairs, matches]);

  // Memoriza a lista de palavras para os Draggables (embaralha uma única vez)
  const wordsList = useMemo(() => {
    return shuffleWords ? shuffle([...availableWords]) : availableWords;
  }, [availableWords, shuffleWords]);

  // Memoriza a lista de slots para os Droppables (embaralha uma única vez)
  const slotsList = useMemo(() => {
    return shuffleTranslations ? shuffle([...extendedPairs]) : extendedPairs;
  }, [extendedPairs, shuffleTranslations]);

  // Timer
  useEffect(() => {
    if (timeRemaining === null || submitted) return;
    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeRemaining(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining, submitted]);

  const handleDrop = (word: string, translation: string) => {
    // Não sobrescreve se já houver um drop para esse slot
    setMatches(prev => {
      if (prev[translation]) return prev;
      const pair = extendedPairs.find(p => p.translation === translation);
      const isCorrect = pair ? (word === pair.word) : false;
      return { ...prev, [translation]: { word, isCorrect } };
    });
    // Registra no histórico o movimento
    setMoveHistory(prev => [...prev, { translation, word }]);
  };

  const handleUndo = () => {
    if (moveHistory.length === 0) return;
    const lastMove = moveHistory[moveHistory.length - 1];
    setMoveHistory(prev => prev.slice(0, -1));
    setMatches(prev => {
      const newMatches = { ...prev };
      delete newMatches[lastMove.translation];
      return newMatches;
    });
  };

  const handleRestart = () => {
    setMatches({});
    setMoveHistory([]);
    setSubmitted(false);
    setCorrectCount(null);
    // Reinicia o timer, se configurado
    if (config?.timeLimit) {
      setTimeRemaining(config.timeLimit * 60);
    }
  };

  const handleSubmit = () => {
    if (submitted) return;
    let correct = 0;
    extendedPairs.forEach(({ word, translation }) => {
      if (matches[translation]?.word === word) {
        correct++;
      }
    });
    setCorrectCount(correct);
    setSubmitted(true);
    if (correct === extendedPairs.length) {
      confetti();
    }
  };

  return (
    <DndContext onDragEnd={({ active, over }) => {
      if (active && over) handleDrop(active.id as string, over.id as string);
    }}>
      <div className="flex flex-col items-center gap-6 p-6 bg-gradient-to-br from-blue-50 to-green-100 h-full">
        {config?.timeLimit && timeRemaining !== null && !submitted && (
          <div className={`text-lg font-semibold px-4 py-2 rounded-full shadow-md ${timeRemaining > 30 ? "bg-green-400 text-white" : timeRemaining > 10 ? "bg-yellow-400 text-black" : "bg-red-500 text-white animate-pulse"}`}>
            ⏳ {timeRemaining} s restantes
          </div>
        )}

        {/* Área das palavras disponíveis */}
        <div className="grid grid-cols-5 gap-4 w-full max-w-5xl">
          {wordsList.map(pair => (
            <DraggableWord key={pair.word} id={pair.word} color={pair.color}>
              {pair.word}
            </DraggableWord>
          ))}
        </div>

        {/* Espaço entre as áreas */}
        <div className="h-8"></div>

        {/* Área dos slots de tradução */}
        <div className="grid grid-cols-5 gap-4 w-full max-w-5xl">
          {slotsList.map(pair => (
            <DroppableSlot 
              key={pair.translation} 
              id={pair.translation} 
              onDrop={handleDrop}
              dropResult={matches[pair.translation]}
              color={pair.color}
              submitted={submitted}
            />
          ))}
        </div>

        {/* Botões de controle */}
        <div className="flex gap-4 mt-6">
          <button
            className="px-6 py-3 bg-orange-500 text-white text-lg font-semibold rounded-full shadow-md hover:bg-orange-600 active:scale-95 transition-all duration-200"
            onClick={handleUndo}
            disabled={moveHistory.length === 0 || submitted}
          >
            Desfazer
          </button>
          <button
            className="px-6 py-3 bg-purple-600 text-white text-lg font-semibold rounded-full shadow-md hover:bg-purple-700 active:scale-95 transition-all duration-200"
            onClick={handleRestart}
          >
            Reiniciar
          </button>
        </div>

        {/* Botão de envio */}
        {!submitted ? (
          <button
            className="mt-6 px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-full shadow-md hover:bg-blue-700 active:scale-95 transition-all duration-200"
            onClick={handleSubmit}
          >
            ✅ Enviar Respostas
          </button>
        ) : (
          <div className="text-center mt-6">
            <p className="text-2xl font-bold text-gray-800">
              🎉 Você acertou {correctCount} de {extendedPairs.length} palavras.
            </p>
            <p className="text-xl font-bold text-green-700">
              🏆 Nota Final: {((correctCount! / extendedPairs.length) * 100).toFixed(2)}%
            </p>
          </div>
        )}
      </div>
    </DndContext>
  );
};

export default DragDropGame;