const apiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '');

async function requisitar(caminho, { method = 'GET', dados, signal } = {}) {
  if (!apiUrl) throw new Error('Configure VITE_API_URL no arquivo .env.');

  const resposta = await fetch(`${apiUrl}/chamados${caminho}`, {
    method,
    signal,
    headers: dados ? { 'Content-Type': 'application/json' } : undefined,
    body: dados ? JSON.stringify(dados) : undefined,
  });

  if (!resposta.ok) throw new Error(`A API retornou HTTP ${resposta.status}.`);
  if (method !== 'DELETE') return resposta.json();
}

export const listarChamados = signal => requisitar('', { signal });
export const criarChamado = dados => requisitar('', { method: 'POST', dados });
export const atualizarChamado = (id, resolvido) =>
  requisitar(`/${encodeURIComponent(id)}`, { method: 'PATCH', dados: { resolvido } });
export const excluirChamado = id =>
  requisitar(`/${encodeURIComponent(id)}`, { method: 'DELETE' });
