# Design System

Este documento descreve **intenção e regras**, não valores.
Os valores vivem no código e são a fonte da verdade:

- Cores → `src/shared/colors.js`
- Fontes, raios, tamanhos → `theme.extend` em `tailwind.config.js`
- Componentes prontos → `src/components/ui/index.ts`

Antes de criar algo, leia esses arquivos. Se este documento e o código discordarem, o código vence. Avise a divergência ao final da tarefa.

---

## 1. Identidade

Artesanal, sóbria e organizada. A interface lembra uma etiqueta de produto curado: fundo claro e quente, um azul-marinho de marca, um laranja que aparece pouco e sempre indica ação ou atenção.

- **Contraste por cor e borda, não por sombra.** Superfícies se separam com bordas finas.
- **Laranja é escasso.** Se tudo é laranja, nada é importante.
- **Densidade média.** Listas compactas, mas com respiro entre os blocos.

## 2. Cores: papéis

Use sempre o token pelo **papel**, nunca pela aparência ("o azul", "o laranja claro").

| Papel               | Token                                                                   | Onde                                               |
| ------------------- | ----------------------------------------------------------------------- | -------------------------------------------------- |
| Fundo               | `background`                                                            | fundo de toda tela                                 |
| Superfície          | `surface`                                                               | cards, inputs                                      |
| Marca / estrutura   | `primary`                                                               | header, navegação, progresso, botões de ícone      |
| Ação / atenção      | `accent`                                                                | fundo da ação principal da tela                    |
| Selecionado / prazo | `accent.soft` (fundo) + `accent.strong` (borda) + `accent.text` (texto) | chip ativo, item selecionado, badge de prazo       |
| Texto laranja       | `accent.text`                                                           | links e destaques em texto sobre fundo claro       |
| Texto               | `ink`, `ink.muted`, `ink.placeholder`                                   | hierarquia de leitura                              |
| Linhas              | `line`, `line.input`                                                    | borda de cards / de campos interativos, divisórias |
| Sobre uma cor       | `on.primary` (+ `subtle`, `faint`), `on.accent`                         | texto e ícones sobre `primary` ou `accent`         |
| Status positivo     | `success`                                                               | concluído, previsão ok                             |
| Neutro de apoio     | `tag`, `track`                                                          | etiquetas, trilho de progresso                     |

Convenção `on.*`: todo texto ou ícone sobre um fundo colorido usa `on.<fundo>`. Se surgir um fundo novo (ex.: `danger`), crie também o seu `on.danger`.

### Criando novos tokens de cor

Você **pode criar** um token de cor novo sem pedir permissão, desde que:

1. **Nenhum token existente cumpra o papel.** Verifique `colors.js` primeiro. Cor parecida com papel igual = reutilize.
2. **O nome seja semântico**, pelo papel e não pela aparência: `danger`, `warning.soft`, `info`. Nunca `red2`, `orangeLight`, `blueDark`.
3. **Siga a estrutura de grupos** (`DEFAULT` / `soft` / `strong`) quando a cor tiver variações, como já é feito em `accent`.
4. **Combine com a paleta:** mesma temperatura (tons quentes e terrosos), saturação parecida com `accent`, e contraste legível de texto sobre `surface` e `background`.
5. **Seja adicionado em `src/shared/colors.js`** com um comentário de uma linha dizendo onde é usado. Nunca como valor solto no componente.
6. **Seja informado** no resumo final da tarefa: nome, valor e motivo.

Hex direto no componente e valores arbitrários (`bg-[#...]`) continuam proibidos. Se a cor merece existir, ela vira token.

Para raio, fonte e espaçamento, **não crie** tokens novos sem perguntar. Eles definem o ritmo visual e devem continuar poucos.

## 3. Tipografia

- **Fonte de título** (`font-title`): só para o título de tela e o título de bloco de destaque. Sempre em caixa alta, com espaçamento entre letras. Nunca em texto corrido, botão ou label.
- **Fonte de corpo** (Poppins, `font-body*`): todo o resto.
- **Peso é escolhido pela família** (`font-body-medium`), nunca por `font-bold`/`font-medium`. O React Native não sintetiza peso em fonte customizada.
- Hierarquia em no máximo 3 níveis por card: título, conteúdo, meta (`ink.muted`).

## 4. Forma

- **Borda:** sempre fina (`border`). Espessura maior não faz parte da linguagem.
- **Raio:** elementos pequenos e interativos (campo, botão, chip, badge) usam o raio menor; containers (card) usam o médio; o bloco de destaque usa o maior. Círculos só para indicadores (número de etapa, avatar, progresso).
- **Sombra:** não existe, exceto a elevação do botão central da navegação.
- **Tracejado:** reservado para "área para adicionar algo".

## 5. Padrões de composição

- **Estrutura de tela:** Header → título de seção com linhas laterais → conteúdo com padding lateral padrão → navegação inferior. Use uma tela existente como modelo.
- **Ação principal:** no máximo uma por tela, larga, em `accent`. Ações secundárias usam superfície com borda e costumam vir em par.
- **Estado selecionado:** `accent.soft` de fundo + `accent.strong` na borda + `accent.text` no texto. Use o mesmo padrão para qualquer seleção (chip, item de lista, opção).
- **Alerta de prazo / atenção:** mesmo visual do selecionado, em formato de badge, alinhado à direita do título.
- **Metadados:** etiquetas neutras (`tag`) para identificadores; `ink.muted` para informações como "90 dias · 5 etapas".
- **Progresso:** contínuo (maturação) em `primary`; por etapas (segmentado) em `success`; trilho sempre `track`.
- **Formulários:** label acima do campo; placeholder sempre com exemplo real ("Ex.: Queijo temperado...").
- **Teclado:** toda tela com campo de texto precisa continuar rolável até o fim com o teclado aberto. Use `KeyboardScrollView` (`src/components/`) no lugar do `ScrollView`; em `FlatList`, passe `renderScrollComponent={(props) => <KeyboardScrollView {...props} />}`. Não use `KeyboardAvoidingView` nem espaçadores manuais.

## 6. Componentes

Consulte `src/components/ui/index.ts` antes de criar qualquer elemento. Prefira compor com o que existe.

Ao criar um componente novo:

1. Componha com os primitivos existentes antes de estilizar do zero.
2. Exponha variações por props (`variant`, `size`), não por componentes duplicados.
3. Adicione um JSDoc de uma linha dizendo quando usar.
4. Exporte no `index.ts`.

## 7. Checklist final

- [ ] Nenhum hex ou valor arbitrário no componente, só tokens
- [ ] Cores usadas pelo papel; tokens novos criados conforme a seção 2 e informados
- [ ] Peso de fonte via família
- [ ] Títulos de seção em fonte display e caixa alta; o resto em Poppins
- [ ] Sem sombra, borda fina (1px), raio conforme o tamanho do elemento
- [ ] No máximo uma ação principal em `accent` por tela
- [ ] Componente exportado no `index.ts` com JSDoc
- [ ] Funciona em 360px de largura
- [ ] Se a tela tem campo de texto: dá para rolar até o fim com o teclado aberto (`KeyboardScrollView`), sem `KeyboardAvoidingView`
