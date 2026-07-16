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
export const renderGerente = async (req, res) => {
    try {
        const [tickets, desempeno, categorias] = await Promise.all([
            ticketRepositorio.verTickets(),
            ticketRepositorio.desempenoSoporte(),
            ticketRepositorio.serviciosPorCategoria()
        ])
        const totalTickets = tickets.length
        const abiertos = tickets.filter(t => !t.fecha_cierre).length
        const solucionados = tickets.filter(t => t.fecha_cierre).length

        res.render('pantallasGerente/ticketsGerente.ejs', {
            totalTickets,
            abiertos,
            solucionados,
            desempeno,
            categorias
        })
    } catch (error) {
        console.error('Error en renderGerente:', error)
        res.render('pantallasGerente/ticketsGerente.ejs', {
            totalTickets: 0,
            abiertos: 0,
            solucionados: 0,
            desempeno: [],
            categorias: []
        })
    }
}

//USUARIO
export const renderUsuario = (req, res) => {
    res.render('pantallasUsuario/gestionDeTickets.ejs')
}

//ADMIN
export const renderAdmin = async (req, res) => {
    try {
        const [usuarios, categorias, tickets, ticketsPorCategoria, actividad, desempeno] = await Promise.all([
            RepositorioUsuario.verUsuarios(),
            categoriaRepositorio.getCategorias(),
            ticketRepositorio.verTickets(),
            ticketRepositorio.serviciosPorCategoria(),
            ticketRepositorio.actividadReciente(5),
            ticketRepositorio.desempenoSoporte()
        ])

        res.render('pantallasAdmin/admin-panelGeneral.ejs', {
            totalUsuarios: usuarios.length,
            totalCategorias: categorias.length,
            totalTickets: tickets.length,
            ticketsPorCategoria,
            actividad,
            desempeno
        })
    } catch (error) {
        console.error('Error en renderAdmin:', error)
        res.render('pantallasAdmin/admin-panelGeneral.ejs', {
            totalUsuarios: 0,
            totalCategorias: 0,
            totalTickets: 0,
            ticketsPorCategoria: [],
            actividad: [],
            desempeno: []
        })
    }
}
export const renderAdminCategorias = (req, res) => {
    res.render('pantallasAdmin/admin-categorias.ejs')
}
export const renderAdminTickets = (req, res) => {
    res.render('pantallasAdmin/admin-tickets.ejs', { busquedaInicial: req.query.buscar || '' })
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
        const { nombre, descripcion, usuario_id, usuario, prioridad } = req.body
        const prioridadFinal = PRIORIDADES_VALIDAS.includes(prioridad) ? prioridad : 'Media'
        const adjunto = req.file ? `/uploads/tickets/${req.file.filename}` : null
        const result = await ticketRepositorio.crearTicket(nombre, descripcion, false, null, usuario_id, usuario, prioridadFinal, adjunto)

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

// CREAR CATEGORÍA
export const crearCategoriaPost = async (req, res) => {
    try {
        const { nombreCategoria, descripcion } = req.body

        if (!nombreCategoria || !descripcion) {
            return res.status(400).json({ message: 'El nombre y la descripción son obligatorios' })
        }

        const result = await categoriaRepositorio.crearCategoria(nombreCategoria, descripcion)
        res.status(200).json({ message: 'Categoría creada correctamente', categoria: result[0] })
    } catch (error) {
        console.error('Error en crearCategoriaPost:', error)
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

// EDITAR CATEGORÍA
export const editarCategoriaPut = async (req, res) => {
    try {
        const { id, nombreCategoria, descripcion } = req.body

        if (!id || !nombreCategoria || !descripcion) {
            return res.status(400).json({ message: 'Faltan datos obligatorios' })
        }

        const result = await categoriaRepositorio.editarCategoria(id, nombreCategoria, descripcion)

        if (!result || result.length === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' })
        }

        res.status(200).json({ message: 'Categoría actualizada correctamente', categoria: result[0] })
    } catch (error) {
        console.error('Error en editarCategoriaPut:', error)
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

// BORRAR CATEGORÍA
export const eliminarCategoriaDelete = async (req, res) => {
    try {
        const { id } = req.params
        const result = await categoriaRepositorio.eliminarCategoria(id)

        if (!result || result.length === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' })
        }

        res.status(200).json({ message: 'Categoría eliminada correctamente' })
    } catch (error) {
        console.error('Error en eliminarCategoriaDelete:', error)
        res.status(500).json({ message: 'Error interno del servidor' })
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

// CREAR USUARIO NUEVO DESDE ADMINISTRAR USUARIOS
export const crearUsuarioAdminPost = async (req, res) => {
    try {
        const { nombre, apellido, usuario, email, password, rol } = req.body
        const result = await RepositorioUsuario.crearUsuarioAdmin(nombre, apellido, usuario, email, password, rol)

        if (typeof result === 'string') {
            return res.status(400).json({ message: result })
        }

        res.status(200).json({ message: 'Usuario creado correctamente', usuario: result[0] })
    } catch (error) {
        console.error('Error en crearUsuarioAdminPost:', error)
        if (error.code === '23505') {
            return res.status(400).json({ message: 'Ese usuario o correo ya existe' })
        }
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

// EDITAR NOMBRE/APELLIDO/EMAIL DE UN USUARIO
export const editarUsuarioPut = async (req, res) => {
    try {
        const { id, nombre, apellido, email } = req.body

        if (!id || !nombre || !apellido || !email) {
            return res.status(400).json({ message: 'Faltan datos obligatorios' })
        }

        const result = await RepositorioUsuario.editarUsuario(id, nombre, apellido, email)

        if (!result || result.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' })
        }

        res.status(200).json({ message: 'Usuario actualizado correctamente', usuario: result[0] })
    } catch (error) {
        console.error('Error en editarUsuarioPut:', error)
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

// BORRAR UN USUARIO
export const eliminarUsuarioDelete = async (req, res) => {
    try {
        const { id } = req.params

        if (Number(id) === req.user.id) {
            return res.status(400).json({ message: 'No puedes borrar tu propia cuenta' })
        }

        const result = await RepositorioUsuario.eliminarUsuario(id)

        if (!result || result.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' })
        }

        res.status(200).json({ message: 'Usuario eliminado correctamente' })
    } catch (error) {
        console.error('Error en eliminarUsuarioDelete:', error)
        res.status(500).json({ message: 'Error interno del servidor' })
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

// CAMBIAR ESTADO DEL TICKET (marcar como solucionado o reabrir)
export const cambiarEstadoTicket = async (req, res) => {
    try {
        const { id, cerrado } = req.body

        if (!id) {
            return res.status(400).json({ message: 'Falta el id del ticket' })
        }

        const result = await ticketRepositorio.cambiarEstadoTicket(id, Boolean(cerrado))

        if (!result || result.length === 0) {
            return res.status(404).json({ message: 'Ticket no encontrado' })
        }

        const mensaje = cerrado ? 'Ticket marcado como solucionado' : 'Ticket reabierto'
        res.status(200).json({ message: mensaje, ticket: result[0] })
    } catch (error) {
        console.error('Error en cambiarEstadoTicket:', error)
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




