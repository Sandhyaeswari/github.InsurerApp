import { Box, Typography, Tooltip, Avatar, Button, Drawer, IconButton } from "@mui/material";
import DashboardIcon  from "@mui/icons-material/Dashboard";
import TableChartIcon from "@mui/icons-material/TableChart";
import LogoutIcon     from "@mui/icons-material/Logout";
import CloseIcon      from "@mui/icons-material/Close";
import ShieldIcon     from "@mui/icons-material/Shield";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuth, logout } from "../auth";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardIcon sx={{ fontSize: 18 }} />,
  },
  {
    label: "Lien Control Center",
    path: "/dashboard?section=lien-control-center",
    icon: <TableChartIcon sx={{ fontSize: 18 }} />,
  },
];

export const SIDEBAR_WIDTH = 220;

function SidebarContent({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const auth     = getAuth();

  const handleLogout = () => { logout(); navigate("/", { replace: true }); };

  return (
    <Box sx={{
      width: SIDEBAR_WIDTH,
      height: "100%",
      background: "#ffffff",
      borderRight: "1px solid #e2e8f0",
      display: "flex",
      flexDirection: "column",
      p: 2,
      gap: 1,
      overflow: "hidden",
    }}>

      {/* ── Logo ── */}
      <Box sx={{
        px: 1, py: 2, mb: 0.5,
        borderBottom: "1px solid #e2e8f0",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      }}>
        <Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
            <Box sx={{
              width: 38, height: 38, borderRadius: "11px",
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(37,99,235,0.5)",
              flexShrink: 0,
            }}>
              <ShieldIcon sx={{ color: "#fff", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ color: "#0f172a", fontSize: "14px", fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1 }}>
                Insurer Portal
              </Typography>
              <Typography sx={{ color: "#94a3b8", fontSize: "9px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", mt: 0.4 }}>
                Lien Management
              </Typography>
            </Box>
          </Box>

          {/* Live badge */}
          <Box display="flex" alignItems="center" gap={0.8}
            sx={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "20px", px: 1.2, py: 0.4, width: "fit-content" }}>
            <Box sx={{
              width: 6, height: 6, borderRadius: "50%", background: "#10b981",
              animation: "live-dot 1.6s ease-in-out infinite",
              boxShadow: "0 0 6px #10b981",
            }} />
            <Typography sx={{ fontSize: "9px", fontWeight: 700, color: "#10b981", letterSpacing: "0.08em" }}>
              LIVE
            </Typography>
          </Box>
        </Box>

        {onClose && (
          <IconButton size="small" onClick={onClose} sx={{ color: "#94a3b8", mt: 0.5, "&:hover": { color: "#475569" } }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>

      {/* ── Navigation ── */}
      <Box sx={{ flex: 1, pt: 1 }}>
       

        {NAV_ITEMS.map((item) => {
         const active =
  location.pathname === "/dashboard" &&
  (
    item.path === "/dashboard" ||
    location.search.includes("lien-control-center")
  )
    ? item.label === "Lien Control Center"
      ? location.search.includes("lien-control-center")
      : !location.search.includes("lien-control-center")
    : location.pathname === item.path;
          return (
            <Tooltip key={item.path} title={item.label} placement="right" arrow>
              <Box
                onClick={() => { navigate(item.path); if (onClose) onClose(); }}
                sx={{
                  display: "flex", alignItems: "center", gap: 1.5,
                  px: 1.5, py: 1.1, borderRadius: "10px", cursor: "pointer",
                  position: "relative", overflow: "hidden", mb: 0.5,
                  color: active ? "#1d4ed8" : "#64748b",
                  background: active
                    ? "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.06))"
                    : "transparent",
                  border: active ? "1px solid rgba(37,99,235,0.2)" : "1px solid transparent",
                  boxShadow: active ? "0 2px 8px rgba(37,99,235,0.12)" : "none",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    background: active
                      ? "linear-gradient(135deg, rgba(37,99,235,0.14), rgba(124,58,237,0.08))"
                      : "rgba(59,130,246,0.05)",
                    color: "#2563eb",
                    border: "1px solid rgba(37,99,235,0.15)",
                  },
                }}
              >
                {active && (
                  <Box sx={{
                    position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                    width: 3, height: "60%", borderRadius: "0 3px 3px 0",
                    background: "linear-gradient(180deg, #3b82f6, #8b5cf6)",
                    boxShadow: "0 0 8px #3b82f6",
                  }} />
                )}
                <Box sx={{ color: active ? "#2563eb" : "#94a3b8", display: "flex", transition: "color 0.2s" }}>
                  {item.icon}
                </Box>
              <Typography
                 sx={{
                     fontSize: "13px",
                     fontWeight: active ? 700 : 500,
                     flex: 1,
                     whiteSpace: "nowrap",
                        }}>
                    {item.label}
                  </Typography>
                {active && (
                  <Box sx={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "#3b82f6", boxShadow: "0 0 8px #3b82f6",
                  }} />
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* ── User + Logout ── */}
      <Box sx={{ borderTop: "1px solid #e2e8f0", pt: 2 }}>
        <Box sx={{
          display: "flex", alignItems: "center", gap: 1.5,
          p: 1.5, borderRadius: "10px", mb: 1,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
        }}>
          <Avatar sx={{
            width: 32, height: 32, fontSize: "12px", fontWeight: 700,
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            boxShadow: "0 2px 10px rgba(37,99,235,0.4)",
          }}>
            {auth?.username?.[0]?.toUpperCase() || "A"}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>
              {auth?.username || "Admin"}
            </Typography>
            <Typography sx={{ fontSize: "10px", color: "#94a3b8" }}>
              Administrator
            </Typography>
          </Box>
        </Box>

        <Button
          fullWidth
          startIcon={<LogoutIcon sx={{ fontSize: "14px !important" }} />}
          onClick={handleLogout}
          sx={{
            justifyContent: "flex-start", px: 1.5, py: 0.9,
            borderRadius: "8px", fontSize: "12px", fontWeight: 600,
            textTransform: "none", color: "#64748b",
            border: "1px solid transparent",
            "&:hover": { background: "rgba(244,63,94,0.08)", color: "#e11d48", border: "1px solid rgba(244,63,94,0.2)" },
            transition: "all 0.2s",
          }}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  return (
    <>
      <Box sx={{
        display: { xs: "none", lg: "flex" },
        width: SIDEBAR_WIDTH,
        height: "100vh",
        position: "fixed",
        top: 0, left: 0,
        zIndex: 1200,
      }}>
        <SidebarContent />
      </Box>

      <Drawer
        variant="temporary"
        open={!!mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH, border: "none",
            background: "#ffffff",
          },
        }}
      >
        <SidebarContent onClose={onMobileClose} />
      </Drawer>
    </>
  );
}