import * as React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import { Star, Users, Clock, Play, Download, Award, CheckCircle, Calendar, Globe } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ReviewForm from "../components/ReviewForm";
import { useAuth } from "../components/context/AuthContext";
import { getImageUrl } from "../utils/imageUtils";
const CourseDetail = () => {
  const { id } = useParams();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const { token, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [videoDuration, setVideoDuration] = useState("");

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


    useEffect(() => {
        fetch(`${API_BASE}/course/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCourse(data);
        if (data && Array.isArray(data.students)) {
          const mine = user?.id && data.students.some(s => s.id === user.id);
          setIsEnrolled(!!mine);
        }
      })
      .catch((error) => {
        console.error("Error fetching course data:", error);
      });
  }, [id, token]);
  

  const handleEnroll = async () => {
    try {
      const res = await fetch(`${API_BASE}/course/${id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) {
        throw new Error('Failed to enroll');
      }
      const updated = await res.json();
      setCourse(updated);
      setIsEnrolled(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReviewSubmitted = () => {
    // Refresh course data to show the new review
    fetch(`${API_BASE}/course/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCourse(data);
      })
      .catch((error) => {
        console.error("Error fetching course data:", error);
      });
  };



  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-blue-100 text-blue-800">{course?.category}</Badge>
                <Badge className="bg-blue-100 text-blue-800">{course?.level}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course?.title}</h1>
              <p className="text-lg text-gray-600 mb-6">{course?.description}</p>
              
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${i < Math.floor(course?.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{course?.rating}</span>
                  <span className="text-gray-600">({course?.ratingCount || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="w-5 h-5" />
                  <span>{(course?.studentsCount ?? (course?.students?.length || 0)).toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>{videoDuration || course?.duration}</span>
                </div>
              </div>

              {course && (
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={getImageUrl(course.instructor?.profilePicUrl)} />
                    <AvatarFallback>{`${course.instructor?.firstName?.[0] || ''}${course.instructor?.lastName?.[0] || ''}`}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{course.instructor ? `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() : "Unknown"}</div>
                    <div className="text-sm text-gray-600">Instructor</div>
                  </div>
                </div>
              )}
            </div>

            {/* Course Video/Image */}
            <div className="relative mb-8 rounded-lg overflow-hidden">
                    {course && course.videoUrl && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                        </div>
                        <video 
                          className="w-full  object-cover rounded"
                          controls
                          preload="metadata"
                          onLoadedMetadata={(e) => setVideoDuration(formatDuration(e.currentTarget.duration))}
                        >
                          <source src={course.videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
            </div>

            {/* Course Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {/* <TabsTrigger value="curriculum">Curriculum</TabsTrigger> */}
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>What you'll learn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {course?.whatYouWillLearn?.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course?.requirements?.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum">
                <div className="space-y-4">
                  {course?.curriculum?.map((section, sectionIndex) => (
                    <Card key={sectionIndex}>
                      <CardHeader>
                        <CardTitle className="text-lg">{section.section}</CardTitle>
                        <CardDescription>{section.lessons.length} lessons</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {section.lessons.map((lesson, lessonIndex) => (
                            <div key={lessonIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  {lesson.type === 'video' && <Play className="w-4 h-4 text-blue-600" />}
                                  {lesson.type === 'resource' && <Download className="w-4 h-4 text-blue-600" />}
                                  {lesson.type === 'project' && <Award className="w-4 h-4 text-blue-600" />}
                                </div>
                                <div>
                                  <div className="font-medium">{lesson.title}</div>
                                  {lesson.duration !== "0:00" && (
                                    <div className="text-sm text-gray-600">{lesson.duration}</div>
                                  )}
                                </div>
                              </div>
                              {lesson.isPreview && (
                                <Badge variant="outline">Preview</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="instructor">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-6 mb-6">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={getImageUrl(course?.instructor?.profilePicUrl)} />
                        <AvatarFallback>{`${course?.instructor?.firstName?.[0] || ''}${course?.instructor?.lastName?.[0] || ''}`}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2">{course?.instructor ? `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() : "Unknown"}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
                          {/* <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{course?.instructor?.rating}</div>
                            <div className="text-sm text-gray-600">Rating</div>
                          </div> */}
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{course?.instructor?.students?.toLocaleString() || 0}</div>
                            <div className="text-sm text-gray-600">Students</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{course?.instructor?.courses || 0}</div>
                            <div className="text-sm text-gray-600">Courses</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <div className="space-y-6">
                  {/* Rating Form */}
                  <ReviewForm 
                    courseId={id} 
                    onReviewSubmitted={handleReviewSubmitted}
                  />
                  
                  {/* Ratings List */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Ratings ({course?.reviews?.length || 0})
                    </h3>
                    
                    {course?.reviews && course.reviews.length > 0 ? (
                      course.reviews.map((review) => (
                        <Card key={review.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <Avatar>
                                <AvatarImage src={review.avatar} />
                                <AvatarFallback>
                                  {review.user.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold">{review.user}</span>
                                  <span className="text-sm text-gray-600">
                                    {new Date(review.date).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center mb-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No ratings yet. Be the first to rate this course!</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-green-600 mb-2">${course?.price}</div>
                  {/* <div className="text-gray-500 line-through">${course?.originalPrice}</div> */}
                  {/* <Badge className="bg-red-100 text-red-800 mt-2">55% Off</Badge> */}
                </div>

                <Button 
                  className="w-full mb-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={handleEnroll}
                  disabled={isEnrolled}
                >
                  {isEnrolled ? "Enrolled" : "Enroll Now"}
                </Button>

                <Button variant="outline" className="w-full mb-6">
                  Add to Wishlist
                </Button>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Instructor:</span>
                    <span className="font-medium">{course?.instructor ? `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() : "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{videoDuration || course?.duration}</span>
                  </div>
                  {/* <div className="flex justify-between">
                    <span className="text-gray-600">Lessons:</span>
                    <span className="font-medium">{course?.lessons}</span>
                  </div> */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-medium">{course?.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Language:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      {course?.language}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {course?.updatedAt ? new Date(course.updatedAt).toISOString().slice(0, 10) : ''}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-3">This course includes:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-green-600" />
                      <span>{course?.duration} on-demand video</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-green-600" />
                      <span>Downloadable resources</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-green-600" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span>Lifetime access</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CourseDetail;
