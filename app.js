let btn = document.querySelector("#btn");  

function createCrimeColors(colorData, crimeData) {
	let dict = {}
	for(let i = 0; i < colorData.length; i++){
		dict[crimeData[i]] = colorData[i]
	}
	return dict
}
// Create map object, set map starting point
// https://api.maptiler.com/maps/hybrid/style.json?key=DKCRwurseZYVO8bivqFs
async function fetchAPIKey(){
	try {
    //const response = await fetch('./test.geojson');
        const response = await fetch('http://localhost:3000/key');

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
	const data = await response.json()
    return data.apiKey;
} catch (error) {
    console.error('Failed to fetch data:', error);
}

}
let map
async function returnKey(){
	const theKey = await fetchAPIKey();
    map = new maplibregl.Map({
      container: 'map',
      style: `https://api.maptiler.com/maps/hybrid/style.json?key=${theKey}`, // stylesheet location
      center: [-96.7715563417, 37.9672433944], // starting position [lng, lat]
      zoom: 3 // starting zoom
    });
	return map
}
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
function randomColorGen() {
	const randomColor = Math.floor(Math.random() * 16777215).toString(16);
	return "#" + randomColor.padStart(6, '0');

}
let colorArr = []
let colorCount = 0
let crimeCount = 0
//Load map function, start on page load    
returnKey().then(() => {
    map.on('load', async () => {
     const crimeTypesContainer = document.querySelector('#crimeTypes') 
	 const geoJSONcontent = await fetchJSONData();//grab the json file data and assign it to a variable
	console.log(geoJSONcontent)
       crimeTypes = [] 
       geoJSONcontent.forEach(crime => {
        if(!crimeTypes.includes(crime.crimeType)) {
            crimeTypes.push(crime.crimeType)
        }

       })
        // Create checkbox container
        const container = document.createElement('div');
        container.id = 'checkbox-container';
        //container.style.cssText = 'display: flex; gap: 5px; margin: 10px; width:40%';
        container.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 15px;
    max-width: 300px;
    background-color: black;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    max-height: 400px;
    overflow-y: auto;
    z-index: 1;
    `;
 const crimeTypeH3 = document.createElement('h3')
 crimeTypeH3.textContent = "Filter By Crime Type"
const checkAll = document.createElement('button')
checkAll.textContent = "Check / Uncheck All"
          container.appendChild(crimeTypeH3)
	  container.appendChild(checkAll)


        // Create checkboxes for each crime type
        crimeTypes.forEach(crimeType => {
            const wrapper = document.createElement('div');
            wrapper.style.cssText = `
    display: flex;
    align-items: center;
    padding: 8px;
    background: black;
    width: 100%;
    transition: all 0.2s ease;
    cursor: pointer;
`;
	wrapper.classList.add('crime-wrapper');
            const checkbox = document.createElement('input');

	    //wrapper.id = 'checkboxInput';
            checkbox.type = 'checkbox';
            checkbox.id = crimeType.replace(/\s+/g, '-').toLowerCase();
	    checkbox.classList.add('checkboxInput');
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
    font-size: .8rem;
    color: orange;
`;
            label.htmlFor = checkbox.id;
            label.textContent = crimeType;
           

	const colorDot = document.createElement('span');
	colorDot.classList.add('colorDot');
	colorArr.push(randomColorGen())
	colorDot.style.color = colorArr[colorCount]
	colorCount++

            wrapper.appendChild(checkbox);
            wrapper.appendChild(label);
            wrapper.appendChild(colorDot);
	    container.appendChild(wrapper);

	checkbox.addEventListener("change", async () => {
	let boxes = document.querySelectorAll('.checkboxInput');
	crimeTypes  = Array.from(boxes)
			.filter(box => box.checked)
			.map(box => box.value);
const geoJSONcontent = await  fetchJSONData();
        
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

	const geoJSONFiltered = {
        type: 'FeatureCollection',
        features: geojson.features.filter(feature => {
//                const featureCrimeTypes = feature.properties.crimeType
                return crimeTypes.includes(feature.properties.crimeType)

})
}

	updateMap(geoJSONFiltered)
	map.getSource('crimes').setData(geoJSONFiltered);
    // Make sure the layer paint property uses the color dictionary
    map.setPaintProperty('crimes-circles', 'circle-color', [
        'match',
        ['get', 'crimeType'],
        ...Object.entries(crimeColorDict).flat(),
        '#999999'  // default color
    ]);
	//console.log(geojson)
	//console.log(geoJSONFiltered)
	});
        });
        checkAll.addEventListener('click', () => {
                let boxes = document.querySelectorAll('.checkboxInput');
                boxes.forEach((element) => {
                        if (element.checked === false){
                        element.checked = true
                }else{
                        element.checked = false
                }})

crimeTypes = Array.from(boxes)
                .filter(box => box.checked)
                .map(box => box.value);
        const geoJSONFiltered = {
        type: 'FeatureCollection',
        features: geojson.features.filter(feature => {
                const featureCrimeTypes = feature.properties.crimeType
                return crimeTypes.includes(featureCrimeTypes)

})
}	
        updateMap(geoJSONFiltered)
})

        // Add to document
	const dateContainer = document.querySelector('.date-container');
        dateContainer.appendChild(container);
	
	for(let i = 0; i < geoJSONcontent.length; i++){
		crimeCount = crimeCount + 1
	}
	console.log(crimeCount)
     const crimeColorDict = createCrimeColors(colorArr, crimeTypes)
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


// Add circles
map.addLayer({
    'id': 'crimes-circles',
    'type': 'circle',
    'source': 'crimes',
    'paint': {
        'circle-radius': 6,
        'circle-color': [
		'match',
	['get', 'crimeType'],
            ...Object.entries(crimeColorDict).flat(),
            '#999999', 
	],
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff'
    }
});

// Add labels
map.addLayer({
    'id': 'crimes-labels',
    'type': 'symbol',
    'source': 'crimes',
    'layout': {
        'text-field': ['get', 'year'],
        'text-font': [
            'Open Sans Semibold',
            'Arial Unicode MS Bold'
        ],
        'text-offset': [0, 1.25],
        'text-anchor': 'top'
    }
});
// Make post request to the backend and send updated date information for filtering after button is clicked
btn.addEventListener('click', () => {
const input_date = document.querySelector("#dateInput").value;
    fetch('http://localhost:3000/date', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body:JSON.stringify({date: input_date })
    })
    .then(response => response.json())
    .then(async data => {
const geoJSONcontent = await fetchJSONData();

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
        updateMap(geojson)

    });
});

function updateMap(geojsonInput) {
        if (map.getSource('crimes')){
                map.removeLayer('crimes-circles');
                map.removeLayer('crimes-labels');
                map.removeSource('crimes');
        }
       map.addSource('crimes', {
           'type': 'geojson',
           'data': geojsonInput
     });
	crimeCount = 0;
 for(let i = 0; i < geojsonInput.features.length; i++){
         crimeCount = crimeCount + 1
 }
 console.log(crimeCount)

// Add circles
map.addLayer({
    'id': 'crimes-circles',
    'type': 'circle',
    'source': 'crimes',
    'paint': {
        'circle-radius': 6,
        'circle-color': [
                'match',
        ['get', 'crimeType'], 
            ...Object.entries(crimeColorDict).flat(),
            '#999999',
        ],
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff'
    }
});

// Add labels
map.addLayer({
    'id': 'crimes-labels',
    'type': 'symbol',
    'source': 'crimes',
    'layout': {
        'text-field': ['get', 'year'],
        'text-font': [
            'Open Sans Semibold',
            'Arial Unicode MS Bold'
        ],
        'text-offset': [0, 1.25],
        'text-anchor': 'top'
    }
});     
        
}               

        });
	        
        // Create a popup, but don't add it to the map yet.
        const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false
        });
        // Make sure to detect marker change for overlapping markers
        // and use mousemove instead of mouseenter event
        let currentFeatureCoordinates = undefined;
        map.on('mousemove', 'crimes-circles', (e) => {
            const featureCoordinates = e.features[0].geometry.coordinates;
            if (currentFeatureCoordinates !== featureCoordinates) {
                currentFeatureCoordinates = featureCoordinates;

                // Change the cursor style as a UI indicator.
                map.getCanvas().style.cursor = 'pointer';

                const crimeType = e.features[0].properties.crimeType
                const coordinates = e.features[0].geometry.coordinates;
		let crimeDate = e.features[0].properties.date
		let cut = crimeDate.indexOf("T");
		crimeDate = crimeDate.substring(0, cut)
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

        map.on('mouseleave', 'crimes-circles', () => {
            currentFeatureCoordinates = undefined;
            map.getCanvas().style.cursor = '';
            popup.remove();
        });

})
