# Pesquisar estudos clínicos na ELUCENIA

Digite termos científicos, escolha a categoria e a abrangência. Os termos são enviados ao NCBI; não informe dados de pacientes.

## Método e edição

NLM Clinical Study Categories · December2011

## Entradas

- **Termos de busca** (`query`, `string`)
- **Categoria do estudo** (`category`, `enum`)
  - `therapy`: Terapia
  - `diagnosis`: Diagnóstico
  - `etiology`: Etiologia
  - `prognosis`: Prognóstico
  - `prediction`: Regras de predição clínica
- **Abrangência** (`scope`, `enum`)
  - `broad`: Ampla · mais sensível
  - `narrow`: Restrita · mais específica
- **Página** (`page`, `integer`) [0–999]

## Limites e revisão

Filtros não avaliam a qualidade de cada estudo. São exibidos até 10.000 registros; refine buscas maiores. Não substitui uma revisão sistemática.

As referências mantêm os metadados fornecidos pela NLM.

Não são reproduzidos resumos nem artigos completos. Os metadados são obtidos ao vivo; a fonte pode corrigir os registros.

Fonte: NLM / NCBI PubMed. Sem endosso da NLM.

Conferência técnica com dados sintéticos. Revisão clínica independente e revisão profissional das traduções não foram realizadas.

## Executar com dados sintéticos

```sh
node cli.cjs examples/input.json pt-BR
```

## Resultados

- Resultados encontrados
- Estratégia aplicada
- Interpretação da busca pelo PubMed
- Consultado em
- As referências mantêm os metadados fornecidos pela NLM.

## Fonte e direitos

- https://pubmed.ncbi.nlm.nih.gov/help/#clinical-study-categories
- https://www.ncbi.nlm.nih.gov/home/about/policies/

[RIGHTS-SCOPE.md](../RIGHTS-SCOPE.md) · [test receipts](../evidence/)

Antes da consulta real, defina NCBI_TOOL_EMAIL com o contato do responsável pela implantação. Sem essa configuração, a CLI recusa a consulta. npm ci instala as dependências nas versões do lockfile. As consultas podem conter termos científicos; não envie identificadores de pacientes.

```sh
npm ci
npm test
```
