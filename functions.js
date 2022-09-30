const mysql = require('mysql')

const MYSQL_CONNECTION_SETTINGS = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_SECRET,
    database: process.env.MYSQL_DATABASE
}


/**
 * PRIVATE helper functions
 */

function __generateSessionCode (length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

    return Array(length).fill().map(() => { return characters.charAt(Math.floor(Math.random() * characters.length)) }).join('')
}

/**
 * Runs a MySQL query and returns the raw result.
 * 
 * @param {String} query MySQL query
 * @returns
 */
 async function __runQuery(query) {
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
 * PUBLIC functions for api calls
 */

async function getAllSessions (start = 0, limit = 10) {
    const query = '(SELECT `id`, `sessioncode`, `bpm`, `synctime` FROM `sessions` ORDER BY `id` DESC LIMIT ' + start + ', ' + limit + ') ORDER BY `id` ASC'

    return new Promise (async (resolve, reject) => {
        try {
            const result = await __runQuery(query)

            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}

async function getSession (sessionCode) {
    const query = 'SELECT `id`, `sessioncode`, `bpm`, `synctime` FROM `sessions` WHERE `sessioncode` = \'' + sessionCode + '\''

    return new Promise (async (resolve, reject) => {
        try {
            const result = await __runQuery(query)

            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}

async function createSession (bpm) {
    return new Promise (async (resolve, reject) => {
        if (!bpm) {
            reject(new Error('ERR_INVALID_ARG_VALUE'))
        }

        const sessionCode = __generateSessionCode(6)
        const syncTime = Date.now()

        const query = "INSERT INTO `sessions` (`sessioncode`, `bpm`, `synctime`) VALUES ('" + sessionCode + "', " + bpm + ", " + syncTime + ")"

        try {
            const result = await __runQuery(query)

            resolve(result)
        } catch (error) {
            reject(error)
        }
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
            const result = await __runQuery(query)

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

module.exports = {
    getAllSessions,
    getSession,
    createSession,
    createTableIfNotExists,
    addDummyData
}