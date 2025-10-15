import * as React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Star, Play, Users, Clock, Award, CheckCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../components/context/AuthContext";


const features = [
  {
    icon: Star,
    title: 'Top-Rated Instructors',
    description: 'Learn from industry experts with years of experience.'
  },
  {
    icon: Play,
    title: 'Flexible Learning',
    description: 'Access courses anytime, anywhere, on any device.'
  },
  {
    icon: Award,
    title: 'Certified Courses',
    description: 'Earn certificates to showcase your new skills.'
  },
  {
    icon: CheckCircle,
    title: 'Career Growth',
    description: 'Boost your career with in-demand skills.'
  }
];

const Index = () => {
  const { user, token } = useAuth();
  const API_URL = "http://localhost:3000";
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token]);

  useEffect(() => {
    fetch(`${API_URL}/course?limit=3`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setCourses(data.data);
        setFeaturedCourses(data.data.map(course => ({
          id: course.id,
          title: course.title,
          image: course.imageUrl || '/default-course.jpg',
          category: course.category,
          level: course.level,
          instructor: course.instructor ? `${course.instructor.firstName} ${course.instructor.lastName}` : 'Unknown',
          rating: course.ratings && course.ratings.length > 0 ? (course.ratings.reduce((acc, r) => acc + r.value, 0) / course.ratings.length) : 0,
          students: course.students ? course.students.length : 0,
          duration: course.lessons ? `${course.lessons} lessons` : 'N/A',
          price: course.price,
          videoUrl: course.videoUrl,
        })));
      })
      .catch(() => setFeaturedCourses([]));
  }, [token]);



  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white py-20 px-4">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Master New Skills
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Transform Your Career
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Join thousands of students learning cutting-edge skills from industry experts. 
            Start your journey today with our comprehensive online courses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 text-lg">
              Start Learning Today
            </Button>
            <Button variant="outline" size="lg" className="border-white text-blue-700 px-8 py-3 text-lg">
              Browse Courses
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-blue-200">Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold">500+</div>
              <div className="text-blue-200">Courses</div>
            </div>
            <div>
              <div className="text-3xl font-bold">100+</div>
              <div className="text-blue-200">Instructors</div>
            </div>
            <div>
              <div className="text-3xl font-bold">95%</div>
              <div className="text-blue-200">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose Our Platform?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Featured Courses</h2>
            <Link to="/courses">
              <Button variant="outline">View All Courses</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
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
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="text-gray-600">by {course.instructor}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map((i) => (
                          <Star key={i} className={`w-4 h-4 ${i <= Math.round(course.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="font-semibold">{(course.rating || 0).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{course.students.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">${course.price}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to={`/course/${course.id}`} className="w-full">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Enroll Now
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {/* <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Our Students Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Learning Journey?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of students who have already transformed their careers with our courses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 px-8 py-3">
              Get Started Free
            </Button>
            <Button variant="outline" size="lg" className="bg-white text-blue-700 hover:bg-gray-100 px-8 py-3">
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
