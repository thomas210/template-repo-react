import { useState } from 'react';
import { categorias } from '../dados.js';

export default function FormularioChamado({ aoAdicionar, desabilitado }) {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState(categorias[0]);
  const [erro, setErro] = useState('');

  async function enviar(evento) {
    evento.preventDefault();
    if (desabilitado) return;
    if (titulo.trim().length < 5) {
      setErro('Descreva o problema com pelo menos 5 caracteres.');
      return;
    }
    setErro('');
    if (await aoAdicionar({ titulo: titulo.trim(), categoria })) setTitulo('');
  }

  return (
    <form onSubmit={enviar} className="painel">
      <h2>Abrir chamado</h2>
      <label htmlFor="titulo">Qual é o problema?</label>
      <input id="titulo" value={titulo} onChange={e => setTitulo(e.target.value)}
        maxLength={120} required disabled={desabilitado} aria-invalid={Boolean(erro)}
        aria-describedby={erro ? 'erro-titulo' : undefined}
        placeholder="Ex.: computador do laboratório não liga" />
      <label htmlFor="categoria">Categoria</label>
      <select id="categoria" value={categoria} disabled={desabilitado} onChange={e => setCategoria(e.target.value)}>
        {categorias.map(item => <option key={item}>{item}</option>)}
      </select>
      {erro && <p id="erro-titulo" className="erro" role="alert">{erro}</p>}
      <button type="submit" disabled={desabilitado}>Adicionar chamado</button>
    </form>
  );
}
