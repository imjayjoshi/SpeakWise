/**
 * Speech Recognition Utilities
 * Real-time speech-to-text recognition using Web Speech API
 * Supports both English and Japanese
 */

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface WordAnalysis {
  word: string;
  spokenWord: string;
  score: number;
  feedback: string;
  matched: boolean;
}

export interface AnalysisResult {
  overallScore: number;
  accuracy: number;
  fluency: number;
  pronunciation: number;
  spokenText: string;
  wordAnalysis: WordAnalysis[];
  duration: number;
  error?: string;
}

/**
 * Initialize Web Speech API
 * @param language - 'en-US' for English or 'ja-JP' for Japanese
 * @param onResult - Callback for interim and final results
 * @param onEnd - Callback when speech ends
 * @param onError - Callback for errors
 */
export const initializeSpeechRecognition = (
  language: 'en-US' | 'ja-JP',
  onResult: (result: SpeechRecognitionResult) => void,
  onEnd: () => void,
  onError: (error: string) => void
): SpeechRecognition | null => {
  // Check browser support
  const SpeechRecognitionAPI = 
    window.SpeechRecognition || 
    window.webkitSpeechRecognition;

  if (!SpeechRecognitionAPI) {
    onError('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
    return null;
  }

  const recognition: SpeechRecognition = new SpeechRecognitionAPI();
  
  // Configuration
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = language;
  recognition.maxAlternatives = 1;

  // Track if we've received any speech and if recognition should keep running
  let hasReceivedSpeech = false;
  let shouldContinue = true;
  let networkErrorCount = 0;
  const MAX_NETWORK_ERRORS = 3;

  // Handle results
  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const results = Array.from(event.results);
    const lastResult = results[results.length - 1];
    
    const transcript = lastResult[0].transcript;
    const confidence = lastResult[0].confidence;
    const isFinal = lastResult.isFinal;

    // Mark that we've received speech and reset error count
    hasReceivedSpeech = true;
    networkErrorCount = 0;

    onResult({ transcript, confidence, isFinal });
  };

  // Handle when recognition stops (auto-restart to keep listening)
  recognition.onend = () => {
    // Auto-restart if we should keep listening
    if (shouldContinue) {
      try {
        recognition.start();
      } catch (error) {
        // Ignore restart errors
      }
    } else {
      onEnd();
    }
  };

  // Handle speech end
  recognition.onspeechend = () => {
    // Don't call onEnd here - let user manually stop
  };

  // Handle errors
  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    switch (event.error) {
      case 'no-speech':
        // Ignore - common during pauses
        return;
      
      case 'network':
        // Network errors - likely Brave Shields or firewall
        networkErrorCount++;
        
        if (networkErrorCount >= MAX_NETWORK_ERRORS) {
          shouldContinue = false;
          onError(
            'Cannot connect to speech recognition service.\n\n' +
            'If using Brave browser: Click the Brave Shields icon and disable shields for this site.\n\n' +
            'Or use Chrome/Edge browser instead.'
          );
        }
        return;
      
      case 'aborted':
        shouldContinue = false;
        return;
      
      case 'audio-capture':
        shouldContinue = false;
        onError('Microphone not found. Please check your microphone.');
        break;
      
      case 'not-allowed':
        shouldContinue = false;
        onError('Microphone access denied. Please allow microphone access.');
        break;
      
      default:
        if (!hasReceivedSpeech) {
          onError(`Speech recognition error: ${event.error}`);
        }
    }
  };

  // Handle no match
  recognition.onnomatch = () => {
    // Ignore - normal during speech
  };

  // Override stop method
  const originalStop = recognition.stop.bind(recognition);
  recognition.stop = () => {
    shouldContinue = false;
    originalStop();
  };

  return recognition;
};

/**
 * Calculate Levenshtein distance between two strings
 * Used for measuring similarity between spoken and expected text
 */
const levenshteinDistance = (str1: string, str2: string): number => {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
};

/**
 * Calculate similarity percentage between two strings
 * @returns Percentage (0-100)
 */
export const calculateSimilarity = (spoken: string, expected: string): number => {
  if (!spoken || !expected) return 0;

  // Normalize: lowercase and trim
  const spokenNorm = spoken.toLowerCase().trim();
  const expectedNorm = expected.toLowerCase().trim();

  if (spokenNorm === expectedNorm) return 100;

  const distance = levenshteinDistance(spokenNorm, expectedNorm);
  const maxLength = Math.max(spokenNorm.length, expectedNorm.length);

  if (maxLength === 0) return 0;

  const similarity = ((maxLength - distance) / maxLength) * 100;
  return Math.max(0, Math.min(100, Math.round(similarity)));
};

/**
 * Analyze word-by-word comparison
 */
export const analyzeWords = (
  spokenText: string,
  expectedText: string
): WordAnalysis[] => {
  const spokenWords = spokenText.toLowerCase().trim().split(/\s+/);
  const expectedWords = expectedText.toLowerCase().trim().split(/\s+/);

  const analysis: WordAnalysis[] = [];

  // Analyze each expected word
  for (let i = 0; i < expectedWords.length; i++) {
    const expectedWord = expectedWords[i];
    const spokenWord = spokenWords[i] || 'not detected';

    // Calculate word similarity
    const similarity = spokenWord !== 'not detected' 
      ? calculateSimilarity(spokenWord, expectedWord)
      : 0;

    const matched = similarity >= 80; // 80% threshold for match

    // Generate feedback
    let feedback = '';
    if (similarity >= 95) {
      feedback = 'Perfect!';
    } else if (similarity >= 80) {
      feedback = 'Good pronunciation';
    } else if (similarity >= 60) {
      feedback = 'Close, but needs improvement';
    } else if (spokenWord === 'not detected') {
      feedback = 'Word not detected';
    } else {
      feedback = 'Incorrect pronunciation';
    }

    analysis.push({
      word: expectedWord,
      spokenWord,
      score: similarity,
      feedback,
      matched,
    });
  }

  return analysis;
};

/**
 * Calculate component scores based on word analysis
 */
const calculateComponentScores = (
  wordAnalysis: WordAnalysis[],
  overallSimilarity: number
) => {
  if (wordAnalysis.length === 0) {
    return { accuracy: 0, fluency: 0, pronunciation: 0 };
  }

  // Accuracy: Based on word-level similarity
  const avgWordScore = wordAnalysis.reduce((sum, w) => sum + w.score, 0) / wordAnalysis.length;
  const accuracy = Math.round(avgWordScore);

  // Fluency: Based on how many words were detected
  const detectedWords = wordAnalysis.filter(w => w.spokenWord !== 'not detected').length;
  const fluency = Math.round((detectedWords / wordAnalysis.length) * 100);

  // Pronunciation: Based on overall similarity
  const pronunciation = Math.round(overallSimilarity);

  return { accuracy, fluency, pronunciation };
};

/**
 * Analyze recording and generate accurate scores
 * @param spokenText - Text recognized from speech
 * @param expectedText - Expected phrase text
 * @param duration - Recording duration in seconds
 */
export const analyzeRecording = (
  spokenText: string,
  expectedText: string,
  duration: number = 0
): AnalysisResult => {
  // Check for silence (no speech detected)
  if (!spokenText || spokenText.trim().length === 0) {
    return {
      overallScore: 0,
      accuracy: 0,
      fluency: 0,
      pronunciation: 0,
      spokenText: '',
      wordAnalysis: [],
      duration,
      error: 'No speech detected. Please speak into the microphone and try again.',
    };
  }

  // Calculate overall similarity
  const overallSimilarity = calculateSimilarity(spokenText, expectedText);

  // Analyze words
  const wordAnalysis = analyzeWords(spokenText, expectedText);

  // Calculate component scores
  const { accuracy, fluency, pronunciation } = calculateComponentScores(
    wordAnalysis,
    overallSimilarity
  );

  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    accuracy * 0.4 + fluency * 0.3 + pronunciation * 0.3
  );

  return {
    overallScore: Math.max(0, Math.min(100, overallScore)),
    accuracy: Math.max(0, Math.min(100, accuracy)),
    fluency: Math.max(0, Math.min(100, fluency)),
    pronunciation: Math.max(0, Math.min(100, pronunciation)),
    spokenText: spokenText.trim(),
    wordAnalysis,
    duration,
  };
};

/**
 * Format duration in seconds to readable string
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};
