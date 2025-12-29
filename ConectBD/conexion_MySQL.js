const mysql = require('mysql2');
const { Result } = require('pg');

const conexion = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: '001_app'
});
const findUser = (user, callback) => {
  const query = 'SELECT * FROM users WHERE usuario=?';
  console.log("Ejecutando consulta SQL para:", user);
  conexion.query(query, [user], (error, results) => {
    if (error) {
      console. error ("error en la query", error)
      return callback(error, null);
      
    }
    console.log("Resultados de la BD:", results); // Log vital
    
    if (results && results.length >0){
      callback (null, results[0]);
    }else{
      callback(null, null);
    }
  });
}

const createUser = (userData, callback) => {
  const query = 'INSERT INTO users (nombre, usuario, email, password) VALUES (?, ?, ?, ?)';
  conexion.query(query, [data.nombre, data.usuario, data.email, data.password], (error, results) => {
    callback(error, results);
  });
}
conexion.connect(error => {
  if (error) {
    console.error('❌ Error de conexión:', error);
    return;

  }
});
console.log('🟢 Conectado a MySQL');

module.exports = { conexion, findUser, createUser };

