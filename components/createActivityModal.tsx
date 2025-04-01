import { Dialog, DialogTitle, DialogPanel, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import CreateActivity from "./createActivity";
import CreateQuizActivity from "./createQuizActivity";
import CreateClozeActivity from "./createClozeActivity";
import CreateDragDropActivity from "./createDragDropActivity";
import CreateMultipleChoiceActivity from "./createMultipleChoiceActivity";

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateActivityModal: React.FC<CreateActivityModalProps> = ({ isOpen, onClose }) => {
  const [selectedType, setSelectedType] = useState<string>("");

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value);
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        
        {/* Modal principal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-auto relative">
            {/* Botão de fechar */}
            <button
              onClick={onClose}
              className="absolute top-2 right-3 text-gray-500 text-2xl focus:outline-none"
            >
              &times;
            </button>

            {/* Conteúdo do modal */}
            {!selectedType ? (
              <div>
                <DialogTitle className="text-xl font-bold mb-4">
                  Selecione o tipo de atividade
                </DialogTitle>
                <select
                  value={selectedType}
                  onChange={handleTypeChange}
                  className="border p-2 rounded w-full"
                  aria-label="Tipo de atividade"
                >
                  <option value="">Selecione...</option>
                  <option value="word_search">Caça-Palavras</option>
                  <option value="quiz">Quiz</option>
                  <option value="cloze">Completar Frases</option>                  
                  <option value="drag_drop">Arrastar e Soltar</option>
                  <option value="multiple_choice">Múltipla Escolha</option>
                </select>
              </div>
            ) : (
              <div>
                {selectedType === "word_search" && <CreateActivity />}
                {selectedType === "quiz" && <CreateQuizActivity />}
                {selectedType === "cloze" && <CreateClozeActivity />}
                {selectedType === "drag_drop" && <CreateDragDropActivity />}
                {selectedType === "multiple_choice" && <CreateMultipleChoiceActivity />}
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreateActivityModal;