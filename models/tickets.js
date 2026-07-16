import { ejecutarConsultaNeon } from "../database/dbNeon.js";

class ticketRepositorio {

    static async crearTicket(nombre, descripcion, tecnico_automatico, id_tecnico, usuario_id, usuario, prioridad = 'Media', adjunto = null) {

        const fecha_creacion = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const query = `
        INSERT INTO tickets (
            nombre,
            descripcion,
            tecnico_automatico,
            tecnico_asignado_id,
            usuario_id,
            usuario,
            prioridad,
            adjunto,
            fecha_creacion,
            fecha_cierre
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            NULL
        ) RETURNING *;
        `;
        return await ejecutarConsultaNeon(query, [
            nombre,
            descripcion,
            tecnico_automatico,
            id_tecnico,
            usuario_id,
            usuario,
            prioridad,
            adjunto,
            fecha_creacion
        ]);
    }

    static async verTickets() {
        const query = `
        SELECT 
        * 
        FROM 
        tickets
        `
        return await ejecutarConsultaNeon(query);
    }

    static async verTicketPorId() {

    }

    static async actualizarTicket() {

    }

    // Marca el ticket como solucionado (cerrado=true, pone fecha_cierre) o lo reabre (cerrado=false, fecha_cierre en NULL)
    static async cambiarEstadoTicket(id, cerrado) {
        const fechaCierre = cerrado ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;
        const query = `
            UPDATE tickets
            SET fecha_cierre = $2
            WHERE id = $1
            RETURNING *;
        `;
        return await ejecutarConsultaNeon(query, [id, fechaCierre]);
    }

    static async asignarTecnico(id, tecnico_asignado_id) {
        const query = `
            UPDATE tickets
            SET tecnico_asignado_id = $2, tecnico_automatico = false
            WHERE id = $1
            RETURNING *;
        `;
        return await ejecutarConsultaNeon(query, [id, tecnico_asignado_id]);
    }

    static async eliminarTicket() {

    }

    // Cuántos tickets tiene asignados cada técnico de soporte y cuántos ha resuelto
    static async desempenoSoporte() {
        const query = `
            SELECT
                u.id, u.nombre, u.apellido, u."categoriaAsignada",
                COUNT(t.id)::int AS asignados,
                COUNT(t.id) FILTER (WHERE t.fecha_cierre IS NOT NULL)::int AS resueltos
            FROM usuarios u
            LEFT JOIN tickets t ON t.tecnico_asignado_id = u.id
            WHERE u.rol = 'Soporte'
            GROUP BY u.id, u.nombre, u.apellido, u."categoriaAsignada"
            ORDER BY u.nombre;
        `;
        return await ejecutarConsultaNeon(query);
    }

    // Cuántos tickets se han creado y resuelto por cada categoría
    static async serviciosPorCategoria() {
        const query = `
            SELECT
                c."nombreCategoria" AS categoria,
                COUNT(t.id)::int AS creados,
                COUNT(t.id) FILTER (WHERE t.fecha_cierre IS NOT NULL)::int AS resueltos
            FROM categorias c
            LEFT JOIN tickets t ON t.nombre = c."nombreCategoria"
            GROUP BY c."nombreCategoria"
            ORDER BY c."nombreCategoria";
        `;
        return await ejecutarConsultaNeon(query);
    }

    // Últimos eventos de tickets (creación y resolución) para el feed de "Actividad reciente"
    static async actividadReciente(limite = 5) {
        const query = `
            SELECT id, nombre, fecha_creacion AS fecha, 'creado' AS tipo FROM tickets
            UNION ALL
            SELECT id, nombre, fecha_cierre AS fecha, 'resuelto' AS tipo FROM tickets WHERE fecha_cierre IS NOT NULL
            ORDER BY fecha DESC
            LIMIT $1;
        `;
        return await ejecutarConsultaNeon(query, [limite]);
    }

    static async ticketsAsignados() {
        const query = `
                    SELECT
    t.*,
    u.nombre AS nombre_usuario,
    u.apellido AS apellido_usuario,
    u.email,
    u.rol
FROM
    tickets t
    JOIN usuarios u ON t.nombre = u."categoriaAsignada"
ORDER BY t.id DESC
                    `
        return await ejecutarConsultaNeon(query)
    }
}

export default ticketRepositorio
