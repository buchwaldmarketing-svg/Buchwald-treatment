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
const RED = "#cc3333";
const GREEN = "#2d8a4e";
const GREEN_BG = "#e6f9ee";

const UPGRADED_SERVICES = [
  "UltraCal XS","HurriSeal","Gingivectomy","Lab Fees","Core Build Up",
  "Custom Stain Fees","Chairside Lab Fees","Membrane","Bone Graft","Nitrous",
  "Recement Fee","iTero Scan","Surgical Isolation","Therapeutic Parenteral Drug",
  "Root Canal Obstruction","Pulp Vitality Test","Bacterial Decontamination",
  "Jet White Prophy","Fluoride",
];

const FINANCING_OPTIONS = [
  { label: "No financing", months: 0 },
  { label: "6 months 0% (CareCredit)", months: 6 },
  { label: "12 months 0%", months: 12 },
  { label: "18 months 0%", months: 18 },
  { label: "24 months 0%", months: 24 },
];

const WARRANTY_TREATMENTS = [
  "Crowns","Composite Fillings","Implants","Orthodontics",
  "Preventive Resin Restoration","Scaling & Root Planning","Bridges","Veneers",
];

const PRIORITY_LEVELS = [
  { value: "urgent", label: "Urgent", color: "#cc3333", bg: "#FFF3F3", icon: "\u{1F534}" },
  { value: "high", label: "High", color: "#D4760A", bg: "#FFF7E0", icon: "\u{1F7E0}" },
  { value: "moderate", label: "Moderate", color: "#B8860B", bg: "#FFFBE6", icon: "\u{1F7E1}" },
  { value: "low", label: "Low", color: "#2d8a4e", bg: "#e6f9ee", icon: "\u{1F7E2}" },
];

const RISK_DESCRIPTIONS = {
  "Crown": "Without a crown, the weakened tooth is at high risk for fracture. A cracked tooth may require extraction and an implant ($4,000\u2013$6,000), or a root canal ($1,500\u2013$2,000) if the nerve becomes exposed.",
  "Root Canal": "Delaying a root canal on an infected tooth allows the infection to spread to surrounding bone and tissue. This can lead to an abscess, bone loss, and potential tooth loss requiring an implant.",
  "Filling": "An untreated cavity will continue to grow, potentially reaching the nerve and requiring a root canal or crown. What starts as a $200\u2013$400 filling can become a $1,500+ procedure.",
  "Implant": "Missing teeth cause adjacent teeth to shift, leading to bite problems, bone loss in the jaw, and difficulty chewing. Over time, this can affect multiple teeth and significantly increase treatment costs.",
  "Bridge": "Without replacing the missing tooth, surrounding teeth will drift and tilt. This creates hard-to-clean areas leading to decay and gum disease on otherwise healthy teeth.",
  "Extraction": "A damaged or infected tooth left untreated can cause spreading infection, pain, and damage to neighboring teeth. In rare cases, dental infections can become life-threatening.",
  "Deep Cleaning": "Untreated gum disease leads to progressive bone loss around your teeth. Once bone is lost, it doesn't grow back. This is the #1 cause of tooth loss in adults.",
  "Veneer": "While cosmetic, delaying veneers on compromised teeth can allow further wear, chipping, or decay of the underlying tooth structure.",
  "Invisalign": "Misaligned teeth are harder to clean, increasing risk of cavities and gum disease. Bite issues can also cause TMJ pain, headaches, and uneven wear.",
  "Night Guard": "Grinding and clenching can crack teeth, wear down enamel, and destroy dental work including crowns and fillings. A $400 night guard protects thousands of dollars of dental work.",
  "Fluoride": "Regular fluoride strengthens enamel and prevents decay at restoration margins, helping your existing dental work last longer.",
  "default": "Delaying recommended treatment often leads to more complex, more expensive procedures down the road. Early treatment preserves tooth structure and saves money long-term.",
};

function getRiskForTreatment(name) {
  const l = name.toLowerCase();
  if (l.includes("crown")) return RISK_DESCRIPTIONS["Crown"];
  if (l.includes("root canal")) return RISK_DESCRIPTIONS["Root Canal"];
  if (l.includes("filling") || l.includes("composite")) return RISK_DESCRIPTIONS["Filling"];
  if (l.includes("implant")) return RISK_DESCRIPTIONS["Implant"];
  if (l.includes("bridge")) return RISK_DESCRIPTIONS["Bridge"];
  if (l.includes("extract")) return RISK_DESCRIPTIONS["Extraction"];
  if (l.includes("deep clean") || l.includes("scaling") || l.includes("perio")) return RISK_DESCRIPTIONS["Deep Cleaning"];
  if (l.includes("veneer")) return RISK_DESCRIPTIONS["Veneer"];
  if (l.includes("invisalign") || l.includes("ortho") || l.includes("braces")) return RISK_DESCRIPTIONS["Invisalign"];
  if (l.includes("night guard") || l.includes("nightguard")) return RISK_DESCRIPTIONS["Night Guard"];
  if (l.includes("fluoride")) return RISK_DESCRIPTIONS["Fluoride"];
  return RISK_DESCRIPTIONS["default"];
}

// ========== SIGNATURE PAD ==========
function SignaturePad({ label, onSave, onClear }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2; canvas.height = rect.height * 2; ctx.scale(2, 2);
    ctx.strokeStyle = DARK; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.strokeStyle = "#ccc"; ctx.lineWidth = 1;
    ctx.moveTo(10, rect.height - 20); ctx.lineTo(rect.width - 10, rect.height - 20); ctx.stroke();
    ctx.strokeStyle = DARK; ctx.lineWidth = 2;
  }, []);
  const getPos = (e) => { const rect = canvasRef.current.getBoundingClientRect(); const touch = e.touches ? e.touches[0] : e; return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }; };
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
      <canvas ref={canvasRef} onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
        style={{ width: "100%", height: 120, border: "1.5px solid #e0e0e0", borderRadius: 10, background: "#fafafa", touchAction: "none", cursor: "crosshair" }} />
    </div>
  );
}

function SigBlock({ sig, label, dateStr }) {
  if (sig) return (<div style={{ marginBottom: 8 }}><img src={sig} alt={label} style={{ height: 50, maxWidth: "55%" }} /><div style={{ borderTop: "1px solid #999", width: "60%", marginTop: -4 }} /><div style={{ fontSize: 8, color: GRAY }}>{label}<span style={{ float: "right", width: "30%" }}>{dateStr}</span></div></div>);
  return (<div style={{ marginBottom: 8 }}><div style={{ borderBottom: "1px solid #999", width: "60%", display: "inline-block", marginRight: "8%" }} /><div style={{ borderBottom: "1px solid #999", width: "28%", display: "inline-block" }} /><div style={{ fontSize: 8, color: GRAY }}><span style={{ display: "inline-block", width: "60%", marginRight: "8%" }}>{label}</span><span>Date</span></div></div>);
}

function Logo({ width = 190 }) { return <img src="/logo.png" alt="Buchwald Family Dentistry" style={{ width, height: "auto" }} />; }

const cardStyle = { background: "white", borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" };
const sectionLabel = { fontSize: 13, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.5px" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: GRAY, marginBottom: 6, marginTop: 14 };
const inputStyle = { width: "100%", padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 16, color: DARK, outline: "none", background: "#fafafa", WebkitAppearance: "none", boxSizing: "border-box" };
const dollarSign = { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: GRAY, fontWeight: 600 };
const toolbarBtn = { background: "rgba(255,255,255,0.2)", color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" };

// ========== MAIN APP ==========
export default function TreatmentPlan() {
  const [appMode, setAppMode] = useState(null);
  useEffect(() => {
    if (!document.getElementById("html2pdf-script")) {
      const s = document.createElement("script"); s.id = "html2pdf-script";
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      document.head.appendChild(s);
    }
  }, []);

  // Treatment plan state
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
  const [treatments, setTreatments] = useState([{ id: 1, teeth: [], name: "", fee: "", priority: "moderate", customRisk: "" }]);
  const [insuranceCoverage, setInsuranceCoverage] = useState("");
  const [financing, setFinancing] = useState(0);
  const [sameDayDiscount, setSameDayDiscount] = useState(false);
  const [inOfficePlan, setInOfficePlan] = useState(false);
  const [selectedUpgrades, setSelectedUpgrades] = useState([]);
  const [showUpgrades, setShowUpgrades] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [savedToProfile, setSavedToProfile] = useState(false);
  const [savingToProfile, setSavingToProfile] = useState(false);
  const [collectSignatures, setCollectSignatures] = useState(false);
  const [patientSig, setPatientSig] = useState(null);
  const [coordinatorSig, setCoordinatorSig] = useState(null);
  const [patientSig2, setPatientSig2] = useState(null);
  const [sigStep, setSigStep] = useState("patient");
  const [pushWarranty, setPushWarranty] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("debit");

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

  const toggleUpgrade = (svc) => setSelectedUpgrades(prev => prev.includes(svc) ? prev.filter(s => s !== svc) : [...prev, svc]);
  const formComplete = patientName && treatments.some(t => t.name && t.fee);
  const addTreatment = () => setTreatments(prev => [...prev, { id: Date.now(), teeth: [], name: "", fee: "", priority: "moderate", customRisk: "" }]);
  const removeTreatment = (id) => setTreatments(prev => prev.length > 1 ? prev.filter(t => t.id !== id) : prev);
  const updateTreatment = (id, field, value) => setTreatments(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  const toggleTooth = (id, num) => setTreatments(prev => prev.map(t => t.id === id ? { ...t, teeth: t.teeth.includes(num) ? t.teeth.filter(n => n !== num) : [...t.teeth, num].sort((a, b) => a - b) } : t));

  const toggleWarrantyTreatment = (t) => setWarrantyItems(prev => { const exists = prev.find(x => x.name === t); if (exists) return prev.filter(x => x.name !== t); return [...prev, { name: t, teeth: [] }]; });
  const toggleWarrantyTooth = (treatmentName, num) => setWarrantyItems(prev => prev.map(item => item.name === treatmentName ? { ...item, teeth: item.teeth.includes(num) ? item.teeth.filter(n => n !== num) : [...item.teeth, num].sort((a, b) => a - b) } : item));
  const addCustomWarrantyTreatment = () => { if (warrantyCustomTreatment.trim()) { setWarrantyItems(prev => [...prev, { name: warrantyCustomTreatment.trim(), teeth: [] }]); setWarrantyCustomTreatment(""); } };
  const selectedWarrantyTreatments = warrantyItems.map(x => x.name);
  const allWarrantyTreatments = warrantyItems.map(item => { if (item.teeth.length > 0) return item.name + " (#" + item.teeth.join(", #") + ")"; return item.name; }).join(", ");
  const warrantyFormComplete = warrantyPatientName && warrantyItems.length > 0;

  const resetForm = () => {
    setPatientName(""); setPatientEmail(""); setPatientPhone(""); setTreatments([{ id: 1, teeth: [], name: "", fee: "", priority: "moderate", customRisk: "" }]);
    setInsuranceCoverage(""); setFinancing(0); setSameDayDiscount(false); setInOfficePlan(false); setSelectedUpgrades([]);
    setPatientSig(null); setCoordinatorSig(null); setPatientSig2(null);
    setShowPreview(false); setCollectSignatures(false); setSigStep("patient");
    setSavedToProfile(false); setSavingToProfile(false); setPushWarranty(true); setEmailSent(false);
    setShowReceipt(false); setPaymentMethod("debit");
    setDate(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
  };
  const resetWarrantyForm = () => {
    setWarrantyPatientName(""); setWarrantyItems([]); setWarrantyCustomTreatment("");
    setWarrantyChoice("agree"); setWarrantySig(null); setShowWarrantyPreview(false); setCollectWarrantySig(false);
    setWarrantyDate(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
  };

  // ========== HUB STATE ==========
  const [hubTab, setHubTab] = useState("home");
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
  const supaFetch = (path, opts = {}) => fetch(`${SUPA_URL}/rest/v1/${path}`, { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json", Prefer: "return=representation", ...opts.headers }, ...opts });

  useEffect(() => {
    if (appMode !== null) return;
    setHubLoading(true);
    Promise.all([
      supaFetch("profiles?plan_status=eq.active&select=id,first_name,last_name,phone,dob,plan_start_date,plan_end_date,plan_status,created_at,email&order=created_at.desc"),
      supaFetch("profiles?select=id,first_name,last_name,phone,dob,plan_status,created_at,email&order=created_at.desc&limit=200"),
    ]).then(async ([membersRes, recordsRes]) => {
      const members = await membersRes.json(); const records = await recordsRes.json();
      const today = new Date().toDateString();
      setPlanMembers(Array.isArray(members) ? members : []);
      setPatientRecords(Array.isArray(records) ? records : []);
      const plansToday = Array.isArray(records) ? records.filter(r => new Date(r.created_at).toDateString() === today).length : 0;
      setHubStats({ members: Array.isArray(members) ? members.length : 0, plansToday, warranties: 0 });
      const recent = Array.isArray(records) ? records.slice(0, 5).map(r => ({ name: `${r.first_name} ${r.last_name}`, action: r.plan_status === "active" ? "enrolled in-office plan" : "added as patient", date: new Date(r.created_at) })) : [];
      setRecentActivity(recent); setHubLoading(false);
    }).catch(() => setHubLoading(false));
  }, [appMode]);

  const loadPatientNotes = async (pid) => { const res = await supaFetch(`patient_notes?patient_id=eq.${pid}&order=created_at.desc`); const d = await res.json(); setPatientNotes(Array.isArray(d) ? d : []); };
  const loadPatientTreatments = async (pid) => { const res = await supaFetch(`pending_treatments?user_id=eq.${pid}&order=created_at.desc`); const d = await res.json(); setPatientTreatments(Array.isArray(d) ? d : []); };
  const updateTreatmentStatus = async (tid, s) => { await supaFetch(`pending_treatments?id=eq.${tid}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ status: s }) }); setPatientTreatments(prev => prev.map(t => t.id === tid ? { ...t, status: s } : t)); };
  const saveNote = async () => { if (!newNote.trim() || !selectedPatient) return; setSavingNote(true); await supaFetch("patient_notes", { method: "POST", body: JSON.stringify({ patient_id: selectedPatient.id, admin_id: selectedPatient.id, note: newNote.trim(), flag_color: "none" }) }); setNewNote(""); await loadPatientNotes(selectedPatient.id); setSavingNote(false); };

  const addMember = async () => {
    if (!newMember.first_name || !newMember.last_name) return;
    setAddMemberLoading(true);
    const searchRes = await supaFetch(`profiles?first_name=eq.${encodeURIComponent(newMember.first_name)}&last_name=eq.${encodeURIComponent(newMember.last_name)}&limit=1`);
    const existing = await searchRes.json();
    const startDate = newMember.plan_start_date || new Date().toISOString().split("T")[0];
    const endDate = new Date(new Date(startDate).getTime() + 365*24*60*60*1000).toISOString().split("T")[0];
    if (Array.isArray(existing) && existing.length > 0) {
      await supaFetch(`profiles?id=eq.${existing[0].id}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ plan_status: "active", plan_start_date: startDate, plan_end_date: endDate, ...(newMember.phone ? { phone: newMember.phone } : {}) }) });
    } else {
      await supaFetch("profiles", { method: "POST", body: JSON.stringify({ id: crypto.randomUUID(), email: `${newMember.first_name.toLowerCase()}.${newMember.last_name.toLowerCase()}.${Date.now()}@buchwald.internal`, first_name: newMember.first_name, last_name: newMember.last_name, phone: newMember.phone || "", role: "user", plan_status: "active", plan_start_date: startDate, plan_end_date: endDate }) });
    }
    setNewMember({ first_name: "", last_name: "", phone: "", plan_start_date: "" }); setShowAddMember(false); setAddMemberLoading(false);
    setAppMode("__refresh__"); setTimeout(() => setAppMode(null), 50);
  };

  const savePatientRecord = async (firstName, lastName, recordType, details) => {
    try {
      const searchRes = await supaFetch(`profiles?first_name=eq.${encodeURIComponent(firstName)}&last_name=eq.${encodeURIComponent(lastName)}&limit=1`);
      const existing = await searchRes.json(); let profileId;
      if (Array.isArray(existing) && existing.length > 0) {
        profileId = existing[0].id;
        const updates = {};
        if (details.inOfficePlan) { const sd = new Date().toISOString().split("T")[0]; updates.plan_status = "active"; updates.plan_start_date = sd; updates.plan_end_date = new Date(Date.now()+365*24*60*60*1000).toISOString().split("T")[0]; }
        if (details.email && !details.email.includes("@buchwald.internal")) updates.email = details.email;
        if (details.phone) updates.phone = details.phone;
        if (Object.keys(updates).length > 0) await supaFetch(`profiles?id=eq.${profileId}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify(updates) });
      } else {
        profileId = crypto.randomUUID(); const sd = new Date().toISOString().split("T")[0];
        await supaFetch("profiles", { method: "POST", body: JSON.stringify({ id: profileId, email: details.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Date.now()}@buchwald.internal`, first_name: firstName, last_name: lastName, role: "user", phone: details.phone || "", plan_status: details.inOfficePlan ? "active" : "none", ...(details.inOfficePlan ? { plan_start_date: sd, plan_end_date: new Date(Date.now()+365*24*60*60*1000).toISOString().split("T")[0] } : {}) }) });
      }
      await supaFetch("pending_treatments", { method: "POST", body: JSON.stringify({ user_id: profileId, treatment_name: recordType, cost: details.total || 0, status: "shown", notes: details.summary }) });
      return profileId;
    } catch (e) { return false; }
  };

  const sendEmailCopy = () => {
    const to = patientEmail || "";
    const subject = encodeURIComponent("Your Treatment Plan - Buchwald Family Dentistry");
    let body = `Dear ${patientName},\n\nThank you for visiting Buchwald Family Dentistry! Here is a summary of your treatment plan.\n\nDate: ${date}\n\nTREATMENT PLAN\n========================================\n\n`;
    treatments.filter(t => t.name).forEach(t => {
      const teethStr = t.teeth.length > 0 ? " (Tooth #" + t.teeth.join(", #") + ")" : "";
      const prio = PRIORITY_LEVELS.find(p => p.value === t.priority);
      body += `${prio ? prio.icon + " " : ""}${t.name}${teethStr}: $${(parseFloat(t.fee)||0).toFixed(2)} - Priority: ${prio ? prio.label : "Moderate"}\n`;
      const risk = t.customRisk || getRiskForTreatment(t.name);
      body += `   Risk of delaying: ${risk}\n\n`;
    });
    body += `========================================\nCredit/Card Price: $${creditPrice.toFixed(2)}\nDebit/Cash/Check Price: $${totalDebit.toFixed(2)} (Save $${savings.toFixed(2)})\n`;
    if (activeDiscount) body += `${discountLabel}: -$${discountAmount.toFixed(2)}\n`;
    if (financing > 0) body += `${financing} Month Payment Plan: $${monthlyPayment.toFixed(2)}/mo at 0% interest\n`;
    if (insuranceNum > 0) body += `Insurance Coverage: $${insuranceNum.toFixed(2)}\n`;
    body += `\nPayment Options:\n1. Pay in full at appointment\n2. For crowns: Half at prep, half at seat\n3. 6-month CareCredit at 0%\n4. Cherry financing as low as 0%\n`;
    if (pushWarranty) {
      body += `\n========================================\nLIFETIME WARRANTY - PROTECT YOUR INVESTMENT\n========================================\n\nDid you know? Buchwald Family Dentistry offers a Lifetime Warranty on qualifying restorations.\n\nWithout warranty:\n- Crown replacement: $2,500 - $3,000\n- Implant crown replacement: $4,000 - $6,000\n\nWith your Lifetime Warranty: $0\n\nAsk us about enrolling in our Lifetime Warranty program at your next visit!\n`;
    }
    body += `\n---\nBuchwald Family Dentistry & Orthodontics\nbuchwaldfamilydentistry.com\n`;
    window.open(`mailto:${to}?subject=${subject}&body=${encodeURIComponent(body)}`, "_blank");
    setEmailSent(true);
  };

  const fmtDate = (d) => { if (!d) return ""; try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); } catch { return ""; } };
  const timeAgo = (d) => { const diff = Date.now() - new Date(d); const mins = Math.floor(diff/60000); if (mins < 60) return `${mins}m ago`; const hrs = Math.floor(mins/60); if (hrs < 24) return `${hrs}h ago`; return `${Math.floor(hrs/24)}d ago`; };

  // ========== PATIENT DETAIL VIEW ==========
  if ((appMode === null || appMode === "__refresh__") && selectedPatient) {
    if (appMode === "__refresh__") return null;
    const statusFlow = ["shown", "signed", "paid"];
    const statusColors = { shown: { bg: LIGHT_BLUE, text: BLUE }, signed: { bg: GOLD_BG, text: GOLD }, paid: { bg: GREEN_BG, text: GREEN } };
    const statusLabels = { shown: "Shown", signed: "Signed", paid: "Paid" };
    const patEmail = selectedPatient.email && !selectedPatient.email.includes("@buchwald.internal") ? selectedPatient.email : null;
    return (
      <div style={{ minHeight: "100vh", background: "#f7f9fb", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <div style={{ background: BLUE, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => { setSelectedPatient(null); setPatientNotes([]); setPatientTreatments([]); }} style={toolbarBtn}>{"\u2190"} Back</button>
          <div style={{ color: "white", fontSize: 16, fontWeight: 700 }}>{selectedPatient.first_name} {selectedPatient.last_name}</div>
          <div style={{ display: "flex", gap: 6 }}>
            {patEmail && <a href={`mailto:${patEmail}`} style={{ ...toolbarBtn, textDecoration: "none" }}>{"\u2709\uFE0F"}</a>}
            <button onClick={() => { setAppMode("treatment"); setPatientName(`${selectedPatient.first_name} ${selectedPatient.last_name}`); if (patEmail) setPatientEmail(patEmail); if (selectedPatient.phone) setPatientPhone(selectedPatient.phone); setSelectedPatient(null); }} style={toolbarBtn}>+ Plan</button>
          </div>
        </div>
        <div style={{ padding: "16px", maxWidth: 480, margin: "0 auto" }}>
          {/* Patient Info Card */}
          <div style={cardStyle}>
            <div style={sectionLabel}>Patient Info</div>
            {[["Phone", selectedPatient.phone], ["Email", patEmail], ["Plan", selectedPatient.plan_status === "active" ? "\u2705 In-office plan member" : "No plan"], ["Since", selectedPatient.plan_start_date ? fmtDate(selectedPatient.plan_start_date) : null]].map(([l, v]) => v ? <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}><span style={{ color: GRAY }}>{l}</span><span style={{ fontWeight: 600 }}>{v}</span></div> : null)}
          </div>
          {/* Quick Actions */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <button onClick={() => { setAppMode("treatment"); setPatientName(`${selectedPatient.first_name} ${selectedPatient.last_name}`); if (patEmail) setPatientEmail(patEmail); if (selectedPatient.phone) setPatientPhone(selectedPatient.phone); setSelectedPatient(null); }} style={{ flex: 1, padding: "14px 12px", background: BLUE, color: "white", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{"\u{1F4CB}"} New Treatment Plan</button>
            <button onClick={() => { setAppMode("warranty"); setWarrantyPatientName(`${selectedPatient.first_name} ${selectedPatient.last_name}`); setSelectedPatient(null); }} style={{ flex: 1, padding: "14px 12px", background: "white", color: DARK, border: `2px solid ${BLUE}`, borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{"\u{1F6E1}\uFE0F"} Warranty Form</button>
          </div>
          {/* Treatment History */}
          <div style={cardStyle}>
            <div style={sectionLabel}>Treatment History</div>
            {patientTreatments.length === 0 && <div style={{ fontSize: 13, color: GRAY }}>No records yet.</div>}
            {patientTreatments.map(t => {
              const sc = statusColors[t.status] || statusColors.shown;
              return (<div key={t.id} style={{ background: "#f7f9fb", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{t.treatment_name}</div>
                  {t.cost > 0 && <div style={{ fontSize: 13, fontWeight: 700, color: BLUE }}>${parseFloat(t.cost).toFixed(2)}</div>}
                </div>
                {t.notes && <div style={{ fontSize: 12, color: GRAY, marginBottom: 8, lineHeight: 1.4 }}>{t.notes}</div>}
                <div style={{ fontSize: 11, color: GRAY, marginBottom: 8 }}>{fmtDate(t.created_at)}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {statusFlow.map(s => { const active = t.status === s; const done = statusFlow.indexOf(t.status) > statusFlow.indexOf(s);
                    return <button key={s} onClick={() => updateTreatmentStatus(t.id, s)} style={{ flex: 1, padding: "6px 4px", borderRadius: 8, border: `1.5px solid ${active || done ? sc.text : "#ddd"}`, background: active ? sc.bg : done ? "#f0f0f0" : "white", color: active ? sc.text : done ? GRAY : GRAY, fontSize: 12, fontWeight: active ? 700 : 400, cursor: "pointer" }}>{done ? "\u2713 " : ""}{statusLabels[s]}</button>;
                  })}
                </div>
              </div>);
            })}
          </div>
          {/* Notes */}
          <div style={cardStyle}>
            <div style={sectionLabel}>Notes</div>
            {patientNotes.length === 0 && <div style={{ fontSize: 13, color: GRAY, marginBottom: 12 }}>No notes yet.</div>}
            {patientNotes.map(n => <div key={n.id} style={{ background: "#f7f9fb", borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}><div style={{ fontSize: 13 }}>{n.note}</div><div style={{ fontSize: 11, color: GRAY, marginTop: 4 }}>{fmtDate(n.created_at)}</div></div>)}
            <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..." style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, resize: "vertical", minHeight: 80, boxSizing: "border-box", marginTop: 8 }} />
            <button onClick={saveNote} disabled={savingNote || !newNote.trim()} style={{ width: "100%", padding: 14, background: newNote.trim() ? BLUE : "#ccc", color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: newNote.trim() ? "pointer" : "not-allowed", marginTop: 8 }}>{savingNote ? "Saving..." : "Save Note"}</button>
          </div>
        </div>
      </div>
    );
  }

  // ========== HUB HOME ==========
  if (appMode === null || appMode === "__refresh__") {
    if (appMode === "__refresh__") return null;
    const filteredMembers = planMembers.filter(m => `${m.first_name} ${m.last_name}`.toLowerCase().includes(memberSearch.toLowerCase()) || (m.phone || "").includes(memberSearch));
    const filteredRecords = patientRecords.filter(r => `${r.first_name} ${r.last_name}`.toLowerCase().includes(recordSearch.toLowerCase()) || (r.phone || "").includes(recordSearch));

    return (
      <div style={{ minHeight: "100vh", background: "#f7f9fb", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <style>{`@media print { body { display: none; } }`}</style>
        <div style={{ background: BLUE, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, background: "white", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}><img src="/logo.png" alt="" style={{ width: 30, height: "auto" }} /></div>
          <div><div style={{ color: "white", fontSize: 15, fontWeight: 700 }}>Buchwald Family Dentistry</div><div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>Staff Hub</div></div>
        </div>
        <div style={{ background: "white", borderBottom: "1px solid #e8e8e8", display: "flex" }}>
          {[["home","\u{1F3E0}","Home"],["members","\u2B50","Plan Members"],["records","\u{1F4C1}","Records"]].map(([tab, icon, label]) => (
            <button key={tab} onClick={() => setHubTab(tab)} style={{ flex: 1, padding: "12px 4px", background: "none", border: "none", borderBottom: hubTab === tab ? `3px solid ${BLUE}` : "3px solid transparent", color: hubTab === tab ? BLUE : GRAY, fontSize: 12, fontWeight: hubTab === tab ? 700 : 400, cursor: "pointer" }}>{icon} {label}</button>
          ))}
        </div>
        <div style={{ padding: "16px", maxWidth: 480, margin: "0 auto" }}>

          {hubTab === "home" && (<>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[["\u2B50", hubStats.members, "plan members"],["\u{1F4CB}", hubStats.plansToday, "added today"],["\u{1F6E1}\uFE0F", hubStats.warranties, "warranties"]].map(([icon, val, label]) => (
                <div key={label} style={{ background: "white", borderRadius: 12, padding: "14px 10px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}><div style={{ fontSize: 20 }}>{icon}</div><div style={{ fontSize: 22, fontWeight: 800, color: DARK, lineHeight: 1.2 }}>{hubLoading ? "\u2013" : val}</div><div style={{ fontSize: 11, color: GRAY, marginTop: 2 }}>{label}</div></div>
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Quick Actions</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <button onClick={() => setAppMode("treatment")} style={{ padding: "18px 16px", background: BLUE, border: "none", borderRadius: 14, cursor: "pointer", textAlign: "left", color: "white" }}><div style={{ fontSize: 22, marginBottom: 6 }}>{"\u{1F4CB}"}</div><div style={{ fontSize: 14, fontWeight: 700 }}>Treatment Plan</div><div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>New form</div></button>
              <button onClick={() => setAppMode("warranty")} style={{ padding: "18px 16px", background: "white", border: "2px solid #e0e0e0", borderRadius: 14, cursor: "pointer", textAlign: "left" }}><div style={{ fontSize: 22, marginBottom: 6 }}>{"\u{1F6E1}\uFE0F"}</div><div style={{ fontSize: 14, fontWeight: 700, color: DARK }}>Lifetime Warranty</div><div style={{ fontSize: 11, color: GRAY, marginTop: 2 }}>New form</div></button>
              <button onClick={() => { setHubTab("members"); setShowAddMember(true); }} style={{ padding: "18px 16px", background: "white", border: "2px solid #e0e0e0", borderRadius: 14, cursor: "pointer", textAlign: "left" }}><div style={{ fontSize: 22, marginBottom: 6 }}>{"\u2795"}</div><div style={{ fontSize: 14, fontWeight: 700, color: DARK }}>Add Member</div><div style={{ fontSize: 11, color: GRAY, marginTop: 2 }}>In-office plan</div></button>
              <button onClick={() => setHubTab("records")} style={{ padding: "18px 16px", background: "white", border: "2px solid #e0e0e0", borderRadius: 14, cursor: "pointer", textAlign: "left" }}><div style={{ fontSize: 22, marginBottom: 6 }}>{"\u{1F4C1}"}</div><div style={{ fontSize: 14, fontWeight: 700, color: DARK }}>Patient Records</div><div style={{ fontSize: 11, color: GRAY, marginTop: 2 }}>Search & notes</div></button>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Recent Activity</div>
            <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden" }}>
              {hubLoading && <div style={{ padding: 20, textAlign: "center", color: GRAY, fontSize: 13 }}>Loading...</div>}
              {!hubLoading && recentActivity.length === 0 && <div style={{ padding: 20, textAlign: "center", color: GRAY, fontSize: 13 }}>No activity yet</div>}
              {recentActivity.map((a, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: i < recentActivity.length-1 ? "1px solid #f0f0f0" : "none" }}><div><span style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{a.name}</span><span style={{ fontSize: 13, color: GRAY }}> \u2014 {a.action}</span></div><span style={{ fontSize: 11, color: GRAY, flexShrink: 0, marginLeft: 8 }}>{timeAgo(a.date)}</span></div>)}
            </div>
          </>)}

          {hubTab === "members" && (<>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: DARK }}>Plan Members <span style={{ color: BLUE }}>({planMembers.length})</span></div>
              <button onClick={() => setShowAddMember(!showAddMember)} style={{ background: BLUE, color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Add</button>
            </div>
            {showAddMember && (<div style={cardStyle}>
              <div style={{ fontSize: 14, fontWeight: 700, color: DARK, marginBottom: 14 }}>New Plan Member</div>
              {[["First name *","first_name"],["Last name *","last_name"]].map(([l,f]) => <div key={f} style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: GRAY, display: "block", marginBottom: 4 }}>{l}</label><input type="text" value={newMember[f]} onChange={e => setNewMember(p => ({...p,[f]:e.target.value}))} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 15, boxSizing: "border-box" }} /></div>)}
              <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: GRAY, display: "block", marginBottom: 4 }}>Plan start date *</label><input type="date" value={newMember.plan_start_date} onChange={e => setNewMember(p => ({...p,plan_start_date:e.target.value}))} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 15, boxSizing: "border-box" }} /></div>
              <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12, color: GRAY, display: "block", marginBottom: 4 }}>Phone (optional)</label><input type="tel" value={newMember.phone} onChange={e => setNewMember(p => ({...p,phone:e.target.value}))} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 15, boxSizing: "border-box" }} /></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowAddMember(false)} style={{ flex: 1, padding: 12, background: "#f0f0f0", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>Cancel</button>
                <button onClick={addMember} disabled={addMemberLoading||!newMember.first_name||!newMember.last_name} style={{ flex: 2, padding: 12, background: newMember.first_name&&newMember.last_name ? BLUE : "#ccc", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{addMemberLoading ? "Saving..." : "Enroll Member"}</button>
              </div>
            </div>)}
            <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)} placeholder="Search by name or phone..." style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 15, marginBottom: 12, boxSizing: "border-box" }} />
            {hubLoading && <div style={{ textAlign: "center", color: GRAY, padding: 20 }}>Loading...</div>}
            {!hubLoading && filteredMembers.length === 0 && <div style={{ textAlign: "center", color: GRAY, padding: 20, fontSize: 13 }}>No members found</div>}
            {filteredMembers.map(m => <div key={m.id} onClick={() => { setSelectedPatient(m); loadPatientNotes(m.id); loadPatientTreatments(m.id); }} style={{ background: "white", borderRadius: 12, padding: "14px 16px", marginBottom: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontSize: 15, fontWeight: 700, color: DARK }}>{m.first_name} {m.last_name}</div>{m.phone && <div style={{ fontSize: 12, color: GRAY, marginTop: 2 }}>{m.phone}</div>}{m.plan_start_date && <div style={{ fontSize: 12, color: GRAY }}>Since {fmtDate(m.plan_start_date)}</div>}</div><div style={{ background: GREEN_BG, color: GREEN, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>Active</div></div>)}
          </>)}

          {hubTab === "records" && (<>
            <div style={{ fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 12 }}>Patient Records <span style={{ color: BLUE }}>({patientRecords.length})</span></div>
            <input value={recordSearch} onChange={e => setRecordSearch(e.target.value)} placeholder="Search by name or phone..." style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 15, marginBottom: 12, boxSizing: "border-box" }} />
            {hubLoading && <div style={{ textAlign: "center", color: GRAY, padding: 20 }}>Loading...</div>}
            {!hubLoading && filteredRecords.length === 0 && <div style={{ textAlign: "center", color: GRAY, padding: 20, fontSize: 13 }}>No records found</div>}
            {filteredRecords.map(r => <div key={r.id} onClick={() => { setSelectedPatient(r); loadPatientNotes(r.id); loadPatientTreatments(r.id); }} style={{ background: "white", borderRadius: 12, padding: "14px 16px", marginBottom: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontSize: 15, fontWeight: 700, color: DARK }}>{r.first_name} {r.last_name}</div>{r.phone && <div style={{ fontSize: 12, color: GRAY, marginTop: 2 }}>{r.phone}</div>}<div style={{ fontSize: 12, color: GRAY }}>Added {fmtDate(r.created_at)}</div></div>{r.plan_status === "active" && <div style={{ background: GREEN_BG, color: GREEN, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>Plan</div>}</div>)}
          </>)}
        </div>
      </div>
    );
  }

  // ========== WARRANTY SIGNATURE COLLECTION ==========
  if (appMode === "warranty" && collectWarrantySig && !showWarrantyPreview) {
    return (
      <div style={{ minHeight: "100vh", background: "#f7f9fb", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <style>{`@media print { body { display: none; } }`}</style>
        <div style={{ background: BLUE, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}><button onClick={() => setCollectWarrantySig(false)} style={toolbarBtn}>{"\u2190"} Back</button><div style={{ color: "white", fontSize: 16, fontWeight: 700 }}>Collect Signature</div></div>
        <div style={{ padding: "24px 16px", maxWidth: 480, margin: "0 auto" }}>
          <div style={cardStyle}>
            <div style={{ textAlign: "center", marginBottom: 20 }}><div style={{ fontSize: 18, fontWeight: 700, color: DARK }}>Patient Signature</div><div style={{ fontSize: 13, color: GRAY, marginTop: 4 }}>Hand the device to the patient to sign</div></div>
            <div style={{ background: "#f7f9fb", borderRadius: 10, padding: "12px 14px", marginBottom: 20, fontSize: 13 }}><div><b>Patient:</b> {warrantyPatientName}</div><div><b>Choice:</b> {warrantyChoice === "agree" ? "Agrees to warranty conditions" : "Elects to waive warranty"}</div><div><b>Treatments:</b> {allWarrantyTreatments}</div></div>
            <SignaturePad key="warranty-sig" label="Sign here" onSave={d => setWarrantySig(d)} onClear={() => setWarrantySig(null)} />
            <button onClick={() => { setCollectWarrantySig(false); setShowWarrantyPreview(true); }} disabled={!warrantySig} style={{ width: "100%", padding: 16, border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: warrantySig ? "pointer" : "not-allowed", background: warrantySig ? BLUE : "#ccc", color: "white" }}>View Warranty Form</button>
          </div>
        </div>
      </div>
    );
  }

  // ========== WARRANTY FORM ==========
  if (appMode === "warranty" && !showWarrantyPreview) {
    return (
      <div style={{ minHeight: "100vh", background: "#f7f9fb", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <style>{`@media print { body { display: none; } }`}</style>
        <div style={{ background: BLUE, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}><button onClick={() => { resetWarrantyForm(); setAppMode(null); }} style={toolbarBtn}>{"\u2190"} Back</button><div><div style={{ color: "white", fontSize: 16, fontWeight: 700 }}>Buchwald Family Dentistry</div><div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>Lifetime Warranty Form</div></div></div>
        <div style={{ padding: "20px 16px", maxWidth: 480, margin: "0 auto" }}>
          <div style={cardStyle}>
            <div style={sectionLabel}>Patient Info</div>
            <label style={labelStyle}>Patient Name</label><input type="text" value={warrantyPatientName} onChange={e => setWarrantyPatientName(e.target.value)} placeholder="First Last" style={inputStyle} />
            <label style={labelStyle}>Date</label><input type="text" value={warrantyDate} onChange={e => setWarrantyDate(e.target.value)} style={inputStyle} />
          </div>
          <div style={cardStyle}>
            <div style={sectionLabel}>Treatments Under Warranty</div>
            <div style={{ fontSize: 12, color: GRAY, marginTop: 6, marginBottom: 14 }}>Select treatments and assign tooth numbers</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {WARRANTY_TREATMENTS.map(t => { const sel = selectedWarrantyTreatments.includes(t); return <button key={t} onClick={() => toggleWarrantyTreatment(t)} style={{ padding: "8px 14px", borderRadius: 20, border: `1.5px solid ${sel ? BLUE : "#ddd"}`, background: sel ? LIGHT_BLUE : "white", color: sel ? BLUE : GRAY, fontSize: 13, fontWeight: sel ? 600 : 400, cursor: "pointer" }}>{sel && "\u2713 "}{t}</button>; })}
            </div>
            {warrantyItems.map(item => {
              const isPreset = WARRANTY_TREATMENTS.includes(item.name);
              const needsTeeth = ["Crowns","Composite Fillings","Implants","Bridges","Veneers","Preventive Resin Restoration"].includes(item.name) || !isPreset;
              return (<div key={item.name} style={{ background: "#f7f9fb", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: needsTeeth ? 8 : 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: BLUE }}>{item.name}</div>
                  {!isPreset && <button onClick={() => setWarrantyItems(prev => prev.filter(x => x.name !== item.name))} style={{ background: "none", border: "none", color: RED, fontSize: 18, cursor: "pointer" }}>{"\u00D7"}</button>}
                </div>
                {item.teeth.length > 0 && <div style={{ fontSize: 11, color: BLUE, fontWeight: 600, marginBottom: 6 }}>Teeth: #{item.teeth.join(", #")}</div>}
                {needsTeeth && (<><div style={{ fontSize: 11, color: GRAY, marginBottom: 6 }}>Select tooth numbers <span style={{ fontWeight: 400, color: "#999" }}>(optional)</span></div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 5 }}>{Array.from({length:32},(_,i)=>i+1).map(num => { const sel = item.teeth.includes(num); return <button key={num} onClick={() => toggleWarrantyTooth(item.name, num)} style={{ padding: "7px 0", borderRadius: 8, border: `1.5px solid ${sel ? BLUE : "#ddd"}`, background: sel ? BLUE : "white", color: sel ? "white" : DARK, fontSize: 12, fontWeight: sel ? 700 : 400, cursor: "pointer" }}>{num}</button>; })}</div></>)}
              </div>);
            })}
            <label style={{ ...labelStyle, marginTop: warrantyItems.length > 0 ? 8 : 0 }}>Add Custom Treatment</label>
            <div style={{ display: "flex", gap: 8 }}><input type="text" value={warrantyCustomTreatment} onChange={e => setWarrantyCustomTreatment(e.target.value)} placeholder="Other treatment..." style={{ ...inputStyle, flex: 1 }} onKeyDown={e => { if (e.key === "Enter") addCustomWarrantyTreatment(); }} /><button onClick={addCustomWarrantyTreatment} style={{ padding: "12px 16px", background: warrantyCustomTreatment.trim() ? BLUE : "#ccc", color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: warrantyCustomTreatment.trim() ? "pointer" : "not-allowed", flexShrink: 0 }}>+ Add</button></div>
          </div>
          <div style={cardStyle}>
            <div style={sectionLabel}>Patient Election</div>
            <div style={{ marginTop: 14 }}>
              <div onClick={() => setWarrantyChoice("agree")} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", background: warrantyChoice === "agree" ? GREEN_BG : "#f7f9fb", border: `1.5px solid ${warrantyChoice === "agree" ? GREEN : "#e0e0e0"}`, borderRadius: 10, cursor: "pointer", marginBottom: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: 11, border: `2px solid ${warrantyChoice === "agree" ? GREEN : "#ccc"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{warrantyChoice === "agree" && <div style={{ width: 12, height: 12, borderRadius: 6, background: GREEN }} />}</div>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: DARK }}><b>I agree</b> to the above conditions for the warranty of my prescribed treatment.</div>
              </div>
              <div onClick={() => setWarrantyChoice("waive")} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", background: warrantyChoice === "waive" ? "#FFF3F3" : "#f7f9fb", border: `1.5px solid ${warrantyChoice === "waive" ? RED : "#e0e0e0"}`, borderRadius: 10, cursor: "pointer" }}>
                <div style={{ width: 22, height: 22, borderRadius: 11, border: `2px solid ${warrantyChoice === "waive" ? RED : "#ccc"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{warrantyChoice === "waive" && <div style={{ width: 12, height: 12, borderRadius: 6, background: RED }} />}</div>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: DARK }}><b>I elect to waive</b> the warranty for my prescribed treatment and release Buchwald Family Dentistry and Orthodontics and its providers from obligation to replace or repair my dental treatment/prosthesis.</div>
              </div>
            </div>
          </div>
          <button onClick={() => { setCollectWarrantySig(true); const [fn,...r] = warrantyPatientName.trim().split(" "); const ln = r.join(" ")||"-"; savePatientRecord(fn, ln, "Warranty Form", { total: 0, summary: `Date: ${warrantyDate} | Treatments: ${allWarrantyTreatments} | Election: ${warrantyChoice === "agree" ? "Agreed" : "Waived"}` }); }} disabled={!warrantyFormComplete} style={{ width: "100%", padding: 16, background: warrantyFormComplete ? BLUE : "#ccc", color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: warrantyFormComplete ? "pointer" : "not-allowed", marginBottom: 10 }}>Collect Signature</button>
          <button onClick={() => { resetWarrantyForm(); setAppMode(null); }} style={{ width: "100%", padding: 14, background: "white", color: GRAY, border: "1.5px solid #e0e0e0", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 24 }}>Cancel</button>
        </div>
      </div>
    );
  }

  // ========== WARRANTY PREVIEW ==========
  if (appMode === "warranty" && showWarrantyPreview) {
    return (
      <div style={{ background: "#f0f0f0", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
        <style>{`@media screen { .no-print { display: flex !important; } .print-page { width: 8.5in; max-width: 100%; margin: 0 auto 20px; background: white; box-shadow: 0 2px 12px rgba(0,0,0,0.15); padding: 0.5in 0.75in; } } @media print { .no-print { display: none !important; } body, html { margin: 0; padding: 0; } .print-page { width: 8.5in; padding: 0.5in 0.75in; margin: 0; box-shadow: none; page-break-after: always; } .print-page:last-child { page-break-after: auto; } }`}</style>
        <div className="no-print" style={{ display: "none", position: "sticky", top: 0, zIndex: 100, background: BLUE, padding: "10px 16px", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => setShowWarrantyPreview(false)} style={toolbarBtn}>{"\u2190"} Edit</button>
          <div style={{ display: "flex", gap: 6 }}>
            {!warrantySig && <button onClick={() => { setShowWarrantyPreview(false); setCollectWarrantySig(true); }} style={toolbarBtn}>{"\u270D\uFE0F"} Sign</button>}
            <button onClick={() => { const subj = encodeURIComponent(`Lifetime Warranty - ${warrantyPatientName} - Buchwald Family Dentistry`); const b = encodeURIComponent(`Lifetime Warranty Form\n\nPatient: ${warrantyPatientName}\nDate: ${warrantyDate}\n\nTreatments:\n${warrantyItems.map(i => `- ${i.name}${i.teeth.length>0?" (Teeth #"+i.teeth.join(", #")+")":""}`).join("\n")}\n\nElection: ${warrantyChoice==="agree"?"Agreed":"Waived"}\n\n---\nBuchwald Family Dentistry & Orthodontics`); window.location.href = `mailto:?subject=${subj}&body=${b}`; }} style={toolbarBtn}>{"\u2709\uFE0F"} Email</button>
            <button onClick={resetWarrantyForm} style={toolbarBtn}>New</button>
            <button onClick={() => savePDF("warranty-pdf-content", `Warranty_${warrantyPatientName||"Form"}.pdf`)} style={toolbarBtn}>{"\u2B07\uFE0F"} PDF</button>
            <button onClick={() => window.print()} style={{ background: "white", color: BLUE, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Print</button>
          </div>
        </div>
        <div id="warranty-pdf-content"><div className="print-page">
          <div style={{ textAlign: "center", marginBottom: 4 }}><Logo width={190} /></div>
          <div style={{ borderBottom: `3px solid ${BLUE}`, marginBottom: 10 }} />
          <div style={{ textAlign: "center", fontSize: 19, fontWeight: 700, color: BLUE, marginBottom: 2 }}>Lifetime Dental Treatment Warranty</div>
          <div style={{ textAlign: "center", fontSize: 11, color: GRAY, marginBottom: 10 }}>Your Investment, Protected for Life</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 11.5 }}><div><b style={{ color: GRAY }}>Patient: </b><span style={{ borderBottom: "1px solid #999", paddingBottom: 1, display: "inline-block", minWidth: 220 }}>{warrantyPatientName}</span></div><div><b style={{ color: GRAY }}>Date: </b><span style={{ borderBottom: "1px solid #999", paddingBottom: 1, display: "inline-block", minWidth: 120 }}>{warrantyDate}</span></div></div>
          <p style={{ fontSize: 10.5, lineHeight: 1.55, margin: "0 0 8px", color: DARK }}>At Buchwald Family Dentistry, we are so confident in the quality of our work that we back it with a <b style={{ color: BLUE }}>Lifetime Warranty</b>. If a warranted restoration fails under normal use, we will repair or replace it at no additional charge \u2014 including re-treatment of the same tooth for the same issue.</p>
          <div style={{ background: LIGHT_BLUE, border: `1.5px solid ${BLUE}`, borderRadius: 4, padding: "6px 10px", marginBottom: 8, fontSize: 10, lineHeight: 1.5 }}><div style={{ fontWeight: 700, color: BLUE, fontSize: 11, marginBottom: 2 }}>Treatments Covered Under This Warranty</div><p style={{ margin: 0 }}>Crowns, Composite Fillings, Implants, Orthodontics (first 2 replacement retainers at no charge), Preventive Resin Restoration, Scaling & Root Planning, Bridges, and Veneers placed at our office.</p></div>
          <div style={{ background: "#F9FBF2", border: "1.5px solid #8AAE2B", borderRadius: 4, padding: "6px 10px", marginBottom: 8, fontSize: 10 }}><div style={{ fontWeight: 700, color: "#5A7A10", fontSize: 11, marginBottom: 4 }}>What This Warranty Saves You</div><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>Crown replacement without warranty:</span><span style={{ fontWeight: 700 }}>$2,500 \u2013 $3,000</span></div><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span>Implant crown replacement without warranty:</span><span style={{ fontWeight: 700 }}>$4,000 \u2013 $6,000</span></div><div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed #8AAE2B", paddingTop: 3, marginTop: 2 }}><span style={{ fontWeight: 700, color: "#5A7A10" }}>With your Lifetime Warranty:</span><span style={{ fontWeight: 700, color: "#5A7A10" }}>$0</span></div></div>
          <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, marginBottom: 4 }}>Your Lifetime Care Plan</div>
          <p style={{ fontSize: 10, lineHeight: 1.4, margin: "0 0 4px", color: DARK }}>To keep your warranty active and your dental work lasting as long as possible, stay current with the following preventive care:</p>
          <div style={{ paddingLeft: 14, fontSize: 10, lineHeight: 1.65, marginBottom: 6 }}>
            <div style={{ marginBottom: 2 }}>1. <b>Regular Cleanings</b> every 6-7 months (or Perio Maintenance every 3-4 months for patients with bone loss)</div>
            <div style={{ marginBottom: 2 }}>2. <b>Custom Nightguard</b> (starting at $400 depending on insurance) \u2014 protects your investment from grinding and clenching</div>
            <div style={{ marginBottom: 2 }}>3. <b>Fluoride Treatment</b> twice per year \u2014 strengthens tooth structure around restorations</div>
            <div style={{ marginBottom: 2 }}>4. <b>Laser Bacterial Reduction</b> at least once every 12 months \u2014 eliminates harmful bacteria below the gumline</div>
            <div style={{ marginBottom: 2 }}>5. <b>InnerView Restoration Integrity Scan</b> every 6 months \u2014 detects leaking crowns, loose restorations, and hidden cracks before they become costly problems</div>
          </div>
          <p style={{ fontSize: 10, fontWeight: 700, color: DARK, marginBottom: 6, background: GOLD_BG, border: "1px solid #D4A017", borderRadius: 3, padding: "4px 8px" }}>If any of these 5 requirements are not maintained, the lifetime warranty coverage will be voided.</p>
          <div style={{ fontSize: 10, marginBottom: 2, color: GRAY }}><b>Warranty Effective Date:</b> Coverage begins <b>5 years</b> from the signature date of this agreement.</div>
          <div style={{ fontSize: 11.5, marginBottom: 3, marginTop: 8 }}><b>Treatment Under Warranty:</b></div>
          <div style={{ borderBottom: "1.5px solid #999", marginBottom: 5, paddingBottom: 3, fontSize: 11.5, minHeight: 18 }}>{allWarrantyTreatments}</div>
          <div style={{ borderBottom: "1.5px solid #999", marginBottom: 5, minHeight: 12 }} /><div style={{ borderBottom: "1.5px solid #999", marginBottom: 10, minHeight: 12 }} />
          <div style={{ marginBottom: 8, fontSize: 10.5, lineHeight: 1.65 }}>
            <div style={{ marginBottom: 6, display: "flex", alignItems: "flex-start", gap: 8 }}><div style={{ width: 45, borderBottom: "1.5px solid #999", flexShrink: 0, marginTop: 8, textAlign: "center" }}>{warrantyChoice === "agree" && <span style={{ fontSize: 15, fontWeight: 700 }}>{"\u2713"}</span>}</div><span><b>I agree</b> to the above conditions for the warranty of my prescribed treatment.</span></div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}><div style={{ width: 45, borderBottom: "1.5px solid #999", flexShrink: 0, marginTop: 8, textAlign: "center" }}>{warrantyChoice === "waive" && <span style={{ fontSize: 15, fontWeight: 700 }}>{"\u2713"}</span>}</div><span><b>I elect to waive</b> the warranty for my prescribed treatment and release Buchwald Family Dentistry and Orthodontics and its providers from obligation to replace or repair my dental treatment/prosthesis.</span></div>
          </div>
          <div style={{ marginTop: 24 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}><div style={{ flex: "0 0 58%" }}>{warrantySig ? (<><img src={warrantySig} alt="Sig" style={{ height: 50, maxWidth: "80%" }} /><div style={{ borderTop: "1.5px solid #999", width: "90%", marginTop: -4 }} /></>) : <div style={{ borderBottom: "1.5px solid #999", width: "90%", minHeight: 36 }} />}<div style={{ fontSize: 10, fontWeight: 700, color: DARK, marginTop: 4 }}>Signature</div></div><div style={{ flex: "0 0 38%" }}><div style={{ borderBottom: "1.5px solid #999", width: "100%", paddingBottom: 4, fontSize: 12, minHeight: 16 }}>{warrantyDate}</div><div style={{ fontSize: 10, fontWeight: 700, color: DARK, marginTop: 4 }}>Date</div></div></div></div>
        </div></div>
      </div>
    );
  }

  // ========== TREATMENT PLAN SIGNATURE MODE ==========
  if (collectSignatures && !showPreview) {
    const steps = { patient: { label: "Patient Signature", sub: "Hand the device to the patient to sign", next: "coordinator" }, coordinator: { label: "Treatment Coordinator", sub: "Coordinator, please sign below", next: "patient2" }, patient2: { label: "Patient Signature (Page 2)", sub: "Patient, please sign once more for the warranty acknowledgment", next: null } };
    const cfg = steps[sigStep]; const currentSig = sigStep === "patient" ? patientSig : sigStep === "coordinator" ? coordinatorSig : patientSig2;
    return (
      <div style={{ minHeight: "100vh", background: "#f7f9fb", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <style>{`@media print { body { display: none; } }`}</style>
        <div style={{ background: BLUE, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}><button onClick={() => setCollectSignatures(false)} style={toolbarBtn}>{"\u2190"} Back</button><div style={{ color: "white", fontSize: 16, fontWeight: 700 }}>Collect Signatures</div></div>
        <div style={{ padding: "24px 16px", maxWidth: 480, margin: "0 auto" }}>
          <div style={cardStyle}>
            <div style={{ textAlign: "center", marginBottom: 20 }}><div style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Step {sigStep === "patient" ? "1 of 3" : sigStep === "coordinator" ? "2 of 3" : "3 of 3"}</div><div style={{ fontSize: 18, fontWeight: 700, color: DARK }}>{cfg.label}</div><div style={{ fontSize: 13, color: GRAY, marginTop: 4 }}>{cfg.sub}</div></div>
            <div style={{ background: "#f7f9fb", borderRadius: 10, padding: "12px 14px", marginBottom: 20, fontSize: 13 }}><div><b>Patient:</b> {patientName}</div><div><b>Treatment:</b> {treatmentDisplay}</div><div><b>Debit Price:</b> ${totalDebit.toFixed(2)}</div></div>
            <SignaturePad key={sigStep} label="Sign here" onSave={d => { if (sigStep === "patient") setPatientSig(d); else if (sigStep === "coordinator") setCoordinatorSig(d); else setPatientSig2(d); }} onClear={() => { if (sigStep === "patient") setPatientSig(null); else if (sigStep === "coordinator") setCoordinatorSig(null); else setPatientSig2(null); }} />
            <button onClick={() => { if (cfg.next) setSigStep(cfg.next); else { setCollectSignatures(false); setShowPreview(true); } }} disabled={!currentSig} style={{ width: "100%", padding: 16, border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: currentSig ? "pointer" : "not-allowed", background: currentSig ? BLUE : "#ccc", color: "white" }}>{cfg.next ? "Next \u2192" : "View Treatment Plan"}</button>
          </div>
        </div>
      </div>
    );
  }

  // ========== RECEIPT VIEW ==========
  if (showReceipt) {
    const receiptNum = `BFD-${Date.now().toString().slice(-8)}`;
    return (
      <div style={{ background: "#f0f0f0", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
        <style>{`@media screen { .no-print { display: flex !important; } .print-page { width: 8.5in; max-width: 100%; margin: 0 auto 20px; background: white; box-shadow: 0 2px 12px rgba(0,0,0,0.15); padding: 0.5in 0.75in; } } @media print { .no-print { display: none !important; } body, html { margin: 0; padding: 0; } .print-page { width: 8.5in; padding: 0.5in 0.75in; margin: 0; box-shadow: none; } }`}</style>
        <div className="no-print" style={{ display: "none", position: "sticky", top: 0, zIndex: 100, background: GREEN, padding: "10px 16px", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => setShowReceipt(false)} style={toolbarBtn}>{"\u2190"} Back</button>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => savePDF("receipt-pdf", `Receipt_${patientName||"Patient"}.pdf`)} style={toolbarBtn}>{"\u2B07\uFE0F"} PDF</button>
            <button onClick={() => window.print()} style={{ background: "white", color: GREEN, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Print</button>
          </div>
        </div>
        <div id="receipt-pdf"><div className="print-page">
          <div style={{ textAlign: "center", marginBottom: 6 }}><Logo width={170} /></div>
          <div style={{ borderBottom: `3px solid ${BLUE}`, marginBottom: 12 }} />
          <div style={{ textAlign: "center", fontSize: 22, fontWeight: 700, color: BLUE, marginBottom: 4 }}>Payment Receipt</div>
          <div style={{ textAlign: "center", fontSize: 11, color: GRAY, marginBottom: 16 }}>Receipt #{receiptNum}</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 12 }}>
            <div><div style={{ color: GRAY, fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Patient</div><div style={{ fontSize: 14, fontWeight: 700 }}>{patientName}</div>{patientEmail && <div style={{ fontSize: 11, color: GRAY }}>{patientEmail}</div>}{patientPhone && <div style={{ fontSize: 11, color: GRAY }}>{patientPhone}</div>}</div>
            <div style={{ textAlign: "right" }}><div style={{ color: GRAY, fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Date</div><div style={{ fontSize: 14, fontWeight: 700 }}>{date}</div><div style={{ fontSize: 11, color: GRAY, marginTop: 4 }}>Paid via {paymentMethod}</div></div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16, fontSize: 11.5 }}>
            <thead><tr><th style={{ background: "#f0f0f0", padding: "6px 10px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid #ddd" }}>Treatment</th><th style={{ background: "#f0f0f0", padding: "6px 10px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid #ddd" }}>Tooth #</th><th style={{ background: "#f0f0f0", padding: "6px 10px", textAlign: "right", fontWeight: 700, borderBottom: "2px solid #ddd" }}>Amount</th></tr></thead>
            <tbody>{treatments.filter(t=>t.name).map((t,i) => <tr key={i}><td style={{ padding: "6px 10px", borderBottom: "1px solid #eee" }}>{t.name}</td><td style={{ padding: "6px 10px", borderBottom: "1px solid #eee" }}>{t.teeth.length>0?"#"+t.teeth.join(", #"):"-"}</td><td style={{ padding: "6px 10px", borderBottom: "1px solid #eee", textAlign: "right" }}>${(parseFloat(t.fee)||0).toFixed(2)}</td></tr>)}</tbody>
          </table>
          <div style={{ borderTop: "2px solid #ddd", paddingTop: 12, marginBottom: 24 }}>
            {activeDiscount && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ color: GREEN }}>{discountLabel}</span><span style={{ color: GREEN, fontWeight: 700 }}>-${discountAmount.toFixed(2)}</span></div>}
            {insuranceNum > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span>Insurance Coverage</span><span style={{ fontWeight: 700 }}>-${insuranceNum.toFixed(2)}</span></div>}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: BLUE, borderTop: "2px solid #ddd", paddingTop: 8, marginTop: 8 }}><span>Total Paid</span><span>${totalDebit.toFixed(2)}</span></div>
          </div>
          <div style={{ background: GREEN_BG, border: `2px solid ${GREEN}`, borderRadius: 8, padding: "16px 20px", textAlign: "center", marginBottom: 24 }}><div style={{ fontSize: 16, fontWeight: 700, color: GREEN }}>{"\u2713"} PAID IN FULL</div></div>
          <div style={{ textAlign: "center", fontSize: 10, color: GRAY, lineHeight: 1.6 }}><div>Buchwald Family Dentistry & Orthodontics</div><div>buchwaldfamilydentistry.com</div><div style={{ marginTop: 8 }}>Thank you for choosing Buchwald Family Dentistry!</div></div>
        </div></div>
      </div>
    );
  }

  // ========== TREATMENT PLAN FORM ==========
  if (appMode === "treatment" && !showPreview) {
    return (
      <div style={{ minHeight: "100vh", background: "#f7f9fb", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <style>{`@media print { body { display: none; } }`}</style>
        <div style={{ background: BLUE, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}><button onClick={() => { resetForm(); setAppMode(null); }} style={toolbarBtn}>{"\u2190"} Back</button><div><div style={{ color: "white", fontSize: 16, fontWeight: 700 }}>Buchwald Family Dentistry</div><div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>Treatment Plan Generator</div></div></div>
        <div style={{ padding: "20px 16px", maxWidth: 480, margin: "0 auto" }}>
          {/* Patient Info */}
          <div style={cardStyle}>
            <div style={sectionLabel}>Patient Info</div>
            <label style={labelStyle}>Patient Name</label><input type="text" value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="First Last" style={inputStyle} />
            <label style={labelStyle}>Email <span style={{ fontWeight: 400, color: "#999" }}>(for sending copy)</span></label><input type="email" value={patientEmail} onChange={e => setPatientEmail(e.target.value)} placeholder="patient@email.com" style={inputStyle} />
            <label style={labelStyle}>Phone <span style={{ fontWeight: 400, color: "#999" }}>(optional)</span></label><input type="tel" value={patientPhone} onChange={e => setPatientPhone(e.target.value)} placeholder="(555) 123-4567" style={inputStyle} />
            <label style={labelStyle}>Date</label><input type="text" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
          </div>
          {/* Treatments */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><div style={sectionLabel}>Treatments</div><button onClick={addTreatment} style={{ background: LIGHT_BLUE, color: BLUE, border: `1.5px solid ${BLUE}`, borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Add</button></div>
            {treatments.map((t, idx) => (
              <div key={t.id} style={{ background: "#f7f9fb", borderRadius: 10, padding: "12px 14px", marginBottom: 10, position: "relative" }}>
                {treatments.length > 1 && <button onClick={() => removeTreatment(t.id)} style={{ position: "absolute", top: 8, right: 10, background: "none", border: "none", color: RED, fontSize: 18, cursor: "pointer", lineHeight: 1 }}>{"\u00D7"}</button>}
                <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, marginBottom: 8 }}>Treatment {idx + 1}</div>
                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}><label style={{ ...labelStyle, marginTop: 0 }}>Treatment</label><input type="text" value={t.name} onChange={e => updateTreatment(t.id, "name", e.target.value)} placeholder="Crown, Invisalign..." style={{ ...inputStyle, padding: "10px 12px" }} /></div>
                  <div style={{ flex: "0 0 100px" }}><label style={{ ...labelStyle, marginTop: 0 }}>Fee</label><div style={{ position: "relative" }}><span style={{ ...dollarSign, left: 10 }}>$</span><input type="number" inputMode="decimal" value={t.fee} onChange={e => updateTreatment(t.id, "fee", e.target.value)} placeholder="0" style={{ ...inputStyle, padding: "10px 12px 10px 24px" }} /></div></div>
                </div>
                {/* Priority */}
                <label style={{ ...labelStyle, marginTop: 0, marginBottom: 8 }}>Priority Level</label>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  {PRIORITY_LEVELS.map(p => <button key={p.value} onClick={() => updateTreatment(t.id, "priority", p.value)} style={{ flex: 1, padding: "6px 4px", borderRadius: 8, border: `1.5px solid ${t.priority === p.value ? p.color : "#ddd"}`, background: t.priority === p.value ? p.bg : "white", color: t.priority === p.value ? p.color : GRAY, fontSize: 11, fontWeight: t.priority === p.value ? 700 : 400, cursor: "pointer", textAlign: "center" }}>{p.icon} {p.label}</button>)}
                </div>
                {/* Risk */}
                {t.name && (<div style={{ marginBottom: 10 }}>
                  <label style={{ ...labelStyle, marginTop: 0, marginBottom: 4 }}>{"\u26A0\uFE0F"} Risk of Not Getting Treatment <span style={{ fontWeight: 400, color: "#999", fontSize: 10 }}>(shown to patient)</span></label>
                  <textarea value={t.customRisk || getRiskForTreatment(t.name)} onChange={e => updateTreatment(t.id, "customRisk", e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 12, resize: "vertical", minHeight: 60, boxSizing: "border-box", background: "#fafafa", lineHeight: 1.5 }} />
                </div>)}
                {/* Tooth grid */}
                <label style={{ ...labelStyle, marginTop: 0, marginBottom: 8 }}>Tooth # <span style={{ fontWeight: 400, color: "#999" }}>(optional)</span></label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 6 }}>
                  {Array.from({length:32},(_,i)=>i+1).map(num => { const sel = t.teeth.includes(num); return <button key={num} onClick={() => toggleTooth(t.id, num)} style={{ padding: "8px 0", borderRadius: 8, border: `1.5px solid ${sel ? BLUE : "#ddd"}`, background: sel ? BLUE : "white", color: sel ? "white" : DARK, fontSize: 13, fontWeight: sel ? 700 : 400, cursor: "pointer" }}>{num}</button>; })}
                </div>
                {t.teeth.length > 0 && <div style={{ marginTop: 6, fontSize: 12, color: BLUE, fontWeight: 600 }}>Selected: #{t.teeth.join(", #")}</div>}
              </div>
            ))}
            {treatments.length > 1 && <div style={{ textAlign: "right", fontSize: 14, fontWeight: 700, color: DARK, paddingTop: 4 }}>Total: ${totalDebit.toFixed(2)}</div>}
          </div>
          {/* Pricing */}
          <div style={cardStyle}>
            <div style={sectionLabel}>Pricing & Financing</div>
            <div onClick={() => { setSameDayDiscount(!sameDayDiscount); if (!sameDayDiscount) setInOfficePlan(false); }} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, marginBottom: 8, cursor: "pointer", padding: "10px 14px", background: sameDayDiscount ? GREEN_BG : "#f7f9fb", border: `1.5px solid ${sameDayDiscount ? GREEN : "#e0e0e0"}`, borderRadius: 10 }}>
              <div style={{ width: 42, height: 24, borderRadius: 12, background: sameDayDiscount ? GREEN : "#ccc", position: "relative", flexShrink: 0 }}><div style={{ width: 20, height: 20, borderRadius: 10, background: "white", position: "absolute", top: 2, left: sameDayDiscount ? 20 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} /></div>
              <div><div style={{ fontSize: 14, fontWeight: 700, color: sameDayDiscount ? GREEN : DARK }}>Same Day Treatment - 20% Off</div>{sameDayDiscount && subtotal > 0 && <div style={{ fontSize: 12, color: GREEN }}>Saving ${discountAmount.toFixed(2)}</div>}</div>
            </div>
            <div onClick={() => { setInOfficePlan(!inOfficePlan); if (!inOfficePlan) setSameDayDiscount(false); }} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, cursor: "pointer", padding: "10px 14px", background: inOfficePlan ? GREEN_BG : "#f7f9fb", border: `1.5px solid ${inOfficePlan ? GREEN : "#e0e0e0"}`, borderRadius: 10 }}>
              <div style={{ width: 42, height: 24, borderRadius: 12, background: inOfficePlan ? GREEN : "#ccc", position: "relative", flexShrink: 0 }}><div style={{ width: 20, height: 20, borderRadius: 10, background: "white", position: "absolute", top: 2, left: inOfficePlan ? 20 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} /></div>
              <div><div style={{ fontSize: 14, fontWeight: 700, color: inOfficePlan ? GREEN : DARK }}>In-Office Plan Member - 20% Off</div>{inOfficePlan && subtotal > 0 && <div style={{ fontSize: 12, color: GREEN }}>Saving ${discountAmount.toFixed(2)}</div>}</div>
            </div>
            <label style={labelStyle}>Insurance Coverage (display only)</label><div style={{ position: "relative" }}><span style={dollarSign}>$</span><input type="number" inputMode="decimal" value={insuranceCoverage} onChange={e => setInsuranceCoverage(e.target.value)} placeholder="0.00" style={{ ...inputStyle, paddingLeft: 28 }} /></div>
            <label style={labelStyle}>Payment Plan</label><select value={financing} onChange={e => setFinancing(Number(e.target.value))} style={{ ...inputStyle, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}>{FINANCING_OPTIONS.map(o => <option key={o.months} value={o.months}>{o.label}</option>)}</select>
            {subtotal > 0 && (<div style={{ marginTop: 16, background: "#f7f9fb", borderRadius: 10, padding: 16 }}>
              {activeDiscount && (<><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13, color: GRAY }}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, fontWeight: 700, color: GREEN }}><span>{discountLabel}</span><span>-${discountAmount.toFixed(2)}</span></div></>)}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14, fontWeight: 600, color: DARK }}><span>Credit/Card Price</span><span>${creditPrice.toFixed(2)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13, color: GREEN }}><span>Save 3% with debit/cash/check</span><span>-${savings.toFixed(2)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: BLUE, background: LIGHT_BLUE, margin: "6px -8px 0", padding: "10px 8px", borderRadius: "0 0 8px 8px" }}><span>Debit/Cash/Check</span><span>${totalDebit.toFixed(2)}</span></div>
              {insuranceNum > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: GREEN, marginTop: 8 }}><span>Insurance Covers</span><span>${insuranceNum.toFixed(2)}</span></div>}
              {financing > 0 && <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed #ddd" }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: DARK }}><span>{financing} months at 0% interest</span><span>${monthlyPayment.toFixed(2)}/mo</span></div><div style={{ fontSize: 11, color: GRAY, marginTop: 2 }}>Based on credit/card price of ${creditPrice.toFixed(2)}</div></div>}
            </div>)}
          </div>
          {/* Upgrades */}
          <div style={cardStyle}>
            <div onClick={() => setShowUpgrades(!showUpgrades)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <div><div style={sectionLabel}>Upgraded Services</div>{selectedUpgrades.length > 0 && <div style={{ fontSize: 12, color: GRAY, marginTop: 2 }}>{selectedUpgrades.length} selected</div>}</div>
              <svg width="20" height="20" viewBox="0 0 20 20" style={{ transform: showUpgrades ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}><path d="M5 7.5L10 12.5L15 7.5" stroke={GRAY} strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
            </div>
            {showUpgrades && <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>{UPGRADED_SERVICES.map(svc => { const a = selectedUpgrades.includes(svc); return <button key={svc} onClick={() => toggleUpgrade(svc)} style={{ padding: "6px 12px", borderRadius: 20, border: `1.5px solid ${a ? BLUE : "#ddd"}`, background: a ? LIGHT_BLUE : "white", color: a ? BLUE : GRAY, fontSize: 13, fontWeight: a ? 600 : 400, cursor: "pointer" }}>{a && "\u2713 "}{svc}</button>; })}</div>}
          </div>
          {/* Staff Controls */}
          <div style={cardStyle}>
            <div style={sectionLabel}>Staff Controls</div>
            <div onClick={() => setPushWarranty(!pushWarranty)} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, cursor: "pointer", padding: "10px 14px", background: pushWarranty ? GOLD_BG : "#f7f9fb", border: `1.5px solid ${pushWarranty ? GOLD : "#e0e0e0"}`, borderRadius: 10 }}>
              <div style={{ width: 42, height: 24, borderRadius: 12, background: pushWarranty ? GOLD : "#ccc", position: "relative", flexShrink: 0 }}><div style={{ width: 20, height: 20, borderRadius: 10, background: "white", position: "absolute", top: 2, left: pushWarranty ? 20 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} /></div>
              <div><div style={{ fontSize: 14, fontWeight: 700, color: pushWarranty ? GOLD : DARK }}>{"\u{1F6E1}\uFE0F"} Push Lifetime Warranty</div><div style={{ fontSize: 11, color: pushWarranty ? GOLD : GRAY, marginTop: 2 }}>{pushWarranty ? "Warranty section included in plan & email" : "Warranty section hidden"}</div></div>
            </div>
          </div>
          {/* Save + Generate */}
          <button onClick={async () => { if (!patientName.trim()) return; setSavingToProfile(true); const [fn,...r] = patientName.trim().split(" "); const ln = r.join(" ")||"-"; const summary = `Date: ${date} | Treatments: ${treatments.filter(t=>t.name).map(t=>`${t.name}${t.teeth.length>0?" (#"+t.teeth.join(", #")+")":""}=$${(parseFloat(t.fee)||0).toFixed(2)} [${t.priority}]`).join(", ")} | Total: $${totalDebit.toFixed(2)}${activeDiscount?" | "+discountLabel:""}`; await savePatientRecord(fn, ln, "Treatment Plan", { total: totalDebit, summary, email: patientEmail, phone: patientPhone, inOfficePlan }); setSavingToProfile(false); setSavedToProfile(true); }} disabled={!patientName.trim()||savingToProfile} style={{ width: "100%", padding: 14, background: savedToProfile ? GREEN_BG : "white", color: savedToProfile ? GREEN : patientName.trim() ? BLUE : GRAY, border: `2px solid ${savedToProfile ? GREEN : patientName.trim() ? BLUE : "#ddd"}`, borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: patientName.trim() ? "pointer" : "not-allowed", marginBottom: 10 }}>{savingToProfile ? "Saving..." : savedToProfile ? "\u2713 Saved to Profile" : "\u{1F4BE} Save to Profile"}</button>
          <button onClick={() => { setShowPreview(true); if (!savedToProfile && patientName.trim()) { const [fn,...r] = patientName.trim().split(" "); const ln = r.join(" ")||"-"; const summary = `Date: ${date} | Treatments: ${treatments.filter(t=>t.name).map(t=>`${t.name}${t.teeth.length>0?" (#"+t.teeth.join(", #")+")":""}=$${(parseFloat(t.fee)||0).toFixed(2)} [${t.priority}]`).join(", ")} | Total: $${totalDebit.toFixed(2)}${activeDiscount?" | "+discountLabel:""}`; savePatientRecord(fn, ln, "Treatment Plan", { total: totalDebit, summary, email: patientEmail, phone: patientPhone, inOfficePlan }); } }} disabled={!formComplete} style={{ width: "100%", padding: 16, background: formComplete ? BLUE : "#ccc", color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: formComplete ? "pointer" : "not-allowed", marginBottom: 10 }}>Generate Treatment Plan</button>
          <div style={{ textAlign: "center", fontSize: 12, color: GRAY, padding: "6px 0 24px" }}>Add to Home Screen for quick access</div>
        </div>
      </div>
    );
  }

  // ========== TREATMENT PLAN PRINT PREVIEW ==========
  return (
    <div style={{ background: "#f0f0f0", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      <style>{`@media screen { .no-print { display: flex !important; } .print-page { width: 8.5in; max-width: 100%; margin: 0 auto 20px; background: white; box-shadow: 0 2px 12px rgba(0,0,0,0.15); padding: 0.5in 0.75in; } } @media print { .no-print { display: none !important; } body, html { margin: 0; padding: 0; } .print-page { width: 8.5in; padding: 0.5in 0.75in; margin: 0; box-shadow: none; page-break-after: always; background: white; } .print-page:last-child { page-break-after: auto; } }`}</style>
      <div className="no-print" style={{ display: "none", position: "sticky", top: 0, zIndex: 100, background: BLUE, padding: "10px 16px", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => setShowPreview(false)} style={toolbarBtn}>{"\u2190"} Edit</button>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button onClick={() => { setShowPreview(false); setCollectSignatures(true); setSigStep("patient"); }} style={toolbarBtn}>{"\u270D\uFE0F"} Sign</button>
          <button onClick={sendEmailCopy} style={{ ...toolbarBtn, background: emailSent ? "rgba(45,138,78,0.5)" : "rgba(255,255,255,0.2)" }}>{emailSent ? "\u2713 Sent" : "\u2709\uFE0F Email"}</button>
          <button onClick={() => setShowReceipt(true)} style={toolbarBtn}>{"\u{1F9FE}"} Receipt</button>
          <button onClick={resetForm} style={toolbarBtn}>New</button>
          <button onClick={() => savePDF("tp-pdf", `TreatmentPlan_${patientName||"Patient"}.pdf`)} style={toolbarBtn}>{"\u2B07\uFE0F"} PDF</button>
          <button onClick={() => window.print()} style={{ background: "white", color: BLUE, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Print</button>
        </div>
      </div>
      <div id="tp-pdf">
      {/* PAGE 1 */}
      <div className="print-page">
        <div style={{ textAlign: "center", marginBottom: 4 }}><Logo width={190} /></div>
        <div style={{ borderBottom: `3px solid ${BLUE}`, marginBottom: 12 }} />
        <div style={{ textAlign: "center", fontSize: 22, fontWeight: 700, color: BLUE, marginBottom: 12 }}>Dental Treatment Plan</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}><div><b style={{ color: GRAY }}>Patient Name: </b><span style={{ borderBottom: "1px solid #ccc", paddingBottom: 1, display: "inline-block", minWidth: 220 }}>{patientName}</span></div><div><b style={{ color: GRAY }}>Date: </b><span style={{ borderBottom: "1px solid #ccc", paddingBottom: 1, display: "inline-block", minWidth: 130 }}>{date}</span></div></div>
        <div style={{ marginBottom: 10, fontSize: 12 }}><b style={{ color: GRAY }}>Treatment Needs: </b><span style={{ borderBottom: "1px solid #ccc", paddingBottom: 1, display: "inline-block", minWidth: 350 }}>{treatmentDisplay}</span></div>
        {/* Treatment table with priority */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8, fontSize: 10.5 }}>
          <thead><tr><th style={{ background: "#f0f0f0", padding: "4px 8px", textAlign: "left", fontWeight: 700, borderBottom: "1px solid #ddd" }}>Priority</th><th style={{ background: "#f0f0f0", padding: "4px 8px", textAlign: "left", fontWeight: 700, borderBottom: "1px solid #ddd" }}>Tooth</th><th style={{ background: "#f0f0f0", padding: "4px 8px", textAlign: "left", fontWeight: 700, borderBottom: "1px solid #ddd" }}>Treatment</th><th style={{ background: "#f0f0f0", padding: "4px 8px", textAlign: "right", fontWeight: 700, borderBottom: "1px solid #ddd" }}>Fee</th></tr></thead>
          <tbody>
            {treatments.filter(t=>t.name).map((t,i) => { const prio = PRIORITY_LEVELS.find(p => p.value === t.priority); return (<tr key={i}><td style={{ padding: "3px 8px", borderBottom: "1px solid #eee" }}><span style={{ background: prio?.bg, color: prio?.color, padding: "1px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700 }}>{prio?.icon} {prio?.label}</span></td><td style={{ padding: "3px 8px", borderBottom: "1px solid #eee" }}>{t.teeth.length>0?"#"+t.teeth.join(", #"):"-"}</td><td style={{ padding: "3px 8px", borderBottom: "1px solid #eee" }}>{t.name}</td><td style={{ padding: "3px 8px", borderBottom: "1px solid #eee", textAlign: "right" }}>${(parseFloat(t.fee)||0).toFixed(2)}</td></tr>); })}
            <tr><td colSpan="3" style={{ padding: "4px 8px", fontWeight: 700 }}>Total</td><td style={{ padding: "4px 8px", fontWeight: 700, textAlign: "right" }}>${totalDebit.toFixed(2)}</td></tr>
          </tbody>
        </table>
        {/* Risk warnings for urgent/high */}
        {treatments.filter(t => t.name).some(t => t.priority === "urgent" || t.priority === "high") && (
          <div style={{ background: "#FFF3F3", border: `1.5px solid ${RED}`, borderRadius: 4, padding: "6px 10px", marginBottom: 8, fontSize: 10, lineHeight: 1.5 }}>
            <div style={{ fontWeight: 700, color: RED, fontSize: 11, marginBottom: 4 }}>{"\u26A0\uFE0F"} Important: Risks of Delaying Treatment</div>
            {treatments.filter(t => t.name && (t.priority === "urgent" || t.priority === "high")).map((t,i) => <div key={i} style={{ marginBottom: 4 }}><b style={{ color: DARK }}>{t.name}:</b> <span style={{ color: "#555" }}>{t.customRisk || getRiskForTreatment(t.name)}</span></div>)}
          </div>
        )}
        <div style={{ background: LIGHT_BLUE, border: `1px solid ${BLUE}`, borderRadius: 4, padding: "6px 10px", marginBottom: 8, fontSize: 9.5, fontStyle: "italic", color: GRAY, lineHeight: 1.4 }}>* Fees may include upgraded services: {selectedUpgrades.length > 0 ? (<>{selectedUpgrades.map((s,i) => <span key={s}><b style={{ color: DARK }}>{s}</b>{i < selectedUpgrades.length-1 ? ", " : ""}</span>)}{UPGRADED_SERVICES.filter(s => !selectedUpgrades.includes(s)).length > 0 && ", "}{UPGRADED_SERVICES.filter(s => !selectedUpgrades.includes(s)).join(", ")}</>) : UPGRADED_SERVICES.join(", ")}</div>
        {activeDiscount && <div style={{ background: GREEN_BG, border: `1px solid ${GREEN}`, borderRadius: 4, padding: "4px 10px", marginBottom: 6, fontSize: 10.5, textAlign: "center" }}><b style={{ color: GREEN }}>{discountLabel}</b><span style={{ color: DARK, marginLeft: 8 }}>You save ${discountAmount.toFixed(2)}</span></div>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div><div style={{ fontSize: 13, fontWeight: 700 }}>Patient Pays: <span style={{ fontSize: 15 }}>${creditPrice.toFixed(2)}</span></div>{insuranceNum > 0 && <div style={{ fontSize: 10, color: GREEN, marginTop: 2 }}>Insurance Coverage: ${insuranceNum.toFixed(2)}</div>}</div>
          <div style={{ background: LIGHT_BLUE, border: `1.5px solid ${BLUE}`, padding: "5px 12px", borderRadius: 4, textAlign: "center" }}><div style={{ fontSize: 9, color: BLUE }}>Debit/Cash/Check Price</div><div style={{ fontSize: 14, fontWeight: 800, color: BLUE }}>${totalDebit.toFixed(2)}</div><div style={{ fontSize: 8, color: BLUE, marginTop: 1 }}>Save ${savings.toFixed(2)} with debit/cash/check</div></div>
        </div>
        {financing > 0 && <div style={{ background: GOLD_BG, border: "1px solid #D4A017", borderRadius: 4, padding: "5px 10px", marginBottom: 6, fontSize: 10.5, textAlign: "center" }}><b style={{ color: GOLD }}>{financing} Month Payment Plan at 0% Interest:</b><span style={{ color: DARK, marginLeft: 8 }}>${monthlyPayment.toFixed(2)}/mo</span></div>}
        <div style={{ fontSize: 15, fontWeight: 700, color: BLUE, marginBottom: 5, marginTop: 4 }}>Payment Options</div>
        <div style={{ paddingLeft: 16, fontSize: 11, lineHeight: 1.7, marginBottom: 5 }}><div>1. <b>Pay in full</b> at the time of appointment</div><div>2. <b>For crowns:</b> Half at prep date, second half at seat date</div><div>3. <b>6-month CareCredit</b> payment plan with 0% interest</div><div>4. <b>Cherry financing</b> with interest as low as 0%</div></div>
        <div style={{ background: "#FFFBE6", border: "1px solid #D4A017", borderLeft: "3px solid #D4A017", borderRadius: 3, padding: "4px 10px", fontSize: 10, marginBottom: 8 }}><b>Please note:</b> All treatment will be started but will not be completed until the treatment cost has been met in full.</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: BLUE, marginBottom: 5 }}>Patient Consent & Authorization</div>
        <div style={{ fontSize: 9.5, lineHeight: 1.5, color: DARK }}>
          <p style={{ margin: "0 0 3px", fontWeight: 700 }}>I understand if insurance does not pay for any reason that I am responsible for the full amount. The estimate of coverage shown is not a guarantee of payment.</p>
          <p style={{ margin: "0 0 3px" }}>Treatment plan options have been presented to me. I understand that my insurance benefit will not pay toward the upgraded service(s) or any cosmetic services or charges pertaining to cosmetic services that I selected, and I understand that I will be responsible for the fee for this treatment. I wish to waive my insurance plan guidelines for the upgraded service(s) and I release the provider, Dr. Max Buchwald Jr, from the contractual terms of my plan in this case.</p>
          <p style={{ margin: "0 0 3px" }}>I, the undersigned patient, hereby authorize my dental care provider to perform the procedure(s) or course(s) of treatment listed herein. I understand my dental condition and have discussed treatment options with my dental care provider.</p>
          <p style={{ margin: "0 0 3px" }}>I acknowledge I have read and understand the treatments recommended along with the associated fees and payment options presented and have received a copy today. I understand the estimated fees in this treatment plan are valid for 90 days but may change after that time.</p>
          <p style={{ margin: "0 0 5px" }}>Appointments cancelled with less than 48 hours notice are subject to a charge of $100 per hour.</p>
        </div>
        <div style={{ marginTop: 10 }}><SigBlock sig={patientSig} label="Patient Signature" dateStr={date} /><SigBlock sig={coordinatorSig} label="Treatment Coordinator Signature" dateStr={date} /></div>
      </div>
      {/* PAGE 2 */}
      <div className="print-page">
        <div style={{ textAlign: "center", marginBottom: 4 }}><Logo width={170} /></div>
        <div style={{ borderBottom: `3px solid ${BLUE}`, marginBottom: 10 }} />
        <div style={{ textAlign: "center", fontSize: 18, fontWeight: 700, color: BLUE, marginBottom: 8 }}>Understanding Your Dental Insurance</div>
        <p style={{ fontSize: 11, lineHeight: 1.5, margin: "0 0 6px" }}>We believe in patient education at Buchwald Family Dentistry. Many patients assume that medical and dental insurance are similar. However, they are quite different:</p>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 6, fontSize: 10.5 }}><thead><tr><th style={{ background: BLUE, color: "white", padding: "5px 8px", fontWeight: 700 }}>Medical Insurance</th><th style={{ background: BLUE, color: "white", padding: "5px 8px", fontWeight: 700 }}>Dental Insurance</th></tr></thead><tbody>{[["High deductible","Deductibles below $100"],["High monthly premiums","Low monthly premiums"],["No annual maximum","Annual maximum applies"],["Preauthorization guarantees payment","Predetermination does not guarantee payment"]].map(([m,d],i) => <tr key={i}><td style={{ padding: "4px 8px", border: "1px solid #ddd" }}>{m}</td><td style={{ padding: "4px 8px", border: "1px solid #ddd" }}>{d}</td></tr>)}</tbody></table>
        <p style={{ fontSize: 9.5, fontStyle: "italic", color: GRAY, margin: "0 0 6px", lineHeight: 1.4 }}>Dental coverage is more like a discount program with a small treatment assistance benefit attached.</p>
        <div style={{ fontSize: 14, fontWeight: 700, color: BLUE, marginBottom: 4 }}>Why We Prioritize Long-Lasting Dental Work</div>
        <p style={{ fontSize: 10.5, lineHeight: 1.5, margin: "0 0 3px" }}>Many insurance plans only cover replacement every 5 years. There are techniques and materials that make restorations last 10, 15, or more years. We believe you deserve the most value:</p>
        <ul style={{ fontSize: 10.5, lineHeight: 1.6, margin: "0 0 3px", paddingLeft: 18 }}><li><b>We go the extra mile</b> to use higher-quality materials</li><li><b>We focus on precise technique</b> and attention to detail</li><li><b>Better durability</b> means fewer replacements and better long-term value</li></ul>
        <p style={{ fontSize: 10.5, lineHeight: 1.5, margin: "0 0 5px" }}>Insurance may only reimburse for the minimum standard, but we aim for the <b style={{ color: BLUE }}>highest standard</b>.</p>
        <div style={{ borderBottom: `2px solid ${BLUE}`, marginBottom: 6 }} />
        {pushWarranty ? (<>
          <div style={{ fontSize: 14, fontWeight: 700, color: BLUE, marginBottom: 4 }}>Our Lifetime Warranty</div>
          <p style={{ fontSize: 10.5, lineHeight: 1.5, margin: "0 0 5px" }}>Buchwald Family Dentistry offers a <b style={{ color: BLUE }}>Lifetime Warranty</b> on qualifying restorations. If a warranted restoration fails under normal use, we will repair or replace it at no additional charge.</p>
          <div style={{ background: "#F0FAFF", border: `1.5px solid ${BLUE}`, borderRadius: 4, padding: "7px 10px", marginBottom: 6, fontSize: 10, lineHeight: 1.5 }}>
            <div style={{ fontWeight: 700, color: BLUE, fontSize: 11, marginBottom: 2 }}>What is Covered</div>
            <p style={{ margin: "0 0 5px" }}>Crowns, bridges, fillings, and other restorations placed at our office are warranted for life against defects in materials and workmanship.</p>
            <div style={{ fontWeight: 700, color: BLUE, fontSize: 11, marginBottom: 2 }}>How to Keep Your Warranty Active</div>
            <ul style={{ margin: "0 0 5px", paddingLeft: 16, lineHeight: 1.6 }}><li><b>Regular cleanings every 6 months</b></li><li><b>In-office night guard</b> \u2014 protects from grinding and clenching</li><li><b>Fluoride treatment twice per year</b></li><li><b>Laser bacterial reduction every 12 months</b></li><li><b>InnerView scan every 6 months</b> \u2014 detects issues before they become bigger problems</li></ul>
            <div style={{ fontWeight: 700, color: BLUE, fontSize: 11, marginBottom: 2 }}>What is Not Covered</div>
            <p style={{ margin: 0 }}>Damage from trauma, accidents, or injury; failure to maintain preventive care; neglect of at-home oral care; or using teeth for purposes other than normal chewing.</p>
          </div>
        </>) : (<div style={{ padding: "20px 0", textAlign: "center", color: GRAY, fontSize: 12, fontStyle: "italic" }}>Ask us about our Lifetime Warranty program for qualifying restorations!</div>)}
        <div style={{ borderBottom: `2px solid ${BLUE}`, marginBottom: 6 }} />
        <div style={{ fontSize: 11, marginBottom: 2 }}><b style={{ color: GRAY }}>Patient Name (Print): </b><span style={{ borderBottom: "1px solid #ccc", display: "inline-block", minWidth: 280 }}>{patientName}</span></div>
        <div style={{ marginTop: 8 }}><SigBlock sig={patientSig2} label="Patient Signature" dateStr={date} /></div>
      </div>
      </div>
    </div>
  );
}
