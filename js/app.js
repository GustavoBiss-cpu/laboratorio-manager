const $ = s => document.querySelector(s);
const form = $('#form'), resultado = $('#resultado');
let reservas = JSON.parse(localStorage.getItem('reservas') || '[]'); // protótipo: depois vira banco de dados
let pedido = null;

// Ferramentas como chips
$('#ferramentas').innerHTML = FERRAMENTAS.map(f =>
  `<label class="chip"><input type="checkbox" value="${f.id}"><span>${f.nome}</span></label>`).join('');
form.data.min = form.data.value = new Date().toISOString().slice(0, 10);

// Autocomplete de turmas
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f,]/g, '').toLowerCase();
const campo = form.turma, lista = $('#opcoes');
let ativo = -1;

function abrir(itens) {
  ativo = -1;
  lista.innerHTML = itens.map((t, i) => `<li role="option" id="op${i}">${t}</li>`).join('')
    || '<li class="nada">Nenhuma turma com esse nome</li>';
  lista.hidden = false; campo.setAttribute('aria-expanded', 'true');
}
function fechar() { lista.hidden = true; campo.setAttribute('aria-expanded', 'false'); }
function escolher(t) { campo.value = t; fechar(); campo.setCustomValidity(''); form.alunos.focus(); }
function filtrar() {
  const palavras = norm(campo.value).split(/\s+/).filter(Boolean);
  abrir(TURMAS.filter(t => palavras.every(p => norm(t).includes(p))));
}
campo.addEventListener('input', filtrar);
campo.addEventListener('focus', filtrar);
campo.addEventListener('blur', () => setTimeout(fechar, 120));
campo.addEventListener('keydown', e => {
  const ops = [...lista.querySelectorAll('li[id]')];
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault(); if (lista.hidden) filtrar();
    ativo = (ativo + (e.key === 'ArrowDown' ? 1 : -1) + ops.length) % ops.length;
    ops.forEach((o, i) => o.classList.toggle('ativo', i === ativo));
  } else if (e.key === 'Enter' && ativo >= 0 && !lista.hidden) { e.preventDefault(); escolher(ops[ativo].textContent); }
  else if (e.key === 'Escape') fechar();
});
lista.addEventListener('mousedown', e => { if (e.target.id) { e.preventDefault(); escolher(e.target.textContent); } });

form.addEventListener('change', e => {
  if (e.target.name === 'tipo') $('#semanas').hidden = e.target.value !== 'planejada';
});

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  setTimeout(() => t.classList.remove('on'), 2600);
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(form);
  pedido = {
    professor: f.get('professor').trim(), turma: f.get('turma'), alunos: +f.get('alunos'), data: f.get('data'), ini: f.get('ini'), fim: f.get('fim'),
    tipo: f.get('tipo'), semanas: f.get('tipo') === 'planejada' ? +f.get('semanas') : 1,
    ferramentas: [...form.querySelectorAll('#ferramentas input:checked')].map(i => i.value)
  };
  if (!TURMAS.includes(pedido.turma)) return toast('Escolha uma turma da lista de sugestões.');
  if (Matcher.min(pedido.fim) <= Matcher.min(pedido.ini)) return toast('O horário final precisa ser depois do inicial.');
  const { compat, descartados } = Matcher.buscar(pedido, LABORATORIOS, reservas);
  resultado.innerHTML = `
    <h2>${compat.length ? 'Onde a sua aula cabe' : 'Nenhum laboratório atende'}</h2>
    <div class="labs">${compat.map(laboratoryCard).join('')}</div>
    ${descartados.length ? `<p class="descartes">Fora da lista: ${descartados.map(d => `${d.lab.nome} (${d.motivo})`).join('; ')}.</p>` : ''}`;
  resultado.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

resultado.addEventListener('click', e => {
  const id = e.target.dataset.reservar;
  if (!id) return;
  if (Matcher.conflito(id, pedido, reservas)) return toast('Esse horário acabou de ser ocupado.');
  reservas.push({ ...pedido, id: Date.now(), labId: id, status: 'pendente' });
  salvar(); toast('Solicitação enviada para a secretaria.');
});

$('#lista').addEventListener('click', e => {
  const r = reservas.find(x => x.id == e.target.dataset.id);
  if (!r) return;
  r.status = e.target.dataset.acao; salvar();
  toast(r.status === 'aprovada' ? 'Reserva aprovada.' : 'Reserva recusada.');
});
$('#modoSec').addEventListener('change', render);

function salvar() { localStorage.setItem('reservas', JSON.stringify(reservas)); render(); }

function render() {
  const sec = $('#modoSec').checked;
  $('#lista').innerHTML = reservas.length ? reservas.map(r => {
    const lab = LABORATORIOS.find(l => l.id === r.labId);
    return `<div class="item ${r.status}">
      <div><strong>${r.turma}</strong> em ${lab.nome}<br><small>${r.professor ? 'Prof. ' + r.professor : ''}</small><br>
      <small>${formatarData(r.data)}, ${r.ini} às ${r.fim}${r.semanas > 1 ? `, por ${r.semanas} semanas` : ''}</small></div>
      <span class="status">${{ pendente: 'Aguardando secretaria', aprovada: 'Aprovada', recusada: 'Recusada' }[r.status]}</span>
      ${sec && r.status === 'pendente' ? `<span class="acoes">
        <button data-id="${r.id}" data-acao="aprovada">Aprovar</button>
        <button data-id="${r.id}" data-acao="recusada" class="sec">Recusar</button></span>` : ''}
    </div>`;
  }).join('') : '<p class="vazio">Nada por aqui ainda. Faça um pedido acima e ele aparece nesta lista.</p>';
}
render();
