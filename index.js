const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send('API do Gestor Tecnico a correr com sucesso no Render!');
});

app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
});
