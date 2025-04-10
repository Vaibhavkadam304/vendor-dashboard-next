// // hooks/useAuth.js
// 'use client';

// import { useEffect, useState } from 'react';
// import Cookies from 'js-cookie';
// import { jwtDecode } from 'jwt-decode';

// export default function useAuth() {
//   const [authorized, setAuthorized] = useState(false);
//   const [vendorInfo, setVendorInfo] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = Cookies.get('jwt_token');

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
//         setVendorInfo(decoded);
//       } else {
//         setAuthorized(false);
//       }
//     } catch (err) {
//       console.error('Invalid token', err);
//       setAuthorized(false);
//     }

//     setLoading(false);
//   }, []);

//   return { authorized, vendorInfo, loading };
// }
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export default function useAuth() {
  const [authorized, setAuthorized] = useState(false);
  const [vendorInfo, setVendorInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    let token = Cookies.get('jwt_token');

    // If token is in the URL, extract and store it
    if (!token && params?.token) {
      token = Array.isArray(params.token) ? params.token.join('.') : params.token;
      Cookies.set('jwt_token', token, { expires: 7, secure: true });
      console.log('Token captured and stored from URL:', token);
    }

    if (!token) {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now();
      const isSeller = decoded.role === 'seller';

      if (!isExpired && isSeller) {
        setAuthorized(true);
        setVendorInfo({
          id: decoded.user_id || decoded.id,  // support multiple field names
          role: decoded.role,
          token,
        });
      } else {
        setAuthorized(false);
      }
    } catch (err) {
      console.error('Invalid token', err);
      setAuthorized(false);
    }

    setLoading(false);
  }, [params]);

  return { authorized, vendorInfo, loading };
}
