import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { adminUserAPI } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Mail,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Loader2,
  User,
  Key,
  Save,
} from "lucide-react";

const AdminUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const response = await adminUserAPI.getUserDetails(id!);
      setUser(response.data.user);
      setStatistics(response.data.statistics);
      setEmail(response.data.user.email);
    } catch (error: any) {
      console.error("Error fetching user details:", error);
      toast.error(error?.response?.data?.message || "Failed to load user details");
      navigate("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (email === user.email) {
      toast.info("Email is the same as current");
      return;
    }

    try {
      setUpdating(true);
      await adminUserAPI.updateUser(id!, { email });
      toast.success("Email updated successfully!");
      fetchUserDetails();
    } catch (error: any) {
      console.error("Error updating email:", error);
      toast.error(error?.response?.data?.message || "Failed to update email");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setUpdating(true);
      await adminUserAPI.updateUserPassword(id!, newPassword);
      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error?.response?.data?.message || "Failed to update password");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/admin/users")}>
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Button>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">User not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/admin/users")}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h2 className="text-3xl font-bold text-foreground">{user.fullName}</h2>
          <p className="text-muted-foreground">User Details & Management</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">
                {statistics?.totalPractices || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">
                {statistics?.averageScore || 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{user.streak || 0} days</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Best Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <span className="text-2xl font-bold">
                {statistics?.bestScore || 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Basic details about the user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{user.fullName}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Join Date</p>
                <p className="font-medium">{formatDate(user.createdAt)}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Last Practice</p>
                <p className="font-medium">
                  {statistics?.recentPractices && statistics.recentPractices.length > 0
                    ? formatDate(statistics.recentPractices[0].createdAt)
                    : "Never"}
                </p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Role</p>
              <Badge variant="secondary">{user.role}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Learning Activity */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Learning Activity</CardTitle>
            <CardDescription>Performance overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Performance Metrics</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Pronunciation Accuracy</span>
                    <span className="font-medium">{statistics?.averageScore || 0}%</span>
                  </div>
                  <Progress value={statistics?.averageScore || 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Fluency</span>
                    <span className="font-medium">
                      {statistics?.averageFluency || 0}%
                    </span>
                  </div>
                  <Progress value={statistics?.averageFluency || 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Accuracy</span>
                    <span className="font-medium">
                      {statistics?.averageAccuracy || 0}%
                    </span>
                  </div>
                  <Progress value={statistics?.averageAccuracy || 0} className="h-2" />
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Language Level</p>
              <Badge variant="outline" className="capitalize">
                {user.languageLevel || "Not set"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions - Email & Password Update */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
          <CardDescription>
            Update user email or password (for users who contact admin)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Update Email */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Update Email Address</h3>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="email">New Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={updating}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleUpdateEmail}
                  disabled={updating || email === user.email}
                >
                  <Save className="w-4 h-4" />
                  Update Email
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Update Password */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Reset Password</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={updating}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={updating}
                />
              </div>
            </div>
            <Button
              onClick={handleUpdatePassword}
              disabled={updating || !newPassword || !confirmPassword}
              variant="action"
            >
              <Key className="w-4 h-4" />
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserDetails;
