const express = require('express')
const mysql = require('mysql')

const connectionSettings = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_SECRET,
    database: process.env.MYSQL_DATABASE
}
console.log('MySQL connection settings:', connectionSettings)

/**
 * 
 * @returns resolves with true, if the table was just created and false, if it already existed. Rejects with an error if an error occured.
 */
async function createTableIfNotExists () {
    return new Promise (async (resolveFunction, rejectFunction) => {
        const db = mysql.createConnection(connectionSettings)

        await new Promise(() => {
            db.connect((error) => {
                if (error) rejectFunction(error)
            })
        })

        const query = 'CREATE TABLE if not exists `sessions` (`id` INT AUTO_INCREMENT PRIMARY KEY, `sessioncode` VARCHAR(16) UNIQUE NOT NULL, `bpm` SMALLINT UNSIGNED NOT NULL, `synctime` int(11) NOT NULL)'

        const results = await new Promise((resolve) => {
            db.query(query, (error, results) => {
                if (error) rejectFunction(error)

                resolve(results)
            })
        })

        console.log('RESULT:', results)

        if (results.warningCount > 0) {
            resolveFunction(false)
        } else {
            resolveFunction(true)
        }
    })
}

// async function addDummyData () {
//     const dummyData = [
//         {
//             sessioncode: 'CK8E3',
//             bpm: 96,
//             synctime: Date.now() - 60 * 60 * 24 * 10
//         },
//         {
//             sessioncode: 'IDL31',
//             bpm: 128,
//             synctime: Date.now() - 60 * 60 * 24 * 4
//         },
//         {
//             sessioncode: '8DM4L',
//             bpm: 40,
//             synctime: Date.now() - 60 * 60 * 4
//         }
//     ]

//     return new Promise((resolve, reject) => {
//         const db = mysql.createConnection(connectionSettings)

//         db.connect((error) => {
//             if (error) {
//                 console.error('005:', error)
//                 reject(error)
//             }

//             dummyData.forEach(async (row) => {
//                 try {
//                     const result = await new Promise((resolve, reject) => {
//                         const query = 'INSERT INTO `sessions` (`sessioncode`, `bpm`, `synctime`) VALUES (\'' + row.sessioncode + '\', \'' + row.bpm + '\', \'' + row.synctime + '\')'
            
//                         db.query(query, (error) => {
//                             if (error) {
//                                 console.error('006:', error)
//                                 reject(error)
//                             }
            
//                             db.end()
            
//                             resolve(true)
//                         })
//                     })
//                     resolve(result)
//                 } catch (error) {
//                     reject(error)
//                 }
//             })
//         })
//     })
// }

async function getAllSessions () {
    return new Promise (async (resolveFunction, rejectFunction) => {
        const db = mysql.createConnection(connectionSettings)

        await new Promise((resolve) => {
            db.connect((error) => {
                if (error) {
                    rejectFunction(error)
                } else {
                    resolve()
                }
            })
        })

        const query = 'SELECT * FROM `sessions`'

        const result = await new Promise((resolve) => {
            db.query(query, (error, result) => {
                if (error) {
                    rejectFunction(error)
                } else {
                    resolve(result)
                }
            })
        })

        db.end()

        resolveFunction(result)
    })
}

async function main () {

    // init MySQL db:
    // const result = await createTableIfNotExists()
    // if (result && result === true) {
    //     console.log('database did not exist --> created')
    //     await addDummyData()
    //     console.log('dummy data added')
    // } else {
    //     console.log('database did already exist')
    // }

    // init API server:
    const router = express.Router()

    router.get('/sessions', async (request, response) => {
        try {
            const results = await getAllSessions()
            // console.log('main results:', results)

            if (results) {
                response.status(200).send(results)
            } else {
                response.status(500)
            }
        } catch (error) {
            if (['ER_NO_SUCH_TABLE'].includes(error.code)) {
                console.error('ERROR:', error)
                response.status(500).send()
            } else {
                response.status(500).send()
            }
        }
    })

    const app = express()
    app.use((request, response, next) => {
        console.log('request received ' + request.query.count)
        next()
    })
    app.use(router)
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
