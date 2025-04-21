// components/CrosswordGame.tsx
import { useState } from "react";
import Confetti from "react-confetti";

interface CrosswordClue {
  word: string;
  clue: string;
  row: number;
  col: number;
  direction: "across" | "down";
  number: number;
}

interface CrosswordGameProps {
  grid: string[][];
  clues: CrosswordClue[];
  config: { rows: number; cols: number };
}

const CrosswordGame = ({ grid, clues }: CrosswordGameProps) => {
  // Função para identificar as linhas/colunas mínimas e máximas que possuem letras
  const getTrimmedGrid = () => {
    let minRow = grid.length, maxRow = -1, minCol = grid[0].length, maxCol = -1;
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c] !== " ") {
          if (r < minRow) minRow = r;
          if (r > maxRow) maxRow = r;
          if (c < minCol) minCol = c;
          if (c > maxCol) maxCol = c;
        }
      }
    }
    // Se não houver letras, retorna o grid original
    if (maxRow === -1) return { trimmedGrid: grid, offset: { row: 0, col: 0 } };
    const trimmedGrid = grid.slice(minRow, maxRow + 1).map(row => row.slice(minCol, maxCol + 1));
    const offset = { row: minRow, col: minCol };
    return { trimmedGrid, offset };
  };

  // Obter grid trimado e offset
  const { trimmedGrid, offset } = getTrimmedGrid();

  // Estado para armazenar as letras digitadas pelo usuário no grid trimado
  const [userGrid, setUserGrid] = useState<string[][]>(
    Array.from({ length: trimmedGrid.length }, () => Array(trimmedGrid[0].length).fill(""))
  );
  const [message, setMessage] = useState<string>("");

  // Ajustar as pistas para que suas coordenadas correspondam ao grid trimado
  const adjustedClues = clues
    .map(clue => ({
      ...clue,
      row: clue.row - offset.row,
      col: clue.col - offset.col,
    }))
    .filter(
      clue =>
        clue.row >= 0 &&
        clue.row < trimmedGrid.length &&
        clue.col >= 0 &&
        clue.col < trimmedGrid[0].length
    );

  const acrossClues = adjustedClues.filter(clue => clue.direction === "across");
  const downClues = adjustedClues.filter(clue => clue.direction === "down");

  // Atualiza o valor da célula conforme o usuário digita
  const handleChange = (row: number, col: number, value: string) => {
    if (value.length > 1) return;
    const updatedGrid = [...userGrid];
    updatedGrid[row] = [...userGrid[row]];
    updatedGrid[row][col] = value.toUpperCase();
    setUserGrid(updatedGrid);
  };

  // Verifica se a solução preenchida pelo usuário está correta
  const checkSolution = () => {
    let correct = true;
    for (let r = 0; r < trimmedGrid.length; r++) {
      for (let c = 0; c < trimmedGrid[0].length; c++) {
        if (trimmedGrid[r][c] !== " " && userGrid[r][c] !== trimmedGrid[r][c].toUpperCase()) {
          correct = false;
          break;
        }
      }
      if (!correct) break;
    }
    setMessage(correct ? "Parabéns, você completou o puzzle!" : "Algumas letras estão incorretas.");
  };

  return (
    <div className="relative flex flex-col items-center gap-8 p-6">
      {/* Confetti em caso de sucesso */}
      {message.includes("Parabéns") && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti
            width={typeof window !== "undefined" ? window.innerWidth : 800}
            height={typeof window !== "undefined" ? window.innerHeight : 600}
          />
        </div>
      )}

      <div className="mb-6">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200"
          onClick={checkSolution}
        >
          Verificar Respostas
        </button>
        {message && <p className="mt-4 text-xl font-bold">{message}</p>}
      </div>

      {/* Renderiza o grid trimado */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${trimmedGrid[0].length}, 50px)` }}
      >
        {trimmedGrid.map((rowArr, rowIndex) =>
          rowArr.map((cell, colIndex) => {
            if (cell === " ") {
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="w-12 h-12 bg-gray-300 border border-gray-400"
                ></div>
              );
            } else {
              return (
                <div key={`${rowIndex}-${colIndex}`} className="relative">
                  <input
                    type="text"
                    maxLength={1}
                    value={userGrid[rowIndex][colIndex]}
                    onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
                    className="w-12 h-12 text-center border border-gray-400 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title={`Cell at row ${rowIndex + offset.row + 1}, column ${colIndex + offset.col + 1}`}
                  />
                  {(() => {
                    const cellClues = adjustedClues.filter(
                      (clue) => clue.row === rowIndex && clue.col === colIndex
                    );
                    if (cellClues.length > 0) {
                      const numberToShow = cellClues.every(
                        (c) => c.number === cellClues[0].number
                      )
                        ? cellClues[0].number
                        : cellClues.map((c) => c.number).join(",");
                      return (
                        <span className="absolute top-0 left-0 text-[0.65rem] text-black bg-white rounded-full px-1">
                          {numberToShow}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
              );
            }
          })
        )}
      </div>

      {/* Pistas */}
      <div className="w-full mt-8 flex gap-8">
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-3 text-gray-800">Horizontal</h3>
          <ul className="list-disc list-inside text-lg text-gray-700">
            {acrossClues.map(clue => (
              <li key={`${clue.number}-across`}>
                <span className="font-semibold">{clue.number}:</span> {clue.clue}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-3 text-gray-800">Vertical</h3>
          <ul className="list-disc list-inside text-lg text-gray-700">
            {downClues.map(clue => (
              <li key={`${clue.number}-down`}>
                <span className="font-semibold">{clue.number}:</span> {clue.clue}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CrosswordGame;