async function getData() {
  const api_key = ""
  const url = `https://api.usa.gov/crime/fbi/sapi/api/data/national/robbery`;
  try {
    const response = await fetch(url, {
  headers: {
    "x-api-key": `${api_key}`,
    'Content-Type': 'application/json'
  }
});

    console.log("Status:", response.status); // Log the status code
    console.log("URL tried:", url); // Log the URL being accessed
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    console.log(json);
  } catch (error) {
    console.error(error.message);
  }
}
getData()

let btn = document.querySelector("#btn");  

let input_date = document.querySelector("#dateInput").value;
   btn.addEventListener('click', (input_date) => {
   console.log(input_date)
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
        const response = await fetch('./test.geojson');
	
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
	 console.log("here",geoJSONcontent)
    const geoJSONcontentFiltered = {
        type: 'FeatureCollection',
        features: geoJSONcontent.features.filter(feature => {
            return feature.properties.date === input_date;
        })
    };
//Get json data
//        console.log(geoJSONcontent.features[0])
//          geoJSONcontent.features.forEach(feature => {
//              console.log(feature.properties)
//        })
      map.addSource('maine', {
            'type': 'geojson',
            'data': geoJSONcontentFiltered
      });
      map.addLayer({
            'id': 'maine',
            'type': 'symbol',
            'source': 'maine',
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
        map.on('mousemove', 'maine', (e) => {
            const featureCoordinates = e.features[0].geometry.coordinates.toString();
            if (currentFeatureCoordinates !== featureCoordinates) {
                currentFeatureCoordinates = featureCoordinates;

                // Change the cursor style as a UI indicator.
                map.getCanvas().style.cursor = 'pointer';

                const coordinates = e.features[0].geometry.coordinates.slice();
                const description = e.features[0].properties.description;

                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                // Populate the popup and set its coordinates
                // based on the feature found.
                // Add stars to map
                popup.setLngLat(coordinates).setHTML(description).addTo(map);
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

        map.on('mouseleave', 'places', () => {
            currentFeatureCoordinates = undefined;
            map.getCanvas().style.cursor = '';
            popup.remove();
        });
