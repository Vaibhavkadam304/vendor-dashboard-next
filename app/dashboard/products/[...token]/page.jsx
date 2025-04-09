// 'use client';

// import { useEffect, useState } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { setCookie, getCookie } from 'cookies-next';

// export default function ProductsPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const queryToken = searchParams.get('token');

//   const [vendor, setVendor] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // decode and verify token from cookie
//   useEffect(() => {
//     const token = getCookie('vendorToken');

//     if (!token || typeof token !== 'string') {
//       setLoading(false);
//       return;
//     }

//     try {
//       const [, payload] = token.split('.');
//       const decoded = JSON.parse(atob(payload));

//       if (decoded.exp * 1000 < Date.now()) {
//         setVendor(null);
//       } else {
//         setVendor(decoded);
//       }
//     } catch (err) {
//       console.error('Invalid token');
//       setVendor(null);
//     }

//     setLoading(false);
//   }, []);

//   // handle token in URL once
//   useEffect(() => {
//     if (queryToken) {
//       setCookie('vendorToken', queryToken, {
//         maxAge: 2 * 60 * 60,
//         path: '/',
//       });

//       router.replace('/dashboard/products');
//     }
//   }, [queryToken]);

//   if (loading) return <p>Loading...</p>;
//   if (!vendor) return <p>Unauthorized access</p>;

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-4">Products Dashboard</h1>
//       <p>Welcome Vendor #{vendor.user_id}</p>
//     </div>
//   );
// }
'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function ProductsPage() {
  const params = useParams();
  const token = Array.isArray(params.token) ? params.token.join('.') : params.token;
  const router = useRouter();

  useEffect(() => {
    if (typeof token === 'string') {
      Cookies.set('jwt_token', token, { expires: 7, secure: true });
      console.log('Token stored:', token);

      // Redirect to a clean route without token
      router.replace('/dashboard/products');
    }
  }, [token]);

  return (
    <div>
       <p>Loading.....</p>
    </div>
  );
}
