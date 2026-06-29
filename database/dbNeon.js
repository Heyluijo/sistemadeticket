import "dotenv/config";

import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DB_NEON,
    ssl: {
        rejectUnauthorized: false
    }
});

async function ejecutarConsultaNeon(query, params = []) {
    try {
        const result = await pool.query(query, params);
        return result.rows;
    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);
        throw error;
    }
}

async function conectarDB() {
    try {
        const client = await pool.connect();
        console.log('✅ Conexión a PostgreSQL Neon establecida correctamente.');
        client.release();
    } catch (error) {
        console.error('Error al conectar con PostgreSQL Neon:', error.message);
        process.exit(1);
    }
}

export { ejecutarConsultaNeon, conectarDB, pool };