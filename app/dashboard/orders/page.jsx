'use client';

import useAuth from '@/hooks/useAuth';

export default function OrdersHomePage() {
  const { authorized, vendorInfo, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!authorized) return <p>Unauthorized</p>;

  return (
    <div>
      <h1>Orders for Vendor ID: {vendorInfo?.user_id}</h1>
      {/* Render order list here */}
    </div>
  );
}
