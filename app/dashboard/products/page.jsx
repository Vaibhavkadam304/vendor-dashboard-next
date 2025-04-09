// 'use client';

// import { useEffect, useState } from 'react';
// import Cookies from 'js-cookie';
// import { jwtDecode } from "jwt-decode"; // ✅

// export default function ProductsHomePage() {
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

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   if (!authorized) {
//     return <p>🚫 Unauthorized. Please log in as a seller.</p>;
//   }

//   return (
//     <div>
//       <h1>Welcome to the Products Dashboard</h1>
//       <p><strong>Vendor ID:</strong> {vendorInfo?.user_id}</p>
//       <p><strong>Role:</strong> {vendorInfo?.role}</p>
//     </div>
//   );
// }
'use client';

import useAuth from '@/hooks/useAuth'; // adjust path as per your project structure

export default function ProductsHomePage() {
  const { authorized, vendorInfo, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!authorized) {
    return <p>🚫 Unauthorized. Please log in as a seller.</p>;
  }

  return (
    <div>
      <h1>Welcome to the Products Dashboard</h1>
      <p><strong>Vendor ID:</strong> {vendorInfo?.user_id}</p>
      <p><strong>Role:</strong> {vendorInfo?.role}</p>
    </div>
  );
}
