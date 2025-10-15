import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/context/AuthContext';

const TABS = [
  { key: 'students', label: 'Students' },
  { key: 'instructors', label: 'Instructors' },
  { key: 'courses', label: 'Courses' },
  { key: 'reviews', label: 'Reviews' },
];

const API_BASE = 'http://localhost:3000';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('students');
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch students
  useEffect(() => {
    if (activeTab !== 'students') return;
    setLoading(true);
    fetch(`${API_BASE}/user?role=STUDENT`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch students');
        return res.json();
      })
      .then(data => {
        setStudents(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [activeTab, token]);

  // Fetch instructors
  useEffect(() => {
    if (activeTab !== 'instructors') return;
    setLoading(true);
    fetch(`${API_BASE}/user?role=INSTRUCTOR`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch instructors');
        return res.json();
      })
      .then(data => {
        setInstructors(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [activeTab, token]);

  const handleEditUser = (userId) => {
    try {
      const formData = new FormData();
      formData.append('id', userId);
      formData.append('firstName', 'NewFirstName');
      formData.append('lastName', 'NewLastName');
      
      fetch(`${API_BASE}/user/${userId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to edit user');
          return res.json();
        })
        .then(data => {
          console.log('User edited successfully:', data);
          // Refresh the list
          if (activeTab === 'students') {
            setStudents(students.map(s => s.id === userId ? data : s));
          } else {
            setInstructors(instructors.map(i => i.id === userId ? data : i));
          }
        })
        .catch(err => {
          console.error('Error editing user:', err);
        });
    } catch (err) {
      console.error('Error in handleEditUser:', err);
    }
  };

  const handleDeleteUser = (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    fetch(`${API_BASE}/user/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete user');
        if (activeTab === 'students') {
          setStudents(students.filter(s => s.id !== userId));
        } else {
          setInstructors(instructors.filter(i => i.id !== userId));
        }
      })
      .catch(err => {
        setError(err.message);
      });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="flex space-x-4 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {activeTab === 'students' && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Students</h2>
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <table className="min-w-full border">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">ID</th>
                    <th className="border px-2 py-1">Name</th>
                    <th className="border px-2 py-1">Email</th>
                    <th className="border px-2 py-1">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id}>
                      <td className="border px-2 py-1">{student.id}</td>
                      <td className="border px-2 py-1">{student.firstName} {student.lastName}</td>
                      <td className="border px-2 py-1">{student.email}</td>
                      <td className="border px-2 py-1">
                        <button 
                          className="text-blue-600 hover:underline mr-2"
                          onClick={() => handleEditUser(student.id)}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-red-600 hover:underline"
                          onClick={() => handleDeleteUser(student.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {activeTab === 'instructors' && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Instructors</h2>
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <table className="min-w-full border">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">ID</th>
                    <th className="border px-2 py-1">Name</th>
                    <th className="border px-2 py-1">Email</th>
                    <th className="border px-2 py-1">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {instructors.map(instructor => (
                    <tr key={instructor.id}>
                      <td className="border px-2 py-1">{instructor.id}</td>
                      <td className="border px-2 py-1">{instructor.firstName} {instructor.lastName}</td>
                      <td className="border px-2 py-1">{instructor.email}</td>
                      <td className="border px-2 py-1">
                        <button 
                          className="text-blue-600 hover:underline mr-2"
                          onClick={() => handleEditUser(instructor.id)}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-red-600 hover:underline"
                          onClick={() => handleDeleteUser(instructor.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {activeTab === 'courses' && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Courses</h2>
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div>Courses management coming soon...</div>
            )}
          </div>
        )}
        {activeTab === 'reviews' && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Reviews</h2>
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div>Reviews management coming soon...</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}