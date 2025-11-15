
document.addEventListener("DOMContentLoaded",()=>{
  const isPrivate=document.body.getAttribute("data-private")==="true";
  const rawUserId=localStorage.getItem("userId");
  const userId=rawUserId && !isNaN(parseInt(rawUserId))?parseInt(rawUserId):null;
  const currentPage =window.location.pathname;
  if(isPrivate&&!userId){
    if(currentPage !=="/index.html" && currentPage !=="/"){
      console.warn("Usuario no autenticado, redirigiendo a login");
      window.location.replace("/index.html");
      return
    }
  }
  if (isPrivate){
    if (!userId || isNaN(userId)){
      
      return;

    }else{
      displayTasks(userId);
      displayUrls(userId);
    }
  }
  });

  
  





  // 🔑 Login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const user = document.getElementById("usernameLog")?.value.trim();
      const password = document.getElementById("passwordLog")?.value.trim();

      try {
        const response = await fetch(`${BASE_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user, password })
        });

        const result = await response.json();

        if (result.success) {
          localStorage.setItem("userId", result.user.id);
          localStorage.setItem("username",user);
          alert("Inicio de sesión exitoso");
          window.location.href = "/add_task.html";
        } else {
          alert(result.message);
        }
      } catch (err) {
        console.error("Error en login:", err.message);
        alert("Error al iniciar sesión");
      }
    });
  }

  // 💾 Guardar URL
  const saveBtn = document.getElementById("saveUrlBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      if (!userId || isNaN(userId)) {
        alert("Sesión no válida. Inicia sesión nuevamente.");
        return;
      }

      saveBtn.disabled = true;
      await saveUrl(userId);
      saveBtn.disabled = false;
    });
  }

  // 📦 Renderizar URLs al cargar (si aplica)
  if (isPrivate && !isNaN(userId)) {
    displayUrls(userId);
  }

  // 🚪 Cerrar sesión
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("userId");
      window.location.replace("/index.html");
    });
  }
  

// 🧠 Verificación extra al volver atrás
window.addEventListener("pageshow", (event) => {
  const userId = localStorage.getItem("userId");
  if (!userId || event.persisted) {
    window.location.replace("/index.html");
  }
});

// 🛠 FUNCIONES

async function saveUrl(userId) {
  const url = document.getElementById("urlInput")?.value.trim();
  if (!url || !/^https?:\/\/.+/i.test(url)) {
    alert("Introduce una URL válida que comience con http:// o https://");
    return;
  }

  try {
    console.log("Insertando:", url);
    const response = await fetch(`${BASE_URL}/urls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, url })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Error al guardar:", result);
      alert(result.message || "No se pudo guardar la URL");
      return;
    }

    document.getElementById("urlInput").value = "";
    displayUrls(userId);
  } catch (err) {
    console.error("Error de red:", err.message);
    alert("Error de conexión");
  }
}

async function displayUrls(userId) {
  // console.log("renderizando urls para:", userId);
  try {
    const response = await fetch(`${BASE_URL}/urls/${userId}`);
    const urls = await response.json();
    // console.log("Respuesta del backend:", urls);
    const container = document.getElementById("iconsContainer");

    if (!container) return;

    container.innerHTML = "";

    if (urls.length === 0) {
      container.innerHTML = "<p class='red-text'>No hay URLs guardadas.</p>";
      return;
    }


    urls.forEach(({ id, url }) => {
  const card = document.createElement("div");
  card.className = "card blue-grey darken-1 white-text hoverable";
  card.innerHTML = `
    <div class="card-content">
      <span class="card-title"><i class="material-icons left">link</i>URL</span>
      <p style="word-wrap: break-word;">
        <a href="${url}" target="_blank" class="yellow-text text-lighten-3">${url}</a>
      </p>
    </div>
    <div class="card-action">
      <button class="btn red" onclick="deleteUrl(${id})">
        <i class="material-icons">delete</i>
      </button>
    </div>
  `;
  container.appendChild(card);
});

  } catch (err) {
    console.error("Error al cargar URLs:", err.message);
  }
}
// eliminar URL
async function deleteUrl(id) {
  console.log("ID que llega al servidor para eliminar:", id);
  const confirmDelete = confirm("Estas seguro de eliminar?");
  if (!confirmDelete) return;
   try{
    const response = await fetch(`${BASE_URL}/urls/${id}`,{
      method:"DELETE"
    });

    const result = await response .json();
    if(!response.ok){
      alert(result.message || "Error al eliminar la URL");
      return;
    }
    const userId = parseInt (localStorage.getItem("userId"));
    displayUrls(userId);
    M.toast({ html: "URL eliminada con éxito", classes: "green darken-1" });
   }catch(err){
    console.error("Error al eliminar URL:", err.message);
    alert("no se puede eliminarla URL");
   }

}
// MOSTRAR TASKS

async function displayTasks(userId) {
  try {
    const response = await fetch(`${BASE_URL}/tasks/${userId}`);
    const tasks = await response.json();
    // console.log("📦 Tareas recibidas del backend:", tasks);

    const enproceso = document.getElementById("enproceso");
    const pendientes = document.getElementById("pendientes");
    const finalizado = document.getElementById("finalizado");
    if (!enproceso || !pendientes || !finalizado) {return};

    enproceso.innerHTML = "";
    pendientes.innerHTML = "";
    finalizado.innerHTML = "";

    tasks.forEach(({ id_tarea,asunto, descripcion, Estado }) => {
      const card = document.createElement("div");
      card.className = "card-panel teal lighten-5 black-text";
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

      const estado = Estado?.toLowerCase()||"pendiente";

      if (["en proceso ", "en_proceso"].includes(estado)) {
        enproceso.appendChild(card);
      } else if (["pendiente", "por_iniciar"].includes(estado)) {
        pendientes.appendChild(card);
      } else if (estado === "finalizado") {
        finalizado.appendChild(card);
      }
    });
  } catch (err) {
    console.error("Error al cargar tareas:", err.message);
  }
}

//  CARGAR TAREA
document.addEventListener("DOMContentLoaded", () => {
  const taskForm = document.getElementById("taskForm");
  const userId = parseInt(localStorage.getItem("userId"));
  const username = localStorage.getItem("username");

  if (taskForm) {
    taskForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if(!username){
        M.toast({html:"Usuario no identificado",classes:"red"});
        return;
      }
    
      
      const asunto = document.getElementById("asunto").value.trim();
      const descripcion = document.getElementById("descripcion").value.trim();
      const store_URL = document.getElementById("store_URL").value.trim();
      const tipo_archivo = document.getElementById("archivo").files[0]?.type || "";
      const Estado = document.querySelector('input[name="Estado"]:checked')?.value;
      const fecha_de_creacion = new Date().toISOString().slice(0, 19).replace("T", " ");

      const editingId=taskForm.getAttribute("data-editing-id");
      const url=editingId
       ?`${BASE_URL}/tasks/${editingId}`
       :`${BASE_URL}/tasks`;
      const method =editingId ?"PUT":"POST";

      try {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: username,
            user_id: userId,
            asunto,
            descripcion,
            store_URL,
            tipo_archivo,
            fecha_de_creacion,
            Estado
          })
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.message || "Error al crear tarea");

        M.toast({ html: "Tarea creada con éxito", classes: "green" });
        taskForm.reset();
        taskForm.removeAttribute("data-editing-id")
        const modal = M.Modal.getInstance(document.getElementById("modal2"));
        modal.close();
        displayTasks(userId);

      } catch (err) {
        console.error("Error al crear tarea:", err.message);
        M.toast({ html: "No se pudo guardar la tarea", classes: "red" });
      }
    });
  }
});

// ACTUALIZAR TAREA
async function actualizarTarea(id){
  try {
    const response =await fetch(`${BASE_URL}/tasks/one/${id}`);
    const tarea =await response.json();

    document.getElementById("asunto").value=tarea.asunto;
    document.getElementById("descripcion").value= tarea.descripcion;
    const estadoInput =document.querySelector(`input[name="Estado"][value="${tarea.Estado}"]`);
    if(estadoInput){
      estadoInput.checked =true;
    }else{
      console.warn(`no se encontro un input estado con valor :${tarea.Estado}`);
    }

    document.getElementById("taskForm").setAttribute("data-editing-id", id);
    const modal = M.Modal.getInstance(document.getElementById("modal2"));
    modal.open();

  } catch(err){
    console.error("Error al traer la tarea :", err.message);
  }
}

async function eliminarTarea(id){
  const confirmacion= confirm("confirmas para eliminar?");
  if(!confirmacion) return;

  try{
    const response = await fetch(`${BASE_URL}/tasks/${id}`,{
      method:"DELETE"
    });

    const result = await response.json();

    if(!response.ok) throw new Error (result.message || "Error al eliminar");
    M.toast({html: "Tarea eliminada",classes : "green"});
    const userId=parseInt(localStorage.getItem("userId"));
    displayTasks(userId);
  } catch(err){
    console.error("error al eliminar tarea", err.message);
    M.toast({html:"no se pudo eliminar tarea", classes: "red"});
  }

}

// registrar usuario
document.addEventListener("DOMContentLoaded", () => {
  M.FormSelect.init(document.querySelectorAll("select"));
  M.Slider.init(document.querySelectorAll(".slider"), {
    indicators: true,
    height: 400,
    interval: 5000
  });

  const form = document.getElementById("registroForm");
  const nombre = document.getElementById("nombres");
  const usuario = document.getElementById("usuario");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const pregunta = document.getElementById("pregunta");
  const respuesta = document.getElementById("respuesta");
  const foto = document.getElementById("foto");
  const loader = document.getElementById("loader");

  const campos = [nombre, usuario, email, password, pregunta, respuesta];

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let incompletos = [];

    campos.forEach(campo => {
      campo.classList.remove("error-field");
      if (!campo.value.trim()) {
        campo.classList.add("error-field");
        incompletos.push(campo.name || campo.id);
      }
    });

    if (incompletos.length > 0) {
      M.toast({
        html: `<i class="material-icons left">warning</i> Completa todos los campos`,
        classes: "orange darken-3 white-text rounded"
      });
      return;
    }

    const formData = new FormData(form);
    loader.style.display = "block";

    try {
      const res = await fetch(`${BASE_URL}/users`, {
        method: "POST",
        body: formData
      });

      const rawBody = await res.text();
      let data;

      try {
        data = JSON.parse(rawBody);
      } catch {
        loader.style.display = "none";
        console.error("❌ Respuesta inesperada del servidor:", rawBody);
        M.toast({
          html: `<i class="material-icons left">cloud_off</i> Servidor respondió contenido no esperado`,
          classes: "red darken-4 white-text rounded"
        });
        return;
      }

      loader.style.display = "none";

      if (res.ok) {
        form.reset();
        M.toast({
          html: `<i class="material-icons left">check_circle</i> ${data.message}`,
          classes: "green darken-2 white-text rounded"
        });
      } else {
        M.toast({
          html: `<i class="material-icons left">error</i> ${data.message || "Error en el registro"}`,
          classes: "red darken-2 white-text rounded"
        });
      }
    } catch (err) {
      loader.style.display = "none";
      console.error("🔥 Error al registrar usuario:", err);
      M.toast({
        html: `<i class="material-icons left">cloud_off</i> No se pudo conectar con el servidor`,
        classes: "red darken-4 white-text rounded"
      });
    }
  });
});



