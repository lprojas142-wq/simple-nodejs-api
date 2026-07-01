import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

// 1. CONEXIÓN A MONGODB
// Asegúrate de que el servicio 'mongod' esté corriendo en tu servidor Ubuntu
mongoose.connect('mongodb://127.0.0.1:27017/mi_api_rest')
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => console.error('❌ Error de conexión:', err));

// 2. MODELO DE USUARIO
const Usuario = mongoose.model('Usuario', new mongoose.Schema({
    usuario: { type: String, required: true },
    password: { type: String, required: true },
    rol: { type: String, required: true }
}));

// 3. RUTAS CRUD
// GET Todos
app.get('/usuarios', async (req, res) => {
    const usuarios = await Usuario.find();
    res.json(usuarios);
});

// GET Por ID (MongoDB usa IDs alfanuméricos largos)
app.get('/usuarios/:id', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        usuario ? res.json(usuario) : res.status(404).json({ mensaje: "No encontrado" });
    } catch (error) { res.status(400).json({ mensaje: "ID inválido" }); }
});

// POST Crear
app.post('/usuarios', async (req, res) => {
    const nuevoUsuario = new Usuario(req.body);
    await nuevoUsuario.save();
    res.status(201).json(nuevoUsuario);
});

// PUT Actualizar
app.put('/usuarios/:id', async (req, res) => {
    const actualizado = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    actualizado ? res.json(actualizado) : res.status(404).json({ mensaje: "No encontrado" });
});

// DELETE Eliminar
app.delete('/usuarios/:id', async (req, res) => {
    const eliminado = await Usuario.findByIdAndDelete(req.params.id);
    eliminado ? res.json({ mensaje: "Eliminado" }) : res.status(404).json({ mensaje: "No encontrado" });
});

app.listen(3000, '0.0.0.0', () => {
    console.log('🚀 Servidor corriendo en el puerto 3000');
});