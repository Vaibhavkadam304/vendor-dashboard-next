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
      validateToken(existingToken);
    } else {
      setLoading(false); // No cookie, wait for postMessage
    }

    // Step 2: Wait for postMessage (for new token)
    const handleMessage = (event) => {
      const allowedOrigins = ['https://woocommerce-1355247-4989037.cloudwaysapps.com']; // ✅ Origin sending the postMessage

      if (!allowedOrigins.includes(event.origin)) {
        console.error("❌ Invalid origin: ", event.origin);
        return;
      }
      
      const { token } = event.data;
      if (token) {
        console.log("📦 New token from postMessage:", token);
        Cookies.set('jwt_token', token, { secure: true, sameSite: 'None' });
        validateToken(token); // This updates state once
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []); // ✅ run only once on mount

  const validateToken = (token) => {
    try {
      const decoded = jwtDecode(token);
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
