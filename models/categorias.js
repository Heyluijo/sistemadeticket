import { ejecutarConsultaNeon } from "../database/dbNeon.js";

class categoriaRepositorio {
    static async getCategorias() {
        const query = `SELECT * FROM categorias`;
        return await ejecutarConsultaNeon(query);
    }

    static async usuarioAsignado() {
        const query = `
        SELECT
            u.nombre AS nombre,
            c."nombreCategoria" AS Categoria,
            c.descripcion AS descripcion
        FROM usuarios u
        JOIN categorias c
            ON u."categoriaAsignada" = c."nombreCategoria";
    `;
        return await ejecutarConsultaNeon(query);
    }
}

export default categoriaRepositorio