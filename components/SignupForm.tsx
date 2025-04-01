import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

export default function SignupForm() {
  const [serverError, setServerError] = useState("");

  const initialValues = { name: '', email: '', password: '' };

  const validationSchema = Yup.object({
    name: Yup.string().required('Nome é obrigatório'),
    email: Yup.string().email('Email inválido').required('Email é obrigatório'),
    password: Yup.string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .required('Senha é obrigatória'),
  });

  const onSubmit = async (values: { name: string; email: string; password: string }, { resetForm }: { resetForm: () => void }) => {
    setServerError("");
    try {
      const response = await axios.post('http://localhost:3001/user', values);
      // Supondo que uma resposta 200 ou 201 indica sucesso
      if (response.status === 200 || response.status === 201) {
        console.log('Inscrição realizada com sucesso:', response.data);
        resetForm();
        // Aqui você pode redirecionar o usuário ou exibir uma mensagem de sucesso
      } else {
        setServerError(response.data.message ?? 'Erro ao criar usuário');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      if (axios.isAxiosError(error)) {
        setServerError(error.response?.data?.message ?? error.message);
      } else {
        setServerError('Ocorreu um erro inesperado');
      }
    }
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
      {({ isSubmitting }) => (
        <Form className="bg-white p-6 rounded shadow-md w-full max-w-md">
          {serverError && <div className="text-red-500 mb-4">{serverError}</div>}
          <div className="mb-4">
            <label className="block mb-1" htmlFor="name">Nome</label>
            <Field name="name" type="text" className="w-full p-2 border rounded" />
            <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
          </div>
          <div className="mb-4">
            <label className="block mb-1" htmlFor="email">Email</label>
            <Field name="email" type="email" className="w-full p-2 border rounded" />
            <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
          </div>
          <div className="mb-4">
            <label className="block mb-1" htmlFor="password">Senha</label>
            <Field name="password" type="password" className="w-full p-2 border rounded" />
            <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            Inscrever-se
          </button>
        </Form>
      )}
    </Formik>
  );
}