Esse projeto está sendo desenvolvido para o hackaton do curso de Pós Graduação de Desenvolvimento Fullstack da Fiap.

Utiliza React com Next JS, Typescript e Tailwind 4 para a estilização.

O layout é composto pelo Navbar (com o menu superior com as opções Home e Sobre e o formulário de login, se não estiver logado e a opção de sair se estiver logado), o footer e o sidebar (Só é exibido se estiver logado).

Ao fazer o cadastro o usuário recebe um e-mail para a confirmação do cadastro, e após a confirmação (página verify) pode fazer o login (página login).

Após o login, o sidebar exibe a opção de atividades, que possui 2 cards: criação de uma nova atividade ou listagem de 2 atividades. A criar uma nova atividade, é aberto o modal (componente createActivityModal.tsx) onde deverá ser escolhido o tipo de atividade, e a partir dai o componente correspondente é acionado. A listagem de atividades exibe todas as atividades cadastradas, com a opção de filtros por categoria ou tipo, e ao clicar no card a atividade é exibida. O botão de gerar link serve para que o professor gere a atividade e encaminhe o link para o aluno, sem que esse precise ser cadastrado na plataforma.