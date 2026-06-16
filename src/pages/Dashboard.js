import { useEffect, useState } from "react";
import {
  Typography,
  CircularProgress,
  Button,
  Box,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DashboardCards    from "../components/DashboardCards";
import LienTable         from "../components/LienTable";
import LienDetailsDrawer from "../components/LienDetailsDrawer";
import Sidebar           from "../components/Sidebar";

import { getAuth }      from "../auth";
import { fetchRecords } from "../api/api";

import { useSearchParams } from "react-router-dom";

const SIDEBAR_W = 220;
const actionColors = {
  Confirmed: "#10b981",
  Rejected: "#f43f5e",
  Lapsed: "#f59e0b",
  "Premium Overdue": "#8b5cf6",
  Reinstated: "#10b981",
};
// ── Inline Policy Shield SVG ──────────────────────────────────────────────────
function PolicyShieldIllustration() {
  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      {/* Outer glow ring */}
      <circle cx="110" cy="110" r="100" fill="rgba(255,255,255,0.04)" />
      <circle cx="110" cy="110" r="84"  fill="rgba(255,255,255,0.05)" />

      {/* Shield body */}
      <path
        d="M110 28 L172 54 L172 108 Q172 158 110 186 Q48 158 48 108 L48 54 Z"
        fill="rgba(255,255,255,0.10)"
        stroke="rgba(255,255,255,0.30)"
        strokeWidth="1.5"
      />

      {/* Inner shield */}
      <path
        d="M110 46 L158 66 L158 108 Q158 144 110 163 Q62 144 62 108 L62 66 Z"
        fill="rgba(255,255,255,0.07)"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
      />

      {/* Document lines inside shield */}
      <rect x="84" y="88"  width="52" height="4" rx="2" fill="rgba(255,255,255,0.35)" />
      <rect x="84" y="100" width="42" height="4" rx="2" fill="rgba(255,255,255,0.25)" />
      <rect x="84" y="112" width="48" height="4" rx="2" fill="rgba(255,255,255,0.25)" />

      {/* Green checkmark circle */}
      <circle cx="110" cy="138" r="18" fill="#10b981" opacity="0.9" />
      <circle cx="110" cy="138" r="18" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      {/* Checkmark path */}
      <path
        d="M101 138 L107 145 L120 130"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Top label badge */}
      <rect x="78" y="52" width="64" height="20" rx="10" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <text x="110" y="66" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10" fontWeight="600" fontFamily="sans-serif" letterSpacing="0.08em">
        POLICY LIEN
      </text>

      {/* Decorative floating dots */}
      <circle cx="52"  cy="62"  r="4" fill="rgba(255,255,255,0.15)" />
      <circle cx="168" cy="68"  r="3" fill="rgba(255,255,255,0.12)" />
      <circle cx="44"  cy="130" r="3" fill="rgba(16,185,129,0.5)"   />
      <circle cx="176" cy="138" r="4" fill="rgba(255,255,255,0.10)" />
      <circle cx="160" cy="170" r="3" fill="rgba(255,255,255,0.12)" />
      <circle cx="58"  cy="165" r="4" fill="rgba(255,255,255,0.10)" />

      {/* Orbit ring around shield */}
      <ellipse
        cx="110" cy="108"
        rx="76" ry="76"
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="1"
        strokeDasharray="4 6"
      />
    </svg>
  );
}

export default function Dashboard() {
  const auth            = getAuth();
  const selectedInsurer = auth?.insurer || "BOTSWANA_GENERAL";
  const insurerDisplay  = auth?.display  || "Insurer";

  const [data,          setData]         = useState([]);
  const [selected,      setSelected]     = useState(null);
  const [loading,       setLoading]      = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [activityLog,   setActivityLog]  = useState([]);
  const [sidebarOpen,   setSidebarOpen]  = useState(false);

  const [searchParams] = useSearchParams();
  const [showLienTable, setShowLienTable] = useState(
    searchParams.get("section") === "lien-control-center"
  );

  useEffect(() => {
    setShowLienTable(searchParams.get("section") === "lien-control-center");
  }, [searchParams]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInsurer]);

  const loadData = async () => {
    try {
      setLoading(true);
      const records = await fetchRecords(selectedInsurer);
      records.sort((a, b) => b.created_at - a.created_at);
      setData(records);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionComplete = (recordId, updatedFields, actionLabel) => {
    setData((prev) =>
      prev.map((row) => {
        const matched = row.id === recordId || row.bankReference === recordId;
        return matched ? { ...row, ...updatedFields } : row;
      })
    );
    setSelected((prev) => {
      if (!prev) return prev;
      const matched = prev.id === recordId || prev.bankReference === recordId;
      return matched ? { ...prev, ...updatedFields } : prev;
    });
    const record = data.find((d) => d.id === recordId || d.bankReference === recordId);
    setActivityLog((prev) => [
      { action: actionLabel, lienRequestId: record?.lienRequestId || recordId, time: new Date().toLocaleString() },
      ...prev,
    ]);
  };

  // Unique banner metrics

  return (
    <Box display="flex" sx={{ background: "#f1f5f9", minHeight: "100vh" }}>
      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <Box sx={{
        ml: { xs: 0, lg: `${SIDEBAR_W}px` },
        width: { xs: "100%", lg: `calc(100% - ${SIDEBAR_W}px)` },
        p: { xs: 2, sm: 3 },
        minWidth: 0,
      }}>

        {/* ── WELCOME BANNER ── */}
        {!showLienTable && (
          <Box sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "18px",
            background: "linear-gradient(135deg, #052b5f 0%, #0057b8 50%, #1a3fbe 100%)",
            px: { xs: 3, md: 5 },
            py: { xs: 2.5, md: 3.2 },
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 3,
            boxShadow: "0 20px 45px rgba(15,23,42,0.20)",
          }}>

            {/* Background decoration */}
            <Box sx={{ position:"absolute", top:-60, right:-60, width:300, height:300, borderRadius:"50%", background:"rgba(255,255,255,0.04)", pointerEvents:"none" }} />
            <Box sx={{ position:"absolute", bottom:-50, left:"38%", width:220, height:220, borderRadius:"50%", background:"rgba(255,255,255,0.03)", pointerEvents:"none" }} />

            {/* Left: Welcome text */}
            <Box sx={{ position:"relative", zIndex:1, maxWidth: 620 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>               
              </Box>

              <Typography sx={{ color:"#fff", fontWeight:800, lineHeight:1.15, fontSize:{ xs:"20px", md:"28px" }, mb:1.5, letterSpacing:"-0.02em" }}>
                Welcome Back,<br />
                <Box component="span" sx={{ color:"#93c5fd" }}>{insurerDisplay}</Box>
              </Typography>
                <Typography
  sx={{
    color: "rgba(255,255,255,0.72)",
    fontSize: { xs: "13px", md: "14px" },
    lineHeight: 1.7,
    mb: 2,
  }}
>
  Policy-backed credit facility portal. Monitor live lien activity,
  track loan disbursements and manage bank interconnections in real time.
</Typography>
          
             {lastRefreshed && (
  <Typography
    sx={{
      color: "rgba(255,255,255,0.75)",
      fontSize: "12px",
      fontWeight: 500,
      mt: 1,
    }}
  >
    Updated{" "}
    {lastRefreshed.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })}
  </Typography>
)}
            </Box>

            {/* Right: Policy Shield illustration */}
            <Box sx={{
              position: "relative", zIndex: 1,
              display: { xs:"none", md:"flex" },
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              opacity: 0.92,
            }}>
              <PolicyShieldIllustration />
            </Box>

          </Box>
        )}

       {/* ── LIEN CONTROL CENTER header ── */}
{showLienTable && (
  <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    flexWrap="wrap"
    gap={2}
    mb={2}
  >
    {/* Left Side */}
    <Box>
      <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
        <Box
          sx={{
            width: 4,
            height: 28,
            borderRadius: "4px",
            background: "linear-gradient(180deg,#2563eb,#7c3aed)",
          }}
        />

        <Typography
          sx={{
            fontSize: "26px",
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.02em",
          }}
        >
          Lien Control Center
        </Typography>
      </Box>

      {lastRefreshed && (
        <Typography
          sx={{
            fontSize: "11px",
            color: "#64748b",
            ml: "20px",
            fontWeight: 500,
          }}
        >
          Updated{" "}
          {lastRefreshed.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })}
        </Typography>
      )}
    </Box>

    {/* Refresh Button */}
    <Button
      variant="contained"
      startIcon={
        loading ? (
          <CircularProgress
            size={13}
            sx={{ color: "rgba(255,255,255,0.7)" }}
          />
        ) : (
          <RefreshIcon sx={{ fontSize: "16px !important" }} />
        )
      }
      disabled={loading}
      onClick={loadData}
      sx={{
        background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
        borderRadius: "10px",
        textTransform: "none",
        fontWeight: 700,
        fontSize: "13px",
       px: { xs: 2, sm: 2.5 },
        py: 1,
        boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
        border: "1px solid rgba(59,130,246,0.3)",
        "&:hover": {
          background: "linear-gradient(135deg, #1e40af, #1d4ed8)",
          boxShadow: "0 6px 20px rgba(37,99,235,0.55)",
          transform: "translateY(-1px)",
        },
        "&:disabled": {
          background: "#f1f5f9",
          color: "#94a3b8",
        },
        transition: "all 0.2s ease",
      }}
    >
      {loading ? "Loading…" : "Refresh"}
    </Button>
  </Box>
)}

        {/* ── Insurer badge (Lien Control Center only) ── */}
        {showLienTable && (
          <Box display="flex" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
            <Typography sx={{ fontSize:"12px", color:"#475569", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>
              Insurer
            </Typography>
            <Box sx={{ display:"flex", alignItems:"center", gap:1, background:"#ffffff", border:"1px solid #e2e8f0", borderRadius:"10px", px:2, py:0.9 }}>
              <Box sx={{ width:8, height:8, borderRadius:"50%", background:"#10b981", boxShadow:"0 0 6px #10b981" }} />
              <Typography sx={{ fontSize:"13px", fontWeight:700, color:"#1e293b" }}>{insurerDisplay}</Typography>
            </Box>
            <Box sx={{ display:"flex", alignItems:"center", gap:0.8, background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.2)", borderRadius:"20px", px:1.4, py:0.5 }}>
              <Typography sx={{ fontSize:"12px", fontWeight:700, color:"#60a5fa" }}>{data.length}</Typography>
              <Typography sx={{ fontSize:"11px", color:"#334155", fontWeight:500 }}>records</Typography>
            </Box>
          </Box>
        )}

        {/* ── Dashboard cards ── */}
        {!showLienTable && <DashboardCards data={data} />}

        {/* ── Lien table ── */}
        {showLienTable && (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ borderRadius:"16px", background:"#ffffff", border:"1px solid #e2e8f0", overflow:"hidden" }}>
              {loading ? (
                <Box display="flex" alignItems="center" justifyContent="center" p={10} gap={2}>
                  <CircularProgress size={26} sx={{ color:"#3b82f6" }} />
                  <Typography sx={{ color:"#334155", fontSize:"14px", fontWeight:600 }}>Fetching records…</Typography>
                </Box>
              ) : data.length === 0 ? (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={10} gap={1.5}>
                  <Typography sx={{ fontSize:"32px" }}>📭</Typography>
                  <Typography sx={{ color:"#334155", fontSize:"14px", fontWeight:600 }}>No records found</Typography>
                </Box>
              ) : (
                <LienTable rows={data} onRowClick={setSelected} selectedInsurer={selectedInsurer} />
              )}
            </Box>
          </Box>
        )}

        {/* ── Recent Activity ── */}
        {showLienTable && (
          <Box sx={{ mt:3, background:"#ffffff", border:"1px solid #e2e8f0", borderRadius:"16px", p:3, position:"relative", overflow:"hidden" }}>
            <Box sx={{ position:"absolute", top:-20, right:-20, width:80, height:80, borderRadius:"50%", background:"rgba(139,92,246,0.1)", filter:"blur(20px)", pointerEvents:"none" }} />
            <Box display="flex" alignItems="center" gap={1} mb={2.5}>
              <Box sx={{ width:30, height:30, borderRadius:"8px", background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <AccessTimeIcon sx={{ fontSize:15, color:"#8b5cf6" }} />
              </Box>
              <Typography sx={{ fontSize:"13px", fontWeight:800, color:"#0f172a" }}>Recent Activity</Typography>
            </Box>
            {activityLog.length === 0 ? (
              <Typography sx={{ fontSize:"12px", color:"#64748b", fontWeight:500 }}>No actions yet</Typography>
            ) : (
              <Box display="flex" flexDirection="column" gap={1.5}>
                {activityLog.slice(0, 5).map((h, i) => (
                  <Box key={i} display="flex" alignItems="flex-start" gap={1.5}>
                    <Box sx={{ width:7, height:7, borderRadius:"50%", mt:0.55, flexShrink:0, background:actionColors[h.action]||"#475569", boxShadow:`0 0 6px ${actionColors[h.action]||"#475569"}` }} />
                    <Box>
                      <Typography sx={{ fontSize:"12px", fontWeight:600, color:"#94a3b8" }}>
                        {h.action}
                        {h.lienRequestId && <Box component="span" sx={{ color:"#475569", fontWeight:400 }}>{" — "}{h.lienRequestId}</Box>}
                      </Typography>
                      <Typography sx={{ fontSize:"10px", color:"#64748b", mt:0.3, fontWeight:500 }}>{h.time}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* ── Detail drawer ── */}
        <LienDetailsDrawer
          open={!!selected}
          data={selected}
          onClose={() => setSelected(null)}
          selectedInsurer={selectedInsurer}
          onActionComplete={handleActionComplete}
        />
      </Box>
    </Box>
  );
}