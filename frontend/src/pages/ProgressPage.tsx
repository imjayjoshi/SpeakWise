import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  practiceHistoryAPI,
  authAPI,
  UserStatistics,
  PracticeHistory,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Award,
  TrendingUp,
  Target,
  Flame,
  Calendar,
  Trophy,
  Star,
  Zap,
  Clock,
  BookOpen,
  Mic,
  LogOut,
  Loader2,
  BarChart3,
  User,
} from "lucide-react";

const ProgressPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [recentPractices, setRecentPractices] = useState<PracticeHistory[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const userRes = await authAPI.getMe();
      setUser(userRes.data.user);

      const statsRes = await practiceHistoryAPI.getUserStatistics();
      setStatistics(statsRes.data.statistics);

      const historyRes = await practiceHistoryAPI.getPracticeHistory({
        limit: 10,
      });
      setRecentPractices(historyRes.data.practices || []);
    } catch (error) {
      console.error("Error fetching progress data:", error);
      toast.error("Failed to load progress data");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem("user");
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg text-muted-foreground mb-4">
          No progress data available
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Start practicing to see your progress!
        </p>
        <Button asChild>
          <Link to="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const getBadgeStyle = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-success/10 text-success border-success/20";
      case "intermediate":
        return "bg-action/10 text-action border-action/20";
      case "expert":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 80) return "text-primary";
    if (score >= 70) return "text-action";
    return "text-muted-foreground";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const completionPercentage = Math.round(
    (statistics.uniquePhrasesPracticed /
      (statistics.totalPhrasesAvailable || 1)) *
      100
  );

  const achievements = [
    {
      id: 1,
      name: "First Steps",
      description: "Completed your first practice",
      earned: statistics.totalPractices > 0,
      icon: <Star className="w-6 h-6" />,
      rarity: "common",
    },
    {
      id: 2,
      name: "Week Warrior",
      description: "7-day practice streak",
      earned: (user?.streak || 0) >= 7,
      icon: <Flame className="w-6 h-6" />,
      rarity: "uncommon",
    },
    {
      id: 3,
      name: "Pronunciation Pro",
      description: "Scored 90%+ at least once",
      earned: statistics.bestScore >= 90,
      icon: <Trophy className="w-6 h-6" />,
      rarity: "rare",
    },
    {
      id: 4,
      name: "Consistency King",
      description: "15-day practice streak",
      earned: (user?.streak || 0) >= 15,
      icon: <Calendar className="w-6 h-6" />,
      rarity: "epic",
    },
    {
      id: 5,
      name: "Perfect Score",
      description: "Achieved 100% accuracy",
      earned: statistics.bestScore >= 100,
      icon: <Trophy className="w-6 h-6" />,
      rarity: "legendary",
    },
    {
      id: 6,
      name: "Practice Master",
      description: "Completed 50+ practices",
      earned: statistics.totalPractices >= 50,
      icon: <Target className="w-6 h-6" />,
      rarity: "rare",
    },
  ];

  const getAchievementStyle = (rarity: string, earned: boolean) => {
    if (!earned) return "grayscale opacity-50";
    switch (rarity) {
      case "legendary":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg animate-pulse";
      case "epic":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg";
      case "rare":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md";
      case "uncommon":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-primary">SpeakWise</h1>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              
              {/* User Profile Display */}
              {user && (
                <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-secondary/50 rounded-lg">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground leading-none">
                      {user.fullName}
                    </p>
                  </div>
                </div>
              )}
              
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Your Progress
            </h1>
            <p className="text-muted-foreground">
              Track your pronunciation improvement journey
            </p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="shadow-card text-center hover:shadow-soft transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-action/10 rounded-lg mx-auto mb-2 sm:mb-3">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-action" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-action">
                {user?.streak || 0}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                Day Streak
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card text-center hover:shadow-soft transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-success/10 rounded-lg mx-auto mb-2 sm:mb-3">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-success">
                {statistics.uniquePhrasesPracticed}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                Phrases Mastered
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card text-center hover:shadow-soft transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg mx-auto mb-2 sm:mb-3">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-primary">
                {statistics.averageScore}%
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                Average Score
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card text-center hover:shadow-soft transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-secondary/50 rounded-lg mx-auto mb-2 sm:mb-3">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {statistics.bestScore}%
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                Best Score
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Overall Performance */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>
                  Your pronunciation quality breakdown
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Overall Progress
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {completionPercentage}%
                    </span>
                  </div>
                  <Progress value={completionPercentage} className="h-3" />
                  <p className="text-xs text-muted-foreground">
                    {statistics.uniquePhrasesPracticed} of{" "}
                    {statistics.totalPhrasesAvailable} phrases completed
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium">Accuracy</span>
                    </div>
                    <div className="text-2xl font-bold text-success">
                      {statistics.averageAccuracy}%
                    </div>
                    <Progress
                      value={statistics.averageAccuracy}
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-action" />
                      <span className="text-sm font-medium">Fluency</span>
                    </div>
                    <div className="text-2xl font-bold text-action">
                      {statistics.averageFluency}%
                    </div>
                    <Progress
                      value={statistics.averageFluency}
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Pronunciation</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {statistics.averagePronunciation}%
                    </div>
                    <Progress
                      value={statistics.averagePronunciation}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress by Level */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Progress by Level</CardTitle>
                <CardDescription>
                  Your performance across different difficulty levels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {statistics.practicesByLevel &&
                statistics.practicesByLevel.length > 0 ? (
                  statistics.practicesByLevel.map((level) => (
                    <div key={level.level}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`capitalize ${getBadgeStyle(
                              level.level
                            )}`}
                          >
                            {level.level === "beginner" && (
                              <BookOpen className="w-3 h-3 mr-1" />
                            )}
                            {level.level === "intermediate" && (
                              <BarChart3 className="w-3 h-3 mr-1" />
                            )}
                            {level.level === "expert" && (
                              <Trophy className="w-3 h-3 mr-1" />
                            )}
                            {level.level}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {level.count}{" "}
                            {level.count === 1 ? "practice" : "practices"}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={getScoreColor(level.avgScore)}
                        >
                          {level.avgScore}%
                        </Badge>
                      </div>
                      <Progress value={level.avgScore} className="h-2" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No practice data yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Start practicing to see your progress by level
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Practice History */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Recent Practice Sessions</CardTitle>
                <CardDescription>
                  Your latest pronunciation practices
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentPractices && recentPractices.length > 0 ? (
                  <div className="space-y-3">
                    {recentPractices.map((practice) => {
                      const phraseData =
                        typeof practice.phrase === "object"
                          ? practice.phrase
                          : null;
                      return (
                        <div
                          key={practice._id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-secondary/20 hover:bg-secondary/40 transition-colors"
                        >
                          <div className="flex-1 min-w-0 mr-4">
                            <p className="text-sm font-medium truncate">
                              {phraseData?.text || "Unknown phrase"}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {phraseData && (
                                <>
                                  <Badge
                                    variant="outline"
                                    className="text-xs capitalize"
                                  >
                                    {phraseData.level}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {phraseData.language === "English"
                                      ? "en"
                                      : "🇯🇵"}
                                  </Badge>
                                </>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatDate(practice.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-right">
                              <div
                                className={`text-lg font-bold ${getScoreColor(
                                  practice.score
                                )}`}
                              >
                                {practice.score}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Attempt #{practice.attemptNumber}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-2">
                      No practice history yet
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start practicing to see your progress!
                    </p>
                    <Button asChild variant="action">
                      <Link to="/dashboard">Start Practicing</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Summary */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Activity Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Total Practices
                  </span>
                  <span className="font-semibold">
                    {statistics.totalPractices}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    This Week
                  </span>
                  <span className="font-semibold text-primary">
                    {statistics.recentPractices}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Best Score
                  </span>
                  <span className="font-semibold text-success">
                    {statistics.bestScore}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Completion
                  </span>
                  <span className="font-semibold text-primary">
                    {completionPercentage}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-action" />
                  Achievements
                </CardTitle>
                <CardDescription className="text-xs">
                  Earn {achievements.filter((a) => !a.earned).length} more
                  achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-2 sm:p-3 rounded-lg text-center transition-all duration-300 cursor-pointer ${getAchievementStyle(
                        achievement.rarity,
                        achievement.earned
                      )} ${achievement.earned ? "hover:scale-105" : ""}`}
                      title={achievement.earned ? "Earned!" : "Not earned yet"}
                    >
                      <div className="flex items-center justify-center mb-1 sm:mb-2">
                        {achievement.icon}
                      </div>
                      <h4 className="font-semibold text-xs sm:text-sm mb-1">
                        {achievement.name}
                      </h4>
                      <p className="text-xs opacity-90 leading-tight">
                        {achievement.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="action" size="sm" className="w-full" asChild>
                  <Link to="/dashboard">
                    <Mic className="w-4 h-4" />
                    Continue Practice
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/dashboard">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProgressPage;
