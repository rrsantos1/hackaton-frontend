"use client";

import { useState } from "react";
import axios from "axios";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import router from "next/router";
import { useAuth } from "@/context/authContext";

const API_URL = "http://localhost:3001/activities/crossword";

const CreateCrosswordActivity = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const initialValues = {
    title: "",
    description: "",
    category: "",
    type: "crossword",
    rows: 15,
    columns: 15,
    words: [{ word: "", clue: "" }],
    coverImage: null as File | null,
  };

  const validationSchema = Yup.object({
    title: Yup.string().required("Título obrigatório"),
    category: Yup.string().required("Categoria obrigatória"),
    rows: Yup.number()
      .min(5, "Mínimo 5 linhas")
      .max(20, "Máximo 20 linhas")
      .required("Número de linhas obrigatório"),
    columns: Yup.number()
      .min(5, "Mínimo 5 colunas")
      .max(20, "Máximo 20 colunas")
      .required("Número de colunas obrigatório"),
    words: Yup.array()
      .of(
        Yup.object({
          word: Yup.string().required("Palavra obrigatória"),
          clue: Yup.string().required("Dica obrigatória"),
        })
      )
      .min(3, "Insira pelo menos 3 palavras"),
    coverImage: Yup.mixed().notRequired(),
  });

  const handleSubmit = async (values: typeof initialValues) => {
    setIsSubmitting(true);
    try {
      const { title, description, category, rows, columns, words } = values;
      const config = { rows, cols: columns };
      const content = { words };

      const formData = new FormData();
      formData.append("title", title);
      if (description) formData.append("description", description);
      formData.append("category", category);
      formData.append("type", "crossword");
      formData.append("config", JSON.stringify(config));
      formData.append("content", JSON.stringify(content));
      if (values.coverImage) {
        formData.append("coverImage", values.coverImage);
      }      

      const response = await axios.post(API_URL, formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        alert("Atividade de palavras cruzadas criada com sucesso!");
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
    <div className="min-h-screen bg-green-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/activities/activityPage" className="text-blue-500 hover:underline mb-4 inline-block">
          &larr; Voltar para Atividades
        </Link>
        <h2 className="text-2xl font-bold mb-6 text-center">Criar Atividade - Palavras Cruzadas</h2>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
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

              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label className="block font-medium mb-1">Linhas</label>
                  <Field
                    type="number"
                    name="rows"
                    className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <ErrorMessage name="rows" component="p" className="text-red-500 mt-1" />
                </div>
                <div className="w-1/2">
                  <label className="block font-medium mb-1">Colunas</label>
                  <Field
                    type="number"
                    name="columns"
                    className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <ErrorMessage name="columns" component="p" className="text-red-500 mt-1" />
                </div>
              </div>

              {/* Seção de Palavras e Dicas */}
              <div>
                <label className="block font-medium mb-1">Palavras e Dicas</label>
                <FieldArray name="words">
                  {({ remove, push }) => (
                    <div className="space-y-4">
                      {values.words.map((_, index) => (
                        <div key={index} className="border p-4 rounded bg-gray-50 dark:bg-gray-700">
                          <div className="mb-2">
                            <label className="block font-medium mb-1">Palavra</label>
                            <Field
                              name={`words.${index}.word`}
                              placeholder="Digite a palavra"
                              className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <ErrorMessage name={`words.${index}.word`} component="p" className="text-red-500 mt-1" />
                          </div>
                          <div className="mb-2">
                            <label className="block font-medium mb-1">Dica</label>
                            <Field
                              name={`words.${index}.clue`}
                              placeholder="Digite a dica"
                              className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <ErrorMessage name={`words.${index}.clue`} component="p" className="text-red-500 mt-1" />
                          </div>
                          <button
                            type="button"
                            className="mt-2 bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 transition-transform transform hover:scale-105"
                            onClick={() => remove(index)}
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-transform transform hover:scale-105"
                        onClick={() => push({ word: "", clue: "" })}
                      >
                        Adicionar Palavra
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

export default CreateCrosswordActivity;