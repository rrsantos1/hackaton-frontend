"use client";
import { useState, useEffect } from "react";
import { shuffle } from "lodash";
import confetti from "canvas-confetti";

interface DragDropPair {
  word: string;
  translation: string;
  image?: string;
}

interface MultipleChoiceGameProps {
  pairs: DragDropPair[];
  config?: {
    timeLimit?: number;
    shuffleQuestions?: boolean;
    useImages?: boolean;
  };
}

interface Choice {
  word: string;
  chosen: string;
  isCorrect: boolean;
}

const availableAnimations = [
  "animate-jump-in",
  "animate-rotate-x",
  "animate-rotate-y",
  "animate-shake",
  "animate-wiggle"
];

const getRandomAnimation = () => {
  return availableAnimations[Math.floor(Math.random() * availableAnimations.length)];
};

const MultipleChoiceGame: React.FC<MultipleChoiceGameProps> = ({ pairs, config }) => {  

  // Estados do jogo
  const [gameStarted, setGameStarted] = useState(false);
  const [questions, setQuestions] = useState<DragDropPair[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [availableTranslations, setAvailableTranslations] = useState<{ translation: string; color: string }[]>([]);
  const [lastSelected, setLastSelected] = useState<{ translation: string; isCorrect: boolean } | null>(null);
  const [lives, setLives] = useState(3);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [animateClass, setAnimateClass] = useState(getRandomAnimation());

  // Efeito para inicializar as perguntas e opções
  useEffect(() => {
    let qs = [...pairs];
    if (config?.shuffleQuestions) {
      qs = shuffle(qs);
    }
    setQuestions(qs);
    const colors = [
      "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500",
      "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500",
      "bg-cyan-500", "bg-rose-500", "bg-lime-500", "bg-amber-500",
      "bg-orange-500", "bg-emerald-500", "bg-violet-500", "bg-fuchsia-500"
    ];
    const opts = qs.map(q => ({
      translation: q.translation,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setAvailableTranslations(shuffle(opts));
  }, [pairs, config?.shuffleQuestions]);

  // Timer do jogo
  useEffect(() => {
    if (!gameStarted || gameFinished) return;
    const timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [gameStarted, gameFinished]);

  // Verifica se o jogo terminou
  useEffect(() => {
    if (gameStarted && questions.length === 0) {
      setGameFinished(true);
      if (choices.filter(c => c.isCorrect).length === pairs.length) {
        confetti();
      }
    }
  }, [gameStarted, questions, pairs.length, choices]);

  // Função para tratar escolha do usuário
  const handleChoice = (selectedTranslation: string) => {
    if (gameFinished || !questions[currentIndex]) return;
    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedTranslation === currentQuestion.translation;
    setLastSelected({ translation: selectedTranslation, isCorrect });
    setAnimateClass("animate-wiggle");
    const newChoice = { word: currentQuestion.word, chosen: selectedTranslation, isCorrect };
    setChoices(prev => [...prev, newChoice]);
    setTimeout(() => {
      setLastSelected(null);
      setAnimateClass(getRandomAnimation());
      if (isCorrect) {
        setQuestions(prev => prev.filter((_, i) => i !== currentIndex));
      } else {
        setLives(prev => prev - 1);
        if (lives - 1 <= 0) {
          setGameFinished(true);
          return;
        }
        setQuestions(prev => {
          const q = prev[currentIndex];
          const newQuestions = [...prev];
          newQuestions.splice(currentIndex, 1);
          newQuestions.push(q);
          return newQuestions;
        });
      }
      setCurrentIndex(prev => (prev >= questions.length - 1 ? 0 : prev));
    }, 1000);
  };

  const handleStart = () => {
    setGameStarted(true);
  };

  const handleRestart = () => {
    setGameStarted(false);
    setCurrentIndex(0);
    setChoices([]);
    setLives(3);
    setElapsedTime(0);
    setGameFinished(false);
    setLastSelected(null);
    setAnimateClass(getRandomAnimation());
    let qs = [...pairs];
    if (config?.shuffleQuestions) {
      qs = shuffle(qs);
    }
    setQuestions(qs);
    const colors = [
      "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500",
      "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500",
      "bg-cyan-500", "bg-rose-500", "bg-lime-500", "bg-amber-500",
      "bg-orange-500", "bg-emerald-500", "bg-violet-500", "bg-fuchsia-500"
    ];
    const opts = qs.map(q => ({
      translation: q.translation,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setAvailableTranslations(shuffle(opts));
  };    

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-green-100 h-full gap-8">
      
      {!gameStarted ? (
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold">Bem-vindo ao Jogo de Múltiplas escolhas</h1>
          <button
            className="px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-full shadow-md hover:bg-green-700 transition-all duration-200"
            onClick={handleStart}
          >
            Iniciar
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between w-full max-w-2xl">
            <div className="text-lg font-semibold">Tempo: {elapsedTime} s</div>
            <div className="text-lg font-semibold">Chances: {lives}</div>
          </div>
          {!gameFinished ? (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="text-xl font-bold">Selecione a tradução correta</div>
              <div className={`text-4xl font-bold p-6 bg-white rounded shadow-lg ${animateClass}`}>
                {config?.useImages && questions[currentIndex]?.image ? (
                  <img src={questions[currentIndex].image} alt={questions[currentIndex].word} className="w-40 h-16 object-contain" />
                ) : (
                  questions[currentIndex]?.word
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {availableTranslations.map((item, index) => (
                  <button
                    key={index}
                    className={`w-40 h-16 flex items-center justify-center rounded shadow-md text-white ${item.color} hover:scale-105 transition-transform duration-200`}
                    onClick={() => handleChoice(item.translation)}
                  >
                    {item.translation}
                    {lastSelected?.translation === item.translation && (
                      <span className="ml-2">{lastSelected.isCorrect ? "✅" : "❌"}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full">
              <h2 className="text-3xl font-bold">Resultados</h2>
              <div className="w-full max-w-2xl bg-white rounded shadow-lg p-4">
                {choices.map((choice, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b py-2">
                    <span className="font-semibold">{choice.word}</span>
                    <span>{choice.chosen}</span>
                    <span className={choice.isCorrect ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                      {choice.isCorrect ? "✅" : "❌"}
                    </span>
                  </div>
                ))}
              </div>
              {/*
                Calcula o número total de tentativas e o número de acertos.
                Nota final: (acertos / totalTentativas) * 100
              */}
              {(() => {
                const totalAttempts = choices.length;
                const correctCount = choices.filter(c => c.isCorrect).length;
                const finalPercentage = totalAttempts ? ((correctCount / totalAttempts) * 100).toFixed(2) : "0.00";
                return (
                  <>
                    <div className="text-2xl font-bold mt-4">
                      Você acertou as {correctCount} expressões em {totalAttempts} tentativas!
                    </div>
                    <div className="text-lg font-semibold">
                      Nota Final: {finalPercentage}%
                    </div>
                  </>
                );
              })()}
              <div className="text-lg font-semibold">Tempo total: {elapsedTime} s</div>
              <button
                className="mt-6 px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-full shadow-md hover:bg-blue-700 active:scale-95 transition-all duration-200"
                onClick={handleRestart}
              >
                Reiniciar
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MultipleChoiceGame;