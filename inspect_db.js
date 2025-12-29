const { conexion } = require('./ConectBD/conexion_MySQL');

conexion.query('DESCRIBE tasks', (err, results) => {
    if (err) {
        console.error('Error describing table:', err);
    } else {
        console.log('Columns in tasks table:', results.map(row => row.Field));
    }
    conexion.end();
});
