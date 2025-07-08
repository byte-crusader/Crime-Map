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
const Cincinnati_URL = `https://data.cincinnati-oh.gov/resource/k59e-2pvf.json?$where=date between '${dateStored}T00:00:00' and '${dateStored}T23:59:59'`
const Chicago_URL = `https://data.cityofchicago.org/resource/ijzp-q8t2.json?$where=date_reported between '${dateStored}T00:00:00' and '${dateStored}T23:59:59'`

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
	let dataArr = []
	const endPointArr = [
		`https://data.cityofnewyork.us/resource/qgea-i56i.json?cmplnt_fr_dt=${dateStored}`,
		`https://data.seattle.gov/resource/tazs-3rd5.json?$where=offense_date between '${dateStored}T00:00:00.000' and '${dateStored}T23:59:59.999'`,
		`https://data.cityofchicago.org/resource/ijzp-q8t2.json?$where=date between '${dateStored}T00:00:00' and '${dateStored}T23:59:59'`,
		`https://data.cincinnati-oh.gov/resource/k59e-2pvf.json?$where=date_reported between '${dateStored}T00:00:00' and '${dateStored}T23:59:59'`
	]
	for(let i = 0; i < endPointArr.length; i++){
		let response = await fetch(endPointArr[i])
		if (!response.ok) {
		   throw new Error(response.status)
		}
		let data = await response.json()
		dataArr.push(data)
	}

	const filteredData = dataArr[0].map(crime => ({
            date: crime.cmplnt_fr_dt,
            crimeType: crime.ofns_desc,
            longitude: crime.longitude,
            latitude: crime.latitude
        }));
	const filteredData1 = dataArr[1].map(crime => ({
    	  date: crime.offense_date,
    	  crimeType: crime.offense_sub_category,
    	  longitude: crime.longitude,
    	  latitude: crime.latitude
	}));
	const filteredData2 = dataArr[2].map(crime => ({
          date: crime.date,
          crimeType: crime.primary_type,
          longitude: crime.longitude,
          latitude: crime.latitude
    }));
	const CincinnatiData = dataArr[3].map(crime => ({
  	  date: crime.date_reported,
	  crimeType: crime.offense,
	  longitude: crime.longitude_x,
	  latitude: crime.latitude_x
	}));
console.log(CincinnatiData)

	const combined = [...filteredData, ...filteredData1, ...filteredData2, ...CincinnatiData];
//console.log("combined",combined)
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
