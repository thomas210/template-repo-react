export default function CartaoChamado({ chamado, aoAlternar, aoExcluir }) {
  return (
    <li className="cartao">
      <div>
        <span className="categoria">{chamado.categoria}</span>
        <h3>{chamado.titulo}</h3>
        <p className={chamado.resolvido ? 'resolvido' : 'aberto'}>
          {chamado.resolvido ? 'Resolvido' : 'Em aberto'}
        </p>
      </div>
      <div className="acoes">
        <button onClick={() => aoAlternar(chamado.id)}
          aria-label={`${chamado.resolvido ? 'Reabrir' : 'Resolver'}: ${chamado.titulo}`}>
          {chamado.resolvido ? 'Reabrir' : 'Resolver'}
        </button>
        <button className="secundario" onClick={() => aoExcluir(chamado.id)}
          aria-label={`Excluir: ${chamado.titulo}`}>Excluir</button>
      </div>
    </li>
  );
}
