"use client";

import { useState, useEffect, useCallback } from "react";
import Confetti from "react-confetti";

interface ClozeQuestion {
  sentence: string;
  correctAnswers: string[];
  options?: string[];
}

interface ClozeGameProps {
  questions: ClozeQuestion[];
  config?: {
    timeLimit?: number; // Tempo em minutos (opcional)
  };
}

const ClozeGame = ({ questions, config }: ClozeGameProps) => {
  const [userAnswers, setUserAnswers] = useState<string[][]>(
    questions.map((q) => Array(q.correctAnswers.length).fill(""))
  );
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    config?.timeLimit ? config.timeLimit * 60 : null
  );

  useEffect(() => {
    if (!questions || questions.length === 0) {
      console.warn("Nenhuma questão disponível.");
    }
  }, [questions]);

  const handleSubmit = useCallback(() => {
    if (submitted) return;

    let correctCount = 0;

    questions.forEach((q, index) => {
      const userResponse = userAnswers[index].map((ans) =>
        ans.trim().toLowerCase()
      );
      const correctResponse = q.correctAnswers.map((ans) =>
        ans.trim().toLowerCase()
      );
      if (JSON.stringify(userResponse) === JSON.stringify(correctResponse)) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setSubmitted(true);
  }, [submitted, questions, userAnswers]);

  useEffect(() => {
    if (timeRemaining === null || submitted) return;

    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, submitted, handleSubmit]);

  const handleInputChange = (
    questionIndex: number,
    gapIndex: number,
    value: string
  ) => {
    if (submitted) return;
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex][gapIndex] = value;
    setUserAnswers(newAnswers);
  };

  if (!questions || questions.length === 0) {
    return <p className="text-red-500">Nenhuma questão disponível.</p>;
  }

  return (
    <div className="relative flex flex-col items-center gap-6 p-6 bg-gradient-to-br from-blue-50 to-green-100 h-full">
      {/* Confetti se 100% de acertos */}
      {submitted &&
        score === questions.length &&
        typeof window !== "undefined" && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            <Confetti width={window.innerWidth} height={window.innerHeight} />
          </div>
        )}

      {/* Timer */}
      {config?.timeLimit && timeRemaining !== null && !submitted && (
        <div
          className={`text-lg font-semibold px-4 py-2 rounded-full shadow-md transition-colors ${
            timeRemaining > 30
              ? "bg-green-400 text-white"
              : timeRemaining > 10
              ? "bg-yellow-400 text-black"
              : "bg-red-500 text-white animate-pulse"
          }`}
        >
          ⏳ {timeRemaining} s restantes
        </div>
      )}

      {/* Perguntas */}
      <div className="w-full max-w-6xl">
        {questions.map((q, index) => {
          // Usa regex para dividir a sentença em qualquer sequência de underscores
          const sentenceParts = q.sentence.split(/_+/);
          return (
            <div key={index} className="mb-6 p-6 border rounded-lg shadow-lg bg-white">
              <p className="mb-4 font-semibold text-xl text-gray-800">
                {index + 1}.
              </p>
              <p className="mb-4 text-lg text-gray-700">
                {sentenceParts.map((part, gapIndex) => {
                  // Obtém a resposta digitada e a resposta correta com fallback para string vazia
                  const userAnswer = userAnswers[index][gapIndex] || "";
                  const correctAnswer = q.correctAnswers[gapIndex] || "";
                  const isCorrect =
                    submitted &&
                    userAnswer.trim().toLowerCase() ===
                      correctAnswer.trim().toLowerCase();
                  const inputClass = `inline-block min-w-[40px] border-b-2 mx-1 p-1 text-center outline-none transition-colors duration-200 ${
                    submitted
                      ? isCorrect
                        ? "bg-green-200 border-green-500"
                        : "bg-red-200 border-red-500"
                      : "border-gray-500 focus:border-blue-500"
                  }`;
                  return (
                    <span key={gapIndex} className="inline-block align-middle">
                      {part}
                      {gapIndex < q.correctAnswers.length && (
                        <>
                          <label
                            htmlFor={`input-${index}-${gapIndex}`}
                            className="sr-only"
                          >
                            Preencha a lacuna {gapIndex + 1} da frase{" "}
                            {index + 1}
                          </label>
                          <input
                            id={`input-${index}-${gapIndex}`}
                            type="text"
                            className={inputClass}
                            value={userAnswer}
                            onChange={(e) =>
                              handleInputChange(index, gapIndex, e.target.value)
                            }
                            disabled={submitted}
                          />
                        </>
                      )}
                    </span>
                  );
                })}
              </p>
            </div>
          );
        })}
      </div>

      {/* Botão de Submissão ou Resultado */}
      {!submitted ? (
        <button
          className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-full shadow-md hover:bg-blue-700 active:scale-95 transition-all duration-200"
          onClick={handleSubmit}
        >
          ✅ Enviar Respostas
        </button>
      ) : (
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">
            🎉 Você acertou {score} de {questions.length} frases.
          </p>
          <p className="text-xl font-bold text-green-700">
            🏆 Nota Final: {((score! / questions.length) * 100).toFixed(2)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default ClozeGame;