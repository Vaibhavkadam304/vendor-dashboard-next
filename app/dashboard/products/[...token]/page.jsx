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
