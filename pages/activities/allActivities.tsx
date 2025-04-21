"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Activity } from "../../utils/types"; // Importa a interface Activity
import Image from "next/image"; 
import { useAuth } from "@/context/authContext";

const API_URL = "http://localhost:3001";

export default function AllActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [quizMode, setQuizMode] = useState<"all" | "interactive">("all");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const activitiesPerPage = 9;
  const router = useRouter();
  const { user, token } = useAuth();

  useEffect(() => {
        if (!token) router.push("/");
  }, [token, router]);

  useEffect(() => {
    if (!token) return;
    const fetchActivities = async () => {
      try {        
        const res = await axios.get(`${API_URL}/activity`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        setActivities(res.data);
      } catch (error) {
        console.error("Erro ao buscar atividades", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [token]);

  // Filtra as atividades conforme categoria e tipo
  const filteredActivities = activities.filter((activity) => {
    return (
      (!filterCategory || activity.category === filterCategory) &&
      (!filterType || activity.type === filterType)
    );
  });

  // Calcula as atividades a serem exibidas na página atual
  const indexOfLast = currentPage * activitiesPerPage;
  const indexOfFirst = indexOfLast - activitiesPerPage;
  const currentActivities = filteredActivities.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredActivities.length / activitiesPerPage);
  const [accessLink, setAccessLink] = useState<string | null>(null);

  const handleActivityClick = (activity: Activity) => {
    if (activity.type === "quiz") {
      setSelectedActivity(activity);
    } else {
      router.push(`/activities/${activity.id}`);
    }
  };

  const handleUpdate = async (activity: Activity) => {
    router.push(`/activities/update/${activity.id}`);
  };

  const handleDeleteContent = async (activity: Activity) => {
    if (!window.confirm("Deseja realmente excluir essa atividade?")) {
      return;
    }
    try {      
      await axios.delete(`${API_URL}/activity/${activity.id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      // Remove a atividade da lista local
      setActivities((prev) => prev.filter((a) => a.id !== activity.id));
      router.push("/activities/allActivities");
    } catch (error) {
      console.error("Erro ao excluir atividade", error);
    }
  };  

  return (
    <div className="h-full bg-gradient-to-br from-green-100 to-blue-50 py-12 px-8">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-6">Todas as Atividades</h1>
      
      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-4 justify-center">
        <label htmlFor="filterCategory" className="sr-only bg-white">Filtrar por Categoria</label>
        <select
          id="filterCategory"
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border rounded bg-white"
        >
          <option value="">Todas as Categorias</option>
          {Array.from(new Set(activities.map((a) => a.category))).map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <label htmlFor="filterType" className="sr-only">Filtrar por Tipo</label>
        <select
          id="filterType"
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border rounded bg-white"
        >
          <option value="">Todos os Tipos</option>
          {Array.from(new Set(activities.map((a) => a.type))).map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Grid de atividades em 3 colunas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-center text-gray-700 text-xl col-span-full">Carregando atividades...</p>
        ) : currentActivities.length === 0 ? (
          <p className="text-center text-gray-700 text-xl col-span-full">Nenhuma atividade encontrada.</p>
        ) : (
          currentActivities.map((activity) => (
            <div
              key={activity.id}
              className="border bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transition-transform transform hover:scale-105"
              onClick={() => handleActivityClick(activity)}
            >
              <div className="flex justify-between">
                {/* Lado esquerdo com informações */}
                <div className="flex-1">
                  {/* Container para o título e botão de editar */}
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">{activity.title}</h3>
                   
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdate(activity);
                        }}
                        color="primary"
                        aria-label="editar atividade"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteContent(activity);
                        }}
                        color="error"
                        aria-label="excluir conteúdo"
                      >
                        <DeleteIcon />
                      </IconButton>
                                      
                  </div>
                  <p className="text-gray-600 mt-2">{activity.description}</p>
                  <p className="text-sm text-gray-500 mt-2">Categoria: {activity.category}</p>
                  <p className="text-sm text-gray-500 mt-1">Tipo: {activity.type}</p>                  
                </div>
                <Image
                  src={
                    activity.coverImage
                      ? `${API_URL}${activity.coverImage.startsWith("/") ? activity.coverImage : `/${activity.coverImage}`}`
                      : "/default-placeholder.png" // imagem local no public/
                  }
                  alt={activity.title}
                  width={168}
                  height={168}
                  className="object-cover rounded"
                />                
              </div>
            </div>
          ))
        )}
      </div>
      {/* Paginação */}
      <div className="flex justify-center items-center mt-8 gap-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
        >
          Próxima
        </button>
      </div>

      {/* Modal de escolha do modo de quiz */}
      {selectedActivity && selectedActivity.type === "quiz" && (
        <Dialog open={Boolean(selectedActivity)} onClose={() => setSelectedActivity(null)}>
          <DialogTitle>Escolha o modo do Quiz</DialogTitle>
          <DialogContent>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setQuizMode("all")}
                className={`px-6 py-3 rounded-lg shadow-md text-lg font-semibold transition-colors ${
                  quizMode === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Ver todas as questões
              </button>
              <button
                onClick={() => setQuizMode("interactive")}
                className={`px-6 py-3 rounded-lg shadow-md text-lg font-semibold transition-colors ${
                  quizMode === "interactive"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Questão a questão
              </button>
            </div>
          </DialogContent>
          <DialogActions>
            <button
              className="px-6 py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setSelectedActivity(null)}
            >
              Cancelar
            </button>
            <button
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700"
              onClick={() =>
                router.push(`/activities/${selectedActivity.id}?mode=${quizMode}`)
              }
            >
              Iniciar Quiz
            </button>
          </DialogActions>
        </Dialog>
      )}
      {/* Modal com o link de acesso */}
      <Dialog open={Boolean(accessLink)} onClose={() => setAccessLink(null)}>
        <DialogTitle>Link de Acesso</DialogTitle>
        <DialogContent>
          <p>Link de acesso:</p>
          <a
            href={accessLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            style={{ wordBreak: "break-all", display: "block", marginBottom: "8px" }}
            className="text-blue-500 underline"
          >
            {accessLink}
          </a>          
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccessLink(null)} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}