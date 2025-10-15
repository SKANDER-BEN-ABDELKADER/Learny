import * as React from "react";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/Signup.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NotFound from "./pages/NotFound.jsx";
import Courses from "./pages/Courses.jsx";
import Categories from "./pages/Categories.jsx";
import Instructors from "./pages/Instructors.jsx";
import InstructorDashboard from "./pages/InstructorDashboard";
import ProtectedRoute from './components/ProtectedRoutes.jsx';
import AdminDashboard from './pages/AdminDashboard';
import InstructorProfile from './pages/InstructorProfile';
import Chatbot from './pages/ChatbotPage.jsx';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
        <Routes>
          {/* Public routes: */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* students routes: */}      
          
          {/* <Route element={<StudentRoute />}> */}
          <Route path="/courses" element={<Courses />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/instructors" element={<Instructors />} />
          {/* </Route> */}

          {/* instructor routes: */}
          {/* <Route element={<InstructorRoute />}> */}
          <Route path="/instructor-dashboard" element={<InstructorDashboard />}  />
          <Route path="/instructor/profile" element={<InstructorProfile />} />

          {/* </Route> */}

          {/* Admin routes: */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* Chatbot route */}
          <Route path="/chatbot" element={<Chatbot />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
