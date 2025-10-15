import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Star, Users, Clock, Search, Filter } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../components/context/AuthContext";

const API_BASE = "http://localhost:3000";

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [instructorSearch, setInstructorSearch] = useState("");
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('category') || 'all';
  });
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const [availableCategories, setAvailableCategories] = useState([]);

  const limit = 3;

  // (Category is initialized from URL on first render)

  // Load categories dynamically from backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const params = new URLSearchParams({ page: "1", limit: "1000" });
        const res = await fetch(`${API_BASE}/course?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load categories');
        const data = await res.json();
        const list = Array.from(new Set((data?.data || []).map(c => c.category).filter(Boolean))).sort();
        setAvailableCategories(list);
      } catch (e) {
        setAvailableCategories([]);
      }
    };
    loadCategories();
  }, [token]);

  const levels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
  const priceRanges = [
    { label: "Free", value: "free" },
    { label: "Under $50", value: "under50" },
    { label: "$50 - $100", value: "50to100" },
    { label: "Above $100", value: "above100" }
  ];

  // Fetch courses from backend
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);
    if (selectedCategory !== "all") params.append("category", selectedCategory);
    if (selectedLevel !== "all") params.append("level", selectedLevel);
    if (searchTerm) params.append("search", searchTerm);
    if (instructorSearch) params.append("instructor", instructorSearch);
    // Price filter
    if (selectedPrice === "free") {
      params.append("priceMax", "0");
    } else if (selectedPrice === "under50") {
      params.append("priceMax", "49.99");
    } else if (selectedPrice === "50to100") {
      params.append("priceMin", "50");
      params.append("priceMax", "100");
    } else if (selectedPrice === "above100") {
      params.append("priceMin", "100.01");
    }
    fetch(`${API_BASE}/course?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
    })
      .then(res => res.json())
      .then(data => {
        setCourses(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setLoading(false);
      })

      .catch(() => setLoading(false));
  }, [page, selectedCategory, selectedLevel, selectedPrice, searchTerm, instructorSearch]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setInstructorSearch("");
    setSelectedCategory("all");
    setSelectedLevel("all");
    setSelectedPrice("all");
    setPage(1);
  };

  const API_BASE = "http://localhost:3000"; 
  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return "";
    const total = Math.floor(seconds);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const two = (n) => String(n).padStart(2, '0');
    return h > 0 ? `${h}:${two(m)}:${two(s)}` : `${m}:${two(s)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">All Courses</h1>
          <p className="text-xl text-blue-100">Discover courses from expert instructors</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Search Courses</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                      className="pl-10"
                    />
                  </div>
                </div>
                {/* Instructor Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Search by Instructor</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Search by instructor name..."
                      value={instructorSearch}
                      onChange={(e) => { setInstructorSearch(e.target.value); setPage(1); }}
                      className="pl-10"
                    />
                  </div>
                </div>
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={v => { setSelectedCategory(v); setPage(1); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {availableCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Level Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Level</label>
                  <Select value={selectedLevel} onValueChange={v => { setSelectedLevel(v); setPage(1); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {levels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Price Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Price</label>
                  <Select value={selectedPrice} onValueChange={v => { setSelectedPrice(v); setPage(1); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Prices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      {priceRanges.map(range => (
                        <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleClearFilters} className="w-full mt-2">Clear Filters</Button>
              </CardContent>
            </Card>
          </div>
          {/* Course Grid */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {loading ? 'Loading...' : `${total} Courses Found`}
              </h2>
              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                <Button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
                <span>Page {page} of {totalPages}</span>
                <Button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses && courses.length > 0 && courses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
<div className="relative">
  {courses && course.videoUrl ? (
    <video
      className="w-full h-48 object-cover rounded"
      src={course.videoUrl}
      controls={false}
      autoPlay={false}
      muted
      preload="metadata"
      // Optionally, you can add a poster if you have a thumbnail
      // poster={course.image}
      onLoadedData={e => e.target.pause()}
    />
  ) : (
    <img
      src="/placeholder.svg"
      alt={course.title}
      className="w-full h-48 object-cover rounded"
    />
  )}
  <Badge className="absolute top-3 left-3 bg-white text-blue-600">{course.category}</Badge>
  <Badge variant="secondary" className="absolute top-3 right-3">{course.level}</Badge>
</div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
                    <CardDescription className="text-gray-600">by {course.instructor ? `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() || "Unknown" : "Unknown"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-sm">{course.rating || "-"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 text-sm">
                        <Users className="w-4 h-4" />
                        <span>{course.students?.toLocaleString?.() || "-"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(course.duration) || "-"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-green-600">${course.price}</span>
                      {course.originalPrice && <span className="text-gray-500 line-through">${course.originalPrice}</span>}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link to={`/course/${course.id}`} className="w-full">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        View Course
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
            {(!courses || courses.length === 0) && !loading && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                <Button onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Courses;
