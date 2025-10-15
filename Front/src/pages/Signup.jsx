import * as React from "react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Checkbox } from "../components/ui/checkbox";
import { Book, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    agreeToTerms: false,
    subscribeNewsletter: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber
        })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Registration failed");
      }
      setSuccess("Registration successful! Redirecting to dashboard...");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    "Access to 500+ premium courses",
    "Learn from industry experts",
    "Downloadable certificates",
    "Lifetime access to purchased courses",
    "Mobile learning app"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Book className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LearnHub
            </span>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Join and start learning today!</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              <div className="flex gap-2">
                <div className="w-1/2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="w-1/2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="">
                <div className="">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-1/2 relative">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <span
                    className="absolute right-3 top-8 cursor-pointer"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </span>
                </div>
                <div className="w-1/2 relative">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <span
                    className="absolute right-3 top-8 cursor-pointer"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600" disabled={loading}>
                {loading ? "Signing Up..." : "Sign Up"}
              </Button>
              <Separator />
              <div className="text-sm text-center">
                Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Log In</Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        {/* Benefits List */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Why join LearnHub?</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {benefits.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Signup;
