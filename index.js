import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'; // 1. Seguridad para permitir conexiones externas
import bcrypt from 'bcrypt'; // 2. Librería para encriptar contraseñas

// 3. Importamos los modelos separados que creaste
import Usuario from './models/Usuario.js';
import Articulo from './models/Articulo.js';
import Cliente from './models/Cliente.js';

const app = express();

// Middlewares
app.use(cors()); // Activamos CORS
app.use(express.json());

// --- CONEXIÓN A MONGODB ---
mongoose.connect('mongodb://127.0.0.1:27017/mi_api_rest')
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => console.error('❌ Error de conexión:', err));


// --- RUTAS DE USUARIOS ---

// GET: Ver todos los usuarios
app.get('/usuarios', async (req, res) => {
    const usuarios = await Usuario.find();
    res.json(usuarios);
});

// POST: Crear usuario con contraseña ENCRIPTADA
app.post('/usuarios', async (req, res) => {
    try {
        // Generamos un "salt" (texto aleatorio para mayor seguridad) y encriptamos
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(req.body.password, salt);

        // Creamos el usuario reemplazando la contraseña original por la encriptada
        const nuevoUsuario = new Usuario({
            usuario: req.body.usuario,
            password: passwordEncriptada,
            rol: req.body.rol
        });

        await nuevoUsuario.save();
        res.status(201).json({ mensaje: "Usuario creado de forma segura", usuario: nuevoUsuario.usuario });
    } catch (error) {
        res.status(400).json({ error: "Error al crear el usuario. Verifica que el usuario no exista ya." });
    }
});


// --- RUTAS DE ARTÍCULOS (Ejemplo básico) ---
app.get('/articulos', async (req, res) => {
    const articulos = await Articulo.find();
    res.json(articulos);
});

app.post('/articulos', async (req, res) => {
    try {
        const nuevoArticulo = new Articulo(req.body);
        await nuevoArticulo.save();
        res.status(201).json(nuevoArticulo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// --- RUTAS DE CLIENTES (Ejemplo básico) ---
app.get('/clientes', async (req, res) => {
    const clientes = await Cliente.find();
    res.json(clientes);
});

app.post('/clientes', async (req, res) => {
    try {
        const nuevoCliente = new Cliente(req.body);
        await nuevoCliente.save();
        res.status(201).json(nuevoCliente);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// --- INICIO DEL SERVIDOR ---
app.listen(3000, '0.0.0.0', () => {
    console.log('🚀 Servidor corriendo en el puerto 3000 con CORS y Bcrypt activados');
});