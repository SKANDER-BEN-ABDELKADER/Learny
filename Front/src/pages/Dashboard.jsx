import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { BookOpen, Clock, Award, Play, Download, Calendar, TrendingUp, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../components/context/AuthContext";
import { getImageUrl } from "../utils/imageUtils";
import api from "../services/api";

const Dashboard = () => {
  const { user: authUser, token } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "/placeholder.svg"
  });

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Populate profile from auth context
    if (authUser) {
      setProfile({
        name: `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim() || authUser.email || "User",
        email: authUser.email || "",
        avatar: getImageUrl(authUser.profilePicUrl) || "/placeholder.svg"
      });
    }
  }, [authUser]);

  useEffect(() => {
    // Fetch only courses the user is enrolled in
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await api.get('/course/me/enrolled');
        const data = res.data;
        // Backend can return paginated or plain list; normalize accordingly
        const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        const normalized = list.map((c) => {
          const totalLessons = Number(c.lessons || 0);
          const completedLessons = Number(c.completedLessons || 0);
          const progress = totalLessons > 0 ? Math.min(100, Math.round((completedLessons / totalLessons) * 100)) : Number(c.progress || 0);
          const thumbnail = c.thumbnailUrl ? getImageUrl(c.thumbnailUrl) : null;
          const image = thumbnail || c.videoUrl || "/placeholder.svg";
          return {
            id: c.id,
            title: c.title,
            instructor: c.instructor ? `${c.instructor.firstName || ""} ${c.instructor.lastName || ""}`.trim() : "Unknown",
            progress,
            totalLessons,
            completedLessons,
            duration: c.videoDuration || "",
            image,
            category: c.category || "",
            nextLesson: "",
            timeSpent: "",
            completed: progress === 100
          };
        });
        setCourses(normalized);
      } catch (e) {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const totalCourses = courses.length;
  const certificates = [];

  const stats = [
    {
      label: "Courses Enrolled",
      value: totalCourses,
      icon: BookOpen,
      color: "text-blue-600"
    },
    {
      label: "Hours Learned",
      value: 0,
      icon: Clock,
      color: "text-green-600"
    },
    {
      label: "Certificates",
      value: certificates.length,
      icon: Award,
      color: "text-purple-600"
    },
    {
      label: "Avg Progress",
      value: totalCourses > 0 ? `${Math.round(
        courses.reduce((acc, c) => acc + (c.progress || 0), 0) / totalCourses
      )}%` : "0%",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback>
                {(profile.name || "U").split(" ").map(s => s[0]).slice(0,2).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {profile.name || "Learner"}!</h1>
              <p className="text-gray-600">Continue your learning journey</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Link to="/courses">Browse More Courses</Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(loading ? [] : courses).map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <div className="flex">
                    {String(course.image || '').endsWith('.mp4') ? (
                      <video
                        src={course.image}
                        className="w-32 h-32 object-cover"
                        muted
                        loop
                        playsInline
                        onMouseEnter={e => e.currentTarget.play()}
                        onMouseLeave={e => e.currentTarget.pause()}
                      />
                    ) : (
                      <img 
                        src={course.image}
                        alt={course.title}
                        className="w-32 h-32 object-cover"
                        onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                      />
                    )}
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          {course.category}
                        </Badge>
                        {course.completed && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2">{course.title}</h3>
                      <p className="text-xs text-gray-600 mb-3">by {course.instructor}</p>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{course.progress}% Complete</span>
                          <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-600">
                          <div>Next: {course.nextLesson || '—'}</div>
                          <div>Time spent: {course.timeSpent || '—'}</div>
                        </div>
                        <Link to={`/course/${course.id}`}>
                          <Button size="sm" className="text-xs">
                            <Play className="w-3 h-3 mr-1" />
                            {course.completed ? "Review" : "Continue"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {(!loading && courses.length === 0) && (
                <Card>
                  <CardContent className="p-6 text-center text-gray-600">No courses yet.</CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {(loading ? [] : courses).map((course) => (
                      <div key={course.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{course.title}</h4>
                          <span className="text-sm text-gray-600">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="mb-2" />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{course.completedLessons} of {course.totalLessons} lessons completed</span>
                          <span>{course.timeSpent} spent</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="certificates">
            <div className="space-y-6">
              {certificates.map((cert) => (
                <Card key={cert.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                          <Award className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{cert.courseName}</h3>
                          <p className="text-gray-600">Instructor: {cert.instructor}</p>
                          <p className="text-sm text-gray-500">Completed: {cert.completedDate}</p>
                          <p className="text-xs text-gray-400">Certificate ID: {cert.certificateId}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button size="sm">
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest learning activities</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
