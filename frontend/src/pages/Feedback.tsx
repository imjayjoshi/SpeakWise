import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { phraseAPI, Phrase } from "@/lib/api";
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
  ArrowRight,
  RotateCcw,
  Trophy,
  Volume2,
  TrendingUp,
  Target,
  Zap,
  Mic,
} from "lucide-react";

const Feedback = () => {
  const { phraseId } = useParams();
  const [phrase, setPhrase] = useState<Phrase | null>(null);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [practiceResult, setPracticeResult] = useState<any>(null);
  const [nextPhraseId, setNextPhraseId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhrase = async () => {
      try {
        if (phraseId) {
          const response = await phraseAPI.getPhraseById(phraseId);
          const currentPhrase = response.data.phrase;
          setPhrase(currentPhrase);

          // Fetch phrases of the same level to find the next one
          try {
            const levelResponse = await phraseAPI.getPhrasesByLevel(currentPhrase.level);
            const phrasesOfSameLevel = levelResponse.data.phrases || [];
            
            // Find current phrase index
            const currentIndex = phrasesOfSameLevel.findIndex((p: Phrase) => p._id === phraseId);
            
            // Get next phrase (loop back to first if at end)
            if (currentIndex !== -1 && phrasesOfSameLevel.length > 1) {
              const nextIndex = (currentIndex + 1) % phrasesOfSameLevel.length;
              const nextPhrase = phrasesOfSameLevel[nextIndex];
              setNextPhraseId(nextPhrase._id);
            }
          } catch (error) {
            console.error("Error fetching next phrase:", error);
          }
        }

        const resultStr = sessionStorage.getItem("practiceResult");
        if (resultStr) {
          const result = JSON.parse(resultStr);
          setPracticeResult(result);
          sessionStorage.removeItem("practiceResult");
        }
      } catch (error) {
        console.error("Error fetching phrase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhrase();
  }, [phraseId]);

  useEffect(() => {
    if (practiceResult) {
      setTimeout(() => {
        setShowScore(true);
        let currentScore = 0;
        const targetScore = practiceResult.overallScore;
        const interval = setInterval(() => {
          currentScore += 2;
          setScore(currentScore);
          if (currentScore >= targetScore) {
            setScore(targetScore);
            clearInterval(interval);
          }
        }, 30);
      }, 500);
    }
  }, [practiceResult]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 75) return "text-primary";
    if (score >= 60) return "text-action";
    return "text-destructive";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 95) return "Outstanding! Perfect pronunciation!";
    if (score >= 90) return "Excellent! You sound like a native speaker!";
    if (score >= 85) return "Very Good! Minor improvements needed.";
    if (score >= 80) return "Good Job! Keep practicing!";
    if (score >= 70) return "Fair! You're making progress!";
    if (score >= 60) return "Needs Work! Practice more for better results.";
    return "Keep Trying! Regular practice will help!";
  };

  const getComponentIcon = (component: string) => {
    switch (component) {
      case "accuracy":
        return <Target className="w-5 h-5" />;
      case "fluency":
        return <Zap className="w-5 h-5" />;
      case "pronunciation":
        return <Volume2 className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-muted-foreground">
        Loading feedback...
      </div>
    );
  }

  if (!practiceResult) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg text-muted-foreground mb-4">
          No practice data found
        </p>
        <Button asChild>
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const phraseText = phrase?.text || "Your phrase";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </Button>

            <Badge variant="secondary">Real-Time Voice Analysis</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="space-y-6 sm:space-y-8">
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="hsl(var(--success))"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
                  className="transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div
                    className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${getScoreColor(
                      score
                    )}`}
                  >
                    {showScore ? score : 0}%
                  </div>
                  <div className="text-muted-foreground text-xs sm:text-sm">
                    Overall Score
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-success">
                {getScoreMessage(score)}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                Your pronunciation of "{phraseText}"
              </p>
            </div>
          </div>

          {/* Voice Comparison - NEW */}
          {practiceResult.spokenText && (
            <Card className="shadow-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-primary" />
                  Voice Comparison
                </CardTitle>
                <CardDescription>
                  Compare what you said vs the original phrase
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-secondary/20 border-2 border-success/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Original Phrase
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      "{phraseText}"
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-primary/5 border-2 border-primary/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Mic className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">
                        You Said
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      "{practiceResult.spokenText}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">Match Accuracy:</span>
                  <Badge
                    variant="outline"
                    className={`${getScoreColor(
                      practiceResult.accuracy
                    )} border-current`}
                  >
                    {practiceResult.accuracy}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Performance Breakdown
              </CardTitle>
              <CardDescription>
                Real-time analysis of your pronunciation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  name: "Accuracy",
                  value: practiceResult.accuracy,
                  key: "accuracy",
                },
                {
                  name: "Fluency",
                  value: practiceResult.fluency,
                  key: "fluency",
                },
                {
                  name: "Pronunciation",
                  value: practiceResult.pronunciation,
                  key: "pronunciation",
                },
              ].map((component) => (
                <div key={component.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getComponentIcon(component.key)}
                      <span className="font-medium">{component.name}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${getScoreColor(
                        component.value
                      )} border-current`}
                    >
                      {component.value}%
                    </Badge>
                  </div>
                  <Progress value={component.value} className="h-3" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Word-by-Word Analysis - FIXED FULL WIDTH */}
          {practiceResult.wordAnalysis &&
            practiceResult.wordAnalysis.length > 0 && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Word-by-Word Analysis
                  </CardTitle>
                  <CardDescription>
                    Real-time comparison of each word you spoke
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {practiceResult.wordAnalysis.map(
                    (word: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-secondary/20 border border-border"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className="font-semibold text-base sm:text-lg">
                                Expected: "{word.word}"
                              </span>
                              {word.spokenWord &&
                                word.spokenWord !== "not detected" && (
                                  <span className="text-sm text-muted-foreground">
                                    → You: "{word.spokenWord}"
                                  </span>
                                )}
                            </div>
                            <p className="text-muted-foreground text-sm mb-2">
                              {word.feedback}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`${getScoreColor(
                              word.score
                            )} border-current text-sm flex-shrink-0`}
                          >
                            {word.score}%
                          </Badge>
                        </div>
                        <Progress value={word.score} className="h-2" />
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            )}

          {score >= 90 && (
            <Card className="shadow-card bg-gradient-to-r from-success/5 to-success/10 border-success/20">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 text-success mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-success mb-2">
                  Excellent Performance!
                </h3>
                <p className="text-muted-foreground">
                  You scored over 90% - you're becoming a pronunciation master!
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button variant="outline" size="lg" asChild>
              <Link to={`/practice/${phraseId}`}>
                <RotateCcw className="w-5 h-5" />
                Practice Again
              </Link>
            </Button>

            {loading ? (
              <Button variant="action" size="lg" disabled>
                <ArrowRight className="w-5 h-5" />
                Loading...
              </Button>
            ) : (
              <Button variant="action" size="lg" asChild>
                <Link to={nextPhraseId ? `/practice/${nextPhraseId}` : "/dashboard"}>
                  <ArrowRight className="w-5 h-5" />
                  {nextPhraseId ? "Next Phrase" : "Back to Dashboard"}
                </Link>
              </Button>
            )}
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">
                Personalized Tips for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                {score < 80 && (
                  <>
                    <li>• Listen to the native pronunciation multiple times</li>
                    <li>
                      • Practice slowly at first, then gradually increase speed
                    </li>
                  </>
                )}
                {practiceResult.accuracy < 85 && (
                  <li>
                    • Focus on pronouncing each word clearly and correctly
                  </li>
                )}
                {practiceResult.fluency < 85 && (
                  <li>• Work on speaking smoothly without long pauses</li>
                )}
                {practiceResult.pronunciation < 85 && (
                  <li>• Pay attention to stress patterns and intonation</li>
                )}
                {practiceResult.spokenText && (
                  <li>
                    • Review the word comparison above to see exactly where to
                    improve
                  </li>
                )}
                <li>• Record yourself daily to track improvement over time</li>
                <li>• Mimic native speakers' rhythm and intonation patterns</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Feedback;
