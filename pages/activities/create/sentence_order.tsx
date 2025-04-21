"use client";

import { useState } from "react";
import axios from "axios";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import router from "next/router";
import { useAuth } from "@/context/authContext";

const API_URL = "http://localhost:3001/activities/sentence_order";

interface FormValues {
  title: string;
  description: string;
  category: string;
  type: string;
  timeLimit: number;
  questions: { question: string }[];
  coverImage: File | null;
}

const CreateSentenceOrderActivity = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const initialValues: FormValues = {
    title: "",
    description: "",
    category: "",
    type: "sentence_order",
    timeLimit: 10,
    questions: [{ question: "" }],
    coverImage: null,
  };

  const validationSchema = Yup.object({
    title: Yup.string().required("Título obrigatório"),
    category: Yup.string().required("Categoria obrigatória"),
    timeLimit: Yup.number()
      .min(1, "O tempo deve ser pelo menos 1 minuto")
      .required("Tempo obrigatório"),
    questions: Yup.array()
      .of(
        Yup.object({
          question: Yup.string().required("A frase é obrigatória"),
        })
      )
      .min(1, "Adicione pelo menos uma frase"),
    coverImage: Yup.mixed().notRequired(),
  });

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const { title, description, category, timeLimit, questions, coverImage } = values;
      const content = {
        questions: questions.map((q) => q.question.trim()),
        scoring: {
          pointPerWord: 1,
          bonusFullSentence: 5,
          bonusFastFinish: 10,
          timeLimitForBonus: 5,
        },
        uiSettings: {
          startButton: true,
          resetButton: true,
          backButton: true,
          animation: {
            confetti: true,
            blinkingPerfect: true,
          },
        },
      };

      const formData = new FormData();
      formData.append("title", title);
      if (description) formData.append("description", description);
      formData.append("category", category);
      formData.append("type", "sentence_order");
      formData.append("config", JSON.stringify({ timeLimit }));
      formData.append("content", JSON.stringify(content));
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }
      
      const response = await axios.post(API_URL, formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        alert("Atividade de ordenação de palavras criada com sucesso!");
        router.push("/activities/activityPage");
      } else {
        alert("Erro ao criar atividade. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao criar atividade:", error);
      alert("Erro ao criar atividade. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/activities" className="text-blue-500 hover:underline mb-4 inline-block">
          &larr; Voltar para Atividades
        </Link>
        <h2 className="text-2xl font-bold mb-6 text-center">Criar Atividade - Ordenação de Palavras</h2>

        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ values, setFieldValue }) => (
            <Form className="grid grid-cols-1 gap-6 bg-white  p-6 rounded-lg shadow-lg">
              {/* Dados Básicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Título</label>
                  <Field
                    type="text"
                    name="title"
                    placeholder="Digite o título"
                    className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <ErrorMessage name="title" component="p" className="text-red-500 mt-1" />
                </div>

                <div>
                  <label className="block font-medium mb-1">Categoria</label>
                  <Field
                    type="text"
                    name="category"
                    placeholder="Digite a categoria"
                    className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <ErrorMessage name="category" component="p" className="text-red-500 mt-1" />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Descrição</label>
                <Field
                  as="textarea"
                  name="description"
                  placeholder="Digite a descrição (opcional)"
                  className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Tempo limite (minutos)</label>
                  <Field
                    type="number"
                    name="timeLimit"
                    className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <ErrorMessage name="timeLimit" component="p" className="text-red-500 mt-1" />
                </div>
              </div>

              {/* Seção de Frases */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Frases</h3>
                <FieldArray name="questions">
                  {({ remove, push }) => (
                    <div className="space-y-4">
                      {values.questions.map((_, index) => (
                        <div key={index} className="border p-4 rounded bg-white ">
                          <div className="mb-2">
                            <label className="block font-medium mb-1">Frase</label>
                            <Field
                              type="text"
                              name={`questions.${index}.question`}
                              placeholder="Ex.: O sol nasce no leste"
                              className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <ErrorMessage name={`questions.${index}.question`} component="p" className="text-red-500 mt-1" />
                          </div>
                          <button
                            type="button"
                            className="mt-2 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition-transform transform hover:scale-105"
                            onClick={() => remove(index)}
                          >
                            Remover Frase
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-transform transform hover:scale-105"
                        onClick={() => push({ question: "" })}
                      >
                        Adicionar Frase
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Upload da Imagem de Capa */}
              <div className="flex flex-col">
                <label className="block font-medium mb-1">Imagem de Capa (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  title="Selecione uma imagem de capa"
                  onChange={(event) => {
                    if (event.currentTarget.files) {
                      setFieldValue("coverImage", event.currentTarget.files[0]);
                    }
                  }}
                />
                <ErrorMessage name="coverImage" component="p" className="text-red-500 mt-1" />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
              >
                {isSubmitting ? "Criando..." : "Criar Atividade"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateSentenceOrderActivity;