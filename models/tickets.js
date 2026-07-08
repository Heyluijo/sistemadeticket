import { ejecutarConsultaNeon } from "../database/dbNeon.js";

class ticketRepositorio {

    static async crearTicket(nombre, descripcion, tecnico_automatico, id_tecnico, usuario_id, usuario) {

        const fecha_creacion = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const query = `
        INSERT INTO tickets (
            nombre,
            descripcion,
            tecnico_automatico,
            tecnico_asignado_id,
            usuario_id,
            usuario,
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

    static async eliminarTicket() {

    }
}

export default ticketRepositorio
