import { useEffect, useState } from 'react';
import FormularioChamado from './components/FormularioChamado.jsx';
import CartaoChamado from './components/CartaoChamado.jsx';
import { CHAVE, lerChamados } from './armazenamento.js';

export default function App() {
  const [chamados, setChamados] = useState(lerChamados);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(chamados));
      setAviso('');
    } catch {
      setAviso('Não foi possível salvar no navegador. As alterações duram apenas nesta sessão.');
    }
  }, [chamados]);

  function adicionar(dados) {
    const novo = { ...dados, id: crypto.randomUUID(), resolvido: false };
    setChamados(atuais => [novo, ...atuais]);
  }

  function alternar(id) {
    setChamados(atuais => atuais.map(item =>
      item.id === id ? { ...item, resolvido: !item.resolvido } : item,
    ));
  }

  function excluir(id) {
    setChamados(atuais => atuais.filter(item => item.id !== id));
  }

  const abertos = chamados.filter(item => !item.resolvido).length;
  const visiveis = chamados.filter(item => {
    const correspondeBusca = item.titulo.toLocaleLowerCase('pt-BR')
      .includes(busca.trim().toLocaleLowerCase('pt-BR'));
    const correspondeStatus = filtro === 'todos' ||
      (filtro === 'abertos' && !item.resolvido) ||
      (filtro === 'resolvidos' && item.resolvido);
    return correspondeBusca && correspondeStatus;
  });

  return (
    <main>
      <header>
        <p className="marca">NOVA ROMA · PROJETO DIDÁTICO</p>
        <h1>HelpDesk Acadêmico</h1>
        <p>Organize os problemas do campus em um só lugar.</p>
      </header>
      <section className="resumo" aria-label="Resumo dos chamados">
        <p><strong>{chamados.length}</strong> chamados</p>
        <p><strong>{abertos}</strong> em aberto</p>
        <p><strong>{chamados.length - abertos}</strong> resolvidos</p>
      </section>
      {aviso && <p className="erro" role="status">{aviso}</p>}
      <div className="colunas">
        <FormularioChamado aoAdicionar={adicionar} />
        <section className="painel" aria-labelledby="titulo-lista">
          <h2 id="titulo-lista">Acompanhar chamados</h2>
          <div className="filtros">
            <div>
              <label htmlFor="busca">Buscar pelo título</label>
              <input id="busca" type="search" value={busca}
                onChange={e => setBusca(e.target.value)} placeholder="Digite para buscar" />
            </div>
            <div>
              <label htmlFor="filtro">Situação</label>
              <select id="filtro" value={filtro} onChange={e => setFiltro(e.target.value)}>
                <option value="todos">Todos</option>
                <option value="abertos">Em aberto</option>
                <option value="resolvidos">Resolvidos</option>
              </select>
            </div>
          </div>
          <p role="status">{visiveis.length} chamado(s) encontrado(s).</p>
          {visiveis.length === 0 ? <p className="vazio">Nenhum chamado encontrado. Cadastre um ou ajuste os filtros.</p> : (
            <ul>{visiveis.map(chamado => (
              <CartaoChamado key={chamado.id} chamado={chamado}
                aoAlternar={alternar} aoExcluir={excluir} />
            ))}</ul>
          )}
        </section>
      </div>
      <footer>Exemplo educacional · Dados salvos somente neste navegador.</footer>
    </main>
  );
}
