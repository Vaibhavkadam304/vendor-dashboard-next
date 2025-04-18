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


import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

const MapboxLocationSuggester = ({ location }) => {
  const [suggestedLocation, setSuggestedLocation] = useState(null);
  const mapContainerRef = useRef(null); // Reference to map container
  const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWNoaW5rMTAwIiwiYSI6ImNsajJrcDB5dDB3emczam5lcTMwZTVwYmQifQ.BwBtTZKQpTSgctz0EfWOvg'; // Replace this

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
    if (suggestedLocation && suggestedLocation.geometry) {
      const { coordinates } = suggestedLocation.geometry;

      // Initialize Mapbox map when suggested location is available
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current, // Container reference
        style: 'mapbox://styles/mapbox/streets-v11',
        center: coordinates, // Set center to suggested coordinates
        zoom: 12
      });

      // Add a marker at the suggested location
      new mapboxgl.Marker().setLngLat(coordinates).addTo(map);
    }
  }, [suggestedLocation]);

  return (
    <div>
      {suggestedLocation && (
        <div className="pl-8 text-sm text-gray-700 pt-2">
          <p className="font-medium text-[#B55031]">Suggested Location:</p>
          <p>{suggestedLocation.place_name}</p>
        </div>
      )}

      {/* Map container */}
      <div
        ref={mapContainerRef}
        style={{ width: '300px', height: '200px', marginTop: '20px' }} // Smaller size
      />
    </div>
  );
};

export default MapboxLocationSuggester;
