import mongoose from 'mongoose';

const UsuarioSchema = new mongoose.Schema({
    usuario: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    rol: { 
        type: String, 
        required: true, 
        default: 'cliente' 
    }
}, { 
    timestamps: true 
});

export default mongoose.model('Usuario', UsuarioSchema);