import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { toast } from "sonner";
import { authAPI, phraseAPI, Phrase, practiceHistoryAPI } from "@/lib/api";
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
  Flame,
  Play,
  Award,
  TrendingUp,
  Clock,
  Target,
  Mic,
  LogOut,
  BookOpen,
  GraduationCap,
  Trophy,
  Globe,
  User,
  CheckCircle2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LevelCategory {
  id: string;
  title: string;
  icon: JSX.Element;
  phrases: number;
  completed: number;
  color: string;
  level: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<{ fullName: string; streak: number } | null>(
    null
  );
  const [allPhrases, setAllPhrases] = useState<Phrase[]>([]);
  const [filteredPhrases, setFilteredPhrases] = useState<Phrase[]>([]);
  const [levelCategories, setLevelCategories] = useState<LevelCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<
    "English" | "Japanese" | "All"
  >("All");
  const [practicedPhrases, setPracticedPhrases] = useState<Map<string, number>>(new Map());
  const navigate = useNavigate();

  // Fetch user and phrases data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userRes = await authAPI.getMe();
        setUser(userRes.data.user);

        // Fetch phrases by each level
        const [beginnerRes, intermediateRes, expertRes] = await Promise.all([
          phraseAPI.getPhrasesByLevel("beginner"),
          phraseAPI.getPhrasesByLevel("intermediate"),
          phraseAPI.getPhrasesByLevel("expert"),
        ]);

        const beginnerPhrases = beginnerRes.data.phrases || [];
        const intermediatePhrases = intermediateRes.data.phrases || [];
        const expertPhrases = expertRes.data.phrases || [];

        const allPhrasesData = [
          ...beginnerPhrases,
          ...intermediatePhrases,
          ...expertPhrases,
        ];
        setAllPhrases(allPhrasesData);
        setFilteredPhrases(allPhrasesData);

        // Fetch practiced phrases
        try {
          const practiceRes = await practiceHistoryAPI.getPracticeHistory({ limit: 1000 });
          const practices = practiceRes.data.practices || [];
          
          // Create a map of phraseId -> best score
          const practiceMap = new Map<string, number>();
          practices.forEach((practice: any) => {
            const phraseId = typeof practice.phrase === 'object' ? practice.phrase._id : practice.phrase;
            const currentBest = practiceMap.get(phraseId) || 0;
            if (practice.score > currentBest) {
              practiceMap.set(phraseId, practice.score);
            }
          });
          setPracticedPhrases(practiceMap);
        } catch (error) {
          console.error("Error fetching practice history:", error);
        }

        // Create level categories
        updateCategories(allPhrasesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load dashboard data");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Filter phrases by language
  useEffect(() => {
    if (selectedLanguage === "All") {
      setFilteredPhrases(allPhrases);
      updateCategories(allPhrases);
    } else {
      const filtered = allPhrases.filter(
        (p) => p.language === selectedLanguage
      );
      setFilteredPhrases(filtered);
      updateCategories(filtered);
    }
  }, [selectedLanguage, allPhrases]);

  const updateCategories = (phrases: Phrase[]) => {
    const beginnerCount = phrases.filter((p) => p.level === "beginner").length;
    const intermediateCount = phrases.filter(
      (p) => p.level === "intermediate"
    ).length;
    const expertCount = phrases.filter((p) => p.level === "expert").length;

    const categories: LevelCategory[] = [
      {
        id: "beginner",
        title: "Beginner",
        level: "beginner",
        icon: <BookOpen className="w-6 h-6" />,
        phrases: beginnerCount,
        completed: 0,
        color: "text-success",
      },
      {
        id: "intermediate",
        title: "Intermediate",
        level: "intermediate",
        icon: <GraduationCap className="w-6 h-6" />,
        phrases: intermediateCount,
        completed: 0,
        color: "text-action",
      },
      {
        id: "expert",
        title: "Expert",
        level: "expert",
        icon: <Trophy className="w-6 h-6" />,
        phrases: expertCount,
        completed: 0,
        color: "text-primary",
      },
    ];

    setLevelCategories(categories);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem("user");
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout. Try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-muted-foreground">
        Loading your dashboard...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get today's recommended phrases (first 3 phrases)
  const todaysPhrases = filteredPhrases.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar for Dashboard */}
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
              {/* Language Selector */}
              <Select
                value={selectedLanguage}
                onValueChange={(value) => setSelectedLanguage(value as any)}
              >
                <SelectTrigger className="w-[140px] h-9">
                  <Globe className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Languages</SelectItem>
                  <SelectItem value="English">English en</SelectItem>
                  <SelectItem value="Japanese">Japanese 🇯🇵</SelectItem>
                </SelectContent>
              </Select>

              <Link to="/progress">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  Progress
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  Profile
                </Button>
              </Link>
              
              {/* User Profile Display */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-secondary/50 rounded-lg">
                <User className="w-4 h-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium text-foreground leading-none">
                    {user.fullName}
                  </p>
                </div>
              </div>
              
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
        {/* Header with Streak */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">
                Hello, {user.fullName}!
              </h1>
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-action" />
                <span className="text-xl font-semibold text-action">
                  {user.streak || 0} day streak
                </span>
              </div>
            </div>
            <p className="text-muted-foreground text-lg">
              Your pronunciation journey continues strong!
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Today's Recommended Practice */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Today's Recommended Practice
                </CardTitle>
                <CardDescription>
                  Personalized phrases to improve your pronunciation
                  {selectedLanguage !== "All" && (
                    <span className="ml-2 text-primary">
                      ({selectedLanguage} only)
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaysPhrases.length > 0 ? (
                  todaysPhrases.map((phrase) => (
                    <div
                      key={phrase._id}
                      className="p-3 sm:p-4 rounded-lg border bg-secondary/20 hover:bg-secondary/40 transition-colors group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <p className="text-foreground font-medium text-sm sm:text-base">
                              "{phrase.text}"
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {phrase.language === "English" ? "en" : "🇯🇵"}
                            </Badge>
                            {practicedPhrases.has(phrase._id) && (
                              <Badge variant="default" className="text-xs bg-success text-white flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Completed {practicedPhrases.get(phrase._id)}%
                              </Badge>
                            )}
                          </div>
                          {phrase.meaning && (
                            <p className="text-muted-foreground text-xs sm:text-sm mb-2">
                              {phrase.meaning}
                            </p>
                          )}
                          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {phrase.level}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              2-3 min
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="action"
                          size="sm"
                          className="group-hover:scale-105 transition-transform w-full sm:w-auto"
                          onClick={() => navigate(`/practice/${phrase._id}`)}
                        >
                          <Play className="w-4 h-4" />
                          Practice
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No phrases available for{" "}
                      {selectedLanguage === "All"
                        ? "any language"
                        : selectedLanguage}{" "}
                      yet.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Admin can add phrases from the admin panel
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Practice by Level */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Practice by Level</CardTitle>
                <CardDescription>
                  Choose your difficulty level to start learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {levelCategories.map((category) => (
                    <div
                      key={category.id}
                      className="p-3 sm:p-4 rounded-lg border hover:shadow-soft transition-all duration-300 group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <div className={`${category.color} flex-shrink-0`}>
                            {category.icon}
                          </div>
                          <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                            {category.title}
                          </h3>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-xs flex-shrink-0"
                        >
                          {category.phrases}
                        </Badge>
                      </div>

                      <Progress
                        value={
                          (category.completed / (category.phrases || 1)) * 100
                        }
                        className="h-2 mb-3"
                      />

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-xs sm:text-sm"
                        asChild
                        disabled={category.phrases === 0}
                      >
                        <Link
                          to={`/level/${category.level}?lang=${selectedLanguage}`}
                        >
                          Start Learning ({category.phrases})
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Streak</span>
                  <div className="flex items-center gap-1 text-action font-semibold">
                    <Flame className="w-4 h-4" />
                    {user.streak || 0} days
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Phrases</span>
                  <span className="font-semibold text-success">
                    {filteredPhrases.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Levels</span>
                  <span className="font-semibold text-primary">
                    {levelCategories.length}
                  </span>
                </div>

                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/progress">
                    <TrendingUp className="w-4 h-4" />
                    View Detailed Stats
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Languages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">en</span>
                    <span className="font-medium">English</span>
                  </div>
                  <Badge variant="secondary">
                    {allPhrases.filter((p) => p.language === "English").length}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇯🇵</span>
                    <span className="font-medium">Japanese</span>
                  </div>
                  <Badge variant="secondary">
                    {allPhrases.filter((p) => p.language === "Japanese").length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
                  <Award className="w-6 h-6 text-success" />
                  <div>
                    <p className="font-medium text-success text-sm">
                      Getting Started
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Welcome to SpeakWise!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                  <Target className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-medium text-primary text-sm">
                      First Practice
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Complete your first phrase
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
