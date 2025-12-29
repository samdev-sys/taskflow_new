
const express = require('express');
const app = express();

// 1. FIX: Call app.use() instead of assigning to it.
// This registers the JSON body parser middleware.
app.use(express.json());

// 2. FIX: Call app.use() instead of assigning to it.
// This registers the static file serving middleware.
app.use(express.static('Frontend'));
app.use(express.urlencoded({ extended: true }));

const dbs = {
    mysql: require('./ConectBD/conexion_MySQL')
}

// Custom middleware for selecting the database
app.use((req, res, next) => {
    const dbType = req.query.db || 'mysql';
    req.db = dbs[dbType];
    console.log("contenido de req.db", req.db);
    if (!req.db) return res.status(400).json({ error: 'base de datos invalida' });
    next();
});
//CRUD for login
//ingreso
// app.post('/login', (req, res) => {

//     if (!req.body || !req.body.user) {
//         return res.status(400).json({ error: 'credenciales invalidas' });
//     }
//     const { user, password } = req.body;

//     req.db.findUser(user, (error, user) => {
//         if (error || !user) {
//             return res.status(401).json({
//                 error: 'credenciales invalidas'
//             });
//         } else {
//             return res.json({
//                 message: 'sesion iniciada'
//             })

//         }
//     })
// });


app.post('/login', (req, res) => {
    const { user, password } = req.body;
    console.log("intentando login para:", user); // Log 1

    req.db.findUser(user, (error, userFound) => {
        if (error) return res.status(500).json({ error: 'Error BD' });

        console.log("Usuario encontrado en BD:", userFound); // Log 2

        if (!userFound) {
            console.log("Resultado: Usuario no existe en la tabla");
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        if (userFound.password !== password) {
            console.log("Resultado: Password no coincide");
            console.log(`BD dice: '${userFound.password}' | Tú enviaste: '${password}'`);
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        res.json({ message: 'OK', user_id: userFound.id });
    });
});
//registro

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'credenciales invalidas' });
    }
    const nUser = {

        username: username,
        email: email,
        password: password
    };

    req.db.createUser(nUser, (dbError, result) => {
        if (dbError) {
            if (dbError.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'usuario o email existentes' });
            }
            return res.status(500).json({ error: 'Error al registrar en base de Datos' })
        }
        res.status(201).json({
            message: 'usuario registrado',
            user_id: result.insertId
        })
    }
    )
})
//delete user

app.delete('/register/:user_id', (req, res) => req.db.remove(req.params.user_id, (e) => res.json({ ok: true })))




// CRUD for tasks

// GET: Read all tasks
app.get('/tasks', (req, res) => req.db.getAll((e, r) => res.json(r)));

// POST: Create a new task
app.post('/tasks', (req, res) => {
    // Destructure using the names sent by the frontend
    const {
        user,
        asunto,
        descripcion,
        store_Url, // Frontend sends "storeUrl"
        tipo_archivo,
        estado,
        fecha_de_creacion,
        user_id
    } = req.body;
    //validacion Estados
    const estadosValidos = ['por_Iniciar', 'en_proceso', 'finalizado'];
    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ error: 'estado invalido' });
    }

    const sql = "INSERT INTO tasks (user, asunto, descripcion, store_URL, tipo_archivo, estado, fecha_de_creacion, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    // Use storeUrl (destructured variable)
    const values = [user, asunto, descripcion, store_Url || "", tipo_archivo || "", estado, fecha_de_creacion, user_id];
    // Fix: Access the connection object via req.db.conexion
    req.db.conexion.query(sql, values, (e, r) => {
        if (e) {
            console.error(e);
            return res.status(500).json({ error: e.message });
        }
        res.json(r);
    });
});

// PUT: Update an existing task
// 3. FIX: Corrected syntax from (e)= to (e) => and added req.body as a separate parameter
app.put('/tasks/:id_tarea', (req, res) => req.db.update(req.params.id_tarea, req.body, (e) => res.json({ ok: true })));

// DELETE: Remove a task
app.delete('/tasks/:id_tarea', (req, res) => req.db.remove(req.params.id_tarea, (e) => res.json({ ok: true })));

//cargarurls
app.post('/urls', (req, res) => {
    const { url } = req.body;
    if (!url || !/^https?:\/\/.+/i.test(url)) {
        return res.status(400).json({ error: 'URL inválida' });
    }
    req.db.createUrl(url, (e, r) => res.json(r));

    const insertUrl = "INSERT INTO urls (url) VALUES (?)";
    const values = [url];
    req.db.conexion.query(insertUrl, values, (e, r) => {
        if (e) {
            console.error(e);
            return res.status(500).json({ error: e.message });
        }
        res.status(200).json({ message: 'URL agregada exitosamente' });
    });
});


// Start the server
// 4. FIX: Removed the extraneous closing bracket '}'
app.listen(3000, () => console.log('servidor corriendo en http://localhost:3000'));

