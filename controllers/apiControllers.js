import { RepositorioUsuario } from '../models/users.js';
import ticketRepositorio from '../models/tickets.js';
import jwt from "jsonwebtoken";
import categoriaRepositorio from '../models/categorias.js';

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
                apellido: result.apellido,
                categoriaAsignada: result.categoriaAsignada || result.categoríaAsignada
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

        if (result.rol === 'Admin') {
            res.redirect('/admin')
        } else if (result.rol === 'Soporte') {
            res.redirect('/soporte')
        } else if (result.rol === 'Gerente') {
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

const PRIORIDADES_VALIDAS = ['Baja', 'Media', 'Alta', 'Critica'];

// CREAR TICKET
export const crearTicketPost = async (req, res) => {
    try {
        const { nombre, descripcion, tecnico_automatico, id_tecnico, usuario_id, usuario, prioridad } = req.body
        const prioridadFinal = PRIORIDADES_VALIDAS.includes(prioridad) ? prioridad : 'Media'
        const result = await ticketRepositorio.crearTicket(nombre, descripcion, tecnico_automatico, id_tecnico, usuario_id, usuario, prioridadFinal)

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

        if (typeof result === 'string') {
            return res.render('register.ejs', { error: result })
        }

        res.status(200).json(result)

    } catch (error) {
        console.error('Error en verTicketsGet:', error)
        res.status(401).json({ message: 'Error interno del servidor' })
    }
}

export const verCategorias = async (req, res) => {

    try {
        console.log('Se solicito las categorias')
        const result = await categoriaRepositorio.getCategorias()

        if (typeof result === 'string') {
            return res.render('register.ejs', { error: result })
        }

        res.status(200).json(result)

    } catch (error) {
        console.error('Error en verCategorias:', error)
        res.status(401).json({ message: 'Error interno del servidor' })
    }

}

export const verUsuariosAsignados = async (req, res) => {
    try {
        console.log('Se solicito el usuario asignado')
        const result = await categoriaRepositorio.usuarioAsignado()

        if (typeof result === 'string') {
            return res.render('register.ejs', { error: result })
        }

        res.status(200).json(result)

    } catch (error) {
        console.error('Error en verUsuarioAsignado:', error)
        res.status(401).json({ message: 'Error interno del servidor' })
    }
}

export const verTecnicosSoporte = async (req, res) => {
    try {
        const result = await RepositorioUsuario.verTecnicosSoporte()
        res.status(200).json(result)
    } catch (error) {
        console.error('Error en verTecnicosSoporte:', error)
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

// ASIGNAR TÉCNICO DE SOPORTE A UN TICKET
export const asignarTecnico = async (req, res) => {
    try {
        const { id, tecnico_asignado_id } = req.body

        if (!id) {
            return res.status(400).json({ message: 'Falta el id del ticket' })
        }

        const result = await ticketRepositorio.asignarTecnico(id, tecnico_asignado_id || null)

        if (!result || result.length === 0) {
            return res.status(404).json({ message: 'Ticket no encontrado' })
        }

        res.status(200).json({ message: 'Técnico asignado correctamente', ticket: result[0] })
    } catch (error) {
        console.error('Error en asignarTecnico:', error)
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

export const ticketsAsignados = async (req, res) => {
    try {
        console.log('Se solicito los tickets asignados')
        const result = await ticketRepositorio.ticketsAsignados()

        if (typeof result === 'string') {
            return res.render('register.ejs', { error: result })
        }

        res.status(200).json(result)

    } catch (error) {
        console.error('Error en ticketsAsignados:', error)
        res.status(401).json({ message: 'Error interno del servidor' })
    }
}




