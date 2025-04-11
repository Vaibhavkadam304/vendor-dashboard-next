'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

export default function StorePage() {
  const { authorized, vendorInfo, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const baseURL = 'https://woocommerce-1355247-4989037.cloudwaysapps.com';
  const username = 'ck_5a5e3dfae960c8a4951168b46708c37d50bee800';
  const appPassword = 'cs_8d6853d98d8b75ddaae2da242987122f38504e7f';
  const base64Creds = btoa(`${username}:${appPassword}`);

  useEffect(() => {
    const fetchVendorData = async () => {
      if (!vendorInfo?.id) return;

      try {
        const res = await fetch(`${baseURL}/wp-json/custom/v1/store/${vendorInfo.id}`, {
          headers: {
            Authorization: `Basic ${base64Creds}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setFormData({
            store_name: data.store_name || '',
            store_bio: data.store_bio || '',
            phone: data.phone || '',
            location: {
              address_1: data.address?.street_1 || '',
              city: data.address?.city || '',
              state: data.address?.state || '',
              zip: data.address?.zip || '',
              country: data.address?.country || '',
            },
            store_categories: data.store_categories || [],
            dietary_options: data.dietary_options || [],
            cancellation_policy: data.cancellation_policy || {},
          });
        } else {
          setMessage('Failed to load store data');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setMessage('Error fetching store info');
      }
    };

    fetchVendorData();
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
    } else if (name.includes('cancellation_policy.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        cancellation_policy: {
          ...prev.cancellation_policy,
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
      const res = await fetch(`${baseURL}/wp-json/custom/v1/store/${vendorInfo.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Basic ${base64Creds}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Store updated successfully!');
        window.location.reload();
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Store Profile</h1>

      <InputField label="Store Name" name="store_name" value={formData.store_name} onChange={handleChange} />
      <TextAreaField label="Bio" name="store_bio" value={formData.store_bio} onChange={handleChange} />
      <InputField label="Phone" name="phone" value={formData.phone} onChange={handleChange} />

      <div className="grid grid-cols-2 gap-4">
        {['address_1', 'city', 'state', 'zip', 'country'].map((field) => (
          <InputField
            key={field}
            label={field.replace('_', ' ')}
            name={`location.${field}`}
            value={formData.location[field]}
            onChange={handleChange}
          />
        ))}
      </div>

      <InputField
        label="Categories"
        name="store_categories"
        value={formData.store_categories.join(', ')}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            store_categories: e.target.value.split(',').map((cat) => cat.trim()),
          }))
        }
      />

      <InputField
        label="Dietary Options"
        name="dietary_options"
        value={formData.dietary_options.join(', ')}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            dietary_options: e.target.value.split(',').map((d) => d.trim()),
          }))
        }
      />

      {/* Cancellation Policy */}
      <div>
        <label className="block font-semibold">Cancellation Policy</label>
        {Object.entries(formData.cancellation_policy).map(([key, value]) => (
          <InputField
            key={key}
            label={key.replace(/_/g, ' ')}
            name={`cancellation_policy.${key}`}
            value={value}
            onChange={handleChange}
          />
        ))}
      </div>

      <button
        onClick={handleUpdate}
        disabled={submitting}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {submitting ? 'Updating...' : 'Update Profile'}
      </button>

      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}

function InputField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block font-semibold capitalize">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border px-3 py-2 rounded"
      />
    </div>
  );
}

function TextAreaField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block font-semibold capitalize">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border px-3 py-2 rounded"
      />
    </div>
  );
}


////using cookies for fetching data 
// 'use client';
// import { jwtDecode } from 'jwt-decode';
// import Cookies from 'js-cookie';
// import jwt from 'jsonwebtoken';
// import { useEffect, useState } from 'react';
// import useAuth from '@/hooks/useAuth';
// import { SignJWT } from 'jose';
// import { useParams, useRouter } from 'next/navigation';
// // inside your component:

// // Helper function to create JWT
// async function createJWT(payload, secret) {
//   const encoder = new TextEncoder();
//   const jwt = await new SignJWT(payload)
//     .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
//     .sign(encoder.encode(secret));
//   return jwt;
// }
// export default function StorePage() {
//   const { authorized, vendorInfo, loading } = useAuth();
//   const router = useRouter();
//   const [formData, setFormData] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [message, setMessage] = useState('');
//   const params = useParams(); // token from [token]
//   const token = params?.token;
 

//   useEffect(() => {
    
//     if (vendorInfo) {
//       setFormData({
//         store_name: vendorInfo.store_name || '',
//         store_bio: vendorInfo.store_bio || '',
//         phone: vendorInfo.phone || '',
//         location: {
//           address_1: vendorInfo.location?.address_1 || '',
//           city: vendorInfo.location?.city || '',
//           state: vendorInfo.location?.state || '',
//           zip: vendorInfo.location?.zip || '',
//           country: vendorInfo.location?.country || '',
//         },
//         store_categories: vendorInfo.store_categories || [],
//         dietary_options: vendorInfo.dietary_options || [],
//         cancellation_policy: vendorInfo.cancellation_policy || {},
//       });
//     }
//   }, [vendorInfo]);
 
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     if (name.includes('location.')) {
//       const key = name.split('.')[1];
//       setFormData((prev) => ({
//         ...prev,
//         location: {
//           ...prev.location,
//           [key]: value,
//         },
//       }));
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//     }
//   };
//   const handleUpdate = async () => {
//     if (!vendorInfo?.id) return;
//     setSubmitting(true);
//     setMessage('');
//     try {
//       const username = 'ck_5a5e3dfae960c8a4951168b46708c37d50bee800';
//       const appPassword = 'cs_8d6853d98d8b75ddaae2da242987122f38504e7f';
//       const base64Creds = btoa(`${username}:${appPassword}`);
//       const res = await fetch(
//         `https://woocommerce-1355247-4989037.cloudwaysapps.com/wp-json/custom/v1/update-store/${vendorInfo.id}`,
//         {
//           method: 'PUT',
//           headers: {
//             Authorization: `Basic ${base64Creds}`,
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(formData),
//         }
//       );
//       const data = await res.json();
//       // if (res.ok) {
//       //   setMessage('Store updated successfully!');
//       // } else {
//       //   setMessage(`Error: ${data.message || 'Something went wrong'}`);
//       // }
//       if (res.ok) {
//         setMessage('Store updated successfully!');
      
//         // Merge old and updated values
//         const updatedVendorData = {
//           ...vendorInfo,
//           ...formData,
//           location: {
//             ...vendorInfo.location,
//             ...formData.location,
//           },
//           cancellation_policy: {
//             ...vendorInfo.cancellation_policy,
//             ...formData.cancellation_policy,
//           },
//         };
      
//         // 🔐 Re-encode JWT using jose
//         const secret = 'wgziRFG/Mt3wmIv4K+BleKEPZxLXa0C7fc8KOLMnw3Watdi6XwNHojIk8egBnNxUVTZ5aVmTkCYGANtQIqEW9g==';
//         const newToken = await createJWT(updatedVendorData, secret);
      
//         // ✅ Store updated JWT in cookie
//         // Cookies.set('jwt_token', newToken, { expires: 7, secure: true });
//         // Cookies.remove('jwt_token');
//         // localStorage.removeItem('jwt_token'); // If used
//         Cookies.set('jwt_token', newToken, { expires: 7, secure: true, sameSite: 'Lax' });
//         router.replace(`/dashboard/store/${newToken}`);
//         // Reload to reflect updated info
//         window.location.reload();
//       } else {
//         setMessage(`Error: ${data.message || 'Something went wrong'}`);
//       }
       
     


       
//      ////////////////////////////////////////////////////
//     } catch (err) {
//       console.error(err);
//       setMessage('Error updating store');
//     } finally {
//       setSubmitting(false);
//     }
//   };
//   if (loading || !formData) return <p>Loading...</p>;
//   if (!authorized) return <p>Unauthorized</p>;
//   return (
//     <div className="max-w-4xl mx-auto p-6 space-y-6">
//       <h1 className="text-2xl font-bold">Edit Store Profile</h1>
//       {/* Store Name */}
//       <div>
//         <label className="block font-semibold">Store Name</label>
//         <input
//           name="store_name"
//           value={formData.store_name}
//           onChange={handleChange}
//           className="w-full border px-3 py-2 rounded"
//         />
//       </div>
//       {/* Store Bio */}
//       <div>
//         <label className="block font-semibold">Bio</label>
//         <textarea
//           name="store_bio"
//           value={formData.store_bio}
//           onChange={handleChange}
//           className="w-full border px-3 py-2 rounded"
//         />
//       </div>
//       {/* Phone */}
//       <div>
//         <label className="block font-semibold">Phone</label>
//         <input
//           name="phone"
//           value={formData.phone}
//           onChange={handleChange}
//           className="w-full border px-3 py-2 rounded"
//         />
//       </div>
//       {/* Location */}
//       <div className="grid grid-cols-2 gap-4">
//         {['address_1', 'city', 'state', 'zip', 'country'].map((field) => (
//           <div key={field}>
//             <label className="block font-semibold capitalize">{field.replace('_', ' ')}</label>
//             <input
//               name={`location.${field}`}
//               value={formData.location[field]}
//               onChange={handleChange}
//               className="w-full border px-3 py-2 rounded"
//             />
//           </div>
//         ))}
//       </div>
//       {/* Categories (comma separated for now) */}
//       <div>
//         <label className="block font-semibold">Categories</label>
//         <input
//           name="store_categories"
//           value={formData.store_categories.join(', ')}
//           onChange={(e) =>
//             setFormData((prev) => ({
//               ...prev,
//               store_categories: e.target.value.split(',').map((cat) => cat.trim()),
//             }))
//           }
//           className="w-full border px-3 py-2 rounded"
//         />
//       </div>
//       {/* Dietary Options (comma separated) */}
//       <div>
//         <label className="block font-semibold">Dietary Options</label>
//         <input
//           name="dietary_options"
//           value={formData.dietary_options.join(', ')}
//           onChange={(e) =>
//             setFormData((prev) => ({
//               ...prev,
//               dietary_options: e.target.value.split(',').map((d) => d.trim()),
//             }))
//           }
//           className="w-full border px-3 py-2 rounded"
//         />
//       </div>
//       {/* Cancellation Policy */}
//       <div>
//         <label className="block font-semibold">Cancellation Policy</label>
//         {Object.entries(formData.cancellation_policy).map(([key, value]) => (
//           <div key={key} className="mb-2">
//             <label className="block text-sm font-medium">{key.replace(/_/g, ' ')}</label>
//             <input
//               value={value}
//               onChange={(e) =>
//                 setFormData((prev) => ({
//                   ...prev,
//                   cancellation_policy: {
//                     ...prev.cancellation_policy,
//                     [key]: e.target.value,
//                   },
//                 }))
//               }
//               className="w-full border px-3 py-2 rounded"
//             />
//           </div>
//         ))}
//       </div>
//       <button
//         onClick={handleUpdate}
//         disabled={submitting}
//         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//       >
//         {submitting ? 'Updating...' : 'Update Profile'}
//       </button>
//       {message && <p className="mt-2 text-sm">{message}</p>}
//     </div>
//   );
// }
