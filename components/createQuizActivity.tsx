import { useState } from "react";
import axios from "axios";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
const API_URL = "http://localhost:3001/activities/quiz";

const CreateQuizActivity = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
    title: "",
    description: "",
    category: "",
    type: "quiz",
    timeLimit: 10, // Tempo limite em minutos
    shuffleQuestions: false, // Se as perguntas devem ser embaralhadas
    questions: [
      { question: "", options: "", correctAnswer: "" }
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
          question: Yup.string().required("Pergunta obrigatória"),
          options: Yup.string()
            .required("Opções obrigatórias")
            .test(
              "min-options",
              "Insira pelo menos 2 opções separadas por vírgula",
              (value) => value ? value.split(",").length >= 2 : false
            ),
          correctAnswer: Yup.string().required("Resposta correta obrigatória"),
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
  
      // Transforma a string de opções em array para cada pergunta
      const content = {
        questions: questions.map((q) => ({
          question: q.question,
          options: q.options.split(",").map((opt: string) => opt.trim()),
          correctAnswer: q.correctAnswer.trim(),
        })),
      };
  
      // Criação do objeto FormData
      const formData = new FormData();
      formData.append("title", title);
      if (description) formData.append("description", description);
      formData.append("category", category);
      formData.append("type", "quiz");
      formData.append("config", JSON.stringify({ timeLimit, shuffleQuestions }));
      formData.append("content", JSON.stringify(content));
  
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
        alert("Atividade de quiz criada com sucesso!");
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
      <h2 className="text-xl font-bold mb-4">Criar Quiz</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form className="space-y-4 bg-white p-6 rounded shadow-md w-full max-w-md">
            {/* Campos básicos */}
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

            <div>
              <label className="block font-medium">Embaralhar perguntas?</label>
              <Field type="checkbox" name="shuffleQuestions" className="mr-2" />
            </div>

            {/* FieldArray para as perguntas */}
            <FieldArray name="questions">
              {({ remove, push }) => (
                <div>
                  {values.questions.length > 0 &&
                    values.questions.map((_, index) => (
                      <div key={index} className="mb-4 border p-2 rounded">
                        <div>
                          <label className="block font-medium">Pergunta</label>
                          <Field
                            type="text"
                            name={`questions.${index}.question`}
                            placeholder="Digite a pergunta"
                            className="border p-2 w-full"
                          />
                          <ErrorMessage name={`questions.${index}.question`} component="p" className="text-red-500" />
                        </div>
                        <div>
                          <label className="block font-medium">
                            Opções (separadas por vírgula)
                          </label>
                          <Field
                            type="text"
                            name={`questions.${index}.options`}
                            placeholder="Ex: opção1, opção2, opção3"
                            className="border p-2 w-full"
                          />
                          <ErrorMessage name={`questions.${index}.options`} component="p" className="text-red-500" />
                        </div>
                        <div>
                          <label className="block font-medium">Resposta Correta</label>
                          <Field
                            type="text"
                            name={`questions.${index}.correctAnswer`}
                            placeholder="Digite a resposta correta"
                            className="border p-2 w-full"
                          />
                          <ErrorMessage name={`questions.${index}.correctAnswer`} component="p" className="text-red-500" />
                        </div>
                        <button
                          type="button"
                          className="mt-2 bg-red-500 text-white py-1 px-2 rounded"
                          onClick={() => remove(index)}
                        >
                          Remover Pergunta
                        </button>
                      </div>
                    ))}
                  <button
                    type="button"
                    className="bg-green-500 text-white py-2 px-4 rounded"
                    onClick={() => push({ question: "", options: "", correctAnswer: "" })}
                  >
                    Adicionar Pergunta
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
                placeholder="Escolha um arquivo de imagem"
                onChange={(event) => {
                  if (event.currentTarget.files) {
                    setFieldValue("coverImage", event.currentTarget.files[0]);
                  }
                }}
              />
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

export default CreateQuizActivity;