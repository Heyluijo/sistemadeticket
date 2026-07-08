import { Router } from 'express';
import * as apiController from '../controllers/apiControllers.js';
import { verificarToken } from '../middlewares/authMiddleware.js';
import { rolesAutorizados } from '../middlewares/verificaRol.js';

const router = Router();

// RUTAS PÚBLICAS
router.get('/', apiController.login); // LOGIN
router.post('/login', apiController.loginPost) // POST LOGIN
router.get('/register', apiController.register) // REGISTRAR
router.post('/register', apiController.registerPost) // POST REGISTRAR


/**************************************
 * 
 * PANEL DE GERENTES Y SOPORTES
 * 
 **************************************/
router.get('/soporte', verificarToken, rolesAutorizados('Soporte', 'Admin'), apiController.renderSoporte) // PAGINA DE SOPORTE
router.get('/gerente', verificarToken, rolesAutorizados('Gerente', 'Admin'), apiController.renderGerente) // PAGINA DE GERENTE
router.get('/verTicketsAsignados', verificarToken, apiController.ticketsAsignados) // PAGINA DE TICKETS ASIGNADOS
router.get('/gestionDeTicket', verificarToken, rolesAutorizados('Usuario', 'Admin'), apiController.renderUsuario) // PAGINA DE USUARIOS


/**************************************
 * 
 * PANEL DE ADMINISTRACION Y OPCIONES
 * 
 **************************************/
router.get('/admin', verificarToken, rolesAutorizados('Admin'), apiController.renderAdmin) // ADMINISTRADOR
router.get('/adminCategorias', verificarToken, rolesAutorizados('Admin'), apiController.renderAdminCategorias) // ADMINISTRADOR
router.get('/adminTickets', verificarToken, rolesAutorizados('Admin'), apiController.renderAdminTickets) // ADMINISTRADOR
router.get('/adminUsuarios', verificarToken, rolesAutorizados('Admin'), apiController.renderAdminUsuarios) // ADMINISTRADOR
router.get('/verCategorias', verificarToken, apiController.verCategorias) // VER CATEGORIAS

router.get('/logout', apiController.logoutGet) // LOGOUT
router.post('/crearTicket', verificarToken, apiController.crearTicketPost) // POST CREAR TICKET
router.get('/verTickets', verificarToken, apiController.verTicketsGet) // GET VER TICKETS
router.put('/asignarRol', verificarToken, apiController.asignarRol) // PUT ASIGNAR ROL
router.get('/verUsuariosAsignados', apiController.verUsuariosAsignados) // GET VER USUARIOS ASIGNADOS
export default router;