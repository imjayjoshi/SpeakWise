// File: frontend/src/api/api.ts

import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth APIs
export const authAPI = {
  register: (data: { fullName: string; email: string; password: string }) =>
    api.post("/auth/user/register", data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/user/login", data),

  logout: () => api.get("/auth/user/logout"),

  getMe: () => api.get("/auth/me"),

  updateProfile: (data: { fullName?: string; phone?: string; languageLevel?: string }) =>
    api.put("/auth/profile", data),

  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put("/auth/password", data),
};

// Phrase APIs
export const phraseAPI = {
  // User endpoints
  getPhrasesByLevel: (level: "beginner" | "intermediate" | "expert") =>
    api.get(`/phrase/level/${level}`),

  getPhraseById: (id: string) => api.get(`/phrase/${id}`),

  markAsPracticed: (id: string, score?: number) =>
    api.post(`/phrase/practice/${id}`, { score }),

  getUserProgress: () => api.get("/phrase/user/progress"),

  // Get list of practiced phrases with scores from practice history
  getPracticedPhrases: () => api.get("/practice-history/history"),

  // Admin endpoints
  addPhrase: (data: {
    text: string;
    meaning?: string;
    example?: string;
    language?: "English" | "Japanese";
    level: "beginner" | "intermediate" | "expert";
    audioUrl?: string;
    audioMeaningUrl?: string;
  }) => api.post("/phrase/add", data),

  getAllPhrases: () => api.get("/phrase/all"),

  updatePhrase: (
    id: string,
    data: Partial<{
      text: string;
      meaning: string;
      example: string;
      language: "English" | "Japanese";
      level: "beginner" | "intermediate" | "expert";
      audioUrl: string;
      audioMeaningUrl: string;
    }>
  ) => api.put(`/phrase/${id}`, data),

  deletePhrase: (id: string) => api.delete(`/phrase/${id}`),
};

// Practice History APIs
export const practiceHistoryAPI = {
  // Save practice result
  savePracticeResult: (
    phraseId: string,
    data: {
      score: number;
      accuracy?: number;
      fluency?: number;
      pronunciation?: number;
      wordAnalysis?: Array<{
        word: string;
        score: number;
        feedback: string;
      }>;
      duration?: number;
      audioUrl?: string;
    }
  ) => api.post(`/practice-history/practice/${phraseId}`, data),

  // Get user's practice history
  getPracticeHistory: (params?: { limit?: number; page?: number }) =>
    api.get("/practice-history/history", { params }),

  // Get user statistics
  getUserStatistics: () => api.get("/practice-history/statistics"),

  // Get practice history for specific phrase
  getPhrasePracticeHistory: (phraseId: string) =>
    api.get(`/practice-history/phrase/${phraseId}`),
};

// Admin User APIs
export const adminUserAPI = {
  // Get all users
  getAllUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get("/admin/users", { params }),

  // Get user details
  getUserDetails: (userId: string) => api.get(`/admin/users/${userId}`),

  // Update user
  updateUser: (userId: string, data: any) =>
    api.put(`/admin/users/${userId}`, data),

  // Update user password (admin only)
  updateUserPassword: (userId: string, newPassword: string) =>
    api.put(`/admin/users/${userId}/password`, { newPassword }),

  // Delete user
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),

  // Get dashboard statistics
  getDashboardStats: () => api.get("/admin/dashboard"),
};

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Export types for TypeScript
export type Language = "English" | "Japanese";
export type Level = "beginner" | "intermediate" | "expert";

export interface Phrase {
  _id: string;
  text: string;
  meaning?: string;
  example?: string;
  language: Language;
  level: Level;
  audioUrl?: string;
  audioMeaningUrl?: string;
  createdBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface PracticeHistory {
  _id: string;
  user: string;
  phrase: Phrase | string;
  score: number;
  accuracy: number;
  fluency: number;
  pronunciation: number;
  wordAnalysis: Array<{
    word: string;
    score: number;
    feedback: string;
  }>;
  attemptNumber: number;
  duration?: number;
  status: "completed" | "in-progress" | "skipped";
  createdAt: string;
  updatedAt: string;
}

export interface UserStatistics {
  totalPractices: number;
  uniquePhrasesPracticed: number;
  totalPhrasesAvailable: number;
  averageScore: number;
  averageAccuracy: number;
  averageFluency: number;
  averagePronunciation: number;
  bestScore: number;
  recentPractices: number;
  practicesByLevel: Array<{
    level: Level;
    count: number;
    avgScore: number;
  }>;
}
