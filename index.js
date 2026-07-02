import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // 🔥 NUEVO: Importar JWT

// Importamos los modelos
import Usuario from './models/Usuario.js';
import Articulo from './models/Articulo.js';
import Cliente from './models/Cliente.js';

const app = express();
const SECRET_KEY = 'mi_clave_secreta_super_segura_2026'; // 🔑 Cambia esto en producción

// Middlewares
app.use(cors());
app.use(express.json());

// --- CONEXIÓN A MONGODB ---
mongoose.connect('mongodb://127.0.0.1:27017/mi_api_rest')
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => console.error('❌ Error de conexión:', err));

// ============================================
// 🔐 MIDDLEWARE PARA VERIFICAR TOKEN
// ============================================
const verificarToken = (req, res, next) => {
    // Obtener token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({ mensaje: '❌ Token no proporcionado' });
    }
    
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.usuario = decoded; // Guardar datos del usuario en la petición
        next(); // Continuar
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ mensaje: '⏰ Token expirado' });
        }
        return res.status(403).json({ mensaje: '❌ Token inválido' });
    }
};

// ============================================
// 🔐 ENDPOINT DE LOGIN (Genera JWT)
// ============================================
app.post('/login', async (req, res) => {
    try {
        const { usuario, password } = req.body;
        
        // Buscar usuario en MongoDB
        const user = await Usuario.findOne({ usuario });
        
        if (!user) {
            return res.status(401).json({ mensaje: '❌ Usuario no encontrado' });
        }
        
        // Comparar contraseña (encriptada vs ingresada)
        const passwordValida = await bcrypt.compare(password, user.password);
        
        if (!passwordValida) {
            return res.status(401).json({ mensaje: '❌ Contraseña incorrecta' });
        }
        
        // ✅ Generar token JWT con expiración de 3 minutos
        const token = jwt.sign(
            { 
                id: user._id, 
                usuario: user.usuario, 
                rol: user.rol 
            }, 
            SECRET_KEY, 
            { expiresIn: '3m' } // 3 minutos
        );
        
        res.json({ 
            mensaje: '✅ Login exitoso', 
            token: token,
            usuario: {
                id: user._id,
                usuario: user.usuario,
                rol: user.rol
            },
            expira_en: '3 minutos'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 📋 RUTAS DE USUARIOS (PROTEGIDAS CON JWT)
// ============================================

// GET: Ver todos los usuarios (PROTEGIDO)
app.get('/usuarios', verificarToken, async (req, res) => {
    try {
        const usuarios = await Usuario.find().select('-password'); // Ocultar contraseñas
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Ver un usuario por ID (PROTEGIDO)
app.get('/usuarios/:id', verificarToken, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id).select('-password');
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Crear usuario (PROTEGIDO)
app.post('/usuarios', verificarToken, async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(req.body.password, salt);

        const nuevoUsuario = new Usuario({
            usuario: req.body.usuario,
            password: passwordEncriptada,
            rol: req.body.rol || 'user'
        });

        await nuevoUsuario.save();
        res.status(201).json({ 
            mensaje: "✅ Usuario creado de forma segura", 
            usuario: nuevoUsuario.usuario 
        });
    } catch (error) {
        res.status(400).json({ error: "Error al crear el usuario. Verifica que el usuario no exista ya." });
    }
});

// PUT: Actualizar usuario (PROTEGIDO)
app.put('/usuarios/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { usuario, password, rol } = req.body;
        
        // Si viene nueva contraseña, encriptarla
        let datosActualizar = { usuario, rol };
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const passwordEncriptada = await bcrypt.hash(password, salt);
            datosActualizar.password = passwordEncriptada;
        }
        
        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            id, 
            datosActualizar, 
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!usuarioActualizado) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        
        res.json({ mensaje: '✅ Usuario actualizado', usuario: usuarioActualizado });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE: Eliminar usuario (PROTEGIDO)
app.delete('/usuarios/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioEliminado = await Usuario.findByIdAndDelete(id);
        
        if (!usuarioEliminado) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        
        res.json({ mensaje: '✅ Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 📋 RUTAS DE ARTÍCULOS (PROTEGIDAS)
// ============================================

// GET: Ver todos los artículos (PROTEGIDO)
app.get('/articulos', verificarToken, async (req, res) => {
    try {
        const articulos = await Articulo.find();
        res.json(articulos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Crear artículo (PROTEGIDO)
app.post('/articulos', verificarToken, async (req, res) => {
    try {
        const nuevoArticulo = new Articulo(req.body);
        await nuevoArticulo.save();
        res.status(201).json(nuevoArticulo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// 📋 RUTAS DE CLIENTES (PROTEGIDAS)
// ============================================

// GET: Ver todos los clientes (PROTEGIDO)
app.get('/clientes', verificarToken, async (req, res) => {
    try {
        const clientes = await Cliente.find();
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Crear cliente (PROTEGIDO)
app.post('/clientes', verificarToken, async (req, res) => {
    try {
        const nuevoCliente = new Cliente(req.body);
        await nuevoCliente.save();
        res.status(201).json(nuevoCliente);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// 🚀 INICIO DEL SERVIDOR
// ============================================
app.listen(3000, '0.0.0.0', () => {
    console.log('🚀 Servidor corriendo en el puerto 3000');
    console.log('🔐 JWT activado - Tokens expiran en 3 minutos');
    console.log('🔒 CORS y Bcrypt activados');
});