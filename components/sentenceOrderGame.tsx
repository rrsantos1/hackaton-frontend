"use client";
import { useState, useEffect, useRef } from "react";
import { shuffle } from "lodash";
import confetti from "canvas-confetti";

interface SentenceOrderGameProps {
  questions: string[];
  config?: {
    timeLimit?: number;
    bonusFastFinish?: number;
  };
}

const SentenceOrderGame: React.FC<SentenceOrderGameProps> = ({ questions, config }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [originalWords, setOriginalWords] = useState<string[]>([]);
  const [currentOrder, setCurrentOrder] = useState<string[]>([]);
  const [points, setPoints] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  const [revealed, setRevealed] = useState(false);
  const [showPointsFeedback, setShowPointsFeedback] = useState(false);
  const [wordResults, setWordResults] = useState<number[]>([]);
  const [perfects, setPerfects] = useState<boolean[]>([]);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [perfectThisRound, setPerfectThisRound] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [showFinalPerfect, setShowFinalPerfect] = useState(false);
  const [answeredOnce, setAnsweredOnce] = useState(false);
  const [wasPerfectFirstTry, setWasPerfectFirstTry] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && !gameFinished) {
      timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameFinished]);

  useEffect(() => {
    if (gameStarted && currentSentenceIndex < questions.length) {
      const sentence = questions[currentSentenceIndex];
      const match = sentence.match(/^(.+?)([.!?])?$/); // separa pontuação final
      const sentenceWithoutPunctuation = match?.[1] ?? sentence;
      const punctuation = match?.[2] ?? "";

      const words = sentenceWithoutPunctuation.split(" ").map(w => w.trim()).filter(Boolean);
      const shuffledWords = shuffle(words);

      setOriginalWords(punctuation ? [...words, punctuation] : words);
      setCurrentOrder(punctuation ? [...shuffledWords, punctuation] : shuffledWords);

      setRevealed(false);
      setShowPointsFeedback(false);
      setPerfectThisRound(false);
      setDraggingIndex(null);
      setAnsweredOnce(false);
      setWasPerfectFirstTry(false);
    }
  }, [gameStarted, currentSentenceIndex, questions]);

  const handleStart = () => {
    setGameStarted(true);
    setCurrentSentenceIndex(0);
    setElapsedTime(0);
    setPoints(0);
    setPerfects([]);
  };

  const handleDragStart = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = (targetIndex: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === targetIndex) return;
    const newOrder = [...currentOrder];
    const [draggedItem] = newOrder.splice(draggingIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);
    setCurrentOrder(newOrder);
    setDraggingIndex(targetIndex);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  const getWordColor = (index: number): string => {
    if (!revealed) return "black";
    if (index >= wordResults.length) return "black"; // pontuação final
    return wordResults[index] === 1 ? "green" : "red";
  };  

  const getWordPointsLabel = (index: number): string => {
    if (!showPointsFeedback || index >= wordResults.length) return "";
    const diff = wordResults[index];
    return diff > 0 ? "+1" : "-1";
  };  

  const checkSentence = () => {  
    const comparisonLength = originalWords.length - ([".", "!", "?"].includes(originalWords.at(-1) ?? "") ? 1 : 0);
    const results = currentOrder.slice(0, comparisonLength).map((word, idx) =>
        word === originalWords[idx] ? 1 : -1
    );

    const correctCount = results.filter(x => x === 1).length;
    const isPerfect = correctCount === comparisonLength;
  
    const isFirstTry = !answeredOnce;
  
    setRevealed(true);
    setWordResults(results);
  
    if (isPerfect) {
      setPerfectThisRound(isFirstTry);
      if (isFirstTry) {
        confetti();
        setWasPerfectFirstTry(true);
      }
  
      if (isFirstTry) {
        const earned = results.reduce((acc, r) => acc + (r === 1 ? 1 : -1), 0) + (isPerfect ? 5 : 0);
        setPoints(prev => prev + earned);
        setShowPointsFeedback(true);
      }
  
      setTimeout(() => {
        setShowPointsFeedback(false);
        setRevealed(false);
  
        setPerfects(prev => [...prev, isFirstTry]);
  
        if (currentSentenceIndex < questions.length - 1) {
          setCurrentSentenceIndex(prev => prev + 1);
        } else {
          setGameFinished(true);
          const allPerfect = [...perfects, isFirstTry].every(Boolean);
          if (allPerfect) {
            setShowFinalPerfect(true);
          }
          const timeLimitSec = config?.timeLimit ? config.timeLimit * 60 : 300;
          if (elapsedTime < timeLimitSec) {
            setPoints(prev => prev + (config?.bonusFastFinish ?? 10));
          }
        }
      }, 2000);
    } else {
        // Mesmo se errar, ganhar pontos pelas palavras corretas na primeira tentativa
        if (isFirstTry) {
          const earned = results.filter(r => r === 1).length;
          setPoints(prev => prev + earned);
          setShowPointsFeedback(true);
    
          setTimeout(() => {
            setShowPointsFeedback(false);
            setRevealed(false);
          }, 1000);
        } else {
          setTimeout(() => {
            setRevealed(false);
          }, 1000);
        }
    }    
  
    setAnsweredOnce(true);
  };    

  const handleRestart = () => {
    setGameStarted(false);
    setCurrentSentenceIndex(0);
    setCurrentOrder([]);
    setPoints(0);
    setElapsedTime(0);
    setGameFinished(false);
    setRevealed(false);
    setDraggingIndex(null);
    setPerfects([]);
    setShowFinalPerfect(false);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-orange-100 h-full gap-8 relative">
      {showFinalPerfect && (
        <div className="absolute top-10 text-5xl font-extrabold text-yellow-500 animate-pulse z-50">
          Muito bem!
        </div>
      )}

      {!gameStarted ? (
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold">Atividade: Ordene as Palavras</h1>
          <button
            className="px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-full shadow-md hover:bg-green-700 transition-all duration-200"
            onClick={handleStart}
          >
            Iniciar
          </button>
        </div>
      ) : gameFinished ? (
        <div className="flex flex-col items-center gap-4 w-full">
          <h2 className="text-3xl font-bold">Resultado</h2>
          <div className="text-xl">Pontuação: {points}</div>
          <div className="text-xl">Tempo Total: {elapsedTime} s</div>
          <button
            className="mt-6 px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-full shadow-md hover:bg-blue-700 transition-all duration-200"
            onClick={handleRestart}
          >
            Reiniciar
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between w-full max-w-2xl">
            <div className="text-lg font-semibold">Tempo: {elapsedTime} s</div>
            <div className="text-lg font-semibold">Pontuação: {points}</div>
          </div>
          <div className="text-xl font-bold">Monte a frase corretamente</div>

          <div ref={containerRef} className="flex flex-row flex-wrap gap-8 justify-center max-w-4xl">
            {currentOrder.map((word, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(index, e)}
                onDragEnter={(e) => handleDragEnter(index, e)}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                className="relative text-3xl font-semibold select-none cursor-move transition-all duration-200"
                style={{ color: getWordColor(index) }}
              >
                {word}
                {showPointsFeedback && (
                  <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-bold ${wordResults[index] > 0 ? "text-green-600" : "text-red-600"}`}>
                    {getWordPointsLabel(index)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {perfectThisRound && answeredOnce && wasPerfectFirstTry && (
            <div className="text-2xl font-bold text-green-600 animate-pulse mt-4">Perfect!</div>
          )}

          {!revealed && (
            <button
              className="mt-6 px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-full shadow-md hover:bg-green-700 transition-all duration-200"
              onClick={checkSentence}
            >
              Confirmar Frase
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default SentenceOrderGame;