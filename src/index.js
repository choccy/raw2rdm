const config = require('./config.json')
const axios =  require('axios')
const server = require('fastify')({
  bodyLimit: 1024 * 1024 * 48
})

const client = axios.create({
  baseURL: config.rdm_url,
  timeout: 1000,
  headers: {
    'User-Agent': 'raw2rdm',
    'Authorization': 'Bearer ' + config.bearer
  }
});

server.route({
  method: 'POST',
  url: '/raw',
  handler: (request, reply) => {
    if (isRDM(request)) {
      client({
        contents: request.body.contents,
        username: "raw2rdm",
        trainerlvl: 30,
        uuid: "raw2rdm"
      })
    } else {
      console.log("Something went wrong")
    }

    reply.send('OK')
  }
})

server.listen(config.port, config.address, (err, address) => {
  if (err) throw err
  console.log('raw2rdm is live at: ' + address)
})

function isRDM(request) {
  if (request.body &&
      request.body.contents &&
      request.body.contents[0] &&
      isBase64(request.body.contents[0].data) &&
      request.body.contents[0].method &&
      request.body.contents[0].method === 2 || 101 || 102 || 104 || 106 || 156) {
    return true
  } else {
    return false
  }
}

function isBase64(str) {
  var notBase64 = new RegExp('[^A-Z0-9+\\/=]',  'i')
  if (typeof str !== 'string') {
    console.warn('Expected string but received invalid type.')
    return false;
  }
  const len = str.length
  if (!len || len % 4 !== 0 || notBase64.test(str)) {
    return false
  }
  const firstPaddingChar = str.indexOf('=')
  return firstPaddingChar === -1 ||
    firstPaddingChar === len - 1 ||
    (firstPaddingChar === len - 2 && str[len - 1] === '=')
}
