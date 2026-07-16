import multer from 'multer';
import path from 'path';
import fs from 'fs';

const carpetaDestino = './public/uploads/tickets';
fs.mkdirSync(carpetaDestino, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, carpetaDestino);
    },
    filename: (req, file, cb) => {
        const nombreUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, nombreUnico);
    }
});

const filtroImagenes = (req, file, cb) => {
    const tiposPermitidos = /jpeg|jpg|png|gif|webp/;
    const extensionValida = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
    const mimeValido = tiposPermitidos.test(file.mimetype);

    if (extensionValida && mimeValido) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (jpg, png, gif, webp)'));
    }
};

const upload = multer({
    storage,
    fileFilter: filtroImagenes,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Envuelve multer para devolver el error en JSON en vez de romper con un 500 sin formato
export const uploadAdjuntoTicket = (req, res, next) => {
    upload.single('adjunto')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};
