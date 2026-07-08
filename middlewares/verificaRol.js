import { ejecutarConsultaNeon } from '../database/dbNeon.js';

export const rolesAutorizados = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'No autenticado. Por favor, inicia sesión.' });
        }

        if (!rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({ message: 'No tienes permiso para acceder a esta ruta' });
        }

        next();
    };
};
export const verificarRolEnBD = (...rolesPermitidos) => {
    return async (req, res, next) => {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'No autenticado.' });
        }

        try {
            const query = 'SELECT rol FROM usuarios WHERE id = $1';
            const resultados = await ejecutarConsultaNeon(query, [req.user.id]);

            if (resultados.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado.' });
            }

            const rolActual = resultados[0].rol;

            if (!rolesPermitidos.includes(rolActual)) {
                return res.status(403).json({ message: 'No tienes permiso para acceder a esta ruta' });
            }

            next();
        } catch (error) {
            console.error('Error al verificar rol en BD:', error);
            res.status(500).json({ message: 'Error interno al validar permisos' });
        }
    };
};