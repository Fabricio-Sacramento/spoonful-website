// API do painel /maria
// GET  → dados base + alterações salvas
// POST → aplica uma ação ({ op, ... }) e salva
// Protegido por PIN (env MARIA_PIN), enviado no header "x-maria-pin".
import { get, put } from '@vercel/blob';
import base from './_maria-base.js';

const PATH = 'maria/state.json';
const STATUSES = ['precisa', 'lista', 'ganhou', 'comprado'];

const emptyState = () => ({
  tasks: {},
  tasksAdded: [],
  enxoval: {},
  enxovalAdded: [],
  mala: {},
  notes: [],
  log: [],
});

async function readState() {
  const r = await get(PATH, { access: 'private', useCache: false }).catch(() => null);
  if (!r || r.statusCode !== 200) return emptyState();
  const text = await new Response(r.stream).text();
  try {
    return { ...emptyState(), ...JSON.parse(text) };
  } catch {
    return emptyState();
  }
}

async function writeState(state) {
  await put(PATH, JSON.stringify(state), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

const clean = (v, max = 200) => String(v ?? '').trim().slice(0, max);
const uid = (p) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function merge(state) {
  const tasks = [...base.tasks, ...state.tasksAdded].map((t) => ({
    ...t,
    ...(state.tasks[t.id] || {}),
    custom: !base.tasks.some((b) => b.id === t.id),
  }));
  const enxoval = [...base.enxoval, ...state.enxovalAdded].map((e) => ({
    status: 'precisa',
    ...e,
    ...(state.enxoval[e.id] || {}),
    custom: !base.enxoval.some((b) => b.id === e.id),
  }));
  const mala = base.mala.map((m) => ({ ...m, ...(state.mala[m.id] || {}) }));
  return {
    dpp: base.dpp,
    people: base.people,
    contacts: base.contacts,
    platform: base.platform,
    fronts: base.fronts,
    enxovalCats: base.enxovalCats,
    tasks,
    enxoval,
    mala,
    notes: state.notes,
    log: state.log.slice(0, 20),
  };
}

function apply(state, body) {
  const by = clean(body.by, 40) || 'Alguém';
  const at = new Date().toISOString();
  const op = body.op;
  let desc = '';

  if (op === 'task.toggle') {
    const id = clean(body.id, 80);
    const t = [...base.tasks, ...state.tasksAdded].find((x) => x.id === id);
    if (!t) throw new Error('Tarefa não encontrada');
    state.tasks[id] = { done: !!body.done, by, at };
    desc = `${body.done ? 'concluiu' : 'reabriu'} “${t.title}”`;
  } else if (op === 'task.add') {
    const title = clean(body.title);
    if (!title) throw new Error('Escreva a tarefa');
    const front = base.fronts.some((f) => f.id === body.front) ? body.front : 'enxoval';
    state.tasksAdded.push({ id: uid('t'), front, title, due: clean(body.due, 10), addedBy: by, at });
    desc = `adicionou a tarefa “${title}”`;
  } else if (op === 'task.remove') {
    const id = clean(body.id, 80);
    const t = state.tasksAdded.find((x) => x.id === id);
    if (!t) throw new Error('Só dá para remover tarefas adicionadas pela página');
    state.tasksAdded = state.tasksAdded.filter((x) => x.id !== id);
    delete state.tasks[id];
    desc = `removeu a tarefa “${t.title}”`;
  } else if (op === 'enxoval.status') {
    const id = clean(body.id, 80);
    const e = [...base.enxoval, ...state.enxovalAdded].find((x) => x.id === id);
    if (!e) throw new Error('Item não encontrado');
    if (!STATUSES.includes(body.status)) throw new Error('Status inválido');
    state.enxoval[id] = { ...(state.enxoval[id] || {}), status: body.status, by, at };
    desc = `marcou “${e.item}” como ${body.status}`;
  } else if (op === 'enxoval.add') {
    const item = clean(body.item);
    if (!item) throw new Error('Escreva o item');
    const cat = base.enxovalCats.includes(body.cat) ? body.cat : base.enxovalCats[0];
    state.enxovalAdded.push({ id: uid('e'), cat, item, qty: clean(body.qty, 20), status: 'precisa', addedBy: by, at });
    desc = `adicionou “${item}” ao enxoval`;
  } else if (op === 'enxoval.remove') {
    const id = clean(body.id, 80);
    const e = state.enxovalAdded.find((x) => x.id === id);
    if (!e) throw new Error('Só dá para remover itens adicionados pela página');
    state.enxovalAdded = state.enxovalAdded.filter((x) => x.id !== id);
    delete state.enxoval[id];
    desc = `removeu “${e.item}” do enxoval`;
  } else if (op === 'mala.toggle') {
    const id = clean(body.id, 80);
    const m = base.mala.find((x) => x.id === id);
    if (!m) throw new Error('Item não encontrado');
    state.mala[id] = { done: !!body.done, by, at };
    desc = `${body.done ? 'colocou na mala' : 'tirou da mala'} “${m.item}”`;
  } else if (op === 'note.add') {
    const text = clean(body.text, 600);
    if (!text) throw new Error('Escreva a nota');
    state.notes.unshift({ id: uid('n'), text, by, at });
    desc = 'adicionou uma nota';
  } else if (op === 'note.remove') {
    const id = clean(body.id, 80);
    state.notes = state.notes.filter((n) => n.id !== id);
    desc = 'removeu uma nota';
  } else {
    throw new Error('Ação desconhecida');
  }

  state.log.unshift({ by, at, desc });
  state.log = state.log.slice(0, 50);
  return state;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  const pin = process.env.MARIA_PIN;

  // Verificação de saúde sem dados: confirma PIN configurado e acesso ao armazenamento
  if (req.method === 'GET' && req.query && req.query.health !== undefined) {
    let storage = 'ok';
    try {
      await get(PATH, { access: 'private', useCache: false });
    } catch (e) {
      storage = 'erro: ' + (e.message || e);
    }
    return res.status(200).json({ pin: !!pin, storage });
  }

  if (!pin) return res.status(500).json({ error: 'PIN não configurado' });
  if (req.headers['x-maria-pin'] !== pin) {
    await new Promise((r) => setTimeout(r, 800));
    return res.status(401).json({ error: 'PIN incorreto' });
  }

  try {
    if (req.method === 'GET') {
      return res.status(200).json(merge(await readState()));
    }
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const state = apply(await readState(), body);
      await writeState(state);
      return res.status(200).json(merge(state));
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método não permitido' });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Erro' });
  }
}
