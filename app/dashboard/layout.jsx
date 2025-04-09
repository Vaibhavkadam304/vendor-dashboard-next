'use client';

import Link from 'next/link';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <aside className="w-64 bg-gray-200 h-screen p-4">
        <nav>
          <ul className="space-y-2">
            <li>
              <Link href="/dashboard/products" className="text-blue-600 hover:underline">
                Products
              </Link>
            </li>
            <li>
              <Link href="/dashboard/orders" className="text-blue-600 hover:underline">
                Orders
              </Link>
            </li>
            {/* Add more menu links as needed */}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-white min-h-screen">{children}</main>
    </div>
  );
}
