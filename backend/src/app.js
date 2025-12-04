const express = require('express');
const cors = require('cors');
const  routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

//Rutas

app.get('/', (req, res) => {
    res.send('API funcionando correctamente 🚀');
});

// Manejo de errores

module.exports = app;