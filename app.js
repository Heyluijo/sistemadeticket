import express from 'express';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import apiRouter from './routers/apiRouters.js';
import * as db from './database/dbNeon.js';

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


app.listen(PORT, () => {
    console.log(`TickeIT : http://localhost:${PORT}`);
});
