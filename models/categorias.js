import { ejecutarConsultaNeon } from "../database/dbNeon.js";

class categoriaRepositorio {
    static async getCategorias() {
        const query = `SELECT * FROM categorias`;
        return await ejecutarConsultaNeon(query);
    }
}

export default categoriaRepositorio