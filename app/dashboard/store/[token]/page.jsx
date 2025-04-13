// using cookies for fetching data 
'use client';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';
import { useEffect, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import { SignJWT } from 'jose';
import Image from "next/image";
// import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import dynamic from 'next/dynamic';

import { useParams, useRouter } from 'next/navigation';

const username = 'ck_5a5e3dfae960c8a4951168b46708c37d50bee800';
const appPassword = 'cs_8d6853d98d8b75ddaae2da242987122f38504e7f';
const base64Creds = btoa(`${username}:${appPassword}`);

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });






// Helper function to create JWT
async function createJWT(payload, secret) {
  const encoder = new TextEncoder();
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .sign(encoder.encode(secret));
  return jwt;
}
export default function StorePage() {
  const { authorized, vendorInfo, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const params = useParams(); // token from [token]
  const token = params?.token;
 

  useEffect(() => {
    
    if (vendorInfo) {
      setFormData({
        store_name: vendorInfo.store_name || '',
        store_bio: vendorInfo.store_bio || '',
        phone: vendorInfo.phone || '',
        banner: vendorInfo.banner || '', // ✅ Add this line
        location: {
          address_1: vendorInfo.locations?.[0]?.address_1 || '',
          city: vendorInfo.locations?.[0]?.city || '',
          state: vendorInfo.locations?.[0]?.state || '',
          zip: vendorInfo.locations?.[0]?.zip || '',
          country: vendorInfo.locations?.[0]?.country || '',
        },
        map: {
          lat: vendorInfo.map?.lat || 47.6061389, // Default lat
          lng: vendorInfo.map?.lng || -122.3328481, // Default lng
        },

        store_categories: vendorInfo.store_categories || [],
        dietary_options: vendorInfo.dietary_options || [],
        shipping_options: vendorInfo.shipping_options || [], // ✅ Add this line
        licensing_certification: vendorInfo.licensing_certification || 'Cottage Food Licensed Business', // ✅ Default here
        cancellation_policy: vendorInfo.cancellation_policy || {},
        catalog_mode: {
          hide_add_to_cart_button: vendorInfo.catalog_mode?.hide_add_to_cart_button || 'off',
          hide_product_price: vendorInfo.catalog_mode?.hide_product_price || 'off',
        },
        show_support_btn: vendorInfo.show_support_btn || 'no', // ✅ Added this
        show_support_btn_product: vendorInfo.show_support_btn_product || 'no', // ✅ And this
      });
    }
  }, [vendorInfo]);
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('location.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleUpdate = async () => {
    if (!vendorInfo?.id) return;
    setSubmitting(true);
    setMessage('');
    try {
      
      const res = await fetch(
        `https://woocommerce-1355247-4989037.cloudwaysapps.com/wp-json/custom/v1/update-store/${vendorInfo.id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Basic ${base64Creds}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      // if (res.ok) {
      //   setMessage('Store updated successfully!');
      // } else {
      //   setMessage(`Error: ${data.message || 'Something went wrong'}`);
      // }
      if (res.ok) {
        setMessage('Store updated successfully!');
      
        // Merge old and updated values
        const updatedVendorData = {
          ...vendorInfo,
          ...formData,
          location: {
            ...vendorInfo.location,
            ...formData.location,
          },
          cancellation_policy: {
            ...vendorInfo.cancellation_policy,
            ...formData.cancellation_policy,
          },
        };
      
        // 🔐 Re-encode JWT using jose
        const secret = 'wgziRFG/Mt3wmIv4K+BleKEPZxLXa0C7fc8KOLMnw3Watdi6XwNHojIk8egBnNxUVTZ5aVmTkCYGANtQIqEW9g==';
        const newToken = await createJWT(updatedVendorData, secret);
      
        // ✅ Store updated JWT in cookie
        Cookies.set('jwt_token', newToken, { expires: 7, secure: true });
        Cookies.remove('jwt_token');
        localStorage.removeItem('jwt_token'); // If used
        Cookies.set('jwt_token', newToken, { expires: 7, secure: true, sameSite: 'Lax' });
        router.push(`/dashboard/store/${newToken}`);
      } else {
        setMessage(`Error: ${data.message || 'Something went wrong'}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('Error updating store');
    } finally {
      setSubmitting(false);
    }
  };
  if (loading || !formData) return <p>Loading...</p>;
  if (!authorized) return <p>Unauthorized</p>;

  
  return (

    <div className="max-w-4xl mx-auto p-6 space-y-8">

    {/* Banner Upload */}
    <div className="mt-6">
      <div
        onClick={() => document.getElementById("banner-upload").click()}
        className="relative bg-[#F8E1D3] h-64 rounded-2xl overflow-hidden cursor-pointer transition-shadow hover:shadow-xl"
      >
        {formData?.banner ? (
          <div className="relative w-full h-full">
            <Image
              src={formData.banner}
              alt="Banner"
              fill
              style={{ objectFit: "cover" }}
              priority
              onError={() => console.log("Image load error")}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-600 text-lg font-medium">
            Upload Banner
          </div>
        )}
  
        <div className="absolute inset-0 bg-black/20 hover:bg-black/30 transition rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100">
          <p className="text-white font-medium text-lg">Click to change banner</p>
        </div>
      </div>
  
      <input
        id="banner-upload"
        type="file"
        accept="image/*"
        // onChange={handleChange}
        className="hidden"
      />
    </div>
  
    {/* Store Name */}
    <div>
      <label className="block font-semibold text-gray-700 mb-1">Store Name</label>
      <input
        name="store_name"
        value={formData.store_name}
        onChange={handleChange}
        className="w-full border border-[#B55031] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B55031]"
      />
    </div>
  
    {/* Bio */}
    <div>
      <label className="block font-semibold text-gray-700 mb-1">Bio</label>
      <textarea
        name="store_bio"
        value={formData.store_bio}
        onChange={handleChange}
        className="w-full border border-[#B55031] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B55031]"
        rows={4}
      />
    </div>
  
    {/* Phone */}
    <div>
      <label className="block font-semibold text-gray-700 mb-1">Phone</label>
      <input
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        className="w-full border border-[#B55031] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B55031]"
      />
    </div>
  
    {/* Location */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {['address_1', 'city', 'state', 'zip', 'country'].map((field) => (
        <div key={field}>
          <label className="block font-semibold text-gray-700 mb-1 capitalize">
            {field.replace('_', ' ')}
          </label>
          <input
            name={`location.${field}`}
            value={formData.location[field]}
            onChange={handleChange}
            className="w-full border border-[#B55031] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B55031]"
          />
        </div>
      ))}
    </div>
  
    {/* Categories */}
    <div>
      <label className="block font-semibold text-gray-700 mb-1">Categories</label>
      <input
        name="store_categories"
        value={formData.store_categories.join(', ')}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            store_categories: e.target.value.split(',').map((cat) => cat.trim()),
          }))
        }
        className="w-full border border-[#B55031] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B55031]"
      />
    </div>
  
    {/* Dietary Options */}
    <div>
      <label className="block font-semibold text-gray-700 mb-1">Dietary Options</label>
      <input
        name="dietary_options"
        value={formData.dietary_options.join(', ')}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            dietary_options: e.target.value.split(',').map((d) => d.trim()),
          }))
        }
        className="w-full border border-[#B55031] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B55031]"
      />
    </div>

    {/* Shipping Options */}
      <div>
        <label className="block font-semibold text-gray-700 mb-1">Shipping Options</label>
        <input
          name="shipping_options"
          value={formData.shipping_options?.join(', ') || ''}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              shipping_options: e.target.value.split(',').map((d) => d.trim()),
            }))
          }
          className="w-full border border-[#B55031] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B55031]"
        />
      </div>


      {/* Licensing and Certification */}
      <div>
        <label className="block font-semibold text-gray-700 mb-1">Licensing and Certification</label>
        <div className="space-y-2 mt-2">
          {[
            'Commercially Licensed Business',
            'Cottage Food Licensed Business',
            'Working on obtaining required licenses',
          ].map((option) => (
            <label key={option} className="flex items-center space-x-2">
              <input
                type="radio"
                name="licensing_certification"
                value={option}
                checked={formData.licensing_certification === option}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    licensing_certification: e.target.value,
                  }))
                }
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Catalog Mode */}
      <div>
        <label className="block font-semibold text-gray-700 mb-1">Catalog Mode Settings</label>
        <div className="space-y-2 mt-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.catalog_mode?.hide_add_to_cart_button === 'on'}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  catalog_mode: {
                    ...prev.catalog_mode,
                    hide_add_to_cart_button: e.target.checked ? 'on' : 'off',
                  },
                }))
              }
            />
            <span>Hide Add to Cart Button</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.catalog_mode?.hide_product_price === 'on'}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  catalog_mode: {
                    ...prev.catalog_mode,
                    hide_product_price: e.target.checked ? 'on' : 'off',
                  },
                }))
              }
            />
            <span>Hide Product Price</span>
          </label>
        </div>
      </div>

      {/* Support Button Settings */}
      <div className="mt-6">
        <label className="block font-semibold text-gray-700 mb-1">Support Button Settings</label>
        <div className="space-y-2 mt-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.show_support_btn === 'yes'}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  show_support_btn: e.target.checked ? 'yes' : 'no',
                }))
              }
            />
            <span>Enable Support Button on Store</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.show_support_btn_product === 'yes'}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  show_support_btn_product: e.target.checked ? 'yes' : 'no',
                }))
              }
            />
            <span>Enable Support Button on Product Page</span>
          </label>
        </div>
      </div>



  
    {/* Cancellation Policy */}
    <div>
      <label className="block font-semibold text-gray-700 text-lg mb-2">Cancellation Policy</label>
      {Object.entries(formData.cancellation_policy).map(([key, value]) => (
        <div key={key} className="mb-3">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            {key.replace(/_/g, ' ')}
          </label>
          <input
            value={value}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                cancellation_policy: {
                  ...prev.cancellation_policy,
                  [key]: e.target.value,
                },
              }))
            }
            className="w-full border border-[#B55031] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B55031]"
          />
        </div>
      ))}
    </div>
  
    {/* Submit Button */}
    <div>
      <button
        onClick={handleUpdate}
        disabled={submitting}
        className="w-full sm:w-auto px-6 py-3 bg-[#B55031] text-white font-semibold rounded-lg hover:bg-[#9c3f25] transition disabled:opacity-50"
      >
        {submitting ? 'Updating...' : 'Update Profile'}
      </button>
      {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
    </div>
  </div>
  
  );

}

