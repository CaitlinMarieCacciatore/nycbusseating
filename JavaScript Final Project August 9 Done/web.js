//01 Add a map with demo tiles

//https://maplibre.org/maplibre-gl-js/docs/examples/simple-map/
// const map = new maplibregl.Map({
//     container: 'map', // container id
//     style: 'https://demotiles.maplibre.org/style.json', // style URL
//     center: [-73.9205, 40.6803], // starting position [lng, lat]
//     zoom: 9, // starting zoom
//     hash: true
// });

//02 Replace with our own map from maptiler

//Open Maptiler my cloud
//Open "Maps", select your map
//Copy the "use vector style" link


const map = new maplibregl.Map({
    container: 'map', // container id
    style: 'https://api.maptiler.com/maps/0527181a-1a35-4cf8-8a4a-b0efb32259d7/style.json?key=7SGo3nVkTl7JQ90xmJ0i', // style URL
    center: [-73.99028, 40.69278], // starting position [lng, lat]
    zoom: 10, // starting zoom
    hash: true
});

//03 Map events
//https://maplibre.org/maplibre-gl-js/docs/API/classes/maplibregl.Map/#events
//https://maplibre.org/maplibre-gl-js/docs/API/classes/maplibregl.Map/#on - Yikes! Why so buried?
//https://docs.mapbox.com/mapbox-gl-js/api/map/#map-events - A little easier to find

// map.once('load',()=>{
//     console.log('loaded!');
// });

// map.once('click',()=>{
//     console.log('clicked!');
// });

// map.on('click',()=>{
//     console.log('clicked!');
// });

//04 Load geojson
//Include Axios
map.once('load', main);

async function main() {
    //Load geojson async/await == .then(...)
    let BusData = await axios('bus_data.geojson');
    map.addSource('bus_routes-src', {
        'type': 'geojson',
        'data': BusData.data
    });


    
    //https://maplibre.org/maplibre-style-spec/layers/
    map.addLayer({
        'id': 'bus_routes',
        'type': 'circle',
        'source': 'bus_routes-src',
        'layout': {},
        //https://maplibre.org/maplibre-style-spec/layers/#circle
        'paint': {
            'circle-color'
            : '#125734',
            'circle-stroke-width': 1.5,
            'circle-stroke-color': 'white'
        }

        
    })
    let uszipData = await axios('uszips.geojson');

    map.addSource('uszips', {
        'type': 'geojson',
        'data': uszipData.data,
            })
    map.addLayer({
        'id': 'uszipsfill',
        'type': 'fill',
        'source': 'uszips',
        'layout': {
        },
        'paint': {
            'fill-opacity': 0,
        }
    });


map.addLayer({
    'id': 'uszips',
    'type': 'line',
    'source': 'uszips',
    'layout': {
        'line-join': 'round',
        'line-cap': 'round'
    },
    'paint': {
        'line-color': 'black',
        'line-width': 1.5
    }
});


    //05 Add Map Events
    addEvents();
    }

function addEvents() {
    // Create a popup, but don't add it to the map yet.
    const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('mouseenter', 'bus_routes', (e) => {
        //06 Add popups
        //https://maplibre.org/maplibre-gl-js/docs/examples/popup-on-hover/
        
        //console.log(e);
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        const coordinates = e.features[0].geometry.coordinates.slice();
        const name = e.features[0].properties.busroute;
        const address = e.features[0].properties.address;
        const boroughname = e.features[0].properties.boroname;
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(coordinates).setHTML(
            `

            <p>It is clear to see that certain boroughs of NYC are more densely populated in terms of bus seating options for the public. Queens and Staten Island both stand out as having a lack of this vital infrastructure.</p>
           
            <p>You have clicked on a bus seating area for the <b>${name}</b> bus line.</p>
            <p></p>
            <p>This station is located at <b>${address}</b> in the borough of <b>${boroughname}</b>.</p>
            <p>To geolocate yourself, please click on the small black and white button in the top right corner. You will be able to see which bus seating arrangments exist in your area.</p>

            `
        ).addTo(map);
    })

    map.on('mouseleave', 'bus_routes', () => {
     map.getCanvas().style.cursor = '';
       popup.remove();
  });

    const popup2 = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: true
    });

    map.on('click', 'uszipsfill', (e) => {
        //06 Add popups
        //https://maplibre.org/maplibre-gl-js/docs/examples/popup-on-hover/
        
        console.log(e);
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        const coordinates = e.lngLat;
        const zipname = e.features[0].properties.ZIPCODE;
        const populationcount = e.features[0].properties.POPULATION;
        const countyname = e.features[0].properties.COUNTY;
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
     }

        // Populate the popup and set its coordinates
        // based on the feature found. 
        popup2.setLngLat(coordinates).setHTML(  `
           <p>You have clicked on an area located in <b>${zipname}</b></p>
           <p></p>
           <p>The zip code <b>${zipname}</b> has a population of <b>${populationcount} people.</b></p>
           This area is located in the county of <b>${countyname}</b>.</p>

           `)
           .addTo(map);
            })
    
    map.on('mouseleave', 'uszipsfill', () => {
        map.getCanvas().style.cursor = '';
        popup2.remove();
    });


    map.addControl(
        new maplibregl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true,
            trackUserLocation: true
        }})
    );
    
}