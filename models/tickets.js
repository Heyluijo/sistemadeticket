import { ejecutarConsultaNeon } from "../database/dbNeon.js";

class ticketRepositorio {

    static async crearTicket(nombre, descripcion, tecnico_automatico, id_tecnico, usuario_id, usuario, prioridad = 'Media') {

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
