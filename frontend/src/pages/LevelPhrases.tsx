import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { phraseAPI, Phrase, practiceHistoryAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Mic, Volume2, BookOpen, Loader2, CheckCircle2 } from "lucide-react";

const LevelPhrases = () => {
  const { level } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [practicedPhrases, setPracticedPhrases] = useState<Map<string, number>>(new Map());

  const selectedLanguage = searchParams.get("lang") || "All";

  useEffect(() => {
    const fetchPhrases = async () => {
      try {
        if (!level) {
          navigate("/dashboard");
          return;
        }

        const response = await phraseAPI.getPhrasesByLevel(level as any);
        let fetchedPhrases = response.data.phrases || [];

        // Filter by language if specified
        if (selectedLanguage !== "All") {
          fetchedPhrases = fetchedPhrases.filter(
            (p: Phrase) => p.language === selectedLanguage
          );
        }

        setPhrases(fetchedPhrases);

        // Fetch practiced phrases
        try {
          const practiceRes = await practiceHistoryAPI.getPracticeHistory({ limit: 1000 });
          const practices = practiceRes.data.practices || [];
          
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
      } catch (error) {
        console.error("Error fetching phrases:", error);
        toast.error("Failed to load phrases");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchPhrases();
  }, [level, selectedLanguage, navigate]);

  const playAudio = (phrase: Phrase) => {
    setPlayingId(phrase._id);

    if (phrase.audioUrl) {
      // Play actual audio
      const audio = new Audio(phrase.audioUrl);
      audio.onended = () => setPlayingId(null);
      audio.onerror = () => {
        setPlayingId(null);
        toast.error("Failed to play audio");
      };
      audio.play();
    } else {
      // Use Text-to-Speech
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(phrase.text);
        utterance.lang = phrase.language === "Japanese" ? "ja-JP" : "en-US";
        utterance.rate = 0.9;

        utterance.onend = () => setPlayingId(null);
        utterance.onerror = () => {
          setPlayingId(null);
          toast.error("Text-to-speech not available");
        };

        window.speechSynthesis.speak(utterance);
      } else {
        setPlayingId(null);
        toast.error("Audio not available");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const levelColors: { [key: string]: string } = {
    beginner: "text-success border-success/20 bg-success/10",
    intermediate: "text-action border-action/20 bg-action/10",
    expert: "text-primary border-primary/20 bg-primary/10",
  };

  const levelIcons: { [key: string]: JSX.Element } = {
    beginner: <BookOpen className="w-5 h-5" />,
    intermediate: <Mic className="w-5 h-5" />,
    expert: <Play className="w-5 h-5" />,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              {selectedLanguage !== "All" && (
                <Badge variant="outline">
                  {selectedLanguage === "English" ? "en" : "🇯🇵"}{" "}
                  {selectedLanguage}
                </Badge>
              )}
              <Badge
                variant="outline"
                className={`capitalize ${levelColors[level || "beginner"]}`}
              >
                {levelIcons[level || "beginner"]}
                <span className="ml-2">{level} Level</span>
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 capitalize">
            {level} Level Phrases
            {selectedLanguage !== "All" && (
              <span className="text-primary ml-2">({selectedLanguage})</span>
            )}
          </h1>
          <p className="text-muted-foreground">
            {phrases.length} phrase{phrases.length !== 1 ? "s" : ""} available
            to practice
          </p>
        </div>

        {phrases.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                No phrases available for this level
                {selectedLanguage !== "All" && ` in ${selectedLanguage}`}.
              </p>
              <Button asChild>
                <Link to="/dashboard">Return to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {phrases.map((phrase, index) => (
              <Card
                key={phrase._id}
                className="shadow-card hover:shadow-soft transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {phrase.language === "English" ? "en" : "🇯🇵"}
                      </Badge>
                      {practicedPhrases.has(phrase._id) && (
                        <Badge variant="default" className="text-xs bg-success text-white flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {practicedPhrases.get(phrase._id)}%
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => playAudio(phrase)}
                      disabled={playingId === phrase._id}
                    >
                      {playingId === phrase._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <CardTitle className="text-lg leading-relaxed">
                    "{phrase.text}"
                  </CardTitle>
                  {phrase.meaning && (
                    <CardDescription className="text-sm mt-2">
                      {phrase.meaning}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {phrase.example && (
                    <div className="p-3 bg-secondary/20 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Example:
                      </p>
                      <p className="text-sm">"{phrase.example}"</p>
                    </div>
                  )}

                  <Button
                    variant="action"
                    className="w-full group-hover:scale-105 transition-transform"
                    onClick={() => navigate(`/practice/${phrase._id}`)}
                  >
                    <Play className="w-4 h-4" />
                    Start Practice
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default LevelPhrases;
