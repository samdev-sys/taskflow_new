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
            const storeUrl = document.getElementById("store_URL"); // Fixed ID
            const tipo_archivo = document.getElementById("archivo"); // Fixed ID
            const estadoElement = document.querySelector('input[name="Estado"]:checked'); // Fixed Radio Button
            const estado = estadoElement ? estadoElement.value : "por_Iniciar";

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
                        store_Url: storeUrl ? storeUrl.value : "",
                        tipo_archivo: tipo_archivo ? tipo_archivo.value : "",
                        estado: estado,
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
    if (btnCargarUrls) {
        btnCargarUrls.addEventListener("click", () => cargarUrls());
    }
    async function cargarUrls() {
        const url = document.getElementById("urlInput")?.value.trim();
        const user_id = localStorage.getItem('userId');

        if (!url || !/^https?:\/\/.+/i.test(url)) {
            alert("Introduce una URL válida que comience con http:// o https://");
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/urls`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: url, user_id: user_id })
            });
            const result = await response.json();

        } catch (err) {
            console.error("Error al cargar URLs:", err.message);
            alert("Error al cargar URLs: " + err.message);
        }
    }
});
