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
fastify
fastify.post('/date', async (request, reply) => {
  try {
    console.log(request.body)
    const inputDate = request.body.date;
    dateStored = inputDate
    console.log("Backend received:", inputDate);
    return { success: true, date: inputDate }
  } catch (error) {
    console.log(error)
  }
})
fastify.get('/key', async (request, reply) => {
  try {
    return { apiKey: apiKey }
  } catch (error) {
    res.status(500).send('Error fetching data');
  }

})


// Declare a route
fastify.get('/crimes', async (request, reply) => {
  try {
    let dataArr = []
    const endPointArr = [
      `https://data.cityofnewyork.us/resource/qgea-i56i.json?cmplnt_fr_dt=${dateStored}`,
      `https://data.seattle.gov/resource/tazs-3rd5.json?$where=offense_date between '${dateStored}T00:00:00.000' and '${dateStored}T23:59:59.999'`,
      `https://data.cityofchicago.org/resource/ijzp-q8t2.json?$where=date between '${dateStored}T00:00:00' and '${dateStored}T23:59:59'`,
      `https://data.cincinnati-oh.gov/resource/k59e-2pvf.json?$where=date_reported between '${dateStored}T00:00:00' and '${dateStored}T23:59:59'`,
      `https://data.sfgov.org/resource/wg3w-h783.json?$where=incident_date between '${dateStored}T00:00:00' and '${dateStored}T23:59:59'`,
      `https://data.lacity.org/resource/2nrs-mtv8.json?$where=date_occ between '${dateStored}T00:00:00' and '${dateStored}T23:59:59'`,
      `https://www.dallasopendata.com/resource/qv6i-rri7.json?$where=callreceived between '${dateStored} 00:00:00.0000000' and '${dateStored} 23:59:59.9999999'`
    ]
    for (let i = 0; i < endPointArr.length; i++) {
      let response = await fetch(endPointArr[i])
      if (!response.ok) {
        throw new Error(response.status)
      }
      let data = await response.json()
      dataArr.push(data)
    }

    const NewYorkData = dataArr[0].map(crime => ({
      date: crime.cmplnt_fr_dt,
      crimeType: crime.ofns_desc,
      longitude: crime.longitude,
      latitude: crime.latitude,
      city: "New York"
    }));
    const SeattleData = dataArr[1].map(crime => ({
      date: crime.offense_date,
      crimeType: crime.offense_sub_category,
      longitude: crime.longitude,
      latitude: crime.latitude,
      city: "Seattle"
    }));
    const ChicagoData = dataArr[2].map(crime => ({
      date: crime.date,
      crimeType: crime.primary_type,
      longitude: crime.longitude,
      latitude: crime.latitude,
      city: "Chicago"
    }));
    const CincinnatiData = dataArr[3].map(crime => ({
      date: crime.date_reported,
      crimeType: crime.offense,
      longitude: crime.longitude_x,
      latitude: crime.latitude_x,
      city: "Cincinnati"
    }));
    const SanFranciscoData = dataArr[4].map(crime => ({
      date: crime.incident_date,
      crimeType: crime.incident_subcategory,
      longitude: crime.longitude,
      latitude: crime.latitude,
      city: "SanFrancisco"
    }));
    const LosAngelesData = dataArr[5].map(crime => ({
       date: crime.date_occ,
       crimeType: crime.crm_cd_desc,
       longitude: crime.lon,
       latitude: crime.lat,
       city: "LosAngeles"
    }));
    const DallasData = dataArr[6].map(crime => {
       let lat = crime.geocoded_column.latitude;
       let lon = crime.geocoded_column.longitude;
       console.log(lat, lon) 
      return{
       date: crime.callreceived,
       crimeType: crime.nibrs_crime_category,
       longitude: lon,
       latitude: lat,
       city: "Dallas"
      };
    });
    const combined = [...NewYorkData, ...SeattleData, ...ChicagoData, ...CincinnatiData, ...SanFranciscoData, ...LosAngelesData, ...DallasData];
    console.log(dataArr[6])
    //console.log("combined",combined)
    return combined
  } catch (error) {
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
