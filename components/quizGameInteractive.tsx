"use client";

import { useState, useRef } from "react";
import Confetti from "react-confetti";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuizGameProps {
  questions: QuizQuestion[];
  config?: {
    timeLimit?: number; // Tempo em minutos (opcional)
  };
}

const QuizGameInteractive = ({ questions }: QuizGameProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [showFinalResult, setShowFinalResult] = useState<boolean>(false);
  const [playConfetti, setPlayConfetti] = useState<boolean>(false);

  // Referências para os sons
  const correctSoundRef = useRef<HTMLAudioElement>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement>(null);

  // Handler para seleção da opção
  const handleOptionSelect = (option: string) => {
    // Impede nova seleção se já respondeu
    if (selectedOption !== null) return;

    setSelectedOption(option);
    const currentQuestion = questions[currentQuestionIndex];

    if (
      option.trim().toLowerCase() ===
      currentQuestion.correctAnswer.trim().toLowerCase()
    ) {
      setScore((prev) => prev + 1);
      setPlayConfetti(true);
      correctSoundRef.current?.play();
    } else {
      incorrectSoundRef.current?.play();
    }

    // Após 3 segundos, passa para a próxima questão ou finaliza o quiz
    setTimeout(() => {
      setSelectedOption(null);
      setPlayConfetti(false);
      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setShowFinalResult(true);
      }
    }, 3000);
  };

  // Renderização final após todas as questões
  if (showFinalResult) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 bg-gradient-to-br from-blue-50 to-green-50 h-full">
        <h2 className="text-4xl font-extrabold text-gray-900">Quiz Finalizado!</h2>
        <p className="text-2xl text-gray-800">
          Você acertou {score} de {questions.length} perguntas.
        </p>
        <p className="text-2xl text-green-700 font-bold">
          Nota: {((score / questions.length) * 100).toFixed(2)}%
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="relative flex flex-col items-center gap-8 p-8 bg-gradient-to-br from-purple-50 to-pink-50 h-full">
      {/* Confetti se a resposta estiver correta */}
      {playConfetti && typeof window !== "undefined" && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
          />
        </div>
      )}

      <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Questão {currentQuestionIndex + 1} de {questions.length}
        </h2>
        <p className="text-xl mb-6 text-gray-800">{currentQuestion.question}</p>
        <div className="flex flex-col gap-4">
          {currentQuestion.options.map((option, index) => {
            // Classe condicional para feedback visual
            let optionClass =
              "p-4 border rounded-lg text-lg cursor-pointer transition-all duration-200";
            if (selectedOption !== null) {
              if (
                option.trim().toLowerCase() ===
                currentQuestion.correctAnswer.trim().toLowerCase()
              ) {
                optionClass += " bg-green-500 text-white font-bold";
              } else if (option === selectedOption) {
                optionClass += " bg-red-500 text-white";
              } else {
                optionClass += " bg-gray-100";
              }
            } else {
              optionClass += " hover:bg-blue-200 hover:scale-105 border-gray-300";
            }

            return (
              <div
                key={index}
                onClick={() => handleOptionSelect(option)}
                className={optionClass}
              >
                {option}
              </div>
            );
          })}
        </div>
      </div>

      {/* Elementos de áudio */}
      <audio ref={correctSoundRef} src="/sounds/correct.mp3" preload="auto" />
      <audio ref={incorrectSoundRef} src="/sounds/incorrect.mp3" preload="auto" />
    </div>
  );
};

export default QuizGameInteractive;