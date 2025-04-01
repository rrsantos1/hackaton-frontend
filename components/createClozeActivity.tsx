import { useState } from "react";
import axios from "axios";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";

const API_URL = "http://localhost:3001/activities/cloze";

const CreateClozeActivity = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
    title: "",
    description: "",
    category: "",
    type: "cloze",
    timeLimit: 10, // Tempo limite em minutos (opcional)
    shuffleQuestions: false, // Se as perguntas devem ser embaralhadas (opcional)
    questions: [
      {
        sentence: "",
        correctAnswers: "", // Respostas separadas por vírgula (ex.: "comi,paguei")
        options: "", // Opcional: alternativas separadas por vírgula
      },
    ],
    coverImage: null as File | null, // Campo para o arquivo
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
          sentence: Yup.string().required("Frase obrigatória"),
          correctAnswers: Yup.string()
            .required("Informe pelo menos uma resposta correta")
            .test(
              "min-answers",
              "Informe pelo menos uma resposta, separada por vírgula se for mais de uma",
              (value) => (value ? value.split(",").filter((s) => s.trim() !== "").length >= 1 : false)
            ),
          options: Yup.string().optional(),
        })
      )
      .min(1, "Adicione pelo menos uma pergunta"),
    // O campo coverImage é opcional, mas se for fornecido deve ser um arquivo
    coverImage: Yup.mixed().notRequired(),
  });

  const handleSubmit = async (values: typeof initialValues) => {
    setIsSubmitting(true);
    try {
      const { title, description, category, timeLimit, shuffleQuestions, questions, coverImage } = values;

      const config = {
        timeLimit,
        shuffleQuestions,
      };

      // Para cada pergunta, converte as strings de respostas corretas e opções em arrays
      const content = {
        questions: questions.map((q) => ({
          sentence: q.sentence,
          correctAnswers: q.correctAnswers
            .split(",")
            .map((ans) => ans.trim())
            .filter((ans) => ans !== ""),
          options: q.options
            ? q.options.split(",").map((opt) => opt.trim()).filter((opt) => opt !== "")
            : [],
        })),
      };

      const token = localStorage.getItem("token");

      // Criando um objeto FormData para enviar a imagem junto com os outros dados
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("type", "cloze");
      formData.append("config", JSON.stringify(config));
      formData.append("content", JSON.stringify(content));

      // Se houver uma imagem de capa, anexa ao FormData
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      const response = await axios.post(API_URL, formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "multipart/form-data", // Indica que estamos enviando multipart/form-data
        },
      });

      if (response.status === 201) {
        alert("Atividade de completar frases criada com sucesso!");
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
      <h2 className="text-2xl md:text-3xl font-bold mb-4">Criar Atividade - Completar Frases</h2>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, setFieldValue }) => (
          <Form className="space-y-6 bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            {/* Campos básicos */}
            <div>
              <label className="block font-medium mb-1">Título</label>
              <Field type="text" name="title" className="border p-2 w-full rounded" placeholder="Digite o título" />
              <ErrorMessage name="title" component="p" className="text-red-500 mt-1" />
            </div>

            <div>
              <label className="block font-medium mb-1">Descrição</label>
              <Field as="textarea" name="description" className="border p-2 w-full rounded" placeholder="Digite a descrição" />
            </div>

            <div>
              <label className="block font-medium mb-1">Categoria</label>
              <Field type="text" name="category" className="border p-2 w-full rounded" placeholder="Digite a categoria" />
              <ErrorMessage name="category" component="p" className="text-red-500 mt-1" />
            </div>

            <div>
              <label className="block font-medium mb-1">Tempo limite (minutos)</label>
              <Field type="number" name="timeLimit" className="border p-2 w-full rounded" />
              <ErrorMessage name="timeLimit" component="p" className="text-red-500 mt-1" />
            </div>

            <div className="flex items-center gap-2">
              <Field type="checkbox" name="shuffleQuestions" className="w-5 h-5" />
              <label className="font-medium">Embaralhar perguntas?</label>
            </div>

            {/* FieldArray para as perguntas */}
            <FieldArray name="questions">
              {({ remove, push }) => (
                <div className="space-y-4">
                  {values.questions.map((_, index) => (
                    <div key={index} className="border p-4 rounded bg-gray-50">
                      <div className="mb-2">
                        <label className="block font-medium mb-1">Frase com lacunas</label>
                        <Field
                          type="text"
                          name={`questions.${index}.sentence`}
                          placeholder="Ex: O passado de comer é _____ e o de pagar é _____"
                          className="border p-2 w-full rounded"
                        />
                        <ErrorMessage name={`questions.${index}.sentence`} component="p" className="text-red-500 mt-1" />
                      </div>
                      <div className="mb-2">
                        <label className="block font-medium mb-1">Respostas corretas (separadas por vírgula)</label>
                        <Field
                          type="text"
                          name={`questions.${index}.correctAnswers`}
                          placeholder="Ex: comi, paguei"
                          className="border p-2 w-full rounded"
                        />
                        <ErrorMessage name={`questions.${index}.correctAnswers`} component="p" className="text-red-500 mt-1" />
                      </div>
                      <div className="mb-2">
                        <label className="block font-medium mb-1">Opções (opcional, separadas por vírgula)</label>
                        <Field
                          type="text"
                          name={`questions.${index}.options`}
                          placeholder="Ex: comi, comera, paguei, pagava"
                          className="border p-2 w-full rounded"
                        />
                        <ErrorMessage name={`questions.${index}.options`} component="p" className="text-red-500 mt-1" />
                      </div>
                      <button
                        type="button"
                        className="mt-2 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition-colors"
                        onClick={() => remove(index)}
                      >
                        Remover Pergunta
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
                    onClick={() => push({ sentence: "", correctAnswers: "", options: "" })}
                  >
                    Adicionar Pergunta
                  </button>
                </div>
              )}
            </FieldArray>

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
              className="bg-blue-500 text-white py-2 px-4 rounded-md w-full mt-4 hover:bg-blue-600 transition-colors"
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

export default CreateClozeActivity;