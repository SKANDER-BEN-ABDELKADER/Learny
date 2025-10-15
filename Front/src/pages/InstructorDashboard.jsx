  import * as React from "react";
  import { useState, useEffect } from "react";
  import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
  import { Button } from "../components/ui/button";
  import { Input } from "../components/ui/input";
  import { Badge } from "../components/ui/badge";
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
  import { Textarea } from "../components/ui/textarea";
  import { Label } from "../components/ui/label";
  import Navbar from "../components/Navbar";
  import Footer from "../components/Footer";
  import { useAuth } from "../components/context/AuthContext";
  import { Link } from 'react-router-dom';
  import { toast } from 'sonner';

  const API_BASE = "http://localhost:3000"; // Adjust if needed

  const InstructorDashboard = () => {
    const { user, token } = useAuth();
    const instructorId = user?.id;
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
      const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [deleteCourse, setDeleteCourse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
      title: "",
      description: "",
      price: 0,
      category: "",
      level: "",
      videoFile: null,
      hided: false,
      learnText: "",
      requirementsText: "",
    });
    const [dragActive, setDragActive] = useState(false);

    const handleOpenAdd = () => {
      setForm({
        title: "",
        description: "",
        price: 0,
        category: "",
        level: "",
        videoFile: null,
        hided: false,
        learnText: "",
        requirementsText: "",
      });
      setShowAddModal(true);
    };

    const handleOpenEdit = (course) => {
      setEditCourse(course);
      setForm({ 
        ...course, 
        videoFile: null,
        learnText: Array.isArray(course.whatYouWillLearn) ? course.whatYouWillLearn.join('\n') : "",
        requirementsText: Array.isArray(course.requirements) ? course.requirements.join('\n') : "",
      });
      setShowEditModal(true);
    };

    const handleOpenDelete = (course) => {
      setDeleteCourse(course);
      setShowDeleteModal(true);
    };

    const handleChange = (e) => {
      const { name, value, type, checked, files } = e.target;
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
      }));
    };

    const handleVideoUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith('video/')) {
          setError('Please select a valid video file');
          return;
        }
        // Validate file size (max 100MB)
        if (file.size > 100 * 1024 * 1024) {
          setError('Video file size must be less than 100MB');
          return;
        }
        setForm(prev => ({
          ...prev,
          videoFile: file,
          videoUrl: ""
        }));
        setError(null);
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (!file.type.startsWith('video/')) {
          setError('Please select a valid video file');
          return;
        }
        if (file.size > 100 * 1024 * 1024) {
          setError('Video file size must be less than 100MB');
          return;
        }
        setForm(prev => ({ ...prev, videoFile: file, videoUrl: "" }));
        setError(null);
      }
    };

    // Fetch instructor's courses
    useEffect(() => {
      if (!instructorId) return;
      setLoading(true);
      fetch(`${API_BASE}/course/instructor/${instructorId}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch courses");
          return res.json();
        })
        .then(data => {
          setCourses(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }, [instructorId]);

    // Add course
    const handleAddCourse = async () => {
      try {
        setIsAdding(true);
        const toastId = toast.loading('Uploading video and analyzing content...');
        const formData = new FormData();
        
        // Add basic course data
        formData.append('title', form.title);
        formData.append('description', form.description);
        formData.append('price', String(form.price));
        formData.append('category', form.category);
        formData.append('level', form.level);
        formData.append('hided', String(form.hided));
        formData.append('instructorId', String(instructorId));
        
        // Add video data
        if (form.videoFile) {
          console.log('Adding video file:', form.videoFile.name, form.videoFile.size);
          formData.append('video', form.videoFile);
        } else if (form.videoUrl) {
          console.log('Adding video URL:', form.videoUrl);
          formData.append('videoUrl', form.videoUrl);
        }

        console.log('FormData entries:');
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }
        
        const res = await fetch(`${API_BASE}/course`, {
          method: "POST",
          body: formData,
          headers: {
            "Authorization": `Bearer ${token}`, 
          },
        });
       
        if (!res.ok) throw new Error("Failed to add course");
        const newCourse = await res.json();
        setCourses(prev => [...prev, newCourse]);
        setShowAddModal(false);
        toast.success('Course created successfully!', { id: toastId });
        setForm({
          title: "",
          description: "",
          price: 0,
          category: "",
          level: "",
          videoFile: null,
          hided: false,
        });
      } catch (err) {
        setError(err.message);
        toast.error(err.message || 'Failed to add course');
      } finally {
        setIsAdding(false);
      }
    };

    // Edit course
    const handleEditCourse = async () => {
      try {
        const toastId = toast.loading('Saving changes...');
        const formData = new FormData();
        
        // Add basic course data
        formData.append('title', form.title);
        formData.append('description', form.description);
        formData.append('price', String(form.price));
        formData.append('category', form.category);
        formData.append('level', form.level);
        formData.append('hided', String(form.hided));
        
        // Add video data
        if (form.videoFile) {
          console.log('Edit - Adding video file:', form.videoFile.name, form.videoFile.size);
          formData.append('video', form.videoFile);
        } else if (form.videoUrl) {
          formData.append('videoUrl', form.videoUrl);
        }

        // Add whatYouWillLearn and requirements from textareas (one per line)
        const learnItems = (form.learnText || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        const reqItems = (form.requirementsText || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        learnItems.forEach(item => formData.append('whatYouWillLearn', item));
        reqItems.forEach(item => formData.append('requirements', item));

        for (let [key, value] of formData.entries()) {
        }

        const res = await fetch(`${API_BASE}/course/${editCourse.id}`, {
          method: "PATCH",
          body: formData,
          headers: {
            "Authorization": `Bearer ${token}`, // Assuming you have a token for auth
          },
        });
        
        
        if (!res.ok) throw new Error("Failed to update course");
        const updated = await res.json();
        setCourses(prev => prev.map(c => (c.id === updated.id ? updated : c)));
        setShowEditModal(false);
        setEditCourse(null);
        toast.success('Course updated successfully!', { id: toastId });
      } catch (err) {
        setError(err.message);
        toast.error(err.message || 'Failed to update course');
      }
    };

    // Delete course
    const handleDeleteCourse = async () => {
      try {
        const res = await fetch(`${API_BASE}/course/${deleteCourse.id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        
        if (!res.ok) throw new Error("Failed to delete course");
        
        setCourses(prev => prev.filter(c => c.id !== deleteCourse.id));
        setShowDeleteModal(false);
        setDeleteCourse(null);
      } catch (err) {
        setError(err.message);
      }
    };

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Instructor Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.name}! Manage your courses below.</p>
            </div>
            <Button onClick={handleOpenAdd} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">Add Course</Button>
          </div>
            {loading ? (
            <div className="min-h-screen flex items-center justify-center">Loading...</div>
          ) : error ? (
            <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
<div className="relative">
  {course.videoUrl ? (
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
                    <CardDescription className="text-gray-600">{course.hided ? "Invisible to students" : "Visible to students"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-green-600">${course.price}</span>
                    </div>

                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button variant="outline" onClick={() => handleOpenEdit(course)} className="flex-1">Edit</Button>
                    <Button variant="destructive" onClick={() => handleOpenDelete(course)} className="flex-1">Delete</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
        {/* Add Course Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Add New Course</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* <div className="text-sm text-gray-600">Provide the basic details and upload a short intro video. We’ll analyze it to auto-fill learning outcomes and requirements.</div> */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column: fields */}
                <div className="space-y-4">
                  <div className="text-sm text-gray-500">Basic Information</div>
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium">Course Title</Label>
                    <Input name="title" id="title" placeholder="e.g. DevOps for Beginners" value={form.title} onChange={handleChange} />
                    <p className="text-xs text-gray-500 mt-1">Make it concise and descriptive.</p>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                    <Textarea name="description" id="description" placeholder="What is this course about? Who is it for?" value={form.description} onChange={handleChange} rows={4} />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Clear, benefit-led overview.</span>
                      <span>{(form.description || '').length}/500</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price" className="text-sm font-medium">Price ($)</Label>
                      <Input name="price" id="price" type="number" min="0" placeholder="0" value={form.price} onChange={handleChange} />
                      <p className="text-xs text-gray-500 mt-1">Set 0 for free.</p>
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                      <select name="category" id="category" value={form.category} onChange={handleChange} className="w-full border rounded p-2">
                        <option value="">Select category</option>
                        {["Web Development", "Frontend", "Data Science", "Mobile Development", "Design", "Backend", "DevOps", "Cybersecurity"].map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="level" className="text-sm font-medium">Level</Label>
                    <select name="level" id="level" value={form.level} onChange={handleChange} className="w-full border rounded p-2">
                      <option value="">Select level</option>
                      {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((lvl) => (
                        <option key={lvl} value={lvl}>{lvl.charAt(0) + lvl.slice(1).toLowerCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" name="hided" id="hided-add" checked={form.hided} onChange={handleChange} />
                    <Label htmlFor="hided-add" className="text-sm">Hide course from students</Label>
                  </div>
                </div>

                {/* Right column: video upload */}
                <div>
                  <div className="text-sm text-gray-500 mb-1">Intro Video</div>
                  <Label className="text-sm font-medium mb-2 block">Intro Video</Label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`rounded-lg border-2 ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'} p-6 text-center transition-colors`}
                  >
                    <div className="text-gray-600">
                      <div className="font-medium mb-1">Drag & drop your video here</div>
                      <div className="text-xs">or</div>
                    </div>
                    <div className="mt-3">
                      <label htmlFor="videoFile" className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 cursor-pointer">Choose file</label>
                      <input type="file" id="videoFile" className="hidden" accept="video/*" onChange={handleVideoUpload} />
                    </div>
                    <p className="text-xs text-gray-500 mt-3">MP4 or WebM up to 100MB</p>
                  </div>

                  {form.videoFile && (
                    <div className="mt-3 rounded-md border p-3 text-sm">
                      <div className="font-medium">Selected file</div>
                      <div className="text-gray-600 mt-1">
                        {form.videoFile.name} · {(form.videoFile.size / (1024 * 1024)).toFixed(1)} MB
                      </div>
                      <video className="w-full h-36 object-cover rounded mt-3" src={URL.createObjectURL(form.videoFile)} controls muted preload="metadata" onLoadedData={e => e.currentTarget.pause()} />
                    </div>
                  )}
                </div>
              </div>

              {isAdding && (
                <div className="relative">
                  <div className="absolute inset-0 rounded-lg bg-black/5" />
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></span>
                    Uploading video and analyzing content... This may take up to a minute.
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={isAdding}>Cancel</Button>
              <Button onClick={handleAddCourse} disabled={isAdding} className="relative">
                {isAdding && (
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                )}
                {isAdding ? 'Adding...' : 'Add Course'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Edit Course Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Edit Course</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column: fields */}
                <div className="space-y-4">
                  <div className="text-sm text-gray-500">Basic Information</div>
                  <div>
                    <Label htmlFor="title-edit" className="text-sm font-medium">Course Title</Label>
                    <Input name="title" id="title-edit" placeholder="e.g. DevOps for Beginners" value={form.title} onChange={handleChange} />
                  </div>
                  <div>
                    <Label htmlFor="description-edit" className="text-sm font-medium">Description</Label>
                    <Textarea name="description" id="description-edit" placeholder="Update the course description" value={form.description} onChange={handleChange} rows={4} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price-edit" className="text-sm font-medium">Price ($)</Label>
                      <Input name="price" id="price-edit" type="number" min="0" placeholder="0" value={form.price} onChange={handleChange} />
                    </div>
                    <div>
                      <Label htmlFor="category-edit" className="text-sm font-medium">Category</Label>
                      <select name="category" id="category-edit" value={form.category} onChange={handleChange} className="w-full border rounded p-2">
                        <option value={form.category || ''}>{form.category ? form.category : 'Select category'}</option>
                        {["Web Development", "Frontend", "Data Science", "Mobile Development", "Design", "Backend", "DevOps", "Cybersecurity"].map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="level-edit" className="text-sm font-medium">Level</Label>
                    <select name="level" id="level-edit" value={form.level} onChange={handleChange} className="w-full border rounded p-2">
                      <option value={form.level || ''}>{form.level ? form.level : 'Select level'}</option>
                      {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((lvl) => (
                        <option key={lvl} value={lvl}>{lvl.charAt(0) + lvl.slice(1).toLowerCase()}</option>
                      ))}
                    </select>
                  </div>

                  {/* Edit learning outcomes */}
                  <div>
                    <Label htmlFor="learn-edit" className="text-sm font-medium">What you’ll learn</Label>
                    <Textarea id="learn-edit" name="learnText" value={form.learnText} onChange={handleChange} rows={4} placeholder={`One item per line\nExample:\n- Understand CI/CD basics\n- Use Docker and Compose`} />
                    <p className="text-xs text-gray-500 mt-1">One item per line. Keep it actionable.</p>
                  </div>

                  {/* Edit requirements */}
                  <div>
                    <Label htmlFor="req-edit" className="text-sm font-medium">Requirements</Label>
                    <Textarea id="req-edit" name="requirementsText" value={form.requirementsText} onChange={handleChange} rows={3} placeholder={`One item per line\nExample:\n- Basic terminal usage\n- Git installed`} />
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" name="hided" id="hided-edit" checked={form.hided} onChange={handleChange} />
                    <Label htmlFor="hided-edit" className="text-sm">Hide course from students</Label>
                  </div>
                </div>

                {/* Right column: video */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Intro Video</Label>
                  <div className={`rounded-lg border-2 border-dashed border-gray-300 p-6 text-center`}>
                    <div className="text-gray-600">
                      <div className="font-medium mb-1">Upload a new video (optional)</div>
                    </div>
                    <div className="mt-3">
                      <label htmlFor="videoFile-edit" className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 cursor-pointer">Choose file</label>
                      <input type="file" id="videoFile-edit" className="hidden" accept="video/*" onChange={handleVideoUpload} />
                    </div>
                    <p className="text-xs text-gray-500 mt-3">MP4 or WebM up to 100MB</p>
                  </div>

                  {(form.videoFile || editCourse?.videoUrl) && (
                    <div className="mt-3 rounded-md border p-3 text-sm">
                      <div className="font-medium">{form.videoFile ? 'Selected file' : 'Current video'}</div>
                      {form.videoFile ? (
                        <div className="text-gray-600 mt-1">{form.videoFile.name} · {(form.videoFile.size / (1024 * 1024)).toFixed(1)} MB</div>
                      ) : null}
                      <video className="w-full h-36 object-cover rounded mt-3" src={form.videoFile ? URL.createObjectURL(form.videoFile) : editCourse?.videoUrl} controls muted preload="metadata" onLoadedData={e => e.currentTarget.pause()} />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)} disabled={isEditing}>Cancel</Button>
              <Button onClick={handleEditCourse} disabled={isEditing} className="relative">
                {isEditing && (
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                )}
                {isEditing ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Course Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Course</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete "{deleteCourse?.title}"? This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteCourse}>Delete Course</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Footer />
      </div>
    );
  };

  export default InstructorDashboard; 