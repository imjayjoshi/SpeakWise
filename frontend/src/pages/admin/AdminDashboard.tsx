import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { adminUserAPI } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, FileText, TrendingUp, Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardStats {
  users: {
    total: number;
    active: number;
    admins: number;
    recentSignups: number;
    activeToday: number;
  };
  phrases: {
    total: number;
    byLevel: Array<{ _id: string; count: number }>;
  };
  practices: {
    total: number;
    averageScore: number;
  };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(userStr);

    if (user.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const response = await adminUserAPI.getDashboardStats();
      setStats(response.data.statistics);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-lg text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12 text-lg text-muted-foreground">
        No data available
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.users.total.toString(),
      change: `+${stats.users.recentSignups} this week`,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Total Phrases",
      value: stats.phrases.total.toString(),
      change: "Available for practice",
      icon: FileText,
      color: "text-success",
    },
    {
      title: "Avg Pronunciation Score",
      value: `${stats.practices.averageScore}%`,
      change: "Overall average",
      icon: TrendingUp,
      color: "text-action",
    },
    {
      title: "Active Learners Today",
      value: stats.users.activeToday.toString(),
      change: `${stats.users.active} total active`,
      icon: Activity,
      color: "text-primary",
    },
  ];

  // Prepare data for charts
  const phrasesByLevelData = stats.phrases.byLevel.map((item) => ({
    level: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    count: item.count,
  }));

  // Mock performance data (you can enhance this with real data from backend)
  const performanceData = [
    { day: "Mon", score: stats.practices.averageScore - 10 },
    { day: "Tue", score: stats.practices.averageScore - 5 },
    { day: "Wed", score: stats.practices.averageScore },
    { day: "Thu", score: stats.practices.averageScore + 2 },
    { day: "Fri", score: stats.practices.averageScore + 5 },
    { day: "Sat", score: stats.practices.averageScore + 3 },
    { day: "Sun", score: stats.practices.averageScore + 7 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Dashboard Overview
          </h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with SpeakWise.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="shadow-card hover:shadow-soft transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Phrases by Level</CardTitle>
            <CardDescription>
              Distribution of phrases across difficulty levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={phrasesByLevelData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="level" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Average Pronunciation Score</CardTitle>
            <CardDescription>Weekly performance trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--action))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--action))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">User Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Users</span>
              <span className="font-semibold">{stats.users.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Users</span>
              <span className="font-semibold">{stats.users.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Admins</span>
              <span className="font-semibold">{stats.users.admins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">New This Week</span>
              <span className="font-semibold text-success">
                +{stats.users.recentSignups}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Practice Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Practices</span>
              <span className="font-semibold">{stats.practices.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Score</span>
              <span className="font-semibold text-action">
                {stats.practices.averageScore}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Today</span>
              <span className="font-semibold text-primary">
                {stats.users.activeToday}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Content Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Phrases</span>
              <span className="font-semibold">{stats.phrases.total}</span>
            </div>
            {stats.phrases.byLevel.map((level) => (
              <div key={level._id} className="flex justify-between">
                <span className="text-muted-foreground capitalize">
                  {level._id}
                </span>
                <span className="font-semibold">{level.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
