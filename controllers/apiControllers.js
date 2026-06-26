import { RepositorioUsuario } from '../models/users.js';
import jwt from "jsonwebtoken";

//LOGIN
export const login = (req, res) => {
    res.render('login')
}

//SOPORTE
export const renderSoporte = (req, res) => {
    res.render('pantallasSoporte/ticketsSoporte.ejs')
}

//GERENTE
export const renderGerente = (req, res) => {
    res.render('pantallasGerente/ticketsGerente.ejs')
}

//USUARIO
export const renderUsuario = (req, res) => {
    res.render('pantallasUsuario/gestionDeTickets.ejs')
}

//ADMIN
export const renderAdmin = (req, res) => {
    res.render('pantallasAdmin/admin-panelGeneral.ejs')
}
export const renderAdminCategorias = (req, res) => {
    res.render('pantallasAdmin/admin-categorias.ejs')
}
export const renderAdminTickets = (req, res) => {
    res.render('pantallasAdmin/admin-tickets.ejs')
}
export const renderAdminUsuarios = async (req, res) => {
    const usuarios = await RepositorioUsuario.verUsuarios()
    res.render('pantallasAdmin/admin-administradorDeUsuarios.ejs', { usuarios })
}

//REGISTRAR
export const register = (req, res) => {
    res.render('register.ejs')
}



// POST REGISTRAR
export const registerPost = async (req, res) => {
    try {
        const { nombre, apellido, usuario, email, password, "Re-password": repassword } = req.body
        const result = await RepositorioUsuario.crearUsuario(nombre, apellido, usuario, email, password, repassword)
        console.log('resultado de la consulta', result)

        if (typeof result === 'string') {
            return res.render('register.ejs', { error: result })
        }

        res.redirect('/')
    } catch (error) {
        console.error('Error en registerPost:', error)
        res.render('register.ejs', { error: 'Error interno del servidor' })
    }
}

export const loginPost = async (req, res) => {
    try {
        const { usuario, password } = req.body
        const result = await RepositorioUsuario.login(usuario, password)

        if (result === false) {
            return res.render('login.ejs', { error: 'Usuario o contraseña incorrectos' })
        }

        const token = jwt.sign(
            {
                id: result.id,
                usuario: result.usuario,
                email: result.email,
                rol: result.rol
            },
            process.env.JWT_SECRET || 'mi_secreto_super_seguro',
            {
                expiresIn: process.env.JWT_EXPIRES || '24h'
            }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            maxAge: 24 * 60 * 60 * 1000 // 24 horas
        });

        console.log('resultado de la consulta', result)

        if (result.rol === 'admin') {
            res.redirect('/admin')
        } else if (result.rol === 'soporte') {
            res.redirect('/soporte')
        } else if (result.rol === 'gerente') {
            res.redirect('/gerente')
        } else {
            res.redirect('/gestionDeTicket')
        }

    } catch (error) {
        console.error('Error en loginPost:', error)
        res.render('login.ejs', { error: 'Error interno del servidor' })
    }
}


// Logout
export const logoutGet = (req, res) => {
    res.clearCookie('token')
    res.redirect('/')
}


// POST Asignar ROL a Usuarios
export const asignarRolPost = async (req, res) => {
    try {
        const { usuario_id, rol_id } = req.body
        const result = await RepositorioUsuario.asignarRol(usuario_id, rol_id)
        console.log('resultado de la consulta', result)

        if (result === false) {
            res.status(401).json({ message: 'Error al asignar rol' })
        }

        res.status(200).json({ message: 'Rol asignado correctamente' })

    } catch (error) {
        console.error('Error en asignarRolPost:', error)
        res.status(401).json({ message: 'Error interno del servidor' })
    }
}
