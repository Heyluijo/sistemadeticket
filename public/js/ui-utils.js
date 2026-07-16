// Utilidades de interfaz compartidas: toasts, modal de confirmación y spinner de carga.
// Se inyectan en el DOM la primera vez que se usan, así que solo hace falta incluir este script.

function mostrarToast(mensaje, tipo = 'info') {
    const colores = {
        exito: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
    };
    let contenedor = document.getElementById('toast-container');
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'toast-container';
        contenedor.className = 'fixed top-4 right-4 z-[100] flex flex-col items-end';
        document.body.appendChild(contenedor);
    }

    const toast = document.createElement('div');
    toast.className = `${colores[tipo] || colores.info} text-white text-sm font-bold px-4 py-3 rounded shadow-lg mb-2 transition-opacity duration-300`;
    toast.textContent = mensaje;
    contenedor.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function confirmarAccion(mensaje) {
    return new Promise((resolve) => {
        let modal = document.getElementById('modal-confirmar-generico');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-confirmar-generico';
            modal.className = 'fixed inset-0 bg-black/50 hidden items-center justify-center z-[110]';
            modal.innerHTML = `
                <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                    <p id="modal-confirmar-mensaje" class="text-sm text-gray-700 mb-6"></p>
                    <div class="flex justify-end space-x-2">
                        <button id="modal-confirmar-no" class="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-4 py-2 rounded font-bold">Cancelar</button>
                        <button id="modal-confirmar-si" class="bg-red-500 hover:bg-red-600 text-white text-xs px-4 py-2 rounded font-bold">Confirmar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        modal.querySelector('#modal-confirmar-mensaje').textContent = mensaje;
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        const btnSi = modal.querySelector('#modal-confirmar-si');
        const btnNo = modal.querySelector('#modal-confirmar-no');

        const limpiar = () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            btnSi.removeEventListener('click', onSi);
            btnNo.removeEventListener('click', onNo);
        };
        const onSi = () => { limpiar(); resolve(true); };
        const onNo = () => { limpiar(); resolve(false); };

        btnSi.addEventListener('click', onSi);
        btnNo.addEventListener('click', onNo);
    });
}

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto == null ? '' : String(texto);
    return div.innerHTML;
}

// Modal genérico de "ver detalle del ticket". Recibe el objeto ticket completo
// y (opcional) el nombre ya resuelto del técnico asignado.
function mostrarDetalleTicket(ticket, nombreTecnico) {
    let modal = document.getElementById('modal-detalle-ticket');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-detalle-ticket';
        modal.className = 'fixed inset-0 bg-black/50 hidden items-center justify-center z-[105] p-4';
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) cerrarDetalleTicket();
        });
    }

    const fechaCreacion = ticket.fecha_creacion ? new Date(ticket.fecha_creacion).toLocaleString('es-ES') : '-';
    const fechaCierre = ticket.fecha_cierre ? new Date(ticket.fecha_cierre).toLocaleString('es-ES') : 'Sigue abierto';
    const estadoTexto = ticket.fecha_cierre ? 'SOLUCIONADO' : 'ABIERTO';
    const estadoClase = ticket.fecha_cierre
        ? 'bg-green-100 text-green-700 border-green-300'
        : 'bg-yellow-100 text-yellow-700 border-yellow-300';
    const prioridadClases = {
        Baja: 'bg-green-100 text-green-700 border-green-300',
        Media: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        Alta: 'bg-orange-100 text-orange-700 border-orange-300',
        Critica: 'bg-red-100 text-red-700 border-red-300',
    };
    const prioridadClase = prioridadClases[ticket.prioridad] || prioridadClases.Media;

    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
                <h3 class="text-lg font-bold text-gray-800">Ticket t-${ticket.id}</h3>
                <button onclick="cerrarDetalleTicket()" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div class="p-5 space-y-4 text-sm">
                <div class="flex gap-2 flex-wrap">
                    <span class="px-2 py-1 rounded border text-xs font-bold uppercase ${estadoClase}">${estadoTexto}</span>
                    <span class="px-2 py-1 rounded border text-xs font-bold uppercase ${prioridadClase}">${escapeHtml(ticket.prioridad)}</span>
                </div>
                <div>
                    <span class="text-xs text-gray-500 font-bold uppercase">Categoría</span>
                    <p class="text-gray-800">${escapeHtml(ticket.nombre)}</p>
                </div>
                <div>
                    <span class="text-xs text-gray-500 font-bold uppercase">Descripción</span>
                    <p class="text-gray-800 whitespace-pre-wrap">${escapeHtml(ticket.descripcion)}</p>
                </div>
                <div>
                    <span class="text-xs text-gray-500 font-bold uppercase">Solicitante</span>
                    <p class="text-gray-800">${escapeHtml(ticket.usuario)}</p>
                </div>
                <div>
                    <span class="text-xs text-gray-500 font-bold uppercase">Técnico asignado</span>
                    <p class="text-gray-800">${escapeHtml(nombreTecnico || 'Sin asignar')}</p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <span class="text-xs text-gray-500 font-bold uppercase">Creado</span>
                        <p class="text-gray-800 text-xs">${fechaCreacion}</p>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500 font-bold uppercase">Cerrado</span>
                        <p class="text-gray-800 text-xs">${fechaCierre}</p>
                    </div>
                </div>
                ${ticket.adjunto ? `
                <div>
                    <span class="text-xs text-gray-500 font-bold uppercase">Adjunto</span>
                    <a href="${ticket.adjunto}" target="_blank">
                        <img src="${ticket.adjunto}" class="mt-2 max-h-64 rounded border border-gray-200">
                    </a>
                </div>` : ''}
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function cerrarDetalleTicket() {
    const modal = document.getElementById('modal-detalle-ticket');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function filaCargando(colspan) {
    return `<tr><td colspan="${colspan}" class="px-4 py-10 text-center text-gray-400">
        <span class="inline-block w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin align-middle mr-2"></span>
        Cargando...
    </td></tr>`;
}

// Menú desplegable del avatar con iniciales (cerrar sesión)
function initAvatarMenu() {
    const avatar = document.querySelector('[data-avatar-menu]');
    if (!avatar) return;

    let menu = document.getElementById('avatar-dropdown-menu');
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'avatar-dropdown-menu';
        menu.className = 'hidden absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1';
        menu.innerHTML = `<a href="/logout" class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-50 font-bold">🔒 Cerrar sesión</a>`;
        avatar.parentElement.style.position = 'relative';
        avatar.parentElement.appendChild(menu);
    }

    avatar.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
    });
    document.addEventListener('click', () => menu.classList.add('hidden'));
}

document.addEventListener('DOMContentLoaded', initAvatarMenu);
