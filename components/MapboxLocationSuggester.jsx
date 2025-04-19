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

  // useEffect(() => {
  //   if (!suggestedLocation || !mapContainerRef.current) return;

  //   const { center } = suggestedLocation; // [lng, lat]
  //   const map = new mapboxgl.Map({
  //     container: mapContainerRef.current,
  //     style: 'mapbox://styles/mapbox/streets-v11',
  //     center: center,
  //     zoom: 12
  //   });

  //   new mapboxgl.Marker().setLngLat(center).addTo(map);

  //   return () => map.remove();
  // }, [suggestedLocation]);
  useEffect(() => {
    if (!suggestedLocation || !mapContainerRef.current) return;
  
    const { center } = suggestedLocation;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: center,
      zoom: 12
    });
  
    new mapboxgl.Marker()
      .setLngLat(center)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setText(
          `Lat: ${center[1].toFixed(5)}, Lng: ${center[0].toFixed(5)}`
        )
      )
      .addTo(map)
      .togglePopup();
  
    return () => map.remove();
  }, [suggestedLocation]);
  

  return (
    suggestedLocation && (
      <div className="pl-8 text-sm text-gray-700 pt-2">
        <p className="font-medium text-[#B55031]">Suggested Location:</p>
        <p>{suggestedLocation.place_name}</p>

        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#B55031]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.104-.896-2-2-2s-2 .896-2 2 .896 2 2 2 2-.896 2-2zm0 0c0 2-2 3.5-2 3.5s-2-1.5-2-3.5 2-3.5 2-3.5 2 1.5 2 3.5z" />
          </svg>
          <span>{suggestedLocation.center[1].toFixed(5)}, {suggestedLocation.center[0].toFixed(5)}</span>
        </div>
        </div>
        )
  );
};

export default MapboxLocationSuggester;
