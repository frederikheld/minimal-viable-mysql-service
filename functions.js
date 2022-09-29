const mysql = require('mysql')

const MYSQL_CONNECTION_SETTINGS = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_SECRET,
    database: process.env.MYSQL_DATABASE
}
console.log('MySQL connection settings:', MYSQL_CONNECTION_SETTINGS)


/**
 * PRIVATE
 */

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
 * PUBLIC
 */

async function getAllSessions () {
    return new Promise (async (resolve, reject) => {
        const query = 'SELECT * FROM `sessions`'

        try {
            const result = await __runQuery(query)

            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}

async function getSession (sessionCode) {
    return new Promise (async (resolve, reject) => {
        const query = 'SELECT * FROM `sessions` WHERE `sessioncode` = \'' + sessionCode + '\''

        try {
            const result = await __runQuery(query)

            resolve(result)
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    getAllSessions,
    getSession
}