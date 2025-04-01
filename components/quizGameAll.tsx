"use client";

import { useState, useEffect } from "react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuizGameProps {
  questions: QuizQuestion[];
  config?: {
    timeLimit?: number; // tempo em minutos (opcional)
  };
}

const QuizGameAll = ({ questions, config }: QuizGameProps) => {
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(questions.length).fill(""));
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    config?.timeLimit ? config.timeLimit * 60 : null
  );

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
  }, [timeRemaining, submitted]);

  const handleOptionChange = (questionIndex: number, option: string) => {
    if (submitted) return;
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = option;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (submitted) return;
    let correctCount = 0;
    questions.forEach((q, index) => {
      if (
        userAnswers[index].trim().toLowerCase() ===
        q.correctAnswer.trim().toLowerCase()
      ) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-gradient-to-br from-blue-50 to-green-100 min-h-screen">
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
      <div className="w-full max-w-3xl">
        {questions.map((q, index) => (
          <div key={index} className="mb-6 p-6 border rounded-lg shadow-lg bg-white">
            <p className="mb-4 font-semibold text-xl text-gray-800">
              {index + 1}. {q.question}
            </p>
            <div className="flex flex-col gap-3">
              {q.options.map((option, optionIndex) => {
                let optionClass = "p-3 rounded-lg text-lg cursor-pointer transition-all duration-200 border";
                
                if (submitted) {
                  if (
                    option.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
                  ) {
                    optionClass += " bg-green-500 text-white font-bold";
                  } else if (userAnswers[index] === option) {
                    optionClass += " bg-red-400 text-white";
                  } else {
                    optionClass += " bg-gray-100";
                  }
                } else {
                  // Se a opção está selecionada, destaca-a
                  if (userAnswers[index] === option) {
                    optionClass += " bg-blue-300 text-white";
                  } else {
                    optionClass += " hover:bg-blue-200 hover:scale-105 border-gray-300";
                  }
                }
                
                return (
                  <label key={optionIndex} className={optionClass}>
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={userAnswers[index] === option}
                      onChange={() => handleOptionChange(index, option)}
                      disabled={submitted}
                      className="hidden"
                    />
                    {option}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
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
            🎉 Você acertou {score} de {questions.length} perguntas.
          </p>
          <p className="text-xl font-bold text-green-700">
            🏆 Nota Final: {((score! / questions.length) * 100).toFixed(2)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizGameAll;