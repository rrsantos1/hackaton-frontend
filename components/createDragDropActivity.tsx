import { useState } from "react";
import axios from "axios";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";

const API_URL = "http://localhost:3001/activities/dragdrop";

const CreateDragDropActivity = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
    title: "",
    description: "",
    category: "",
    type: "drag_drop",
    timeLimit: 10,
    pairs: [{ word: "", translation: "" }],
    coverImage: null as File | null, // Campo para o arquivo
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
      if (coverImage) formData.append("coverImage", coverImage);

      const token = localStorage.getItem("token");
      const response = await axios.post(API_URL, formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        alert("Atividade de arrastar e soltar criada com sucesso!");
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
    <div className="flex flex-col items-center justify-center w-full py-12 px-4">
      <h2 className="text-2xl md:text-3xl font-bold mb-4">Criar Atividade - Arrastar e Soltar</h2>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, setFieldValue }) => (
          <Form className="space-y-6 bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <div>
              <label className="block font-medium mb-1">Título</label>
              <Field type="text" name="title" className="border p-2 w-full rounded" />
              <ErrorMessage name="title" component="p" className="text-red-500 mt-1" />
            </div>

            <div>
              <label className="block font-medium mb-1">Descrição</label>
              <Field as="textarea" name="description" className="border p-2 w-full rounded" />
            </div>

            <div>
              <label className="block font-medium mb-1">Categoria</label>
              <Field type="text" name="category" className="border p-2 w-full rounded" />
              <ErrorMessage name="category" component="p" className="text-red-500 mt-1" />
            </div>

            <div>
              <label className="block font-medium mb-1">Tempo limite (minutos)</label>
              <Field type="number" name="timeLimit" className="border p-2 w-full rounded" />
              <ErrorMessage name="timeLimit" component="p" className="text-red-500 mt-1" />
            </div>

            <FieldArray name="pairs">
              {({ remove, push }) => (
                <div className="space-y-4">
                  {values.pairs.map((_, index) => (
                    <div key={index} className="border p-4 rounded bg-gray-50">
                      <div className="mb-2">
                        <label className="block font-medium mb-1">Expressão</label>
                        <Field type="text" name={`pairs.${index}.word`} className="border p-2 w-full rounded" />
                        <ErrorMessage name={`pairs.${index}.word`} component="p" className="text-red-500 mt-1" />
                      </div>
                      <div className="mb-2">
                        <label className="block font-medium mb-1">Par</label>
                        <Field type="text" name={`pairs.${index}.translation`} className="border p-2 w-full rounded" />
                        <ErrorMessage name={`pairs.${index}.translation`} component="p" className="text-red-500 mt-1" />
                      </div>
                      <button type="button" className="mt-2 bg-red-500 text-white py-1 px-3 rounded" onClick={() => remove(index)}>
                        Remover Par
                      </button>
                    </div>
                  ))}
                  <button type="button" className="bg-green-500 text-white py-2 px-4 rounded" onClick={() => push({ word: "", translation: "" })}>
                    Adicionar Par
                  </button>
                </div>
              )}
            </FieldArray>

            <div>
              <label className="block font-medium">Imagem de Capa</label>
              <input
                type="file"
                accept="image/*"
                className="border p-2 w-full"
                title="Selecione uma imagem de capa"
                onChange={(event) => {
                  if (event.currentTarget.files) {
                    setFieldValue("coverImage", event.currentTarget.files[0]);
                  }
                }}
              />
            </div>

            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded w-full" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar Atividade"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateDragDropActivity;