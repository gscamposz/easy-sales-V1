# VendaFácil

O **VendaFácil** é uma aplicação web desenvolvida para auxiliar no controle de produtos, vendedores e vendas. O sistema permite cadastrar produtos com foto, código, categoria, preço de custo, preço de venda, estoque, status e vendedor responsável.

A aplicação também conta com controle de vendedores, registro de vendas, histórico de movimentações e dashboard com indicadores importantes para acompanhamento do negócio.

## Funcionalidades

* Login de usuário com perfis de acesso;
* Cadastro, edição, visualização e exclusão de produtos;
* Upload de imagem/foto para cada produto;
* Código único para identificação dos produtos;
* Registro de preço de custo e preço de venda;
* Controle de estoque;
* Definição do vendedor responsável por cada produto;
* Cadastro e gerenciamento de vendedores;
* Registro de vendas com cliente, data, quantidade, desconto, forma de pagamento e valor total;
* Atualização automática do estoque após cada venda;
* Bloqueio de venda quando o estoque é insuficiente;
* Histórico completo de vendas;
* Filtros por produto, vendedor, status, categoria, data e forma de pagamento;
* Dashboard com total de produtos, vendas, estoque baixo e ranking de vendedores;
* Área de relatórios com informações de vendas, produtos e estoque;
* Interface moderna, responsiva e fácil de usar.

## Tecnologias utilizadas

* React
* JavaScript
* HTML
* CSS
* Vite

## Objetivo do projeto

O objetivo do VendaFácil é oferecer uma solução simples, prática e visual para pequenos negócios que precisam controlar seus produtos, saber com qual vendedor cada item está e acompanhar as vendas realizadas.

A aplicação foi criada com foco em organização, usabilidade e agilidade no gerenciamento comercial.

## Perfis de acesso

O sistema possui dois tipos de usuário:

### Administrador

Pode acessar todas as áreas do sistema, cadastrar produtos, vendedores, registrar vendas, visualizar relatórios e gerenciar informações.

### Vendedor

Pode acessar o sistema para visualizar produtos e registrar vendas.

## Dados de acesso para teste

Administrador:

```txt
Usuário: admin
Senha: admin123
```

Vendedor:

```txt
Usuário: vendedor
Senha: venda123
```

## Como executar o projeto

Clone o repositório:

```bash
git clone https://github.com/seu-usuario/nome-do-repositorio.git
```

Acesse a pasta do projeto:

```bash
cd nome-do-repositorio
```

Instale as dependências:

```bash
npm install
```

Execute o projeto:

```bash
npm run dev
```

Abra no navegador o endereço exibido no terminal, geralmente:

```txt
http://localhost:5173
```

## Status do projeto

Projeto em desenvolvimento, com funcionalidades principais implementadas para controle de produtos, vendedores e vendas.

## Autor

Desenvolvido por Gustavo Campos.
