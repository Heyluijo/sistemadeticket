import { ejecutarConsulta } from "../database/db.js";
import bcrypt from 'bcrypt';

export class RepositorioUsuario {

    static async verUsuarios() {
        const query = `
            SELECT *
            FROM usuarios;
        `;

        return await ejecutarConsulta(query);
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
                password_hash
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        return await ejecutarConsulta(query, [nombre, apellido, usuario, email, hashPassword]);
    }

    static async login(usuario, password) {
        if (!usuario || !password) {
            return false;
        }

        const resultados = await ejecutarConsulta('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);

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

}