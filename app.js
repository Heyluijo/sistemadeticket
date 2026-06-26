import express from 'express';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import apiRouter from './routers/apiRouters.js';
import * as db from './database/db.js';

import { RepositorioUsuario } from './models/users.js'

const app = express();
const PORT = process.env.PUERTOAPP

// Habilita Cookies
app.use(cookieParser())

//Habilita Uso de JSON
app.use(express.json())

//Habilitar uso de formularios
app.use(express.urlencoded({ extended: true }))

//carpeta para servir recursos
app.use(express.static('public'))

//Uso de EJS
app.set('view engine', 'ejs');
app.set('views', './views');

//conexion DB
db.conectarDB()

//Rutas
app.use('/', apiRouter);


/*
(async () => {
    try {
        const verUsuarios = await RepositorioUsuario.verUsuarios();
        console.log('Usuarios registrados', verUsuarios);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
    }
})();
*/


app.listen(PORT, () => {
    console.log(`App corriendo en el puerto ${PORT}`);
    console.log(`TickeIT : http://localhost:${PORT}`);
});
