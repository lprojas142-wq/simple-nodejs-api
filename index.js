import express from 'express';
import fs from 'fs';

const app = express();
app.use(express.json());

// Funciones para simular la Base de Datos

const readData = () => {
    try {
        const data = fs.readFileSync('./db.json');
        return JSON.parse(data);
    } catch (error) {
        console.log("Error al leer datos:", error);
    }
};

const writeData = (data) => {
    try {
        fs.writeFileSync('./db.json', JSON.stringify(data));
    } catch (error) {
        console.log("Error al escribir datos:", error);
    }
};

// 1. GET sin parámetros (Listar todos los usuarios)
app.get('/usuarios', (req, res) => {
    const data = readData();
    res.json(data.usuarios);
});

// 2. GET con parámetro (Obtener un usuario por ID)

app.get('/usuarios/:id', (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const usuario = data.usuarios.find(u => u.id === id);
    
    if (usuario) {
        res.json(usuario);
    } else {
        res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
});

// 3. POST (Crear usuario)

app.post('/usuarios', (req, res) => {
    const data = readData();
    const body = req.body;
    
    const nuevoUsuario = {
        id: data.usuarios.length > 0 ? Math.max(...data.usuarios.map(u => u.id)) + 1 : 1,
        ...body
    };
    
    data.usuarios.push(nuevoUsuario);
    writeData(data);
    
    res.status(201).json(nuevoUsuario);
});

// 4. PUT con parámetro (Actualizar usuario)

app.put('/usuarios/:id', (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const body = req.body;
    
    const index = data.usuarios.findIndex(u => u.id === id);
    
    if (index !== -1) {
        data.usuarios[index] = { id, ...body };
        writeData(data);
        res.json({ mensaje: "Usuario actualizado correctamente", usuario: data.usuarios[index] });
    } else {
        res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
});

// 5. DELETE con parámetro (Eliminar usuario)

app.delete('/usuarios/:id', (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const index = data.usuarios.findIndex(u => u.id === id);
    
    if (index !== -1) {
        data.usuarios.splice(index, 1);
        writeData(data);
        res.json({ mensaje: "Usuario eliminado correctamente" });
    } else {
        res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
});

app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});