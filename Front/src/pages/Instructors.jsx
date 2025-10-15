import * as React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Search, Filter, Users, BookOpen, Star } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../components/context/AuthContext";
import { getProfilePicUrl } from "../utils/imageUtils";

// Options will be derived from fetched instructors' domains

const Instructors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("all");
  const [instructors, setInstructors] = useState([]);
  const [availableExpertise, setAvailableExpertise] = useState([]);
  const [courseCounts, setCourseCounts] = useState({});
  const { token } = useAuth();

  useEffect(() => {
    fetch("http://localhost:3000/user?role=INSTRUCTOR", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setInstructors(data || []))
      .catch(() => setInstructors([]));
  }, [token]);

  // Derive available expertise (domains) from fetched instructors
  useEffect(() => {
    const domains = Array.from(new Set((instructors || [])
      .map(i => i.domain)
      .filter(Boolean)))
      .sort((a, b) => String(a).localeCompare(String(b)));
    // If no domains exist, fall back to experience levels to avoid empty dropdown
    if (domains.length > 0) {
      setAvailableExpertise(domains);
    } else {
      const levels = Array.from(new Set((instructors || [])
        .map(i => i.experienceLvl)
        .filter(Boolean)))
        .sort((a, b) => String(a).localeCompare(String(b)));
      setAvailableExpertise(levels);
    }
  }, [instructors]);

  // Fetch accurate course counts per instructor
  useEffect(() => {
    const fetchCounts = async () => {
      if (!instructors || instructors.length === 0) {
        setCourseCounts({});
        return;
      }
      try {
        const results = await Promise.all(
          instructors.map(async (inst) => {
            try {
              const res = await fetch(`http://localhost:3000/course/instructor/${inst.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (!res.ok) throw new Error('failed');
              const courses = await res.json();
              return [inst.id, Array.isArray(courses) ? courses.length : 0];
            } catch {
              return [inst.id, inst?.coursesCreated?.length || 0];
            }
          })
        );
        const map = Object.fromEntries(results);
        setCourseCounts(map);
      } catch {
        // fallback to existing lengths
        const map = Object.fromEntries(
          instructors.map((i) => [i.id, i?.coursesCreated?.length || 0])
        );
        setCourseCounts(map);
      }
    };
    fetchCounts();
  }, [instructors, token]);

  const filteredInstructors = instructors.filter((instructor) => {
    const name = `${instructor.firstName} ${instructor.lastName}`;
    const expertise = instructor.domain || instructor.experienceLvl || "";
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expertise && expertise.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesExpertise =
      selectedExpertise === "all" ||
      (expertise && expertise === selectedExpertise);
    return matchesSearch && matchesExpertise;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Our Instructors</h1>
          <p className="text-xl text-blue-100">Meet our expert instructors and mentors</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" /> Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Search instructors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                {/* Expertise Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Expertise</label>
                  <Select value={selectedExpertise} onValueChange={setSelectedExpertise}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Expertise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Expertise</SelectItem>
                      {availableExpertise.map((exp) => (
                        <SelectItem key={exp} value={exp}>{exp}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Instructors Grid */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {filteredInstructors.length} Instructors Found
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredInstructors.map((instructor) => (
                <Card key={instructor.id} className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <img
                      src={getProfilePicUrl(instructor.profilePicUrl)}
                      alt={`${instructor.firstName} ${instructor.lastName}`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg";
                      }}
                    />
                    <div>
                      <CardTitle className="text-xl mb-1">{instructor.firstName} {instructor.lastName}</CardTitle>
                      <CardDescription>{instructor.domain || instructor.experienceLvl || "No bio available"}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {instructor.domain && <Badge variant="secondary">{instructor.domain}</Badge>}
                      {instructor.experienceLvl && <Badge variant="secondary">{instructor.experienceLvl}</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{courseCounts[instructor.id] ?? (instructor.coursesCreated?.length || 0)} courses</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{instructor.coursesEnrolled?.length || 0} students</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Instructors; 