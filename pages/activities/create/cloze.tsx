// pages/activities/create/cloze.tsx
import { useState } from "react";
import axios from "axios";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import router from "next/router";
import { useAuth } from "@/context/authContext";

const API_URL = "http://localhost:3001/activities/cloze";

const CreateClozeActivityPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const initialValues = {
    title: "",
    description: "",
    category: "",
    type: "cloze",
    timeLimit: 10,
    shuffleQuestions: false,
    questions: [
      {
        question: "",
        correctAnswer: "", // respostas separadas por vírgula
        options: "", // opções separadas por vírgula
      },
    ],
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
          question: Yup.string().required("Frase obrigatória"),
          correctAnswer: Yup.string()
            .required("Informe pelo menos uma resposta correta")
            .test(
              "min-answers",
              "Informe pelo menos uma resposta, separadas por vírgula",
              (value) =>
                value
                  ? value.split(",").filter((s) => s.trim() !== "").length >= 1
                  : false
            ),
          options: Yup.string().optional(),
        })
      )
      .min(1, "Adicione pelo menos uma pergunta"),
    coverImage: Yup.mixed().notRequired(),
  });

  const handleSubmit = async (values: typeof initialValues) => {
    setIsSubmitting(true);
    try {
      const { title, description, category, timeLimit, shuffleQuestions, questions, coverImage } = values;

      const config = { timeLimit, shuffleQuestions };
      const content = {
        questions: questions.map((q) => ({
          question: q.question,
          correctAnswer: q.correctAnswer.split(",").map((ans) => ans.trim()).filter((ans) => ans !== ""),
          options: q.options
            ? q.options.split(",").map((opt) => opt.trim()).filter((opt) => opt !== "")
            : [],
        })),
      };      

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("type", "cloze");
      formData.append("config", JSON.stringify(config));
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
        alert("Atividade de completar frases criada com sucesso!");
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
    <div className="min-h-screen bg-green-100 dark:bg-gray-900 w-full py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/activities/activityPage" className="text-blue-500 hover:underline mb-4 inline-block">
            &larr; Voltar para Atividades
        </Link>
        <h2 className="text-2xl font-bold mb-6 text-center">Criar Atividade - Completar Frases</h2>

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
                  placeholder="Digite a descrição"
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
                <div className="flex items-center gap-2 mt-6">
                  <Field type="checkbox" name="shuffleQuestions" className="w-5 h-5" />
                  <label className="font-medium">Embaralhar perguntas?</label>
                </div>
              </div>

              {/* Seção das Perguntas */}
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Perguntas</h3>
                <FieldArray name="questions">
                  {({ remove, push }) => (
                    <div className="space-y-4">
                      {values.questions.map((_, index) => (
                        <div key={index} className="border p-4 rounded bg-white dark:bg-gray-800">
                          <div className="mb-2">
                            <label className="block font-medium mb-1">Frase com lacunas</label>
                            <Field
                              type="text"
                              name={`questions.${index}.question`}
                              placeholder="Ex: O passado de comer é _____ e o de pagar é _____"
                              className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <ErrorMessage name={`questions.${index}.question`} component="p" className="text-red-500 mt-1" />
                          </div>
                          <div className="mb-2">
                            <label className="block font-medium mb-1">Respostas corretas (separadas por vírgula)</label>
                            <Field
                              type="text"
                              name={`questions.${index}.correctAnswer`}
                              placeholder="Ex: comi, paguei"
                              className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <ErrorMessage name={`questions.${index}.correctAnswer`} component="p" className="text-red-500 mt-1" />
                          </div>
                          <div className="mb-2">
                            <label className="block font-medium mb-1">Opções (opcional, separadas por vírgula)</label>
                            <Field
                              type="text"
                              name={`questions.${index}.options`}
                              placeholder="Ex: comi, comera, paguei, pagava"
                              className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <ErrorMessage name={`questions.${index}.options`} component="p" className="text-red-500 mt-1" />
                          </div>
                          <button
                            type="button"
                            className="mt-2 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition-transform transform hover:scale-105"
                            onClick={() => remove(index)}
                          >
                            Remover Pergunta
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-transform transform hover:scale-105"
                        onClick={() => push({ question: "", correctAnswer: "", options: "" })}
                      >
                        Adicionar Pergunta
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Upload de Imagem */}
              <div className="flex flex-col">
                <label className="block font-medium mb-1">Imagem de Capa (opcional)</label>
                <input
                  type="file"
                  name="coverImage"
                  accept="image/*"
                  title="Upload an image file for the cover"
                  onChange={(event) => {
                    if (event.currentTarget.files) {
                      setFieldValue("coverImage", event.currentTarget.files[0]);
                    }
                  }}
                  className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
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

export default CreateClozeActivityPage;