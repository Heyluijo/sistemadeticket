import { Router } from 'express';
import * as apiController from '../controllers/apiControllers.js';
import { verificarToken } from '../middlewares/authMiddleware.js';
import { rolesAutorizados } from '../middlewares/verificaRol.js';
import { uploadAdjuntoTicket } from '../middlewares/upload.js';

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
router.post('/crearCategoria', verificarToken, rolesAutorizados('Admin'), apiController.crearCategoriaPost) // POST CREAR CATEGORIA
router.put('/editarCategoria', verificarToken, rolesAutorizados('Admin'), apiController.editarCategoriaPut) // PUT EDITAR CATEGORIA
router.delete('/eliminarCategoria/:id', verificarToken, rolesAutorizados('Admin'), apiController.eliminarCategoriaDelete) // DELETE BORRAR CATEGORIA

router.get('/logout', apiController.logoutGet) // LOGOUT
router.post('/crearTicket', verificarToken, uploadAdjuntoTicket, apiController.crearTicketPost) // POST CREAR TICKET
router.get('/verTickets', verificarToken, apiController.verTicketsGet) // GET VER TICKETS
router.put('/asignarRol', verificarToken, apiController.asignarRol) // PUT ASIGNAR ROL
router.post('/crearUsuarioAdmin', verificarToken, rolesAutorizados('Admin'), apiController.crearUsuarioAdminPost) // POST CREAR USUARIO DESDE ADMIN
router.put('/editarUsuario', verificarToken, rolesAutorizados('Admin'), apiController.editarUsuarioPut) // PUT EDITAR USUARIO
router.delete('/eliminarUsuario/:id', verificarToken, rolesAutorizados('Admin'), apiController.eliminarUsuarioDelete) // DELETE BORRAR USUARIO
router.get('/verUsuariosAsignados', apiController.verUsuariosAsignados) // GET VER USUARIOS ASIGNADOS
router.get('/verTecnicosSoporte', verificarToken, rolesAutorizados('Admin', 'Gerente'), apiController.verTecnicosSoporte) // GET LISTA DE TECNICOS DE SOPORTE
router.put('/asignarTecnico', verificarToken, rolesAutorizados('Admin', 'Gerente'), apiController.asignarTecnico) // PUT ASIGNAR TECNICO A TICKET
router.put('/cambiarEstadoTicket', verificarToken, rolesAutorizados('Soporte', 'Admin', 'Gerente'), apiController.cambiarEstadoTicket) // PUT CERRAR O REABRIR TICKET
export default router;