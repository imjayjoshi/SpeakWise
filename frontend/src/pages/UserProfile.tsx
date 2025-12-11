import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { toast } from "sonner";
import { authAPI } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save, Key, User, Mail, Phone, Award, Flame, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserData {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  streak: number;
  badges: string[];
  role: string;
  languageLevel: string;
  createdAt: string;
}

const UserProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  
  // Profile form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [languageLevel, setLanguageLevel] = useState("beginner");
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await authAPI.getMe();
      const userData = response.data.user;
      setUser(userData);
      setFullName(userData.fullName);
      setPhone(userData.phone || "");
      setLanguageLevel(userData.languageLevel || "beginner");
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load profile data");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await authAPI.updateProfile({
        fullName,
        phone,
        languageLevel,
      });
      
      setUser(response.data.user);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      await authAPI.updatePassword({
        currentPassword,
        newPassword,
      });
      
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-muted-foreground">
        Loading your profile...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h2 className="text-3xl font-bold text-foreground">My Profile</h2>
          <p className="text-muted-foreground">
            Manage your personal information and account settings
          </p>
        </div>

        {/* Profile Overview */}
        <Card className="shadow-card mb-6">
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
                <Flame className="w-8 h-8 text-action" />
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold text-action">{user.streak} days</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg">
                <Award className="w-8 h-8 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Badges Earned</p>
                  <p className="text-2xl font-bold text-success">{user.badges.length}</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Your Badges</p>
              <div className="flex flex-wrap gap-2">
                {user.badges.map((badge, index) => (
                  <Badge key={index} variant="secondary">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card className="shadow-card mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="pl-10 bg-muted"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="languageLevel">Language Level</Label>
              <Select value={languageLevel} onValueChange={setLanguageLevel}>
                <SelectTrigger id="languageLevel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="action"
              onClick={handleSaveProfile}
              disabled={saving}
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <Button
              variant="default"
              onClick={handleSavePassword}
              disabled={saving || !currentPassword || !newPassword}
            >
              <Key className="w-4 h-4" />
              Update Password
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserProfile;
