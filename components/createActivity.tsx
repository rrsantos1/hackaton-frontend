import { useState } from "react";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const API_URL = "http://localhost:3001/activities/word_search";

const CreateActivity = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
    title: "",
    description: "",
    category: "",
    type: "word_search",
    timeLimit: 5, // minutos
    rows: 10,
    columns: 10,
    words: "",
    coverImage: null as File | null, // Campo para o arquivo
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
    // O campo coverImage é opcional, mas se for fornecido deve ser um arquivo
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
      formData.append("description", description || "");
      formData.append("category", category);
      formData.append("type", "word_search"); // Certifique-se de que esse valor está correto
      formData.append("config", config); // Agora como JSON
      formData.append("content", content); // Agora como JSON
  
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }
  
      const token = localStorage.getItem("token");
  
      const response = await axios.post(API_URL, formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.status === 201) {
        alert("Atividade criada com sucesso!");
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
      <h2 className="text-xl font-bold mb-4">Criar Caça-Palavras</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue }) => (
          <Form className="space-y-4 bg-white p-6 rounded shadow-md w-full max-w-md">
            <div>
              <label className="block font-medium">Título</label>
              <Field
                type="text"
                name="title"
                className="border p-2 w-full"
                placeholder="Digite o título"
              />
              <ErrorMessage name="title" component="p" className="text-red-500" />
            </div>

            <div>
              <label className="block font-medium">Descrição</label>
              <Field
                as="textarea"
                name="description"
                className="border p-2 w-full"
                placeholder="Digite a descrição"
              />
            </div>

            <div>
              <label className="block font-medium">Categoria</label>
              <Field
                type="text"
                name="category"
                className="border p-2 w-full"
                placeholder="Digite a categoria"
              />
              <ErrorMessage name="category" component="p" className="text-red-500" />
            </div>

            <div>
              <label className="block font-medium">Tempo limite (minutos)</label>
              <Field type="number" name="timeLimit" className="border p-2 w-full" />
              <ErrorMessage name="timeLimit" component="p" className="text-red-500" />
            </div>

            <div className="flex space-x-4">
              <div>
                <label className="block font-medium">Linhas</label>
                <Field type="number" name="rows" className="border p-2 w-full" />
                <ErrorMessage name="rows" component="p" className="text-red-500" />
              </div>

              <div>
                <label className="block font-medium">Colunas</label>
                <Field type="number" name="columns" className="border p-2 w-full" />
                <ErrorMessage name="columns" component="p" className="text-red-500" />
              </div>
            </div>

            <div>
              <label className="block font-medium">
                Palavras (separadas por vírgula)
              </label>
              <Field
                type="text"
                name="words"
                className="border p-2 w-full"
                placeholder="Ex: gato, cachorro, elefante"
              />
              <ErrorMessage name="words" component="p" className="text-red-500" />
            </div>

            {/* Campo para upload da imagem de capa */}
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
                className="border p-2 w-full"
              />
              <ErrorMessage name="coverImage" component="p" className="text-red-500" />
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Criando..." : "Criar Atividade"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateActivity;