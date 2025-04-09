// hooks/useAuth.js
'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export default function useAuth() {
  const [authorized, setAuthorized] = useState(false);
  const [vendorInfo, setVendorInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('jwt_token');

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
        setVendorInfo(decoded);
      } else {
        setAuthorized(false);
      }
    } catch (err) {
      console.error('Invalid token', err);
      setAuthorized(false);
    }

    setLoading(false);
  }, []);

  return { authorized, vendorInfo, loading };
}
