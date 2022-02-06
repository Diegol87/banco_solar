const { Pool } = require('pg')

const config = {
    user: 'postgres',
    host: 'localhost',
    password: 'esadiz87',
    port: 5432,
    database: 'bancosolar',
}

const pool = new Pool(config)

//para poder insertar usuarios
const insertar = async(datos) => {
    const consulta = {
        text: 'INSERT INTO usuarios(nombre, balance) values($1, $2)',
        values: datos,
    }
    try{
        const result = await pool.query(consulta)
        return result
        
    } catch(error) {
        console.log(error.code)
        return error
    }
}

const consultar = async() => {
    try{
        const result = await pool.query('SELECT * FROM usuarios')
        return result

    } catch(error) {
        console.log(error.code)
        return error
    }
}

const editar = async(datos, id) => {
    const consulta = {
        text: `UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = ${id} RETURNING*`,
        values: datos,
    }
    try{
        const result = await pool.query(consulta)
        return result

    } catch(error) {
        console.log(error.code)
        return code
    }
}

const eliminar = async(id) => {
    try{
        const result = await pool.query(`DELETE FROM usuarios WHERE id = ${id}`)
        return result
    } catch(error) {
        console.log(error.code)
        return error
    }
}

const transferencia = async(datos) => {
    try {
        await pool.query('BEGIN')
        const descontar = {
            text: `UPDATE usuarios SET balance = balance - ${datos[2]} WHERE nombre = '${datos[0]}' RETURNING*`

        }
        const descontado = await pool.query(descontar)
        const acreditar = {
            text: `UPDATE usuarios SET balance = balance + ${datos[2]} WHERE nombre = '${datos[1]}' RETURNING*`
            
        }
        const acreditacion = await pool.query(acreditar)
        console.log(`El usuario "${datos[0]}" ha transferido un monto de "${datos[2]}" al usuario "${datos[1]}"`)

        const registrar = {
            text: `INSERT INTO transferencias(emisor, receptor, monto, fecha) values($1, $2, $3, $4)`,
            values: [descontado.rows[0].id, acreditacion.rows[0].id, datos[2], new Date]
        }
        
        await pool.query(registrar)
        await pool.query('COMMIT')
        const data = [descontado.rows[0].nombre, acreditacion.rows[0].nombre, datos[2], new Date]
        return data

    } catch(error) {
        await pool.query('ROLLBACK')
        console.log('Ha habido un problema al momento de realizar la trnaferencia', error.code)
        return error
    }
}

const registrarTransferencia = async() => {
    const consulta = {
        rowMode: 'array',
        text: "SELECT transferencias.fecha, (SELECT usuarios.nombre FROM usuarios WHERE transferencias.emisor = usuarios.id) as emisor, usuarios.nombre as receptor, transferencias.monto FROM usuarios INNER JOIN transferencias ON transferencias.receptor = usuarios.id ORDER BY transferencias.id;",
    }

    try{
        const result = await pool.query(consulta)
        return result

    } catch(error) {
        console.log('Ha habido un problema en la consulta de la transferencia: ', error.code)
        return error
    }
}

module.exports = { insertar, consultar, editar, eliminar, transferencia, registrarTransferencia }