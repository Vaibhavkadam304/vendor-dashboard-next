// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import Cookies from 'js-cookie';
// import { jwtDecode } from 'jwt-decode';

// export default function useAuth() {
//   const [authorized, setAuthorized] = useState(false);
//   const [vendorInfo, setVendorInfo] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const params = useParams();
//   const router = useRouter();

//   useEffect(() => {
//     let token = Cookies.get('jwt_token');

//     // If token is in the URL, extract and store it
//     if (!token && params?.token) {
//       token = Array.isArray(params.token) ? params.token.join('.') : params.token;
//       Cookies.set('jwt_token', token, { expires: 7, secure: true });
//       console.log('Token captured and stored from URL:', token);
//     }

//     if (!token) {
//       setAuthorized(false);
//       setLoading(false);
//       return;
//     }

//     try {
//       const decoded = jwtDecode(token);
//       const isExpired = decoded.exp * 1000 < Date.now();
//       const isSeller = decoded.role === 'seller';

//       if (!isExpired && isSeller) {
//         setAuthorized(true);
//         setVendorInfo({
//           id: decoded.user_id || decoded.id,  // support multiple field names
//           role: decoded.role,
//           token,
//         });
//       } else {
//         setAuthorized(false);
//       }
//     } catch (err) {
//       console.error('Invalid token', err);
//       setAuthorized(false);
//     }

//     setLoading(false);
//   }, [params]);

//   return { authorized, vendorInfo, loading };
// }
//////////////////////////////////////////////////////
'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export default function useAuth() {
  const [authorized, setAuthorized] = useState(false);
  const [vendorInfo, setVendorInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Step 1: Check cookie token on first load
    const existingToken = Cookies.get('jwt_token');
    if (existingToken) {
      console.log("🍪 Token from cookie:", existingToken);
      validateToken(existingToken); // If token exists in cookie, validate it
    } else {
      setLoading(false); // No cookie, wait for postMessage
    }

    // Step 2: Wait for postMessage (for new token)
    // const handleMessage = (event) => {
    //   const allowedOrigins = [
    //     'https://vendrify.vercel.app',               // ✅ Vercel domain (sending postMessage)
    //     'https://woocommerce-1355247-4989037.cloudwaysapps.com'  // ✅ Cloudways domain (expected postMessage origin)
    //   ];

    //   if (!allowedOrigins.includes(event.origin)) {
    //     console.error("❌ Invalid origin: ", event.origin);
    //     return;
    //   }

    //   // If cookie token already exists, don't override it with the postMessage token
    //   const existingToken = Cookies.get('jwt_token');
    //   if (!existingToken) {  // Only update the token if it wasn't set already
    //     const { token } = event.data;
    //     if (token) {
    //       console.log("📦 New token from postMessage:", token);
    //       Cookies.set('jwt_token', token, { secure: true, sameSite: 'None' });
    //       validateToken(token); // This updates state once
    //     }
    //   }
    // };
    const handleMessage = (event) => {
      const allowedOrigins = [
        'https://vendrify.vercel.app',
        'https://woocommerce-1355247-4989037.cloudwaysapps.com'
      ];
    
      if (!allowedOrigins.includes(event.origin)) {
        console.error("❌ Invalid origin: ", event.origin);
        return;
      }
    
      const { token } = event.data;
      if (token) {
        console.log("📦 New token from postMessage:", token);
    
        // Update the cookie with the new token
        Cookies.set('jwt_token', token, { secure: true, sameSite: 'None' });
    
        // Directly update state without revalidation
        setVendorInfo(prevState => ({ ...prevState, token }));
      }
    };
    

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []); // ✅ run only once on mount

  const validateToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      console.log("Decoded JWT Payload:", decoded);  // Print the decoded payload for debugging
      const isExpired = decoded.exp * 1000 < Date.now();
      const isSeller = decoded.role === 'seller';

      if (!isExpired && isSeller) {
        setAuthorized(true);
        setVendorInfo({ ...decoded, token });
      } else {
        setAuthorized(false);
      }
    } catch (err) {
      console.error('Error decoding token:', err);
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  return { authorized, vendorInfo, loading };
}
