const express = require('express')
const data = require('./src/api/__mocks__/data.json')

const app = express()
const port = 8088

//Endepunkt http://localhost:8088/internal/health/liveness
app.get('/internal/health/liveness', (request, response) => {
  response.send(data)
})

app.listen(process.env.PORT || port, () => {
  console.info('proxy server is running on port', process.env.PORT || port)
})
