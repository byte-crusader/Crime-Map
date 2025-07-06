// Require the framework and instantiate it
// ESM
//import Fastify from 'fastify'
// CommonJs

require('dotenv').config();
const apiKey = process.env.API_KEY;


const fastify = require('fastify')({
  logger: true
})
fastify.register(require('@fastify/cors'), {
  origin: '*'  // This allows all origins - be more restrictive in production
})
let dateStored = "2024-01-01";
//EX: https://data.cityofnewyork.us/resource/qgea-i56i.json?cmplnt_fr_dt=2024-01-01
const NewYork_URL = `https://data.cityofnewyork.us/resource/qgea-i56i.json?cmplnt_fr_dt=${dateStored}`
const Seattle_URL = `https://data.seattle.gov/resource/tazs-3rd5.json?$where=offense_date between '${dateStored}T00:00:00.000' and '${dateStored}T23:59:59.999'`
const Chicago_URL = "https://data.cityofchicago.org/resource/ijzp-q8t2.json?$where=date between '2024-01-01T00:00:00' and '2024-01-01T23:59:59'"


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
fastify.get('/key', async (request, reply) => {
    try{
    return { apiKey: apiKey }
    }catch (error) {
	res.status(500).send('Error fetching data');
    }


})

// Declare a route
fastify.get('/crimes', async (request, reply) => {
    try{
        const NewYork_URL = `https://data.cityofnewyork.us/resource/qgea-i56i.json?cmplnt_fr_dt=${dateStored}`
        const Seattle_URL = `https://data.seattle.gov/resource/tazs-3rd5.json?$where=offense_date between '${dateStored}T00:00:00.000' and '${dateStored}T23:59:59.999'`
const Chicago_URL = "https://data.cityofchicago.org/resource/ijzp-q8t2.json?$where=date between '2024-01-01T00:00:00' and '2024-01-01T23:59:59'"
 
        const response = await fetch(NewYork_URL);
	const response1 = await fetch(Seattle_URL);
  const response2 = await fetch(Chicago_URL);
	
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const data1 = await response1.json();
	      const data2 = await response2.json();

	const filteredData = data.map(crime => ({
            date: crime.cmplnt_fr_dt,
            crimeType: crime.ofns_desc,
            longitude: crime.longitude,
            latitude: crime.latitude
        }));
	const filteredData1 = data1.map(crime => ({
    	  date: crime.offense_date,
    	  crimeType: crime.offense_sub_category,
    	  longitude: crime.longitude,
    	  latitude: crime.latitude
	}));
const filteredData2 = data2.map(crime => ({
          date: crime.date,
          crimeType: crime.primary_type,
          longitude: crime.longitude,
          latitude: crime.latitude
    }));



	const combined = [...filteredData, ...filteredData1, ...filteredData2];
	console.log(filteredData2)
        return combined
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
