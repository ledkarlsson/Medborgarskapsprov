import { mkdir, cp, rm, readFile, writeFile } from 'node:fs/promises';
import { cacheVersion } from './cache-version.mjs';
const questions=JSON.parse(await readFile('data/questions.json','utf8'));
if(questions.length!==100)throw new Error('Expected 100 questions');
await rm('dist',{recursive:true,force:true});await mkdir('dist');
for(const file of ['index.html','styles.css','app.js','quiz.js','sw.js','reader.html','reader.js','reader.css','passage.js','vendor','manifest.webmanifest','icons','data/questions.json','documents/sverige-i-fokus.pdf']){await mkdir(`dist/${file.split('/').slice(0,-1).join('/')}`,{recursive:true});await cp(file,`dist/${file}`,{recursive:true});}
const version = await cacheVersion('dist');
const worker = await readFile('dist/sw.js', 'utf8');
await writeFile('dist/sw.js', worker.replace(/^const CACHE = .*;$/m, `const CACHE = 'medborgarskapsprov-app-${version}';`));
console.log(`Built static PWA in dist/ with 100 questions and the source PDF. Cache: ${version}`);
