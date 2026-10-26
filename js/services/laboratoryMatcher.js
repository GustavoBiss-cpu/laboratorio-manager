const Matcher = {
  min(t) { const [h, m] = t.split(':'); return +h * 60 + +m; },
  somaDias(iso, n) { const d = new Date(iso + 'T12:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); },
  nomeFerr(id) { return (FERRAMENTAS.find(f => f.id === id) || {}).nome || id; },

  // Procura choque de horário em cada semana da recorrência
  conflito(labId, pedido, reservas) {
    const semanas = pedido.tipo === 'planejada' ? +pedido.semanas : 1;
    for (let i = 0; i < semanas; i++) {
      const dia = this.somaDias(pedido.data, i * 7);
      const hit = reservas.find(r => r.labId === labId && r.status !== 'recusada' &&
        Array.from({ length: r.semanas }, (_, k) => this.somaDias(r.data, k * 7)).includes(dia) &&
        this.min(pedido.ini) < this.min(r.fim) && this.min(r.ini) < this.min(pedido.fim));
      if (hit) return { dia, reserva: hit };
    }
    return null;
  },

  buscar(pedido, labs, reservas) {
    const compat = [], descartados = [];
    labs.forEach(lab => {
      const falta = pedido.ferramentas.filter(f => !lab.ferramentas.includes(f));
      if (falta.length) return descartados.push({ lab, motivo: 'não tem ' + falta.map(f => this.nomeFerr(f)).join(', ') });
      if (lab.funcionando < pedido.alunos)
        return descartados.push({ lab, motivo: `só ${lab.funcionando} computadores funcionando` });
      compat.push({ lab, sobra: lab.ferramentas.length - pedido.ferramentas.length, conflito: this.conflito(lab.id, pedido, reservas) });
    });
    // Livres primeiro; entre eles, o que menos "desperdiça" ferramentas avançadas
    compat.sort((a, b) => (!!a.conflito - !!b.conflito) || a.sobra - b.sobra);
    return { compat, descartados };
  }
};
