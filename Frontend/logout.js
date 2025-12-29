

document.addEventListener('DOMContentLoaded', function () {
    // console.log("Archivo login.js activo y listo");

    // Inicialización de MaterializeCSS
    var elems = document.querySelectorAll('.modal');
    if (elems.length > 0) {
        M.Modal.init(elems);
        // console.log("Modales inicializados correctamente.");
    } else {
        console.error("No se encontraron elementos .modal en el DOM.");
    }

    // Asignar evento de clic al icono de salida
    var iconoSalida = document.querySelector("img[alt='left']");
    if (iconoSalida) {
        iconoSalida.addEventListener("click", abrirModal);
    } else {
        console.error("No se encontró el ícono de salida.");
    }

    // Evento de clic para cerrar sesión
    var cerrarSesionBtn = document.querySelector(".btn.green.cerrar-sesion-confirmar");
    if (cerrarSesionBtn) {
        cerrarSesionBtn.addEventListener("click", cerrarSesion);
    }

    // Evento de clic para cerrar modal
    var cerrarModalBtn = document.querySelector(".btn.grey");
    if (cerrarModalBtn) {
        cerrarModalBtn.addEventListener("click", cerrarModal);
    }
});

// Función para abrir el modal de cierre de sesión
function abrirModal() {
    console.log("Ejecutando abrirModal...");
    var modalInstance = M.Modal.getInstance(document.getElementById('confirmacionmodal'));
    if (modalInstance) {
        modalInstance.open();
    } else {
        console.error("No se encontró el modal con ID 'confirmacionmodal'.");
    }
}

// Función para cerrar el modal
function cerrarModal() {
    console.log("Ejecutando cerrarModal...");
    var modalInstance = M.Modal.getInstance(document.getElementById('confirmacionmodal'));
    if (modalInstance) {
        modalInstance.close();
    } else {
        console.error("No se encontró el modal con ID 'confirmacionmodal'.");
    }
}

//Función para cerrar sesión
function cerrarSesion() {
    cerrarModal();
    console.log("Cerrando sesión...");

    fetch('/logout', {
        method: 'POST'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                localStorage.removeItem('userId');
                localStorage.removeItem('username');


                alert(data.message);

                window.location.replace("index.html");
            } else {
                console.error("error al iniciar sesion", data.message);
                alert('Advertencia: No se pudo confirmar el cierre de sesión en el servidor. Redirigiendo...');
                window.location.replace("index.html");
            }
        })
        .catch(error => {
            console.error("Error de red al intentar cerrar sesión:", error);
            alert('Error de conexión al cerrar sesión. Intente de nuevo.');
            // En caso de fallo de red, es crucial borrar el estado local y redirigir.
            localStorage.removeItem('userId');
            window.location.replace("index.html");
        })
}
