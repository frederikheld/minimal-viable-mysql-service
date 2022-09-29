const actions = { }

const { getAllSessions, getSession } = require('./functions')

actions.getAllSessions = async (request, response) => {
    try {
        const results = await getAllSessions()

        if (results) {
            response.status(200).send(results)
        } else {
            response.status(500).send()
        }
    } catch (error) {
        response.status(500).send()
    }
}

actions.getSession = async (request, response) => {
    try {
        const results = await getSession(request.params.sessionCode)

        if (results) {
            response.status(200).send(results)
        } else {
            response.status(404)
        }
    } catch (error) {
        response.status(500).send()
    }
}

module.exports = actions