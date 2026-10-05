# ELUCENIA PubMed Clinical Queries

Original standalone per-tool transport, validation and authored10-language interface wording. `npm ci` installs the exact locked dependency graph; use Node22.18.0 or later. `npm test` uses controlled mock transport only. To run a live synthetic query set NCBI_TOOL_EMAIL to the responsible operator contact and run `node cli.cjs examples/input.json en`. Never send patient identifiers in search terms. The operation queries NCBI from the tool; users remain in the ELUCENIA site when this module is integrated there. This source package is not the complete PubMed website, a systematic review or clinical/translation approval.

See [RIGHTS-SCOPE.md](RIGHTS-SCOPE.md) and documentation/*.md for source policy, metadata status, paging and process-wide versus shared rate limits. Server createHandler() retains origin/type/body/rate guards and expects an HTTP integration; CLI uses search() directly and requires explicit contact. No .env, secrets, database, portal/dashboard layout or authentication source is included.

## Repeatable offline tests

`npm test` and `node test.cjs` run controlled mock requests without creating or overwriting reports. To preserve a new run explicitly, use `node test.cjs --record fresh-test-report.json`. The filename must be a simple local JSON filename and must not exist; creation uses exclusive `wx`. Historical reports and original test source remain evidence, not the operative test command. Live network transport is opt-in with `--live` and still requires NCBI_TOOL_EMAIL; default tests make no external requests.
