import { Box, Typography, Button, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ShieldIcon       from "@mui/icons-material/Shield";
import BoltIcon         from "@mui/icons-material/Bolt";
import SecurityIcon     from "@mui/icons-material/Security";
import BarChartIcon     from "@mui/icons-material/BarChart";

const FEATURES = [
  { icon: <BoltIcon sx={{ fontSize: 18 }} />,       text: "Real-time updates",       color: "#f59e0b" },
  { icon: <SecurityIcon sx={{ fontSize: 18 }} />,   text: "Secure lien workflows",   color: "#3b82f6" },
  { icon: <BarChartIcon sx={{ fontSize: 18 }} />,   text: "Live analytics",          color: "#8b5cf6" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(155deg, #f0f4ff 0%, #f8fafc 50%, #eff6ff 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      px: 3,
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Grid pattern */}
      <Box sx={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
        pointerEvents: "none",
      }} />

      {/* Animated orbs */}
      <Box sx={{
        position: "absolute", top: "15%", left: "8%",
        width: 380, height: 380, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 70%)",
        animation: "orb-float 8s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <Box sx={{
        position: "absolute", bottom: "10%", right: "6%",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
        animation: "orb-float 10s ease-in-out infinite reverse",
        pointerEvents: "none",
      }} />
      <Box sx={{
        position: "absolute", top: "60%", left: "60%",
        width: 200, height: 200, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)",
        animation: "orb-float 6s ease-in-out infinite",
        animationDelay: "3s",
        pointerEvents: "none",
      }} />

      {/* Content */}
      <Box sx={{ position: "relative", maxWidth: 580, animation: "fade-up 0.6s ease" }}>

        {/* Badge */}
        <Chip
          icon={<ShieldIcon sx={{ fontSize: "14px !important", color: "#3b82f6" }} />}
          label="Insurer Management Portal"
          sx={{
            mb: 3,
            background: "rgba(37,99,235,0.1)",
            color: "#60a5fa",
            border: "1px solid rgba(37,99,235,0.25)",
            fontSize: "12px", fontWeight: 700,
            "& .MuiChip-icon": { color: "#3b82f6 !important" },
          }}
        />

        {/* Headline */}
        <Typography sx={{
          fontSize: "clamp(32px, 5.5vw, 58px)",
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: "-0.04em",
          color: "#0f172a",
          mb: 2,
        }}>
          Manage Lien Requests{" "}
          <Box component="span" sx={{
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #10b981)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Efficiently
          </Box>
        </Typography>

        {/* Sub-headline */}
        <Typography sx={{
          fontSize: "16px", color: "#334155", mb: 5,
          lineHeight: 1.8, fontWeight: 400, maxWidth: 460, mx: "auto",
        }}>
          Review, acknowledge, confirm, and track lien requests across all insurers from a single unified dashboard.
        </Typography>

        {/* Feature chips */}
        <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1.5} mb={5}>
          {FEATURES.map((f, i) => (
            <Box key={i} display="flex" alignItems="center" gap={0.8}
              sx={{
                background: "rgba(0,0,0,0.03)",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "20px", px: 1.8, py: 0.8,
                transition: "all 0.2s",
                "&:hover": { background: "rgba(0,0,0,0.05)", borderColor: `${f.color}60` },
              }}>
              <Box sx={{ color: f.color }}>{f.icon}</Box>
              <Typography sx={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
                {f.text}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* CTA */}
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate("/dashboard")}
          sx={{
            background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
            borderRadius: "12px",
            px: 5, py: 1.6,
            fontSize: "15px", fontWeight: 700,
            textTransform: "none",
            boxShadow: "0 8px 28px rgba(37,99,235,0.5)",
            border: "1px solid rgba(59,130,246,0.4)",
            "&:hover": {
              background: "linear-gradient(135deg, #1e40af, #1d4ed8)",
              transform: "translateY(-2px)",
              boxShadow: "0 12px 36px rgba(37,99,235,0.65)",
            },
            transition: "all 0.25s ease",
          }}
        >
          Open Dashboard
        </Button>
      </Box>
    </Box>
  );
}
