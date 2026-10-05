# Search clinical studies in ELUCENIA

Enter scientific search terms, then choose a category and scope. Terms are sent to NCBI; do not enter patient details.

## Method and edition

NLM Clinical Study Categories · December2011

## Inputs

- **Search terms** (`query`, `string`)
- **Study category** (`category`, `enum`)
  - `therapy`: Therapy
  - `diagnosis`: Diagnosis
  - `etiology`: Etiology
  - `prognosis`: Prognosis
  - `prediction`: Clinical prediction guides
- **Scope** (`scope`, `enum`)
  - `broad`: Broad · more sensitive
  - `narrow`: Narrow · more specific
- **Page** (`page`, `integer`) [0–999]

## Limits and review

Filters do not assess individual study quality. Up to 10,000 records are shown; refine larger searches. This does not replace a systematic review.

References retain the metadata supplied by NLM.

Abstracts and full articles are not reproduced. Metadata is retrieved live; the source may correct records.

Source: NLM / NCBI PubMed. No NLM endorsement.

Technical checks use synthetic data. Independent clinical review and professional translation review have not been performed.

## Run with synthetic data

```sh
node cli.cjs examples/input.json en
```

## Results

- Results found
- Applied search strategy
- PubMed query translation
- Retrieved at
- References retain the metadata supplied by NLM.

## Source and rights

- https://pubmed.ncbi.nlm.nih.gov/help/#clinical-study-categories
- https://www.ncbi.nlm.nih.gov/home/about/policies/

[RIGHTS-SCOPE.md](../RIGHTS-SCOPE.md) · [test receipts](../evidence/)

Before a live query, set NCBI_TOOL_EMAIL to the responsible deployment operator contact. Without this setting the CLI refuses the query. npm ci installs the dependency versions in the lockfile. Use scientific search terms; do not send patient identifiers.

```sh
npm ci
npm test
```
