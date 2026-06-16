import { Grid, Typography, Box } from "@mui/material";
import AssignmentIcon   from "@mui/icons-material/Assignment";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import CheckCircleIcon  from "@mui/icons-material/CheckCircle";
import CancelIcon       from "@mui/icons-material/Cancel";
 
export default function DashboardCards({ data }) {
  const safeData     = Array.isArray(data) ? data : [];
  const total        = safeData.length;
  const acknowledged = safeData.filter((d) => !d?.Status || d?.Status === "Acknowledged").length;
  const confirmed    = safeData.filter((d) => String(d?.Status || "").trim() === "Confirmed").length;
  const rejected     = safeData.filter((d) => String(d?.Status || "").trim() === "Rejected").length;
  const pct = (v) => (total > 0 ? Math.round((v / total) * 100) : 0);
 
  const cards = [
    {
      title: "Total Requests", value: total, icon: <AssignmentIcon sx={{ fontSize: 22 }} />,
      gradient: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
      glow:     "rgba(59,130,246,0.35)",
      bar:      "linear-gradient(90deg, #1d4ed8, #60a5fa)",
      barGlow:  "rgba(59,130,246,0.5)",
      pct:      100,
    },
    {
      title: "Acknowledged", value: acknowledged, icon: <HourglassTopIcon sx={{ fontSize: 22 }} />,
      gradient: "linear-gradient(135deg, #b45309, #f59e0b)",
      glow:     "rgba(245,158,11,0.35)",
      bar:      "linear-gradient(90deg, #d97706, #fbbf24)",
      barGlow:  "rgba(245,158,11,0.5)",
      pct:      pct(acknowledged),
    },
    {
      title: "Confirmed", value: confirmed, icon: <CheckCircleIcon sx={{ fontSize: 22 }} />,
      gradient: "linear-gradient(135deg, #059669, #10b981)",
      glow:     "rgba(16,185,129,0.35)",
      bar:      "linear-gradient(90deg, #059669, #34d399)",
      barGlow:  "rgba(16,185,129,0.5)",
      pct:      pct(confirmed),
    },
    {
      title: "Rejected", value: rejected, icon: <CancelIcon sx={{ fontSize: 22 }} />,
      gradient: "linear-gradient(135deg, #be123c, #f43f5e)",
      glow:     "rgba(244,63,94,0.35)",
      bar:      "linear-gradient(90deg, #e11d48, #fb7185)",
      barGlow:  "rgba(244,63,94,0.5)",
      pct:      pct(rejected),
    },
  ];
 
  return (
    <Grid container spacing={2.5} mb={3}>
      {cards.map((card, i) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
          <Box sx={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            p: 3,
            position: "relative",
            overflow: "hidden",
            cursor: "default",
            transition: "transform 0.25s ease, box-shadow 0.25s ease",
            "&:hover": {
              transform: "translateY(-3px)",
              boxShadow: `0 12px 36px ${card.glow}, 0 0 0 1px #cbd5e1`,
              border: "1px solid #cbd5e1",
            },
            animation: "fade-up 0.4s ease both",
            animationDelay: `${i * 80}ms`,
          }}>
 
            {/* Subtle top glow line */}
            <Box sx={{
              position: "absolute", top: 0, left: "10%", right: "10%", height: "1px",
              background: `linear-gradient(90deg, transparent, ${card.glow}, transparent)`,
            }} />
 
            {/* Background orb */}
            <Box sx={{
              position: "absolute", top: -30, right: -30,
              width: 110, height: 110, borderRadius: "50%",
              background: card.glow, filter: "blur(30px)",
              pointerEvents: "none",
            }} />
 
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
              <Box>
                <Typography sx={{
                  fontSize: "10px", fontWeight: 700, color: "#475569",
                  textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5,
                }}>
                  {card.title}
                </Typography>
                <Typography sx={{
                  fontSize: "38px", fontWeight: 900, color: "#0f172a",
                  lineHeight: 1, letterSpacing: "-0.03em",
                  textShadow: `0 0 30px ${card.glow}`,
                }}>
                  {card.value}
                </Typography>
              </Box>
 
              <Box sx={{
                width: 48, height: 48, borderRadius: "13px",
                background: card.gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", flexShrink: 0,
                boxShadow: `0 6px 20px ${card.glow}`,
              }}>
                {card.icon}
              </Box>
            </Box>
 
            {/* Animated progress bar */}
            <Box sx={{ height: 5, borderRadius: "10px", background: "#e2e8f0", overflow: "hidden" }}>
              <Box sx={{
                height: "100%",
                width: `${card.pct}%`,
                background: card.bar,
                borderRadius: "10px",
                boxShadow: `0 0 8px ${card.barGlow}`,
                transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
                animation: "bar-fill 0.8s ease both",
                animationDelay: `${i * 100 + 200}ms`,
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0, bottom: 0,
                  width: "40%",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  animation: "shimmer 2s ease 1s",
                },
              }} />
            </Box>
 
            <Typography sx={{ fontSize: "11px", color: "#334155", mt: 1.2, fontWeight: 600 }}>
              {total > 0 ? `${card.pct}% of total` : "No data yet"}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}