# Servidor de Gerenciamento de Tarefas

Este é o backend para a aplicação de gerenciamento de tarefas, desenvolvido em Node.js com Express.js e Firestore. O objetivo é permitir o cadastro e a listagem de tarefas.

## Funcionalidades

- Cadastrar novas tarefas em lote.
- Listar todas as tarefas cadastradas.
- Salvar automaticamente o hostname do servidor junto com cada tarefa inserida.
- Validação dos dados de entrada para cadastro de tarefas.
- Tratamento de erros centralizado.

## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript.
- **Express.js**: Framework web para Node.js.
- **Firebase Admin SDK**: Para integração com o Firestore.
- **Firestore**: Banco de dados NoSQL na nuvem para armazenar as tarefas.
- **Joi**: Para validação de schemas dos dados de entrada.
- **Dotenv**: Para gerenciamento de variáveis de ambiente.
- **Jest**: Framework para testes unitários e de integração.
- **Supertest**: Para testes de integração de API HTTP.
- **Yarn**: Gerenciador de pacotes.

## Pré-requisitos

- Node.js ou superior ([Instalar Node.js](https://nodejs.org/))
- Yarn ([Instalar Yarn](https://classic.yarnpkg.com/en/docs/install/))
- Uma conta Google para acesso ao Firebase.

## Configuração do Projeto e Firebase

Siga os passos abaixo para configurar o ambiente e o Firebase:

### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio>
```

### 2. Configurar o Firebase

#### a. Criar um Projeto no Firebase

1.  Acesse o [Console do Firebase](https://console.firebase.google.com/).
2.  Clique em "**Adicionar projeto**" (ou selecione um projeto existente).
3.  Siga as instruções na tela para nomear e criar seu projeto. Desative o Google Analytics para este projeto se não for necessário, para uma configuração mais rápida.

#### b. Gerar a Chave de Serviço (Arquivo JSON)

Esta chave permite que seu servidor backend se autentique com os serviços do Firebase de forma segura.

1.  No Console do Firebase, com seu projeto selecionado, vá para "**Configurações do projeto**" (clique no ícone de engrenagem ⚙️ no menu lateral esquerdo, próximo a "Visão geral do projeto").
2.  Na página de Configurações, vá para a aba "**Contas de serviço**".
3.  Na seção "SDK Admin do Firebase", certifique-se de que "Node.js" está selecionado.
4.  Clique no botão "**Gerar nova chave privada**".
5.  Um aviso aparecerá. Clique em "**Gerar chave**".
6.  Um arquivo JSON será baixado automaticamente pelo seu navegador (ex: `nome-do-projeto-firebase-adminsdk-xxxxx-xxxxxxxxx.json`).

#### c. Colocar o Arquivo de Chave na Raiz do Projeto

1.  Renomeie o arquivo JSON baixado para algo simples, por exemplo: `chave-firebase.json`.
2.  Mova este arquivo `chave-firebase.json` para a **pasta raiz** do seu projeto backend.

    ```
    seu-projeto-backend/
    ├── src/
    ├── tests/
    ├── .env
    ├── .env.example
    ├── chave-firebase.json  <-- COLOQUE AQUI
    ├── package.json
    ├── README.md
    └── server.js
    ```

#### d. Configurar o Firestore Database

1.  Ainda no Console do Firebase, no menu lateral esquerdo, clique em "**Firestore Database**" (na seção "Criação").
2.  Clique em "**Criar banco de dados**".
3.  Escolha o modo de segurança:
    - **Iniciar em modo de produção**: Recomendado, mas você precisará configurar regras de segurança para permitir leitura e escrita.
    - **Iniciar em modo de teste**: Permite leituras e escritas abertas por um período limitado (geralmente 30 dias).
    - Para este projeto, vamos assumir **modo de teste** para facilitar a configuração inicial. Selecione-o e clique em "Avançar".
4.  Escolha a **localização do Cloud Firestore**. Selecione a região mais próxima de você. Esta escolha é permanente.
5.  Clique em "**Ativar**".

Seu banco de dados Firestore está pronto. A coleção `tasks` será criada automaticamente pela aplicação quando a primeira tarefa for inserida.

### 3. Configurar Variáveis de Ambiente

1.  Na raiz do projeto, copie o arquivo `.env.example` para um novo arquivo chamado `.env`:
    ```bash
    cp .env.example .env
    ```
2.  Abra o arquivo `.env` e edite-o. Você precisará configurar a variável `GOOGLE_APPLICATION_CREDENTIALS` para apontar para o arquivo JSON da chave de serviço que você colocou na raiz:

    ```dotenv
    # .env
    PORT=8085
    GOOGLE_APPLICATION_CREDENTIALS="./chave-firebase.json"
    ```

    - `PORT`: A porta onde o servidor irá rodar (padrão: 8085).
    - `GOOGLE_APPLICATION_CREDENTIALS`: O caminho para o seu arquivo de chave. O `./` indica que o arquivo está na mesma pasta que o `server.js` (a raiz do projeto).

3.  **Importante**: Certifique-se de que o nome do arquivo no `.env` corresponda exatamente ao nome do arquivo JSON que você colocou na raiz.

### 4. Instalar Dependências

Use o Yarn para instalar todas as dependências listadas no `package.json`:

```bash
yarn install
```

ou simplesmente:

```bash
yarn
```

## Executando a Aplicação

Após a configuração e instalação das dependências, você pode iniciar o servidor:

- **Para Desenvolvimento (com Nodemon, reinicia automaticamente ao salvar arquivos):**
  ```bash
  yarn dev
  ```
- **Para Produção (ou para rodar sem o Nodemon):**
  ```bash
  yarn start
  ```

Ao iniciar, você deverá ver mensagens no console indicando que o servidor está rodando e a porta que está utilizando (ex: `Servidor rodando na porta 8085`).

## Executando os Testes

Para rodar todos os testes unitários e de integração:

```bash
yarn test
```

Para rodar os testes em modo CI (sem watch e com relatório de cobertura):

```bash
yarn test:ci
```

## Documentação dos Endpoints da API

A URL base para os endpoints, se rodando localmente, será `http://localhost:PORT` (onde `PORT` é o valor definido no seu arquivo `.env`, por padrão `8085`).

---

### 1. Inserir Tarefas

- **Endpoint:** `POST /insert-tasks`
- **Descrição:** Cadastra uma ou mais tarefas no sistema. Para cada tarefa inserida, o nome do computador (hostname do servidor onde o backend está rodando) e um timestamp de criação são adicionados automaticamente.
- **Content-Type:** `application/json`
- **Corpo da Requisição (Payload):** Um array de objetos, onde cada objeto representa uma tarefa.

  **Estrutura de cada objeto Tarefa no array:**

  - `description` (String, obrigatório): Descrição da tarefa. Mínimo de 3 caracteres.
  - `responsable` (String, obrigatório): Nome do responsável pela tarefa. Mínimo de 2 caracteres.
  - `status` (String, obrigatório): Status da tarefa. Valores permitidos: `"todo"`, `"doing"`, `"done"`.

  **Exemplo de Corpo da Requisição:**

  ```json
  [
    {
      "description": "Criar Login",
      "responsable": "daniel",
      "status": "done"
    }
  ]
  ```

- **Respostas:**

  - **`201 Created` (Sucesso):** Tarefas inseridas com sucesso. O corpo da resposta será um array contendo as tarefas salvas, cada uma com um `id` gerado pelo sistema, o campo `computer` (hostname do servidor) e `createdAt` (timestamp).
    **Exemplo de Resposta de Sucesso:**

    ```json
    [
      {
        "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        "description": "Criar Login",
        "responsable": "daniel",
        "status": "done",
        "computer": "hostname-do-servidor-backend",
        "createdAt": "2025-05-17T00:20:56.123Z"
      }
    ]
    ```

  - **`400 Bad Request` (Erro de Validação):** Se os dados enviados forem inválidos (ex: campos faltando, tipo de dado incorreto, array vazio). O corpo da resposta conterá uma mensagem de erro e detalhes.
    **Exemplo de Resposta de Erro de Validação:**

    ```json
    {
      "message": "Erro de validação.",
      "details": "O campo descrição é obrigatório"
    }
    ```

  - **`500 Internal Server Error` (Erro no Servidor):** Se ocorrer um problema inesperado no servidor durante o processamento da requisição.
    **Exemplo de Resposta de Erro no Servidor:**
    ```json
    {
      "message": "error",
      "details": "Ocorreu um erro interno no servidor."
    }
    ```

---

### 2. Listar Todas as Tarefas

- **Endpoint:** `GET /get-tasks`
- **Descrição:** Retorna uma lista de todas as tarefas cadastradas no sistema, ordenadas pela data de criação (mais recentes primeiro).
- **Respostas:**

  - **`200 OK` (Sucesso):** Retorna um array JSON contendo todas as tarefas. Se não houver tarefas, retorna um array vazio `[]`.
    **Exemplo de Resposta de Sucesso:**

    ```json
    [
      {
        "id": "1",
        "description": "Criar CRUD",
        "responsable": "daniel",
        "status": "done",
        "computer": "hostname-do-servidor-backend"
      },
      {
        "id": "2",
        "description": "Criar Login",
        "responsable": "daniel",
        "status": "done",
        "computer": "hostname-do-servidor-backend"
      }
    ]
    ```

  - **`500 Internal Server Error` (Erro no Servidor):** Se ocorrer um problema ao buscar as tarefas no Firestore.
    **Exemplo de Resposta de Erro no Servidor:**
    ```json
    {
      "message": "error",
      "details": "Ocorreu um erro interno no servidor."
    }
    ```
