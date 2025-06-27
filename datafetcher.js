// Require the framework and instantiate it
// ESM
//import Fastify from 'fastify'

// CommonJs
const fastify = require('fastify')({
  logger: true
})
fastify.register(require('@fastify/cors'), {
  origin: '*'  // This allows all origins - be more restrictive in production
})

let dateStored = "2024-01-01";
//EX: https://data.cityofnewyork.us/resource/qgea-i56i.json?cmplnt_fr_dt=2024-01-01
const NewYork_URL = `https://data.cityofnewyork.us/resource/qgea-i56i.json?cmplnt_fr_dt=${dateStored}`

fastify.post('/date', async (request, reply) => {
    try{
        console.log(request.body)
        const inputDate = request.body.date;
        dateStored = inputDate
        console.log("Backend received:", inputDate);
        return { success: true, date: inputDate }
    }catch (error){
        console.log(error)
    }
})
console.log(dateStored, NewYork_URL)
// Declare a route
fastify.get('/crimes', async (request, reply) => {
    try{
        const NewYork_URL = `https://data.cityofnewyork.us/resource/qgea-i56i.json?cmplnt_fr_dt=${dateStored}`
        console.log(NewYork_URL)
        const response = await fetch(NewYork_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data)
        const filteredData = data.map(crime => ({
            date: crime.cmplnt_fr_dt,
            crimeType: crime.ofns_desc,
            longitude: crime.longitude,
            latitude: crime.latitude
        }));
        return filteredData
    }catch (error){
        console.log(error.message)
        return [];
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
