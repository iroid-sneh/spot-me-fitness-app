import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { UserManagement } from './pages/UserManagement';
import { ModerationQueue } from './pages/ModerationQueue';
import { VerificationReview } from './pages/VerificationReview';
import { ProgressCapture } from './pages/ProgressCapture';
import { SafetyReports } from './pages/SafetyReports';
import { Financials } from './pages/Financials';
import { Settings } from './pages/Settings';
export function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen w-full bg-sidebar overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background rounded-tl-3xl">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/moderation" element={<ModerationQueue />} />
            <Route path="/verification" element={<VerificationReview />} />
            <Route path="/progress" element={<ProgressCapture />} />
            <Route path="/reports" element={<SafetyReports />} />
            <Route path="/financials" element={<Financials />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>);

}