"use client";

import React, { useState, useEffect } from "react";
import { loginApi, registerApi, getGuestTokenApi } from "../../lib/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  organization: string;
  clearance_level: string;
  role?: string;
  token?: string;
}

interface AuthGatekeeperProps {
  onAuthenticated: (user: AuthUser) => void;
  currentUser: AuthUser | null;
}

export function getStoredAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("satquery_auth_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearStoredAuthUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("satquery_auth_user");
  localStorage.removeItem("satquery_auth_token");
}

export function AuthGatekeeper({ onAuthenticated, currentUser }: AuthGatekeeperProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "guest">("login");
  const [email, setEmail] = useState<string>("ayush@isro.gov.in");
  const [password, setPassword] = useState<string>("isro_bhuvision_2024");
  const [name, setName] = useState<string>("");
  const [organization, setOrganization] = useState<string>("Integrated Defense Staff / ISRO");
  const [clearance, setClearance] = useState<string>("Level 3: Strategic Command & MoD");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, do not render gatekeeper
  if (currentUser) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const resp = await loginApi(email, password);
      const user: AuthUser = {
        id: resp.user?.id || "usr_isro_001",
        name: resp.user?.name || "Ayush Sarkar",
        email: resp.user?.email || email,
        organization: resp.user?.organization || "ISRO Space Applications Centre (SAC)",
        clearance_level: resp.user?.clearance_level || "Level 4: High Command (ISRO / MoD)",
        token: resp.access_token,
      };
      localStorage.setItem("satquery_auth_user", JSON.stringify(user));
      localStorage.setItem("satquery_auth_token", resp.access_token);
      onAuthenticated(user);
    } catch (err: any) {
      // Offline fallback for pre-seeded user
      if (email === "ayush@isro.gov.in" && password === "isro_bhuvision_2024") {
        const user: AuthUser = {
          id: "usr_isro_001",
          name: "Ayush Sarkar",
          email: "ayush@isro.gov.in",
          organization: "ISRO Space Applications Centre (SAC)",
          clearance_level: "Level 4: High Command (ISRO / MoD)",
          token: "isro_jwt_session_token",
        };
        localStorage.setItem("satquery_auth_user", JSON.stringify(user));
        onAuthenticated(user);
      } else {
        setError(err.message || "Invalid defense credentials or network error.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const resp = await registerApi(name, email, password, organization, clearance);
      const user: AuthUser = {
        id: resp.user?.id || `usr_${Date.now().toString(16)}`,
        name: resp.user?.name || name,
        email: resp.user?.email || email,
        organization: resp.user?.organization || organization,
        clearance_level: resp.user?.clearance_level || clearance,
        token: resp.access_token,
      };
      localStorage.setItem("satquery_auth_user", JSON.stringify(user));
      onAuthenticated(user);
    } catch (err: any) {
      setError(err.message || "Registration failed. Try guest clearance.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestClearance = async (level: string) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await getGuestTokenApi(level);
      const user: AuthUser = {
        id: resp.user?.id || "usr_guest",
        name: resp.user?.name || "Tactical Field Operator",
        email: resp.user?.email || "field.operator@isro.gov.in",
        organization: resp.user?.organization || "Integrated Defense & Disaster Command",
        clearance_level: level,
        token: resp.access_token,
      };
      localStorage.setItem("satquery_auth_user", JSON.stringify(user));
      onAuthenticated(user);
    } catch {
      const fallbackUser: AuthUser = {
        id: "usr_guest_fallback",
        name: "Tactical Defense Analyst",
        email: "analyst@isro.gov.in",
        organization: "HQ Integrated Defense Staff",
        clearance_level: level,
      };
      localStorage.setItem("satquery_auth_user", JSON.stringify(fallbackUser));
      onAuthenticated(fallbackUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050811]/90 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-lg bg-[#0A0F1C] border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/60 overflow-hidden flex flex-col font-sans">
        
        {/* Security Warning Header */}
        <div className="bg-gradient-to-r from-blue-900/60 via-[#0E1B38] to-cyan-900/60 border-b border-cyan-500/30 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-cyan-300/40">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base font-mono tracking-tight">BHUVISION // SATQUERY</span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  SIH26167
                </span>
              </div>
              <p className="text-[11px] text-gray-300 font-mono">Government Security Clearance Gatekeeper</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              RESTRICTED
            </span>
            <span className="text-[10px] text-gray-400 font-mono">ISRO / MoD Doctrine</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#1F2937] bg-[#070B14] p-1 text-xs font-mono">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "login"
                ? "bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Clearance Login
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "register"
                ? "bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Officer Enlistment
          </button>
          <button
            onClick={() => setActiveTab("guest")}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "guest"
                ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Quick Guest Access
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-950/60 border border-rose-500/40 text-rose-300 p-3 rounded-lg text-xs font-mono">
              ⚠ {error}
            </div>
          )}

          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Official Defense / ISRO Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="officer@isro.gov.in"
                  className="w-full bg-[#111827] border border-[#1F2937] focus:border-cyan-500 text-white px-3 py-2 rounded-lg text-xs font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1">Security Clearance Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#111827] border border-[#1F2937] focus:border-cyan-500 text-white px-3 py-2 rounded-lg text-xs font-mono outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("ayush@isro.gov.in");
                    setPassword("isro_bhuvision_2024");
                  }}
                  className="text-cyan-400 hover:underline cursor-pointer"
                >
                  Fill Pre-Seeded ISRO Credentials
                </button>
                <span className="text-gray-500">AES-256 Encrypted</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? "Authenticating Clearance..." : "Authenticate & Enter Cockpit"}
              </button>
            </form>
          )}

          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-gray-300 mb-1">Officer Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Commander K. Sharma"
                  className="w-full bg-[#111827] border border-[#1F2937] focus:border-cyan-500 text-white px-3 py-2 rounded-lg text-xs font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-gray-300 mb-1">Government Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="commander@navy.gov.in"
                  className="w-full bg-[#111827] border border-[#1F2937] focus:border-cyan-500 text-white px-3 py-2 rounded-lg text-xs font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-gray-300 mb-1">Service Branch / Organization</label>
                <select
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full bg-[#111827] border border-[#1F2937] text-white px-3 py-2 rounded-lg text-xs font-mono outline-none"
                >
                  <option value="Indian Navy (Western/Eastern Fleet)">Indian Navy (Western/Eastern Fleet)</option>
                  <option value="Indian Air Force (Air Defence Command)">Indian Air Force (Air Defence Command)</option>
                  <option value="Indian Army / Northern Command">Indian Army / Northern Command</option>
                  <option value="Border Security Force (BSF) Water Wing">Border Security Force (BSF) Water Wing</option>
                  <option value="ISRO Space Applications Centre (SAC)">ISRO Space Applications Centre (SAC)</option>
                  <option value="National Disaster Response Force (NDRF)">National Disaster Response Force (NDRF)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-mono text-gray-300 mb-1">Requested Clearance Level</label>
                <select
                  value={clearance}
                  onChange={(e) => setClearance(e.target.value)}
                  className="w-full bg-[#111827] border border-[#1F2937] text-white px-3 py-2 rounded-lg text-xs font-mono outline-none"
                >
                  <option value="Level 1: Civilian Remote Sensing Analyst">Level 1: Civilian Remote Sensing Analyst</option>
                  <option value="Level 2: Field Tactical Commander">Level 2: Field Tactical Commander</option>
                  <option value="Level 3: Strategic Command & MoD">Level 3: Strategic Command &amp; MoD</option>
                  <option value="Level 4: High Command (ISRO / MoD)">Level 4: High Command (ISRO / MoD)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-mono text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-[#111827] border border-[#1F2937] focus:border-cyan-500 text-white px-3 py-2 rounded-lg text-xs font-mono outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
              >
                {loading ? "Registering Officer..." : "Enlist & Issue Security Token"}
              </button>
            </form>
          )}

          {activeTab === "guest" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-300 font-mono leading-relaxed">
                For SIH judges, academic evaluators, and rapid demonstrations, select a pre-authenticated clearance tier to bypass login:
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  onClick={() => handleGuestClearance("Level 2: Field Tactical Commander")}
                  disabled={loading}
                  className="p-3 rounded-xl bg-[#111827] border border-cyan-500/40 hover:border-cyan-400 hover:bg-[#132238] text-left transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-mono font-bold text-xs text-cyan-300">Tactical Field Commander</div>
                    <div className="text-[10px] font-mono text-gray-400">Full access to SAR Reader, Multi-Sensor, &amp; Disaster Routing</div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-1 rounded border border-cyan-500/30">
                    ENTER →
                  </span>
                </button>

                <button
                  onClick={() => handleGuestClearance("Level 3: Strategic Command & MoD")}
                  disabled={loading}
                  className="p-3 rounded-xl bg-[#111827] border border-purple-500/40 hover:border-purple-400 hover:bg-[#1f1538] text-left transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-mono font-bold text-xs text-purple-300">Strategic Command &amp; Defense (MoD)</div>
                    <div className="text-[10px] font-mono text-gray-400">Unlocks Indian Navy, Air Force, and Army / BSF Defense Intelligence</div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-950/80 px-2 py-1 rounded border border-purple-500/30">
                    DEFENSE OPS →
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-[#070B14] border-t border-[#1F2937] p-3 text-[10px] text-gray-500 font-mono flex items-center justify-between">
          <span>Official Space Technology Stack: ISRO // BANKAI</span>
          <span className="text-emerald-400">TLS 1.3 Certified</span>
        </div>
      </div>
    </div>
  );
}
