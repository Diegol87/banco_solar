const http = require('http')
const url = require('url')
const fs = require('fs')
const { insertar, consultar, editar, eliminar, transferencia, registrarTransferencia } = require('./consultas')

http
    .createServer(async(req, res) => {

        if(req.url === '/' && req.method === 'GET') {
            res.setHeader('content-type', 'text/html')
            const html = fs.readFileSync('index.html', 'utf8')
            res.end(html)
        }

        if(req.url === '/usuario' && req.method === 'POST') {

            try{
                let body = ""
                req.on('data', (chunk) => {
                    body += chunk
                })
                req.on('end', async() => {
                    const datos = Object.values(JSON.parse(body))
                    const respuesta = await insertar(datos)
                    res.statusCode = 201
                    res.end(JSON.stringify(respuesta))
                })

            } catch(error) {
                console.log('Ha habido un error al momento de crear el usuario: ',error.code)
                res.statusCode = 400
            }
        }

        if(req.url === '/usuarios' && req.method === 'GET') {

            try{
                const registros = await consultar()
                res.statusCode = 200
                res.end(JSON.stringify(registros.rows))

            } catch(error) {
                console.log('Existe un problema en la ruta: ', error.code)
                res.statusCode = 404
            }
        }

        if(req.url.startsWith('/usuario') && req.method === 'PUT') {

            const { id } = url.parse(req.url, true).query

            try{
                let body = ""
                req.on('data', (chunk) => {
                    body += chunk
                })
                req.on('end', async() => {
                    const datos = Object.values(JSON.parse(body))
                    const respuesta = await editar(datos, id)
                    res.statusCode = 201
                    res.end(JSON.stringify(respuesta))
                })

            } catch(error) {
                console.log('Existe un problema al intentar editar el usuario: ', error.code)
                res.statusCode = 400
            }
        }

        if(req.url.startsWith('/usuario?') && req.method === 'DELETE') {
            
                const { id } = url.parse(req.url, true).query

            try{
                const respuesta = await eliminar(id)
                res.statusCode = 201
                res.end(JSON.stringify(respuesta))
            } catch(error) {
                console.log("Hubo un problema al momento de intentar eliminar un usuario: ", error.code)
                res.statusCode = 400
            }
        }

        if(req.url === '/transferencia' && req.method === 'POST') {
            try {
                let body = ""
                req.on('data', (chunk) => {
                    body += chunk
                })

                req.on('end', async() => {
                    const datos = Object.values(JSON.parse(body))
                    const respuesta = await transferencia(datos)
                    res.statusCode = 201
                    res.end(JSON.stringify(respuesta))

                })
            } catch(error) {
                console.log('Hubo un problema al momento de realizar la transferencia', error.code)
                res.statusCode = 400
            }
        }

        if(req.url === '/transferencias' && req.method === 'GET') {
            try {
                const respuesta = await registrarTransferencia()
                res.statusCode = 200
                res.end(JSON.stringify(respuesta.rows))

            } catch(error) {
                console.log('Ha habido un error al consultar: ', error.code)
                res.statusCode = 400
            }
        }

    })
    .listen(3000, () => {
        console.log('Server ON')
    })