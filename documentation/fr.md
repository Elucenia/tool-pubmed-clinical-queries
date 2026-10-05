# Rechercher des études cliniques dans ELUCENIA

Saisissez des termes scientifiques, puis choisissez une catégorie et une portée. Les termes sont envoyés au NCBI ; ne saisissez pas de données de patients.

## Méthode et édition

NLM Clinical Study Categories · December2011

## Entrées

- **Termes de recherche** (`query`, `string`)
- **Catégorie d’étude** (`category`, `enum`)
  - `therapy`: Traitement
  - `diagnosis`: Diagnostic
  - `etiology`: Étiologie
  - `prognosis`: Pronostic
  - `prediction`: Règles de prédiction clinique
- **Portée** (`scope`, `enum`)
  - `broad`: Large · plus sensible
  - `narrow`: Étroite · plus spécifique
- **Page** (`page`, `integer`) [0–999]

## Limites et révision

Les filtres n’évaluent pas la qualité de chaque étude. Jusqu’à 10 000 références sont affichées ; affinez les recherches plus larges. Cela ne remplace pas une revue systématique.

Les références conservent les métadonnées fournies par la NLM.

Les résumés et les articles complets ne sont pas reproduits. Les métadonnées sont obtenues en direct ; la source peut corriger les références.

Source : NLM / NCBI PubMed. Sans approbation de la NLM.

Les vérifications techniques utilisent des données synthétiques. La révision clinique indépendante et la révision professionnelle des traductions n’ont pas été effectuées.

## Exécuter avec des données synthétiques

```sh
node cli.cjs examples/input.json fr
```

## Résultats

- Résultats trouvés
- Stratégie de recherche appliquée
- Interprétation de la requête par PubMed
- Consulté le
- Les références conservent les métadonnées fournies par la NLM.

## Source et droits

- https://pubmed.ncbi.nlm.nih.gov/help/#clinical-study-categories
- https://www.ncbi.nlm.nih.gov/home/about/policies/

[RIGHTS-SCOPE.md](../RIGHTS-SCOPE.md) · [test receipts](../evidence/)

Avant une requête réelle, définissez NCBI_TOOL_EMAIL avec le contact du responsable du déploiement. Sans ce paramètre, la CLI refuse la requête. npm ci installe les versions du fichier de verrouillage. Utilisez des termes scientifiques ; ne transmettez aucun identifiant de patient.

```sh
npm ci
npm test
```
