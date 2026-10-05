# Klinische Studien in ELUCENIA suchen

Geben Sie wissenschaftliche Suchbegriffe ein und wählen Sie Kategorie und Suchumfang. Die Begriffe werden an NCBI gesendet; geben Sie keine Patientendaten ein.

## Methode und Fassung

NLM Clinical Study Categories · December2011

## Eingaben

- **Suchbegriffe** (`query`, `string`)
- **Studienkategorie** (`category`, `enum`)
  - `therapy`: Therapie
  - `diagnosis`: Diagnostik
  - `etiology`: Ätiologie
  - `prognosis`: Prognose
  - `prediction`: Klinische Vorhersageregeln
- **Suchumfang** (`scope`, `enum`)
  - `broad`: Breit · höhere Sensitivität
  - `narrow`: Eng · höhere Spezifität
- **Seite** (`page`, `integer`) [0–999]

## Grenzen und Prüfung

Filter bewerten nicht die Qualität einzelner Studien. Bis zu 10.000 Datensätze werden angezeigt; grenzen Sie größere Suchen ein. Dies ersetzt keine systematische Übersichtsarbeit.

Die Referenzen behalten die von NLM bereitgestellten Metadaten bei.

Zusammenfassungen und vollständige Artikel werden nicht wiedergegeben. Metadaten werden aktuell abgerufen; die Quelle kann Datensätze korrigieren.

Quelle: NLM / NCBI PubMed. Keine Empfehlung durch NLM.

Die technischen Prüfungen verwenden synthetische Daten. Eine unabhängige klinische Prüfung und eine professionelle Übersetzungsprüfung wurden nicht durchgeführt.

## Mit synthetischen Daten ausführen

```sh
node cli.cjs examples/input.json de
```

## Ergebnisse

- Gefundene Ergebnisse
- Angewandte Suchstrategie
- Interpretation der Suchanfrage durch PubMed
- Abgerufen am
- Die Referenzen behalten die von NLM bereitgestellten Metadaten bei.

## Quelle und Rechte

- https://pubmed.ncbi.nlm.nih.gov/help/#clinical-study-categories
- https://www.ncbi.nlm.nih.gov/home/about/policies/

[RIGHTS-SCOPE.md](../RIGHTS-SCOPE.md) · [test receipts](../evidence/)

Setzen Sie vor einer Live-Abfrage NCBI_TOOL_EMAIL auf die Kontaktadresse der für die Bereitstellung verantwortlichen Person. Ohne diese Einstellung verweigert die CLI die Abfrage. npm ci installiert die Versionen der Lockdatei. Verwenden Sie wissenschaftliche Suchbegriffe; senden Sie keine Patientenkennungen.

```sh
npm ci
npm test
```
