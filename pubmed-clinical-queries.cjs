'use strict';

// Original ELUCENIA interface/transport. Search strategies are published by NLM:
// https://pubmed.ncbi.nlm.nih.gov/help/#clinical-study-categories (December 2011).
// Live metadata is NLM-supplied. No abstracts, full articles or patient records are fetched.
const { Parser } = require('htmlparser2');
const ENDPOINT = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
const METHOD = 'NLM Clinical Study Categories, revised December 2011';
const PAGE_SIZE = 10;
// Operational contact authorized by ELUCENIA for this NCBI integration.
// A deployment may override it; an explicitly empty/invalid override is rejected.
const DEFAULT_NCBI_TOOL_EMAIL = 'felipe@elucenia.org';
const FILTERS = Object.freeze({
  therapy: Object.freeze({
    broad: '((clinical[Title/Abstract] AND trial[Title/Abstract]) OR clinical trials as topic[MeSH Terms] OR clinical trial[Publication Type] OR random*[Title/Abstract] OR random allocation[MeSH Terms] OR therapeutic use[MeSH Subheading])',
    narrow: '(randomized controlled trial[Publication Type] OR (randomized[Title/Abstract] AND controlled[Title/Abstract] AND trial[Title/Abstract]))',
  }),
  diagnosis: Object.freeze({
    broad: '(sensitiv*[Title/Abstract] OR sensitivity and specificity[MeSH Terms] OR diagnose[Title/Abstract] OR diagnosed[Title/Abstract] OR diagnoses[Title/Abstract] OR diagnosing[Title/Abstract] OR diagnosis[Title/Abstract] OR diagnostic[Title/Abstract] OR diagnosis[MeSH:noexp] OR (diagnostic equipment[MeSH:noexp] OR diagnostic errors[MeSH:noexp] OR diagnostic imaging[MeSH:noexp] OR diagnostic services[MeSH:noexp]) OR diagnosis, differential[MeSH:noexp] OR diagnosis[Subheading:noexp])',
    narrow: '(specificity[Title/Abstract])',
  }),
  etiology: Object.freeze({
    broad: '(risk*[Title/Abstract] OR risk*[MeSH:noexp] OR (risk adjustment[MeSH:noexp] OR risk assessment[MeSH:noexp] OR risk factors[MeSH:noexp] OR risk management[MeSH:noexp] OR risk taking[MeSH:noexp]) OR cohort studies[MeSH Terms] OR group[Text Word] OR groups[Text Word] OR grouped [Text Word])',
    narrow: '((relative[Title/Abstract] AND risk*[Title/Abstract]) OR (relative risk[Text Word]) OR risks[Text Word] OR cohort studies[MeSH:noexp] OR (cohort[Title/Abstract] AND study[Title/Abstract]) OR (cohort[Title/Abstract] AND studies[Title/Abstract]))',
  }),
  prognosis: Object.freeze({
    broad: '(incidence[MeSH:noexp] OR mortality[MeSH Terms] OR follow up studies[MeSH:noexp] OR prognos*[Text Word] OR predict*[Text Word] OR course*[Text Word])',
    narrow: '(prognos*[Title/Abstract] OR (first[Title/Abstract] AND episode[Title/Abstract]) OR cohort[Title/Abstract])',
  }),
  prediction: Object.freeze({
    broad: '(predict*[Title/Abstract] OR predictive value of tests[MeSH Terms] OR score[Title/Abstract] OR scores[Title/Abstract] OR scoring system[Title/Abstract] OR scoring systems[Title/Abstract] OR observ*[Title/Abstract] OR observer variation[MeSH Terms])',
    narrow: '(validation[Title/Abstract] OR validate[Title/Abstract])',
  }),
});

class SearchError extends Error {
  constructor(code, status = 400) { super(code); this.code = code; this.status = status; }
}
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function validateInput(input) {
  if (!object(input) || Object.getPrototypeOf(input) !== Object.prototype) throw new SearchError('INVALID_INPUT');
  const keys = ['query', 'category', 'scope', 'page'];
  if (Object.keys(input).length !== keys.length || keys.some(key => !Object.hasOwn(input, key)) || Object.keys(input).some(key => !keys.includes(key))) throw new SearchError('INVALID_INPUT');
  if (typeof input.query !== 'string' || input.query.trim().length < 2 || input.query.length > 500 || /[\u0000-\u001f\u007f#]/u.test(input.query)) throw new SearchError('INVALID_INPUT');
  if (!Object.hasOwn(FILTERS, input.category) || !Object.hasOwn(FILTERS[input.category], input.scope)) throw new SearchError('INVALID_INPUT');
  if (!Number.isInteger(input.page) || input.page < 0 || input.page > 999) throw new SearchError('INVALID_INPUT');
  let depth = 0, quoted = false;
  for (const character of input.query) {
    if (character === '"') quoted = !quoted;
    if (!quoted && character === '(') depth++;
    if (!quoted && character === ')' && --depth < 0) throw new SearchError('INVALID_INPUT');
  }
  if (depth !== 0 || quoted) throw new SearchError('INVALID_INPUT');
  return { query: input.query.trim(), category: input.category, scope: input.scope, page: input.page };
}
function buildQuery(input) {
  const checked = validateInput(input);
  return '(' + checked.query + ') AND ' + FILTERS[checked.category][checked.scope];
}
function text(value, max = 2000) {
  if (typeof value !== 'string' || value.length > max) throw new SearchError('UPSTREAM_INVALID', 502);
  const pieces = [];
  const parser = new Parser({ ontext: chunk => pieces.push(chunk) }, { decodeEntities: true });
  parser.write(value); parser.end();
  return pieces.join('').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/gu, '').trim();
}
function parseSearch(data, input) {
  const source = data?.esearchresult;
  if (data?.error || source?.errorlist) throw new SearchError('QUERY_NOT_ACCEPTED', 422);
  if (!object(source) || !/^\d{1,10}$/.test(source.count) || !Array.isArray(source.idlist) || source.idlist.length > PAGE_SIZE || source.idlist.some(id => typeof id !== 'string' || !/^\d{1,10}$/.test(id)) || new Set(source.idlist).size !== source.idlist.length || String(input.page * PAGE_SIZE) !== String(source.retstart)) throw new SearchError('UPSTREAM_INVALID', 502);
  const count = Number(source.count);
  if (!Number.isSafeInteger(count)) throw new SearchError('UPSTREAM_INVALID', 502);
  return { count, ids: source.idlist, queryTranslation: typeof source.querytranslation === 'string' ? text(source.querytranslation, 20000) : '', warnings: Object.values(source.warninglist || {}).flat().filter(x => typeof x === 'string').map(x => text(x, 1000)).slice(0, 10) };
}
function parseSummaries(data, ids) {
  if (!object(data?.result) || !Array.isArray(data.result.uids) || ids.some(id => !data.result.uids.includes(id))) throw new SearchError('UPSTREAM_INVALID', 502);
  return ids.map(id => {
    const row = data.result[id];
    if (!object(row) || row.error || String(row.uid) !== id || !Array.isArray(row.authors)) throw new SearchError('UPSTREAM_INVALID', 502);
    const doi = (Array.isArray(row.articleids) ? row.articleids : []).find(item => item?.idtype === 'doi');
    return { pmid: id, title: text(row.title), authors: row.authors.slice(0, 12).map(author => text(author?.name, 200)), additionalAuthors: row.authors.length > 12, journal: text(row.fulljournalname || row.source || '', 300), publicationDate: text(row.pubdate || '', 100), doi: doi && /^10\.\d{4,9}\/[^\s]{1,250}$/.test(doi.value) ? doi.value : '', originalMetadata: true };
  });
}
async function readJson(response, maxBytes = 1048576) {
  if (!response.ok) throw new SearchError(response.status === 429 ? 'UPSTREAM_RATE_LIMITED' : 'UPSTREAM_UNAVAILABLE', response.status === 429 ? 429 : 502);
  if (Number(response.headers.get('content-length')) > maxBytes || !response.body) throw new SearchError('UPSTREAM_INVALID', 502);
  const reader = response.body.getReader(), parts = []; let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) { await reader.cancel(); throw new SearchError('UPSTREAM_INVALID', 502); }
      parts.push(value);
    }
    const bytes = new Uint8Array(length); let offset = 0;
    for (const part of parts) { bytes.set(part, offset); offset += part.byteLength; }
    try { return JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new SearchError('UPSTREAM_INVALID', 502); }
  } finally { reader.releaseLock(); }
}
async function readInput(request) {
  if (!request.body) throw new SearchError('INVALID_INPUT');
  const reader=request.body.getReader();let total=0;const parts=[];
  try {
    for (;;) {const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>4096){await reader.cancel();throw new SearchError('INVALID_INPUT',413);}parts.push(value);}
    const bytes=new Uint8Array(total);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.byteLength;}
    try {return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch {throw new SearchError('INVALID_INPUT');}
  } finally {reader.releaseLock();}
}
// This gate belongs to one Node process. A multi-instance deployment requires one
// shared outbound limiter for every NCBI consumer behind the same public IP.
function createGate({ intervalMs = 400, now = () => performance.now(), delay = ms => new Promise(resolve => setTimeout(resolve, ms)) } = {}) {
  let tail = Promise.resolve(), lastStart = -Infinity;
  return async function gate() {
    const previous = tail; let release;
    tail = new Promise(resolve => { release = resolve; });
    await previous;
    try {
      const wait = intervalMs - (now() - lastStart);
      if (wait > 0) await delay(wait);
      lastStart = now();
    } finally { release(); }
  };
}
const defaultGate = createGate();
async function search(input, { fetchImpl = fetch, contactEmail, gate = defaultGate, signal } = {}) {
  const checked = validateInput(input);
  if (typeof contactEmail !== 'string' || !/^[A-Za-z0-9.!#$%&'*+\-/=?^_`{|}~]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(contactEmail) || contactEmail.length > 254) throw new SearchError('SERVICE_NOT_CONFIGURED', 503);
  const query = buildQuery(checked);
  async function call(name, parameters) {
    await gate();
    const url = new URL(name + '.fcgi', ENDPOINT);
    for (const [key, value] of Object.entries({ db: 'pubmed', retmode: 'json', tool: 'elucenia_clinical_queries', email: contactEmail, ...parameters })) url.searchParams.set(key, String(value));
    const combined = signal ? AbortSignal.any([signal, AbortSignal.timeout(10000)]) : AbortSignal.timeout(10000);
    try { return await readJson(await fetchImpl(url, { headers: { Accept: 'application/json' }, redirect: 'error', cache: 'no-store', signal: combined })); }
    catch (error) { if (error instanceof SearchError) throw error; throw new SearchError('UPSTREAM_UNAVAILABLE', 502); }
  }
  const first = parseSearch(await call('esearch', { term: query, retmax: PAGE_SIZE, retstart: checked.page * PAGE_SIZE, sort: 'pub date' }), checked);
  const articles = first.ids.length ? parseSummaries(await call('esummary', { id: first.ids.join(',') }), first.ids) : [];
  return { id: 'pubmed-clinical-queries', methodVersion: METHOD, input: checked, query, queryTranslation: first.queryTranslation, warnings: first.warnings, count: first.count, page: checked.page, pageSize: PAGE_SIZE, hasNext: (checked.page + 1) * PAGE_SIZE < Math.min(first.count, 10000), retrievalLimit: 10000, articles, retrievedAt: new Date().toISOString(), source: 'NLM / NCBI PubMed E-utilities', sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/help/#clinical-study-categories', sourcePolicyUrl: 'https://www.ncbi.nlm.nih.gov/home/about/policies/', execution: 'ELUCENIA interface; live remote NCBI bibliographic query', abstractsIncluded: false };
}
// Next may reconstruct a local Request URL with localhost while the browser uses
// 127.0.0.1. Use explicit trusted public origins and equal-port loopback aliases;
// Host and forwarded headers never expand this policy.
function originAllowed(request) {
  if(request.headers.get('sec-fetch-site')==='cross-site')return false;
  const origin=request.headers.get('origin');if(!origin)return false;
  const trusted=new Set(['elucenia.org','elucenia.com','elucenia.com.br','elucenia.online'].flatMap(domain=>['https://'+domain,'https://www.'+domain]));
  for(const candidate of (process.env.ELUCENIA_ALLOWED_ORIGINS||'').split(',')){
    try{const value=candidate.trim(),parsed=new URL(value);if(parsed.protocol==='https:'&&parsed.origin===value)trusted.add(value);}catch{}
  }
  if(trusted.has(origin))return true;
  try{const source=new URL(origin),target=new URL(request.url),loopback=new Set(['localhost','127.0.0.1','[::1]']);return source.origin===origin&&loopback.has(source.hostname)&&(loopback.has(target.hostname)||target.hostname==='0.0.0.0')&&source.protocol===target.protocol&&source.port===target.port;}catch{return false;}
}
function createHandler({ fetchImpl = fetch, contactEmail = () => process.env.NCBI_TOOL_EMAIL ?? DEFAULT_NCBI_TOOL_EMAIL, gate = defaultGate } = {}) {
  let active = 0, windowStart = performance.now(), count = 0;
  const reply = (status, body) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...(status === 429 ? { 'Retry-After': '5' } : {}) } });
  return async function handle(request) {
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST', 'Cache-Control': 'no-store' } });
    if (!originAllowed(request)) return reply(403, { code: 'ORIGIN_NOT_ALLOWED' });
    if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get('content-type') || '') || (request.headers.get('content-encoding') && request.headers.get('content-encoding') !== 'identity')) return reply(415, { code: 'INVALID_INPUT' });
    if (Number(request.headers.get('content-length')) > 4096) return reply(413, { code: 'INVALID_INPUT' });
    const now = performance.now();
    if (now - windowStart >= 60000) { windowStart = now; count = 0; }
    if (active >= 4 || count >= 30) return reply(429, { code: 'RATE_LIMITED' });
    active++; count++;
    try {
      const buffer = await readInput(request);
      const result = await search(buffer, { fetchImpl, contactEmail: contactEmail(), gate, signal: request.signal });
      return reply(200, { result });
    } catch (error) {
      const known = error instanceof SearchError;
      return reply(known ? error.status : 400, { code: known ? error.code : 'INVALID_INPUT' });
    } finally { active--; }
  };
}
module.exports = { FILTERS, METHOD, PAGE_SIZE, SearchError, validateInput, buildQuery, parseSearch, parseSummaries, readJson, createGate, search, originAllowed, createHandler };
