# Design System do Affine

## Tokens

Fonte única dos tokens:

- Cores: src/shared/colors.js (exportado e usado no tailwind.config.js)
- Fontes, raios, tamanhos: theme.extend em tailwind.config.js

### Cores

Use sempre o token pelo papel, nunca pela aparência ("o azul", "o laranja claro").

| Classe                                     | Caso de uso                                                      |
| ------------------------------------------ | ---------------------------------------------------------------- |
| `primary`                                  | header, bottom nav, stepper, preenchimento da barra de maturação |
| `accent`                                   | botão principal, botão "+" central                               |
| `accent-strong`                            | texto/borda de chip ativo e badge                                |
| `accent-soft`                              | fundo de chip ativo e badge                                      |
| `background`                               | fundo de toda tela                                               |
| `surface`                                  | cards, inputs, botão secundário                                  |
| `border`                                   | borda de card, área tracejada                                    |
| `border-input`                             | borda de input, chip inativo, botão secundário                   |
| `tag`                                      | fundo de tag ("Lote #..."), círculo numerado de etapa            |
| `text` / `text-muted` / `text-placeholder` | texto principal / meta / placeholder                             |
| `success`                                  | etapas concluídas, data de previsão                              |
| `track`                                    | trilho de barras de progresso                                    |

Exemplos: `bg-primary`, `text-accent-strong`, `border-border-input`, `bg-accent-soft`.

### Raio

| Classe         | Valor | Uso                                                     |
| -------------- | ----- | ------------------------------------------------------- |
| `rounded-sm`   | 6px   | inputs, botões, chips, badges, tags, stepper            |
| `rounded-md`   | 8px   | cards, área "Adicionar"                                 |
| `rounded-lg`   | 12px  | card de destaque (Resumo Estoque)                       |
| `rounded-full` | —     | círculos (número de etapa, avatar, barras de progresso) |

### Borda

Sempre `border` (1px). Nunca `border-2` ou maior.

### Tipografia

React Native não aplica peso em fonte customizada: o peso é escolhido pela FAMÍLIA. Nunca use `font-bold`, `font-medium` etc.

| Classe               | Fonte                                           |
| -------------------- | ----------------------------------------------- |
| `font-title`         | PurplePurse, títulos de tela e de card destaque |
| `font-body`          | Poppins Regular, texto padrão                   |
| `font-body-medium`   | Poppins Medium, botões, títulos de card         |
| `font-body-semibold` | Poppins SemiBold, números de destaque           |

| Uso                                        | Classes                                                     |
| ------------------------------------------ | ----------------------------------------------------------- |
| Título de tela ("RECEITAS")                | `font-title text-lg uppercase tracking-widest text-primary` |
| Título de card destaque ("RESUMO ESTOQUE") | `font-title text-base uppercase tracking-wide text-primary` |
| Título de card                             | `font-body-medium text-sm text-text`                        |
| Label de campo                             | `font-body text-sm text-text`                               |
| Meta / secundário                          | `font-body text-xs text-text-muted`                         |
| Botão                                      | `font-body-medium text-sm`                                  |
| Badge / tag                                | `font-body text-xs`                                         |
| Label pequena (gráfico)                    | `font-body-medium text-2xs uppercase`                       |

### Espaçamento

Escala padrão do Tailwind (base 4): `p-3` = 12px, `p-4` = 16px, `gap-2` = 8px.

- Padding lateral da tela: `px-4`
- Padding interno de card: `p-3`
- Gap entre cards: `gap-2`
- Gap label → campo: `gap-1.5`
- Gap entre campos de formulário: `gap-4`

## Estilo dos ícones

Ícones em traço (outline), espessura 2px, cantos arredondados. Ex.: Lucide ou Phosphor (regular). Não misturar com ícones preenchidos.

## Checklist antes de entregar um componente

- [ ] Nenhuma cor, raio ou fonte hardcoded, só tokens
- [ ] Bordas de 1px; raio só dos tokens
- [ ] Títulos de seção em fonte display e caixa alta; o resto em Poppins
- [ ] No máximo 1 botão laranja por tela
- [ ] Sem sombras (o app usa borda, não sombra)
- [ ] Funciona em 360px de largura
