// Dados de exemplo: ajuste capacidades e ferramentas com os valores reais da escola.
const FERRAMENTAS = [
  { id: 'web',     nome: 'Navegador, Docs e Planilhas' },
  { id: 'texto',   nome: 'Editor de texto' },
  { id: 'office',  nome: 'Pacote Office' },
  { id: 'vscode',  nome: 'VS Code' },
  { id: 'db',      nome: 'Node.js e PostgreSQL' },
  { id: 'autocad', nome: 'AutoCAD' },
  { id: 'solid',   nome: 'SolidWorks' }
];

const LABORATORIOS = [
  { id: 'ling',  nome: 'Ferramentas de Linguagem', so: 'Linux',     funcionando: 30, ferramentas: ['web','texto'] },
  { id: 'info',  nome: 'Informática',              so: 'Windows',   funcionando: 28, ferramentas: ['web','texto','office','vscode'] },
  { id: 'fis',   nome: 'Física',                   so: 'Notebooks', funcionando: 25, ferramentas: ['web','texto'] },
  { id: 'multi', nome: 'Multi Interativa',         so: 'Windows',   funcionando: 30, ferramentas: ['web','texto','office','vscode','db','autocad','solid'] },
  { id: 'lab5',  nome: 'Laboratório 5',            so: 'Windows',   funcionando: 15,  ferramentas: ['web','texto'] }
];

// Exemplo: ajuste a lista de cursos e anos conforme a escola
const CURSOS = ['Mecânica', 'Análise e Desenvolvimento de Sistemas (ADS)', 'Meio Ambiente', 'Planejamento e Controle da Produção (PCP)', 'Enfermagem', 'Biotecnologia', 'Energias Renováveis', 'Manutenção Automotiva', 'Química', 'Edificações'];
const TURMAS = CURSOS.flatMap(c => ['1º', '2º', '3º'].map(a => `${c}, ${a} ano`));
