const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());

// Rota para servir a interface visual (Front-End)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// GET /api/categorias - Retorna as categorias do banco
app.get('/api/categorias', (req, res) => {
    const data = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    res.json(data.categorias);
});

// GET /api/perguntas - Busca avançada e filtros por categoria
app.get('/api/perguntas', (req, res) => {
    const data = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    let resultados = data.perguntas;
    
    const query = req.query.q;
    const categoriaId = req.query.categoriaId;

    if (categoriaId) {
        resultados = resultados.filter(p => p.categoriaId == categoriaId);
    }

    if (query) {
        const termo = query.toLowerCase();
        resultados = resultados.filter(p => 
            p.titulo.toLowerCase().includes(termo) || 
            p.resposta.toLowerCase().includes(termo)
        );
    }

    res.json(resultados);
});

// POST /api/admin/perguntas - Insere uma nova pergunta e grava no arquivo db.json
app.post('/api/admin/perguntas', (req, res) => {
    const data = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    const { titulo, resposta, categoriaId } = req.body;

    if (!titulo || !resposta || !categoriaId) {
        return res.status(400).json({ error: "Campos obrigatórios ausentes" });
    }

    const novaPergunta = {
        id: data.perguntas.length + 1,
        categoriaId: parseInt(categoriaId),
        titulo,
        resposta
    };

    data.perguntas.push(novaPergunta);
    fs.writeFileSync('db.json', JSON.stringify(data, null, 2));

    res.status(201).json({ success: true, item: novaPergunta });
});

// Inicialização do Servidor HTTP
app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(` BACK-END EXECUTANDO COM SUCESSO`);
    console.log(` Acesse a aplicação em: http://localhost:${PORT}`);
    console.log(`===================================================`);
});
