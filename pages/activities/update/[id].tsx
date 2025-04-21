// UpdateActivityForm.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import { TextField, Button, Checkbox, FormControlLabel } from "@mui/material";
import axios from "axios";
import { Activity } from "@/utils/types";
import CommonFields from "../../../components/CommonFields";
import CrosswordFields from "../../../components/CrosswordFields";
import DragDropFields from "../../../components/DragDropFields";
import MultipleChoiceFields from "@/components/MultipleChoiceFields";
import { useAuth } from "@/context/authContext";

interface FormValues {
  title: string;
  description: string;
  category: string;
  coverImage: File | null;
  words?: string;
  rows?: number | "";
  cols?: number | "";
  crosswordItems?: CrosswordItem[];
  timeLimit?: number | "";
  shuffleQuestions?: boolean;
  questions?: QuestionField[];
  pairs?: Pair[];
}

interface CrosswordItem {
  word: string;
  clue: string;
}

interface CrosswordContent {
  words: string[] | { word: string }[];
  clues: string[] | { clue: string }[];
}

interface QuizQuestion {
  question: string;
  correctAnswer: string | string[];
  options?: string[];
}

type ClozeQuestion = QuizQuestion;

interface DragDropPair {
  word: string;
  translation: string;
}

interface Pair {
  word: string;
  translation: string;
}

interface PairTouched {
  word?: boolean;
  translation?: boolean;
}

interface PairError {
  word?: string;
  translation?: string;
}

interface ActivityContentMap {
  word_search?: {
    words: string[];
  };
  crossword?: CrosswordContent;
  quiz?: {
    questions: QuizQuestion[];
  };
  cloze?: {
    questions: ClozeQuestion[];
  };
  drag_drop?: {
    pairs: DragDropPair[];
  };
  sentence_order?: {
    questions: string[];
  };
  multiple_choice?: {
    pairs: DragDropPair[];
  };
}

interface ConfigMap {
  rows?: number;
  cols?: number;
  timeLimit?: number;
  shuffleQuestions?: boolean;
}

type ActivityWithContent = Activity & {
  content?: ActivityContentMap[keyof ActivityContentMap];
  config?: ConfigMap;
};

// tipos auxiliares para corrigir erros com any no FieldArray
interface QuestionField {
  question: string;
  correctAnswer?: string;
  options?: string;
}

interface CrosswordItemTouched {
  word?: boolean;
  clue?: boolean;
}

interface QuestionTouched {
  question?: boolean;
  correctAnswer?: boolean;
  options?: boolean;
}

interface QuestionError {
  question?: string;
  correctAnswer?: string;
  options?: string;
}

export default function UpdateActivityForm() {
  const params = useParams();
  const id = typeof params?.id === "string"
    ? params.id
    : Array.isArray(params?.id)
      ? params.id[0]
      : undefined;
  const router = useRouter();
  const { token } = useAuth();

  const [initialValues, setInitialValues] = useState<FormValues>({
    title: "",
    description: "",
    category: "",
    coverImage: null,
    crosswordItems: [],
    pairs: [],
    questions: [],
  });
  const [activityType, setActivityType] = useState<string>("");
  const [serverError, setServerError] = useState("");
  const [currentCover, setCurrentCover] = useState<string>("");

  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Título obrigatório"),
    description: Yup.string(),
    category: Yup.string().required("Categoria obrigatória"),
    coverImage: Yup.mixed().nullable(),
    ...(activityType === "word_search" && {
      words: Yup.string().required("Informe as palavras"),
      rows: Yup.number().required("Número de linhas obrigatório"),
      cols: Yup.number().required("Número de colunas obrigatório"),
    }),
    ...(activityType === "crossword" && {
      rows: Yup.number().required("Número de linhas obrigatório"),
      cols: Yup.number().required("Número de colunas obrigatório"),
      crosswordItems: Yup.array()
        .of(
          Yup.object({
            word: Yup.string().required("Palavra obrigatória"),
            clue: Yup.string().required("Dica obrigatória"),
          })
        )
        .min(1, "Adicione pelo menos um item"),
    }),
    ...(activityType === "quiz" && {
      timeLimit: Yup.number()
        .min(1, "Tempo deve ser pelo menos 1 minuto")
        .required("Tempo obrigatório"),
      shuffleQuestions: Yup.boolean(),
      questions: Yup.array()
        .of(
          Yup.object({
            question: Yup.string().required("Campo obrigatório"),
            correctAnswer: Yup.string().required("Campo obrigatório"),
            options: Yup.string(),
          })
        )
        .required("Adicione ao menos uma pergunta"),
    }),
    ...(activityType === "cloze" && {
      timeLimit: Yup.number()
        .min(1, "Tempo deve ser pelo menos 1 minuto")
        .required("Tempo obrigatório"),
      shuffleQuestions: Yup.boolean(),
      questions: Yup.array().of(
        Yup.object({
          question: Yup.string().required("Campo obrigatório"),
          correctAnswer: Yup.string().required("Campo obrigatório"),
          options: Yup.string(),
        })
      ),
    }),
    ...(activityType === "drag_drop" && {
      timeLimit: Yup.number()
        .min(1, "Tempo deve ser pelo menos 1 minuto")
        .required("Tempo obrigatório"),
      pairs: Yup.array()
        .of(
          Yup.object({
            word: Yup.string().required("Palavra obrigatória"),
            translation: Yup.string().required("Tradução obrigatória"),
          })
        )
        .min(1, "Adicione pelo menos um par"),
    }),
    ...(activityType === "sentence_order" && {
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
    }),
    ...(activityType === "multiple_choice" && {
      timeLimit: Yup.number()
        .min(1, "Tempo deve ser pelo menos 1 minuto")
        .required("Tempo obrigatório"),
      pairs: Yup.array()
        .of(
          Yup.object({
            word: Yup.string().required("Palavra obrigatória"),
            translation: Yup.string().required("Tradução obrigatória"),
          })
        )
        .min(1, "Adicione pelo menos um par"),
    }),
  });

  useEffect(() => {
    if (!token) return;
    axios
      .get(`http://localhost:3001/activity/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      })
      .then((res) => {
        const act: ActivityWithContent = res.data;
        setActivityType(act.type);
        const cover = act.coverImage ? act.coverImage.replace(/\?$/, "") : "";
        setCurrentCover(cover);

        const initValues: FormValues = {
          title: act.title ?? "",
          description: act.description ?? "",
          category: act.category ?? "",
          coverImage: null,
          crosswordItems: [],
          pairs: [],
          questions: [],
        };

        if (act.type === "word_search") {
          const content = act.content as ActivityContentMap["word_search"];
          initValues.words = content?.words ? content.words.join(", ") : "";
          initValues.rows = act.config?.rows ?? 10;
          initValues.cols = act.config?.cols ?? 10;
        } else if (act.type === "crossword") {
          const content = act.content as CrosswordContent;
          const config = act.config ?? {};
          initValues.rows = config.rows ?? 10;
          initValues.cols = config.cols ?? 10;

          let wordsArr: string[] = [];
          let cluesArr: string[] = [];

          if (Array.isArray(content.words)) {
            if (typeof content.words[0] === "object") {
              wordsArr = (content.words as { word: string }[]).map((w) => w.word);
              cluesArr = (content.clues as { clue: string }[]).map((c) => c.clue);
            } else {
              wordsArr = content.words as string[];
              cluesArr = content.clues as string[];
            }
          } else if (typeof content.words === "string") {
            wordsArr = (content.words as string).split(",").map((w) => w.trim());
            cluesArr = Array.isArray(content.clues)
              ? typeof content.clues[0] === "object"
                ? (content.clues as { clue: string }[]).map((c) => c.clue)
                : (content.clues as string[]).map((c) => c.trim())
              : (content.clues as string).split(",").map((c) => c.trim());
          }

          initValues.crosswordItems = wordsArr.map((w, i) => ({
            word: w,
            clue: cluesArr[i] ?? "",
          }));
        } else if (act.type === "quiz" || act.type === "cloze") {
          const content = act.content as { questions: QuizQuestion[] };
          initValues.timeLimit = act.config?.timeLimit ?? 10;
          initValues.shuffleQuestions = act.config?.shuffleQuestions ?? false;
          if (content?.questions) {
            initValues.questions = content.questions.map((q) => ({
              question: q.question,
              correctAnswer: Array.isArray(q.correctAnswer)
                ? q.correctAnswer.join(", ")
                : q.correctAnswer,
              options: q.options ? q.options.join(", ") : "",
            }));
          }
        } else if (act.type === "drag_drop") {
          const content = act.content as { pairs: DragDropPair[] };
          initValues.timeLimit = act.config?.timeLimit ?? 10;
          initValues.pairs = content?.pairs ?? [{ word: "", translation: "" }];
        } else if (act.type === "sentence_order") {
          const content = act.content as { questions: string[] };
          const init: FormValues = {
            title: act.title ?? "",
            description: act.description ?? "",
            category: act.category ?? "",
            coverImage: null,
            questions: content?.questions?.map((q) => ({ question: q, correctAnswer: "", options: "" })) ?? [
              { question: "" },
            ],
            timeLimit: act.config?.timeLimit ?? 10,
          };
          setInitialValues(init);
          return;
        } else if (act.type === "multiple_choice") {
          const content = act.content as { pairs: DragDropPair[] };
          initValues.timeLimit = act.config?.timeLimit ?? 10;
          initValues.pairs = content?.pairs ?? [{ word: "", translation: "" }];
        }
        setInitialValues(initValues);
      })
      .catch((err) => {
        console.error("Erro ao buscar atividade", err);
        setServerError("Erro ao buscar atividade");
      });
  }, [id, token]);

  const onSubmit = async (
    values: FormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("category", values.category);
      formData.append("type", activityType);
      if (values.coverImage) {
        formData.append("coverImage", values.coverImage);
      }
      if (activityType === "word_search") {
        formData.append("words", values.words ?? "");
        formData.append("rows", String(values.rows));
        formData.append("cols", String(values.cols));
      } else if (activityType === "crossword") {
        formData.append("rows", String(values.rows));
        formData.append("cols", String(values.cols));
        formData.append("content", JSON.stringify({ crosswordItems: values.crosswordItems }));
      } else if (activityType === "quiz") {
        const config = {
          timeLimit: values.timeLimit,
          shuffleQuestions: values.shuffleQuestions,
        };
        const questions =
          values.questions?.map((q) => ({
            question: q.question,
            correctAnswer: q.correctAnswer?.trim(),
            options: q.options
              ? q.options.split(",").map((opt) => opt.trim()).filter((opt) => opt !== "")
              : [],
          })) ?? [];
        formData.append("config", JSON.stringify(config));
        formData.append("content", JSON.stringify({ questions }));
      } else if (activityType === "cloze") {
        const config = {
          timeLimit: values.timeLimit,
          shuffleQuestions: values.shuffleQuestions,
        };
        const questions =
          values.questions?.map((q) => ({
            question: q.question,
            correctAnswer: (q.correctAnswer ?? "").split(",").map((ans) => ans.trim()),
            options: q.options
              ? q.options.split(",").map((opt) => opt.trim()).filter((opt) => opt !== "")
              : [],
          })) ?? [];
        formData.append("config", JSON.stringify(config));
        formData.append("content", JSON.stringify({ questions }));
      } else if (activityType === "drag_drop") {
        const config = { timeLimit: values.timeLimit };
        formData.append("config", JSON.stringify(config));
        formData.append("content", JSON.stringify({ pairs: values.pairs }));
        formData.append("type", "drag_drop");
      } else if (activityType === "sentence_order") {
        const content = {
          questions: values.questions?.map((s) => s.question.trim()) ?? [],
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
        formData.append("type", "sentence_order");
        formData.append("config", JSON.stringify({ timeLimit: values.timeLimit }));
        formData.append("content", JSON.stringify(content));
      } else if (activityType === "multiple_choice") {
        const config = { timeLimit: values.timeLimit };
        formData.append("config", JSON.stringify(config));
        formData.append("content", JSON.stringify({ pairs: values.pairs }));
        formData.append("type", "drag_drop");
      }

      await axios.put(`http://localhost:3001/activity/${id}`, formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Atividade atualizada com sucesso!");
      router.push("/activities/activityPage");
    } catch (error) {
      console.error("Erro ao atualizar atividade", error);
      setServerError("Erro ao atualizar atividade");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-green-100 h-full w-full py-12 px-4">
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting, setFieldValue, values, errors, touched, handleChange, handleBlur }) => (
          <Form className="bg-white p-6 rounded shadow-md w-full max-w-3xl">
            {serverError && <div className="text-red-500 mb-4">{serverError}</div>}
            <h2 className="text-2xl font-bold mb-4">Atualizar Atividade – {activityType}</h2>
            <CommonFields
              values={{ ...values, crosswordItems: values.crosswordItems ?? [] }}
              errors={{
                timeLimit: errors.timeLimit,
                pairs: errors.pairs as PairError[] | undefined,
              }}
              touched={{
                rows: touched.rows,
                cols: touched.cols,
                crosswordItems: Array.isArray(touched.crosswordItems)
                  ? (touched.crosswordItems as CrosswordItemTouched[])
                  : undefined,
              }}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
              currentCover={currentCover}
            />
            {activityType === "word_search" && (
              <>
                <div className="mb-4">
                  <TextField
                    name="words"
                    label="Palavras (separadas por vírgula)"
                    variant="outlined"
                    value={values.words ?? ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.words && errors.words)}
                    helperText={touched.words && errors.words}
                    fullWidth
                    placeholder="ex: palavra1, palavra2"
                  />
                </div>
                <div className="mb-4 flex gap-4">
                  <TextField
                    name="rows"
                    label="Linhas"
                    variant="outlined"
                    value={values.rows}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.rows && errors.rows)}
                    helperText={touched.rows && errors.rows}
                    fullWidth
                    type="number"
                  />
                  <TextField
                    name="cols"
                    label="Colunas"
                    variant="outlined"
                    value={values.cols}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.cols && errors.cols)}
                    helperText={touched.cols && errors.cols}
                    fullWidth
                    type="number"
                  />
                </div>
              </>
            )}
            {activityType === "crossword" && (
              <CrosswordFields
                values={{ ...values, crosswordItems: values.crosswordItems ?? [] }}
                errors={{
                  rows: errors.rows,
                  cols: errors.cols,
                  crosswordItems: Array.isArray(errors.crosswordItems) ? errors.crosswordItems : undefined,
                }}
                touched={{
                  rows: touched.rows,
                  cols: touched.cols,
                  crosswordItems: Array.isArray(touched.crosswordItems)
                    ? (touched.crosswordItems as CrosswordItemTouched[])
                    : undefined,
                }}
                handleChange={handleChange}
                handleBlur={handleBlur}
              />
            )}
            {activityType === "quiz" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <TextField
                      name="timeLimit"
                      label="Tempo limite (minutos)"
                      variant="outlined"
                      value={values.timeLimit}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.timeLimit && errors.timeLimit)}
                      helperText={touched.timeLimit && errors.timeLimit}
                      fullWidth
                      type="number"
                    />
                  </div>
                  <div className="mb-4 flex items-center">
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="shuffleQuestions"
                          checked={Boolean(values.shuffleQuestions)}
                          onChange={handleChange}
                        />
                      }
                      label="Embaralhar perguntas?"
                    />
                  </div>
                </div>
                <FieldArray name="questions">
                  {({ push, remove }) => (
                    <div className="mb-4">
                      <p className="block font-medium mb-1">Perguntas</p>
                      {values.questions &&
                        values.questions.length > 0 &&
                        values.questions.map((_, index) => (
                          <div key={index} className="border p-4 rounded mb-2 bg-gray-50">
                            <div className="mb-2">
                              <TextField 
                                name={`questions.${index}.question`}
                                label="Frase com lacunas"
                                variant="outlined"
                                value={values.questions?.[index]?.question ?? ""}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={Boolean(
                                  Array.isArray(touched.questions) && touched.questions[index]?.question &&
                                  (errors.questions?.[index] as QuestionError)?.question
                                )}
                                helperText={
                                  Array.isArray(touched.questions) && touched.questions[index]?.question &&
                                  (errors.questions?.[index] as QuestionError)?.question
                                }
                                fullWidth
                                placeholder="Ex: O passado de comer é _____"
                              />
                            </div>
                            <div className="mb-2">
                              <TextField
                                name={`questions.${index}.correctAnswer`}
                                label="Respostas corretas (separadas por vírgula)"
                                variant="outlined"
                                value={values.questions?.[index]?.correctAnswer ?? ""}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={Boolean(
                                  Array.isArray(touched.questions) && (touched.questions[index] as QuestionTouched)?.correctAnswer &&
                                  (errors.questions?.[index] as QuestionError)?.correctAnswer
                                )}
                                helperText={
                                  Array.isArray(touched.questions) && touched.questions[index]?.correctAnswer &&
                                  (errors.questions?.[index] as QuestionError)?.correctAnswer
                                }
                                fullWidth
                                placeholder="ex: comi, paguei"
                              />
                            </div>
                            <div className="mb-2">
                              <TextField
                                name={`questions.${index}.options`}
                                label="Opções (opcional, separadas por vírgula)"
                                variant="outlined"
                                value={values.questions?.[index]?.options ?? ""}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={Boolean(
                                  (touched.questions as QuestionTouched[] | undefined)?.[index]?.options &&
                                  (errors.questions?.[index] as QuestionError)?.options
                                )}
                                helperText={
                                  Array.isArray(touched.questions) && touched.questions[index]?.options &&
                                  (errors.questions?.[index] as QuestionError)?.options
                                }
                                fullWidth
                                placeholder="ex: comi, comera, paguei, pagava"
                              />
                            </div>
                            <Button
                              type="button"
                              onClick={() => remove(index)}
                              className="mt-2 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                            >
                              Remover Pergunta
                            </Button>
                          </div>
                        ))}
                      <Button
                        type="button"
                        onClick={() => push({ question: "", correctAnswer: "", options: "" })}
                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                      >
                        Adicionar Pergunta
                      </Button>
                    </div>
                  )}
                </FieldArray>

              </>
            )}
            {activityType === "cloze" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <TextField
                      name="timeLimit"
                      label="Tempo limite (minutos)"
                      variant="outlined"
                      value={values.timeLimit}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.timeLimit && errors.timeLimit)}
                      helperText={touched.timeLimit && errors.timeLimit}
                      fullWidth
                      type="number"
                    />
                  </div>
                  <div className="mb-4 flex items-center">
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="shuffleQuestions"
                          checked={Boolean(values.shuffleQuestions)}
                          onChange={handleChange}
                        />
                      }
                      label="Embaralhar perguntas?"
                    />
                  </div>
                </div>
                <FieldArray name="questions">
                  {({ push, remove }) => (
                    <div className="mb-4">
                      <p className="block font-medium mb-1">Perguntas</p>
                      {values.questions &&
                        values.questions.length > 0 &&
                        values.questions.map((_, index) => (
                          <div key={index} className="border p-4 rounded mb-2 bg-gray-50">
                            <div className="mb-2">
                              <TextField
                                name={`questions.${index}.question`}
                                label="Frase com lacunas"
                                variant="outlined"
                                value={values.questions?.[index]?.question ?? ""}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={Boolean(
                                  Array.isArray(touched.questions) && touched.questions[index]?.question &&
                                  (errors.questions?.[index] as QuestionError)?.question
                                )}
                                helperText={
                                  Array.isArray(touched.questions) && touched.questions[index]?.question &&
                                  (errors.questions?.[index] as QuestionError)?.question
                                }
                                fullWidth
                                placeholder="Ex: O passado de comer é _____"
                              />
                            </div>
                            <div className="mb-2">
                              <TextField
                                name={`questions.${index}.correctAnswer`}
                                label="Respostas corretas (separadas por vírgula)"
                                variant="outlined"
                                value={values.questions?.[index]?.correctAnswer ?? ""}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={Boolean(
                                  Array.isArray(touched.questions) &&
                                  touched.questions[index]?.correctAnswer &&
                                  (errors.questions?.[index] as QuestionError)?.question
                                )}
                                helperText={
                                  Array.isArray(touched.questions) && touched.questions[index]?.correctAnswer &&
                                  (errors.questions?.[index] as QuestionError)?.question
                                }
                                fullWidth
                                placeholder="ex: comi, paguei"
                              />
                            </div>
                            <div className="mb-2">
                              <TextField
                                name={`questions.${index}.options`}
                                label="Opções (opcional, separadas por vírgula)"
                                variant="outlined"
                                value={values.questions?.[index]?.options ?? ""}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={Boolean(
                                  Array.isArray(touched.questions) && touched.questions[index]?.options &&
                                  (errors.questions?.[index] as QuestionError)?.question
                                )}
                                helperText={
                                  Array.isArray(touched.questions) && touched.questions[index]?.options &&
                                  (errors.questions?.[index] as QuestionError)?.question
                                }
                                fullWidth
                                placeholder="ex: comi, comera, paguei, pagava"
                              />
                            </div>
                            <Button
                              type="button"
                              onClick={() => remove(index)}
                              className="mt-2 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                            >
                              Remover Pergunta
                            </Button>
                          </div>
                        ))}
                      <Button
                        type="button"
                        onClick={() => push({ question: "", correctAnswer: "", options: "" })}
                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                      >
                        Adicionar Pergunta
                      </Button>
                    </div>
                  )}
                </FieldArray>
              </>
            )}
            {activityType === "drag_drop" && (              
              <div className="mb-4">
                <DragDropFields
                  values={{ ...values, pairs: values.pairs ?? [] }}
                  errors={{
                    timeLimit: errors.timeLimit,
                    pairs: errors.pairs as PairError[] | undefined,
                  }}
                  touched={{
                    timeLimit: touched.timeLimit,
                    pairs: touched.pairs as PairTouched[] | undefined,
                  }}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                />
              </div>
            )}
            {activityType === "sentence_order" && (
              <>
                <div className="mb-4">
                  <TextField
                    name="timeLimit"
                    label="Tempo limite (minutos)"
                    variant="outlined"
                    value={values.timeLimit}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.timeLimit && errors.timeLimit)}
                    helperText={touched.timeLimit && errors.timeLimit}
                    fullWidth
                    type="number"
                  />
                </div>
                <FieldArray name="questions">
                  {({ remove, push }) => (
                    <div className="mb-4 space-y-2">
                      <p className="font-semibold">Frases</p>
                      {values.questions?.map((_, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <TextField
                            name={`questions.${index}.question`}
                            label={`Frase ${index + 1}`}
                            value={values.questions?.[index]?.question ?? ""}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={Boolean(
                              Array.isArray(touched.questions) &&
                              touched.questions[index]?.question &&
                              (errors.questions?.[index] as QuestionError)?.question
                            )}
                            helperText={
                              Array.isArray(touched.questions) && touched.questions[index]?.question &&
                              (errors.questions?.[index] as QuestionError)?.question
                            }
                            fullWidth
                          />
                          <Button
                            type="button"
                            onClick={() => remove(index)}
                            color="error"
                          >
                            Remover
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        onClick={() => push({ question: "" })}
                        variant="contained"
                        color="primary"
                      >
                        Adicionar Frase
                      </Button>
                    </div>
                  )}
                </FieldArray>
              </>
            )}
            {activityType === "multiple_choice" && (              
              <div className="mb-4">
                <MultipleChoiceFields
                  values={{ ...values, pairs: values.pairs ?? [] }}
                  errors={{
                    timeLimit: errors.timeLimit,
                    pairs: errors.pairs as PairError[] | undefined,
                  }}
                  touched={{
                    ...touched,
                    pairs: Array.isArray(touched.pairs) ? touched.pairs : undefined,
                  }}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                />
              </div>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="contained"
              color="primary"
              className="w-full mt-4"
            >
              Atualizar
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}