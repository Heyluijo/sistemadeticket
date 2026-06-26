import { Router } from 'express';
import * as apiController from '../controllers/apiControllers.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = Router();

// RUTAS PÚBLICAS
router.get('/', apiController.login); // LOGIN
router.post('/login', apiController.loginPost) // POST LOGIN

router.get('/register', apiController.register) // REGISTRAR
router.post('/register', apiController.registerPost) // POST REGISTRAR

// RUTAS PROTEGIDAS (Requieren Token)
router.get('/soporte', verificarToken, apiController.renderSoporte) // PAGINA DE SOPORTE
router.get('/gerente', verificarToken, apiController.renderGerente) // PAGINA DE GERENTE
router.get('/gestionDeTicket', verificarToken, apiController.renderUsuario) // PAGINA DE USUARIOS
router.get('/admin', verificarToken, apiController.renderAdmin) // ADMINISTRADOR
router.get('/adminCategorias', verificarToken, apiController.renderAdminCategorias) // ADMINISTRADOR
router.get('/adminTickets', verificarToken, apiController.renderAdminTickets) // ADMINISTRADOR
router.get('/adminUsuarios', verificarToken, apiController.renderAdminUsuarios) // ADMINISTRADOR
router.get('/logout', apiController.logoutGet) // LOGOUT


export default router;