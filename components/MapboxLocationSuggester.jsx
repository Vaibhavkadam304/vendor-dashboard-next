// // components/MapboxLocationSuggester.jsx
// import React, { useEffect, useState } from 'react';

// const MapboxLocationSuggester = ({ location }) => {
//   const [suggestedLocation, setSuggestedLocation] = useState(null);

//   const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWNoaW5rMTAwIiwiYSI6ImNsajJrcDB5dDB3emczam5lcTMwZTVwYmQifQ.BwBtTZKQpTSgctz0EfWOvg'; // Replace this

//   useEffect(() => {
//     const fullAddress = [
//       location?.address_1,
//       location?.city,
//       location?.state,
//       location?.zip,
//       location?.country
//     ].filter(Boolean).join(', ');

//     if (fullAddress.length < 10) return;

//     const fetchSuggestion = async () => {
//       try {
//         const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?access_token=${MAPBOX_TOKEN}`);
//         const data = await res.json();
//         if (data?.features?.length) {
//           setSuggestedLocation(data.features[0]);
//         }
//       } catch (err) {
//         console.error('Mapbox error:', err);
//       }
//     };

//     fetchSuggestion();
//   }, [location]);

//   return (
//     suggestedLocation && (
//       <div className="pl-8 text-sm text-gray-700 pt-2">
//         <p className="font-medium text-[#B55031]">Suggested Location:</p>
//         <p>{suggestedLocation.place_name}</p>
//       </div>
//     )
//   );
// };

// export default MapboxLocationSuggester;


// components/MapboxLocationSuggester.jsx
import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

const MapboxLocationSuggester = ({ location }) => {
  const [suggestedLocation, setSuggestedLocation] = useState(null);
  const mapContainerRef = useRef(null);
  const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWNoaW5rMTAwIiwiYSI6ImNsajJrcDB5dDB3emczam5lcTMwZTVwYmQifQ.BwBtTZKQpTSgctz0EfWOvg';

  mapboxgl.accessToken = MAPBOX_TOKEN;

  useEffect(() => {
    const fullAddress = [
      location?.address_1,
      location?.city,
      location?.state,
      location?.zip,
      location?.country
    ].filter(Boolean).join(', ');

    if (fullAddress.length < 10) return;

    const fetchSuggestion = async () => {
      try {
        const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?access_token=${MAPBOX_TOKEN}`);
        const data = await res.json();
        if (data?.features?.length) {
          setSuggestedLocation(data.features[0]);
        }
      } catch (err) {
        console.error('Mapbox error:', err);
      }
    };

    fetchSuggestion();
  }, [location]);

  useEffect(() => {
    if (!suggestedLocation || !mapContainerRef.current) return;

    const { center } = suggestedLocation; // [lng, lat]
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: center,
      zoom: 14, // a bit closer
      pitch: 0,
      bearing: 0
    });
    
    // Add marker
    new mapboxgl.Marker({ anchor: 'bottom' }) // ensures bottom of marker is at center
      .setLngLat(center)
      .addTo(map);
    
    // Make sure map renders correctly in small container
    map.resize();

    new mapboxgl.Marker().setLngLat(center).addTo(map);

    return () => map.remove();
  }, [suggestedLocation]);

  return (
    suggestedLocation && (
      <div className="pl-8 text-sm text-gray-700 pt-2">
        <p className="font-medium text-[#B55031]">Suggested Location:</p>
        <p>{suggestedLocation.place_name}</p>
  
        {/* Map with coordinates shown inside the map container */}
        <div className="relative mt-4" style={{ height: '250px', width: '250px' }}>
          <div
            ref={mapContainerRef}
            className="rounded shadow"
            style={{ height: '100%', width: '100%' }}
          />
          <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 px-3 py-1.5 text-xs text-gray-800 rounded-md shadow-lg">
            📍 Lat: {suggestedLocation.center[1].toFixed(5)}, Lng: {suggestedLocation.center[0].toFixed(5)}
          </div>
        </div>
      </div>
    )
  );
};

export default MapboxLocationSuggester;
