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
import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { XMarkIcon, CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
// In your main entry or _app.js
import 'leaflet/dist/leaflet.css';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import dynamic from 'next/dynamic';

const VendorMap = dynamic(() => import('@/components/VendorMap'), {
  ssr: false,
});

const categoryOptions = [
  "Cake Loaf",
  "Cake Pops",
  "Cakes",
  "Chocolate",
  "Cookies",
  "Cupcakes",
  "Pastries",
  "Pies",
  "Uncategorized",
];


const username = 'ck_5a5e3dfae960c8a4951168b46708c37d50bee800';
const appPassword = 'cs_8d6853d98d8b75ddaae2da242987122f38504e7f';
const base64Creds = btoa(`${username}:${appPassword}`);



const handleBannerUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    const res = await fetch("https://woocommerce-1355247-4989037.cloudwaysapps.com/wp-json/wp/v2/media", {
      method: "POST",
      headers: {
         Authorization: `Basic ${base64Creds}`,
        // Don't set Content-Type manually! Let browser handle it for multipart
      },
      body: formDataUpload,
    });

    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();
    const imageUrl = data.source_url;
    console.log("Uploaded banner URL:", imageUrl); // ✅ See what WordPress returns
    // Update your formData with the banner image URL
    setFormData((prev) => ({
      ...prev,
      banner: imageUrl,
    }));
  } catch (err) {
    console.error("Error uploading banner:", err);
    alert("Banner upload failed.");
  }
};

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
        profile_picture: vendorInfo.profile_picture || '', // ✅ Add this line
        locations: [
          {
            ...vendorInfo.locations?.[0] || {
              address_1: '',
              address_2: '',
              city: '',
              state: '',
              zip: '',
              country: '',
            },
          },
        ],
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
  
    if (name.startsWith('locations.')) {
      const key = name.split('.')[1];
  
      setFormData((prev) => {
        const currentLocation = prev.locations?.[0] || {
          address_1: '',
          address_2: '',
          city: '',
          state: '',
          zip: '',
          country: '',
          name: 'Default',
        };
  
        return {
          ...prev,
          locations: [
            {
              ...currentLocation,
              [key]: value,
            },
          ],
        };
      });
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
        // const { location, cancellation_policy, ...restFormData } = formData;
        // Merge old and updated values
        const { cancellation_policy, ...restFormData } = formData;

        // const updatedVendorData = {
        //   ...vendorInfo,
        //   ...restFormData,
        //   locations: formData.locations, // 👈 Keep it clean and simple now
        //   cancellation_policy: {
        //     ...vendorInfo.cancellation_policy,
        //     ...cancellation_policy,
        //   },
        // };
        const updatedVendorData = {
          ...vendorInfo,
          ...restFormData,
          cancellation_policy: {
            ...vendorInfo.cancellation_policy,
            ...formData.cancellation_policy,
          },
        };
        
        // Explicitly overwrite locations
        // updatedVendorData.locations = [...formData.locations];
        updatedVendorData.locations = [
          {
            address_1: '',
            address_2: '',
            city: '',
            state: '',
            zip: '',
            country: '',
            name: 'Default',
            ...(formData.locations?.[0] || {}),
          },
        ];
        //updatedVendorData.locations[0].country = 'TEST_STATE_124';
      
        // 🔐 Re-encode JWT using jose
        const secret = 'wgziRFG/Mt3wmIv4K+BleKEPZxLXa0C7fc8KOLMnw3Watdi6XwNHojIk8egBnNxUVTZ5aVmTkCYGANtQIqEW9g==';
        const newToken = await createJWT(updatedVendorData, secret);
      
        // ✅ Store updated JWT in cookie
        Cookies.set('jwt_token', newToken, { expires: 7, secure: true });
        Cookies.remove('jwt_token');
        // localStorage.removeItem('jwt_token'); // If used
        // Cookies.set('jwt_token', newToken, { expires: 7, secure: true, sameSite: 'Lax' });
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

    <div className="max-w-4xl mx-auto p-6 space-y-8 border border-gray-300 shadow-sm">
    {/* Banner Upload */}
    <div className="mt-6 ml-8">
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
        onChange={handleBannerUpload}
        className="hidden"
      />
    </div>

    <div className='mt-6 flex items-start justify-between px-8'>

     {/* Store Name  and phone no*/}
      <div className="max-w-xs w-full ">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Store Name</label>
          <input
            name="store_name"
            value={formData.store_name}
            onChange={handleChange}
            className="w-full border-b border-[#B55031] px-1 py-1 focus:outline-none focus:ring-0 focus:border-b-2 focus:border-[#B55031] bg-transparent"
            placeholder="Enter store name"
          />
        </div>
        
        <div className='pt-8'>
          <label className="block font-semibold text-gray-700 mb-1">Phone</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border-b border-[#B55031] px-1 py-1 bg-transparent focus:outline-none focus:border-b-2 focus:border-[#B55031]"
          />
        </div>

      </div>

      {/* Profile Picture Upload */}
      
        <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 shadow-md cursor-pointer group">
          <div
            onClick={() => document.getElementById("profile-upload").click()}
            className="relative w-full h-full"
          >
            {formData?.profile_picture ? (
              <Image
                src={formData.profile_picture}
                alt="Profile"
                fill
                style={{ objectFit: "cover" }}
                className="rounded-full"
                onError={() => console.log("Profile image load error")}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-600 text-sm">
                Upload Profile
              </div>
            )}

            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <p className="text-white text-sm font-medium">Click to change</p>
            </div>
          </div>

          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            onChange={handleBannerUpload}
            className="hidden"
          />
        </div>

  </div>
    
    {/* Categories */}
    <div className="max-w-xs pl-8">
      <label className="block font-semibold text-gray-700 mb-1">Categories</label>
      <div className="relative">
        <Listbox
          value={formData.store_categories}
          onChange={(selected) =>
            setFormData((prev) => ({
              ...prev,
              store_categories: selected,
            }))
          }
          multiple
        >
          <div className="relative ">
          <Listbox.Button className="w-full px-1 py-1 text-left bg-transparent border-b border-[#B55031] focus:outline-none focus:border-b-2 focus:border-[#B55031]">
              <div className="flex flex-wrap gap-1">
                {formData.store_categories.map((cat) => (
                  <span
                    key={cat}
                    className="bg-[#B55031] text-white text-sm px-2 py-1 rounded flex items-center gap-1"
                  >
                    {cat}
                    <XMarkIcon
                      className="w-4 h-4 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData((prev) => ({
                          ...prev,
                          store_categories: prev.store_categories.filter((c) => c !== cat),
                        }));
                      }}
                    />
                  </span>
                ))}
              </div>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white border border-[#B55031] shadow-md focus:outline-none">
                {categoryOptions.map((option) => (
                  <Listbox.Option
                    key={option}
                    value={option}
                    className={({ active }) =>
                      `cursor-pointer select-none relative px-4 py-2 ${
                        active ? "bg-[#B55031] text-white" : "text-gray-900"
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                          {option}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 right-4 flex items-center pl-3 text-white">
                            <CheckIcon className="h-5 w-5" />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
        
      </div>
    </div>
  

    
    {/* Location */}
    {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {['address_1', 'city', 'state', 'zip', 'country'].map((field) => (
        <div key={field}>
          <label className="block font-semibold text-gray-700 mb-1 capitalize">
            {field.replace('_', ' ')}
          </label>
          <input
            name={`locations.${field}`} // 👈 Change here
            value={formData.locations?.[0]?.[field] || ''}
            onChange={handleChange}
            className="w-full border border-[#B55031] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B55031]"
          />
        </div>
         ))}
    </div> */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-8 pt-8">
      {['address_1', 'city', 'state', 'zip', 'country'].map((field) => (
        <div key={field}>
          <label className="block font-semibold text-gray-700 mb-1 capitalize">
            {field.replace('_', ' ')}
          </label>

          {field === 'state' ? (
            <select
              name={`locations.${field}`}
              value={formData.locations?.[0]?.[field] || ''}
              onChange={handleChange}
              className="w-full px-1 py-1 text-left bg-transparent border-b border-[#B55031] focus:outline-none focus:border-b-2 focus:border-[#B55031]"
            >
              <option value="">Select a State</option>
              {[
                ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'],
                ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'],
                ['DE', 'Delaware'], ['DC', 'District Of Columbia'], ['FL', 'Florida'],
                ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'],
                ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'],
                ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'],
                ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'],
                ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'],
                ['NE', 'Nebraska'], ['NV', 'Nevada'], ['NH', 'New Hampshire'],
                ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
                ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'],
                ['OK', 'Oklahoma'], ['OR', 'Oregon'], ['PA', 'Pennsylvania'],
                ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'],
                ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'],
                ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'],
                ['WI', 'Wisconsin'], ['WY', 'Wyoming'], ['AA', 'Armed Forces (AA)'],
                ['AE', 'Armed Forces (AE)'], ['AP', 'Armed Forces (AP)']
              ].map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          ) : field === 'country' ? (
            <select
              name={`locations.${field}`}
              value={formData.locations?.[0]?.[field] || ''}
              onChange={handleChange}
              className="w-full px-1 py-1 text-left bg-transparent border-b border-[#B55031] focus:outline-none focus:border-b-2 focus:border-[#B55031]"
            >
              <option value="">Select a Country</option>
              <option value="US">United States (US)</option>
            </select>
          ) : (
            <input
              name={`locations.${field}`}
              value={formData.locations?.[0]?.[field] || ''}
              onChange={handleChange}
              className="w-full px-1 py-1 text-left bg-transparent border-b border-[#B55031] focus:outline-none focus:border-b-2 focus:border-[#B55031]"
            />
          )}
        </div>
      ))}
    </div>







    {/* Map Location Display */}
    <div className='pl-8'>
      <p className="text-base text-gray-800">
        {[
          formData.locations?.[0]?.address_1,
          formData.locations?.[0]?.city,
          formData.locations?.[0]?.state,
          formData.locations?.[0]?.zip,
          formData.locations?.[0]?.country,
        ]
          .filter(Boolean)
          .join(', ')}
      </p>
      {/* map location */}
      <VendorMap lat={formData.map.lat} lng={formData.map.lng} />
    </div>
    
  
    {/* Dietary Options */}
    {/* <div>
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
    </div> */}
    <div className='pl-8'>
      <label className="block font-semibold text-gray-700 mb-1">Dietary Options</label>
      <div className="space-y-2 mt-2">
        {[
          { label: "Gluten Free", value: "gluten_free" },
          { label: "Sugar Free", value: "sugar_free" },
          { label: "Eggless", value: "eggless" },
          { label: "Nut Free", value: "nut_free" },
          { label: "Vegan", value: "vegan" },
        ].map((option) => (
          <label key={option.value} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.dietary_options.includes(option.value)}
              onChange={(e) => {
                setFormData((prev) => {
                  const updated = new Set(prev.dietary_options);
                  if (e.target.checked) {
                    updated.add(option.value);
                  } else {
                    updated.delete(option.value);
                  }
                  return {
                    ...prev,
                    dietary_options: Array.from(updated),
                  };
                });
              }}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>





    {/* Shipping Options */}
    <div className='pl-8'>
      <label className="block font-semibold text-gray-700 mb-1">Shipping Options Supported</label>
      <div className="space-y-2 mt-2">
        {[
          { label: "Local Pickup", value: "local_pickup" },
          { label: "Shipping Offered", value: "shipping_offered" },
        ].map((option) => (
          <label key={option.value} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.shipping_options?.includes(option.value)}
              onChange={(e) => {
                setFormData((prev) => {
                  const updated = new Set(prev.shipping_options || []);
                  if (e.target.checked) {
                    updated.add(option.value);
                  } else {
                    updated.delete(option.value);
                  }
                  return {
                    ...prev,
                    shipping_options: Array.from(updated),
                  };
                });
              }}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>



      {/* Licensing and Certification */}
      <div className='pl-8'>
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
      <div className='pl-8'>
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
      <div className="mt-6 pl-8">
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
    
    
    
    
    {/* Bio */}
    <div className='pl-8'>
      <label className="block font-semibold text-gray-700 mb-1">Bio</label>
      <textarea
        name="store_bio"
        value={formData.store_bio}
        onChange={handleChange}
        className="w-full border border-[#B55031] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B55031]"
        rows={4}
      />
    </div>
    {/* Cancellation Policy */}
    {/* <div>
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
    </div> */}
    <div className='pl-8'>
      <label className="block font-semibold text-gray-700 text-lg mb-2">Cancellation Policy</label>
      {Object.entries(formData.cancellation_policy).map(([key, value]) => (
        <div key={key} className="mb-3">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            {key.replace(/_/g, ' ')}
          </label>
          <select
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
            className="w-full px-1 py-1 text-left bg-transparent border-b border-[#B55031] focus:outline-none focus:border-b-2 focus:border-[#B55031]"            
           >
            <option value="100%">100% Refund</option>
            <option value="75%">75% Refund</option>
            <option value="50%">50% Refund</option>
            <option value="25%">25% Refund</option>
            <option value="0%">No Refund</option>
          </select>
        </div>
      ))}
    </div>


    {/* Submit Button */}
    <div className='pl-8 pr-8'>
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

