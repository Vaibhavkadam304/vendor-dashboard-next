// using cookies for fetching data 
'use client';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';
import { useEffect, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import { SignJWT } from 'jose';
import Image from "next/image";

import { useParams, useRouter } from 'next/navigation';

const username = 'ck_5a5e3dfae960c8a4951168b46708c37d50bee800';
const appPassword = 'cs_8d6853d98d8b75ddaae2da242987122f38504e7f';
const base64Creds = btoa(`${username}:${appPassword}`);



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
          address_1: vendorInfo.location?.address_1 || '',
          city: vendorInfo.location?.city || '',
          state: vendorInfo.location?.state || '',
          zip: vendorInfo.location?.zip || '',
          country: vendorInfo.location?.country || '',
        },
        store_categories: vendorInfo.store_categories || [],
        dietary_options: vendorInfo.dietary_options || [],
        cancellation_policy: vendorInfo.cancellation_policy || {},
      });
    }
  }, [vendorInfo]);
 
  


  const handleChange = async (e) => {
    const { name, value, type, files } = e.target;
  
    if (type === 'file') {
      // Handle file input (banner image)
      const formDataObj = new FormData();
      formDataObj.append('file', files[0]);
      const res = await fetch('https://woocommerce-1355247-4989037.cloudwaysapps.com/wp-json/wp/v2/media', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${base64Creds}`, // use your WooCommerce creds
        },
        body: formDataObj,
      });
      const data = await res.json();
  
      // Once the image is uploaded, update the form data with the image URL
      if (data && data.source_url) {
        setFormData((prev) => ({
          ...prev,
          banner: data.source_url, // The URL of the uploaded banner image
        }));
      }
    } else {
      // Handle other regular form fields (like store name, bio, etc.)
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
        onChange={handleChange}
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

