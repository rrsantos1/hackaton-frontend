"use client";

import Confetti from "react-confetti";
import { useEffect, useState } from "react";
import router from "next/router";

interface WordSearchGameProps {
  grid: string[][];
  words: string[];
  positions: { word: string; row: number; col: number; direction: string }[];
  config: { time: number; rows: number; cols: number };
}

const WordSearchGame = ({ grid, words, positions, config }: WordSearchGameProps) => {
  // Filtra as palavras que estão presentes em wordPositions
  const filteredWords = words.filter((word) =>
    (positions ?? []).some((pos) => pos.word.toLowerCase() === word.toLowerCase())
  );
  console.log("Filtered words:", filteredWords);
  
  // Config.time está em minutos; convertemos para segundos:
  const [remainingTime, setRemainingTime] = useState<number>(config.time * 60);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  // Armazena as coordenadas de todas as células pertencentes a palavras encontradas
  const [foundCells, setFoundCells] = useState<{ row: number; col: number }[]>([]);
  const [message, setMessage] = useState<string>("");
  const [selection, setSelection] = useState<{
    start: { row: number; col: number } | null;
    end: { row: number; col: number } | null;
  }>({ start: null, end: null });

  // Cronômetro: decrementa a cada segundo
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (gameStarted && !gameOver) {
      timerId = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerId);
            setGameOver(true);
            setMessage("Tempo esgotado!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [gameStarted, gameOver]);

  // Verifica se todas as palavras foram encontradas
  useEffect(() => {
    if (foundWords.length === filteredWords.length && filteredWords.length > 0) {
      setGameOver(true);
      setMessage(
        `Parabéns, você finalizou a tarefa em ${config.time * 60 - remainingTime} segundos!`
      );
    }
  }, [foundWords, filteredWords, config.time, remainingTime]);

  // Manipuladores dos eventos de seleção na grade
  const handleMouseDown = (row: number, col: number, e: React.MouseEvent) => {
    if (!gameStarted) return;
    e.preventDefault(); // impede a seleção de texto
    setSelection({ start: { row, col }, end: { row, col } });
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!gameStarted || !selection.start) return;
    setSelection((prev) => ({ ...prev, end: { row, col } }));
  };

  const handleMouseUp = () => {
    if (!selection.start || !selection.end) {
      setSelection({ start: null, end: null });
      return;
    }
    const { row: startRow, col: startCol } = selection.start;
    const { row: endRow, col: endCol } = selection.end;
    const deltaRow = endRow - startRow;
    const deltaCol = endCol - startCol;

    // Calcula os passos (direção) da seleção
    const stepRow = deltaRow === 0 ? 0 : deltaRow / Math.abs(deltaRow);
    const stepCol = deltaCol === 0 ? 0 : deltaCol / Math.abs(deltaCol);

    // Verifica se a seleção está em linha reta (horizontal, vertical ou diagonal)
    if (deltaRow !== 0 && deltaCol !== 0 && Math.abs(deltaRow) !== Math.abs(deltaCol)) {
      setSelection({ start: null, end: null });
      return;
    }

    const length = Math.max(Math.abs(deltaRow), Math.abs(deltaCol)) + 1;
    let selectedWord = "";
    const selectedCells: { row: number; col: number }[] = [];
    for (let i = 0; i < length; i++) {
      const r = startRow + stepRow * i;
      const c = startCol + stepCol * i;
      if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) break;
      selectedWord += grid[r][c];
      selectedCells.push({ row: r, col: c });
    }
    selectedWord = selectedWord.toLowerCase();

    // Verifica se a palavra selecionada corresponde a alguma palavra da lista
    const found = words.find((w) => w.toLowerCase() === selectedWord);
    if (found && !foundWords.includes(found)) {
      setFoundWords((prev) => [...prev, found]);
      setFoundCells((prev) => [...prev, ...selectedCells]);
    }
    setSelection({ start: null, end: null });
  };

  // Verifica se a célula faz parte da seleção atual
  const isCellSelected = (row: number, col: number) => {
    if (!selection.start || !selection.end) return false;
    const { row: startRow, col: startCol } = selection.start;
    const { row: endRow, col: endCol } = selection.end;
    const deltaRow = endRow - startRow;
    const deltaCol = endCol - startCol;
    const stepRow = deltaRow === 0 ? 0 : deltaRow / Math.abs(deltaRow);
    const stepCol = deltaCol === 0 ? 0 : deltaCol / Math.abs(deltaCol);
    const length = Math.max(Math.abs(deltaRow), Math.abs(deltaCol)) + 1;
    for (let i = 0; i < length; i++) {
      const r = startRow + stepRow * i;
      const c = startCol + stepCol * i;
      if (r === row && c === col) return true;
    }
    return false;
  };

  // Verifica se a célula já foi marcada como parte de uma palavra encontrada
  const isFoundCell = (row: number, col: number) => {
    return foundCells.some((cell) => cell.row === row && cell.col === col);
  };

  return (
    <div className="flex flex-col justify-center items-center gap-8">
      {/* Botão de iniciar ou cronômetro */}
      <div>
        {gameStarted ? (
          <div className="text-lg font-semibold">Tempo restante: {remainingTime} s</div>
        ) : (
          <button
            className="px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-full shadow-md hover:bg-green-700 transition-all duration-200"
            onClick={() => setGameStarted(true)}
          >
            Iniciar
          </button>
        )}
      </div>

      {/* Container da área de jogo: grade e lista de palavras */}
      <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
        {/* Grade do caça-palavras */}
        <div
          className="grid bg-white select-none"
          style={{ gridTemplateColumns: `repeat(${grid[0].length}, 30px)` }}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {grid.map((rowArr, rowIndex) =>
            rowArr.map((letter, colIndex) => {
              const isSelected = isCellSelected(rowIndex, colIndex);
              const isFound = isFoundCell(rowIndex, colIndex);
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`border border-gray-400 flex items-center justify-center w-8 h-8 text-lg font-bold ${
                    isSelected ? "bg-yellow-200" : ""
                  } ${isFound ? "bg-green-300" : ""}`}
                  onMouseDown={(e) => handleMouseDown(rowIndex, colIndex, e)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                >
                  {letter}
                </div>
              );
            })
          )}
        </div>

        {/* Lista de palavras */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Palavras</h2>
          <ul className="space-y-2">
            {filteredWords.map((word, index) => (
              <li
                key={index}
                className={`text-lg ${
                  foundWords.includes(word) ? "line-through text-green-600" : "text-gray-800"
                }`}
              >
                {word}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mensagem de finalização */}
      {gameOver && (
        <div className="relative flex flex-col items-center gap-6">
          {message.includes("Parabéns") && (
            <div className="fixed inset-0 z-50 pointer-events-none">
              <Confetti
                width={typeof window !== "undefined" ? window.innerWidth : 800}
                height={typeof window !== "undefined" ? window.innerHeight : 600}
              />
            </div>
          )}
          <div className="bg-white p-6 rounded shadow-lg text-center relative z-10">
            <p className="text-xl font-bold">{message}</p>
            <button
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => router.push("/activities/allActivities")}
            >
              Voltar para a lista
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordSearchGame;