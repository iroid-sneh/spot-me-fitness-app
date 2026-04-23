import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { UserManagement } from "./pages/UserManagement";
import { ModerationQueue } from "./pages/ModerationQueue";
import { VerificationReview } from "./pages/VerificationReview";
import { ProgressCapture } from "./pages/ProgressCapture";
import { SafetyReports } from "./pages/SafetyReports";
import { Financials } from "./pages/Financials";
import { Settings } from "./pages/Settings";
import { AdminLogin } from "./pages/AdminLogin";
import { useAdminAuth } from "./context/AdminAuthContext";

function AdminLayout() {
    return (
        <div className="flex h-screen w-full bg-sidebar overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-background rounded-l-[50px]">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route
                        path="/moderation"
                        element={<ModerationQueue />}
                    />
                    <Route
                        path="/verification"
                        element={<VerificationReview />}
                    />
                    <Route path="/progress" element={<ProgressCapture />} />
                    <Route path="/reports" element={<SafetyReports />} />
                    <Route path="/financials" element={<Financials />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}

export function App() {
    const { token, loading } = useAdminAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                Loading admin panel...
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<AdminLogin />} />
                <Route path="/*" element={token ? <AdminLayout /> : <Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
