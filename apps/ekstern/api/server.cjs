const express = require('express')
const data = require('../src/__mocks__/liveness.json')

const app = express()
const port = 8088

//Endepunkt http://localhost:8088/api/status
app.get('/api/status', (request, response) => {
  response.send(data)
})

app.listen(process.env.PORT || port, () => {
  console.info('proxy server is running on port', process.env.PORT || port)
})
