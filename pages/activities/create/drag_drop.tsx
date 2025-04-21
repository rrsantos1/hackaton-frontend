"use client";

import { useState } from "react";
import axios from "axios";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import router from "next/router";
import { useAuth } from "@/context/authContext";

const API_URL = "http://localhost:3001/activities/dragdrop";

const CreateDragDropActivityPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const initialValues = {
    title: "",
    description: "",
    category: "",
    type: "drag_drop",
    timeLimit: 10,
    pairs: [{ word: "", translation: "" }],
    coverImage: null as File | null,
  };

  const validationSchema = Yup.object({
    title: Yup.string().required("Título obrigatório"),
    category: Yup.string().required("Categoria obrigatória"),
    timeLimit: Yup.number()
      .min(1, "O tempo deve ser pelo menos 1 minuto")
      .required("Tempo obrigatório"),
    pairs: Yup.array()
      .of(
        Yup.object({
          word: Yup.string().required("Palavra em português obrigatória"),
          translation: Yup.string().required("Tradução obrigatória"),
        })
      )
      .min(1, "Adicione pelo menos um par de palavras"),
    coverImage: Yup.mixed().notRequired(),
  });

  const handleSubmit = async (values: typeof initialValues) => {
    setIsSubmitting(true);
    try {
      const { title, description, category, timeLimit, pairs, coverImage } = values;

      const content = {
        pairs: pairs.map((p) => ({
          word: p.word.trim(),
          translation: p.translation.trim(),
        })),
      };

      const formData = new FormData();
      formData.append("title", title);
      if (description) formData.append("description", description);
      formData.append("category", category);
      formData.append("type", "drag_drop");
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
        alert("Atividade de arrastar e soltar criada com sucesso!");
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
    <div className="dark:bg-gray-900 py-8 px-4 min-h-screen bg-green-100 w-full">
      <div className="max-w-4xl mx-auto">
        <Link href="/activities/activityPage" className="text-blue-500 hover:underline mb-4 inline-block">
          &larr; Voltar para Atividades
        </Link>
        <h2 className="text-2xl font-bold mb-6 text-center">
          Criar Atividade - Arrastar e Soltar
        </h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form className="grid grid-cols-1 gap-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
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

              {/* Seção dos Pares */}
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Pares de Palavras</h3>
                <FieldArray name="pairs">
                  {({ remove, push }) => (
                    <div className="space-y-4">
                      {values.pairs.map((_, index) => (
                        <div key={index} className="border p-4 rounded bg-white dark:bg-gray-800">
                          <div className="mb-2">
                            <label className="block font-medium mb-1">Palavra</label>
                            <Field
                              type="text"
                              name={`pairs.${index}.word`}
                              placeholder="Digite a palavra em português"
                              className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <ErrorMessage name={`pairs.${index}.word`} component="p" className="text-red-500 mt-1" />
                          </div>
                          <div className="mb-2">
                            <label className="block font-medium mb-1">Tradução</label>
                            <Field
                              type="text"
                              name={`pairs.${index}.translation`}
                              placeholder="Digite a tradução"
                              className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <ErrorMessage name={`pairs.${index}.translation`} component="p" className="text-red-500 mt-1" />
                          </div>
                          <button
                            type="button"
                            className="mt-2 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition-transform transform hover:scale-105"
                            onClick={() => remove(index)}
                          >
                            Remover Par
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-transform transform hover:scale-105"
                        onClick={() => push({ word: "", translation: "" })}
                      >
                        Adicionar Par
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

export default CreateDragDropActivityPage;