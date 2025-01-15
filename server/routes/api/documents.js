const express = require('express')
const { WebSocketExpress, Router } = require('websocket-express')

const router = new Router()

router.ws('/documents/:documentId', async (req, res) => {
  console.log('attempted document ws connection!')
  const ws = await res.accept()
  ws.on('message', (msg) => {
    ws.send(msg)
  })
  ws.send('hello')
})

module.exports = router