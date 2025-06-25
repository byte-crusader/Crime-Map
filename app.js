


let btn = document.querySelector("#btn");  

btn.addEventListener('click', () => {
const input_date = document.querySelector("#dateInput").value;
   console.log(input_date)
    fetch('http://localhost:3000/date', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body:JSON.stringify({date: input_date })
    })
    .then(response => response.json())
    .then(async data => {
    if (map.getSource('crimes')){
        map.removeLayer('crimes');
        map.removeSource('crimes')
    }
const geoJSONcontent = await fetchJSONData();
console.log("!!!", geoJSONcontent[0].date)
 const geojson = {
        type: 'FeatureCollection',
        features: geoJSONcontent.map(crime => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [ 
                    parseFloat(crime.longitude),
                    parseFloat(crime.latitude)
                ]
            },
            properties: {
                date: crime.date,
                crimeType: crime.crimeType
            } 
        }))
    };
        map.addSource('crimes', { 
            'type': 'geojson', 
            'data': geojson 
      }); 
      map.addLayer({ 
            'id': 'crimes', 
            'type': 'symbol', 
            'source': 'crimes', 
            'layout': { 
                'icon-image': 'custom-marker', 
                'icon-size': 0.07, 
                // get the year from the source's "year" property
                'text-field': ['get', 'year'], 
                'text-font': [ 
                    'Open Sans Semibold', 
                    'Arial Unicode MS Bold' 
                ], 
                'text-offset': [0, 1.25], 
                'text-anchor': 'top' 
            } 
        });
    });
});

    var map = new maplibregl.Map({
      container: 'map',
      style: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL', // stylesheet location
      center: [0, 0], // starting position [lng, lat]
      zoom: 3 // starting zoom
    });

/*   async function filterByCrimeType(geoJSONData) {
        
        let crimeTypeFiltered = geoJSONData


        return crimeTypeFiltered
    }*/


    //Start of async function that gathers GEOjson data from local file
    async function fetchJSONData() {
    try {
        //const response = await fetch('./test.geojson');
	    const response = await fetch('http://localhost:3000/crimes');
    
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }       
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch data:', error);
    }
}

//End of async function

//Load map function, start on page load    
    map.on('load', async () => {
      // const image = await map.loadImage('https://maplibre.org/maplibre-gl-js/docs/assets/osgeo-logo.png');
	 
	 const image = await map.loadImage('./icon.png');//Grab local star image to be used as icon
     map.addImage('custom-marker', image.data);//Add the image to the map
     const crimeTypesContainer = document.querySelector('#crimeTypes') 
	 const geoJSONcontent = await fetchJSONData();//grab the json file data and assign it to a variable
     //const crimeTypes = [...new Set(geoJSONcontent.map(crime => crime.ofns_desc))];
       crimeTypes = [] 
       console.log("geojsoncontent",geoJSONcontent[0].crimeType)
       geoJSONcontent.forEach(crime => {
           console.log(crime.crimeType)
        if(!crimeTypes.includes(crime.crimeType)) {
            crimeTypes.push(crime.crimeType)
        }

       })
        console.log("crime type", crimeTypes)
        // Create checkbox container
        const container = document.createElement('div');
        container.id = 'checkbox-container';
        //container.style.cssText = 'display: flex; gap: 5px; margin: 10px; width:40%';
        container.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 15px;
    padding: 15px;
    max-width: 300px;
    background-color: #f5f5f5;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    max-height: 400px;
    overflow-y: auto;
    position: absolute;
    top: 30px;
    right: 70px;
    z-index: 1;
    `;
 const crimeTypeH3 = document.createElement('h3')
 crimeTypeH3.textContent = "Filter By Crime Type"

          container.appendChild(crimeTypeH3)

        // Create checkboxes for each crime type
        crimeTypes.forEach(crimeType => {
            const wrapper = document.createElement('div');
            wrapper.style.cssText = `
    display: flex;
    align-items: center;
    padding: 8px;
    background: white;
    border-radius: 4px;
    width: 100%;
    transition: all 0.2s ease;
    cursor: pointer;
`;
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = crimeType.replace(/\s+/g, '-').toLowerCase();
            checkbox.value = crimeType;
            checkbox.checked = true; // Default to checked
            checkbox.style.cssText = `
    cursor: pointer;
    width: 16px;
    height: 16px;
`;

            const label = document.createElement('label');
            label.style.cssText = `
    margin-left: 8px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    color: #333;
`;
            label.htmlFor = checkbox.id;
            label.textContent = crimeType;
            
            wrapper.appendChild(checkbox);
            wrapper.appendChild(label);
            container.appendChild(wrapper);
        });
        

        // Add to document
        document.body.appendChild(container);


     //console.log(await filterByCrimeType(geoJSONcontent))
     //const geoJSONcontentFiltered = await filterByCrimeType(geoJSONcontent)
	 //console.log(input_date)
     console.log("here",geoJSONcontent)
     const geojson = {
            type: 'FeatureCollection',
            features: geoJSONcontent.map(crime => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [
                        parseFloat(crime.longitude),
                        parseFloat(crime.latitude)
                    ]
                },
                properties: {
                    date: crime.date,
                    crimeType: crime.crimeType
                }
            }))
        };
        /*
        geojson.features.forEach(feature => {
            const dateString = feature.properties.date
            const dateObject = new Date(dateString)
            feature.properties.date = dateObject
        })  


        const inputDateFormated = formatDate(input_date)
        const crimeDate = geojson.features[0].properties.date.toLocaleDateString()

    const geoJSONFiltered = {
        type: 'FeatureCollection',
        features: geojson.features.filter(feature => {
            return crimeDate === inputDateFormated;
        })
    };
        //To loop through all the data in the json
        console.log(geojson.features[0].properties.date.toLocaleDateString())
        function formatDate(userDate){
            const [year, month, day] = userDate.split('-')
            return `${month}/${day}/${year}`
        }*/
        // 2024-12-31T00:00:00.000 separation of concerns
        // section the code into functions 


      map.addSource('crimes', {
            'type': 'geojson',
            'data': geojson
      });
      map.addLayer({
            'id': 'crimes',
            'type': 'symbol',
            'source': 'crimes',
            'layout': {
                'icon-image': 'custom-marker',
                'icon-size': 0.07,
                // get the year from the source's "year" property
                'text-field': ['get', 'year'],
                'text-font': [
                    'Open Sans Semibold',
                    'Arial Unicode MS Bold'
                ],
                'text-offset': [0, 1.25],
                'text-anchor': 'top'
            }
        });
        });
	        
        // Create a popup, but don't add it to the map yet.
        const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false
        });
        // Make sure to detect marker change for overlapping markers
        // and use mousemove instead of mouseenter event
        let currentFeatureCoordinates = undefined;
        map.on('mousemove', 'crimes', (e) => {
            const featureCoordinates = e.features[0].geometry.coordinates;
            //console.log(featureCoordinates)
            if (currentFeatureCoordinates !== featureCoordinates) {
                currentFeatureCoordinates = featureCoordinates;

                // Change the cursor style as a UI indicator.
                map.getCanvas().style.cursor = 'pointer';

                const crimeType = e.features[0].properties.crimeType
                const coordinates = e.features[0].geometry.coordinates;
		let crimeDate = e.features[0].properties.date
		let cut = crimeDate.indexOf("T");
		crimeDate = crimeDate.substring(0, cut)
		console.log("crime date",crimeDate)
                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
        const popupContent = `
            <strong>Crime:</strong> ${crimeType}<br>
            <strong>Coordinates:</strong> ${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}<br>
	    <strong>Date:</strong> ${crimeDate} 
                `;
                // Populate the popup and set its coordinates
                // based on the feature found.
                // Add stars to map
                popup.setLngLat(coordinates).setHTML(popupContent).addTo(map);
            }
        });
console.log()
const geocoderApi = {
        forwardGeocode: async (config) => {
            const features = [];
            try {
                const request =
            `https://nominatim.openstreetmap.org/search?q=${
                config.query
            }&format=geojson&polygon_geojson=1&addressdetails=1`;
                const response = await fetch(request);
                const geojson = await response.json();
                for (const feature of geojson.features) {
                    const center = [
                        feature.bbox[0] +
                    (feature.bbox[2] - feature.bbox[0]) / 2,
                        feature.bbox[1] +
                    (feature.bbox[3] - feature.bbox[1]) / 2
                    ];
                    const point = {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: center
                        },
                        place_name: feature.properties.display_name,
                        properties: feature.properties,
                        text: feature.properties.display_name,
                        place_type: ['place'],
                        center
                    };
                    features.push(point);
                }
            } catch (e) {
                console.error(`Failed to forwardGeocode with error: ${e}`);
            }

            return {
                features
            };
        }
    };
    map.addControl(
        new MaplibreGeocoder(geocoderApi, {
            maplibregl
        })
    );

        map.on('mouseleave', 'crimes', () => {
            currentFeatureCoordinates = undefined;
            map.getCanvas().style.cursor = '';
            popup.remove();
        });
