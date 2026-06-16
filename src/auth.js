// ─── User → Insurer mapping ───────────────────────────────────────────────────
const USERS = {
  Botswana: {
    password: "Botswana@123",
    insurer:  "BOTSWANA_GENERAL",
    display:  "Botswana General",
  },
  Techbulls: {
    password: "Techbulls@123",
    insurer:  "TECHBULLS",
    display:  "Techbulls",
  },
};

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export function login(username, password) {
  const entry = USERS[username];
  if (!entry) return { success: false, error: "Invalid username or password" };
  if (entry.password !== password) return { success: false, error: "Invalid username or password" };

  const auth = { username, insurer: entry.insurer, display: entry.display };
  sessionStorage.setItem("auth", JSON.stringify(auth));
  return { success: true, auth };
}

export function logout() {
  sessionStorage.removeItem("auth");
}

export function getAuth() {
  try {
    const raw = sessionStorage.getItem("auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return !!getAuth();
}