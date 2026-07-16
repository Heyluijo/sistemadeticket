import { ejecutarConsulta } from "../database/db.js";
import { ejecutarConsultaNeon } from "../database/dbNeon.js";
import bcrypt from 'bcrypt';

export class RepositorioUsuario {

    static async verUsuarios() {
        const query = `
            SELECT *
            FROM usuarios;
        `;

        return await ejecutarConsultaNeon(query);
    }

    static async crearUsuario(nombre, apellido, usuario, email, password, repassword) {

        if (!nombre) {
            return 'nombre es obligatorio'
        }
        if (!apellido) {
            return 'apellido es obligatorio'
        }
        if (!usuario) {
            return 'usuario es obligatorio'
        }
        if (!email) {
            return 'email es obligatorio'
        }
        if (!password) {
            return 'password es obligatorio'
        }
        if (!repassword) {
            return 'repassword es obligatorio'
        }
        if (password !== repassword) {
            return 'las contraseñas no coinciden'
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const query = `
                        INSERT INTO usuarios (
                            nombre,
                            apellido,
                            usuario,
                            email,
                            password_hash,
                            rol
                        ) VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING *;
                    `;

        return await ejecutarConsultaNeon(query, [
            nombre,
            apellido,
            usuario,
            email,
            hashPassword,
            'Usuario'
        ]);
    }

    // Crea un usuario nuevo directamente desde el panel de Admin (elige el rol de una vez)
    static async crearUsuarioAdmin(nombre, apellido, usuario, email, password, rol) {
        if (!nombre) return 'nombre es obligatorio'
        if (!apellido) return 'apellido es obligatorio'
        if (!usuario) return 'usuario es obligatorio'
        if (!email) return 'email es obligatorio'
        if (!password) return 'password es obligatorio'
        if (!rol) return 'rol es obligatorio'

        const hashPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO usuarios (nombre, apellido, usuario, email, password_hash, rol)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;

        return await ejecutarConsultaNeon(query, [nombre, apellido, usuario, email, hashPassword, rol]);
    }

    static async login(usuario, password) {
        if (!usuario || !password) {
            return false;
        }

        const resultados = await ejecutarConsultaNeon('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);

        if (resultados.length === 0) {
            console.log('Usuario incorrecto');
            return false;
        }

        const usuarioDb = resultados[0];
        const passwordValido = await bcrypt.compare(password, usuarioDb.password_hash);
        if (!passwordValido) {
            console.log('Contraseña incorrecta');
            return false;
        }
        return usuarioDb;
    }

    static async verTecnicosSoporte() {
        const query = `
            SELECT id, nombre, apellido, "categoriaAsignada"
            FROM usuarios
            WHERE rol = 'Soporte'
            ORDER BY nombre;
        `;
        return await ejecutarConsultaNeon(query);
    }

    // Edita nombre, apellido y email de un usuario existente
    static async editarUsuario(id, nombre, apellido, email) {
        const query = `
            UPDATE usuarios
            SET nombre = $2, apellido = $3, email = $4
            WHERE id = $1
            RETURNING *;
        `;
        return await ejecutarConsultaNeon(query, [id, nombre, apellido, email]);
    }

    // Elimina un usuario de forma definitiva
    static async eliminarUsuario(id) {
        const query = `
            DELETE FROM usuarios
            WHERE id = $1
            RETURNING *;
        `;
        return await ejecutarConsultaNeon(query, [id]);
    }

    static async asignarRol(id, rol) {
        if (!id || !rol) {
            return false;
        }
        const query = `
            UPDATE usuarios
            SET rol= $2
            WHERE id = $1
            RETURNING *;
        `;
        return await ejecutarConsultaNeon(query, [id, rol]);
    }


}