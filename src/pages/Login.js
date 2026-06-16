import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, TextField, Button,
  InputAdornment, IconButton, Alert,
} from "@mui/material";
import VisibilityIcon    from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LockOutlinedIcon  from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ShieldIcon        from "@mui/icons-material/Shield";
import VerifiedUserIcon  from "@mui/icons-material/VerifiedUser";
import InsightsIcon      from "@mui/icons-material/Insights";
import HandshakeIcon     from "@mui/icons-material/Handshake";
import { login }         from "../auth";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    background: "#f8fafc",
    borderRadius: "10px",
    fontSize: "14px",
    color: "#1e293b",
    "& fieldset": { borderColor: "#e2e8f0" },
    "&:hover fieldset": { borderColor: "rgba(37,99,235,0.4)" },
    "&.Mui-focused fieldset": { borderColor: "#2563eb", borderWidth: "1px" },
  },
  "& .MuiInputBase-input::placeholder": { color: "#94a3b8", opacity: 1 },
};

export default function Login() {
  const navigate = useNavigate();

  const [username,     setUsername]     = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      const result = login(username.trim(), password);
      if (result.success) {
        navigate("/dashboard", { replace: true });
      } else {
        setError(result.error);
        setLoading(false);
      }
    }, 600);
  };

  const features = [
    { icon: <VerifiedUserIcon sx={{ fontSize: 18 }} />, text: "Manage lien requests end-to-end",  color: "#3b82f6" },
    { icon: <InsightsIcon     sx={{ fontSize: 18 }} />, text: "Real-time policy status tracking",  color: "#8b5cf6" },
    { icon: <HandshakeIcon    sx={{ fontSize: 18 }} />, text: "Direct insurer-to-bank workflow",   color: "#10b981" },
  ];

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", background: "#f8fafc" }}>

      {/* ── Left panel ── */}
      <Box sx={{
        flex: "0 0 52%",
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        justifyContent: "space-between",
        p: 6,
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(155deg, #eff6ff 0%, #f0f9ff 50%, #e0f2fe 100%)",
        borderRight: "1px solid #e2e8f0",
      }}>

        {/* Animated gradient orbs */}
        <Box sx={{ position:"absolute",top:"10%",left:"5%",width:360,height:360,borderRadius:"50%",background:"radial-gradient(circle,rgba(37,99,235,0.18) 0%,transparent 70%)",animation:"orb-float 7s ease-in-out infinite",pointerEvents:"none" }} />
        <Box sx={{ position:"absolute",bottom:"8%",right:"5%",width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,237,0.15) 0%,transparent 70%)",animation:"orb-float 9s ease-in-out infinite reverse",pointerEvents:"none" }} />
        <Box sx={{ position:"absolute",top:"55%",right:"15%",width:160,height:160,borderRadius:"50%",background:"radial-gradient(circle,rgba(16,185,129,0.12) 0%,transparent 70%)",animation:"orb-float 5s ease-in-out infinite",animationDelay:"2s",pointerEvents:"none" }} />

        {/* Grid pattern overlay */}
        <Box sx={{ position:"absolute",inset:0,opacity:0.04,backgroundImage:"linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none" }} />

        {/* Logo */}
        <Box display="flex" alignItems="center" gap={1.5} sx={{ position: "relative" }}>
          <Box sx={{ width:42,height:42,borderRadius:"12px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 6px 20px rgba(37,99,235,0.5)" }}>
            <ShieldIcon sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ color:"#0f172a",fontSize:"16px",fontWeight:800,letterSpacing:"-0.01em",lineHeight:1 }}>
              Insurer Portal
            </Typography>
            <Typography sx={{ color:"#64748b",fontSize:"10px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em" }}>
              Lien Management
            </Typography>
          </Box>
        </Box>

        {/* Hero text */}
        <Box sx={{ position: "relative", textAlign: "center", px: 2 }}>
          <Box sx={{ display:"inline-flex",alignItems:"center",gap:0.8,mb:3,background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:"20px",px:2,py:0.8 }}>
            <Box sx={{ width:6,height:6,borderRadius:"50%",background:"#3b82f6",boxShadow:"0 0 8px #3b82f6",animation:"live-dot 1.6s ease-in-out infinite" }} />
            <Typography sx={{ fontSize:"11px",fontWeight:700,color:"#60a5fa",letterSpacing:"0.06em" }}>
              SYSTEM ONLINE
            </Typography>
          </Box>

          <Typography sx={{ color:"#0f172a",fontSize:"32px",fontWeight:900,lineHeight:1.15,letterSpacing:"-0.03em",mb:2 }}>
            Lien Request{" "}
            <Box component="span" sx={{ background:"linear-gradient(135deg,#60a5fa,#a78bfa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>
              Management
            </Box>
          </Typography>

          <Typography sx={{ color:"#334155",fontSize:"14px",lineHeight:1.7,maxWidth:340,mx:"auto" }}>
            Streamline insurance lien workflows between insurers and banks with real-time status updates.
          </Typography>
        </Box>

        {/* Feature list */}
        <Box display="flex" flexDirection="column" gap={1.5} sx={{ position: "relative" }}>
          {features.map((f, i) => (
            <Box key={i} display="flex" alignItems="center" gap={2}
              sx={{ p:1.5,borderRadius:"12px",background:"rgba(255,255,255,0.7)",border:"1px solid #e2e8f0",transition:"all 0.2s","&:hover":{background:"#ffffff",borderColor:`${f.color}60`} }}>
              <Box sx={{ width:34,height:34,borderRadius:"10px",background:`${f.color}15`,border:`1px solid ${f.color}30`,display:"flex",alignItems:"center",justifyContent:"center",color:f.color,flexShrink:0 }}>
                {f.icon}
              </Box>
              <Typography sx={{ color:"#64748b",fontSize:"13px",fontWeight:500 }}>{f.text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Right panel — login form ── */}
      <Box sx={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",p:{xs:3,md:5},background:"#ffffff",position:"relative",overflow:"hidden" }}>
        <Box sx={{ position:"absolute",top:"20%",right:"10%",width:250,height:250,borderRadius:"50%",background:"radial-gradient(circle,rgba(37,99,235,0.06) 0%,transparent 70%)",pointerEvents:"none" }} />

        <Box sx={{ width:"100%",maxWidth:400,position:"relative",animation:"fade-up 0.5s ease" }}>

          {/* Mobile logo */}
          <Box sx={{ display:{xs:"flex",md:"none"},alignItems:"center",gap:1.5,mb:4 }}>
            <Box sx={{ width:38,height:38,borderRadius:"10px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <ShieldIcon sx={{ color:"#fff",fontSize:20 }} />
            </Box>
            <Typography sx={{ fontSize:"16px",fontWeight:800,color:"#0f172a" }}>Insurer Portal</Typography>
          </Box>

          <Typography sx={{ fontSize:"28px",fontWeight:900,color:"#0f172a",letterSpacing:"-0.03em",mb:0.5 }}>
            Welcome back
          </Typography>
          <Typography sx={{ fontSize:"14px",color:"#334155",mb:4,fontWeight:500 }}>
            Sign in to your portal account
          </Typography>

          <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2.5}>
            {error && (
              <Alert severity="error" sx={{ borderRadius:"10px",fontSize:"13px",background:"rgba(244,63,94,0.08)",border:"1px solid rgba(244,63,94,0.25)",color:"#fb7185","& .MuiAlert-icon":{color:"#f43f5e"} }}>
                {error}
              </Alert>
            )}

            <Box>
              <Typography sx={{ fontSize:"11px",fontWeight:700,color:"#334155",mb:1,letterSpacing:"0.08em",textTransform:"uppercase" }}>
                Username
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter your username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                autoComplete="username"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon sx={{ color:"#334155",fontSize:18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize:"11px",fontWeight:700,color:"#334155",mb:1,letterSpacing:"0.08em",textTransform:"uppercase" }}>
                Password
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color:"#334155",fontSize:18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" size="small" sx={{ color:"#334155","&:hover":{color:"#94a3b8"} }}>
                        {showPassword ? <VisibilityOffIcon sx={{ fontSize:18 }} /> : <VisibilityIcon sx={{ fontSize:18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt:0.5,py:1.5,borderRadius:"10px",fontSize:"14px",fontWeight:700,textTransform:"none",
                background: loading ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#1d4ed8,#2563eb)",
                boxShadow: loading ? "none" : "0 6px 20px rgba(37,99,235,0.45)",
                border:"1px solid rgba(59,130,246,0.3)",color:"#fff",
                "&:hover":{ background:"linear-gradient(135deg,#1e40af,#1d4ed8)",boxShadow:"0 8px 28px rgba(37,99,235,0.6)",transform:"translateY(-1px)" },
                "&:disabled":{ color:"#2d5a8a" },
                transition:"all 0.2s ease",
              }}
            >
              {loading ? "Signing in…" : "Sign In →"}
            </Button>
          </Box>

          <Typography sx={{ mt:4,textAlign:"center",fontSize:"11px",color:"#2d5a8a" }}>
            Insurer Portal v1.0 · Secure Access
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}