import { mkdir, cp, rm, readFile } from 'node:fs/promises';
const questions=JSON.parse(await readFile('data/questions.json','utf8'));
if(questions.length!==100)throw new Error('Expected 100 questions');
await rm('dist',{recursive:true,force:true});await mkdir('dist');
for(const file of ['index.html','styles.css','app.js','quiz.js','sw.js','manifest.webmanifest','icons','data/questions.json','documents/sverige-i-fokus.pdf']){await mkdir(`dist/${file.split('/').slice(0,-1).join('/')}`,{recursive:true});await cp(file,`dist/${file}`,{recursive:true});}
console.log('Built static PWA in dist/ with 100 questions and the source PDF.');
