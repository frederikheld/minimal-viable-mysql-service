const express = require('express')
const mysql = require('mysql')

const routes = require('./routes')

const MYSQL_CONNECTION_SETTINGS = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_SECRET,
    database: process.env.MYSQL_DATABASE
}
console.log('MySQL connection settings:', MYSQL_CONNECTION_SETTINGS)

/**
 * Runs a MySQL query and returns the raw result.
 * 
 * @param {String} query MySQL query
 * @returns
 */
async function runQuery(query) {
    return new Promise (async (resolveFunction, rejectFunction) => {
        const db = mysql.createConnection(MYSQL_CONNECTION_SETTINGS)

        await new Promise((resolve) => {
            db.connect((error) => {
                if (error) {
                    db.end()
                    rejectFunction(error)
                } else {
                    resolve()
                }
            })
        })

        const result = await new Promise((resolve) => {
            db.query(query, (error, result) => {
                if (error) {
                    db.end()
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

/**
 * 
 * @returns resolves with true, if the table was just created and false, if it already existed. Rejects with an error if an error occured.
 */
async function createTableIfNotExists () {
    return new Promise (async (resolve, reject) => {
        const query = 'CREATE TABLE if not exists `sessions` (`id` INT AUTO_INCREMENT PRIMARY KEY, `sessioncode` VARCHAR(16) UNIQUE NOT NULL, `bpm` SMALLINT UNSIGNED NOT NULL, `synctime` int(11) NOT NULL)'

        try {
            const result = await runQuery(query)

            if (result.warningCount > 0) {
                resolve(false)
            } else {
                resolve(true)
            }
        } catch (error) {
            reject(error)
        }
    })
}

async function addDummyData () {
    const dummyData = [
        {
            sessioncode: 'CK8E3',
            bpm: 96,
            synctime: Date.now() - 60 * 60 * 24 * 10
        },
        {
            sessioncode: 'IDL31',
            bpm: 128,
            synctime: Date.now() - 60 * 60 * 24 * 4
        },
        {
            sessioncode: '8DM4L',
            bpm: 40,
            synctime: Date.now() - 60 * 60 * 4
        }
    ]

    return new Promise(async (resolveFunction, rejectFunction) => {
        const db = mysql.createConnection(MYSQL_CONNECTION_SETTINGS)

        await new Promise((resolve) => {
            db.connect((error) => {
                if (error) {
                    db.end()
                    rejectFunction(error)
                } else {
                    resolve()
                }
            })
        })

        dummyData.forEach(async (row) => {
            const query = 'INSERT INTO `sessions` (`sessioncode`, `bpm`, `synctime`) VALUES (\'' + row.sessioncode + '\', \'' + row.bpm + '\', \'' + row.synctime + '\')'

            const result = await new Promise((resolve) => {
                db.query(query, (error, result) => {
                    if (error) {
                        db.end()
                        rejectFunction(error)
                    } else {
                        resolve(result)
                    }
                })
            })
        })

        db.end()

        resolveFunction()
    })
}


async function main () {

    // init MySQL db:
    try {
        const result = await createTableIfNotExists()

        if (result === true) {
            console.log('database did not exist --> created')
            try {
                await addDummyData()
                console.log('dummy data added')
            } catch (error) {
                console.log('ERROR-2:', error)
            }
        } else {
            console.log('database does already exist')
        }
    } catch (error) {
        console.log('ERROR-1:', error)
    }

    // init API server:
    const app = express()
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
