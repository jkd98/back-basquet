//  +++++++++++ Librerias ++++++++++++++++
import express from 'express';
import dotenv from 'dotenv';
import cors from "cors"; // permitir coneiones desde el domini del front

//  +++++++++++ Modulos ++++++++++++++++
import conectarDB from "./config/db.js";
import { sanitizeObject } from './middleware/sanitiza.js';

//  +++++++++++ Routes +++++++++++++++++
import userRoutes from './routes/userRoutes.js';
import leagueRoutes from './routes/leagueRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
import seasonRoutes from './routes/seasonRoutes.js';
import roleplayRoutes from './routes/roleplayRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import gameRoutes from './routes/gameRoutes.js';

// Esto va a buscar por un archivo .env
dotenv.config();

// Crear la app const app = express();
const app = express();

app.use(express.json()); // para que procese informacion json correctamente

// Puerto 
const port = process.env.PORT || 3000;

// conectar a la base de datos
conectarDB();

// Configurar CORS

// Dominios Permitidos
const whiteList = [
    process.env.E_FRONT,
    process.env.TEST_BACK,
];

if (process.argv[2] === '--api') {
    whiteList.push(undefined);//provienen del mismo host | postman
}

const corsOptions = {
    origin: function (origin, callback) {
        console.log(origin)
        // Comprobar en la lista blanca
        if (whiteList.includes(origin)) {
            // Puede consultar la API
            callback(null, true);
        } else {
            // No esta permitido
            console.log('CORS bloqueado para:', origin);
            callback(new Error("Error de CORS"));
        };
    },
    credentials: true
};

// Configuración CORS para archivos estáticos
const corsOptionsUploads = {
    origin: function (origin, callback) {
        // Permitir si no hay origin (para carga directa de img) O si está en la lista blanca
        if (!origin || whiteList.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Error de CORS"));
        }
    },
    // Las credenciales generalmente no son necesarias para las imágenes GET
    credentials: false,
    // ¡IMPORTANTE! Limitar el acceso a solo lectura
    methods: ['GET', 'HEAD']
};

//Aplicando CORS

// Middleware de sanitización
app.use((req, res, next) => {
    if (req.body) sanitizeObject(req.body);
    if (req.query) sanitizeObject(req.query);
    if (req.params) sanitizeObject(req.params);
    next();
});

// Rutas
//http://tu-servidor.com/uploads/nombreArchivo.jpg
app.use('/public/uploads', cors(corsOptionsUploads), express.static('public/uploads')); // 'uploads' es la carpeta donde guardas las imágenes

app.use(cors(corsOptions));
app.use('/auth', userRoutes);
app.use('/league', leagueRoutes);
app.use('/team', teamRoutes);
app.use('/player', playerRoutes);
app.use('/season', seasonRoutes);
app.use('/roleplay', roleplayRoutes);
app.use('/invitation', invitationRoutes);
app.use('/game', gameRoutes);

// Iniciando el servidor
app.listen(port, () => {
    // http://localhost:3050/
    console.log(`Server is running on http://localhost:${port}`);
});
