import { chamadosIniciais, categorias } from './dados.js';

export const CHAVE = 'helpdesk-academico-v1';

export function lerChamados() {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo === null) return chamadosIniciais;
    const dados = JSON.parse(salvo);
    const valido = Array.isArray(dados) && dados.every(item =>
      item && typeof item.id === 'string' && typeof item.titulo === 'string' &&
      categorias.includes(item.categoria) && typeof item.resolvido === 'boolean',
    ) && new Set(dados.map(item => item.id)).size === dados.length;
    return valido ? dados : chamadosIniciais;
  } catch {
    return chamadosIniciais;
  }
}
