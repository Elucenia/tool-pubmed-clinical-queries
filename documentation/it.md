# Cercare studi clinici in ELUCENIA

Inserisci termini scientifici e scegli una categoria e un ambito. I termini vengono inviati a NCBI; non inserire dati dei pazienti.

## Metodo ed edizione

NLM Clinical Study Categories · December2011

## Dati in ingresso

- **Termini di ricerca** (`query`, `string`)
- **Categoria dello studio** (`category`, `enum`)
  - `therapy`: Terapia
  - `diagnosis`: Diagnosi
  - `etiology`: Eziologia
  - `prognosis`: Prognosi
  - `prediction`: Regole di predizione clinica
- **Ambito** (`scope`, `enum`)
  - `broad`: Ampio · più sensibile
  - `narrow`: Ristretto · più specifico
- **Pagina** (`page`, `integer`) [0–999]

## Limiti e revisione

I filtri non valutano la qualità dei singoli studi. Vengono mostrati fino a 10.000 record; restringi le ricerche più ampie. Non sostituisce una revisione sistematica.

I riferimenti mantengono i metadati forniti da NLM.

Non vengono riprodotti abstract o articoli completi. I metadati vengono recuperati in tempo reale; la fonte può correggere i record.

Fonte: NLM / NCBI PubMed. Nessuna approvazione da parte di NLM.

Le verifiche tecniche usano dati sintetici. Non sono state eseguite una revisione clinica indipendente e una revisione professionale delle traduzioni.

## Eseguire con dati sintetici

```sh
node cli.cjs examples/input.json it
```

## Risultati

- Risultati trovati
- Strategia di ricerca applicata
- Interpretazione della ricerca da parte di PubMed
- Consultato il
- I riferimenti mantengono i metadati forniti da NLM.

## Fonte e diritti

- https://pubmed.ncbi.nlm.nih.gov/help/#clinical-study-categories
- https://www.ncbi.nlm.nih.gov/home/about/policies/

[RIGHTS-SCOPE.md](../RIGHTS-SCOPE.md) · [test receipts](../evidence/)

Prima di una ricerca reale, impostare NCBI_TOOL_EMAIL con il contatto del responsabile della distribuzione. Senza questa impostazione la CLI rifiuta la ricerca. npm ci installa le versioni del file di blocco. Usare termini scientifici; non inviare identificativi dei pazienti.

```sh
npm ci
npm test
```
