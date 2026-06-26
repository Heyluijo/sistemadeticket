import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/'); // ENVIA AL LOGIN
    }

    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodificado;
        next();
    } catch (error) {
        console.error('Error al verificar token:', error.message);
        res.clearCookie('token');
        return res.redirect('/');
    }
};
