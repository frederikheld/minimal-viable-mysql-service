const actions = { }

const { getAllSessions, getSession, createSession } = require('./functions')


// GET

/**
 * 
 * @param {*} request 
 * @param {*} response 
 */
actions.getAllSessions = async (request, response) => {
    const MAX_LIMIT = 100
    const DEFAULT_LIMIT = 10

    const start = request.body.start || 0
    const limit = (request.body.limit ? (request.body.limit < MAX_LIMIT ? request.body.limit : MAX_LIMIT) : DEFAULT_LIMIT)

    try {
        const result = await getAllSessions(start, limit)

        if (result) {
            response.status(200).send(result)
        } else {
            response.status(500).send()
        }
    } catch (error) {
        response.status(500).send()
    }
}

actions.getSession = async (request, response) => {
    try {
        const result = await getSession(request.params.sessionCode)

        if (result) {
            response.status(200).send(result)
        } else {
            response.status(404).send()
        }
    } catch (error) {
        response.status(500).send()
    }
}

// POST

actions.createSession = async (request, response) => {
    console.log('request.body:', request.body)

    try {
        const result = await createSession(request.body.bpm)
        console.log('result:', result)

        response.status(201).send()
    } catch (error) {
        console.log('error:', error.message)
        if (error.message === 'ERR_INVALID_ARG_VALUE') {
            response.status(400).send({ error: 'missing parameter' })
        } else {
            response.status(500).send()
        }
    }
}

module.exports = actions