function formatarData(iso) {
  return new Date(iso + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function laboratoryCard(r, i) {
  const { lab, conflito, sobra } = r, livre = !conflito;
  const dica = i === 0 && livre ? 'Melhor encaixe para esta aula'
    : (livre && sobra >= 4 ? 'Tem ferramentas que outros cursos disputam' : '');
  return `
  <article class="lab ${livre ? '' : 'ocupado'}" style="--i:${i}">
    <div class="lab-topo"><h3>${lab.nome}</h3><span class="so">${lab.so}, ${lab.funcionando} máquinas</span></div>
    ${dica ? `<p class="dica">${dica}</p>` : ''}
    <div class="chips pequeno">${lab.ferramentas.map(f => `<span>${Matcher.nomeFerr(f)}</span>`).join('')}</div>
    ${livre ? `<button class="botao" data-reservar="${lab.id}">Solicitar este laboratório</button>`
            : `<p class="aviso">Ocupado em ${formatarData(conflito.dia)} por ${conflito.reserva.turma}${conflito.reserva.professor ? ` (${conflito.reserva.professor})` : ''}.</p>`}
  </article>`;
}
