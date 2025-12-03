import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { toast } from "sonner";
import { phraseAPI, practiceHistoryAPI, Phrase } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, ArrowLeft, Volume2, Loader2 } from "lucide-react";
import {
  initializeSpeechRecognition,
  analyzeRecording,
  type SpeechRecognitionResult,
} from "@/lib/speechRecognition";

const Practice = () => {
  const { phraseId } = useParams();
  const navigate = useNavigate();
  const [currentPhrase, setCurrentPhrase] = useState<Phrase | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  
  // Speech recognition states
  const [recognizedText, setRecognizedText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const fetchPhrase = async () => {
      try {
        if (phraseId) {
          const response = await phraseAPI.getPhraseById(phraseId);
          setCurrentPhrase(response.data.phrase);
        } else {
          // Fetch a random beginner phrase
          const response = await phraseAPI.getPhrasesByLevel("beginner");
          if (response.data.phrases && response.data.phrases.length > 0) {
            setCurrentPhrase(response.data.phrases[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching phrase:", error);
        toast.error("Failed to load phrase");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchPhrase();
  }, [phraseId, navigate]);

  // Play native audio or use Text-to-Speech
  const handlePlayback = async () => {
    if (isPlaying) return;

    if (currentPhrase?.audioUrl) {
      // Play actual audio if available
      try {
        setIsPlaying(true);
        const audio = new Audio(currentPhrase.audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          setIsPlaying(false);
          audioRef.current = null;
        };

        audio.onerror = () => {
          setIsPlaying(false);
          audioRef.current = null;
          toast.error("Failed to play audio");
        };

        await audio.play();
      } catch (error) {
        console.error("Audio playback error:", error);
        setIsPlaying(false);
        toast.error("Failed to play audio");
      }
    } else {
      // Use browser Text-to-Speech API
      playTextToSpeech(
        currentPhrase?.text || "",
        currentPhrase?.language || "English"
      );
    }
  };

  // Text-to-Speech function
  const playTextToSpeech = (text: string, language: string) => {
    if ("speechSynthesis" in window) {
      setIsPlaying(true);

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Set language
      if (language === "Japanese") {
        utterance.lang = "ja-JP"; // Japanese
      } else {
        utterance.lang = "en-US"; // English
      }

      utterance.rate = 0.9; // Slightly slower for learning
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        toast.error("Text-to-speech not available");
      };

      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Text-to-speech not supported in your browser");
    }
  };

  // Start recording with speech recognition
  const startRecording = async () => {
    try {
      // Start audio recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setRecordedAudio(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      // Reset state BEFORE starting recognition
      setRecognizedText("");
      setInterimText("");
      setRecordingStartTime(Date.now());

      // Initialize speech recognition
      const language = currentPhrase?.language === "Japanese" ? "ja-JP" : "en-US";
      
      const recognition = initializeSpeechRecognition(
        language,
        (result: SpeechRecognitionResult) => {
          console.log('Speech result received:', { 
            transcript: result.transcript, 
            isFinal: result.isFinal,
            confidence: result.confidence 
          });
          
          if (result.isFinal) {
            setRecognizedText((prev) => {
              const newText = prev + " " + result.transcript;
              console.log('Final text updated:', newText.trim());
              return newText;
            });
            setInterimText("");
          } else {
            setInterimText(result.transcript);
          }
        },
        () => {
          // Speech ended
          console.log("Speech recognition ended");
        },
        (error: string) => {
          console.error("Speech recognition error:", error);
          toast.error(error);
        }
      );

      if (recognition) {
        speechRecognitionRef.current = recognition;
        
        // Add onstart handler to confirm recognition started
        recognition.onstart = () => {
          console.log('Speech recognition started successfully');
        };
        
        recognition.start();
        setIsRecording(true);
        toast.success("Recording started! Speak clearly into the microphone.");
      } else {
        throw new Error("Failed to initialize speech recognition");
      }
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error(
        "Failed to access microphone. Please allow microphone access."
      );
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Stop speech recognition
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
        speechRecognitionRef.current = null;
      }

      setIsRecording(false);
      setHasRecorded(true);
      setInterimText("");
      toast.success("Recording stopped!");
    }
  };

  // Handle record button click
  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Submit for analysis with REAL speech recognition
  const handleSubmitRecording = async () => {
    if (!recordedAudio || !currentPhrase) {
      toast.error("Please record your pronunciation first");
      return;
    }

    // Calculate recording duration
    const duration = recordingStartTime 
      ? (Date.now() - recordingStartTime) / 1000 
      : 0;

    // Check if recording was too short
    if (duration < 0.5) {
      toast.error("Recording too short. Please speak the phrase and try again.");
      return;
    }

    // Check if we got any speech
    if (!recognizedText || recognizedText.trim().length === 0) {
      toast.error("No speech was detected. Please speak clearly into the microphone and try again. Make sure your microphone is working.");
      return;
    }

    try {
      setLoading(true);

      // Analyze recording with REAL speech recognition data
      const analysisResult = analyzeRecording(
        recognizedText.trim(),
        currentPhrase.text,
        duration
      );

      // Check if analysis detected an error
      if (analysisResult.error) {
        toast.error(analysisResult.error);
        setLoading(false);
        return;
      }

      // Save practice result with detailed scores
      await practiceHistoryAPI.savePracticeResult(currentPhrase._id, {
        score: analysisResult.overallScore,
        accuracy: analysisResult.accuracy,
        fluency: analysisResult.fluency,
        pronunciation: analysisResult.pronunciation,
        wordAnalysis: analysisResult.wordAnalysis,
        duration: analysisResult.duration,
      });

      toast.success("Recording analyzed successfully!");

      // Store analysis result in sessionStorage for feedback page
      sessionStorage.setItem("practiceResult", JSON.stringify(analysisResult));

      // Redirect to feedback
      setTimeout(() => {
        navigate(`/feedback/${currentPhrase._id}`);
      }, 500);
    } catch (error) {
      console.error("Error submitting recording:", error);
      toast.error("Failed to submit recording");
      setLoading(false);
    }
  };

  // Play recorded audio
  const playRecordedAudio = () => {
    if (recordedAudio) {
      const audioUrl = URL.createObjectURL(recordedAudio);
      const audio = new Audio(audioUrl);
      audio.play();

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (isPlaying && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentPhrase) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg text-muted-foreground mb-4">No phrase found</p>
        <Button asChild>
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const displayText = isRecording 
    ? (recognizedText + " " + interimText).trim() || "Speak now..."
    : recognizedText.trim() || "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </Button>

            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {currentPhrase.language === "English" ? "🇬🇧" : "🇯🇵"}{" "}
                {currentPhrase.language}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {currentPhrase.level}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Practice Arena */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center space-y-8 sm:space-y-12">
          {/* Instructions */}
          <div className="space-y-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-muted-foreground">
              {isRecording
                ? "Recording... Click Stop when done"
                : hasRecorded
                ? "Recording complete! Review or submit"
                : "Listen, then record your pronunciation"}
            </h1>
          </div>

          {/* Target Phrase */}
          <Card className="max-w-2xl mx-auto shadow-soft">
            <CardContent className="p-6 sm:p-8 lg:p-12 text-center space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-medium text-foreground leading-relaxed">
                  "{currentPhrase.text}"
                </p>
                {currentPhrase.meaning && (
                  <p className="text-base sm:text-lg text-muted-foreground italic">
                    {currentPhrase.meaning}
                  </p>
                )}
                {currentPhrase.example && (
                  <p className="text-sm sm:text-base text-muted-foreground/80 mt-4 p-4 bg-secondary/20 rounded-lg">
                    <span className="font-medium">Example:</span> "
                    {currentPhrase.example}"
                  </p>
                )}
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePlayback}
                  disabled={isPlaying}
                  className="gap-2"
                >
                  {isPlaying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Playing...
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5" />
                      <span className="hidden sm:inline">Listen</span>
                    </>
                  )}
                </Button>

                {hasRecorded && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={playRecordedAudio}
                    className="gap-2"
                  >
                    <Volume2 className="w-5 h-5" />
                    <span className="hidden sm:inline">Play Recording</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Real-Time Transcription Display */}
          {(isRecording || hasRecorded) && displayText && (
            <Card className="max-w-2xl mx-auto shadow-soft border-primary/30">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Mic className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {isRecording ? "You're saying:" : "You said:"}
                    </span>
                  </div>
                  <p className={`text-lg sm:text-xl font-medium ${isRecording ? "text-primary" : "text-foreground"}`}>
                    "{displayText}"
                  </p>
                  {isRecording && interimText && (
                    <p className="text-sm text-muted-foreground italic">
                      (recognizing...)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* DEBUG PANEL - Shows recognition state */}
          {isRecording && (
            <Card className="max-w-2xl mx-auto shadow-soft border-yellow-500/30 bg-yellow-50/50">
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="font-bold text-yellow-800">🐛 Debug Info:</div>
                  <div className="text-yellow-700">
                    <div>✓ Recording: {isRecording ? 'YES' : 'NO'}</div>
                    <div>✓ Recognized Text Length: {recognizedText.length} chars</div>
                    <div>✓ Recognized Text: "{recognizedText || '(empty)'}"</div>
                    <div>✓ Interim Text: "{interimText || '(empty)'}"</div>
                    <div className="mt-2 text-xs">
                      Check browser console (F12) for detailed logs
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recording Interface */}
          <div className="space-y-6 sm:space-y-8">
            {/* Waveform Visualization */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1 h-12 sm:h-16">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-hero rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 40 + 16}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Recording Status */}
            {isRecording && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-action">
                  <div className="w-3 h-3 bg-action rounded-full animate-pulse" />
                  <span className="font-semibold text-sm sm:text-base">
                    Recording... Click STOP to finish
                  </span>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Read the phrase clearly into your microphone
                </p>
              </div>
            )}

            {/* Recorded Status */}
            {hasRecorded && !isRecording && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-success">
                  <div className="w-3 h-3 bg-success rounded-full" />
                  <span className="font-semibold text-sm sm:text-base">
                    Recording saved! Review or submit for analysis
                  </span>
                </div>
              </div>
            )}

            {/* Record/Stop Button */}
            <Button
              variant={
                isRecording ? "destructive" : hasRecorded ? "outline" : "action"
              }
              size="xl"
              onClick={handleRecord}
              disabled={loading}
              className={`w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full text-lg sm:text-xl font-bold transition-all duration-300 ${
                isRecording ? "animate-pulse scale-110" : "hover:scale-110"
              }`}
            >
              {isRecording ? (
                <Square className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
              ) : (
                <Mic className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
              )}
            </Button>

            <div className="text-center space-y-1">
              <p className="text-base sm:text-lg font-medium text-foreground">
                {isRecording
                  ? "Recording... Click to STOP"
                  : hasRecorded
                  ? "Click to record again"
                  : "Click to start recording"}
              </p>
              <p className="text-muted-foreground text-sm sm:text-base">
                {!isRecording && !hasRecorded && "Read the phrase clearly"}
              </p>
            </div>

            {/* Submit Button */}
            {hasRecorded && (
              <div className="pt-4">
                <Button
                  variant="action"
                  size="lg"
                  onClick={handleSubmitRecording}
                  disabled={loading}
                  className="w-full sm:w-auto min-w-[200px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Submit for Analysis"
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Skip Option */}
          <div className="pt-8">
            <Button variant="ghost" asChild>
              <Link to="/dashboard">Skip this phrase</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Practice;
