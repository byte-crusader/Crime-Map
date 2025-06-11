// Require the framework and instantiate it

// ESM
//import Fastify from 'fastify'

// CommonJs
const fastify = require('fastify')({
  logger: true
})

const NewYork_URL = 'https://data.cityofnewyork.us/resource/qgea-i56i.json'
// Declare a route
fastify.get('/crimes', async (request, reply) => {
    try{
        const response = await fetch(NewYork_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data)
        return data
    }catch (error){
        console.log(error.message)
    }
})

// Run the server!
 const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
