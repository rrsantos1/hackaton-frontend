# Hackaton - Web


**Tecnologias**

Este projeto utiliza as seguintes tecnologias:

- [React](https://reactjs.org/)
- [Next.js](https://nextjs.org/)
- [Axios](https://axios-http.com/)
- [Tailwind](https://tailwindcss.com/)

**Pré-requisitos**

Antes de iniciar, certifique-se de ter as ferramentas instaladas:

- [Node.js](https://nodejs.org/)
- Gerenciador de pacotes (npm ou yarn)
- API e banco, siga as instruções do projeto: https://github.com/rrsantos1/hackaton
- API rodando no endereço: http://localhost:3000

**Estrutura do projeto**
```bash
hackaton-frontend/
│
├── /public
├── /components - Componentes reutilizáveis
├── /services - Chamadas HTTP (ex: API)
├── /contexts - Gerenciamento de estado
├── /pages - Páginas principais da aplicação
├── /styles - Configurações de estilos
├── /utils - Utilidades│ 
├── .env
├── package.json
├── README.md
├── .eslintrc.json
├── tailwind.config
├── postcss.config
├── tsconfig.json
├── tsconfig.node.json
├── next.config
└── .gitignore
```
#### Executando projeto localmente

Clone o projeto

```bash
  git clone https://github.com/rrsantos1/hackaton-frontend.git
```

Entre no diretório do projeto

```bash
  cd hackaton-frontend
```

Instale as dependências

```bash
  npm install
```
Inicie o servidor

```bash
  npm run dev
```


### **Rotas da Aplicação**

Abaixo estão listadas as principais rotas da aplicação:

| **Caminho (URL)**     | **Descrição**                        |
|-----------------------|--------------------------------------|
| `/`                      | Página principal da aplicação.       |
| `/about`                 | Página sobre o projeto.       |
| `/activities/activityPage` | Página de atividades |
| `/activities/createMenu`       | Página de criar atividade |
| `/activities/allActivities`     | Página para administração das atividades. |
| `/activities/{id}`                 | Página da atividade          |
| `/profile`                  | Página de perfil do usuário          |

### **Criando, editando e excluindo atividades**

Após rodar a API e banco através do projeto indicado, você terá um com as credenciais
- professor_luiza@fiap.com
- 123456