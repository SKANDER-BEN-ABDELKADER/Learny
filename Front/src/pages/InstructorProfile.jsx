import React, { useEffect, useState, useContext } from 'react';
import { useAuth } from '../components/context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';


const experienceLevels = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

const API_BASE = "http://localhost:3000";

const InstructorProfile = () => {
  const { user, token } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    password: '',
    phoneNumber: '',
    domain: '',
    experienceLvl: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      axios.get(`${API_BASE}/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          setForm({
            firstName: res.data.firstName || '',
            lastName: res.data.lastName || '',
            password: '',
            phoneNumber: res.data.phoneNumber || '',
            domain: res.data.domain || '',
            experienceLvl: res.data.experienceLvl || '',
            profilePicUrl: res.data.profilePicUrl || '',
          });
          setProfilePicPreview(res.data.profilePicUrl ? `http://localhost:3000${res.data.profilePicUrl}` : 'http://localhost:3000/uploads/user icon.png');
        })
        .catch(() => setError('Failed to load profile'))
        .finally(() => setLoading(false));
    }
  }, [user, token]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file)); // Show preview immediately
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const updateData = { ...form };
      if (!updateData.password) delete updateData.password;
      let formData;
      if (profilePic) {
        formData = new FormData();
        Object.entries(updateData).forEach(([key, value]) => formData.append(key, value));
        formData.append('profilePic', profilePic);
      }
      await axios.patch(
        `${API_BASE}/user/${user.id}`,
        profilePic ? formData : updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(profilePic ? { 'Content-Type': 'multipart/form-data' } : {}),
          },
        }
      );
      setSuccess('Profile updated successfully!');
      setForm(f => ({ ...f, password: '' }));
      // Fetch updated user data and update localStorage and preview
      const res = await axios.get(`${API_BASE}/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.setItem('user', JSON.stringify(res.data));
      setProfilePicPreview(res.data.profilePicUrl ? `http://localhost:3000${res.data.profilePicUrl}` : 'http://localhost:3000/uploads/user icon.png');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
    <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-10">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Edit Profile</h2>
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-28 h-28 mb-2">
          <img
            src={profilePicPreview || 'http://localhost:3000/uploads/user icon.png'}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-blue-200 shadow"
          />
          <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer shadow-lg hover:bg-blue-700 transition">
            <input type="file" accept="image/*" className="hidden" onChange={handlePicChange} />
            <span className="text-xs">Edit</span>
          </label>
        </div>
      </div>
      {error && <div className="text-red-500 mb-2 text-center">{error}</div>}
      {success && <div className="text-green-500 mb-2 text-center">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-medium mb-1">First Name</label>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Password <span className="text-gray-400">(leave blank to keep unchanged)</span></label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Domain</label>
          <input
            type="text"
            name="domain"
            value={form.domain}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Experience Level</label>
          <select
            name="experienceLvl"
            value={form.experienceLvl}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select level</option>
            {experienceLevels.map(lvl => (
              <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold text-lg shadow"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
    <Footer />
    </div>
  );
};

export default InstructorProfile; 