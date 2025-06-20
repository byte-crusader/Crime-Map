let btn = document.querySelector("#btn");  

btn.addEventListener('click', () => {
const input_date = document.querySelector("#dateInput").value;
    
    fetch('http://localhost:3000/date', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: input_date
    })
    .then(response => response.text())
    .then(data => console.log("backend",data))
})


    var map = new maplibregl.Map({
      container: 'map',
      style: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL', // stylesheet location
      center: [0, 0], // starting position [lng, lat]
      zoom: 3 // starting zoom
    });

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
	 const geoJSONcontent = await fetchJSONData();//grab the json file data and assign it to a variable
	 //console.log(input_date)
     //console.log("here",geoJSONcontent)
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

                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
        const popupContent = `
            <strong>Crime:</strong> ${crimeType}<br>
            <strong>Coordinates:</strong> ${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}    
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

        map.on('mouseleave', 'crimes', () => {
            currentFeatureCoordinates = undefined;
            map.getCanvas().style.cursor = '';
            popup.remove();
        });
