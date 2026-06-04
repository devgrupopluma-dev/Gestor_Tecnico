const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// O Render injeta a porta automaticamente
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('API do Gestor Tecnico rodando com sucesso!');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
