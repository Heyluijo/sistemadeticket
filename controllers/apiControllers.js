import { RepositorioUsuario } from '../models/users.js';
import ticketRepositorio from '../models/tickets.js';
import jwt from "jsonwebtoken";
import { ejecutarConsulta } from '../database/db.js';

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
                rol: result.rol,
                nombre: result.nombre,
                apellido: result.apellido
            },
            process.env.JWT_SECRET,
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
export const asignarRol = async (req, res) => {
    try {
        const { id, rol } = req.body
        const result = await RepositorioUsuario.asignarRol(id, rol)

        if (result === false) {
            res.status(401).json({ message: 'Error al asignar rol' })
        }
        console.log('\n*********************************')
        console.log('Se actualizo el rol correctamente')
        console.log('\n*********************************')

        res.status(200).json({ message: 'Rol asignado correctamente' })

    } catch (error) {
        console.error('Error en asignarRolPost:', error)
        console.log('\n*********************************')
        console.log('Error en asignarRolPost')
        console.log('\n*********************************')
        res.status(401).json({ message: 'Error interno del servidor' })
    }
}

// CREAR TICKET
export const crearTicketPost = async (req, res) => {
    try {
        const { nombre, descripcion, tecnico_automatico, id_tecnico, usuario_id, usuario } = req.body
        const result = await ticketRepositorio.crearTicket(nombre, descripcion, tecnico_automatico, id_tecnico, usuario_id, usuario)
        console.log('resultado de la consulta', result)

        if (typeof result === 'string') {
            return res.render('register.ejs', { error: result })
        }

        res.status(200).json({
            message: "ticket Creado",
            ticket: result
        })
    } catch (error) {
        console.error('Error en crearTicketPost:', error)
        res.status(401).json({ message: 'Error interno del servidor' })
    }
}


export const verTicketsGet = async (req, res) => {
    try {
        const result = await ticketRepositorio.verTickets()
        console.log('resultado de la consulta', result)

        if (typeof result === 'string') {
            return res.render('register.ejs', { error: result })
        }

        res.status(200).json(result)

    } catch (error) {
        console.error('Error en verTicketsGet:', error)
        res.status(401).json({ message: 'Error interno del servidor' })
    }
}
