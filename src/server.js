require('dotenv').config();
const app = require('./app');
const { sequelize } = require('../models');

const PORT = process.env.PORT || 3000;

async function start(){
    try{
        await sequelize.authenticate();
        console.log('DB conectada correctamente');

        app.listen(PORT, () =>{
            console.log(`Servidor corriendo en puerto ${PORT}`);
        });
    } catch (error){
        console.error('Error al conectar la DB', error);
    }
}

start();
