const express = require('express');
const cors = require('cors');
const csv = require('csv-parser');
const { Readable } = require('stream');

const app = express();
app.use(cors());

// Aumentando o limite para receber o arquivo pesado inteiro
app.use(express.text({ type: '*/*', limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send('API do Grupo Pluma rodando e aguardando dados!');
});

app.post('/processar', (req, res) => {
    try {
        const csvData = req.body;
        
        if (!csvData) {
            return res.status(400).send('Nenhum dado recebido');
        }

        const resultados = [];
        const stream = Readable.from([csvData]);
        
        stream
            .pipe(csv({ separator: ';' })) // Ajuste para ',' se o seu CSV usar vírgula
            .on('data', (row) => {
                
                // === O RACIOCÍNIO DOS CÁLCULOS ENTRA AQUI ===
                // Puxando as colunas (Ajuste os nomes para ficar exatamente igual ao cabeçalho do seu CSV)
                let ano = parseInt(row.ano_lote || 0); 
                let pesoMedio = parseFloat((row.peso_medio || "0").replace(',', '.')); // Tratando vírgula BR
                let caReal = parseFloat((row.ca_real || "0").replace(',', '.'));
                
                // Regra dinâmica de peso base por ano
                let pesoBase = 3.000; // Base padrão para 2025 e anteriores
                if (ano >= 2026) {
                    pesoBase = 3.250; // Nova regra a partir de 2026
                }

                // Cálculo da CA Ajustada (Altere o fator divisor conforme a matemática que você usa no DAX)
                let diferencaPeso = pesoBase - pesoMedio;
                let caAjustada = caReal + (diferencaPeso / 3.0); 

                // Gravando o resultado na própria linha processada
                row.peso_base_aplicado = pesoBase;
                row.ca_ajustada_final = caAjustada.toFixed(3);

                resultados.push(row);
            })
            .on('end', () => {
                console.log(`Sucesso: ${resultados.length} linhas calculadas com as regras de C.A.`);
                
                // Devolve os dados prontos
                res.status(200).json({ 
                    mensagem: "Dados processados e C.A. Ajustada calculada com sucesso!", 
                    total_linhas: resultados.length,
                    amostra_primeira_linha: resultados[0] 
                });
            });

    } catch (error) {
        console.error("Erro ao processar:", error);
        res.status(500).send("Deu erro no servidor ao tentar calcular");
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando liso na porta ${PORT}`);
});
