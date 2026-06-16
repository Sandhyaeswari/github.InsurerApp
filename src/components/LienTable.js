import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, Tooltip, InputAdornment, TextField, useTheme, useMediaQuery } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";

const fmt = (n) => (n ? `BWP ${Number(n).toLocaleString("en-US")}` : "—");

const STATUS_MAP = {

  "": {
    label: "Acknowledged",
    bg: "rgba(245,158,11,0.12)",
    color: "#ec9b75",
    dot: "#f59e0b",
    glow: "rgba(245,158,11,0.4)"
  },

  Acknowledged: {
    label: "Acknowledged",
    bg: "rgba(245,158,11,0.12)",
    color: "#ec9b75",
    dot: "#f59e0b",
    glow: "rgba(245,158,11,0.4)"
  },

  Confirmed: {
    label: "Confirmed",
    bg: "rgba(16,185,129,0.12)",
    color: "#34d399",
    dot: "#10b981",
    glow: "rgba(16,185,129,0.4)"
  },

  Rejected: {
    label: "Rejected",
    bg: "rgba(244,63,94,0.12)",
    color: "#fb7185",
    dot: "#f43f5e",
    glow: "rgba(244,63,94,0.4)"
  },

  "Release Acknowledged": {
    label: "Release Acknowledged",
    bg: "rgba(37,99,235,0.12)",
    color: "#60a5fa",
    dot: "#2563eb",
    glow: "rgba(37,99,235,0.4)"
  },
};
const POLICY_MAP = {

  Active: {
    label: "Active",
    bg: "rgba(16,185,129,0.12)",
    color: "#34d399",
    dot: "#10b981",
    glow: "rgba(16,185,129,0.4)"
  },

  Lapsed: {
    label: "Lapsed",
    bg: "rgba(244,63,94,0.12)",
    color: "#fb7185",
    dot: "#f43f5e",
    glow: "rgba(244,63,94,0.4)"
  },

  PremiumOverdue: {
    label: "Premium Overdue",
    bg: "rgba(245,158,11,0.12)",
    color: "#fbbf24",
    dot: "#f59e0b",
    glow: "rgba(245,158,11,0.4)"
  },

  ReleaseAcknowledged: {
    label: "Release Acknowledged",
    bg: "rgba(37,99,235,0.12)",
    color: "#60a5fa",
    dot: "#2563eb",
    glow: "rgba(37,99,235,0.4)"
  },
};

const Badge = ({ value, map, fallback = "—" }) => {
  const info = map[String(value || "").trim()];
  if (!info) return <Typography sx={{ color: "#1e3a5f", fontSize: "12px" }}>{fallback}</Typography>;
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      gap={0.7}
      sx={{
        background: info.bg,
        border: `1px solid ${info.dot}30`,
        borderRadius: "20px",
        px: 1.2, py: "3px",
      }}
    >
      <Box sx={{
        width: 5, height: 5, borderRadius: "50%",
        background: info.dot, flexShrink: 0,
        boxShadow: `0 0 6px ${info.glow}`,
      }} />
      <Typography sx={{
        fontSize: "11px", fontWeight: 700, color: info.color,
        lineHeight: 1.2, whiteSpace: "nowrap",
      }}>
        {info.label}
      </Typography>
    </Box>
  );
};

const Cell = ({ value, bold, mono, accent }) => (
  <Tooltip title={value || ""} placement="top" arrow>
    <Typography
      noWrap
      sx={{
        fontSize: "13px",
        fontWeight: bold ? 700 : 500,
        color: accent ? "#2563eb" : bold ? "#1e293b" : "#64748b",
        fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit",
        letterSpacing: mono ? "0.02em" : "inherit",
        maxWidth: "100%",
      }}
    >
      {value || "—"}
    </Typography>
  </Tooltip>
);

const getEffectiveStatus = (row) => {
  return String(row.Status || "").trim();
};

export default function LienTable({ rows, onRowClick, selectedInsurer }) {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [search, setSearch] = useState("");

  const safeRows = Array.isArray(rows) ? rows : [];
  const filtered = safeRows.filter((r) => {
    const q = search.toLowerCase();
    return (
      (r.lienRequestId || "").toLowerCase().includes(q) ||
      (r.bankReference  || "").toLowerCase().includes(q) ||
      (r.name           || "").toLowerCase().includes(q) ||
      (r.policyNumber   || "").toLowerCase().includes(q) ||
      (r.bankName       || "").toLowerCase().includes(q)
    );
  });

  const formattedRows = filtered.map((row) => ({
    id:            row.id,
    lienRequestId: row.lienRequestId,
    bankReference: row.bankReference,
    name:          row.name,
    policyNumber:  row.policyNumber,
    bankName:      row.bankName,
    loanAmount:    row.loanAmount,
    Status:        getEffectiveStatus(row),
    policyStatus:  String(row.policyStatus || "").trim(),
    fullData:      row,
  }));

  const baseColumns = [
    {
      field: "lienRequestId", headerName: "Request ID",
      width: isMobile ? 110 : 120,
       flex: 1,
      renderCell: (p) => <Cell value={p.value} bold />,
    },
    {
      field: "name", headerName: "Customer",
      flex: 1, minWidth: isMobile ? 120 : 130,
      renderCell: (p) => <Cell value={p.value} />,
    },
    {
      field: "Status", headerName: "Status",
      width: isMobile ? 130 : 180,
       flex: 1,
      renderCell: (p) => <Badge value={p.value} map={STATUS_MAP} />,
    },
  ];

  const tabletColumns = [
    {
      field: "bankReference", headerName: "Bank Ref",
      width: 120, flex: 1,
      renderCell: (p) => <Cell value={p.value} accent />,
    },
    {
      field: "loanAmount", headerName: "Loan Amount",
      width: 130, flex: 1,
      renderCell: (p) => (
        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap" }}>
          {fmt(p.value)}
        </Typography>
      ),
    },
    {
      field: "policyStatus", headerName: "Policy Status",
      width: 148, flex: 1,
      renderCell: (p) => <Badge value={p.value} map={POLICY_MAP} />,
    },
  ];

  const desktopColumns = [
    {
      field: "policyNumber", headerName: "Policy No.",
      width: 120,
      renderCell: (p) => <Cell value={p.value} mono />,
    },
    {
      field: "bankName", headerName: "Bank",
      flex: 1, minWidth: 140,
      renderCell: (p) => <Cell value={p.value} />,
    },
  ];

  const columns = isMobile
    ? baseColumns
    : isTablet
    ? [...baseColumns, ...tabletColumns]
    : [
        baseColumns[0],
        ...tabletColumns.slice(0, 1),
        baseColumns[1],
        ...desktopColumns,
        tabletColumns[1],
        baseColumns[2],
        tabletColumns[2],
      ];

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>

      {/* Search bar */}
      <Box sx={{
        px: 2, py: 1.8,
        borderBottom: "1px solid #e2e8f0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 2,
      }}>
        <TextField
          placeholder="Search by ID, reference, customer, policy, bank…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: "#4a6080" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: isMobile ? "100%" : 340,
            "& .MuiOutlinedInput-root": {
              background: "#f8fafc",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#1e293b",
              "& fieldset": { borderColor: "#e2e8f0" },
              "&:hover fieldset": { borderColor: "rgba(37,99,235,0.3)" },
              "&.Mui-focused fieldset": { borderColor: "#2563eb", borderWidth: "1px" },
            },
            "& .MuiInputBase-input::placeholder": { color: "#94a3b8", opacity: 1 },
          }}
        />
        <Typography sx={{ fontSize: "12px", color: "#64748b", whiteSpace: "nowrap", fontWeight: 600 }}>
          {filtered.length} record{filtered.length !== 1 ? "s" : ""}
        </Typography>
      </Box>

      {/* DataGrid */}
      <DataGrid
        rows={formattedRows}
        columns={columns}
        rowHeight={50}
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        disableColumnMenu
        disableColumnFilter
        disableColumnResize={false}
        sx={{
          border: "none",
          background: "transparent",
          color: "#94a3b8",

          "& .MuiDataGrid-columnHeaders": {
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            minHeight: "44px !important",
            maxHeight: "44px !important",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            color: "#64748b",
            fontSize: "10px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          },
          "& .MuiDataGrid-columnSeparator": { display: "none" },
          "& .MuiDataGrid-sortIcon": { color: "#334155" },

          "& .MuiDataGrid-row": {
            borderBottom: "1px solid #f1f5f9",
            transition: "all 0.15s ease",
            "&:nth-of-type(even)": { background: "rgba(255,255,255,0.01)" },
          },
          "& .MuiDataGrid-row:hover": {
            background: "rgba(59,130,246,0.07) !important",
            borderLeft: "3px solid #3b82f6",
            cursor: "pointer",
          },

          "& .MuiDataGrid-cell": {
            borderBottom: "none",
            display: "flex",
            alignItems: "center",
            color: "#64748b",
          },
          "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": { outline: "none" },
          "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within": { outline: "none" },

          "& .MuiDataGrid-footerContainer": {
            borderTop: "1px solid #e2e8f0",
            background: "#f8fafc",
            minHeight: "44px",
          },
          "& .MuiTablePagination-root, & .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
            fontSize: "11px",
            color: "#64748b",
          },
          "& .MuiTablePagination-select, & .MuiTablePagination-actions button": {
            color: "#64748b",
          },
          "& .MuiTablePagination-actions button:hover": {
            background: "rgba(59,130,246,0.1)",
          },
          "& .MuiCheckbox-root": { color: "#334155" },
        }}
        onRowClick={(params) => onRowClick(params.row.fullData)}
      />
    </Box>
  );
}