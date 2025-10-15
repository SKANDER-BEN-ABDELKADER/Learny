import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { Menu, X,Waypoints, Search, User, ShoppingCart, Book, LogOut, LayoutDashboard, Upload } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showInstructorForm, setShowInstructorForm] = useState(false);
  const [instructorForm, setInstructorForm] = useState({ domaine: "", experience_lvl: "" });
  const [dashboardView, setDashboardView] = useState("student"); 
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const api = "http://localhost:3000"; 

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");  
    setIsLoggedIn(!!token);
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
    } else {
      setUser(null);
    }
  }, []);

  // Listen for login/logout changes in other tabs
  useEffect(() => {
    const handler = () => {
      const token = localStorage.getItem("access_token");
      const userData = localStorage.getItem("user");
      setIsLoggedIn(!!token);
      if (userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
      } else {
        setUser(null);
      }
    };
    // console.log(user.role, user.actualRole);
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

   useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    navigate("/");
    window.location.reload(); // To refresh UI state everywhere
  };

  // Show instructor form modal
  const handleBecomeInstructor = () => {
    setShowInstructorForm(true);
  };

  // Handle instructor form input
  const handleInstructorFormChange = (e) => {
    const { name, value } = e.target;
    setInstructorForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit instructor form
  const handleInstructorFormSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return alert("User ID not found");
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${api}/user/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          role: "INSTRUCTOR",
          actual_role: "INSTRUCTOR",
          domain: instructorForm.domaine,
          experienceLvl: instructorForm.experience_lvl,
        }),
      });
      if (!res.ok) throw new Error("Failed to update role in database");
      const updatedUser = await res.json();
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setShowInstructorForm(false);
      setDashboardView("instructor");
      navigate("/instructor-dashboard");
    } catch (err) {
      alert(err.message || "Error updating role");
    }
  };

  // Toggle dashboard view for instructors
  const handleDashboardToggle = (view) => {
    setDashboardView(view);
    if (view === "instructor") {
      navigate("/instructor-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const handleRoleToggle = async () => {
  // Early return if user can't toggle role
  if (user?.role !== "INSTRUCTOR" || !user?.id) {
    console.warn("User is not authorized to toggle roles");
    return;
  }

  // Determine new role
  const newActualRole = user.actual_role === "INSTRUCTOR" ? "STUDENT" : "INSTRUCTOR";
  
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${api}/user/${user.id}/toggle-role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // No body needed since the endpoint handles the toggle internally
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 
        `Failed to update role: ${response.status} ${response.statusText}`
      );
    }

    const updatedUser = await response.json();
    
    // Update state and storage
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    
    // Navigate to the appropriate dashboard view
    if (user.actual_role === "INSTRUCTOR") {
      navigate("/dashboard");
    } else {
      navigate("/instructor-dashboard");
    }
  } catch (err) {
    console.error("Role toggle error:", err);
    // Use a more user-friendly notification system
    alert(err.message || "An error occurred while changing roles");
  }
  // window.location.reload(); // Refresh UI state 
};

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Book className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LearnHub
            </span>
          </Link>

          {/* Desktop Navigation */}

          {(
            user?.actual_role === "STUDENT"
          ) ? (
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/courses" className="text-gray-700 hover:text-blue-600 transition-colors">
                Courses
              </Link>
              <Link to="/categories" className="text-gray-700 hover:text-blue-600 transition-colors">
                Categories
              </Link>
              <Link to="/instructors" className="text-gray-700 hover:text-blue-600 transition-colors">
                Instructors
              </Link>
              <Link to="/chatbot" className="text-gray-700 hover:text-blue-600 transition-colors">
                AI Assistant
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                About
              </Link>
            </div>
          ) 
          : (
            <div className="hidden md:flex items-center space-x-8">
              {/* <Link to="/instructor-dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
              <Link to="/instructor/profile" className="text-gray-700 hover:text-blue-600 transition-colors">
                Profile
              </Link> */}
            </div>
          )
          }

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-4 py-2 w-80">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search courses..."
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="w-5 h-5" />
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                2
              </Badge>
            </Button> */}


            {/* Auth/Profile Buttons */}
            {!isLoggedIn ? (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost">Log In</Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Single Role Button */}
                {user.role === "STUDENT" && user.actual_role   === "STUDENT" ? (
                  <Button variant="outline" size="sm" onClick={handleBecomeInstructor}>
                    Become Instructor
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleRoleToggle}>
                    {user.actual_role === "INSTRUCTOR" ? "Switch to Student" : "Switch to Instructor"}
                  </Button>
                )}
                {/* Profile Dropdown */}
<div className="relative" ref={dropdownRef}>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <Waypoints className="w-5 h-5" />
          <span className="hidden md:inline font-medium">
            {user?.firstName || user?.name || "Profile"}
          </span>
        </Button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
            <Link 
              to={user?.actual_role === "STUDENT" ? "/dashboard" : "/instructor-dashboard"}
              className="flex items-center px-4 py-2 hover:bg-gray-100"
              onClick={() => setDropdownOpen(false)}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
            </Link>
            <Link 
              to="/instructor/profile"
              className="flex items-center px-4 py-2 hover:bg-gray-100"
              onClick={() => setDropdownOpen(false)}
            >
              <User className="w-4 h-4 mr-2" /> Profile
            </Link> 
            <button 
              onClick={handleLogout} 
              className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-left"
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </button>
          </div>
        )}
      </div>
              </div>
            )}
            

            {/* Become Instructor Modal */}
            {showInstructorForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowInstructorForm(false)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h2 className="text-2xl font-bold mb-4">Become an Instructor</h2>
                  <form onSubmit={handleInstructorFormSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Domaine</label>
                      <input
                        name="domaine"
                        value={instructorForm.domaine}
                        onChange={handleInstructorFormChange}
                        className="w-full border rounded px-3 py-2"
                        required
                        placeholder="e.g. Web Development, Data Science"
                      />
                    </div>
        <div>
          <label className="block text-sm font-medium mb-1">Experience Level</label>
          <select
            name="experience_lvl"
            value={instructorForm.experience_lvl}
            onChange={handleInstructorFormChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select your level</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                      Submit
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white pb-4">
            <div className="flex flex-col space-y-4 pt-4">
              {/* Mobile Search */}
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 mx-2">
                <Search className="w-4 h-4 text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="bg-transparent outline-none w-full text-sm"
                />
              </div>

              {/* Navigation Links */}
              <Link to="/courses" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                Courses
              </Link>
              <Link to="/categories" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                Categories
              </Link>
              <Link to="/instructors" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                Instructors
              </Link>
              <Link to="/chatbot" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                AI Assistant
              </Link>
              <Link to="/about" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                About
              </Link>


              {/* Mobile Auth/Profile */}
              {!isLoggedIn ? (
                <div className="flex flex-col space-y-2 px-4 pt-4 border-t">
                  <Link to="/login">
                    <Button variant="outline" className="w-full">Log In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 px-4 pt-4">
                    <span className="font-medium">{user?.firstName || user?.name || "Profile"}</span>
                    {/* Single Role Button */}
                    {role === "student" && actualRole === "student" ? (
                      <Button variant="outline" size="sm" onClick={handleBecomeInstructor}>
                        Become Instructor
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={handleRoleToggle}>
                        {actualRole === "instructor" ? "Student" : "Instructor"}
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2 px-4 pt-2">
                    <Link to="/dashboard">
                      <Button variant="outline" className="w-full flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Button>
                    </Link>
                    <Button onClick={handleLogout} className="w-full flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Logout
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
