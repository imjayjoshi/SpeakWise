import React from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Mic, LogOut } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const DashboardNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      await axios.get("/api/auth/user/logout", {
        withCredentials: true,
      });

      // Clear local storage
      localStorage.removeItem("user");

      toast.success("Logged out successfully!");

      // Redirect to login
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);

      // Even if backend call fails, clear local storage and redirect
      localStorage.removeItem("user");
      navigate("/login");

      toast.error("Logout completed (with errors)");
    }
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-primary">SpeakWise</h1>
          </Link>

          {/* Nav Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link to="/progress">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                Progress
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              Profile
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;