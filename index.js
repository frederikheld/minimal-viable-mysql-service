const express = require('express')
const mysql = require('mysql')

const routes = require('./routes')

const {
    createTableIfNotExists,
    addDummyData
} = require('./functions')


async function initMySQLDB () {
    return new Promise (async (resolve, reject) => {
        try {
            const result = await createTableIfNotExists()

            if (result === true) {
                console.log('database did not exist --> created')
                try {
                    await addDummyData()
                    console.log('dummy data added')
                    resolve(true)
                } catch (error) {
                    console.log('ERROR-2:', error)
                    reject(error)
                }
            } else {
                console.log('database does already exist')
                resolve(false)
            }
        } catch (error) {
            console.log('ERROR-1:', error)
            resolve(error)
        }
    })
}


async function main () {

    // init MySQL db:
    await initMySQLDB()

    // init API server:
    const app = express()
    app.use(express.json())
    app.use((request, response, next) => {
        console.log('request received ' + request.query.count)
        next()
    })
    app.use(routes)
    app.listen(process.env.PORT, () => {
        console.log('connect to api on port ' + process.env.PORT)
    })

    // stress test MySQL db directly:
    // let counter = 0
    // setInterval(async () => {
    //     const result = await getAllSessions()
    //     console.log(++counter, 'count:', result.length)
    // }, 7)
}

main()
