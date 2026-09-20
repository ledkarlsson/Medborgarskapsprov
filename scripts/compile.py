"""Compile curated bilingual questions, validating every quote against the source PDF.
Run with Python + pypdf. Only layout whitespace is normalized; wording is preserved.
"""
import json, re, pathlib
from pypdf import PdfReader
ROOT = pathlib.Path(__file__).resolve().parent.parent
pages = [p.extract_text() for p in PdfReader(ROOT / 'documents/sverige-i-fokus.pdf').pages]
def normalize(text):
    return re.sub(r'\s+', ' ', text).strip()
chapters = [(5,'Landet Sverige','Sweden'),(10,'Demokrati','Democracy'),(12,'Så styrs Sverige','Government'),(14,'Val och partier','Elections'),(16,'Lag och rätt','Law and justice'),(20,'Medier och källkritik','Media and source criticism'),(22,'Mänskliga rättigheter','Human rights'),(27,'Arbete och ekonomi','Work and finances'),(30,'Välfärd','Welfare'),(32,'Sveriges historia','Swedish history'),(39,'Sverige och omvärlden','Sweden and the world'),(42,'Religion','Religion'),(45,'Traditioner','Traditions')]
json_path = ROOT/'data/questions.json'
previous = {q['id']: q for q in json.loads(json_path.read_text(encoding='utf-8'))} if json_path.exists() else {}
questions=[]
for line in (ROOT/'data/questions.txt').read_text(encoding='utf-8').splitlines():
    if not line or line.startswith('#'): continue
    page, quote, translation, sv, en, *answers = line.split('|')
    page=int(page)
    assert normalize(quote) in normalize(pages[page-1]), f'Quote not found on page {page}: {quote}'
    chapter = [c for c in chapters if c[0] <= page][-1]
    questions.append(dict(id=f'q{len(questions)+1:03}',page=page,category=dict(sv=chapter[1],en=chapter[2]),question=dict(sv=sv,en=en),excerpt=dict(sv=quote,en=translation),options=[dict(id=str(i),sv=a.split('~')[0],en=a.split('~')[1]) for i,a in enumerate(answers)],correct='0'))
assert len(questions)==100, f'Expected 100 questions, got {len(questions)}'
for question in questions:
    old = previous.get(question['id'], {})
    unchanged = {key: value for key, value in old.items() if key != 'validated'} == question
    question['validated'] = unchanged and old.get('validated') is True
json_path.write_text(json.dumps(questions,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Compiled {len(questions)} questions. All Swedish quotations match their PDF pages.')
