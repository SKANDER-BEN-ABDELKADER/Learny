import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Search, Filter, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../components/context/AuthContext";

const Categories = () => {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  const API_BASE = "http://localhost:3000";

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch many courses to derive categories
        const params = new URLSearchParams({ page: "1", limit: "1000" });
        const res = await fetch(`${API_BASE}/course?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        const courses = data?.data || [];
        const categoryMap = new Map();
        for (const c of courses) {
          const name = c.category || "Uncategorized";
          if (!categoryMap.has(name)) {
            categoryMap.set(name, { 
              id: name,
              title: name,
              description: `Explore courses in ${name}`,
              coursesCount: 0,
              sampleCourses: [],
            });
          }
          const entry = categoryMap.get(name);
          entry.coursesCount += 1;
          if (entry.sampleCourses.length < 3 && c.title) {
            entry.sampleCourses.push(c.title);
          }
        }
        setCategories(Array.from(categoryMap.values()).sort((a, b) => a.title.localeCompare(b.title)));
      } catch (e) {
        setError(e.message || 'Error loading categories');
      } finally {
        setLoading(false);
      }
    };
    fetchAllCourses();
  }, [token]);

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (category.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (category.sampleCourses || []).some(title => title.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Course Categories</h1>
          <p className="text-xl text-blue-100">Explore our wide range of learning categories</p>
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
                  Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Search categories or course titles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categories Grid */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {loading ? 'Loading...' : error ? 'Error' : `${filteredCategories.length} Categories Found`}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!loading && !error && filteredCategories.map((category) => (
                <Link to={`/courses?category=${encodeURIComponent(category.title)}`} key={category.id}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-gray-500" />
                            <span>{category.coursesCount} courses</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-2">Sample Courses:</div>
                          <div className="flex flex-wrap gap-2">
                            {(category.sampleCourses || []).map((title, index) => (
                              <Badge key={index} variant="secondary">{title}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {loading && (
                <div className="col-span-2 text-center py-8 text-gray-600">Loading categories...</div>
              )}
              {error && (
                <div className="col-span-2 text-center py-8 text-red-600">{error}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Categories; 