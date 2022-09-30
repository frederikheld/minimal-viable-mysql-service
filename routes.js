const express = require('express')
const router = express.Router()
const actions = require('./actions')

router.get('/sessions', actions.getAllSessions)
router.post('/sessions', actions.createSession)

router.get('/sessions/:sessionCode', actions.getSession)

module.exports = router