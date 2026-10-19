# MTGÁS · Reunião Semanal de O&M

Apresentação web em **Quarto + Reveal.js** para condução da reunião semanal de Operação e Manutenção.

## Uso semanal

1. Edite `data/meeting.json` com os dados reais da semana.
2. Ao fechar a reunião, copie o JSON para `data/archive/AAAA-WXX.json` para manter o histórico.
3. Faça `Commit changes` no GitHub.
4. O workflow em `.github/workflows/publish.yml` renderiza e publica automaticamente no GitHub Pages.

> O arquivo inicial contém dados de exemplo para demonstrar o layout. Substitua-os antes do uso oficial.

## Estrutura

```text
new-project/
├── index.qmd
├── _quarto.yml
├── styles.css
├── assets/logo-om.svg
├── data/meeting.json
├── scripts/include.html
├── scripts/meeting.js
└── .github/workflows/publish.yml
```

## Página publicada

`https://mwbm07.github.io/new-project/`

## Edição pelo navegador

Abra `data/meeting.json` no GitHub, clique em **Edit this file**, faça os ajustes e depois em **Commit changes**. O workflow refaz a publicação.

## Atalhos da apresentação

- `→`, `Espaço` ou `N`: próximo slide
- `←` ou `P`: slide anterior
- `F`: tela cheia
- `O`: visão geral dos slides

## Identidade visual

O arquivo `assets/logo-om.svg` é um lockup criado especificamente para este modelo e pode ser substituído posteriormente pela marca oficial da MTGÁS.
