import mongoose from 'mongoose';

const ClienteSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    telefono: { 
        type: String 
    }
}, { 
    timestamps: true 
});

export default mongoose.model('Cliente', ClienteSchema);