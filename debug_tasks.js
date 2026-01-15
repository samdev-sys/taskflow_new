const { conexion } = require('./ConectBD/conexion_MySQL');

console.log(' checking column estado...');
setTimeout(() => {
    conexion.query("SHOW COLUMNS FROM tasks LIKE 'Estado'", (err, results) => {
        if (err || results.length === 0) {
            // Try lowercase if uppercase fails or returns nothing (though SHOW COLUMNS is case insensitive usually)
            conexion.query("SHOW COLUMNS FROM tasks LIKE 'estado'", (err2, results2) => {
                if (err2) console.error(err2);
                else console.log('Column Info:', results2);
                process.exit();
            });
        } else {
            console.log('Column Info:', results);
            process.exit();
        }
    });
}, 1000);
