export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
export function createSession(questions, title, random = Math.random) {
  return { title, ids: shuffle(questions, random).slice(0, 10).map(q => q.id), orders: Object.fromEntries(questions.map(q => [q.id, shuffle(q.options.map(o => o.id), random)])), answers: {}, index: 0, saved: false };
}
export function score(session, questions) { return session.ids.filter(id => session.answers[id] === questions.find(q => q.id === id)?.correct).length; }
export function validSession(s, questions) {
  return !!s && Array.isArray(s.ids) && s.ids.length === 10 && new Set(s.ids).size === 10 && Number.isInteger(s.index) && s.index >= 0 && s.index <= 10 && typeof s.answers === 'object' && s.answers !== null && s.ids.every((id,i) => {
    const q = questions.find(q => q.id === id), order = s.orders?.[id];
    return q && Array.isArray(order) && order.length === q.options.length && new Set(order).size === q.options.length && order.every(x => q.options.some(o => o.id === x)) && (s.answers[id] === undefined ? i >= s.index : q.options.some(o => o.id === s.answers[id]));
  });
}
