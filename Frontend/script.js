// --- CONFIGURACIÓN GLOBAL ---
const BASE_URL = "http://localhost:3000";

// 2. registro

// 4.cargarurls
// 5.mostrar tareas
// 6.mostrar urls

document.addEventListener("DOMContentLoaded", () => {


    //1. inicio de sesion
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const user = document.getElementById("usernameLog").value;
            const password = document.getElementById("passwordLog").value;

            try {
                const response = await fetch(`${BASE_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user, password })
                });
                const result = await response.json();

                if (response.status === 401) {
                    alert("usuario /contraseña incorrecta");
                }
                else if (response.ok) {
                    // Save session data
                    localStorage.setItem('userId', result.user_id);
                    localStorage.setItem('username', user);

                    alert("¡Bienvenido!");
                    window.location.replace("add_task.html");
                } else {
                    alert("Error inesperado" + result.error);
                }




            } catch (err) {
                console.error("error en login :", err.message);
                alert("no se pudo conectar al servidor");

            }
        });
    }


})

//cargar tareas
document.addEventListener("DOMContentLoaded", async () => {
    const taskForm = document.getElementById("taskForm");

    // Only proceed if taskForm exists (i.e., we are on the add_task page)
    if (taskForm) {
        taskForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const asunto = document.getElementById("asunto");
            const descripcion = document.getElementById("descripcion");
            const tipo_archivo = document.getElementById("archivo"); // Fixed ID
            const Estado = document.querySelector('input[name="Estado"]:checked'); // Fixed Radio Button


            const fechaDeCreacion = new Date().toISOString().slice(0, 10).replace("T", "");

            try {
                const user = localStorage.getItem('username');
                const user_id = localStorage.getItem('userId');

                const response = await fetch(`${BASE_URL}/tasks`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user: user,
                        asunto: asunto.value,
                        descripcion: descripcion.value,
                        tipo_archivo: tipo_archivo ? tipo_archivo.value : "",
                        estado: Estado.value,
                        fecha_de_creacion: fechaDeCreacion,
                        user_id: user_id
                    })
                });
                const result = await response.json();

                if (response.ok) {
                    alert("Tarea agregada exitosamente");
                    taskForm.reset();
                    // Optional: Close modal if using Materialize modal
                    const modal = M.Modal.getInstance(document.getElementById('modal2'));
                    if (modal) modal.close();
                } else {
                    alert("Error al agregar la tarea: " + (result.error || "Desconocido"));
                }

            } catch (err) {
                console.error("Error al crear tarea:", err.message);
                alert("Error al crear tarea: " + err.message);
            }
        });
    }
});

//cargar urls
document.addEventListener("DOMContentLoaded", () => {
    const btnCargarUrls = document.getElementById("btnCargarUrls");
    mostrarUrls();
    if (btnCargarUrls) {
        btnCargarUrls.addEventListener("click", () => cargarUrls());
    }
    async function cargarUrls() {
        const urlInput = document.getElementById("urlInput")
        const url = urlInput?.value.trim();;
        const user_id = localStorage.getItem('userId');
        const nombre_url = document.getElementById("nombre_url").value.trim();

        if (!user_id) {
            alert("No se encontro un usuario");
            return;
        }

        if (!url || !/^https?:\/\/.+/i.test(url)) {
            alert("Introduce una URL válida que comience con http:// o https://");
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/urls`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, nombre_url, user_id })
            });
            const result = await response.json();

            if (response.ok) {
                alert("URL guardada exitosamente");
                urlInput.value = "";
                mostrarUrls(); // Recargar URLs después de guardar
            } else {
                const result = await response.json();
                alert("Error al guardar URL: " + (result.error || "Desconocido"));
            }
        } catch (err) {
            console.error("Error al cargar URLs:", err.message);
            alert("Error al cargar URLs: " + err.message);
        }
    }

    // Función para mostrar URLs con iconos
    async function mostrarUrls() {
        const user_id = localStorage.getItem('userId');
        const iconsContainer = document.getElementById("iconsContainer");

        if (!iconsContainer || !user_id) return;

        try {
            const response = await fetch(`${BASE_URL}/urls?user_id=${user_id}`);
            const result = await response.json();

            if (response.ok && result.urls) {
                iconsContainer.innerHTML = ""; // Limpiar contenedor
                const fragment = document.createDocumentFragment();

                result.urls.forEach(item => {
                    const iconUrl = obtenerIcono(item.url);

                    const linkElement = document.createElement("a");
                    linkElement.href = item.url;
                    linkElement.target = "_blank";
                    linkElement.className = "tooltipped col s2 center-align";
                    linkElement.setAttribute('data-position', 'bottom');
                    linkElement.setAttribute('data-tooltip', item.url);

                    const imgElement = document.createElement("img");
                    imgElement.src = iconUrl;
                    imgElement.className = "responsive-img circle hoverable";
                    imgElement.style.width = "40px";
                    imgElement.style.padding = "5px";

                    imgElement.onerror = () => { imgElement.src = "./img/default-icon.png"; };

                    linkElement.appendChild(imgElement);
                    fragment.appendChild(linkElement);
                });

                iconsContainer.appendChild(fragment);

                // Inicialización de Materialize
                if (typeof M !== 'undefined') {
                    M.Tooltip.init(document.querySelectorAll('.tooltipped'));
                }
            }
        } catch (err) {
            console.error("Error al mostrar URLs:", err);
        }
    }
    // Función optimizada para obtener el icono de una URL
    function obtenerIcono(url) {
        try {
            const urlObj = new URL(url);
            // Usamos el servicio de Google para obtener favicons (sz=64 es el tamaño)
            return `https://icons.duckduckgo.com/ip3/${urlObj.hostname}.ico`;
        } catch (err) {
            console.error("URL inválida:", url);
            return "./img/default-icon.png"; // Icono por defecto si la URL está mal
        }
    }
});


//ver tareas
//ver tareas
async function displayTasks() {
    try {
        const user_id = localStorage.getItem('userId');
        if (!user_id) {
            console.warn("No hay usuario logueado");
            return;
        }

        const response = await fetch(`${BASE_URL}/tasks?user_id=${user_id}`);
        const tasks = await response.json(); // Fix: assign response to tasks
        console.log("tareas recibidas del backend", tasks);

        const enproceso = document.getElementById("enproceso");
        const por_iniciar = document.getElementById("por_iniciar");
        const finalizado = document.getElementById("finalizado");

        if (!enproceso || !por_iniciar || !finalizado) {
            // Only warn if elements are missing (we might be on a page without them)
            return;
        }
        enproceso.innerHTML = "";
        por_iniciar.innerHTML = "";
        finalizado.innerHTML = "";

        tasks.forEach((task) => {
            const { id_tarea, asunto, descripcion } = task;
            const Estado = task.Estado || task.estado;

            const card = document.createElement("div");
            let cardClass = "card-panel";
            // Normalize for styling checks, but use exact values for logic if possible, 
            // or just checking against the known DB values.
            const estadoDB = Estado || "por iniciar";

            if (estadoDB === "En proceso") {
                cardClass += " blue lighten-4";
            }
            else if (estadoDB === "por iniciar") {
                cardClass += " yellow lighten-4 black-text";
            } else if (estadoDB === "Finalizado") {
                cardClass += " green lighten-4 black-text";
            } else {
                cardClass += " grey lighten-4 black-text";
            }

            card.className = cardClass;
            card.innerHTML = `
        <strong>${asunto}</strong><br>
        <span>${descripcion}</span><br>
        <button class="btn-small yellow black-text" onclick="actualizarTarea(${id_tarea})">
            <i class="material-icons">edit</i>
        </button>
        <button class="btn-small red darken-1 white-text" onclick="eliminarTarea(${id_tarea})">
            <i class="material-icons">delete</i>
        </button>
      `;

            if (estadoDB === "En proceso") {
                enproceso.appendChild(card);
            } else if (estadoDB === "por iniciar") {
                por_iniciar.appendChild(card);
            } else if (estadoDB === "Finalizado") {
                finalizado.appendChild(card);
            }
        });

    } catch (error) {
        console.error("Error al mostrar tareas:", error);
    }
}

// Ensure displayTasks runs if the relevant elements exist
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("enproceso")) {
        displayTasks();
    }
}); 
