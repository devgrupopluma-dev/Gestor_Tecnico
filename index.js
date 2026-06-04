const express = require('express');
const cors = require('cors');
const csv = require('csv-parser');
const { Readable } = require('stream');

const app = express();
app.use(cors());

// Configurando para receber textos pesados do Power Automate (até 50MB)
app.use(express.text({ type: '*/*', limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 10000;

// Rota principal (aquela tela preta que testamos)
app.get('/', (req, res) => {
    res.send('API do Grupo Pluma rodando liso no Render!');
});

// Nossa porta de entrada para o Power Automate enviar o CSV
app.post('/processar', (req, res) => {
    try {
        const csvData = req.body; // O texto do arquivo entra aqui
        
        if (!csvData) {
            return res.status(400).send('Nenhum dado recebido');
        }

        console.log("CSV recebido do Automate. Tamanho:", csvData.length);

        const resultados = [];
        
        // Transformando o texto bruto em linhas organizadas
        const stream = Readable.from([csvData]);
        
        stream
            .pipe(csv({ separator: ';' })) // Lendo separado por ponto e vírgula
            .on('data', (row) => {
                // Aqui é onde os cálculos (como a C.A. Ajustada por ano) vão rodar
                resultados.push(row);
            })
            .on('end', () => {
                console.log(`Sucesso: ${resultados.length} linhas lidas.`);
                // Avisa o Power Automate que o pacote chegou e foi processado
                res.status(200).json({ 
                    mensagem: "Dados processados com sucesso!", 
                    total_linhas: resultados.length,
                    amostra: resultados[0] // Mostra a primeira linha só pra gente conferir
                });
            });

    } catch (error) {
        console.error("Erro ao processar:", error);
        res.status(500).send("Deu erro no servidor");
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
