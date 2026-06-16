import { useState, useEffect } from "react";

import {

  Dialog, DialogTitle, DialogContent, DialogActions,

  Button, Typography, TextField, Box, Chip, Grid, IconButton, Divider,

  useTheme, useMediaQuery,

} from "@mui/material";

import CloseIcon                from "@mui/icons-material/Close";

import EditIcon                 from "@mui/icons-material/Edit";

import CheckIcon                from "@mui/icons-material/Check";

import CheckCircleOutlineIcon   from "@mui/icons-material/CheckCircleOutline";

import CancelOutlinedIcon       from "@mui/icons-material/CancelOutlined";

import HistoryIcon              from "@mui/icons-material/History";

import {
  updateRecord,
  sendLienAction,
  sendLienReleaseAction,
  fetchDocs,
  fetchHistory,
} from "../api/api";



// Converts a base64 string (with or without data-URL prefix) into a blob URL for PDF viewing

const getPdfBlobUrl = (base64) => {

  try {

    if (!base64) return null;

    const clean = base64.includes(",") ? base64.split(",")[1] : base64;

    const bytes  = atob(clean);

    const arr    = new Uint8Array(bytes.length).map((_, i) => bytes.charCodeAt(i));

    return URL.createObjectURL(new Blob([arr], { type: "application/pdf" }));

  } catch (err) {

    console.error("Base64 decode failed", err);

    return null;

  }

};



// ─── History helpers ──────────────────────────────────────────────────────────
// History is now persisted to Xano DB via fetchHistory / saveHistory API calls.



const NUMERIC_FIELDS  = new Set(["loanAmount", "lienAmount", "sumInsured", "loanTenure"]);

const READONLY_FIELDS = new Set(["id", "created_at", "documents", "callbackUrl", "Status", "policyStatus"]);



export default function LienDetailsDrawer({ open, data, onClose, onActionComplete, selectedInsurer }) {

  const [remarks,      setRemarks]      = useState("");

  const [loading,      setLoading]      = useState(false);

  const [editingField, setEditingField] = useState(null);

  const [editingValue, setEditingValue] = useState("");

  const [editLoading,  setEditLoading]  = useState(false);

const [docRecords,   setDocRecords]   = useState([]);
const [docBlobUrls,  setDocBlobUrls]  = useState({});
const [historyLog,   setHistoryLog]   = useState([]);
const [docsLoading,  setDocsLoading]  = useState(false);

  // Fetch matching doc records whenever the drawer opens or the record ID changes
useEffect(() => {
  if (!open || !data) return;
  setDocsLoading(true);
  fetchDocs(selectedInsurer)
    .then((records) => {
      // Build set of all plausible IDs for this record
      const targets = new Set(
        [data.lienRequestId, data.id, data.bankReference]
          .filter(Boolean)
          .map(String)
      );
      // Match against any common linking field the document table might use
      const matches = records.filter((r) => {
        // document_table uses snake_case lien_request_id; botswana_table uses lienRequestId
        const docRef = String(
          r.lien_request_id ?? r.lienRequestId ?? r.lienId ?? r.referenceId ?? r.bankReference ?? ""
        );
        return docRef !== "" && targets.has(docRef);
      });
      setDocRecords(matches);
    })
    .finally(() => setDocsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [open, data?.id, selectedInsurer]);

  // Load history from Xano whenever the drawer opens or record changes
useEffect(() => {
  if (!open || !data?.lienRequestId) {
    setHistoryLog([]);
    return;
  }
  fetchHistory(data.lienRequestId).then((records) => {
    const sorted = Array.isArray(records)
      ? [...records].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      : [];
    setHistoryLog(sorted);
  });
}, [open, data?.lienRequestId]);

  // Generate blob URLs once when docRecords change; revoke on next change or unmount
useEffect(() => {
  const urls = {};
  docRecords.forEach((doc) => {
    const key = doc.id ?? doc.lienRequestId ?? doc.name;
    urls[key] = doc.base64 ? getPdfBlobUrl(doc.base64) : null;
  });
  setDocBlobUrls(urls);
  return () => {
    Object.values(urls).forEach((url) => { if (url) URL.revokeObjectURL(url); });
  };
}, [docRecords]);

 // Build PDF blob URL from base64



  const theme      = useTheme();

  const isMobile   = useMediaQuery(theme.breakpoints.down("sm"));




// if (!data) return null;

// const status = data.Status || "Pending";

// const isPending =
//   status === "Pending" || status === "";

// const isAcknowledged =
//   status === "Acknowledged";


// const isConfirmed =
//   status === "Confirmed";

// const isRejected =
//   status === "Rejected";


const status = data?.Status || "";

const isAcknowledged =
  status === "Acknowledged";

const isConfirmed =
  status === "Confirmed";

const isRejected =
  status === "Rejected";

// useEffect(() => {
//   if (!data) return;

//   if (data.Status === "Acknowledged") {

//     const callAcknowledgeApi = async () => {

//       try {

//         console.log(
//           "Calling acknowledge API..."
//         );

//         const lienPayload =
//           buildLienPayload("ACKNOWLEDGE");

//         console.log(
//           "Payload:",
//           lienPayload
//         );

//         const res = await sendLienAction(
//           selectedInsurer,
//           lienPayload
//         );

//         console.log(
//           "Acknowledge API success",
//           res
//         );

//       } catch (err) {

//         console.error(
//           "Acknowledge API failed",
//           err
//         );

//       }
//     };

//     callAcknowledgeApi();
//   }

// // eslint-disable-next-line react-hooks/exhaustive-deps
// }, [data]);

useEffect(() => {
  if (!data) return;

  if (data.Status === "Acknowledged") {

    const callAcknowledgeApi = async () => {

      try {

       
        const lienPayload =
          buildLienPayload("ACKNOWLEDGE");

        const res = await sendLienAction(
          selectedInsurer,
          lienPayload
        );

        console.log(
          "Acknowledge API success",
          res
        );

        // Xano PATCH already logs this action — just refresh the display
        const updated = await fetchHistory(data.lienRequestId);
        const sorted = Array.isArray(updated)
          ? [...updated].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          : [];
        setHistoryLog(sorted);

      } catch (err) {

        console.error(
          "Acknowledge API failed",
          err
        );

      }
    };

    callAcknowledgeApi();
  }

// eslint-disable-next-line react-hooks/exhaustive-deps
}, [data]);

if (!data) return null;


// Policy status flags
const policyStatus = data.policyStatus || "";

const isLapsed =
  policyStatus === "Lapsed";

const isPremiumOverdue =
  policyStatus === "PremiumOverdue";

const isReinstated =
  policyStatus === "Active";

  

const STATUS_META = {
  Pending:      { label: "Pending",      bg: "#475569" },
  "":           { label: "Pending",      bg: "#475569" },
  Acknowledged: { label: "Acknowledged", bg: "#1d4ed8" },
  Confirmed:    { label: "Confirmed",    bg: "#059669" },
  Rejected:     { label: "Rejected",     bg: "#be123c" },
};




const meta =
  STATUS_META[status] || {
    label: status,
    bg: "#64748b",
  };


//     //const isBotswanaGeneral = selectedInsurer === "BOTSWANA_GENERAL";

//   // If DB stores "Acknowledged" by default, only show it after the user has
//   // explicitly clicked Acknowledge (tracked in localStorage history).
// const status = data.Status || "";

// const isPending      = !status;
// const isAcknowledged = status === "Acknowledged";
// const isConfirmed    = status === "Confirmed";
// const isRejected     = status === "Rejected";

// // Policy status flags
// const policyStatus = data.policyStatus || "";

// const isLapsed = policyStatus === "Lapsed";

// const isPremiumOverdue =
//   policyStatus === "PremiumOverdue";

// const isReinstated =
//   policyStatus === "Active";


//   const STATUS_META = {
//     "":           { label: "Pending",      bg: "#475569" },
//     Acknowledged: { label: "Acknowledged", bg: "#1d4ed8" },
//     Confirmed:    { label: "Confirmed",    bg: "#059669" },
//     Rejected:     { label: "Rejected",     bg: "#be123c" },
//   };

 // const meta = STATUS_META[status] || { label: status, bg: "#64748b" };



  // ─── Build insuremo payload based on action type ────────────────────────────

  const buildLienPayload = (lienAction) => {

    const now     = new Date().toISOString();

    const bankRef = data.bankReference || "";

    const remark  = remarks.trim();



    switch (lienAction) {

case "ACKNOWLEDGE":

  return {
    action: "ACKNOWLEDGE",

    bankReference: bankRef,

    insurerLienReference:
      data.lienRequestId ||
      String(data.id),

    policyNumber:
      data.policyNumber || "",

    policyStatus:
      "Acknowledged",

    status:
      "Acknowledged",

    remarks:
      remark ||
      "Request received and under review",
  };
      case "CONFIRM":

  return {
    action: "CONFIRM",

    bankReference:
      bankRef,

    insurerLienReference:
      data.lienRequestId ||
      String(data.id),

    policyNumber:
      data.policyNumber || "",

    policyStatus:
      "ACTIVE",

    status:
      "Confirmed",

    lienPlacedAt:
      now,

    remarks:
      remark || "",
  };

      case "REJECT":

        return { action: "REJECT", bankReference: bankRef, reasonCode: "POLICY_NOT_FOUND", reason: remark || "Policy rejected", remarks: remark };

      case "LAPSED":

        return { action: "POLICY_EVENT", bankReference: bankRef, policyNumber: data.policyNumber, statusType: "LAPSED", statusEffectiveAt: now, insurerContactRef: data.email || "claims@insurer.com", remarks: remark };

      case "PREMIUM_OVERDUE":

        return { action: "POLICY_EVENT", bankReference: bankRef, policyNumber: data.policyNumber, statusType: "PREMIUM_OVERDUE", statusEffectiveAt: now, gracePeriodEndAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), insurerContactRef: data.email || "claims@insurer.com", remarks: remark};

      case "REINSTATED":

        return { action: "POLICY_EVENT", bankReference: bankRef, policyNumber: data.policyNumber, statusType: "REINSTATED", statusEffectiveAt: now, remarks: remark};

      default:

        return null;

    }

  };



  // ─── Inline field edit ──────────────────────────────────────────────────────

  const startEdit  = (fieldKey, rawValue) => { setEditingField(fieldKey); setEditingValue(rawValue ?? ""); };

  const cancelEdit = () => { setEditingField(null); setEditingValue(""); };



  const saveEdit = async (fieldKey, label) => {

    if (editLoading) return;

    setEditLoading(true);

    try {

      const parsedValue   = NUMERIC_FIELDS.has(fieldKey)

        ? (editingValue === "" ? null : Number(editingValue))

        : editingValue;

      const updatedFields = { [fieldKey]: parsedValue };

    const payload = {
  ...data,
  ...updatedFields,
  remarks: remarks.trim() || "",
};

      const res           = await updateRecord(selectedInsurer, data.id, payload);

      if (!res) { alert("Update failed"); return; }



      // Xano PATCH already logs field changes — just refresh the display
      const updated = await fetchHistory(data.lienRequestId);
      const sorted = Array.isArray(updated)
        ? [...updated].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : [];
      setHistoryLog(sorted);

      if (onActionComplete) onActionComplete(data.id, updatedFields, `${label} updated`);

      cancelEdit();

    } catch (err) {

      console.error(err);

      alert("Something went wrong");

    } finally {

      setEditLoading(false);

    }

  };



  // ─── Workflow update (buttons) ──────────────────────────────────────────────


// ─── Workflow update (buttons) ──────────────────────────────────────────────
const handleUpdate = async (updatedFields, actionLabel, lienAction) => {
  if (loading) return;
  setLoading(true);
  try {
    const payload = { ...data, ...updatedFields };
    if (remarks.trim()) payload.remarks = remarks.trim();

    const res = await updateRecord(selectedInsurer, data.id, payload);
    if (!res) { alert("Update failed"); return; }

    // Call insuremo lien API for both insurers
    if (lienAction) {
      const lienPayload = buildLienPayload(lienAction);
      if (lienPayload) {
const lienRes = await sendLienAction(
  selectedInsurer,
  lienPayload
);

if (!lienRes) {
  throw new Error("Lien API failed");
}      }
    }

    // Xano PATCH already logs all field changes — just refresh the display
    const updated = await fetchHistory(data.lienRequestId);
    const sorted = Array.isArray(updated)
      ? [...updated].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      : [];
    setHistoryLog(sorted);

    if (onActionComplete) onActionComplete(data.id, updatedFields, actionLabel);
    setRemarks("");
    onClose();
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  } finally {
    setLoading(false);
  }
};

// ─── Acknowledge (saves to DB + calls insuremo, stays open for Confirm/Reject) ─
// const handleAcknowledge = async () => {
//   if (loading) return;
//   setLoading(true);
//   try {
//     const updatedFields = { Status: "Acknowledged" };
// const payload = {
//   ...data,
//   ...updatedFields,
//   remarks: remarks.trim() || "",
// };    if (remarks.trim()) payload.remarks = remarks.trim();

//     const res = await updateRecord(selectedInsurer, data.id, payload);
//     if (!res) { alert("Update failed"); return; }

//     const lienPayload = buildLienPayload("ACKNOWLEDGE");
//     if (lienPayload) {
// const lienRes = await sendLienAction(
//   selectedInsurer,
//   lienPayload
// );

// if (!lienRes) {
//   throw new Error("Acknowledge API failed");
// }    }

//     appendHistory(selectedInsurer, data.id, {
//       action: "Acknowledged",
//       field: "Status",
//       value: "Acknowledged",
//       remarks: remarks.trim() || null,
//       timestamp: new Date().toISOString(),
//     });
//     setHistoryLog(loadHistory(selectedInsurer, data.id));

//     if (onActionComplete) onActionComplete(data.id, updatedFields, "Acknowledged");
//     setRemarks("");
//     // Intentionally not closing — user can now Confirm or Reject
//   } catch (err) {
//     console.error(err);
//     alert("Something went wrong");
//   } finally {
//     setLoading(false);
//   }
// };
const handleReleaseAcknowledge = async () => {
  if (loading) return;

  try {
    setLoading(true);

    // KEEP EXISTING VALUES
    const existingPolicyStatus =
      data.policyStatus || "";

    const existingPolicyNumber =
      data.policyNumber || "";

    // 1. UPDATE DATABASE FIRST
    const updatedFields = {
      Status: "Release Acknowledged",

      // IMPORTANT:
      // keep old policy status
      policyStatus: existingPolicyStatus,

      // IMPORTANT:
      // keep old policy number
      policyNumber: existingPolicyNumber,

      remarks:
        remarks.trim() ||
        "Release request acknowledged",
    };

    const updatePayload = {
      ...data,
      ...updatedFields,
    };

    const updateRes = await updateRecord(
      selectedInsurer,
      data.id,
      updatePayload
    );

    if (!updateRes) {
      throw new Error("DB update failed");
    }

    // 2. CALL INSUREMO API
    const payload = {
      action: "RELEASE_ACKNOWLEDGE",

      bankReference:
        data.bankReference || "",

      lienRequestId:
        data.lienRequestId || data.id,

      // IMPORTANT:
      // always send existing policy number
      policyNumber: existingPolicyNumber,

      requestType:
        data.requestType || "",

      requestedBy:
        data.requestedBy || "",

      requestDate:
        data.requestDate || "",

      releaseReason:
        data.releaseReason || "",

      remarks:
        remarks.trim() ||
        "Release request acknowledged",
    };

    const res = await sendLienReleaseAction(
      selectedInsurer,
      payload
    );

    if (!res) {
      throw new Error(
        "Release acknowledge API failed"
      );
    }

    // 3. HISTORY — Xano PATCH already logs this action, just refresh display
    const updated = await fetchHistory(data.lienRequestId);
    const sorted = Array.isArray(updated)
      ? [...updated].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      : [];
    setHistoryLog(sorted);

    // 4. REFRESH PARENT TABLE
    if (onActionComplete) {
      onActionComplete(
        data.id,
        updatedFields,
        "Release Acknowledged"
      );
    }

    setRemarks("");

    alert(
      "Lien closure acknowledged successfully"
    );

  } catch (err) {

    console.error(err);

    alert("API Call Failed");

  } finally {

    setLoading(false);

  }
};
  // ─── Sub-components ─────────────────────────────────────────────────────────

  const DetailField = ({ label, fieldKey, value, rawValue }) => {

    const isEditing  = editingField === fieldKey;

    const canEdit    = fieldKey && !READONLY_FIELDS.has(fieldKey);

    const displayVal = value || "—";



    return (

      <Box>

        <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.4}>

          <Typography sx={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 800 }}>
            {label}
          </Typography>

          {canEdit && !isEditing && (
            <IconButton size="small" onClick={() => startEdit(fieldKey, rawValue ?? value ?? "")}
              sx={{ p: 0.2, color: "#94a3b8", "&:hover": { color: "#2563eb", background: "transparent" } }}>
              <EditIcon sx={{ fontSize: 12 }} />
            </IconButton>
          )}

        </Box>



        {isEditing ? (

          <Box display="flex" alignItems="center" gap={0.5}>

            <TextField

              size="small" autoFocus fullWidth value={editingValue}

              onChange={(e) => setEditingValue(e.target.value)}

              onKeyDown={(e) => { if (e.key === "Enter") saveEdit(fieldKey, label); if (e.key === "Escape") cancelEdit(); }}

              sx={{
                "& .MuiInputBase-input": { fontSize: "13px", py: 0.6, px: 1, color: "#1e293b" },
                "& .MuiOutlinedInput-root": {
                  background: "#ffffff",
                  borderRadius: "6px",
                  "& fieldset": { borderColor: "rgba(37,99,235,0.3)" },
                  "&:hover fieldset": { borderColor: "#2563eb" },
                },
              }}

            />

            <IconButton size="small" disabled={editLoading} onClick={() => saveEdit(fieldKey, label)}

              sx={{ color: "#059669", "&:hover": { background: "#dcfce7" }, p: 0.5 }}>

              <CheckIcon sx={{ fontSize: 16 }} />

            </IconButton>

            <IconButton size="small" onClick={cancelEdit}

              sx={{ color: "#dc2626", "&:hover": { background: "#fee2e2" }, p: 0.5 }}>

              <CloseIcon sx={{ fontSize: 16 }} />

            </IconButton>

          </Box>

        ) : (
          <Typography sx={{ fontSize: "13px", color: "#475569", fontWeight: 600 }}>{displayVal}</Typography>
        )}

      </Box>

    );

  };



  const Section = ({ title, children }) => (
    <Box sx={{
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "14px", p: 2.5,
      position: "relative", overflow: "hidden",
    }}>
      <Box sx={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(37,99,235,0.15), transparent)" }} />
      <Typography sx={{ fontSize: "9px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.14em", mb: 2 }}>
        {title}
      </Typography>
      <Grid container spacing={2}>{children}</Grid>
    </Box>
  );



  // ─── Render ─────────────────────────────────────────────────────────────────

  return (

    <Dialog

      open={open} onClose={onClose} fullWidth maxWidth="lg"

      fullScreen={isMobile}

      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : "20px",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          maxHeight: isMobile ? "100vh" : "90vh",
          boxShadow: "0 24px 80px rgba(0,0,0,0.12), 0 0 0 1px #e2e8f0",
          m: isMobile ? 0 : 2,
        },
      }}

    >

      {/* Header */}

      <DialogTitle sx={{ p: 0 }}>

        <Box sx={{
          background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
          borderBottom: "1px solid #e2e8f0",
          px: 3, py: 2.5,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderRadius: "20px 20px 0 0",
          position: "relative", overflow: "hidden",
        }}>
          {/* Header top glow */}
          <Box sx={{ position: "absolute", top: 0, left: "15%", right: "15%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)" }} />

          <Box>
            <Typography sx={{ color: "#0f172a", fontSize: "17px", fontWeight: 800, letterSpacing: "-0.01em" }}>
              Record Details
            </Typography>
            <Typography sx={{ color: "#64748b", fontSize: "12px", mt: 0.5, fontFamily: "monospace" }}>
              {data.lienRequestId} · {data.policyNumber}
            </Typography>

          </Box>

          <Box display="flex" alignItems="center" gap={1.5}>
            <Chip label={meta.label} sx={{
              backgroundColor: meta.bg, color: "#fff", fontWeight: 700, fontSize: "11px",
              height: "24px", border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: `0 0 10px ${meta.bg}80`,
            }} />
            <IconButton onClick={onClose} size="small" sx={{
              color: "#64748b", border: "1px solid #e2e8f0",
              "&:hover": { color: "#1e293b", background: "#f1f5f9", borderColor: "#cbd5e1" },
            }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

        </Box>

      </DialogTitle>



      <DialogContent sx={{ p: 3, background: "#ffffff" }}>

        <Box display="flex" flexDirection="column" gap={2}>



          {/* Request Information */}

          <Section title="Request Information">

            <Grid size={{ xs: 12, sm: 4 }}><DetailField label="Lien Request ID" fieldKey="lienRequestId" value={data.lienRequestId} /></Grid>

            <Grid size={{ xs: 12, sm: 4 }}><DetailField label="Bank Reference"  fieldKey="bankReference" value={data.bankReference} /></Grid>

            <Grid size={{ xs: 12, sm: 4 }}><DetailField label="Created At"      value={data.created_at ? new Date(data.created_at).toLocaleString() : null} /></Grid>

            <Grid size={{ xs: 12, sm: 4 }}><DetailField label="Request Type"    fieldKey="requestType"   value={data.requestType} /></Grid>

            <Grid size={{ xs: 12, sm: 4 }}><DetailField label="Requested By"    fieldKey="requestedBy"   value={data.requestedBy} /></Grid>

            <Grid size={{ xs: 12, sm: 4 }}><DetailField label="Request Date"    fieldKey="requestDate"   value={data.requestDate} /></Grid>

    
            <Grid size={{ xs: 12, sm: 4 }}><DetailField label="Release Reason"  fieldKey="releaseReason" value={data.releaseReason} /></Grid>
{data.requestType && data.requestedBy && data.requestDate && data.releaseReason && (
  <Grid size={{ xs: 12 }}>
    <Box display="flex" gap={2} mt={1} flexWrap="wrap">
      <Button
        variant="contained"
        size="small"
        disabled={loading}
        onClick={handleReleaseAcknowledge}
        startIcon={<CheckCircleOutlineIcon sx={{ fontSize: "15px !important" }} />}
        sx={{
          background: "linear-gradient(135deg, #059669, #10b981)",
          borderRadius: "8px", textTransform: "none",
          fontWeight: 700, fontSize: "12px", px: 2, py: 0.8,
          boxShadow: "0 4px 12px rgba(16,185,129,0.35)",
          border: "1px solid rgba(16,185,129,0.3)",
          "&:hover": { background: "linear-gradient(135deg, #047857, #059669)", boxShadow: "0 6px 18px rgba(16,185,129,0.5)", transform: "translateY(-1px)" },
          transition: "all 0.2s",
        }}
      >
        {loading ? "Processing…" : "Acknowledge Lien Closure"}
      </Button>
    </Box>
  </Grid>
)}
          </Section>
 
 



          {/* Customer Details */}

          <Section title="Customer Details">

            <Grid size={{ xs: 12, sm: 3 }}><DetailField label="Title"         fieldKey="title"       value={data.title} /></Grid>

            <Grid size={{ xs: 12, sm: 3 }}><DetailField label="Full Name"     fieldKey="name"        value={data.name} /></Grid>

            <Grid size={{ xs: 12, sm: 3 }}><DetailField label="First Name"    fieldKey="firstName"   value={data.firstName} /></Grid>

            <Grid size={{ xs: 12, sm: 3 }}><DetailField label="Last Name"     fieldKey="lastName"    value={data.lastName} /></Grid>

            <Grid size={{ xs: 12, sm: 3 }}><DetailField label="Gender"        fieldKey="gender"      value={data.gender} /></Grid>

            <Grid size={{ xs: 12, sm: 3 }}><DetailField label="ID Type"       fieldKey="idType"      value={data.idType} /></Grid>

            <Grid size={{ xs: 12, sm: 3 }}><DetailField label="ID Number"     fieldKey="idNumber"    value={data.idNumber} /></Grid>

            <Grid size={{ xs: 12, sm: 3 }}><DetailField label="Date of Birth" fieldKey="dateOfBirth" value={data.dateOfBirth} /></Grid>

            <Grid size={{ xs: 12, sm: 4 }}><DetailField label="Email"         fieldKey="email"       value={data.email} /></Grid>

            <Grid size={{ xs: 12, sm: 4 }}><DetailField label="Phone"         fieldKey="phone"       value={data.phone} /></Grid>

            <Grid size={{ xs: 12, sm: 4 }}><DetailField label="Address"       fieldKey="address"     value={data.address} /></Grid>

          </Section>



          {/* Policy + Bank */}

          <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={2}>

            <Section title="Policy Details">

              <Grid size={{ xs: 12 }}><DetailField label="Policy Number" fieldKey="policyNumber" value={data.policyNumber} /></Grid>

              <Grid size={{ xs: 12 }}><DetailField label="Sum Insured"   fieldKey="sumInsured"   value={data.sumInsured ? `BWP ${Number(data.sumInsured).toLocaleString()}` : null} rawValue={data.sumInsured} /></Grid>

              <Grid size={{ xs: 12 }}><DetailField label="Underwriter"   fieldKey="underwriter"  value={data.underwriter} /></Grid>

            </Section>

            <Section title="Bank Details">

              <Grid size={{ xs: 12 }}><DetailField label="Bank Name"                fieldKey="bankName"               value={data.bankName} /></Grid>

              <Grid size={{ xs: 12 }}><DetailField label="Bank Code"                fieldKey="bankCode"               value={data.bankCode} /></Grid>

              <Grid size={{ xs: 12 }}><DetailField label="Branch Code"              fieldKey="branchCode"             value={data.branchCode} /></Grid>

              <Grid size={{ xs: 12 }}><DetailField label="Relationship Manager Ref" fieldKey="relationshipManagerRef" value={data.relationshipManagerRef} /></Grid>

            </Section>

          </Box>



          {/* Loan + Lien */}

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>

            <Section title="Loan Details">

              <Grid size={{ xs: 12 }}><DetailField label="Loan Reference" fieldKey="loanReference" value={data.loanReference} /></Grid>

              <Grid size={{ xs: 12 }}><DetailField label="Loan Type"      fieldKey="loanType"      value={data.loanType} /></Grid>

              <Grid size={{ xs: 12 }}><DetailField label="Loan Amount"    fieldKey="loanAmount"    value={data.loanAmount ? `BWP ${Number(data.loanAmount).toLocaleString()}` : null} rawValue={data.loanAmount} /></Grid>

              <Grid size={{ xs: 12 }}><DetailField label="Loan Tenure"    fieldKey="loanTenure"    value={data.loanTenure ? `${data.loanTenure} months` : null} rawValue={data.loanTenure} /></Grid>

            </Section>

            <Section title="Lien Details">

              <Grid size={{ xs: 12 }}><DetailField label="Lien Amount"         fieldKey="lienAmount"        value={data.lienAmount ? `BWP ${Number(data.lienAmount).toLocaleString()}` : null} rawValue={data.lienAmount} /></Grid>

              <Grid size={{ xs: 12 }}><DetailField label="Lien Effective Date" fieldKey="lienEffectiveDate" value={data.lienEffectiveDate} /></Grid>

              <Grid size={{ xs: 12 }}><DetailField label="Remarks"             fieldKey="remarks"           value={data.remarks} /></Grid>

            </Section>

          </Box>



          {/* Document Details — fetched from botswana_table matched by lienRequestId */}

       {/* Document Details */}
<Section title="Document Details">

  {docsLoading ? (

    <Grid size={{ xs: 12 }}>
      <Typography sx={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
        Loading documents…
      </Typography>
    </Grid>

  ) : docRecords.length === 0 ? (

    <Grid size={{ xs: 12 }}>
      <Typography sx={{ fontSize: "13px", color: "#dc2626", fontWeight: 500 }}>
        No documents available
      </Typography>
    </Grid>

  ) : (

    docRecords.map((doc, index) => {

      const docKey = doc.id ?? doc.lienRequestId ?? doc.name;
      const pdfUrl = docBlobUrls[docKey] || "";

      return (

        <Grid
          size={{ xs: 12 }}
          key={doc.id || index}
        >

          <Box
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              p: 2,
              background: "#fff",
              mb: 2
            }}
          >

            <Grid container spacing={2}>

              {/* Name */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#64748b",
                    mb: 0.5
                  }}
                >
                  Name
                </Typography>

                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 600
                  }}
                >
                  {doc.name || "—"}
                </Typography>
              </Grid>

              {/* Type */}
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#64748b",
                    mb: 0.5
                  }}
                >
                  Type
                </Typography>

                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 600
                  }}
                >
                  {doc.type || "—"}
                </Typography>
              </Grid>

              {/* Size */}
              <Grid size={{ xs: 12, sm: 2 }}>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#64748b",
                    mb: 0.5
                  }}
                >
                  Size
                </Typography>

                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 600
                  }}
                >
                  {doc.size
                    ? `${(doc.size / 1024).toFixed(1)} KB`
                    : "—"}
                </Typography>
              </Grid>

              {/* Actions */}
              <Grid size={{ xs: 12, sm: 3 }}>

                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#64748b",
                    mb: 1
                  }}
                >
                  Actions
                </Typography>

                <Box display="flex" gap={1} flexWrap="wrap">

                  {/* View */}
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={!pdfUrl}
                    sx={{
                      textTransform: "none",
                      borderRadius: "8px",
                      fontWeight: 600
                    }}
                    onClick={() => {

                      if (!pdfUrl) return;

                      window.open(pdfUrl, "_blank");

                    }}
                  >
                    View
                  </Button>

                  {/* Download */}
                  <Button
                    variant="contained"
                    size="small"
                    disabled={!pdfUrl}
                    sx={{
                      textTransform: "none",
                      borderRadius: "8px",
                      fontWeight: 600,
                      background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #1e40af, #1d4ed8)"
                      }
                    }}
                    onClick={() => {

                      if (!pdfUrl) return;

                      const link = document.createElement("a");

                      link.href = pdfUrl;

                      link.download =
                        doc.name || "document.pdf";

                      document.body.appendChild(link);

                      link.click();

                      document.body.removeChild(link);

                    }}
                  >
                    Download
                  </Button>

                </Box>

              </Grid>

            </Grid>

          </Box>

        </Grid>

      );

    })

  )}

</Section>



          {/* History */}

          <Box sx={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "14px", p: 2.5,
            position: "relative", overflow: "hidden",
          }}>
            <Box sx={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.2), transparent)" }} />
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
              <HistoryIcon sx={{ fontSize: 14, color: "#8b5cf6" }} />
              <Typography sx={{ fontSize: "9px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.14em" }}>
                Change History
              </Typography>
            </Box>

            {historyLog.length === 0 ? (
              <Typography sx={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>No changes recorded yet</Typography>
            ) : (

              <Box display="flex" flexDirection="column" gap={1.2}>

                {historyLog.map((h, i) => {

         const dotColors = {
  Confirmed: "#059669",
  Rejected: "#dc2626",
  Lapsed: "#d97706",
  "Premium Overdue": "#7c3aed",
  Reinstated: "#059669",
  Acknowledged: "#2563eb",
};

const dot = dotColors[h.action] || "#2563eb";

                  return (

                    <Box key={h.id ?? i} display="flex" alignItems="flex-start" gap={1.5}>

                      <Box sx={{ width: 7, height: 7, borderRadius: "50%", background: dot, mt: 0.7, flexShrink: 0 }} />

                      <Box flex={1}>

                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">

                          <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>{h.action}</Typography>
                          <Chip label={h.field_name} sx={{ height: "16px", fontSize: "9px", fontWeight: 700, background: "rgba(37,99,235,0.08)", color: "#2563eb", borderRadius: "4px", border: "1px solid rgba(37,99,235,0.15)" }} />
                          <Typography sx={{ fontSize: "11px", color: "#64748b" }}>
                            → {String(h.field_value || "—").replace("PremiumOverdue", "Premium Overdue")}
                          </Typography>

                        </Box>

                        {h.remarks && (
                          <Typography sx={{ fontSize: "10px", color: "#64748b", mt: 0.3, fontStyle: "italic" }}>
                            "{h.remarks}"
                          </Typography>
                        )}
                        <Typography sx={{ fontSize: "10px", color: "#94a3b8", mt: 0.2, fontWeight: 500 }}>
                          {new Date(h.created_at).toLocaleString()}
                        </Typography>

                      </Box>

                    </Box>

                  );

                })}

              </Box>

            )}

          </Box>



          <Divider sx={{ borderColor: "#e2e8f0" }} />



          {/* Workflow remarks */}

          {!isRejected && (
            <TextField
              label="Remarks (optional)" fullWidth multiline rows={2}
              value={remarks} onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter remarks for this action…"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  background: "#f8fafc",
                  fontSize: "14px",
                  color: "#1e293b",
                  "& fieldset": { borderColor: "#e2e8f0" },
                  "&:hover fieldset": { borderColor: "rgba(37,99,235,0.4)" },
                  "&.Mui-focused fieldset": { borderColor: "#2563eb", borderWidth: "1px" },
                },
                "& .MuiInputLabel-root": { fontSize: "13px", color: "#64748b" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#2563eb" },
                "& .MuiInputBase-input::placeholder": { color: "#94a3b8", opacity: 1 },
              }}
            />
          )}

        </Box>

      </DialogContent>



      <DialogActions sx={{ px: 3, py: 2, background: "#f8fafc", borderTop: "1px solid #e2e8f0", gap: 1, flexWrap: "wrap", borderRadius: "0 0 20px 20px" }}>




{/* Acknowledged state */}
{isAcknowledged && (
  <>
    {/* Confirm */}
    <Button
      variant="contained"
      disabled={loading}
      onClick={() =>
        handleUpdate(
       {
  Status: "Confirmed",
  policyStatus: "Active",
  remarks: remarks.trim() || "",
},
          "Confirmed",
          "CONFIRM"
        )
      }
      startIcon={<CheckCircleOutlineIcon />}
      sx={{
        background: "#16a34a",
        borderRadius: "8px",
        textTransform: "none",
        fontWeight: 600,
        fontSize: "14px",
        px: 3,
        "&:hover": { background: "#15803d" },
      }}
    >
      {loading ? "Processing..." : "Confirm"}
    </Button>
 
    {/* Reject */}
    <Button
      variant="contained"
      disabled={loading}
      onClick={() =>
        handleUpdate(
{
  Status: "Rejected",
  remarks: remarks.trim() || "",
},
          "Rejected",
          "REJECT"
        )
      }
      startIcon={<CancelOutlinedIcon />}
      sx={{
        background: "#dc2626",
        borderRadius: "8px",
        textTransform: "none",
        fontWeight: 600,
        fontSize: "14px",
        px: 3,
        "&:hover": { background: "#b91c1c" },
      }}
    >
      {loading ? "Processing..." : "Reject"}
    </Button>
  </>
)}



        {/* Confirmed → Policy Events */}
{isConfirmed && (

  <>

    <Button
      variant="outlined"
      disabled={loading || isLapsed}
      onClick={() =>
        handleUpdate(
          {
  policyStatus: "Lapsed",
  remarks: remarks.trim() || "",
},
          "Lapsed",
          "LAPSED"
        )
      }
      sx={{
        borderColor: "rgba(245,158,11,0.4)", color: "#fbbf24",
        borderRadius: "9px", textTransform: "none", fontWeight: 700, fontSize: "13px",
        "&:hover": { background: "rgba(245,158,11,0.1)", borderColor: "#f59e0b", boxShadow: "0 0 12px rgba(245,158,11,0.25)" },
        "&.Mui-disabled": { borderColor: "rgba(245,158,11,0.2)", color: "#78350f", background: "rgba(245,158,11,0.05)" },
        transition: "all 0.2s",
      }}
    >
      {isLapsed
        ? "Lapsed Done"
        : loading
        ? "Processing..."
        : "Mark Lapsed"}
    </Button>

    <Button
      variant="outlined"
      disabled={loading || isPremiumOverdue}
      onClick={() =>
        handleUpdate(
          {
  policyStatus: "PremiumOverdue",
  remarks: remarks.trim() || "",
},
          "Premium Overdue",
          "PREMIUM_OVERDUE"
        )
      }
      sx={{
        borderColor: "rgba(139,92,246,0.4)", color: "#a78bfa",
        borderRadius: "9px", textTransform: "none", fontWeight: 700, fontSize: "13px",
        "&:hover": { background: "rgba(139,92,246,0.1)", borderColor: "#8b5cf6", boxShadow: "0 0 12px rgba(139,92,246,0.25)" },
        "&.Mui-disabled": { borderColor: "rgba(139,92,246,0.2)", color: "#4c1d95", background: "rgba(139,92,246,0.05)" },
        transition: "all 0.2s",
      }}
    >
      {isPremiumOverdue
        ? "Premium Overdue Done"
        : loading
        ? "Processing..."
        : "Premium Overdue"}
    </Button>

    <Button
      variant="outlined"
      disabled={loading || isReinstated}
      onClick={() =>
        handleUpdate(
         {
  policyStatus: "Active",
  remarks: remarks.trim() || "",
},
          "Reinstated",
          "REINSTATED"
        )
      }
      sx={{
        borderColor: "rgba(16,185,129,0.4)", color: "#34d399",
        borderRadius: "9px", textTransform: "none", fontWeight: 700, fontSize: "13px",
        "&:hover": { background: "rgba(16,185,129,0.1)", borderColor: "#10b981", boxShadow: "0 0 12px rgba(16,185,129,0.25)" },
        "&.Mui-disabled": { borderColor: "rgba(16,185,129,0.2)", color: "#064e3b", background: "rgba(16,185,129,0.05)" },
        transition: "all 0.2s",
      }}
    >
      {isReinstated
        ? "Reinstated Done"
        : loading
        ? "Processing..."
        : "Reinstate"}
    </Button>

  </>

)}



        {/* Rejected — read only */}

        {isRejected && (

          <Typography sx={{ fontSize: "12px", color: "#64748b", fontStyle: "italic", fontWeight: 500 }}>
            This record has been rejected. No further actions available.
          </Typography>

        )}



        <Box sx={{ flexGrow: 1 }} />

        <Button variant="outlined" onClick={onClose}
          sx={{
            borderRadius: "9px", textTransform: "none", fontWeight: 600, fontSize: "13px",
            borderColor: "#e2e8f0", color: "#475569",
            "&:hover": { borderColor: "#cbd5e1", background: "#f1f5f9", color: "#1e293b" },
          }}>

          Close

        </Button>

      </DialogActions>

    </Dialog>

  );

}