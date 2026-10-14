"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAdmin } from './AuthGate';

export default function AdminShell({ children, noScroll = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentUser = useAdmin()?.user;
  if (!currentUser || !['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#0F172A" }}>
        <div style={{ textAlign: "center", color: "#F8FAFC" }}>
          <div style={{
            width: 36, height: 36, border: "3px solid #B91C1C", borderTopColor: "transparent",
            borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px"
          }} />
          <p style={{ fontSize: "0.8125rem", color: "#94A3B8", fontWeight: 600 }}>Verifying admin authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", maxHeight: "100vh", overflow: "hidden" }}>
      <Sidebar user={currentUser} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div
        className="admin-main-content"
        style={{
          marginLeft: 220,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          maxHeight: "100vh",
          overflow: "hidden",
          transition: "margin-left 250ms ease-in-out",
          width: "calc(100% - 220px)",
        }}
      >
        <Topbar user={currentUser} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main
          className="admin-main-wrapper"
          style={{
            flex: 1,
            padding: "1.25rem 1.5rem",
            backgroundColor: "#F1F5F9",
            overflowX: "hidden",
            overflowY: noScroll ? "hidden" : "auto",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            height: "calc(100vh - 64px)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
