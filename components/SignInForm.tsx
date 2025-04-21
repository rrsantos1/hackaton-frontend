import { useRouter } from "next/router";
import { useState } from "react";
import * as Yup from "yup";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import { useAuth } from "../context/authContext";

export default function SignInForm() {
  const router = useRouter();
  const { setIsLoggedIn, setUser, setToken } = useAuth();
  const [loginError, setLoginError] = useState("");

  const initialValues = { email: "", password: "" };

  const validationSchema = Yup.object({
    email: Yup.string().email("Email inválido").required("Obrigatório"),
    password: Yup.string().required("Obrigatório"),
  });

  const onSubmit = async (values: { email: string; password: string }, { resetForm }: FormikHelpers<{ email: string; password: string }>) => {
    try {
      const response = await axios.post("http://localhost:3001/user/signin", values);

      if (response.status === 200) {
        const { token, userId, name, email, role } = response.data;
        const userData = { id: userId, name, email, role };
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        setToken(token);
        setUser(userData);
        setIsLoggedIn(true);

        resetForm();
        router.push("/activities/activityPage");
      } else {
        setLoginError(response.data.message ?? "Erro ao efetuar login");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      setLoginError("Erro ao efetuar login.");
    }
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
      {({ isSubmitting }) => (
        <Form>     
          <h2 className="text-2xl font-bold mb-4">Acessar conta</h2>  
          <div className="mb-4">
            <label className="block mb-1" htmlFor="email">
              Email
            </label>
            <Field name="email" type="email" className="w-full p-2 border rounded" />
            <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
          </div>
          <div className="mb-4">
            <label className="block mb-1" htmlFor="password">
              Senha
            </label>
            <Field name="password" type="password" className="w-full p-2 border rounded" />
            <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 hover:scale-105">
           Entrar
          </button>
          {loginError && <div className="text-red-300 text-sm mt-2 md:mt-0">{loginError}</div>}
        </Form>
      )}
    </Formik>
  );
}
