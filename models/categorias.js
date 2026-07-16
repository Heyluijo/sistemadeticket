import { ejecutarConsultaNeon } from "../database/dbNeon.js";

class categoriaRepositorio {
    static async getCategorias() {
        const query = `SELECT * FROM categorias`;
        return await ejecutarConsultaNeon(query);
    }

    // Crea una categoría nueva
    static async crearCategoria(nombreCategoria, descripcion) {
        const query = `
            INSERT INTO categorias ("nombreCategoria", descripcion)
            VALUES ($1, $2)
            RETURNING *;
        `;
        return await ejecutarConsultaNeon(query, [nombreCategoria, descripcion]);
    }

    // Edita el nombre y la descripción de una categoría existente
    static async editarCategoria(id, nombreCategoria, descripcion) {
        const query = `
            UPDATE categorias
            SET "nombreCategoria" = $2, descripcion = $3
            WHERE id = $1
            RETURNING *;
        `;
        return await ejecutarConsultaNeon(query, [id, nombreCategoria, descripcion]);
    }

    // Elimina una categoría
    static async eliminarCategoria(id) {
        const query = `
            DELETE FROM categorias
            WHERE id = $1
            RETURNING *;
        `;
        return await ejecutarConsultaNeon(query, [id]);
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