import { useEffect, useState } from 'react';
import FormularioChamado from './components/FormularioChamado.jsx';
import CartaoChamado from './components/CartaoChamado.jsx';
import { atualizarChamado, criarChamado, excluirChamado, listarChamados } from './services/chamadosApi.js';

export default function App() {
  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [falhaLista, setFalhaLista] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    const controle = new AbortController();
    async function carregar() {
      try {
        const lista = await listarChamados(controle.signal);
        if (!Array.isArray(lista)) throw new Error('A API deve retornar uma lista.');
        if (!controle.signal.aborted) setChamados(lista);
      } catch (erro) {
        if (controle.signal.aborted) return;
        setFalhaLista(true);
        setAviso(`Não foi possível carregar os chamados. ${erro.message}`);
      } finally {
        if (!controle.signal.aborted) setCarregando(false);
      }
    }
    carregar();
    return () => controle.abort();
  }, []);

  async function salvar(acao, mensagem) {
    if (carregando || falhaLista || salvando) return false;
    setSalvando(true);
    setAviso('');
    try {
      await acao();
      return true;
    } catch (erro) {
      setAviso(`${mensagem} ${erro.message}`);
      return false;
    } finally {
      setSalvando(false);
    }
  }

  function adicionar(dados) {
    return salvar(async () => {
      const novo = await criarChamado(dados);
      setChamados(atuais => [novo, ...atuais]);
    }, 'Não foi possível criar o chamado.');
  }

  function alternar(id) {
    const chamado = chamados.find(item => item.id === id);
    if (!chamado) return;
    return salvar(async () => {
      const atualizado = await atualizarChamado(id, !chamado.resolvido);
      setChamados(atuais => atuais.map(item => item.id === id ? atualizado : item));
    }, 'Não foi possível atualizar o chamado.');
  }

  function excluir(id) {
    return salvar(async () => {
      await excluirChamado(id);
      setChamados(atuais => atuais.filter(item => item.id !== id));
    }, 'Não foi possível excluir o chamado.');
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
        <FormularioChamado aoAdicionar={adicionar} desabilitado={carregando || falhaLista || salvando} />
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
          {carregando && <p role="status">Carregando chamados…</p>}
          {!carregando && !falhaLista && <p role="status">{visiveis.length} chamado(s) encontrado(s).</p>}
          {!carregando && !falhaLista && (visiveis.length === 0 ? <p className="vazio">Nenhum chamado encontrado. Cadastre um ou ajuste os filtros.</p> : (
            <ul>{visiveis.map(chamado => (
              <CartaoChamado key={chamado.id} chamado={chamado}
                aoAlternar={alternar} aoExcluir={excluir} desabilitado={salvando} />
            ))}</ul>
          ))}
        </section>
      </div>
      <footer>Exemplo educacional · Chamados gerenciados pela API.</footer>
    </main>
  );
}
