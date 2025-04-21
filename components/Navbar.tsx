import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";
import * as Yup from "yup";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import { useAuth } from "../context/authContext";
import UserDropdown from "./UserDropdown";

export default function Navbar() {
  const router = useRouter();
  const { isLoggedIn, setIsLoggedIn, setUser, setToken } = useAuth();
  const [loginError, setLoginError] = useState("");

  const initialValues = { email: "", password: "" };

  const validationSchema = Yup.object({
    email: Yup.string().email("Email inválido").required("Obrigatório"),
    password: Yup.string().required("Obrigatório"),
  });

  const onSubmit = async (
    values: { email: string; password: string },
    { resetForm }: FormikHelpers<{ email: string; password: string }>
  ) => {
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
    <header className="bg-green-700 text-white w-full py-4">
      <div className="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <Link href={isLoggedIn ? "/activities/activityPage" : "/"}>
          <p>Hackaton</p>
        </Link>
        <nav className="flex space-x-4 mb-4 md:mb-0 font-semibold">          
          <Link href="/about" className="bg-white text-green-700 px-4 py-2 rounded hover:bg-gray-200 transition">
            Sobre
          </Link>          
        </nav>

        <div className="w-full md:w-auto">
          {isLoggedIn ? (
            <UserDropdown />
          ) : (
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
                  <div>
                    <Field name="email" type="email" placeholder="Email" className="p-2 rounded text-black bg-white" />
                    <ErrorMessage name="email" component="div" className="text-red-300 text-sm" />
                  </div>
                  <div>
                    <Field name="password" type="password" placeholder="Senha" className="p-2 rounded text-black bg-white" />
                    <ErrorMessage name="password" component="div" className="text-red-300 text-sm" />
                  </div>                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-white text-green-700 px-4 py-2 rounded hover:bg-gray-200 font-semibold"
                  >
                    Entrar
                  </button>
                  {loginError && (
                    <div className="text-red-300 text-sm mt-2 md:mt-0">
                      {loginError}
                    </div>
                  )}
                </Form>
              )}
            </Formik>
          )}
        </div>
      </div>
    </header>
  );
}