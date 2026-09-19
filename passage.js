// Ignore PDF layout whitespace and punctuation while retaining character positions.
// This handles split words, soft hyphens and different PDF text-item boundaries.
export function findPassage(items, excerpt) {
  const normalize = text => text.normalize('NFKC').toLocaleLowerCase('sv').replace(/[^\p{L}\p{N}]/gu, '');
  const positions = []; let text = '';
  items.forEach((item, index) => {
    for(let offset=0; offset<item.str.length; offset++) {
      const chars=normalize(item.str[offset]);
      for(const char of chars) {text+=char;positions.push({index,offset});}
    }
  });
  const target=normalize(excerpt), start=text.indexOf(target);
  if(!target || start<0)return [];
  const end=start+target.length, ranges=[];
  for(let i=start;i<end;i++) {
    const p=positions[i], previous=ranges.at(-1);
    if(previous?.index===p.index)previous.end=p.offset+1;
    else ranges.push({index:p.index,start:p.offset,end:p.offset+1});
  }
  return ranges;
}
