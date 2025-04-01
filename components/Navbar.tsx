import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import logo from "../public/logo.jpg";
import * as Yup from "yup";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import { useAuth } from "../context/authContext"; // importe o contexto

export default function Navbar() {
  const router = useRouter();
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const [loginError, setLoginError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    router.push("/");
  };

  const initialValues = { email: "", password: "" };

  const validationSchema = Yup.object({
    email: Yup.string().email("Email inválido").required("Obrigatório"),
    password: Yup.string().required("Obrigatório"),
  });

  const onSubmit = async (
    values: { email: string; password: string },
    { resetForm }: FormikHelpers<{ email: string; password: string }>
  ) => {
    setLoginError("");
    try {
      const response = await axios.post("http://localhost:3001/user/signin", values);
  
      if (response.status === 200) {
        // Extraindo os dados retornados
        const { token, userId, name, email, role } = response.data;
        console.log("Login efetuado com sucesso:", response.data);
        
        // Armazenando o token
        localStorage.setItem("token", token);
        // Armazenando os dados do usuário em um objeto personalizado
        const userData = { id: userId, name, email, role };
        localStorage.setItem("user", JSON.stringify(userData));
        
        setIsLoggedIn(true);
        resetForm();
        router.push("/dashboard");
      } else {
        setLoginError(response.data.message ?? "Erro ao efetuar login");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      if (axios.isAxiosError(error) && error.response) {
        setLoginError(error.response.data?.message ?? "Erro ao efetuar login.");
      } else {
        setLoginError("Erro ao efetuar login.");
      }
    }
  };  

  return (
    <header className="bg-green-700 text-white w-full py-4">
      <div className="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <p className="text-2xl font-bold">Hackaton</p>
        <nav className="flex space-x-4 mb-4 md:mb-0 font-semibold">
          <Link
            href={isLoggedIn ? "/dashboard" : "/"}
            className="bg-white text-green-700 px-4 py-2 rounded hover:bg-gray-200 transition"
          >
            Home
          </Link>          
          <Link
            href="/about"
            className="bg-white text-green-700 px-4 py-2 rounded hover:bg-gray-200 transition"
          >
            Sobre
          </Link>
        </nav>
        <div className="w-full md:w-auto">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-white text-green-700 px-4 py-2 rounded hover:bg-gray-200 font-semibold"
            >
              Sair
            </button>
          ) : (
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
                  <div>
                    <Field
                      name="email"
                      type="email"
                      placeholder="Email"
                      className="p-2 rounded text-black bg-white"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-300 text-sm"
                    />
                  </div>
                  <div>
                    <Field
                      name="password"
                      type="password"
                      placeholder="Senha"
                      className="p-2 rounded text-black bg-white"
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-300 text-sm"
                    />
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