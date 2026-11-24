import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const arquivo = fileURLToPath(new URL('./chamados.sqlite', import.meta.url));
const banco = new DatabaseSync(process.env.DB_PATH || arquivo);
banco.exec(`
  CREATE TABLE IF NOT EXISTS chamados (
    id TEXT PRIMARY KEY,
    titulo TEXT,
    categoria TEXT,
    resolvido INTEGER DEFAULT 0
  )
`);

const listar = banco.prepare('SELECT * FROM chamados ORDER BY rowid DESC');
const buscar = banco.prepare('SELECT * FROM chamados WHERE id = ?');
const inserir = banco.prepare('INSERT INTO chamados (id, titulo, categoria) VALUES (?, ?, ?)');
const atualizar = banco.prepare('UPDATE chamados SET resolvido = ? WHERE id = ?');
const excluir = banco.prepare('DELETE FROM chamados WHERE id = ?');

function chamadoJson(linha) {
  return { ...linha, resolvido: Boolean(linha.resolvido) };
}

function responder(resposta, status, dados) {
  if (dados === undefined) {
    resposta.writeHead(status).end();
    return;
  }
  resposta.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  resposta.end(JSON.stringify(dados));
}

async function lerJson(requisicao) {
  requisicao.setEncoding('utf8');
  let texto = '';
  for await (const trecho of requisicao) texto += trecho;
  return JSON.parse(texto);
}

const servidor = createServer(async (requisicao, resposta) => {
  resposta.setHeader('Access-Control-Allow-Origin', '*');
  resposta.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  resposta.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { method } = requisicao;
    const caminho = new URL(requisicao.url, 'http://localhost').pathname;

    if (method === 'OPTIONS') return responder(resposta, 204);
    if (caminho === '/chamados' && method === 'GET') {
      return responder(resposta, 200, listar.all().map(chamadoJson));
    }
    if (caminho === '/chamados' && method === 'POST') {
      const { titulo, categoria } = await lerJson(requisicao);
      const id = randomUUID();
      inserir.run(id, titulo ?? null, categoria ?? null);
      return responder(resposta, 201, chamadoJson(buscar.get(id)));
    }

    const rota = /^\/chamados\/([^/]+)$/.exec(caminho);
    if (rota) {
      const id = decodeURIComponent(rota[1]);
      if (method === 'PATCH') {
        const { resolvido } = await lerJson(requisicao);
        if (atualizar.run(Number(Boolean(resolvido)), id).changes) {
          return responder(resposta, 200, chamadoJson(buscar.get(id)));
        }
      }
      if (method === 'DELETE' && excluir.run(id).changes) {
        return responder(resposta, 204);
      }
    }

    return responder(resposta, 404, { erro: 'Recurso não encontrado.' });
  } catch (erro) {
    if (erro instanceof SyntaxError || erro instanceof URIError) {
      return responder(resposta, 400, { erro: 'Requisição inválida.' });
    }
    console.error(erro);
    return responder(resposta, 500, { erro: 'Erro interno.' });
  }
});

const porta = Number(process.env.PORT || 3000);
servidor.listen(porta, '127.0.0.1', () => {
  console.log(`API disponível em http://localhost:${servidor.address().port}/chamados`);
});
