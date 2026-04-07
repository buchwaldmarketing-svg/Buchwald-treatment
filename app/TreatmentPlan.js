"use client";
import { useState, useRef, useEffect } from "react";

function savePDF(elementId, filename) {
  if (!window.html2pdf) { alert("PDF library loading, please try again in a moment."); return; }
  const el = document.getElementById(elementId);
  window.html2pdf().set({
    margin: [0.4, 0.5],
    filename,
    image: { type: "jpeg", quality: 0.97 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"] },
  }).from(el).save();
}

const BLUE = "#0098D4";
const DARK = "#1A1A1A";
const GRAY = "#666666";
const LIGHT_BLUE = "#E8F4FA";
const GOLD = "#B8860B";
const GOLD_BG = "#FFF7E0";

const UPGRADED_SERVICES = [
  "UltraCal XS","HurriSeal","Gingivectomy","Lab Fees","Core Build Up",
  "Custom Stain Fees","Chairside Lab Fees","Membrane","Bone Graft","Nitrous",
  "Recement Fee","iTero Scan","Surgical Isolation","Therapeutic Parenteral Drug",
  "Root Canal Obstruction","Pulp Vitality Test","Bacterial Decontamination",
  "Jet White Prophy","Fluoride",
];

const TEETH = ["N/A", ...Array.from({ length: 32 }, (_, i) => String(i + 1))];

const FINANCING_OPTIONS = [
  { label: "No financing", months: 0 },
  { label: "6 months 0% (CareCredit)", months: 6 },
  { label: "12 months 0%", months: 12 },
  { label: "18 months 0%", months: 18 },
  { label: "24 months 0%", months: 24 },
];

const WARRANTY_TREATMENTS = [
  "Crowns",
  "Composite Fillings",
  "Implants",
  "Orthodontics",
  "Preventive Resin Restoration",
  "Scaling & Root Planning",
  "Bridges",
  "Veneers",
];

// ========== SIGNATURE PAD ==========
function SignaturePad({ label, onSave, onClear }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.strokeStyle = DARK; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.strokeStyle = "#ccc"; ctx.lineWidth = 1;
    ctx.moveTo(10, rect.height - 20); ctx.lineTo(rect.width - 10, rect.height - 20); ctx.stroke();
    ctx.strokeStyle = DARK; ctx.lineWidth = 2;
  }, []);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };
  const startDraw = (e) => { e.preventDefault(); setDrawing(true); setHasDrawn(true); const ctx = canvasRef.current.getContext("2d"); const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
  const draw = (e) => { e.preventDefault(); if (!drawing) return; const ctx = canvasRef.current.getContext("2d"); const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
  const endDraw = (e) => { e.preventDefault(); if (drawing) { setDrawing(false); onSave(canvasRef.current.toDataURL()); } };
  const clear = () => {
    const canvas = canvasRef.current; const ctx = canvas.getContext("2d"); const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath(); ctx.strokeStyle = "#ccc"; ctx.lineWidth = 1;
    ctx.moveTo(10, rect.height - 20); ctx.lineTo(rect.width - 10, rect.height - 20); ctx.stroke();
    ctx.strokeStyle = DARK; ctx.lineWidth = 2; setHasDrawn(false); onClear();
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: GRAY }}>{label}</label>
        {hasDrawn && <button onClick={clear} style={{ fontSize: 11, color: BLUE, background: "none", border: "none", fontWeight: 600, cursor: "pointer" }}>Clear</button>}
      </div>
      <canvas ref={canvasRef}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
        style={{ width: "100%", height: 120, border: "1.5px solid #e0e0e0", borderRadius: 10, background: "#fafafa", touchAction: "none", cursor: "crosshair" }}
      />
    </div>
  );
}

function SigBlock({ sig, label, dateStr }) {
  if (sig) return (
    <div style={{ marginBottom: 8 }}>
      <img src={sig} alt={label} style={{ height: 50, maxWidth: "55%" }} />
      <div style={{ borderTop: "1px solid #999", width: "60%", marginTop: -4 }} />
      <div style={{ fontSize: 8, color: GRAY }}>{label}<span style={{ float: "right", width: "30%" }}>{dateStr}</span></div>
    </div>
  );
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ borderBottom: "1px solid #999", width: "60%", display: "inline-block", marginRight: "8%" }} />
      <div style={{ borderBottom: "1px solid #999", width: "28%", display: "inline-block" }} />
      <div style={{ fontSize: 8, color: GRAY }}><span style={{ display: "inline-block", width: "60%", marginRight: "8%" }}>{label}</span><span>Date</span></div>
    </div>
  );
}

function Logo({ width = 190 }) {
  return <img src="/logo.png" alt="Buchwald Family Dentistry" style={{ width, height: "auto" }} />;
}

// ========== MAIN APP ==========
export default function TreatmentPlan() {
  const [appMode, setAppMode] = useState(null);

  useEffect(() => {
    if (!document.getElementById("html2pdf-script")) {
      const s = document.createElement("script");
      s.id = "html2pdf-script";
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      document.head.appendChild(s);
    }
  }, []);

  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
  const [treatments, setTreatments] = useState([{ id: 1, teeth: [], name: "", fee: "" }]);
  const [insuranceCoverage, setInsuranceCoverage] = useState("");
  const [financing, setFinancing] = useState(0);
  const [sameDayDiscount, setSameDayDiscount] = useState(false);
  const [inOfficePlan, setInOfficePlan] = useState(false);
  const [selectedUpgrades, setSelectedUpgrades] = useState([]);
  const [showUpgrades, setShowUpgrades] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [collectSignatures, setCollectSignatures] = useState(false);
  const [patientSig, setPatientSig] = useState(null);
  const [coordinatorSig, setCoordinatorSig] = useState(null);
  const [patientSig2, setPatientSig2] = useState(null);
  const [sigStep, setSigStep] = useState("patient");

  // Warranty form state
  const [warrantyPatientName, setWarrantyPatientName] = useState("");
  const [warrantyDate, setWarrantyDate] = useState(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
  const [warrantyItems, setWarrantyItems] = useState([]);
  const [warrantyCustomTreatment, setWarrantyCustomTreatment] = useState("");
  const [warrantyChoice, setWarrantyChoice] = useState("agree");
  const [warrantySig, setWarrantySig] = useState(null);
  const [showWarrantyPreview, setShowWarrantyPreview] = useState(false);
  const [collectWarrantySig, setCollectWarrantySig] = useState(false);

  // Calculations
  const subtotal = treatments.reduce((sum, t) => sum + (parseFloat(t.fee) || 0), 0);
  const activeDiscount = sameDayDiscount || inOfficePlan;
  const discountLabel = sameDayDiscount ? "Same Day Discount (20%)" : "In-Office Plan Discount (20%)";
  const discountAmount = activeDiscount ? Math.round(subtotal * 0.20 * 100) / 100 : 0;
  const totalDebit = Math.round((subtotal - discountAmount) * 100) / 100;
  const insuranceNum = parseFloat(insuranceCoverage) || 0;
  const creditPrice = Math.round(totalDebit * 1.03 * 100) / 100;
  const savings = Math.round((creditPrice - totalDebit) * 100) / 100;
  const monthlyPayment = financing > 0 ? Math.round((creditPrice / financing) * 100) / 100 : 0;

  const treatmentDisplay = treatments.filter(t => t.name).map(t => {
    const teethStr = t.teeth.length > 0 ? "#" + t.teeth.join(", #") : "";
    return [teethStr, t.name].filter(Boolean).join(" - ");
  }).join("; ");

  const toggleUpgrade = (svc) => setSelectedUpgrades((prev) => prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]);
  const formComplete = patientName && treatments.some(t => t.name && t.fee);

  const addTreatment = () => setTreatments(prev => [...prev, { id: Date.now(), teeth: [], name: "", fee: "" }]);
  const removeTreatment = (id) => setTreatments(prev => prev.length > 1 ? prev.filter(t => t.id !== id) : prev);
  const updateTreatment = (id, field, value) => setTreatments(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  const toggleTooth = (id, num) => setTreatments(prev => prev.map(t => t.id === id ? { ...t, teeth: t.teeth.includes(num) ? t.teeth.filter(n => n !== num) : [...t.teeth, num].sort((a,b) => a - b) } : t));

  const toggleWarrantyTreatment = (t) => setWarrantyItems(prev => {
    const exists = prev.find(x => x.name === t);
    if (exists) return prev.filter(x => x.name !== t);
    return [...prev, { name: t, teeth: [] }];
  });
  const toggleWarrantyTooth = (treatmentName, num) => setWarrantyItems(prev => prev.map(item =>
    item.name === treatmentName ? { ...item, teeth: item.teeth.includes(num) ? item.teeth.filter(n => n !== num) : [...item.teeth, num].sort((a,b) => a - b) } : item
  ));
  const addCustomWarrantyTreatment = () => {
    if (warrantyCustomTreatment.trim()) {
      setWarrantyItems(prev => [...prev, { name: warrantyCustomTreatment.trim(), teeth: [] }]);
      setWarrantyCustomTreatment("");
    }
  };

  const selectedWarrantyTreatments = warrantyItems.map(x => x.name);
  const allWarrantyTreatments = warrantyItems.map(item => {
    if (item.teeth.length > 0) return item.name + " (#" + item.teeth.join(", #") + ")";
    return item.name;
  }).join(", ");
  const warrantyFormComplete = warrantyPatientName && warrantyItems.length > 0;

  const resetForm = () => {
    setPatientName(""); setPatientEmail(""); setTreatments([{ id: 1, teeth: [], name: "", fee: "" }]);
    setInsuranceCoverage(""); setFinancing(0); setSameDayDiscount(false); setInOfficePlan(false); setSelectedUpgrades([]);
    setPatientSig(null); setCoordinatorSig(null); setPatientSig2(null);
    setShowPreview(false); setCollectSignatures(false); setSigStep("patient");
    setDate(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
  };

  const resetWarrantyForm = () => {
    setWarrantyPatientName(""); setWarrantyItems([]); setWarrantyCustomTreatment("");
    setWarrantyChoice("agree"); setWarrantySig(null); setShowWarrantyPreview(false); setCollectWarrantySig(false);
    setWarrantyDate(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
  };

  // ========== HUB STATE ==========
  const [hubTab, setHubTab] = useState("home"); // home | members | records
  const [hubStats, setHubStats] = useState({ members: 0, plansToday: 0, warranties: 0 });
  const [planMembers, setPlanMembers] = useState([]);
  const [patientRecords, setPatientRecords] = useState([]);
  const [hubLoading, setHubLoading] = useState(true);
  const [memberSearch, setMemberSearch] = useState("");
  const [recordSearch, setRecordSearch] = useState("");
  const [recentActivity, setRecentActivity] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ first_name: "", last_name: "", phone: "", plan_start_date: "" });
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientNotes, setPatientNotes] = useState([]);
  const [patientTreatments, setPatientTreatments] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const SUPA_URL = "https://qkvpmnpawspdndbcdegs.supabase.co";
  const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrdnBtbnBhd3NwZG5kYmNkZWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzExMTIsImV4cCI6MjA4ODYwNzExMn0.W9itnRCbyXFTl3gsO85p-hlypcyMqjDI_L4Ze6w24zE";
  const supaFetch = (path, opts = {}) => fetch(`${SUPA_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json", Prefer: "return=representation", ...opts.headers },
    ...opts,
  });

  useEffect(() => {
    if (appMode !== null) return;
    setHubLoading(true);
    Promise.all([
      supaFetch("profiles?plan_status=eq.active&select=id,first_name,last_name,phone,dob,plan_start_date,plan_end_date,plan_status,created_at&order=created_at.desc"),
      supaFetch("profiles?select=id,first_name,last_name,phone,dob,plan_status,created_at&order=created_at.desc&limit=200"),
    ]).then(async ([membersRes, recordsRes]) => {
      const members = await membersRes.json();
      const records = await recordsRes.json();
      const today = new Date().toDateString();
      setPlanMembers(Array.isArray(members) ? members : []);
      setPatientRecords(Array.isArray(records) ? records : []);
      // stats
      const plansToday = Array.isArray(records) ? records.filter(r => new Date(r.created_at).toDateString() === today).length : 0;
      setHubStats({ members: Array.isArray(members) ? members.length : 0, plansToday, warranties: 0 });
      // recent activity
      const recent = Array.isArray(records) ? records.slice(0, 5).map(r => ({
        name: `${r.first_name} ${r.last_name}`,
        action: r.plan_status === "active" ? "enrolled in-office plan" : "added as patient",
        date: new Date(r.created_at),
      })) : [];
      setRecentActivity(recent);
      setHubLoading(false);
    }).catch(() => setHubLoading(false));
  }, [appMode]);

  const loadPatientNotes = async (patientId) => {
    const res = await supaFetch(`patient_notes?patient_id=eq.${patientId}&order=created_at.desc`);
    const data = await res.json();
    setPatientNotes(Array.isArray(data) ? data : []);
  };

  const loadPatientTreatments = async (patientId) => {
    const res = await supaFetch(`pending_treatments?user_id=eq.${patientId}&order=created_at.desc`);
    const data = await res.json();
    setPatientTreatments(Array.isArray(data) ? data : []);
  };

  const updateTreatmentStatus = async (treatmentId, newStatus) => {
    await supaFetch(`pending_treatments?id=eq.${treatmentId}`, {
      method: "PATCH", headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ status: newStatus }),
    });
    setPatientTreatments(prev => prev.map(t => t.id === treatmentId ? { ...t, status: newStatus } : t));
  };

  const saveNote = async () => {
    if (!newNote.trim() || !selectedPatient) return;
    setSavingNote(true);
    await supaFetch("patient_notes", {
      method: "POST",
      body: JSON.stringify({ patient_id: selectedPatient.id, admin_id: selectedPatient.id, note: newNote.trim(), flag_color: "none" }),
    });
    setNewNote("");
    await loadPatientNotes(selectedPatient.id);
    setSavingNote(false);
  };

  const addMember = async () => {
    if (!newMember.first_name || !newMember.last_name) return;
    setAddMemberLoading(true);
    // Check for existing profile first
    const searchRes = await supaFetch(`profiles?first_name=eq.${encodeURIComponent(newMember.first_name)}&last_name=eq.${encodeURIComponent(newMember.last_name)}&limit=1`);
    const existing = await searchRes.json();
    const startDate = newMember.plan_start_date || new Date().toISOString().split("T")[0];
    const endDate = new Date(new Date(startDate).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    if (Array.isArray(existing) && existing.length > 0) {
      await supaFetch(`profiles?id=eq.${existing[0].id}`, { method: "PATCH", headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ plan_status: "active", plan_start_date: startDate, plan_end_date: endDate, ...(newMember.phone ? { phone: newMember.phone } : {}) }) });
    } else {
      await supaFetch("profiles", { method: "POST", body: JSON.stringify({
        id: crypto.randomUUID(),
        email: `${newMember.first_name.toLowerCase()}.${newMember.last_name.toLowerCase()}.${Date.now()}@buchwald.internal`,
        first_name: newMember.first_name, last_name: newMember.last_name,
        phone: newMember.phone || "", role: "user",
        plan_status: "active", plan_start_date: startDate, plan_end_date: endDate,
      })});
    }
    setNewMember({ first_name: "", last_name: "", phone: "", plan_start_date: "" });
    setShowAddMember(false);
    setAddMemberLoading(false);
    setAppMode("__refresh__");
    setTimeout(() => setAppMode(null), 50);
  };

  // Find or create profile by name (no duplicates), save treatment record with status "shown"
  const savePatientRecord = async (firstName, lastName, recordType, details) => {
    try {
      const searchRes = await supaFetch(`profiles?first_name=eq.${encodeURIComponent(firstName)}&last_name=eq.${encodeURIComponent(lastName)}&limit=1`);
      const existing = await searchRes.json();
      let profileId;
      if (Array.isArray(existing) && existing.length > 0) {
        profileId = existing[0].id;
        const updates = {};
        if (details.inOfficePlan) {
          const sd = new Date().toISOString().split("T")[0];
          updates.plan_status = "active";
          updates.plan_start_date = sd;
          updates.plan_end_date = new Date(Date.now() + 365*24*60*60*1000).toISOString().split("T")[0];
        }
        if (details.email) updates.email = details.email;
        if (Object.keys(updates).length > 0) {
          await supaFetch(`profiles?id=eq.${profileId}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify(updates) });
        }
      } else {
        profileId = crypto.randomUUID();
        const sd = new Date().toISOString().split("T")[0];
        await supaFetch("profiles", { method: "POST", body: JSON.stringify({
          id: profileId,
          email: details.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Date.now()}@buchwald.internal`,
          first_name: firstName, last_name: lastName, role: "user",
          plan_status: details.inOfficePlan ? "active" : "none",
          ...(details.inOfficePlan ? { plan_start_date: sd, plan_end_date: new Date(Date.now()+365*24*60*60*1000).toISOString().split("T")[0] } : {}),
        })});
      }
      await supaFetch("pending_treatments", { method: "POST", body: JSON.stringify({
        user_id: profileId, treatment_name: recordType,
        cost: details.total || 0, status: "shown", notes: details.summary,
      })});
      return true;
    } catch (e) { return false; }
  };

  const fmtDate = (d) => { if (!d) return ""; try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); } catch { return ""; } };
  const timeAgo = (d) => { const diff = Date.now() - new Date(d); const mins = Math.floor(diff / 60000); if (mins < 60) return `${mins}m ago`; const hrs = Math.floor(mins / 60); if (hrs < 24) return `${hrs}h ago`; return `${Math.floor(hrs / 24)}d ago`; };

  // ========== MODE SELECTOR / HUB ==========
  if (appMode === null || appMode === "__refresh__") {
    if (appMode === "__refresh__") return null;

    const filteredMembers = planMembers.filter(m =>
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.phone || "").includes(memberSearch)
    );
    const filteredRecords = patientRecords.filter(r =>
      `${r.first_name} ${r.last_name}`.toLowerCase().includes(recordSearch.toLowerCase()) ||
      (r.phone || "").includes(recordSearch)
    );

    if (selectedPatient) {
      const statusFlow = ["shown", "signed", "paid"];
      const statusColors = { shown: { bg: "#E8F4FA", text: "#0098D4" }, signed: { bg: "#FFF7E0", text: "#B8860B" }, paid: { bg: "#e6f9ee", text: "#2d8a4e" } };
      const statusLabels = { shown: "Shown", signed: "Signed", paid: "Paid" };
      const patientEmail = selectedPatient.email && !selectedPatient.email.includes("@buchwald.internal") ? selectedPatient.email : null;

      return (
        <div style={{ minHeight: "100vh", background: "#f7f9fb", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
          <div style={{ background: BLUE, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button onClick={() => { setSelectedPatient(null); setPatientNotes([]); setPatientTreatments([]); }} style={toolbarBtn}>← Back</button>
            <div style={{ color: "white", fontSize: 16, fontWeight: 700 }}>{selectedPatient.first_name} {selectedPatient.last_name}</div>
            {patientEmail
              ? <a href={`mailto:${patientEmail}`} style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>✉️ Email</a>
              : <div style={{ width: 80 }} />}
          </div>
          <div style={{ padding: "16px", maxWidth: 480, margin: "0 auto" }}>
            {/* Info */}
            <div style={{ background: "white", borderRadius: 12, padding: 20, marginBottom: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Patient Info</div>
              {[["Phone", selectedPatient.phone], ["Email", patientEmail], ["Plan status", selectedPatient.plan_status === "active" ? "In-office plan member" : null], ["Member since", fmtDate(selectedPatient.plan_start_date)]].map(([label, val]) => val ? (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <span style={{ color: GRAY }}>{label}</span><span style={{ fontWeight: 600 }}>{val}</span>
                </div>
              ) : null)}
            </div>

            {/* Treatments */}
            <div style={{ background: "white", borderRadius: 12, padding: 20, marginBottom: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Treatment Records</div>
              {patientTreatments.length === 0 && <div style={{ fontSize: 13, color: GRAY }}>No records yet.</div>}
              {patientTreatments.map(t => {
                const sc = statusColors[t.status] || statusColors.shown;
                return (
                  <div key={t.id} style={{ background: "#f7f9fb", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{t.treatment_name}</div>
                      {t.cost > 0 && <div style={{ fontSize: 13, fontWeight: 700, color: BLUE }}>${parseFloat(t.cost).toFixed(2)}</div>}
                    </div>
                    {t.notes && <div style={{ fontSize: 12, color: GRAY, marginBottom: 8, lineHeight: 1.4 }}>{t.notes}</div>}
                    <div style={{ fontSize: 11, color: GRAY, marginBottom: 8 }}>{fmtDate(t.created_at)}</div>
                    {/* Status stepper */}
                    <div style={{ display: "flex", gap: 6 }}>
                      {statusFlow.map(s => {
                        const active = t.status === s;
                        const done = statusFlow.indexOf(t.status) > statusFlow.indexOf(s);
                        return (
                          <button key={s} onClick={() => updateTreatmentStatus(t.id, s)}
                            style={{ flex: 1, padding: "6px 4px", borderRadius: 8, border: `1.5px solid ${active || done ? sc.text : "#ddd"}`, background: active ? sc.bg : done ? "#f0f0f0" : "white", color: active ? sc.text : done ? GRAY : GRAY, fontSize: 12, fontWeight: active ? 700 : 400, cursor: "pointer" }}>
                            {done ? "✓ " : ""}{statusLabels[s]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Notes */}
            <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Notes</div>
              {patientNotes.length === 0 && <div style={{ fontSize: 13, color: GRAY, marginBottom: 12 }}>No notes yet.</div>}
              {patientNotes.map(n => (
                <div key={n.id} style={{ background: "#f7f9fb", borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
                  <div style={{ fontSize: 13 }}>{n.note}</div>
                  <div style={{ fontSize: 11, color: GRAY, marginTop: 4 }}>{fmtDate(n.created_at)}</div>
                </div>
              ))}
              <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..." style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, resize: "vertical", minHeight: 80, boxSizing: "border-box", marginTop: 8 }} />
              <button onClick={saveNote} disabled={savingNote || !newNote.trim()} style={{ width: "100%", padding: 14, background: newNote.trim() ? BLUE : "#ccc", color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: newNote.trim() ? "pointer" : "not-allowed", marginTop: 8 }}>
                {savingNote ? "Saving..." : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ minHeight: "100vh", background: "#f7f9fb", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <style>{`@media print { body { display: none; } }`}</style>
        {/* Header */}
        <div style={{ background: BLUE, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 34, height: 34, background: "white", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <img src="/logo.png" alt="" style={{ width: 30, height: "auto" }} />
            </div>
            <div>
              <div style={{ color: "white", fontSize: 15, fontWeight: 700 }}>Buchwald Family Dentistry</div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>Staff Hub</div>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div style={{ background: "white", borderBottom: "1px solid #e8e8e8", display: "flex" }}>
          {[["home","🏠","Home"], ["members","⭐","Plan Members"], ["records","📁","Records"]].map(([tab, icon, label]) => (
            <button key={tab} onClick={() => setHubTab(tab)} style={{ flex: 1, padding: "12px 4px", background: "none", border: "none", borderBottom: hubTab === tab ? `3px solid ${BLUE}` : "3px solid transparent", color: hubTab === tab ? BLUE : GRAY, fontSize: 12, fontWeight: hubTab === tab ? 700 : 400, cursor: "pointer" }}>
              {icon} {label}
            </button>
          ))}
        </div>

        <div style={{ padding: "16px", maxWidth: 480, margin: "0 auto" }}>

          {/* HOME TAB */}
          {hubTab === "home" && (
            <>
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                {[["⭐", hubStats.members, "plan members"], ["📋", hubStats.plansToday, "added today"], ["🛡️", hubStats.warranties, "warranties"]].map(([icon, val, label]) => (
                  <div key={label} style={{ background: "white", borderRadius: 12, padding: "14px 10px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
                    <div style={{ fontSize: 20 }}>{icon}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: DARK, lineHeight: 1.2 }}>{hubLoading ? "–" : val}</div>
                    <div style={{ fontSize: 11, color: GRAY, marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div style={{ fontSize: 12, fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Quick Actions</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <button onClick={() => setAppMode("treatment")} style={{ padding: "18px 16px", background: BLUE, border: "none", borderRadius: 14, cursor: "pointer", textAlign: "left", color: "white" }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>📋</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Treatment Plan</div>
                  <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>New form</div>
                </button>
                <button onClick={() => setAppMode("warranty")} style={{ padding: "18px 16px", background: "white", border: "2px solid #e0e0e0", borderRadius: 14, cursor: "pointer", textAlign: "left" }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>🛡️</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: DARK }}>Lifetime Warranty</div>
                  <div style={{ fontSize: 11, color: GRAY, marginTop: 2 }}>New form</div>
                </button>
                <button onClick={() => { setHubTab("members"); setShowAddMember(true); }} style={{ padding: "18px 16px", background: "white", border: "2px solid #e0e0e0", borderRadius: 14, cursor: "pointer", textAlign: "left" }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>➕</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: DARK }}>Add Member</div>
                  <div style={{ fontSize: 11, color: GRAY, marginTop: 2 }}>In-office plan</div>
                </button>
                <button onClick={() => setHubTab("records")} style={{ padding: "18px 16px", background: "white", border: "2px solid #e0e0e0", borderRadius: 14, cursor: "pointer", textAlign: "left" }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>📁</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: DARK }}>Patient Records</div>
                  <div style={{ fontSize: 11, color: GRAY, marginTop: 2 }}>Search &amp; notes</div>
                </button>
              </div>

              {/* Recent Activity */}
              <div style={{ fontSize: 12, fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Recent Activity</div>
              <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden" }}>
                {hubLoading && <div style={{ padding: 20, textAlign: "center", color: GRAY, fontSize: 13 }}>Loading...</div>}
                {!hubLoading && recentActivity.length === 0 && <div style={{ padding: 20, textAlign: "center", color: GRAY, fontSize: 13 }}>No activity yet</div>}
                {recentActivity.map((a, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: i < recentActivity.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{a.name}</span>
                      <span style={{ fontSize: 13, color: GRAY }}> — {a.action}</span>
                    </div>
                    <span style={{ fontSize: 11, color: GRAY, flexShrink: 0, marginLeft: 8 }}>{timeAgo(a.date)}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* MEMBERS TAB */}
          {hubTab === "members" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: DARK }}>In-Office Plan Members <span style={{ color: BLUE }}>({planMembers.length})</span></div>
                <button onClick={() => setShowAddMember(!showAddMember)} style={{ background: BLUE, color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Add</button>
              </div>

              {showAddMember && (
                <div style={{ background: "white", borderRadius: 12, padding: 20, marginBottom: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: DARK, marginBottom: 14 }}>New Plan Member</div>
                  {[["First name *", "first_name", "text"], ["Last name *", "last_name", "text"]].map(([label, field, type]) => (
                    <div key={field} style={{ marginBottom: 10 }}>
                      <label style={{ fontSize: 12, color: GRAY, display: "block", marginBottom: 4 }}>{label}</label>
                      <input type={type} value={newMember[field]} onChange={e => setNewMember(p => ({ ...p, [field]: e.target.value }))}
                        style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 15, boxSizing: "border-box" }} />
                    </div>
                  ))}
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 12, color: GRAY, display: "block", marginBottom: 4 }}>Plan start date *</label>
                    <input type="date" value={newMember.plan_start_date} onChange={e => setNewMember(p => ({ ...p, plan_start_date: e.target.value }))}
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 15, boxSizing: "border-box" }} />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, color: GRAY, display: "block", marginBottom: 4 }}>Phone (optional)</label>
                    <input type="tel" value={newMember.phone} onChange={e => setNewMember(p => ({ ...p, phone: e.target.value }))}
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 15, boxSizing: "border-box" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setShowAddMember(false)} style={{ flex: 1, padding: 12, background: "#f0f0f0", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>Cancel</button>
                    <button onClick={addMember} disabled={addMemberLoading || !newMember.first_name || !newMember.last_name}
                      style={{ flex: 2, padding: 12, background: newMember.first_name && newMember.last_name ? BLUE : "#ccc", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                      {addMemberLoading ? "Saving..." : "Enroll Member"}
                    </button>
                  </div>
                </div>
              )}

              <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)} placeholder="Search by name or phone..." style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 15, marginBottom: 12, boxSizing: "border-box" }} />

              {hubLoading && <div style={{ textAlign: "center", color: GRAY, padding: 20 }}>Loading...</div>}
              {!hubLoading && filteredMembers.length === 0 && <div style={{ textAlign: "center", color: GRAY, padding: 20, fontSize: 13 }}>No members found</div>}
              {filteredMembers.map(m => (
                <div key={m.id} onClick={() => { setSelectedPatient(m); loadPatientNotes(m.id); loadPatientTreatments(m.id); }}
                  style={{ background: "white", borderRadius: 12, padding: "14px 16px", marginBottom: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: DARK }}>{m.first_name} {m.last_name}</div>
                    {m.phone && <div style={{ fontSize: 12, color: GRAY, marginTop: 2 }}>{m.phone}</div>}
                    {m.plan_start_date && <div style={{ fontSize: 12, color: GRAY }}>Member since {fmtDate(m.plan_start_date)}</div>}
                  </div>
                  <div style={{ background: "#e6f9ee", color: "#2d8a4e", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>Active</div>
                </div>
              ))}
            </>
          )}

          {/* RECORDS TAB */}
          {hubTab === "records" && (
            <>
              <div style={{ fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 12 }}>Patient Records <span style={{ color: BLUE }}>({patientRecords.length})</span></div>
              <input value={recordSearch} onChange={e => setRecordSearch(e.target.value)} placeholder="Search by name or phone..." style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 15, marginBottom: 12, boxSizing: "border-box" }} />
              {hubLoading && <div style={{ textAlign: "center", color: GRAY, padding: 20 }}>Loading...</div>}
              {!hubLoading && filteredRecords.length === 0 && <div style={{ textAlign: "center", color: GRAY, padding: 20, fontSize: 13 }}>No records found</div>}
              {filteredRecords.map(r => (
                <div key={r.id} onClick={() => { setSelectedPatient(r); loadPatientNotes(r.id); loadPatientTreatments(r.id); }}
                  style={{ background: "white", borderRadius: 12, padding: "14px 16px", marginBottom: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: DARK }}>{r.first_name} {r.last_name}</div>
                    {r.phone && <div style={{ fontSize: 12, color: GRAY, marginTop: 2 }}>{r.phone}</div>}
                    <div style={{ fontSize: 12, color: GRAY }}>Added {fmtDate(r.created_at)}</div>
                  </div>
                  {r.plan_status === "active" && <div style={{ background: "#e6f9ee", color: "#2d8a4e", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>Plan</div>}
                </div>
              ))}
            </>
          )}

        </div>
      </div>
    );
  }

  // ========== WARRANTY SIGNATURE COLLECTION ==========
  if (appMode === "warranty" && collectWarrantySig && !showWarrantyPreview) {
    return (
      <div style={{ minHeight: "100vh", background: "#f7f9fb", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <style>{`@media print { body { display: none; } }`}</style>
        <div style={{ background: BLUE, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setCollectWarrantySig(false)} style={toolbarBtn}>{"\u2190"} Back</button>
          <div style={{ color: "white", fontSize: 16, fontWeight: 700 }}>Collect Signature</div>
        </div>
        <div style={{ padding: "24px 16px", maxWidth: 480, margin: "0 auto" }}>
          <div style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: DARK }}>Patient Signature</div>
              <div style={{ fontSize: 13, color: GRAY, marginTop: 4 }}>Hand the device to the patient to sign</div>
            </div>
            <div style={{ background: "#f7f9fb", borderRadius: 10, padding: "12px 14px", marginBottom: 20, fontSize: 13 }}>
              <div><b>Patient:</b> {warrantyPatientName}</div>
              <div><b>Choice:</b> {warrantyChoice === "agree" ? "Agrees to warranty conditions" : "Elects to waive warranty"}</div>
              <div><b>Treatments:</b> {allWarrantyTreatments}</div>
            </div>
            <SignaturePad key="warranty-sig" label="Sign here"
              onSave={(data) => setWarrantySig(data)}
              onClear={() => setWarrantySig(null)}
            />
            <button onClick={() => { setCollectWarrantySig(false); setShowWarrantyPreview(true); }}
              disabled={!warrantySig}
              style={{ width: "100%", padding: 16, border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: warrantySig ? "pointer" : "not-allowed", background: warrantySig ? BLUE : "#ccc", color: "white" }}>
              View Warranty Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== WARRANTY FORM VIEW ==========
  if (appMode === "warranty" && !showWarrantyPreview) {
    return (
      <div style={{ minHeight: "100vh", background: "#f7f9fb", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <style>{`@media print { body { display: none; } }`}</style>
        <div style={{ background: BLUE, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => { resetWarrantyForm(); setAppMode(null); }} style={toolbarBtn}>{"\u2190"} Back</button>
          <div>
            <div style={{ color: "white", fontSize: 16, fontWeight: 700 }}>Buchwald Family Dentistry</div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>Lifetime Warranty Form</div>
          </div>
        </div>

        <div style={{ padding: "20px 16px", maxWidth: 480, margin: "0 auto" }}>
          <div style={cardStyle}>
            <div style={sectionLabel}>Patient Info</div>
            <label style={labelStyle}>Patient Name</label>
            <input type="text" value={warrantyPatientName} onChange={(e) => setWarrantyPatientName(e.target.value)} placeholder="First Last" style={inputStyle} />
            <label style={labelStyle}>Date</label>
            <input type="text" value={warrantyDate} onChange={(e) => setWarrantyDate(e.target.value)} style={inputStyle} />
          </div>

          <div style={cardStyle}>
            <div style={sectionLabel}>Treatments Under Warranty</div>
            <div style={{ fontSize: 12, color: GRAY, marginTop: 6, marginBottom: 14 }}>Select treatments and assign tooth numbers</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {WARRANTY_TREATMENTS.map((t) => {
                const selected = selectedWarrantyTreatments.includes(t);
                return (
                  <button key={t} onClick={() => toggleWarrantyTreatment(t)}
                    style={{ padding: "8px 14px", borderRadius: 20, border: `1.5px solid ${selected ? BLUE : "#ddd"}`, background: selected ? LIGHT_BLUE : "white", color: selected ? BLUE : GRAY, fontSize: 13, fontWeight: selected ? 600 : 400, cursor: "pointer", transition: "all 0.15s" }}>
                    {selected && "\u2713 "}{t}
                  </button>
                );
              })}
            </div>

            {/* Tooth grids for selected treatments */}
            {warrantyItems.map((item) => {
              const isPreset = WARRANTY_TREATMENTS.includes(item.name);
              const needsTeeth = ["Crowns", "Composite Fillings", "Implants", "Bridges", "Veneers", "Preventive Resin Restoration"].includes(item.name) || !isPreset;
              return (
                <div key={item.name} style={{ background: "#f7f9fb", borderRadius: 10, padding: "12px 14px", marginBottom: 10, position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: needsTeeth ? 8 : 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: BLUE }}>{item.name}</div>
                    {!isPreset && (
                      <button onClick={() => setWarrantyItems(prev => prev.filter(x => x.name !== item.name))}
                        style={{ background: "none", border: "none", color: "#cc3333", fontSize: 18, cursor: "pointer", lineHeight: 1 }}>{"\u00D7"}</button>
                    )}
                  </div>
                  {item.teeth.length > 0 && (
                    <div style={{ fontSize: 11, color: BLUE, fontWeight: 600, marginBottom: 6 }}>Teeth: #{item.teeth.join(", #")}</div>
                  )}
                  {needsTeeth && (
                    <>
                      <div style={{ fontSize: 11, color: GRAY, marginBottom: 6 }}>Select tooth numbers <span style={{ fontWeight: 400, color: "#999" }}>(optional)</span></div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 5 }}>
                        {Array.from({ length: 32 }, (_, i) => i + 1).map((num) => {
                          const sel = item.teeth.includes(num);
                          return (
                            <button key={num} onClick={() => toggleWarrantyTooth(item.name, num)}
                              style={{ padding: "7px 0", borderRadius: 8, border: `1.5px solid ${sel ? BLUE : "#ddd"}`, background: sel ? BLUE : "white", color: sel ? "white" : DARK, fontSize: 12, fontWeight: sel ? 700 : 400, cursor: "pointer", transition: "all 0.15s" }}>
                              {num}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            <label style={{ ...labelStyle, marginTop: warrantyItems.length > 0 ? 8 : 0 }}>Add Custom Treatment</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="text" value={warrantyCustomTreatment} onChange={(e) => setWarrantyCustomTreatment(e.target.value)}
                placeholder="Other treatment..." style={{ ...inputStyle, flex: 1 }}
                onKeyDown={(e) => { if (e.key === "Enter") addCustomWarrantyTreatment(); }}
              />
              <button onClick={addCustomWarrantyTreatment}
                style={{ padding: "12px 16px", background: warrantyCustomTreatment.trim() ? BLUE : "#ccc", color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: warrantyCustomTreatment.trim() ? "pointer" : "not-allowed", flexShrink: 0 }}>
                + Add
              </button>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={sectionLabel}>Patient Election</div>
            <div style={{ marginTop: 14 }}>
              <div onClick={() => setWarrantyChoice("agree")}
                style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", background: warrantyChoice === "agree" ? "#e6f9ee" : "#f7f9fb", border: `1.5px solid ${warrantyChoice === "agree" ? "#2d8a4e" : "#e0e0e0"}`, borderRadius: 10, cursor: "pointer", marginBottom: 10, transition: "all 0.2s" }}>
                <div style={{ width: 22, height: 22, borderRadius: 11, border: `2px solid ${warrantyChoice === "agree" ? "#2d8a4e" : "#ccc"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  {warrantyChoice === "agree" && <div style={{ width: 12, height: 12, borderRadius: 6, background: "#2d8a4e" }} />}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: DARK }}>
                  <b>I agree</b> to the above conditions for the warranty of my prescribed treatment.
                </div>
              </div>
              <div onClick={() => setWarrantyChoice("waive")}
                style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", background: warrantyChoice === "waive" ? "#FFF3F3" : "#f7f9fb", border: `1.5px solid ${warrantyChoice === "waive" ? "#cc3333" : "#e0e0e0"}`, borderRadius: 10, cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ width: 22, height: 22, borderRadius: 11, border: `2px solid ${warrantyChoice === "waive" ? "#cc3333" : "#ccc"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  {warrantyChoice === "waive" && <div style={{ width: 12, height: 12, borderRadius: 6, background: "#cc3333" }} />}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: DARK }}>
                  <b>I elect to waive</b> the warranty for my prescribed treatment and release Buchwald Family Dentistry and Orthodontics and its providers from obligation to replace or repair my dental treatment/prosthesis.
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => {
            setCollectWarrantySig(true);
            const [firstName, ...rest] = warrantyPatientName.trim().split(" ");
            const lastName = rest.join(" ") || "-";
            const summary = `Date: ${warrantyDate} | Treatments: ${allWarrantyTreatments} | Election: ${warrantyChoice === "agree" ? "Agreed" : "Waived"}`;
            savePatientRecord(firstName, lastName, "Warranty Form", { total: 0, summary });
          }} disabled={!warrantyFormComplete}
            style={{ width: "100%", padding: 16, background: warrantyFormComplete ? BLUE : "#ccc", color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: warrantyFormComplete ? "pointer" : "not-allowed", marginBottom: 10 }}>
            Collect Signature
          </button>
          <button onClick={() => {
            setShowWarrantyPreview(true);
            const [firstName, ...rest] = warrantyPatientName.trim().split(" ");
            const lastName = rest.join(" ") || "-";
            const summary = `Date: ${warrantyDate} | Treatments: ${allWarrantyTreatments} | Election: ${warrantyChoice === "agree" ? "Agreed" : "Waived"}`;
            savePatientRecord(firstName, lastName, "Warranty Form", { total: 0, summary });
          }} disabled={!warrantyFormComplete}
            style={{ width: "100%", padding: 16, background: "white", color: warrantyFormComplete ? BLUE : "#ccc", border: `2px solid ${warrantyFormComplete ? BLUE : "#ccc"}`, borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: warrantyFormComplete ? "pointer" : "not-allowed", marginBottom: 10 }}>
            Preview Without Signature
          </button>
          <div style={{ textAlign: "center", fontSize: 12, color: GRAY, padding: "6px 0 24px" }}>Add to Home Screen for quick access</div>
        </div>
      </div>
    );
  }

  // ========== WARRANTY PRINT PREVIEW ==========
  if (appMode === "warranty" && showWarrantyPreview) {
    return (
      <div style={{ background: "#f0f0f0", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
        <style>{`
          @media screen { .no-print { display: flex !important; } .print-page { width: 8.5in; max-width: 100%; margin: 0 auto 20px; background: white; box-shadow: 0 2px 12px rgba(0,0,0,0.15); padding: 0.5in 0.75in; } }
          @media print { .no-print { display: none !important; } body, html { margin: 0; padding: 0; } .print-page { width: 8.5in; padding: 0.5in 0.75in; margin: 0; box-shadow: none; page-break-after: always; background: white; } .print-page:last-child { page-break-after: auto; } }
        `}</style>

        <div className="no-print" style={{ display: "none", position: "sticky", top: 0, zIndex: 100, background: BLUE, padding: "10px 16px", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => setShowWarrantyPreview(false)} style={toolbarBtn}>{"\u2190"} Edit</button>
          <div style={{ display: "flex", gap: 6 }}>
            {!warrantySig && (
              <button onClick={() => { setShowWarrantyPreview(false); setCollectWarrantySig(true); }} style={toolbarBtn}>{"\u270D\uFE0F"} Sign</button>
            )}
            <button onClick={() => {
              const subject = encodeURIComponent(`Lifetime Warranty - ${warrantyPatientName} - Buchwald Family Dentistry`);
              const body = encodeURIComponent(`Lifetime Warranty Form\n\nPatient: ${warrantyPatientName}\nDate: ${warrantyDate}\n\nTreatments Under Warranty:\n${warrantyItems.map(item => `- ${item.name}${item.teeth.length > 0 ? " (Teeth #" + item.teeth.join(", #") + ")" : ""}`).join("\n")}\n\nPatient Election: ${warrantyChoice === "agree" ? "Agreed to warranty conditions" : "Elected to waive warranty"}\n\n---\nBuchwald Family Dentistry & Orthodontics`);
              window.location.href = `mailto:?subject=${subject}&body=${body}`;
            }} style={toolbarBtn}>{"\u2709\uFE0F"} Email</button>
            <button onClick={() => { resetWarrantyForm(); }} style={toolbarBtn}>New</button>
            <button onClick={() => savePDF("warranty-pdf-content", `Warranty_${warrantyPatientName || "Form"}.pdf`)} style={toolbarBtn}>⬇️ PDF</button>
            <button onClick={() => window.print()} style={{ background: "white", color: BLUE, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Print</button>
          </div>
        </div>

        <div id="warranty-pdf-content">
        <div className="print-page">
          <div style={{ textAlign: "center", marginBottom: 4 }}><Logo width={190} /></div>
          <div style={{ borderBottom: `3px solid ${BLUE}`, marginBottom: 10 }} />
          <div style={{ textAlign: "center", fontSize: 19, fontWeight: 700, color: BLUE, marginBottom: 2 }}>Lifetime Dental Treatment Warranty</div>
          <div style={{ textAlign: "center", fontSize: 11, color: GRAY, marginBottom: 10 }}>Your Investment, Protected for Life</div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 11.5 }}>
            <div><b style={{ color: GRAY }}>Patient: </b><span style={{ borderBottom: "1px solid #999", paddingBottom: 1, display: "inline-block", minWidth: 220 }}>{warrantyPatientName}</span></div>
            <div><b style={{ color: GRAY }}>Date: </b><span style={{ borderBottom: "1px solid #999", paddingBottom: 1, display: "inline-block", minWidth: 120 }}>{warrantyDate}</span></div>
          </div>

          <p style={{ fontSize: 10.5, lineHeight: 1.55, margin: "0 0 8px", color: DARK }}>
            At Buchwald Family Dentistry, we are so confident in the quality of our work that we back it with a <b style={{ color: BLUE }}>Lifetime Warranty</b>. If a warranted restoration fails under normal use, we will repair or replace it at no additional charge — including re-treatment of the same tooth for the same issue. This warranty is our promise that your investment in your smile is protected.
          </p>

          <div style={{ background: LIGHT_BLUE, border: `1.5px solid ${BLUE}`, borderRadius: 4, padding: "6px 10px", marginBottom: 8, fontSize: 10, lineHeight: 1.5 }}>
            <div style={{ fontWeight: 700, color: BLUE, fontSize: 11, marginBottom: 2 }}>Treatments Covered Under This Warranty</div>
            <p style={{ margin: 0 }}>Crowns, Composite Fillings, Implants, Orthodontics (first 2 replacement retainers at no charge), Preventive Resin Restoration, Scaling &amp; Root Planning, Bridges, and Veneers placed at our office.</p>
          </div>

          {/* Value comparison */}
          <div style={{ background: "#F9FBF2", border: "1.5px solid #8AAE2B", borderRadius: 4, padding: "6px 10px", marginBottom: 8, fontSize: 10 }}>
            <div style={{ fontWeight: 700, color: "#5A7A10", fontSize: 11, marginBottom: 4 }}>What This Warranty Saves You</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <span>Crown replacement without warranty:</span>
              <span style={{ fontWeight: 700 }}>$2,500 – $3,000</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <span>Implant crown replacement without warranty:</span>
              <span style={{ fontWeight: 700 }}>$4,000 – $6,000</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed #8AAE2B", paddingTop: 3, marginTop: 2 }}>
              <span style={{ fontWeight: 700, color: "#5A7A10" }}>With your Lifetime Warranty:</span>
              <span style={{ fontWeight: 700, color: "#5A7A10" }}>$0</span>
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, marginBottom: 4 }}>Your Lifetime Care Plan</div>
          <p style={{ fontSize: 10, lineHeight: 1.4, margin: "0 0 4px", color: DARK }}>
            To keep your warranty active and your dental work lasting as long as possible, we ask that you stay current with the following preventive care. These aren't just requirements — they're the same things we'd recommend to every patient to protect their smile:
          </p>
          <div style={{ paddingLeft: 14, fontSize: 10, lineHeight: 1.65, marginBottom: 6 }}>
            <div style={{ marginBottom: 2 }}>1. <b>Regular Cleanings</b> every 6-7 months (or Perio Maintenance every 3-4 months for patients with bone loss) — the foundation of long-lasting restorations</div>
            <div style={{ marginBottom: 2 }}>2. <b>Custom Nightguard</b> (starting at $400 depending on insurance) — worn regularly, this protects your crowns, implants, and fillings from grinding and clenching, one of the top causes of restoration failure</div>
            <div style={{ marginBottom: 2 }}>3. <b>Fluoride Treatment</b> twice per year — strengthens tooth structure around restorations and prevents decay at the margins</div>
            <div style={{ marginBottom: 2 }}>4. <b>Laser Bacterial Reduction</b> at least once every 12 months — eliminates harmful bacteria below the gumline that can compromise restorations and gum health</div>
            <div style={{ marginBottom: 2 }}>5. <b>InnerView Restoration Integrity Scan</b> every 6 months — our advanced diagnostic scan detects leaking crowns, loose restorations, and hidden cracks <i>before</i> they become costly problems. Think of it as an early warning system that catches a potential $2,500+ issue when it's still a $0 fix under your warranty.</div>
          </div>

          <p style={{ fontSize: 10, fontWeight: 700, color: DARK, marginBottom: 6, background: "#FFF7E0", border: "1px solid #D4A017", borderRadius: 3, padding: "4px 8px" }}>
            If any of these 5 requirements are not maintained, the lifetime warranty coverage will be voided.
          </p>

          <div style={{ fontSize: 10, marginBottom: 2, color: GRAY }}><b>Warranty Effective Date:</b> Coverage begins <b>5 years</b> from the signature date of this agreement.</div>

          <div style={{ fontSize: 11.5, marginBottom: 3, marginTop: 8 }}><b>Treatment Under Warranty:</b></div>
          <div style={{ borderBottom: "1.5px solid #999", marginBottom: 5, paddingBottom: 3, fontSize: 11.5, minHeight: 18 }}>
            {allWarrantyTreatments}
          </div>
          <div style={{ borderBottom: "1.5px solid #999", marginBottom: 5, minHeight: 12 }} />
          <div style={{ borderBottom: "1.5px solid #999", marginBottom: 10, minHeight: 12 }} />

          <div style={{ marginBottom: 8, fontSize: 10.5, lineHeight: 1.65 }}>
            <div style={{ marginBottom: 6, display: "flex", alignItems: "flex-start", gap: 8 }}>
              <div style={{ width: 45, borderBottom: "1.5px solid #999", flexShrink: 0, marginTop: 8, textAlign: "center" }}>
                {warrantyChoice === "agree" && <span style={{ fontSize: 15, fontWeight: 700 }}>{"\u2713"}</span>}
              </div>
              <span><b>I agree</b> to the above conditions for the warranty of my prescribed treatment.</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <div style={{ width: 45, borderBottom: "1.5px solid #999", flexShrink: 0, marginTop: 8, textAlign: "center" }}>
                {warrantyChoice === "waive" && <span style={{ fontSize: 15, fontWeight: 700 }}>{"\u2713"}</span>}
              </div>
              <span><b>I elect to waive</b> the warranty for my prescribed treatment and release Buchwald Family Dentistry and Orthodontics and its providers from obligation to replace or repair my dental treatment/prosthesis.</span>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div style={{ flex: "0 0 58%" }}>
                {warrantySig ? (
                  <>
                    <img src={warrantySig} alt="Patient Signature" style={{ height: 50, maxWidth: "80%" }} />
                    <div style={{ borderTop: "1.5px solid #999", width: "90%", marginTop: -4 }} />
                  </>
                ) : (
                  <div style={{ borderBottom: "1.5px solid #999", width: "90%", marginBottom: 0, minHeight: 36 }} />
                )}
                <div style={{ fontSize: 10, fontWeight: 700, color: DARK, marginTop: 4 }}>Signature</div>
              </div>
              <div style={{ flex: "0 0 38%" }}>
                <div style={{ borderBottom: "1.5px solid #999", width: "100%", marginBottom: 0, paddingBottom: 4, fontSize: 12, minHeight: 16 }}>
                  {warrantyDate}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: DARK, marginTop: 4 }}>Date</div>
              </div>
            </div>
          </div>
        </div>
        </div> {/* end warranty-pdf-content */}
      </div>
    );
  }

  // ========== TREATMENT PLAN SIGNATURE MODE ==========
  if (collectSignatures && !showPreview) {
    const steps = {
      patient: { label: "Patient Signature", sub: "Hand the device to the patient to sign", next: "coordinator" },
      coordinator: { label: "Treatment Coordinator", sub: "Coordinator, please sign below", next: "patient2" },
      patient2: { label: "Patient Signature (Page 2)", sub: "Patient, please sign once more for the warranty acknowledgment", next: null },
    };
    const cfg = steps[sigStep];
    const currentSig = sigStep === "patient" ? patientSig : sigStep === "coordinator" ? coordinatorSig : patientSig2;

    return (
      <div style={{ minHeight: "100vh", background: "#f7f9fb", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <style>{`@media print { body { display: none; } }`}</style>
        <div style={{ background: BLUE, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setCollectSignatures(false)} style={toolbarBtn}>{"\u2190"} Back</button>
          <div style={{ color: "white", fontSize: 16, fontWeight: 700 }}>Collect Signatures</div>
        </div>
        <div style={{ padding: "24px 16px", maxWidth: 480, margin: "0 auto" }}>
          <div style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                Step {sigStep === "patient" ? "1 of 3" : sigStep === "coordinator" ? "2 of 3" : "3 of 3"}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: DARK }}>{cfg.label}</div>
              <div style={{ fontSize: 13, color: GRAY, marginTop: 4 }}>{cfg.sub}</div>
            </div>
            <div style={{ background: "#f7f9fb", borderRadius: 10, padding: "12px 14px", marginBottom: 20, fontSize: 13 }}>
              <div><b>Patient:</b> {patientName}</div>
              <div><b>Treatment:</b> {treatmentDisplay}</div>
              <div><b>Debit Price:</b> ${totalDebit.toFixed(2)}</div>
            </div>
            <SignaturePad key={sigStep} label="Sign here"
              onSave={(data) => { if (sigStep === "patient") setPatientSig(data); else if (sigStep === "coordinator") setCoordinatorSig(data); else setPatientSig2(data); }}
              onClear={() => { if (sigStep === "patient") setPatientSig(null); else if (sigStep === "coordinator") setCoordinatorSig(null); else setPatientSig2(null); }}
            />
            <button onClick={() => { if (cfg.next) setSigStep(cfg.next); else { setCollectSignatures(false); setShowPreview(true); } }}
              disabled={!currentSig}
              style={{ width: "100%", padding: 16, border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: currentSig ? "pointer" : "not-allowed", background: currentSig ? BLUE : "#ccc", color: "white" }}>
              {cfg.next ? "Next \u2192" : "View Treatment Plan"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== TREATMENT PLAN FORM VIEW ==========
  if (appMode === "treatment" && !showPreview) {
    return (
      <div style={{ minHeight: "100vh", background: "#f7f9fb", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <style>{`@media print { body { display: none; } }`}</style>
        <div style={{ background: BLUE, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => { resetForm(); setAppMode(null); }} style={toolbarBtn}>{"\u2190"} Back</button>
          <div>
            <div style={{ color: "white", fontSize: 16, fontWeight: 700 }}>Buchwald Family Dentistry</div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>Treatment Plan Generator</div>
          </div>
        </div>

        <div style={{ padding: "20px 16px", maxWidth: 480, margin: "0 auto" }}>
          <div style={cardStyle}>
            <div style={sectionLabel}>Patient Info</div>
            <label style={labelStyle}>Patient Name</label>
            <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="First Last" style={inputStyle} />
            <label style={labelStyle}>Email <span style={{ fontWeight: 400, color: "#999" }}>(optional — for records &amp; follow-up)</span></label>
            <input type="email" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} placeholder="patient@email.com" style={inputStyle} />
            <label style={labelStyle}>Date</label>
            <input type="text" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
          </div>

          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={sectionLabel}>Treatments</div>
              <button onClick={addTreatment} style={{ background: LIGHT_BLUE, color: BLUE, border: `1.5px solid ${BLUE}`, borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Add</button>
            </div>

            {treatments.map((t, idx) => (
              <div key={t.id} style={{ background: "#f7f9fb", borderRadius: 10, padding: "12px 14px", marginBottom: 10, position: "relative" }}>
                {treatments.length > 1 && (
                  <button onClick={() => removeTreatment(t.id)} style={{ position: "absolute", top: 8, right: 10, background: "none", border: "none", color: "#cc3333", fontSize: 18, cursor: "pointer", lineHeight: 1 }}>{"\u00D7"}</button>
                )}
                <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, marginBottom: 8 }}>Treatment {idx + 1}</div>
                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...labelStyle, marginTop: 0 }}>Treatment</label>
                    <input type="text" value={t.name} onChange={(e) => updateTreatment(t.id, "name", e.target.value)} placeholder="Crown, Invisalign..." style={{ ...inputStyle, padding: "10px 12px" }} />
                  </div>
                  <div style={{ flex: "0 0 100px" }}>
                    <label style={{ ...labelStyle, marginTop: 0 }}>Fee</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ ...dollarSign, left: 10 }}>$</span>
                      <input type="number" inputMode="decimal" value={t.fee} onChange={(e) => updateTreatment(t.id, "fee", e.target.value)} placeholder="0" style={{ ...inputStyle, padding: "10px 12px 10px 24px" }} />
                    </div>
                  </div>
                </div>
                <label style={{ ...labelStyle, marginTop: 0, marginBottom: 8 }}>Tooth # <span style={{ fontWeight: 400, color: "#999" }}>(optional)</span></label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 6 }}>
                  {Array.from({ length: 32 }, (_, i) => i + 1).map((num) => {
                    const selected = t.teeth.includes(num);
                    return (
                      <button key={num} onClick={() => toggleTooth(t.id, num)}
                        style={{ padding: "8px 0", borderRadius: 8, border: `1.5px solid ${selected ? BLUE : "#ddd"}`, background: selected ? BLUE : "white", color: selected ? "white" : DARK, fontSize: 13, fontWeight: selected ? 700 : 400, cursor: "pointer", transition: "all 0.15s" }}>
                        {num}
                      </button>
                    );
                  })}
                </div>
                {t.teeth.length > 0 && (
                  <div style={{ marginTop: 6, fontSize: 12, color: BLUE, fontWeight: 600 }}>Selected: #{t.teeth.join(", #")}</div>
                )}
              </div>
            ))}

            {treatments.length > 1 && (
              <div style={{ textAlign: "right", fontSize: 14, fontWeight: 700, color: DARK, paddingTop: 4 }}>
                Total: ${totalDebit.toFixed(2)}
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <div style={sectionLabel}>Pricing & Financing</div>
            <div onClick={() => { setSameDayDiscount(!sameDayDiscount); if (!sameDayDiscount) setInOfficePlan(false); }} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, marginBottom: 8, cursor: "pointer", padding: "10px 14px", background: sameDayDiscount ? "#e6f9ee" : "#f7f9fb", border: `1.5px solid ${sameDayDiscount ? "#2d8a4e" : "#e0e0e0"}`, borderRadius: 10, transition: "all 0.2s" }}>
              <div style={{ width: 42, height: 24, borderRadius: 12, background: sameDayDiscount ? "#2d8a4e" : "#ccc", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                <div style={{ width: 20, height: 20, borderRadius: 10, background: "white", position: "absolute", top: 2, left: sameDayDiscount ? 20 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: sameDayDiscount ? "#2d8a4e" : DARK }}>Same Day Treatment - 20% Off</div>
                {sameDayDiscount && subtotal > 0 && <div style={{ fontSize: 12, color: "#2d8a4e" }}>Saving ${discountAmount.toFixed(2)}</div>}
              </div>
            </div>

            <div onClick={() => { setInOfficePlan(!inOfficePlan); if (!inOfficePlan) setSameDayDiscount(false); }} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, cursor: "pointer", padding: "10px 14px", background: inOfficePlan ? "#e6f9ee" : "#f7f9fb", border: `1.5px solid ${inOfficePlan ? "#2d8a4e" : "#e0e0e0"}`, borderRadius: 10, transition: "all 0.2s" }}>
              <div style={{ width: 42, height: 24, borderRadius: 12, background: inOfficePlan ? "#2d8a4e" : "#ccc", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                <div style={{ width: 20, height: 20, borderRadius: 10, background: "white", position: "absolute", top: 2, left: inOfficePlan ? 20 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: inOfficePlan ? "#2d8a4e" : DARK }}>In-Office Plan Member - 20% Off</div>
                {inOfficePlan && subtotal > 0 && <div style={{ fontSize: 12, color: "#2d8a4e" }}>Saving ${discountAmount.toFixed(2)}</div>}
              </div>
            </div>

            <label style={labelStyle}>Insurance Coverage (display only)</label>
            <div style={{ position: "relative" }}>
              <span style={dollarSign}>$</span>
              <input type="number" inputMode="decimal" value={insuranceCoverage} onChange={(e) => setInsuranceCoverage(e.target.value)} placeholder="0.00" style={{ ...inputStyle, paddingLeft: 28 }} />
            </div>

            <label style={labelStyle}>Payment Plan</label>
            <select value={financing} onChange={(e) => setFinancing(Number(e.target.value))} style={{ ...inputStyle, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}>
              {FINANCING_OPTIONS.map((o) => <option key={o.months} value={o.months}>{o.label}</option>)}
            </select>

            {subtotal > 0 && (
              <div style={{ marginTop: 16, background: "#f7f9fb", borderRadius: 10, padding: 16 }}>
                {activeDiscount && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13, color: GRAY }}>
                      <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#2d8a4e" }}>
                      <span>{discountLabel}</span><span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14, fontWeight: 600, color: DARK }}>
                  <span>Credit/Card Price</span><span>${creditPrice.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13, color: "#2d8a4e" }}>
                  <span>Save 3% with debit/cash/check</span><span>-${savings.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: BLUE, background: LIGHT_BLUE, margin: "6px -8px 0", padding: "10px 8px", borderRadius: "0 0 8px 8px" }}>
                  <span>Debit/Cash/Check</span><span>${totalDebit.toFixed(2)}</span>
                </div>
                {insuranceNum > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#2d8a4e", marginTop: 8 }}>
                    <span>Insurance Covers</span><span>${insuranceNum.toFixed(2)}</span>
                  </div>
                )}
                {financing > 0 && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed #ddd" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: DARK }}>
                      <span>{financing} months at 0% interest</span><span>${monthlyPayment.toFixed(2)}/mo</span>
                    </div>
                    <div style={{ fontSize: 11, color: GRAY, marginTop: 2 }}>Based on credit/card price of ${creditPrice.toFixed(2)}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <div onClick={() => setShowUpgrades(!showUpgrades)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <div>
                <div style={sectionLabel}>Upgraded Services</div>
                {selectedUpgrades.length > 0 && <div style={{ fontSize: 12, color: GRAY, marginTop: 2 }}>{selectedUpgrades.length} selected</div>}
              </div>
              <svg width="20" height="20" viewBox="0 0 20 20" style={{ transform: showUpgrades ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}><path d="M5 7.5L10 12.5L15 7.5" stroke={GRAY} strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
            </div>
            {showUpgrades && (
              <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {UPGRADED_SERVICES.map((svc) => {
                  const a = selectedUpgrades.includes(svc);
                  return <button key={svc} onClick={() => toggleUpgrade(svc)} style={{ padding: "6px 12px", borderRadius: 20, border: `1.5px solid ${a ? BLUE : "#ddd"}`, background: a ? LIGHT_BLUE : "white", color: a ? BLUE : GRAY, fontSize: 13, fontWeight: a ? 600 : 400, cursor: "pointer" }}>{a && "\u2713 "}{svc}</button>;
                })}
              </div>
            )}
          </div>

          <button onClick={() => {
            setShowPreview(true);
            // Save to Supabase
            const [firstName, ...rest] = patientName.trim().split(" ");
            const lastName = rest.join(" ") || "-";
            const summary = `Date: ${date} | Treatments: ${treatments.filter(t=>t.name).map(t=>`${t.name}${t.teeth.length>0?" (#"+t.teeth.join(", #")+")":""}=$${(parseFloat(t.fee)||0).toFixed(2)}`).join(", ")} | Total: $${totalDebit.toFixed(2)}${activeDiscount?" | "+discountLabel:""}`;
            savePatientRecord(firstName, lastName, "Treatment Plan", { total: totalDebit, summary, email: patientEmail, inOfficePlan });
          }} disabled={!formComplete}
            style={{ width: "100%", padding: 16, background: formComplete ? BLUE : "#ccc", color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: formComplete ? "pointer" : "not-allowed", marginBottom: 10 }}>
            Generate Treatment Plan
          </button>
          <div style={{ textAlign: "center", fontSize: 12, color: GRAY, padding: "6px 0 24px" }}>Add to Home Screen for quick access</div>
        </div>
      </div>
    );
  }

  // ========== TREATMENT PLAN PRINT PREVIEW ==========
  return (
    <div style={{ background: "#f0f0f0", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      <style>{`
        @media screen { .no-print { display: flex !important; } .print-page { width: 8.5in; max-width: 100%; margin: 0 auto 20px; background: white; box-shadow: 0 2px 12px rgba(0,0,0,0.15); padding: 0.5in 0.75in; } }
        @media print { .no-print { display: none !important; } body, html { margin: 0; padding: 0; } .print-page { width: 8.5in; padding: 0.5in 0.75in; margin: 0; box-shadow: none; page-break-after: always; background: white; } .print-page:last-child { page-break-after: auto; } }
      `}</style>

      <div className="no-print" style={{ display: "none", position: "sticky", top: 0, zIndex: 100, background: BLUE, padding: "10px 16px", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => setShowPreview(false)} style={toolbarBtn}>{"\u2190"} Edit</button>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => { setShowPreview(false); setCollectSignatures(true); setSigStep("patient"); }} style={toolbarBtn}>{"\u270D\uFE0F"} Sign</button>
          <button onClick={() => {
            const to = patientEmail || "";
            const subject = encodeURIComponent(`Treatment Plan - ${patientName} - Buchwald Family Dentistry`);
            const body = encodeURIComponent(`Treatment Plan Summary\n\nPatient: ${patientName}\nDate: ${date}\n\nTreatments:\n${treatments.filter(t => t.name).map(t => {
              const teethStr = t.teeth.length > 0 ? "Tooth #" + t.teeth.join(", #") + " - " : "";
              return `- ${teethStr}${t.name}: $${(parseFloat(t.fee) || 0).toFixed(2)}`;
            }).join("\n")}\n\nCredit/Card Price: $${creditPrice.toFixed(2)}\nDebit/Cash/Check Price: $${totalDebit.toFixed(2)}${activeDiscount ? `\n${discountLabel}: -$${discountAmount.toFixed(2)}` : ""}${financing > 0 ? `\n${financing} Month Payment Plan: $${monthlyPayment.toFixed(2)}/mo at 0% interest` : ""}${insuranceNum > 0 ? `\nInsurance Coverage: $${insuranceNum.toFixed(2)}` : ""}\n\nPayment Options:\n1. Pay in full at appointment\n2. For crowns: Half at prep, half at seat\n3. 6-month CareCredit at 0%\n4. Cherry financing as low as 0%\n\n---\nBuchwald Family Dentistry & Orthodontics`);
            window.open(`mailto:${to}?subject=${subject}&body=${body}`, "_blank");
          }} style={toolbarBtn}>✉️ Email</button>
          <button onClick={resetForm} style={toolbarBtn}>New</button>
          <button onClick={() => savePDF("tp-pdf", `TreatmentPlan_${patientName || "Patient"}.pdf`)} style={toolbarBtn}>⬇️ PDF</button>
          <button onClick={() => window.print()} style={{ background: "white", color: BLUE, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Print</button>
        </div>
      </div>

      <div id="tp-pdf">
      {/* PAGE 1 */}
      <div className="print-page">
        <div style={{ textAlign: "center", marginBottom: 4 }}><Logo width={190} /></div>
        <div style={{ borderBottom: `3px solid ${BLUE}`, marginBottom: 12 }} />
        <div style={{ textAlign: "center", fontSize: 22, fontWeight: 700, color: BLUE, marginBottom: 12 }}>Dental Treatment Plan</div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
          <div><b style={{ color: GRAY }}>Patient Name: </b><span style={{ borderBottom: "1px solid #ccc", paddingBottom: 1, display: "inline-block", minWidth: 220 }}>{patientName}</span></div>
          <div><b style={{ color: GRAY }}>Date: </b><span style={{ borderBottom: "1px solid #ccc", paddingBottom: 1, display: "inline-block", minWidth: 130 }}>{date}</span></div>
        </div>
        <div style={{ marginBottom: 10, fontSize: 12 }}>
          <b style={{ color: GRAY }}>Treatment Needs: </b><span style={{ borderBottom: "1px solid #ccc", paddingBottom: 1, display: "inline-block", minWidth: 350 }}>{treatmentDisplay}</span>
        </div>

        {treatments.filter(t => t.name).length > 1 && (
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8, fontSize: 10.5 }}>
            <thead><tr>
              <th style={{ background: "#f0f0f0", padding: "4px 8px", textAlign: "left", fontWeight: 700, borderBottom: "1px solid #ddd" }}>Tooth</th>
              <th style={{ background: "#f0f0f0", padding: "4px 8px", textAlign: "left", fontWeight: 700, borderBottom: "1px solid #ddd" }}>Treatment</th>
              <th style={{ background: "#f0f0f0", padding: "4px 8px", textAlign: "right", fontWeight: 700, borderBottom: "1px solid #ddd" }}>Fee</th>
            </tr></thead>
            <tbody>
              {treatments.filter(t => t.name).map((t, i) => (
                <tr key={i}>
                  <td style={{ padding: "3px 8px", borderBottom: "1px solid #eee" }}>{t.teeth.length > 0 ? "#" + t.teeth.join(", #") : "-"}</td>
                  <td style={{ padding: "3px 8px", borderBottom: "1px solid #eee" }}>{t.name}</td>
                  <td style={{ padding: "3px 8px", borderBottom: "1px solid #eee", textAlign: "right" }}>${(parseFloat(t.fee) || 0).toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan="2" style={{ padding: "4px 8px", fontWeight: 700 }}>Total</td>
                <td style={{ padding: "4px 8px", fontWeight: 700, textAlign: "right" }}>${totalDebit.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        )}

        <div style={{ background: LIGHT_BLUE, border: `1px solid ${BLUE}`, borderRadius: 4, padding: "6px 10px", marginBottom: 8, fontSize: 9.5, fontStyle: "italic", color: GRAY, lineHeight: 1.4 }}>
          * Fees may include upgraded services: {selectedUpgrades.length > 0 ? (
            <>{selectedUpgrades.map((s, i) => <span key={s}><b style={{ color: DARK }}>{s}</b>{i < selectedUpgrades.length - 1 ? ", " : ""}</span>)}{UPGRADED_SERVICES.filter(s => !selectedUpgrades.includes(s)).length > 0 && ", "}{UPGRADED_SERVICES.filter(s => !selectedUpgrades.includes(s)).join(", ")}</>
          ) : UPGRADED_SERVICES.join(", ")}
        </div>

        {activeDiscount && (
          <div style={{ background: "#e6f9ee", border: "1px solid #2d8a4e", borderRadius: 4, padding: "4px 10px", marginBottom: 6, fontSize: 10.5, textAlign: "center" }}>
            <b style={{ color: "#2d8a4e" }}>{discountLabel}</b>
            <span style={{ color: DARK, marginLeft: 8 }}>You save ${discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Patient Pays: <span style={{ fontSize: 15 }}>${creditPrice.toFixed(2)}</span></div>
            {insuranceNum > 0 && <div style={{ fontSize: 10, color: "#2d8a4e", marginTop: 2 }}>Insurance Coverage: ${insuranceNum.toFixed(2)}</div>}
          </div>
          <div style={{ background: LIGHT_BLUE, border: `1.5px solid ${BLUE}`, padding: "5px 12px", borderRadius: 4, textAlign: "center" }}>
            <div style={{ fontSize: 9, color: BLUE }}>Debit/Cash/Check Price</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: BLUE }}>${totalDebit.toFixed(2)}</div>
            <div style={{ fontSize: 8, color: BLUE, marginTop: 1 }}>Save ${savings.toFixed(2)} with debit/cash/check</div>
          </div>
        </div>

        {financing > 0 && (
          <div style={{ background: GOLD_BG, border: "1px solid #D4A017", borderRadius: 4, padding: "5px 10px", marginBottom: 6, fontSize: 10.5, textAlign: "center" }}>
            <b style={{ color: GOLD }}>{financing} Month Payment Plan at 0% Interest:</b>
            <span style={{ color: DARK, marginLeft: 8 }}>${monthlyPayment.toFixed(2)}/mo</span>
          </div>
        )}

        <div style={{ fontSize: 15, fontWeight: 700, color: BLUE, marginBottom: 5, marginTop: 4 }}>Payment Options</div>
        <div style={{ paddingLeft: 16, fontSize: 11, lineHeight: 1.7, marginBottom: 5 }}>
          <div>1. <b>Pay in full</b> at the time of appointment</div>
          <div>2. <b>For crowns:</b> Half at prep date, second half at seat date</div>
          <div>3. <b>6-month CareCredit</b> payment plan with 0% interest</div>
          <div>4. <b>Cherry financing</b> with interest as low as 0%</div>
        </div>
        <div style={{ background: "#FFFBE6", border: "1px solid #D4A017", borderLeft: "3px solid #D4A017", borderRadius: 3, padding: "4px 10px", fontSize: 10, marginBottom: 8 }}>
          <b>Please note:</b> All treatment will be started but will not be completed until the treatment cost has been met in full.
        </div>

        <div style={{ fontSize: 15, fontWeight: 700, color: BLUE, marginBottom: 5 }}>Patient Consent & Authorization</div>
        <div style={{ fontSize: 9.5, lineHeight: 1.5, color: DARK }}>
          <p style={{ margin: "0 0 3px", fontWeight: 700 }}>I understand if insurance does not pay for any reason that I am responsible for the full amount. The estimate of coverage shown is not a guarantee of payment.</p>
          <p style={{ margin: "0 0 3px" }}>Treatment plan options have been presented to me. I understand that my insurance benefit will not pay toward the upgraded service(s) or any cosmetic services or charges pertaining to cosmetic services that I selected, and I understand that I will be responsible for the fee for this treatment. I wish to waive my insurance plan guidelines for the upgraded service(s) and I release the provider, Dr. Max Buchwald Jr, from the contractual terms of my plan in this case.</p>
          <p style={{ margin: "0 0 3px" }}>I, the undersigned patient, hereby authorize my dental care provider to perform the procedure(s) or course(s) of treatment listed herein. I understand my dental condition and have discussed treatment options with my dental care provider. I have been given a printed copy of the procedure or treatment details and any post-op instructions.</p>
          <p style={{ margin: "0 0 3px" }}>I acknowledge I have read and understand the treatments recommended along with the associated fees and payment options presented and have received a copy today. I understand the estimated fees in this treatment plan are valid for 90 days but may change after that time. These fees do not include general dentistry treatment on other areas or teeth.</p>
          <p style={{ margin: "0 0 5px" }}>Appointments cancelled with less than 48 hours notice are subject to a charge of $100 per hour. The Doctor reserves his time for patients who have pre-paid for their treatment and reserves the right to charge a cancellation fee which covers his reserved time.</p>
        </div>
        <div style={{ marginTop: 10 }}>
          <SigBlock sig={patientSig} label="Patient Signature" dateStr={date} />
          <SigBlock sig={coordinatorSig} label="Treatment Coordinator Signature" dateStr={date} />
        </div>
      </div>

      {/* PAGE 2 */}
      <div className="print-page">
        <div style={{ textAlign: "center", marginBottom: 4 }}><Logo width={170} /></div>
        <div style={{ borderBottom: `3px solid ${BLUE}`, marginBottom: 10 }} />
        <div style={{ textAlign: "center", fontSize: 18, fontWeight: 700, color: BLUE, marginBottom: 8 }}>Understanding Your Dental Insurance</div>
        <p style={{ fontSize: 11, lineHeight: 1.5, margin: "0 0 6px" }}>We believe in patient education at Buchwald Family Dentistry. Many patients assume that medical and dental insurance are similar. However, they are quite different:</p>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 6, fontSize: 10.5 }}>
          <thead><tr>
            <th style={{ background: BLUE, color: "white", padding: "5px 8px", fontWeight: 700 }}>Medical Insurance</th>
            <th style={{ background: BLUE, color: "white", padding: "5px 8px", fontWeight: 700 }}>Dental Insurance</th>
          </tr></thead>
          <tbody>
            {[["High deductible","Deductibles below $100"],["High monthly premiums","Low monthly premiums"],["No annual maximum","Annual maximum applies"],["Preauthorization guarantees payment","Predetermination does not guarantee payment"]].map(([m,d],i)=>
              <tr key={i}><td style={{ padding: "4px 8px", border: "1px solid #ddd" }}>{m}</td><td style={{ padding: "4px 8px", border: "1px solid #ddd" }}>{d}</td></tr>
            )}
          </tbody>
        </table>
        <p style={{ fontSize: 9.5, fontStyle: "italic", color: GRAY, margin: "0 0 6px", lineHeight: 1.4 }}>In actuality, dental insurance is not true insurance by any other standard. Dental coverage is more like a discount program with a small treatment assistance benefit attached.</p>

        <div style={{ fontSize: 14, fontWeight: 700, color: BLUE, marginBottom: 4 }}>Why We Prioritize Long-Lasting Dental Work</div>
        <p style={{ fontSize: 10.5, lineHeight: 1.5, margin: "0 0 3px" }}>Many insurance plans only cover replacement of crowns, fillings, root canals, dentures, and implant crowns every 5 years. There are techniques and materials that make restorations last 10, 15, or more years - but these are not always covered by insurance. We believe you deserve the most value from your treatment:</p>
        <ul style={{ fontSize: 10.5, lineHeight: 1.6, margin: "0 0 3px", paddingLeft: 18 }}>
          <li><b>We go the extra mile</b> to use higher-quality materials</li>
          <li><b>We focus on precise technique</b> and attention to detail during every step</li>
          <li><b>Better durability</b> means fewer replacements and better long-term value</li>
        </ul>
        <p style={{ fontSize: 10.5, lineHeight: 1.5, margin: "0 0 5px" }}>Insurance may only reimburse for the minimum standard, but we aim for the <b style={{ color: BLUE }}>highest standard</b> - so your dental work lasts as long as possible.</p>

        <div style={{ borderBottom: `2px solid ${BLUE}`, marginBottom: 6 }} />
        <div style={{ fontSize: 14, fontWeight: 700, color: BLUE, marginBottom: 4 }}>Our Lifetime Warranty</div>
        <p style={{ fontSize: 10.5, lineHeight: 1.5, margin: "0 0 5px" }}>Because we stand behind our work, Buchwald Family Dentistry offers a <b style={{ color: BLUE }}>Lifetime Warranty</b> on qualifying restorations. If a warranted restoration fails under normal use, we will repair or replace it at no additional charge for our work - including re-treatment of the same tooth for the same issue.</p>
        <div style={{ background: "#F0FAFF", border: `1.5px solid ${BLUE}`, borderRadius: 4, padding: "7px 10px", marginBottom: 6, fontSize: 10, lineHeight: 1.5 }}>
          <div style={{ fontWeight: 700, color: BLUE, fontSize: 11, marginBottom: 2 }}>What is Covered</div>
          <p style={{ margin: "0 0 5px" }}>Crowns, bridges, fillings, and other restorations placed at our office are warranted for life against defects in materials and workmanship.</p>
          <div style={{ fontWeight: 700, color: BLUE, fontSize: 11, marginBottom: 2 }}>How to Keep Your Warranty Active</div>
          <p style={{ margin: "0 0 2px" }}>To maintain your lifetime coverage, we recommend staying current with the following preventive care services:</p>
          <ul style={{ margin: "0 0 5px", paddingLeft: 16, lineHeight: 1.6 }}>
            <li><b>Regular cleanings every 6 months</b> - the foundation of a healthy smile and long-lasting restorations</li>
            <li><b>In-office night guard</b> - protects your investment from grinding and clenching, one of the top causes of restoration failure</li>
            <li><b>Fluoride treatment twice per year</b> - strengthens tooth structure around restorations and prevents decay at the margins</li>
            <li><b>Laser bacterial reduction every 12 months</b> - eliminates harmful bacteria below the gumline that can compromise restorations</li>
            <li><b>InnerView scan every 6 months</b> - our advanced diagnostic scan that detects leaking crowns, loose restorations, and hidden cracks before they become bigger problems</li>
          </ul>
          <div style={{ fontWeight: 700, color: BLUE, fontSize: 11, marginBottom: 2 }}>What is Not Covered</div>
          <p style={{ margin: 0 }}>Damage from trauma, accidents, or injury; failure to maintain the recommended preventive care schedule above; neglect of at-home oral care; or using teeth for purposes other than normal chewing.</p>
        </div>
        <div style={{ borderBottom: `2px solid ${BLUE}`, marginBottom: 6 }} />
        <div style={{ fontSize: 11, marginBottom: 2 }}><b style={{ color: GRAY }}>Patient Name (Print): </b><span style={{ borderBottom: "1px solid #ccc", display: "inline-block", minWidth: 280 }}>{patientName}</span></div>
        <div style={{ marginTop: 8 }}><SigBlock sig={patientSig2} label="Patient Signature" dateStr={date} /></div>
      </div>
      </div> {/* end tp-pdf */}
    </div>
  );
}

const cardStyle = { background: "white", borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" };
const sectionLabel = { fontSize: 13, fontWeight: 700, color: "#0098D4", textTransform: "uppercase", letterSpacing: "0.5px" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 6, marginTop: 14 };
const inputStyle = { width: "100%", padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 16, color: "#1A1A1A", outline: "none", background: "#fafafa", WebkitAppearance: "none" };
const dollarSign = { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#666", fontWeight: 600 };
const toolbarBtn = { background: "rgba(255,255,255,0.2)", color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" };
