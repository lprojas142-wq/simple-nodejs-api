import mongoose from 'mongoose';

const ArticuloSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: true 
    },
    precio: { 
        type: Number, 
        required: true 
    },
    stock: { 
        type: Number, 
        default: 0 
    }
}, { 
    timestamps: true 
});

export default mongoose.model('Articulo', ArticuloSchema);