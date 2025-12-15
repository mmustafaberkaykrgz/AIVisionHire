// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RequireAuth from "./components/RequireAuth";

import MyInterviewsPage from "./pages/MyInterviewsPage";
import InterviewDetailPage from "./pages/InterviewDetailPage";

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

import InterviewSetupPage from "./pages/InterviewSetupPage";
import InterviewSessionPage from "./pages/InterviewSessionPage";


const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
                  <Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />

  <Route
    path="/dashboard"
    element={
      <RequireAuth>
        <DashboardPage />
      </RequireAuth>
    }
  />

  <Route
    path="/interview/setup"
    element={
      <RequireAuth>
        <InterviewSetupPage />
      </RequireAuth>
    }
  />

  <Route
    path="/interview/:id"
    element={
      <RequireAuth>
        <InterviewSessionPage />
      </RequireAuth>
    }
  />
  <Route
    path="/interviews"
    element={
      <RequireAuth>
        <MyInterviewsPage />
      </RequireAuth>
    }
  />
   <Route
    path="/interviews/:id"
    element={
      <RequireAuth>
        <InterviewDetailPage />
      </RequireAuth>
    }
  />

  <Route path="*" element={<Navigate to="/login" replace />} />
</Routes>

      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
