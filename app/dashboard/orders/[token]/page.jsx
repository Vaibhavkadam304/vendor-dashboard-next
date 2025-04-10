// 'use client';

// import { useEffect } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import Cookies from 'js-cookie';

// export default function OrdersPage() {
//   const params = useParams();
//   const token = Array.isArray(params.token) ? params.token.join('.') : params.token;
//   const router = useRouter();

//   useEffect(() => {
//     if (typeof token === 'string') {
//       Cookies.set('jwt_token', token, { expires: 7, secure: true });
//       console.log('Token stored:', token);

//       // Redirect to a clean route without token
//       //router.replace('/dashboard/orders');
//     }
//   }, [token]);

//   return (
//     <div>

//        <p>Loading.....</p>
//        <p>Token stored: <strong>{token}</strong></p>
//     </div>
//   );
// }
/////////////////////////////////////////////////
'use client';
import useAuth from '@/hooks/useAuth';

export default function OrdersPage() {
  const { authorized, vendorInfo, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!authorized) return <p>Unauthorized</p>;

  return (
    <div>
      <h1>Welcome Vendor</h1>
      <p>ID: {vendorInfo?.id}</p>
      <p>Role: {vendorInfo?.role}</p>
    </div>
  );
}

