import { Box, Typography } from "@mui/material";

export default function StatusChart({ counts }) {
  const total = counts.total || 1;
  const pct   = (v) => Math.round(((v || 0) / total) * 100);

  const bars = [
    {
      label:  "Confirmed",
      value:  counts.approved,
      grad:   "linear-gradient(90deg, #059669, #34d399)",
      glow:   "rgba(16,185,129,0.5)",
      track:  "rgba(16,185,129,0.08)",
      dot:    "#10b981",
    },
    {
      label:  "Acknowledged",
      value:  counts.pending,
      grad:   "linear-gradient(90deg, #d97706, #fbbf24)",
      glow:   "rgba(245,158,11,0.5)",
      track:  "rgba(245,158,11,0.08)",
      dot:    "#f59e0b",
    },
    {
      label:  "Rejected",
      value:  counts.rejected,
      grad:   "linear-gradient(90deg, #e11d48, #fb7185)",
      glow:   "rgba(244,63,94,0.5)",
      track:  "rgba(244,63,94,0.08)",
      dot:    "#f43f5e",
    },
  ];

  return (
    <Box sx={{
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: "16px",
      p: 3,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background orb */}
      <Box sx={{
        position: "absolute", bottom: -20, right: -20,
        width: 100, height: 100, borderRadius: "50%",
        background: "rgba(59,130,246,0.08)", filter: "blur(24px)",
        pointerEvents: "none",
      }} />

      <Box display="flex" alignItems="baseline" gap={1} mb={0.5}>
        <Typography sx={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>
          Status Breakdown
        </Typography>
      </Box>
      <Typography sx={{ fontSize: "12px", color: "#334155", mb: 3, fontWeight: 500 }}>
        {counts.total || 0} total lien requests
      </Typography>

      <Box display="flex" flexDirection="column" gap={2.8}>
        {bars.map((bar, i) => (
          <Box key={bar.label} sx={{ animation: "fade-up 0.4s ease both", animationDelay: `${i * 100}ms` }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: bar.dot,
                  boxShadow: `0 0 8px ${bar.dot}`,
                }} />
                <Typography sx={{ fontSize: "12px", color: "#475569", fontWeight: 600 }}>
                  {bar.label}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography sx={{ fontSize: "14px", color: "#1e293b", fontWeight: 800 }}>
                  {bar.value || 0}
                </Typography>
                <Typography sx={{
                  fontSize: "10px", color: bar.dot, fontWeight: 700,
                  background: bar.track,
                  px: 0.8, py: 0.2, borderRadius: "6px",
                }}>
                  {pct(bar.value)}%
                </Typography>
              </Box>
            </Box>

            <Box sx={{ height: 7, borderRadius: "10px", background: bar.track, overflow: "hidden" }}>
              <Box sx={{
                height: "100%",
                width: `${pct(bar.value)}%`,
                background: bar.grad,
                borderRadius: "10px",
                boxShadow: `0 0 10px ${bar.glow}`,
                transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)",
                minWidth: (bar.value || 0) > 0 ? "6px" : "0",
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0, bottom: 0, right: 0,
                  width: 8, borderRadius: "10px",
                  background: "rgba(255,255,255,0.4)",
                  filter: "blur(2px)",
                },
              }} />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
