import { Routes, Route } from "react-router";
import LandingPage from "@/components/LandingPage";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Practice from "@/pages/Practice";
import Feedback from "@/pages/Feedback";
import Progress from "@/pages/ProgressPage";
import LevelPhrases from "@/pages/LevelPhrases";
import NotFound from "@/pages/NotFound";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminUserDetails from "@/pages/admin/AdminUserDetails";
import AdminPhrases from "@/pages/admin/AdminPhrases";
import AdminReports from "@/pages/admin/AdminReports";
import AdminSettings from "@/pages/admin/AdminSettings";
import UserProfile from "@/pages/UserProfile";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes with Navbar */}
      <Route
        path="/"
        element={
          <>
            <Navbar />
            <LandingPage />
            <Footer />
          </>
        }
      />

      {/* Auth Routes */}
      <Route path="/login" element={<Auth />} />
      <Route path="/signup" element={<Auth />} />

      {/* User Dashboard Routes - Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Level-wise Phrase Listing */}
      <Route
        path="/level/:level"
        element={
          <ProtectedRoute>
            <LevelPhrases />
          </ProtectedRoute>
        }
      />

      {/* Practice Routes - with optional phrase ID */}
      <Route
        path="/practice"
        element={
          <ProtectedRoute>
            <Practice />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice/:phraseId"
        element={
          <ProtectedRoute>
            <Practice />
          </ProtectedRoute>
        }
      />

      {/* Feedback Routes */}
      <Route
        path="/feedback"
        element={
          <ProtectedRoute>
            <Feedback />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback/:phraseId"
        element={
          <ProtectedRoute>
            <Feedback />
          </ProtectedRoute>
        }
      />

      {/* Progress Route */}
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <Progress />
          </ProtectedRoute>
        }
      />

      {/* User Profile Route */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes - Protected with Admin Layout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:id"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <AdminUserDetails />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/phrases"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <AdminPhrases />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <AdminReports />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
