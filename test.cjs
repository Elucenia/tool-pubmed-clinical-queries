'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const website=__dirname;
const tool=require('./pubmed-clinical-queries.cjs');
// Read-only by default. Reporting is an explicit creation of a new local JSON file.
const reportArgument=process.argv.indexOf('--record');
const reportFilename=reportArgument>=0?process.argv[reportArgument+1]:null;
if(reportArgument>=0&&(!reportFilename||path.basename(reportFilename)!==reportFilename||!/^[A-Za-z0-9][A-Za-z0-9._-]*\.json$/.test(reportFilename)))throw new Error('Use --record <new-local-file.json>; path traversal and existing-file overwrite are not allowed.');
const rows=[];let checked=0;
function check(name,callback){checked++;try{callback();rows.push({name,status:'passed'});}catch(error){rows.push({name,status:'failed',error:String(error.message)});}}
async function asyncCheck(name,callback){checked++;try{await callback();rows.push({name,status:'passed'});}catch(error){rows.push({name,status:'failed',error:String(error.message)});}}
const valid={query:'breast cancer',category:'therapy',scope:'narrow',page:0};
function request(body=valid,options={}){return new Request('http://127.0.0.1:3050/api/tools/pubmed-clinical-queries/search',{method:'POST',headers:{'Content-Type':'application/json','Origin':'http://127.0.0.1:3050',...options.headers},body:typeof body==='string'?body:JSON.stringify(body),...options,headers:{'Content-Type':'application/json','Origin':'http://127.0.0.1:3050',...options.headers}});}
const fixtureSearch={esearchresult:{count:'2',retstart:'0',retmax:'10',idlist:['1001','1002'],querytranslation:'(breast cancer) AND randomized controlled trial[Publication Type]'}};
const fixtureSummary={result:{uids:['1002','1001'],'1001':{uid:'1001',title:'<i>Cancer</i> &amp; therapy',authors:[{name:'Synthetic A'}],fulljournalname:'Synthetic journal',pubdate:'2026 Oct',articleids:[{idtype:'doi',value:'10.1234/synthetic'}]},'1002':{uid:'1002',title:'Synthetic trial',authors:[],source:'Fixture',pubdate:'2025',articleids:[]}}};
const contact=process.env.NCBI_TOOL_EMAIL;
const offlineContact='review@example.org'; // Controlled mock transport only; never sent to NCBI.
const captured=[];
const fakeFetch=async(url,options)=>{captured.push({url:String(url),options});return Response.json(String(url).includes('esearch')?fixtureSearch:fixtureSummary);};
function handler(fetchImpl=fakeFetch,email=offlineContact){return tool.createHandler({fetchImpl,contactEmail:()=>email,gate:async()=>{}});}

async function main(){
  check('exact diagnosis narrow source strategy',()=>assert.equal(tool.buildQuery({...valid,category:'diagnosis'}),'(breast cancer) AND (specificity[Title/Abstract])'));
  check('fixed therapy narrow source strategy',()=>assert.equal(tool.buildQuery(valid),'(breast cancer) AND (randomized controlled trial[Publication Type] OR (randomized[Title/Abstract] AND controlled[Title/Abstract] AND trial[Title/Abstract]))'));
  for(const category of Object.keys(tool.FILTERS))for(const scope of ['broad','narrow'])check(category+'/'+scope+' single enveloped strategy',()=>assert.equal(tool.buildQuery({...valid,category,scope}).startsWith('(breast cancer) AND ('),true));
  for(const [label,input] of Object.entries({missing:{query:'cancer'},unknown:{...valid,patientName:'synthetic'},empty:{...valid,query:'  '},tooLong:{...valid,query:'x'.repeat(501)},control:{...valid,query:'cancer\n'},history:{...valid,query:'#1'},parenthesis:{...valid,query:'cancer) OR all[sb] OR ('},quotes:{...valid,query:'"cancer'},category:{...valid,category:'__proto__'},scope:{...valid,scope:'constructor'},pageFloat:{...valid,page:0.5},pageNegative:{...valid,page:-1},pageTooBig:{...valid,page:1000},pageString:{...valid,page:'0'}}))check('reject '+label,()=>assert.throws(()=>tool.validateInput(input),tool.SearchError));
  check('Unicode scientific terms retained',()=>assert.equal(tool.validateInput({...valid,query:'سرطان الثدي'}).query,'سرطان الثدي'));
  check('balanced Boolean query retained',()=>assert.equal(tool.validateInput({...valid,query:'("breast cancer" OR lymphoma) AND child[mh]'}).query,'("breast cancer" OR lymphoma) AND child[mh]'));
  check('neutral metadata output order and HTML entity decoding',()=>assert.deepEqual(tool.parseSummaries(fixtureSummary,['1001','1002']).map(row=>[row.pmid,row.title]),[['1001','Cancer & therapy'],['1002','Synthetic trial']]));
  check('reject missing PMID from summary',()=>assert.throws(()=>tool.parseSummaries(fixtureSummary,['1003']),tool.SearchError));
  check('reject mismatched summary UID',()=>assert.throws(()=>tool.parseSummaries({result:{uids:['1001'],'1001':{...fixtureSummary.result['1001'],uid:'1002'}}},['1001']),tool.SearchError));
  check('reject duplicate PMID in search',()=>assert.throws(()=>tool.parseSearch({esearchresult:{...fixtureSearch.esearchresult,idlist:['1001','1001']}},valid),tool.SearchError));
  check('reject page cursor mismatch',()=>assert.throws(()=>tool.parseSearch(fixtureSearch,{...valid,page:1}),tool.SearchError));
  check('upstream syntax error is actionable422',()=>assert.throws(()=>tool.parseSearch({esearchresult:{errorlist:{phrasesnotfound:['bad']}}},valid),error=>error.status===422));
  await asyncCheck('mock internal search returns cited metadata withoutabstracts',async()=>{const response=await handler()(request());assert.equal(response.status,200);const {result}=await response.json();assert.equal(result.count,2);assert.equal(result.methodVersion,tool.METHOD);assert.equal(result.articles[0].title,'Cancer & therapy');assert.equal(result.abstractsIncluded,false);assert.equal(Object.hasOwn(result.articles[0],'abstract'),false);assert.equal(result.hasNext,false);assert.equal(response.headers.get('cache-control'),'no-store');});
  check('only two fixed authorized upstream endpoints',()=>{assert.equal(captured.length,2);for(const item of captured){const url=new URL(item.url);assert.equal(url.origin,'https://eutils.ncbi.nlm.nih.gov');assert.equal(url.searchParams.get('db'),'pubmed');assert.equal(url.searchParams.get('tool'),'elucenia_clinical_queries');assert.equal(url.searchParams.get('email'),offlineContact);assert.equal(item.options.redirect,'error');assert.equal(item.options.cache,'no-store');}assert.equal(new URL(captured[1].url).searchParams.get('id'),'1001,1002');});
  await asyncCheck('empty search returns internally without summary fetch',async()=>{let requests=0;const response=await handler(async()=>{requests++;return Response.json({esearchresult:{...fixtureSearch.esearchresult,count:'0',idlist:[]}});})(request());assert.equal(response.status,200);assert.equal((await response.json()).result.articles.length,0);assert.equal(requests,1);});
  for(const method of ['GET','PUT','HEAD','PATCH','DELETE','OPTIONS'])await asyncCheck('HTTP'+method+' rejected405',async()=>assert.equal((await handler()(new Request('http://127.0.0.1:3050/api/tools/pubmed-clinical-queries/search',{method}))).status,405));
  await asyncCheck('foreign Origin rejected403',async()=>{const response=await handler()(request(valid,{headers:{'Content-Type':'application/json','Origin':'https://elsewhere.invalid'}}));assert.equal(response.status,403);});
  await asyncCheck('cross site rejected403',async()=>assert.equal((await handler()(request(valid,{headers:{'Content-Type':'application/json','Sec-Fetch-Site':'cross-site'}}))).status,403));
  await asyncCheck('wrong contenttype rejected415',async()=>assert.equal((await handler()(request(valid,{headers:{'Content-Type':'text/plain'}}))).status,415));
  await asyncCheck('bad JSON rejected400',async()=>assert.equal((await handler()(request('{broken'))).status,400));
  await asyncCheck('actual body size rejected413 withouttrustedlength',async()=>assert.equal((await handler()(request('x'.repeat(4097)))).status,413));
  await asyncCheck('unconfigured contact rejected503 without network',async()=>{let calls=0;const response=await handler(async()=>{calls++;return Response.json({});},null)(request());assert.equal(response.status,503);assert.equal(calls,0);});
  await asyncCheck('upstream rate limit preserved429',async()=>assert.equal((await handler(async()=>new Response('denied',{status:429}))(request())).status,429));
  await asyncCheck('network error controlled502',async()=>assert.equal((await handler(async()=>{throw new Error('network detail should not leak');})(request())).status,502));
  await asyncCheck('malformed metadata controlled502',async()=>assert.equal((await handler(async()=>Response.json({bad:true}))(request())).status,502));
  await asyncCheck('request burst limited30 perminute',async()=>{const handle=handler();for(let i=0;i<30;i++)assert.equal((await handle(request('{bad'))).status,400);assert.equal((await handle(request())).status,429);});
  await asyncCheck('400ms upstreamspacing gate',async()=>{let clock=0;const delays=[];const gate=tool.createGate({now:()=>clock,delay:async ms=>{delays.push(ms);clock+=ms;}});await Promise.all([gate(),gate(),gate(),gate()]);assert.deepEqual(delays,[400,400,400]);});

  const mod={exports:require('./interface-copy.cjs')};
  for(const locale of ['pt-BR','en','es','fr','de','it','ar','zh','ja','hi'])check('complete authoredcopy '+locale,()=>{const copy=mod.exports.pubMedCopy(locale);assert.equal(Object.keys(copy).length,30);assert.equal(copy.categories.length,5);for(const [key,value]of Object.entries(copy))if(key!=='categories')assert.equal(typeof value==='string'&&value.trim().length>0,true);if(locale!=='pt-BR')assert.notEqual(copy.intro,mod.exports.pubMedCopy('pt-BR').intro);});
  const live=[];
  if(process.argv.includes('--live')){
    if(!contact)throw new Error('NCBI_TOOL_EMAIL is required for live transport.');
    for(const category of Object.keys(tool.FILTERS))for(const scope of ['broad','narrow']){
      const input={query:'breast cancer',category,scope,page:0};
      await asyncCheck('live NCBI '+category+'/'+scope,async()=>{const result=await tool.search(input,{contactEmail:contact});assert.equal(result.count>0,true);assert.equal(result.articles.length,10);assert.equal(new Set(result.articles.map(row=>row.pmid)).size,10);assert.equal(result.methodVersion,tool.METHOD);assert.equal(result.input.category,category);assert.equal(result.input.scope,scope);live.push({input,result});});
    }
  }
  const owners=['pubmed-clinical-queries.cjs','interface-copy.cjs'];
  const bindings=owners.map(file=>{const bytes=fs.readFileSync(path.join(website,file));return {file,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};});
  const report={at:new Date().toISOString(),scope:'PubMed clinical-study-category internal interface candidate; no application wiring/build, physicianapproval, professionallanguageapproval or fullpubmedserviceparity claim',expectedSource:'NLM2011clinical-study-categoryqueries; deterministic mockPMIDs1001/1002; live counts are time-dependent transport observations, not fixed clinical expectations',summary:{checked,failed:rows.filter(row=>row.status==='failed').length,liveVariants:live.length},rows,bindings,live,clinicalApproval:false,professionalLanguageApproval:false,sourceRightsScope:'NLM original strategies credited; live bibliographic metadata under NLM data conditions; noabstract/fullarticle copied',networkAttempted:process.argv.includes('--live')};
  if(reportFilename)fs.writeFileSync(path.join(__dirname,reportFilename),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({...reportFilename?{file:reportFilename}:{},summary:report.summary},null,2));if(report.summary.failed)process.exitCode=1;
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
