# Buscar estudios clínicos en ELUCENIA

Introduzca términos científicos y elija una categoría y un alcance. Los términos se envían a NCBI; no introduzca datos de pacientes.

## Método y edición

NLM Clinical Study Categories · December2011

## Entradas

- **Términos de búsqueda** (`query`, `string`)
- **Categoría del estudio** (`category`, `enum`)
  - `therapy`: Tratamiento
  - `diagnosis`: Diagnóstico
  - `etiology`: Etiología
  - `prognosis`: Pronóstico
  - `prediction`: Reglas de predicción clínica
- **Alcance** (`scope`, `enum`)
  - `broad`: Amplio · más sensible
  - `narrow`: Restringido · más específico
- **Página** (`page`, `integer`) [0–999]

## Límites y revisión

Los filtros no evalúan la calidad de cada estudio. Se muestran hasta 10.000 registros; refine las búsquedas más amplias. No sustituye una revisión sistemática.

Las referencias conservan los metadatos proporcionados por NLM.

No se reproducen resúmenes ni artículos completos. Los metadatos se obtienen en directo; la fuente puede corregir los registros.

Fuente: NLM / NCBI PubMed. Sin respaldo de NLM.

Las comprobaciones técnicas utilizan datos sintéticos. No se han realizado una revisión clínica independiente ni una revisión profesional de las traducciones.

## Ejecutar con datos sintéticos

```sh
node cli.cjs examples/input.json es
```

## Resultados

- Resultados encontrados
- Estrategia de búsqueda aplicada
- Interpretación de la consulta por PubMed
- Consultado el
- Las referencias conservan los metadatos proporcionados por NLM.

## Fuente y derechos

- https://pubmed.ncbi.nlm.nih.gov/help/#clinical-study-categories
- https://www.ncbi.nlm.nih.gov/home/about/policies/

[RIGHTS-SCOPE.md](../RIGHTS-SCOPE.md) · [test receipts](../evidence/)

Antes de una consulta real, configure NCBI_TOOL_EMAIL con el contacto del responsable de la implementación. Sin esta configuración, la CLI rechaza la consulta. npm ci instala las versiones del archivo de bloqueo. Use términos científicos; no envíe identificadores de pacientes.

```sh
npm ci
npm test
```
