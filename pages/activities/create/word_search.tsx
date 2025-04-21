"use client";

import { useState } from "react";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import router from "next/router";
import { useAuth } from "@/context/authContext";

const API_URL = "http://localhost:3001/activities/word_search";

const CreateActivity = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const initialValues = {
    title: "",
    description: "",
    category: "",
    type: "word_search",
    timeLimit: 5, // minutos
    rows: 10,
    columns: 10,
    words: "",
    coverImage: null as File | null,
  };

  const validationSchema = Yup.object({
    title: Yup.string().required("Título obrigatório"),
    category: Yup.string().required("Categoria obrigatória"),
    timeLimit: Yup.number()
      .min(1, "O tempo deve ser pelo menos 1 minuto")
      .required("Tempo obrigatório"),
    rows: Yup.number()
      .min(5, "Mínimo 5 linhas")
      .max(20, "Máximo 20 linhas")
      .required("Número de linhas obrigatório"),
    columns: Yup.number()
      .min(5, "Mínimo 5 colunas")
      .max(20, "Máximo 20 colunas")
      .required("Número de colunas obrigatório"),
    words: Yup.string()
      .required("Palavras obrigatórias")
      .test("min-words", "Insira pelo menos 3 palavras", (value) =>
        value ? value.split(",").length >= 3 : false
      ),
    coverImage: Yup.mixed().notRequired(),
  });

  const handleSubmit = async (values: typeof initialValues) => {
    setIsSubmitting(true);
    try {
      const { title, description, category, timeLimit, rows, columns, words, coverImage } = values;
  
      const config = JSON.stringify({
        time: timeLimit,
        rows: rows,
        cols: columns,
      });
  
      const content = JSON.stringify({
        words: words.split(",").map((word) => word.trim()),
      });
  
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description ?? "");
      formData.append("category", category);
      formData.append("type", "word_search");
      formData.append("config", config);
      formData.append("content", content);
  
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
        alert("Atividade criada com sucesso!");
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
    <div className="h-full bg-green-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/activities/activityPage" className="text-blue-500 hover:underline mb-4 inline-block">
          &larr; Voltar para Atividades
        </Link>
        <h2 className="text-2xl font-bold mb-6 text-center">Criar Caça-Palavras</h2>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ setFieldValue }) => (
            <Form className="grid grid-cols-1 gap-6 bg-white p-6 rounded-lg shadow-lg">                
              {/* Dados Básicos: Título e Categoria lado a lado */}
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
                  placeholder="Digite a descrição"
                  className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>              

              {/* Linhas, Colunas e tempo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium">Linhas</label>
                  <Field type="number" name="rows" className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  <ErrorMessage name="rows" component="p" className="text-red-500" />
                </div>
                <div>
                  <label className="block font-medium">Colunas</label>
                  <Field type="number" name="columns" className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  <ErrorMessage name="columns" component="p" className="text-red-500" />
                </div>
                <div>
                  <label className="block font-medium">Tempo limite (minutos)</label>
                  <Field type="number" name="timeLimit" className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  <ErrorMessage name="timeLimit" component="p" className="text-red-500" />
                </div>
              </div>

              {/* Palavras */}
              <div>
                <label className="block font-medium">Palavras (separadas por vírgula)</label>
                <Field
                  type="text"
                  name="words"
                  placeholder="Ex: gato, cachorro, elefante"
                  className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <ErrorMessage name="words" component="p" className="text-red-500" />
              </div>

              {/* Imagem de Capa */}
              <div>
                <label className="block font-medium">Imagem de Capa</label>
                <input
                  type="file"
                  name="coverImage"
                  accept="image/*"
                  title="Upload an image for the cover"
                  onChange={(event) => {
                    if (event.currentTarget.files) {
                      setFieldValue("coverImage", event.currentTarget.files[0]);
                    }
                  }}
                  className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <ErrorMessage name="coverImage" component="p" className="text-red-500" />
              </div>

              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded-md w-full transition-colors hover:bg-blue-600"
                disabled={isSubmitting}
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

export default CreateActivity;