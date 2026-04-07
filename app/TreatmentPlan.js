"use client";
import { useState, useRef, useEffect } from "react";

function savePDF(elementId, filename) {
  if (!window.html2pdf) { alert("PDF library loading, try again in a moment."); return; }
  window.html2pdf().set({ margin: [0.4, 0.5], filename, image: { type: "jpeg", quality: 0.97 }, html2canvas: { scale: 2, useCORS: true, logging: false }, jsPDF: { unit: "in", format: "letter", orientation: "portrait" }, pagebreak: { mode: ["css", "legacy"] } }).from(document.getElementById(elementId)).save();
}

const BLUE = "#0098D4", DARK = "#1A1A1A", GRAY = "#666", LIGHT_BLUE = "#E8F4FA", GOLD = "#B8860B", GOLD_BG = "#FFF7E0", RED = "#cc3333", GREEN = "#2d8a4e", GREEN_BG = "#e6f9ee";
const UPGRADED_SERVICES = ["UltraCal XS","HurriSeal","Gingivectomy","Lab Fees","Core Build Up","Custom Stain Fees","Chairside Lab Fees","Membrane","Bone Graft","Nitrous","Recement Fee","iTero Scan","Surgical Isolation","Therapeutic Parenteral Drug","Root Canal Obstruction","Pulp Vitality Test","Bacterial Decontamination","Jet White Prophy","Fluoride"];
const FINANCING_OPTIONS = [{ label: "No financing", months: 0 },{ label: "6 months 0% (CareCredit)", months: 6 },{ label: "12 months 0%", months: 12 },{ label: "18 months 0%", months: 18 },{ label: "24 months 0%", months: 24 }];
const WARRANTY_TREATMENTS = ["Crowns","Composite Fillings","Implants","Orthodontics","Preventive Resin Restoration","Scaling & Root Planning","Bridges","Veneers"];
const PRIORITY_LEVELS = [
  { value: "urgent", label: "Urgent", color: "#cc3333", bg: "#FFF3F3", icon: "\u{1F534}" },
  { value: "high", label: "High", color: "#D4760A", bg: "#FFF7E0", icon: "\u{1F7E0}" },
  { value: "moderate", label: "Moderate", color: "#B8860B", bg: "#FFFBE6", icon: "\u{1F7E1}" },
  { value: "low", label: "Low", color: "#2d8a4e", bg: "#e6f9ee", icon: "\u{1F7E2}" },
];
const RISK_MAP = {
  crown: "Without a crown, the weakened tooth risks fracture - potentially requiring extraction + implant ($4,000-$6,000) or root canal ($1,500-$2,000).",
  "root canal": "Delaying allows infection to spread to bone/tissue, leading to abscess, bone loss, and potential tooth loss requiring an implant.",
  filling: "Untreated cavities grow toward the nerve, turning a $200-$400 filling into a $1,500+ root canal or crown.",
  composite: "Untreated cavities grow toward the nerve, turning a $200-$400 filling into a $1,500+ root canal or crown.",
  implant: "Missing teeth cause adjacent teeth to shift, bone loss in the jaw, and bite problems. Costs multiply over time.",
  bridge: "Without replacing the tooth, surrounding teeth drift and tilt, creating decay-prone areas on healthy teeth.",
  extract: "Untreated damaged/infected teeth can cause spreading infection and damage to neighboring teeth.",
  scaling: "Untreated gum disease causes progressive, irreversible bone loss - the #1 cause of tooth loss in adults.",
  perio: "Untreated gum disease causes progressive, irreversible bone loss - the #1 cause of tooth loss in adults.",
  "deep clean": "Untreated gum disease causes progressive, irreversible bone loss - the #1 cause of tooth loss in adults.",
  veneer: "Delaying on compromised teeth allows further wear, chipping, or decay of the underlying structure.",
  invisalign: "Misaligned teeth increase cavity/gum disease risk. Bite issues cause TMJ pain, headaches, and uneven wear.",
  ortho: "Misaligned teeth increase cavity/gum disease risk. Bite issues cause TMJ pain, headaches, and uneven wear.",
  braces: "Misaligned teeth increase cavity/gum disease risk. Bite issues cause TMJ pain, headaches, and uneven wear.",
  "night guard": "Grinding/clenching can crack teeth and destroy crowns/fillings. A $400 guard protects thousands in dental work.",
  nightguard: "Grinding/clenching can crack teeth and destroy crowns/fillings. A $400 guard protects thousands in dental work.",
  fluoride: "Regular fluoride strengthens enamel and prevents decay at restoration margins.",
};
function getRisk(name) { const l = name.toLowerCase(); for (const [k, v] of Object.entries(RISK_MAP)) if (l.includes(k)) return v; return "Delaying treatment often leads to more complex, expensive procedures. Early treatment saves tooth structure and money."; }

// ========== LOCAL STORAGE DB ==========
function db_load(key, fallback) { try { const d = localStorage.getItem("bfd_" + key); return d ? JSON.parse(d) : fallback; } catch { return fallback; } }
function db_save(key, val) { try { localStorage.setItem("bfd_" + key, JSON.stringify(val)); } catch {} }
function db_getPatients() { return db_load("patients", []); }
function db_savePatient(patient) {
  const patients = db_getPatients();
  const idx = patients.findIndex(p => p.id === patient.id);
  if (idx >= 0) patients[idx] = { ...patients[idx], ...patient, updated_at: new Date().toISOString() };
  else patients.unshift({ ...patient, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  db_save("patients", patients); return patient.id;
}
function db_findPatient(fn, ln) { return db_getPatients().find(p => p.first_name.toLowerCase() === fn.toLowerCase() && p.last_name.toLowerCase() === ln.toLowerCase()); }
function db_getTreatments(pid) { return db_load("treatments", []).filter(t => t.patient_id === pid).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); }
function db_saveTreatment(t) { const all = db_load("treatments", []); all.unshift({ ...t, id: t.id || crypto.randomUUID(), created_at: new Date().toISOString() }); db_save("treatments", all); }
function db_updateTreatmentStatus(id, status) { const all = db_load("treatments", []); const idx = all.findIndex(t => t.id === id); if (idx >= 0) { all[idx].status = status; db_save("treatments", all); } }
function db_getNotes(pid) { return db_load("notes", []).filter(n => n.patient_id === pid).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); }
function db_saveNote(pid, note) { const all = db_load("notes", []); all.unshift({ id: crypto.randomUUID(), patient_id: pid, note, created_at: new Date().toISOString() }); db_save("notes", all); }
function db_getAllTreatments() { return db_load("treatments", []); }
function db_deletePatient(pid) {
  db_save("patients", db_getPatients().filter(p => p.id !== pid));
  db_save("treatments", db_load("treatments", []).filter(t => t.patient_id !== pid));
  db_save("notes", db_load("notes", []).filter(n => n.patient_id !== pid));
  db_save("cleanings", db_load("cleanings", []).filter(c => c.patient_id !== pid));
}
function db_enrollPlan(pid) {
  const patients = db_getPatients(); const idx = patients.findIndex(p => p.id === pid);
  if (idx >= 0) { patients[idx].plan_status = "active"; patients[idx].plan_start_date = new Date().toISOString().split("T")[0]; patients[idx].updated_at = new Date().toISOString(); db_save("patients", patients); }
}
function db_unenrollPlan(pid) {
  const patients = db_getPatients(); const idx = patients.findIndex(p => p.id === pid);
  if (idx >= 0) { patients[idx].plan_status = "none"; patients[idx].updated_at = new Date().toISOString(); db_save("patients", patients); }
}
function db_getCleanings(pid) { return db_load("cleanings", []).filter(c => c.patient_id === pid).sort((a, b) => new Date(b.date) - new Date(a.date)); }
function db_addCleaning(pid) { const all = db_load("cleanings", []); all.unshift({ id: crypto.randomUUID(), patient_id: pid, date: new Date().toISOString() }); db_save("cleanings", all); }
function db_getCleaningsThisYear(pid) { const year = new Date().getFullYear(); return db_load("cleanings", []).filter(c => c.patient_id === pid && new Date(c.date).getFullYear() === year).length; }
function db_removeCleaning(cid) { db_save("cleanings", db_load("cleanings", []).filter(c => c.id !== cid)); }

// ========== GMAIL APP LINK ==========
// Uses mailto: which on mobile opens the default mail app (Gmail if set as default)
// On iPad/iPhone: Settings > Mail > Default Mail App > Gmail
function openGmail(to, subject, body) {
  window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// ========== COMPONENTS ==========
function SignaturePad({ label, onSave, onClear }) {
  const canvasRef = useRef(null); const [drawing, setDrawing] = useState(false); const [hasDrawn, setHasDrawn] = useState(false);
  useEffect(() => { const c = canvasRef.current; if (!c) return; const ctx = c.getContext("2d"); const r = c.getBoundingClientRect(); c.width = r.width*2; c.height = r.height*2; ctx.scale(2,2); ctx.strokeStyle = DARK; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); ctx.strokeStyle = "#ccc"; ctx.lineWidth = 1; ctx.moveTo(10, r.height-20); ctx.lineTo(r.width-10, r.height-20); ctx.stroke(); ctx.strokeStyle = DARK; ctx.lineWidth = 2; }, []);
  const gp = e => { const r = canvasRef.current.getBoundingClientRect(); const t = e.touches ? e.touches[0] : e; return { x: t.clientX-r.left, y: t.clientY-r.top }; };
  const sd = e => { e.preventDefault(); setDrawing(true); setHasDrawn(true); const ctx = canvasRef.current.getContext("2d"); const p = gp(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
  const dr = e => { e.preventDefault(); if (!drawing) return; const ctx = canvasRef.current.getContext("2d"); const p = gp(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
  const ed = e => { e.preventDefault(); if (drawing) { setDrawing(false); onSave(canvasRef.current.toDataURL()); } };
  const cl = () => { const c = canvasRef.current; const ctx = c.getContext("2d"); const r = c.getBoundingClientRect(); ctx.clearRect(0,0,c.width,c.height); ctx.beginPath(); ctx.strokeStyle="#ccc"; ctx.lineWidth=1; ctx.moveTo(10,r.height-20); ctx.lineTo(r.width-10,r.height-20); ctx.stroke(); ctx.strokeStyle=DARK; ctx.lineWidth=2; setHasDrawn(false); onClear(); };
  return (<div style={{ marginBottom: 16 }}><div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 6 }}><label style={{ fontSize:12, fontWeight:600, color:GRAY }}>{label}</label>{hasDrawn && <button onClick={cl} style={{ fontSize:11, color:BLUE, background:"none", border:"none", fontWeight:600, cursor:"pointer" }}>Clear</button>}</div><canvas ref={canvasRef} onMouseDown={sd} onMouseMove={dr} onMouseUp={ed} onMouseLeave={ed} onTouchStart={sd} onTouchMove={dr} onTouchEnd={ed} style={{ width:"100%", height:120, border:"1.5px solid #e0e0e0", borderRadius:10, background:"#fafafa", touchAction:"none", cursor:"crosshair" }} /></div>);
}
function SigBlock({ sig, label, dateStr }) {
  if (sig) return <div style={{ marginBottom:8 }}><img src={sig} alt={label} style={{ height:50, maxWidth:"55%" }} /><div style={{ borderTop:"1px solid #999", width:"60%", marginTop:-4 }} /><div style={{ fontSize:8, color:GRAY }}>{label}<span style={{ float:"right", width:"30%" }}>{dateStr}</span></div></div>;
  return <div style={{ marginBottom:8 }}><div style={{ borderBottom:"1px solid #999", width:"60%", display:"inline-block", marginRight:"8%" }} /><div style={{ borderBottom:"1px solid #999", width:"28%", display:"inline-block" }} /><div style={{ fontSize:8, color:GRAY }}><span style={{ display:"inline-block", width:"60%", marginRight:"8%" }}>{label}</span><span>Date</span></div></div>;
}
function Logo({ width = 190 }) { return <img src="/logo.png" alt="Buchwald Family Dentistry" style={{ width, height: "auto" }} />; }

const CS = { background: "white", borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" };
const SL = { fontSize: 13, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.5px" };
const LS = { display: "block", fontSize: 12, fontWeight: 600, color: GRAY, marginBottom: 6, marginTop: 14 };
const IS = { width: "100%", padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 16, color: DARK, outline: "none", background: "#fafafa", WebkitAppearance: "none", boxSizing: "border-box" };
const DS = { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: GRAY, fontWeight: 600 };
const TB = { background: "rgba(255,255,255,0.2)", color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" };

export default function TreatmentPlan() {
  const [appMode, setAppMode] = useState(null); // null=hub, "treatment", "warranty", "receipt"
  const [forceRefresh, setForceRefresh] = useState(0);
  useEffect(() => { if (!document.getElementById("html2pdf-script")) { const s = document.createElement("script"); s.id = "html2pdf-script"; s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"; document.head.appendChild(s); } }, []);

  // Treatment plan
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
  const [collectSignatures, setCollectSignatures] = useState(false);
  const [patientSig, setPatientSig] = useState(null);
  const [coordinatorSig, setCoordinatorSig] = useState(null);
  const [patientSig2, setPatientSig2] = useState(null);
  const [sigStep, setSigStep] = useState("patient");
  const [pushWarranty, setPushWarranty] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  // Warranty
  const [wName, setWName] = useState(""); const [wDate, setWDate] = useState(new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}));
  const [wItems, setWItems] = useState([]); const [wCustom, setWCustom] = useState("");
  const [wChoice, setWChoice] = useState("agree"); const [wSig, setWSig] = useState(null);
  const [wPreview, setWPreview] = useState(false); const [wCollectSig, setWCollectSig] = useState(false);
  // Receipt generator (standalone)
  const [rcptName, setRcptName] = useState(""); const [rcptEmail, setRcptEmail] = useState("");
  const [rcptPhone, setRcptPhone] = useState("");
  const [rcptItems, setRcptItems] = useState([{ id: 1, desc: "", amount: "" }]);
  const [rcptPayMethod, setRcptPayMethod] = useState("debit");
  const [rcptDate, setRcptDate] = useState(new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}));
  const [rcptDiscount, setRcptDiscount] = useState(""); const [rcptInsurance, setRcptInsurance] = useState("");
  const [rcptShowPreview, setRcptShowPreview] = useState(false);
  const [rcptNote, setRcptNote] = useState("");
  const [rcptCCSurcharge, setRcptCCSurcharge] = useState(false);
  // Hub
  const [hubTab, setHubTab] = useState("home");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [search, setSearch] = useState(""); const [newNote, setNewNote] = useState("");

  // Calcs
  const subtotal = treatments.reduce((s, t) => s + (parseFloat(t.fee) || 0), 0);
  const activeDiscount = sameDayDiscount || inOfficePlan;
  const discountLabel = sameDayDiscount ? "Same Day Discount (20%)" : "In-Office Plan Discount (20%)";
  const discountAmount = activeDiscount ? Math.round(subtotal * 0.20 * 100) / 100 : 0;
  const totalDebit = Math.round((subtotal - discountAmount) * 100) / 100;
  const insuranceNum = parseFloat(insuranceCoverage) || 0;
  const creditPrice = Math.round(totalDebit * 1.03 * 100) / 100;
  const savings = Math.round((creditPrice - totalDebit) * 100) / 100;
  const monthlyPayment = financing > 0 ? Math.round((creditPrice / financing) * 100) / 100 : 0;
  const treatmentDisplay = treatments.filter(t => t.name).map(t => { const ts = t.teeth.length > 0 ? "#" + t.teeth.join(", #") : ""; return [ts, t.name].filter(Boolean).join(" - "); }).join("; ");
  const formComplete = patientName && treatments.some(t => t.name && t.fee);
  // Receipt calcs
  const rcptSubtotal = rcptItems.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const rcptDiscNum = parseFloat(rcptDiscount) || 0;
  const rcptInsNum = parseFloat(rcptInsurance) || 0;
  const rcptCCFee = rcptCCSurcharge ? Math.round(rcptSubtotal * 0.03 * 100) / 100 : 0;
  const rcptTotal = Math.max(0, rcptSubtotal + rcptCCFee - rcptDiscNum - rcptInsNum);

  const toggleUpgrade = svc => setSelectedUpgrades(p => p.includes(svc) ? p.filter(s => s !== svc) : [...p, svc]);
  const addTreatment = () => setTreatments(p => [...p, { id: Date.now(), teeth: [], name: "", fee: "", priority: "moderate", customRisk: "" }]);
  const removeTreatment = id => setTreatments(p => p.length > 1 ? p.filter(t => t.id !== id) : p);
  const updateTreatment = (id, f, v) => setTreatments(p => p.map(t => t.id === id ? { ...t, [f]: v } : t));
  const toggleTooth = (id, num) => setTreatments(p => p.map(t => t.id === id ? { ...t, teeth: t.teeth.includes(num) ? t.teeth.filter(n => n !== num) : [...t.teeth, num].sort((a, b) => a - b) } : t));
  const wSelTreatments = wItems.map(x => x.name);
  const wAllTreatments = wItems.map(i => i.teeth.length > 0 ? i.name + " (#" + i.teeth.join(", #") + ")" : i.name).join(", ");
  const wFormComplete = wName && wItems.length > 0;

  const resetForm = () => { setPatientName(""); setPatientEmail(""); setPatientPhone(""); setTreatments([{id:1,teeth:[],name:"",fee:"",priority:"moderate",customRisk:""}]); setInsuranceCoverage(""); setFinancing(0); setSameDayDiscount(false); setInOfficePlan(false); setSelectedUpgrades([]); setPatientSig(null); setCoordinatorSig(null); setPatientSig2(null); setShowPreview(false); setCollectSignatures(false); setSigStep("patient"); setSavedToProfile(false); setPushWarranty(true); setEmailSent(false); setDate(new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})); };
  const resetWarranty = () => { setWName(""); setWItems([]); setWCustom(""); setWChoice("agree"); setWSig(null); setWPreview(false); setWCollectSig(false); setWDate(new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})); };
  const resetReceipt = () => { setRcptName(""); setRcptEmail(""); setRcptPhone(""); setRcptItems([{id:1,desc:"",amount:""}]); setRcptPayMethod("debit"); setRcptDate(new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})); setRcptDiscount(""); setRcptInsurance(""); setRcptShowPreview(false); setRcptNote(""); setRcptCCSurcharge(false); };

  const saveRecord = (recordType, details) => {
    if (!patientName.trim()) return;
    const [fn, ...r] = patientName.trim().split(" "); const ln = r.join(" ") || "-";
    let patient = db_findPatient(fn, ln);
    if (!patient) patient = { id: crypto.randomUUID(), first_name: fn, last_name: ln };
    if (patientEmail) patient.email = patientEmail;
    if (patientPhone) patient.phone = patientPhone;
    db_savePatient(patient);
    db_saveTreatment({ patient_id: patient.id, type: recordType, cost: details.total || 0, status: "presented", summary: details.summary, items: details.items || [] });
    setSavedToProfile(true);
  };

  const fmtDate = d => { if (!d) return ""; try { return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); } catch { return ""; } };
  const timeAgo = d => { const diff = Date.now() - new Date(d); const m = Math.floor(diff/60000); if (m < 60) return `${m}m ago`; const h = Math.floor(m/60); if (h < 24) return `${h}h ago`; return `${Math.floor(h/24)}d ago`; };

  const buildTPEmail = () => {
    let b = `Dear ${patientName},\n\nThank you for visiting Buchwald Family Dentistry! Here is your treatment plan.\n\nDate: ${date}\n\nTREATMENT PLAN\n` + "=".repeat(40) + "\n\n";
    treatments.filter(t => t.name).forEach(t => {
      const ts = t.teeth.length > 0 ? " (Tooth #" + t.teeth.join(", #") + ")" : "";
      b += `${t.name}${ts}: $${(parseFloat(t.fee)||0).toFixed(2)}\n`;
    });
    b += "=".repeat(40) + `\nCredit/Card: $${creditPrice.toFixed(2)}\nDebit/Cash/Check: $${totalDebit.toFixed(2)} (Save $${savings.toFixed(2)})\n`;
    if (activeDiscount) b += `${discountLabel}: -$${discountAmount.toFixed(2)}\n`;
    if (financing > 0) b += `${financing}mo at 0%: $${monthlyPayment.toFixed(2)}/mo\n`;
    if (insuranceNum > 0) b += `Insurance: $${insuranceNum.toFixed(2)}\n`;
    b += "\nPayment Options:\n1. Pay in full\n2. Crowns: Half at prep, half at seat\n3. CareCredit 6mo at 0%\n4. Cherry financing as low as 0%\n";
    if (pushWarranty) b += `\n${"=".repeat(40)}\nLIFETIME WARRANTY\n${"=".repeat(40)}\n\nWe offer a Lifetime Warranty on qualifying restorations.\n\nWithout warranty:\n- Crown replacement: $2,500-$3,000\n- Implant: $4,000-$6,000\n\nWith Lifetime Warranty: $0\n\nAsk us about enrolling!\n`;
    b += "\n---\nBuchwald Family Dentistry & Orthodontics\nbuchwaldfamilydentistry.com\n";
    return b;
  };

  // ===========================
  // PATIENT DETAIL VIEW
  // ===========================
  if (selectedPatient && appMode === null) {
    const pts = db_getTreatments(selectedPatient.id);
    const notes = db_getNotes(selectedPatient.id);
    const pe = selectedPatient.email;
    const isOnPlan = selectedPatient.plan_status === "active";
    const cleaningsUsed = db_getCleaningsThisYear(selectedPatient.id);
    const cleaningsLeft = Math.max(0, 2 - cleaningsUsed);
    const allCleanings = db_getCleanings(selectedPatient.id);
    const statusFlow = ["presented","signed","paid"];
    const statusLabels = { presented:"Presented", signed:"Signed", paid:"Paid" };
    const statusColors = { presented:{ bg:LIGHT_BLUE, text:BLUE }, signed:{ bg:GOLD_BG, text:GOLD }, paid:{ bg:GREEN_BG, text:GREEN } };
    const [confirmDelete, setConfirmDelete] = useState(false);
    return (
      <div style={{ minHeight:"100vh", background:"#f7f9fb", fontFamily:"'Segoe UI', system-ui, sans-serif" }}>
        <div style={{ background:BLUE, padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <button onClick={() => setSelectedPatient(null)} style={TB}>{"\u2190"} Back</button>
          <div style={{ color:"white", fontSize:16, fontWeight:700 }}>{selectedPatient.first_name} {selectedPatient.last_name}</div>
          <button onClick={() => { setAppMode("treatment"); setPatientName(`${selectedPatient.first_name} ${selectedPatient.last_name}`); if (pe) setPatientEmail(pe); if (selectedPatient.phone) setPatientPhone(selectedPatient.phone); setSelectedPatient(null); }} style={TB}>+ Plan</button>
        </div>
        <div style={{ padding:16, maxWidth:480, margin:"0 auto" }}>
          {/* Patient Info */}
          <div style={CS}><div style={SL}>Patient Info</div>
            {[["Phone", selectedPatient.phone], ["Email", pe]].map(([l,v]) => v ? <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"6px 0", borderBottom:"1px solid #f0f0f0" }}><span style={{ color:GRAY }}>{l}</span><span style={{ fontWeight:600 }}>{v}</span></div> : null)}
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"6px 0" }}><span style={{ color:GRAY }}>Added</span><span style={{ fontWeight:600 }}>{fmtDate(selectedPatient.created_at)}</span></div>
          </div>

          {/* In-Office Cleaning Plan — completely separate section */}
          <div style={{ ...CS, border: isOnPlan ? `2px solid ${GOLD}` : "none" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: isOnPlan ? 14 : 0 }}>
              <div style={SL}>{"\u2B50"} In-Office Cleaning Plan</div>
              {isOnPlan
                ? <button onClick={() => { db_unenrollPlan(selectedPatient.id); setSelectedPatient({...selectedPatient, plan_status:"none"}); setForceRefresh(p=>p+1); }} style={{ fontSize:11, color:RED, background:"none", border:`1px solid ${RED}`, borderRadius:6, padding:"4px 10px", cursor:"pointer", fontWeight:600 }}>Remove</button>
                : <button onClick={() => { db_enrollPlan(selectedPatient.id); setSelectedPatient({...selectedPatient, plan_status:"active", plan_start_date: new Date().toISOString().split("T")[0]}); setForceRefresh(p=>p+1); }} style={{ fontSize:12, color:"white", background:GOLD, border:"none", borderRadius:8, padding:"8px 14px", cursor:"pointer", fontWeight:700 }}>Enroll in Plan</button>
              }
            </div>
            {isOnPlan && (<>
              <div style={{ display:"flex", gap:10, marginBottom:12 }}>
                <div style={{ flex:1, background:cleaningsLeft > 0 ? GREEN_BG : "#FFF3F3", borderRadius:10, padding:"12px 14px", textAlign:"center" }}>
                  <div style={{ fontSize:24, fontWeight:800, color: cleaningsLeft > 0 ? GREEN : RED }}>{cleaningsLeft}</div>
                  <div style={{ fontSize:11, color:GRAY, marginTop:2 }}>cleanings left</div>
                  <div style={{ fontSize:10, color:"#999" }}>{new Date().getFullYear()}</div>
                </div>
                <div style={{ flex:1, background:LIGHT_BLUE, borderRadius:10, padding:"12px 14px", textAlign:"center" }}>
                  <div style={{ fontSize:24, fontWeight:800, color:BLUE }}>{cleaningsUsed}</div>
                  <div style={{ fontSize:11, color:GRAY, marginTop:2 }}>cleanings used</div>
                  <div style={{ fontSize:10, color:"#999" }}>of 2 per year</div>
                </div>
              </div>
              <button onClick={() => { db_addCleaning(selectedPatient.id); setForceRefresh(p=>p+1); }} disabled={cleaningsLeft === 0} style={{ width:"100%", padding:12, background: cleaningsLeft > 0 ? GREEN : "#ccc", color:"white", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor: cleaningsLeft > 0 ? "pointer" : "not-allowed", marginBottom: allCleanings.length > 0 ? 12 : 0 }}>
                {cleaningsLeft > 0 ? "\u2713 Log Cleaning Visit" : "All 2 cleanings used this year"}
              </button>
              {allCleanings.length > 0 && (<div>
                <div style={{ fontSize:11, fontWeight:600, color:GRAY, marginBottom:6 }}>Cleaning History</div>
                {allCleanings.map(c => <div key={c.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12, padding:"6px 0", borderBottom:"1px solid #f0f0f0" }}>
                  <span>{fmtDate(c.date)}</span>
                  <button onClick={() => { db_removeCleaning(c.id); setForceRefresh(p=>p+1); }} style={{ fontSize:10, color:RED, background:"none", border:"none", cursor:"pointer" }}>{"\u2715"} remove</button>
                </div>)}
              </div>)}
              {selectedPatient.plan_start_date && <div style={{ fontSize:11, color:GRAY, marginTop:8 }}>Member since {fmtDate(selectedPatient.plan_start_date)}</div>}
            </>)}
            {!isOnPlan && <div style={{ fontSize:12, color:GRAY, marginTop:8 }}>Not currently enrolled. Enroll to track 2 cleanings per year.</div>}
          </div>

          {/* Quick Actions */}
          <div style={{ display:"flex", gap:8, marginBottom:14 }}>
            <button onClick={() => { setAppMode("treatment"); setPatientName(`${selectedPatient.first_name} ${selectedPatient.last_name}`); if (pe) setPatientEmail(pe); if (selectedPatient.phone) setPatientPhone(selectedPatient.phone); setSelectedPatient(null); }} style={{ flex:1, padding:"14px 12px", background:BLUE, color:"white", border:"none", borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer" }}>{"\u{1F4CB}"} Treatment Plan</button>
            <button onClick={() => { setAppMode("warranty"); setWName(`${selectedPatient.first_name} ${selectedPatient.last_name}`); setSelectedPatient(null); }} style={{ flex:1, padding:"14px 12px", background:"white", color:DARK, border:`2px solid ${BLUE}`, borderRadius:12, fontSize:14, fontWeight:700, cursor:"pointer" }}>{"\u{1F6E1}\uFE0F"} Warranty</button>
          </div>

          {/* Treatment History */}
          <div style={CS}><div style={SL}>Treatment History</div>
            {pts.length === 0 && <div style={{ fontSize:13, color:GRAY }}>No records yet.</div>}
            {pts.map(t => { const sc = statusColors[t.status]||statusColors.presented; return <div key={t.id} style={{ background:"#f7f9fb", borderRadius:10, padding:"12px 14px", marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}><div style={{ fontSize:14, fontWeight:700, color:DARK }}>{t.type}</div>{t.cost > 0 && <div style={{ fontSize:13, fontWeight:700, color:BLUE }}>${parseFloat(t.cost).toFixed(2)}</div>}</div>
              {t.summary && <div style={{ fontSize:12, color:GRAY, marginBottom:8, lineHeight:1.4 }}>{t.summary}</div>}
              <div style={{ fontSize:11, color:GRAY, marginBottom:8 }}>{fmtDate(t.created_at)}</div>
              <div style={{ display:"flex", gap:6, marginBottom:8 }}>{statusFlow.map(s => { const active = t.status===s; const done = statusFlow.indexOf(t.status)>statusFlow.indexOf(s); return <button key={s} onClick={() => { db_updateTreatmentStatus(t.id, s); setForceRefresh(p=>p+1); }} style={{ flex:1, padding:"6px 4px", borderRadius:8, border:`1.5px solid ${active||done?sc.text:"#ddd"}`, background:active?sc.bg:done?"#f0f0f0":"white", color:active?sc.text:GRAY, fontSize:12, fontWeight:active?700:400, cursor:"pointer" }}>{done?"\u2713 ":""}{statusLabels[s]}</button>; })}</div>
              {/* Send Receipt button */}
              <button onClick={() => {
                setRcptName(`${selectedPatient.first_name} ${selectedPatient.last_name}`);
                if (pe) setRcptEmail(pe);
                if (selectedPatient.phone) setRcptPhone(selectedPatient.phone);
                if (t.items && t.items.length > 0) {
                  setRcptItems(t.items.map((item, idx) => ({ id: idx + 1, desc: item.desc, amount: item.amount })));
                } else if (t.summary) {
                  setRcptItems([{ id: 1, desc: t.type + (t.summary ? " - " + t.summary.split("|")[0].trim() : ""), amount: String(t.cost || 0) }]);
                }
                setSelectedPatient(null);
                setAppMode("receipt");
              }} style={{ width:"100%", padding:"8px 12px", background:"white", color:GREEN, border:`1.5px solid ${GREEN}`, borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer" }}>{"\u{1F9FE}"} Send Receipt</button>
            </div>; })}
          </div>

          {/* Notes */}
          <div style={CS}><div style={SL}>Notes</div>
            {notes.map(n => <div key={n.id} style={{ background:"#f7f9fb", borderRadius:8, padding:"10px 12px", marginBottom:8 }}><div style={{ fontSize:13 }}>{n.note}</div><div style={{ fontSize:11, color:GRAY, marginTop:4 }}>{fmtDate(n.created_at)}</div></div>)}
            <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..." style={{ width:"100%", padding:"10px 12px", border:"1.5px solid #e0e0e0", borderRadius:10, fontSize:14, resize:"vertical", minHeight:80, boxSizing:"border-box", marginTop:8 }} />
            <button onClick={() => { if (newNote.trim()) { db_saveNote(selectedPatient.id, newNote.trim()); setNewNote(""); setForceRefresh(p=>p+1); } }} disabled={!newNote.trim()} style={{ width:"100%", padding:14, background:newNote.trim()?BLUE:"#ccc", color:"white", border:"none", borderRadius:10, fontSize:15, fontWeight:700, cursor:newNote.trim()?"pointer":"not-allowed", marginTop:8 }}>Save Note</button>
          </div>

          {/* Delete Patient */}
          <div style={{ marginTop:8, marginBottom:24 }}>
            {!confirmDelete
              ? <button onClick={() => setConfirmDelete(true)} style={{ width:"100%", padding:14, background:"white", color:RED, border:`1.5px solid ${RED}`, borderRadius:12, fontSize:14, fontWeight:600, cursor:"pointer" }}>Delete Patient</button>
              : <div style={{ background:"#FFF3F3", border:`1.5px solid ${RED}`, borderRadius:12, padding:16 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:RED, marginBottom:8 }}>Delete {selectedPatient.first_name} {selectedPatient.last_name}?</div>
                  <div style={{ fontSize:12, color:GRAY, marginBottom:12 }}>This will permanently remove their profile, all treatment records, notes, and cleaning history.</div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={() => setConfirmDelete(false)} style={{ flex:1, padding:12, background:"#f0f0f0", border:"none", borderRadius:8, fontSize:14, cursor:"pointer" }}>Cancel</button>
                    <button onClick={() => { db_deletePatient(selectedPatient.id); setSelectedPatient(null); setForceRefresh(p=>p+1); }} style={{ flex:1, padding:12, background:RED, color:"white", border:"none", borderRadius:8, fontSize:14, fontWeight:700, cursor:"pointer" }}>Delete</button>
                  </div>
                </div>
            }
          </div>
        </div>
      </div>
    );
  }

  // ===========================
  // RECEIPT GENERATOR (appMode === "receipt")
  // ===========================
  if (appMode === "receipt") {
    if (rcptShowPreview) {
      const rcptNum = `BFD-${Date.now().toString().slice(-8)}`;
      const rcptEmailBody = `Dear ${rcptName},\n\nThank you for your payment at Buchwald Family Dentistry.\n\nReceipt #: ${rcptNum}\nDate: ${rcptDate}\nPayment: ${rcptPayMethod}\n\nServices:\n${rcptItems.filter(i=>i.desc).map(i=>`  ${i.desc}: $${(parseFloat(i.amount)||0).toFixed(2)}`).join("\n")}${rcptCCFee>0?`\n\nCredit Card Processing Fee (3%): +$${rcptCCFee.toFixed(2)}`:""}${rcptDiscNum>0?`\nDiscount: -$${rcptDiscNum.toFixed(2)}`:""}${rcptInsNum>0?`\nInsurance Applied: -$${rcptInsNum.toFixed(2)}`:""}\n\nTotal Paid: $${rcptTotal.toFixed(2)}${rcptNote?`\n\nNote: ${rcptNote}`:""}\n\nThis receipt may be used for insurance reimbursement or tax deduction purposes.\n\nThank you for choosing Buchwald Family Dentistry!\n\n---\nDr. Max Buchwald Jr, DDS\nBuchwald Family Dentistry & Orthodontics\n300 N. Coit Rd, Ste 245, Richardson, TX 75080\n(972) 644-3280 | buchwaldfamilydentistry.com`;
      return (<div style={{ background:"#f0f0f0", minHeight:"100vh", fontFamily:"Arial, sans-serif" }}>
        <style>{`@media screen { .no-print { display: flex !important; } .print-page { width: 8.5in; max-width: 100%; margin: 0 auto 20px; background: white; box-shadow: 0 2px 12px rgba(0,0,0,0.15); padding: 0.5in 0.75in; } } @media print { .no-print { display: none !important; } .print-page { width: 8.5in; padding: 0.5in 0.75in; margin: 0; box-shadow: none; } }`}</style>
        <div className="no-print" style={{ display:"none", position:"sticky", top:0, zIndex:100, background:GREEN, padding:"10px 16px", justifyContent:"space-between", alignItems:"center" }}>
          <button onClick={() => setRcptShowPreview(false)} style={TB}>{"\u2190"} Edit</button>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={() => openGmail(rcptEmail, `Payment Receipt #${rcptNum} - Buchwald Family Dentistry`, rcptEmailBody)} style={TB}>{"\u2709\uFE0F"} Email</button>
            <button onClick={() => savePDF("rcpt-pdf", `Receipt_${rcptName||"Patient"}.pdf`)} style={TB}>{"\u2B07\uFE0F"} PDF</button>
            <button onClick={() => window.print()} style={{ background:"white", color:GREEN, border:"none", borderRadius:8, padding:"8px 16px", fontSize:14, fontWeight:700, cursor:"pointer" }}>Print</button>
          </div>
        </div>
        <div id="rcpt-pdf"><div className="print-page">
          {/* NICE RECEIPT */}
          <div style={{ textAlign:"center", marginBottom:8 }}><Logo width={180} /></div>
          <div style={{ textAlign:"center", fontSize:10, color:GRAY, marginBottom:4 }}>300 N. Coit Rd, Ste 245, Richardson, TX 75080 | buchwaldfamilydentistry.com</div>
          <div style={{ borderBottom:`3px solid ${BLUE}`, marginBottom:16 }} />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
            <div>
              <div style={{ fontSize:24, fontWeight:800, color:BLUE, letterSpacing:"-0.5px" }}>RECEIPT</div>
              <div style={{ fontSize:11, color:GRAY, marginTop:4 }}>#{rcptNum}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:12, color:GRAY }}>Date</div>
              <div style={{ fontSize:14, fontWeight:700 }}>{rcptDate}</div>
              <div style={{ fontSize:12, color:GRAY, marginTop:8 }}>Payment Method</div>
              <div style={{ fontSize:14, fontWeight:600, textTransform:"capitalize" }}>{rcptPayMethod}</div>
            </div>
          </div>
          {/* Patient box */}
          <div style={{ background:"#f7f9fb", borderRadius:8, padding:"14px 18px", marginBottom:20, borderLeft:`4px solid ${BLUE}` }}>
            <div style={{ fontSize:10, fontWeight:700, color:GRAY, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Bill To</div>
            <div style={{ fontSize:16, fontWeight:700, color:DARK }}>{rcptName}</div>
            {rcptEmail && <div style={{ fontSize:12, color:GRAY, marginTop:2 }}>{rcptEmail}</div>}
            {rcptPhone && <div style={{ fontSize:12, color:GRAY }}>{rcptPhone}</div>}
          </div>
          {/* Items table */}
          <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:20 }}>
            <thead><tr>
              <th style={{ background:BLUE, color:"white", padding:"8px 12px", textAlign:"left", fontSize:11, fontWeight:700, borderRadius:"6px 0 0 0" }}>Description</th>
              <th style={{ background:BLUE, color:"white", padding:"8px 12px", textAlign:"right", fontSize:11, fontWeight:700, borderRadius:"0 6px 0 0" }}>Amount</th>
            </tr></thead>
            <tbody>
              {rcptItems.filter(i=>i.desc).map((i,idx) => <tr key={idx} style={{ background:idx%2===0?"white":"#f9fbfc" }}>
                <td style={{ padding:"10px 12px", borderBottom:"1px solid #eee", fontSize:12 }}>{i.desc}</td>
                <td style={{ padding:"10px 12px", borderBottom:"1px solid #eee", textAlign:"right", fontSize:12, fontWeight:600 }}>${(parseFloat(i.amount)||0).toFixed(2)}</td>
              </tr>)}
            </tbody>
          </table>
          {/* Totals */}
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:24 }}>
            <div style={{ width:240 }}>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", fontSize:12, color:GRAY }}><span>Subtotal</span><span style={{ fontWeight:600, color:DARK }}>${rcptSubtotal.toFixed(2)}</span></div>
              {rcptCCFee > 0 && <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", fontSize:12, color:DARK }}><span>Credit Card Fee (3%)</span><span style={{ fontWeight:600 }}>+${rcptCCFee.toFixed(2)}</span></div>}
              {rcptDiscNum > 0 && <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", fontSize:12, color:GREEN }}><span>Discount</span><span style={{ fontWeight:600 }}>-${rcptDiscNum.toFixed(2)}</span></div>}
              {rcptInsNum > 0 && <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", fontSize:12, color:GRAY }}><span>Insurance Applied</span><span style={{ fontWeight:600 }}>-${rcptInsNum.toFixed(2)}</span></div>}
              <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0 6px", fontSize:16, fontWeight:800, color:DARK, borderTop:`2px solid ${DARK}`, marginTop:4 }}><span>Total Paid</span><span>${rcptTotal.toFixed(2)}</span></div>
            </div>
          </div>
          {/* Paid stamp */}
          <div style={{ background:`linear-gradient(135deg, ${GREEN} 0%, #1a7a3a 100%)`, borderRadius:12, padding:"20px 24px", textAlign:"center", marginBottom:20 }}>
            <div style={{ fontSize:20, fontWeight:800, color:"white", letterSpacing:2 }}>{"\u2713"} PAID IN FULL</div>
          </div>
          {rcptNote && <div style={{ background:"#f7f9fb", borderRadius:8, padding:"12px 16px", marginBottom:20, fontSize:11, color:GRAY, borderLeft:`3px solid ${GOLD}` }}><b style={{ color:DARK }}>Note:</b> {rcptNote}</div>}
          <div style={{ background:"#f7f9fb", borderRadius:8, padding:"12px 16px", marginBottom:16, fontSize:9.5, color:GRAY, lineHeight:1.6 }}>
            <div style={{ fontWeight:700, color:DARK, fontSize:10, marginBottom:4 }}>Provider Information</div>
            <div>Dr. Max Buchwald Jr, DDS</div>
            <div>Buchwald Family Dentistry & Orthodontics</div>
            <div>300 N. Coit Rd, Ste 245, Richardson, TX 75080</div>
            <div>(972) 644-3280 | buchwaldfamilydentistry.com</div>
          </div>
          <div style={{ fontSize:9, color:"#999", lineHeight:1.5, textAlign:"center", marginBottom:12 }}>
            <div>This receipt may be used for insurance reimbursement or tax deduction purposes.</div>
            <div>Please retain for your records. Thank you for choosing Buchwald Family Dentistry!</div>
          </div>
        </div></div>
      </div>);
    }
    // Receipt form
    return (<div style={{ minHeight:"100vh", background:"#f7f9fb", fontFamily:"'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ background:GREEN, padding:"14px 20px", display:"flex", alignItems:"center", gap:12 }}><button onClick={() => { resetReceipt(); setAppMode(null); }} style={TB}>{"\u2190"} Back</button><div style={{ color:"white", fontSize:16, fontWeight:700 }}>{"\u{1F9FE}"} Receipt Generator</div></div>
      <div style={{ padding:"20px 16px", maxWidth:480, margin:"0 auto" }}>
        <div style={CS}><div style={SL}>Patient Info</div>
          <label style={LS}>Patient Name</label><input type="text" value={rcptName} onChange={e => setRcptName(e.target.value)} placeholder="First Last" style={IS} />
          <label style={LS}>Email <span style={{ fontWeight:400, color:"#999" }}>(for emailing receipt)</span></label><input type="email" value={rcptEmail} onChange={e => setRcptEmail(e.target.value)} placeholder="patient@email.com" style={IS} />
          <label style={LS}>Phone <span style={{ fontWeight:400, color:"#999" }}>(optional)</span></label><input type="tel" value={rcptPhone} onChange={e => setRcptPhone(e.target.value)} placeholder="(555) 123-4567" style={IS} />
          <label style={LS}>Date</label><input type="text" value={rcptDate} onChange={e => setRcptDate(e.target.value)} style={IS} />
        </div>
        <div style={CS}><div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}><div style={SL}>Services / Items</div><button onClick={() => setRcptItems(p => [...p, { id: Date.now(), desc:"", amount:"" }])} style={{ background:LIGHT_BLUE, color:BLUE, border:`1.5px solid ${BLUE}`, borderRadius:8, padding:"6px 12px", fontSize:13, fontWeight:700, cursor:"pointer" }}>+ Add</button></div>
          {rcptItems.map((item, idx) => <div key={item.id} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"center" }}>
            <input type="text" value={item.desc} onChange={e => setRcptItems(p => p.map(i => i.id===item.id ? {...i, desc:e.target.value} : i))} placeholder="Crown #14, Cleaning..." style={{ ...IS, flex:1, padding:"10px 12px" }} />
            <div style={{ position:"relative", flex:"0 0 100px" }}><span style={{ ...DS, left:10 }}>$</span><input type="number" inputMode="decimal" value={item.amount} onChange={e => setRcptItems(p => p.map(i => i.id===item.id ? {...i, amount:e.target.value} : i))} placeholder="0" style={{ ...IS, padding:"10px 12px 10px 24px" }} /></div>
            {rcptItems.length > 1 && <button onClick={() => setRcptItems(p => p.filter(i => i.id !== item.id))} style={{ background:"none", border:"none", color:RED, fontSize:18, cursor:"pointer" }}>{"\u00D7"}</button>}
          </div>)}
        </div>
        <div style={CS}><div style={SL}>Payment Details</div>
          <label style={LS}>Payment Method</label>
          <select value={rcptPayMethod} onChange={e => setRcptPayMethod(e.target.value)} style={{ ...IS, appearance:"auto" }}><option value="debit">Debit</option><option value="cash">Cash</option><option value="check">Check</option><option value="credit card">Credit Card</option><option value="CareCredit">CareCredit</option><option value="Cherry">Cherry</option><option value="insurance">Insurance</option></select>
          {/* CC Surcharge Toggle */}
          <div onClick={() => setRcptCCSurcharge(!rcptCCSurcharge)} style={{ display:"flex", alignItems:"center", gap:10, marginTop:14, marginBottom:4, cursor:"pointer", padding:"10px 14px", background:rcptCCSurcharge?GOLD_BG:"#f7f9fb", border:`1.5px solid ${rcptCCSurcharge?GOLD:"#e0e0e0"}`, borderRadius:10 }}>
            <div style={{ width:42, height:24, borderRadius:12, background:rcptCCSurcharge?GOLD:"#ccc", position:"relative", flexShrink:0 }}><div style={{ width:20, height:20, borderRadius:10, background:"white", position:"absolute", top:2, left:rcptCCSurcharge?20:2, transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }} /></div>
            <div><div style={{ fontSize:14, fontWeight:700, color:rcptCCSurcharge?GOLD:DARK }}>Add 3% Credit Card Fee</div>{rcptCCSurcharge && rcptSubtotal > 0 && <div style={{ fontSize:12, color:GOLD }}>+${rcptCCFee.toFixed(2)}</div>}</div>
          </div>
          <label style={LS}>Discount <span style={{ fontWeight:400, color:"#999" }}>(optional)</span></label><div style={{ position:"relative" }}><span style={DS}>$</span><input type="number" inputMode="decimal" value={rcptDiscount} onChange={e => setRcptDiscount(e.target.value)} placeholder="0" style={{ ...IS, paddingLeft:28 }} /></div>
          <label style={LS}>Insurance Applied <span style={{ fontWeight:400, color:"#999" }}>(optional)</span></label><div style={{ position:"relative" }}><span style={DS}>$</span><input type="number" inputMode="decimal" value={rcptInsurance} onChange={e => setRcptInsurance(e.target.value)} placeholder="0" style={{ ...IS, paddingLeft:28 }} /></div>
          <label style={LS}>Note <span style={{ fontWeight:400, color:"#999" }}>(optional - prints on receipt)</span></label><input type="text" value={rcptNote} onChange={e => setRcptNote(e.target.value)} placeholder="Next appointment, follow-up..." style={IS} />
          {rcptSubtotal > 0 && <div style={{ marginTop:16, background:"#f7f9fb", borderRadius:10, padding:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:14, fontWeight:600, color:DARK, marginBottom:4 }}><span>Subtotal</span><span>${rcptSubtotal.toFixed(2)}</span></div>
            {rcptCCFee > 0 && <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:GOLD, marginBottom:4 }}><span>CC Fee (3%)</span><span>+${rcptCCFee.toFixed(2)}</span></div>}
            {rcptDiscNum > 0 && <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:GREEN, marginBottom:4 }}><span>Discount</span><span>-${rcptDiscNum.toFixed(2)}</span></div>}
            {rcptInsNum > 0 && <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:GRAY, marginBottom:4 }}><span>Insurance</span><span>-${rcptInsNum.toFixed(2)}</span></div>}
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:16, fontWeight:800, color:GREEN, background:GREEN_BG, margin:"6px -8px 0", padding:"10px 8px", borderRadius:"0 0 8px 8px" }}><span>Total</span><span>${rcptTotal.toFixed(2)}</span></div>
          </div>}
        </div>
        <button onClick={() => setRcptShowPreview(true)} disabled={!rcptName || !rcptItems.some(i => i.desc && i.amount)} style={{ width:"100%", padding:16, background:rcptName && rcptItems.some(i => i.desc && i.amount) ? GREEN : "#ccc", color:"white", border:"none", borderRadius:12, fontSize:16, fontWeight:700, cursor:"pointer", marginBottom:24 }}>Generate Receipt</button>
      </div>
    </div>);
  }

  // ===========================
  // HUB
  // ===========================
  if (appMode === null) {
    const patients = db_getPatients();
    const filtered = patients.filter(p => `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()) || (p.phone||"").includes(search) || (p.email||"").includes(search));
    const members = patients.filter(p => p.plan_status === "active");
    const today = new Date().toDateString();
    const allTreatments = db_getAllTreatments();
    const tpCount = allTreatments.filter(t => t.type === "Treatment Plan").length;
    const todayCount = patients.filter(p => new Date(p.created_at).toDateString() === today).length;

    return (
      <div style={{ minHeight:"100vh", background:"#f7f9fb", fontFamily:"'Segoe UI', system-ui, sans-serif" }}>
        <style>{`@media print { body { display: none; } }`}</style>
        <div style={{ background:BLUE, padding:"14px 20px", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:34, height:34, background:"white", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}><img src="/logo.png" alt="" style={{ width:30, height:"auto" }} /></div>
          <div><div style={{ color:"white", fontSize:15, fontWeight:700 }}>Buchwald Family Dentistry</div><div style={{ color:"rgba(255,255,255,0.65)", fontSize:11 }}>Staff Hub</div></div>
        </div>
        <div style={{ background:"white", borderBottom:"1px solid #e8e8e8", display:"flex" }}>
          {[["home","\u{1F3E0}","Home"],["records","\u{1F4C1}","Patients"],["members","\u2B50","In-Office Plan"]].map(([t,i,l]) => <button key={t} onClick={() => setHubTab(t)} style={{ flex:1, padding:"12px 4px", background:"none", border:"none", borderBottom:hubTab===t?`3px solid ${BLUE}`:"3px solid transparent", color:hubTab===t?BLUE:GRAY, fontSize:11, fontWeight:hubTab===t?700:400, cursor:"pointer" }}>{i} {l}</button>)}
        </div>
        <div style={{ padding:16, maxWidth:480, margin:"0 auto" }}>
          {hubTab === "home" && (<>
            {/* CLICKABLE STATS */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
              <div onClick={() => setHubTab("members")} style={{ background:"white", borderRadius:12, padding:"16px 14px", boxShadow:"0 1px 3px rgba(0,0,0,0.07)", cursor:"pointer", borderLeft:`4px solid ${GOLD}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}><span style={{ fontSize:28, fontWeight:800, color:DARK }}>{members.length}</span><span style={{ fontSize:22 }}>{"\u2B50"}</span></div>
                <div style={{ fontSize:12, fontWeight:600, color:GRAY, marginTop:4 }}>In-Office Plan Members</div>
                <div style={{ fontSize:10, color:"#999", marginTop:2 }}>2 cleanings/yr coverage</div>
              </div>
              <div onClick={() => setHubTab("records")} style={{ background:"white", borderRadius:12, padding:"16px 14px", boxShadow:"0 1px 3px rgba(0,0,0,0.07)", cursor:"pointer", borderLeft:`4px solid ${BLUE}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}><span style={{ fontSize:28, fontWeight:800, color:DARK }}>{tpCount}</span><span style={{ fontSize:22 }}>{"\u{1F4CB}"}</span></div>
                <div style={{ fontSize:12, fontWeight:600, color:GRAY, marginTop:4 }}>Treatment Plans</div>
                <div style={{ fontSize:10, color:"#999", marginTop:2 }}>All time</div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              <div onClick={() => setHubTab("records")} style={{ background:"white", borderRadius:12, padding:"16px 14px", boxShadow:"0 1px 3px rgba(0,0,0,0.07)", cursor:"pointer", borderLeft:`4px solid ${GREEN}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}><span style={{ fontSize:28, fontWeight:800, color:DARK }}>{todayCount}</span><span style={{ fontSize:22 }}>{"\u{1F4C5}"}</span></div>
                <div style={{ fontSize:12, fontWeight:600, color:GRAY, marginTop:4 }}>Added Today</div>
              </div>
              <div onClick={() => setHubTab("records")} style={{ background:"white", borderRadius:12, padding:"16px 14px", boxShadow:"0 1px 3px rgba(0,0,0,0.07)", cursor:"pointer", borderLeft:`4px solid #8B5CF6` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}><span style={{ fontSize:28, fontWeight:800, color:DARK }}>{patients.length}</span><span style={{ fontSize:22 }}>{"\u{1F465}"}</span></div>
                <div style={{ fontSize:12, fontWeight:600, color:GRAY, marginTop:4 }}>Total Patients</div>
              </div>
            </div>

            <div style={{ fontSize:12, fontWeight:700, color:GRAY, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>Quick Actions</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              <button onClick={() => setAppMode("treatment")} style={{ padding:"18px 16px", background:BLUE, border:"none", borderRadius:14, cursor:"pointer", textAlign:"left", color:"white" }}><div style={{ fontSize:22, marginBottom:6 }}>{"\u{1F4CB}"}</div><div style={{ fontSize:14, fontWeight:700 }}>Treatment Plan</div><div style={{ fontSize:11, opacity:0.8, marginTop:2 }}>New form</div></button>
              <button onClick={() => setAppMode("warranty")} style={{ padding:"18px 16px", background:"white", border:"2px solid #e0e0e0", borderRadius:14, cursor:"pointer", textAlign:"left" }}><div style={{ fontSize:22, marginBottom:6 }}>{"\u{1F6E1}\uFE0F"}</div><div style={{ fontSize:14, fontWeight:700, color:DARK }}>Lifetime Warranty</div><div style={{ fontSize:11, color:GRAY, marginTop:2 }}>New form</div></button>
              <button onClick={() => setAppMode("receipt")} style={{ padding:"18px 16px", background:"white", border:"2px solid #e0e0e0", borderRadius:14, cursor:"pointer", textAlign:"left" }}><div style={{ fontSize:22, marginBottom:6 }}>{"\u{1F9FE}"}</div><div style={{ fontSize:14, fontWeight:700, color:DARK }}>Receipt</div><div style={{ fontSize:11, color:GRAY, marginTop:2 }}>Generate & email</div></button>
              <button onClick={() => setHubTab("records")} style={{ padding:"18px 16px", background:"white", border:"2px solid #e0e0e0", borderRadius:14, cursor:"pointer", textAlign:"left" }}><div style={{ fontSize:22, marginBottom:6 }}>{"\u{1F4C1}"}</div><div style={{ fontSize:14, fontWeight:700, color:DARK }}>Patient Records</div><div style={{ fontSize:11, color:GRAY, marginTop:2 }}>Search & history</div></button>
            </div>
            {patients.length > 0 && (<><div style={{ fontSize:12, fontWeight:700, color:GRAY, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>Recent Patients</div><div style={{ background:"white", borderRadius:12, boxShadow:"0 1px 3px rgba(0,0,0,0.07)", overflow:"hidden" }}>{patients.slice(0,5).map((p,i) => <div key={p.id} onClick={() => setSelectedPatient(p)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderBottom:i<4?"1px solid #f0f0f0":"none", cursor:"pointer" }}><div><span style={{ fontSize:13, fontWeight:600, color:DARK }}>{p.first_name} {p.last_name}</span>{p.plan_status==="active"&&<span style={{ background:GREEN_BG, color:GREEN, fontSize:9, fontWeight:700, padding:"2px 6px", borderRadius:10, marginLeft:8 }}>Plan</span>}</div><span style={{ fontSize:11, color:GRAY }}>{timeAgo(p.created_at)}</span></div>)}</div></>)}
          </>)}

          {hubTab === "records" && (<>
            <div style={{ fontSize:15, fontWeight:700, color:DARK, marginBottom:12 }}>All Patients <span style={{ color:BLUE }}>({patients.length})</span></div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, phone..." style={{ width:"100%", padding:"11px 14px", border:"1.5px solid #e0e0e0", borderRadius:10, fontSize:15, marginBottom:12, boxSizing:"border-box" }} />
            {filtered.map(p => <div key={p.id} onClick={() => setSelectedPatient(p)} style={{ background:"white", borderRadius:12, padding:"14px 16px", marginBottom:10, boxShadow:"0 1px 3px rgba(0,0,0,0.07)", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}><div><div style={{ fontSize:15, fontWeight:700, color:DARK }}>{p.first_name} {p.last_name}</div>{p.phone && <div style={{ fontSize:12, color:GRAY, marginTop:2 }}>{p.phone}</div>}{p.email && <div style={{ fontSize:12, color:GRAY }}>{p.email}</div>}</div><div style={{ display:"flex", gap:6 }}>{p.plan_status === "active" && <div style={{ background:GREEN_BG, color:GREEN, fontSize:10, fontWeight:700, padding:"4px 8px", borderRadius:20 }}>Plan</div>}</div></div>)}
            {filtered.length === 0 && <div style={{ textAlign:"center", color:GRAY, padding:20, fontSize:13 }}>No patients found</div>}
          </>)}

          {hubTab === "members" && (<>
            <div style={{ fontSize:15, fontWeight:700, color:DARK, marginBottom:4 }}>In-Office Plan Members <span style={{ color:BLUE }}>({members.length})</span></div>
            <div style={{ fontSize:12, color:GRAY, marginBottom:12 }}>Members enrolled in the in-office dental plan (2 cleanings/yr)</div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..." style={{ width:"100%", padding:"11px 14px", border:"1.5px solid #e0e0e0", borderRadius:10, fontSize:15, marginBottom:12, boxSizing:"border-box" }} />
            {members.filter(p => `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())).map(p => { const cu = db_getCleaningsThisYear(p.id); const cl = Math.max(0, 2 - cu); return <div key={p.id} onClick={() => setSelectedPatient(p)} style={{ background:"white", borderRadius:12, padding:"14px 16px", marginBottom:10, boxShadow:"0 1px 3px rgba(0,0,0,0.07)", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}><div><div style={{ fontSize:15, fontWeight:700, color:DARK }}>{p.first_name} {p.last_name}</div>{p.phone && <div style={{ fontSize:12, color:GRAY, marginTop:2 }}>{p.phone}</div>}{p.plan_start_date && <div style={{ fontSize:12, color:GRAY }}>Since {fmtDate(p.plan_start_date)}</div>}</div><div style={{ textAlign:"right" }}><div style={{ background: cl > 0 ? GREEN_BG : "#FFF3F3", color: cl > 0 ? GREEN : RED, fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:20 }}>{cl}/2 left</div></div></div>; })}
            {members.length === 0 && <div style={{ textAlign:"center", color:GRAY, padding:20, fontSize:13 }}>No plan members yet. Open a patient profile and tap "Enroll in Plan" to add them.</div>}
          </>)}
        </div>
      </div>
    );
  }

  // ===========================
  // WARRANTY (unchanged structure, just email fix)
  // ===========================
  if (appMode === "warranty" && wCollectSig && !wPreview) {
    return (<div style={{ minHeight:"100vh", background:"#f7f9fb", fontFamily:"'Segoe UI', system-ui, sans-serif" }}><div style={{ background:BLUE, padding:"14px 20px", display:"flex", alignItems:"center", gap:12 }}><button onClick={() => setWCollectSig(false)} style={TB}>{"\u2190"} Back</button><div style={{ color:"white", fontSize:16, fontWeight:700 }}>Collect Signature</div></div>
      <div style={{ padding:"24px 16px", maxWidth:480, margin:"0 auto" }}><div style={CS}>
        <div style={{ textAlign:"center", marginBottom:20 }}><div style={{ fontSize:18, fontWeight:700, color:DARK }}>Patient Signature</div><div style={{ fontSize:13, color:GRAY, marginTop:4 }}>Hand the device to the patient to sign</div></div>
        <div style={{ background:"#f7f9fb", borderRadius:10, padding:"12px 14px", marginBottom:20, fontSize:13 }}><div><b>Patient:</b> {wName}</div><div><b>Choice:</b> {wChoice==="agree"?"Agrees":"Waives"}</div><div><b>Treatments:</b> {wAllTreatments}</div></div>
        <SignaturePad key="w-sig" label="Sign here" onSave={d => setWSig(d)} onClear={() => setWSig(null)} />
        <button onClick={() => { setWCollectSig(false); setWPreview(true); }} disabled={!wSig} style={{ width:"100%", padding:16, border:"none", borderRadius:12, fontSize:16, fontWeight:700, cursor:wSig?"pointer":"not-allowed", background:wSig?BLUE:"#ccc", color:"white" }}>View Form</button>
      </div></div>
    </div>);
  }

  if (appMode === "warranty" && !wPreview) {
    return (<div style={{ minHeight:"100vh", background:"#f7f9fb", fontFamily:"'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ background:BLUE, padding:"14px 20px", display:"flex", alignItems:"center", gap:12 }}><button onClick={() => { resetWarranty(); setAppMode(null); }} style={TB}>{"\u2190"} Back</button><div><div style={{ color:"white", fontSize:16, fontWeight:700 }}>Buchwald Family Dentistry</div><div style={{ color:"rgba(255,255,255,0.65)", fontSize:11 }}>Lifetime Warranty Form</div></div></div>
      <div style={{ padding:"20px 16px", maxWidth:480, margin:"0 auto" }}>
        <div style={CS}><div style={SL}>Patient Info</div><label style={LS}>Patient Name</label><input type="text" value={wName} onChange={e => setWName(e.target.value)} placeholder="First Last" style={IS} /><label style={LS}>Date</label><input type="text" value={wDate} onChange={e => setWDate(e.target.value)} style={IS} /></div>
        <div style={CS}><div style={SL}>Treatments Under Warranty</div><div style={{ fontSize:12, color:GRAY, marginTop:6, marginBottom:14 }}>Select treatments and assign tooth numbers</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:12 }}>{WARRANTY_TREATMENTS.map(t => { const s = wSelTreatments.includes(t); return <button key={t} onClick={() => setWItems(p => { const e = p.find(x=>x.name===t); if (e) return p.filter(x=>x.name!==t); return [...p,{name:t,teeth:[]}]; })} style={{ padding:"8px 14px", borderRadius:20, border:`1.5px solid ${s?BLUE:"#ddd"}`, background:s?LIGHT_BLUE:"white", color:s?BLUE:GRAY, fontSize:13, fontWeight:s?600:400, cursor:"pointer" }}>{s&&"\u2713 "}{t}</button>; })}</div>
          {wItems.map(item => { const isP = WARRANTY_TREATMENTS.includes(item.name); const needsT = ["Crowns","Composite Fillings","Implants","Bridges","Veneers","Preventive Resin Restoration"].includes(item.name)||!isP;
            return <div key={item.name} style={{ background:"#f7f9fb", borderRadius:10, padding:"12px 14px", marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:needsT?8:0 }}><div style={{ fontSize:12, fontWeight:700, color:BLUE }}>{item.name}</div>{!isP && <button onClick={() => setWItems(p=>p.filter(x=>x.name!==item.name))} style={{ background:"none", border:"none", color:RED, fontSize:18, cursor:"pointer" }}>{"\u00D7"}</button>}</div>
              {item.teeth.length > 0 && <div style={{ fontSize:11, color:BLUE, fontWeight:600, marginBottom:6 }}>Teeth: #{item.teeth.join(", #")}</div>}
              {needsT && <div style={{ display:"grid", gridTemplateColumns:"repeat(8, 1fr)", gap:5 }}>{Array.from({length:32},(_,i)=>i+1).map(n => { const s = item.teeth.includes(n); return <button key={n} onClick={() => setWItems(p=>p.map(x=>x.name===item.name?{...x,teeth:x.teeth.includes(n)?x.teeth.filter(t=>t!==n):[...x.teeth,n].sort((a,b)=>a-b)}:x))} style={{ padding:"7px 0", borderRadius:8, border:`1.5px solid ${s?BLUE:"#ddd"}`, background:s?BLUE:"white", color:s?"white":DARK, fontSize:12, fontWeight:s?700:400, cursor:"pointer" }}>{n}</button>; })}</div>}
            </div>; })}
          <label style={{ ...LS, marginTop:wItems.length>0?8:0 }}>Add Custom</label><div style={{ display:"flex", gap:8 }}><input type="text" value={wCustom} onChange={e=>setWCustom(e.target.value)} placeholder="Other treatment..." style={{ ...IS, flex:1 }} onKeyDown={e=>{ if(e.key==="Enter"&&wCustom.trim()){ setWItems(p=>[...p,{name:wCustom.trim(),teeth:[]}]); setWCustom(""); }}} /><button onClick={()=>{ if(wCustom.trim()){ setWItems(p=>[...p,{name:wCustom.trim(),teeth:[]}]); setWCustom(""); }}} style={{ padding:"12px 16px", background:wCustom.trim()?BLUE:"#ccc", color:"white", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:wCustom.trim()?"pointer":"not-allowed", flexShrink:0 }}>+ Add</button></div>
        </div>
        <div style={CS}><div style={SL}>Patient Election</div><div style={{ marginTop:14 }}>
          <div onClick={()=>setWChoice("agree")} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"14px 16px", background:wChoice==="agree"?GREEN_BG:"#f7f9fb", border:`1.5px solid ${wChoice==="agree"?GREEN:"#e0e0e0"}`, borderRadius:10, cursor:"pointer", marginBottom:10 }}><div style={{ width:22, height:22, borderRadius:11, border:`2px solid ${wChoice==="agree"?GREEN:"#ccc"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>{wChoice==="agree"&&<div style={{ width:12,height:12,borderRadius:6,background:GREEN }} />}</div><div style={{ fontSize:13, lineHeight:1.5, color:DARK }}><b>I agree</b> to the above conditions for the warranty.</div></div>
          <div onClick={()=>setWChoice("waive")} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"14px 16px", background:wChoice==="waive"?"#FFF3F3":"#f7f9fb", border:`1.5px solid ${wChoice==="waive"?RED:"#e0e0e0"}`, borderRadius:10, cursor:"pointer" }}><div style={{ width:22, height:22, borderRadius:11, border:`2px solid ${wChoice==="waive"?RED:"#ccc"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>{wChoice==="waive"&&<div style={{ width:12,height:12,borderRadius:6,background:RED }} />}</div><div style={{ fontSize:13, lineHeight:1.5, color:DARK }}><b>I elect to waive</b> the warranty and release Buchwald Family Dentistry from obligation to replace or repair.</div></div>
        </div></div>
        <button onClick={() => { setWCollectSig(true); const [fn,...r]=wName.trim().split(" "); const ln=r.join(" ")||"-"; let p=db_findPatient(fn,ln); if(!p) p={id:crypto.randomUUID(),first_name:fn,last_name:ln}; db_savePatient(p); db_saveTreatment({patient_id:p.id,type:"Warranty Form",cost:0,status:"presented",summary:`${wAllTreatments} | ${wChoice==="agree"?"Agreed":"Waived"}`}); }} disabled={!wFormComplete} style={{ width:"100%", padding:16, background:wFormComplete?BLUE:"#ccc", color:"white", border:"none", borderRadius:12, fontSize:16, fontWeight:700, cursor:wFormComplete?"pointer":"not-allowed", marginBottom:24 }}>Collect Signature</button>
      </div>
    </div>);
  }

  if (appMode === "warranty" && wPreview) {
    return (<div style={{ background:"#f0f0f0", minHeight:"100vh", fontFamily:"Arial, sans-serif" }}>
      <style>{`@media screen { .no-print { display: flex !important; } .print-page { width: 8.5in; max-width: 100%; margin: 0 auto 20px; background: white; box-shadow: 0 2px 12px rgba(0,0,0,0.15); padding: 0.5in 0.75in; } } @media print { .no-print { display: none !important; } .print-page { width: 8.5in; padding: 0.5in 0.75in; margin: 0; box-shadow: none; } }`}</style>
      <div className="no-print" style={{ display:"none", position:"sticky", top:0, zIndex:100, background:BLUE, padding:"10px 16px", justifyContent:"space-between", alignItems:"center" }}>
        <button onClick={() => setWPreview(false)} style={TB}>{"\u2190"} Edit</button>
        <div style={{ display:"flex", gap:6 }}>
          {!wSig && <button onClick={() => { setWPreview(false); setWCollectSig(true); }} style={TB}>{"\u270D\uFE0F"} Sign</button>}
          <button onClick={() => openGmail("", `Lifetime Warranty - ${wName} - Buchwald Family Dentistry`, `Lifetime Warranty Form\n\nPatient: ${wName}\nDate: ${wDate}\n\nTreatments:\n${wItems.map(i=>`- ${i.name}${i.teeth.length>0?" (#"+i.teeth.join(", #")+")":""}`).join("\n")}\n\nElection: ${wChoice==="agree"?"Agreed":"Waived"}\n\n---\nBuchwald Family Dentistry & Orthodontics\nbuchwaldfamilydentistry.com`)} style={TB}>{"\u2709\uFE0F"} Email</button>
          <button onClick={resetWarranty} style={TB}>New</button>
          <button onClick={() => savePDF("w-pdf", `Warranty_${wName||"Form"}.pdf`)} style={TB}>{"\u2B07\uFE0F"} PDF</button>
          <button onClick={() => window.print()} style={{ background:"white", color:BLUE, border:"none", borderRadius:8, padding:"8px 16px", fontSize:14, fontWeight:700, cursor:"pointer" }}>Print</button>
        </div>
      </div>
      <div id="w-pdf"><div className="print-page">
        <div style={{ textAlign:"center", marginBottom:4 }}><Logo width={190} /></div><div style={{ borderBottom:`3px solid ${BLUE}`, marginBottom:10 }} />
        <div style={{ textAlign:"center", fontSize:19, fontWeight:700, color:BLUE, marginBottom:2 }}>Lifetime Dental Treatment Warranty</div>
        <div style={{ textAlign:"center", fontSize:11, color:GRAY, marginBottom:10 }}>Your Investment, Protected for Life</div>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10, fontSize:11.5 }}><div><b style={{ color:GRAY }}>Patient: </b><span style={{ borderBottom:"1px solid #999", display:"inline-block", minWidth:220 }}>{wName}</span></div><div><b style={{ color:GRAY }}>Date: </b><span style={{ borderBottom:"1px solid #999", display:"inline-block", minWidth:120 }}>{wDate}</span></div></div>
        <p style={{ fontSize:10.5, lineHeight:1.55, margin:"0 0 8px", color:DARK }}>At Buchwald Family Dentistry, we back our work with a <b style={{ color:BLUE }}>Lifetime Warranty</b>. If a warranted restoration fails under normal use, we will repair or replace it at no additional charge.</p>
        <div style={{ background:LIGHT_BLUE, border:`1.5px solid ${BLUE}`, borderRadius:4, padding:"6px 10px", marginBottom:8, fontSize:10, lineHeight:1.5 }}><div style={{ fontWeight:700, color:BLUE, fontSize:11, marginBottom:2 }}>Treatments Covered</div><p style={{ margin:0 }}>Crowns, Composite Fillings, Implants, Orthodontics (first 2 replacement retainers), PRR, Scaling & Root Planning, Bridges, and Veneers.</p></div>
        <div style={{ background:"#F9FBF2", border:"1.5px solid #8AAE2B", borderRadius:4, padding:"6px 10px", marginBottom:8, fontSize:10 }}><div style={{ fontWeight:700, color:"#5A7A10", fontSize:11, marginBottom:4 }}>What This Saves You</div><div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}><span>Crown replacement:</span><span style={{ fontWeight:700 }}>$2,500-$3,000</span></div><div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}><span>Implant crown:</span><span style={{ fontWeight:700 }}>$4,000-$6,000</span></div><div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px dashed #8AAE2B", paddingTop:3, marginTop:2 }}><span style={{ fontWeight:700, color:"#5A7A10" }}>With Warranty:</span><span style={{ fontWeight:700, color:"#5A7A10" }}>$0</span></div></div>
        <div style={{ fontSize:12, fontWeight:700, color:BLUE, marginBottom:4 }}>Your Lifetime Care Plan</div>
        <div style={{ paddingLeft:14, fontSize:10, lineHeight:1.65, marginBottom:6 }}><div style={{ marginBottom:2 }}>1. <b>Regular Cleanings</b> every 6-7 months</div><div style={{ marginBottom:2 }}>2. <b>Custom Nightguard</b> (starting at $400)</div><div style={{ marginBottom:2 }}>3. <b>Fluoride Treatment</b> twice/year</div><div style={{ marginBottom:2 }}>4. <b>Laser Bacterial Reduction</b> every 12 months</div><div style={{ marginBottom:2 }}>5. <b>InnerView Scan</b> every 6 months</div></div>
        <p style={{ fontSize:10, fontWeight:700, color:DARK, marginBottom:6, background:GOLD_BG, border:"1px solid #D4A017", borderRadius:3, padding:"4px 8px" }}>If any requirements are not maintained, warranty coverage will be voided.</p>
        <div style={{ fontSize:10, marginBottom:2, color:GRAY }}><b>Effective Date:</b> Coverage begins <b>5 years</b> from signature date.</div>
        <div style={{ fontSize:11.5, marginBottom:3, marginTop:8 }}><b>Treatment Under Warranty:</b></div>
        <div style={{ borderBottom:"1.5px solid #999", marginBottom:5, paddingBottom:3, fontSize:11.5, minHeight:18 }}>{wAllTreatments}</div><div style={{ borderBottom:"1.5px solid #999", marginBottom:10, minHeight:12 }} />
        <div style={{ marginBottom:8, fontSize:10.5, lineHeight:1.65 }}>
          <div style={{ marginBottom:6, display:"flex", alignItems:"flex-start", gap:8 }}><div style={{ width:45, borderBottom:"1.5px solid #999", flexShrink:0, marginTop:8, textAlign:"center" }}>{wChoice==="agree"&&<span style={{ fontSize:15, fontWeight:700 }}>{"\u2713"}</span>}</div><span><b>I agree</b> to the above conditions.</span></div>
          <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}><div style={{ width:45, borderBottom:"1.5px solid #999", flexShrink:0, marginTop:8, textAlign:"center" }}>{wChoice==="waive"&&<span style={{ fontSize:15, fontWeight:700 }}>{"\u2713"}</span>}</div><span><b>I elect to waive</b> the warranty.</span></div>
        </div>
        <div style={{ marginTop:24, display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}><div style={{ flex:"0 0 58%" }}>{wSig ? <><img src={wSig} alt="Sig" style={{ height:50, maxWidth:"80%" }} /><div style={{ borderTop:"1.5px solid #999", width:"90%", marginTop:-4 }} /></> : <div style={{ borderBottom:"1.5px solid #999", width:"90%", minHeight:36 }} />}<div style={{ fontSize:10, fontWeight:700, color:DARK, marginTop:4 }}>Signature</div></div><div style={{ flex:"0 0 38%" }}><div style={{ borderBottom:"1.5px solid #999", width:"100%", paddingBottom:4, fontSize:12, minHeight:16 }}>{wDate}</div><div style={{ fontSize:10, fontWeight:700, color:DARK, marginTop:4 }}>Date</div></div></div>
      </div></div>
    </div>);
  }

  // ===========================
  // SIGNATURE COLLECTION
  // ===========================
  if (collectSignatures && !showPreview) {
    const steps = { patient:{ label:"Patient Signature", sub:"Hand the device to the patient", next:"coordinator" }, coordinator:{ label:"Treatment Coordinator", sub:"Coordinator, please sign", next:"patient2" }, patient2:{ label:"Patient Signature (Page 2)", sub:"Patient, sign once more", next:null } };
    const cfg = steps[sigStep]; const cur = sigStep==="patient"?patientSig:sigStep==="coordinator"?coordinatorSig:patientSig2;
    return (<div style={{ minHeight:"100vh", background:"#f7f9fb", fontFamily:"'Segoe UI', system-ui, sans-serif" }}>
      <style>{`@media print { body { display: none; } }`}</style>
      <div style={{ background:BLUE, padding:"14px 20px", display:"flex", alignItems:"center", gap:12 }}><button onClick={() => setCollectSignatures(false)} style={TB}>{"\u2190"} Back</button><div style={{ color:"white", fontSize:16, fontWeight:700 }}>Collect Signatures</div></div>
      <div style={{ padding:"24px 16px", maxWidth:480, margin:"0 auto" }}><div style={CS}>
        <div style={{ textAlign:"center", marginBottom:20 }}><div style={{ fontSize:11, fontWeight:700, color:BLUE, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Step {sigStep==="patient"?"1/3":sigStep==="coordinator"?"2/3":"3/3"}</div><div style={{ fontSize:18, fontWeight:700, color:DARK }}>{cfg.label}</div><div style={{ fontSize:13, color:GRAY, marginTop:4 }}>{cfg.sub}</div></div>
        <div style={{ background:"#f7f9fb", borderRadius:10, padding:"12px 14px", marginBottom:20, fontSize:13 }}><div><b>Patient:</b> {patientName}</div><div><b>Treatment:</b> {treatmentDisplay}</div><div><b>Debit:</b> ${totalDebit.toFixed(2)}</div></div>
        <SignaturePad key={sigStep} label="Sign here" onSave={d => { if(sigStep==="patient") setPatientSig(d); else if(sigStep==="coordinator") setCoordinatorSig(d); else setPatientSig2(d); }} onClear={() => { if(sigStep==="patient") setPatientSig(null); else if(sigStep==="coordinator") setCoordinatorSig(null); else setPatientSig2(null); }} />
        <button onClick={() => { if(cfg.next) setSigStep(cfg.next); else { setCollectSignatures(false); setShowPreview(true); } }} disabled={!cur} style={{ width:"100%", padding:16, border:"none", borderRadius:12, fontSize:16, fontWeight:700, cursor:cur?"pointer":"not-allowed", background:cur?BLUE:"#ccc", color:"white" }}>{cfg.next?"Next \u2192":"View Treatment Plan"}</button>
      </div></div>
    </div>);
  }

  // ===========================
  // TREATMENT PLAN FORM
  // ===========================
  if (appMode === "treatment" && !showPreview) {
    return (<div style={{ minHeight:"100vh", background:"#f7f9fb", fontFamily:"'Segoe UI', system-ui, sans-serif" }}>
      <style>{`@media print { body { display: none; } }`}</style>
      <div style={{ background:BLUE, padding:"14px 20px", display:"flex", alignItems:"center", gap:12 }}><button onClick={() => { resetForm(); setAppMode(null); }} style={TB}>{"\u2190"} Back</button><div><div style={{ color:"white", fontSize:16, fontWeight:700 }}>Buchwald Family Dentistry</div><div style={{ color:"rgba(255,255,255,0.65)", fontSize:11 }}>Treatment Plan Generator</div></div></div>
      <div style={{ padding:"20px 16px", maxWidth:480, margin:"0 auto" }}>
        <div style={CS}><div style={SL}>Patient Info</div>
          <label style={LS}>Patient Name</label><input type="text" value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="First Last" style={IS} />
          <label style={LS}>Email <span style={{ fontWeight:400, color:"#999" }}>(for emailing copy)</span></label><input type="email" value={patientEmail} onChange={e => setPatientEmail(e.target.value)} placeholder="patient@email.com" style={IS} />
          <label style={LS}>Phone <span style={{ fontWeight:400, color:"#999" }}>(optional)</span></label><input type="tel" value={patientPhone} onChange={e => setPatientPhone(e.target.value)} placeholder="(555) 123-4567" style={IS} />
          <label style={LS}>Date</label><input type="text" value={date} onChange={e => setDate(e.target.value)} style={IS} />
        </div>
        <div style={CS}><div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}><div style={SL}>Treatments</div><button onClick={addTreatment} style={{ background:LIGHT_BLUE, color:BLUE, border:`1.5px solid ${BLUE}`, borderRadius:8, padding:"6px 12px", fontSize:13, fontWeight:700, cursor:"pointer" }}>+ Add</button></div>
          {treatments.map((t, idx) => <div key={t.id} style={{ background:"#f7f9fb", borderRadius:10, padding:"12px 14px", marginBottom:10, position:"relative" }}>
            {treatments.length > 1 && <button onClick={() => removeTreatment(t.id)} style={{ position:"absolute", top:8, right:10, background:"none", border:"none", color:RED, fontSize:18, cursor:"pointer" }}>{"\u00D7"}</button>}
            <div style={{ fontSize:11, fontWeight:700, color:BLUE, marginBottom:8 }}>Treatment {idx+1}</div>
            <div style={{ display:"flex", gap:10, marginBottom:10 }}>
              <div style={{ flex:1 }}><label style={{ ...LS, marginTop:0 }}>Treatment</label><input type="text" value={t.name} onChange={e => updateTreatment(t.id,"name",e.target.value)} placeholder="Crown, Invisalign..." style={{ ...IS, padding:"10px 12px" }} /></div>
              <div style={{ flex:"0 0 100px" }}><label style={{ ...LS, marginTop:0 }}>Fee</label><div style={{ position:"relative" }}><span style={{ ...DS, left:10 }}>$</span><input type="number" inputMode="decimal" value={t.fee} onChange={e => updateTreatment(t.id,"fee",e.target.value)} placeholder="0" style={{ ...IS, padding:"10px 12px 10px 24px" }} /></div></div>
            </div>
            <label style={{ ...LS, marginTop:0, marginBottom:8 }}>Tooth #</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(8, 1fr)", gap:6 }}>{Array.from({length:32},(_,i)=>i+1).map(n => { const s=t.teeth.includes(n); return <button key={n} onClick={() => toggleTooth(t.id,n)} style={{ padding:"8px 0", borderRadius:8, border:`1.5px solid ${s?BLUE:"#ddd"}`, background:s?BLUE:"white", color:s?"white":DARK, fontSize:13, fontWeight:s?700:400, cursor:"pointer" }}>{n}</button>; })}</div>
            {t.teeth.length > 0 && <div style={{ marginTop:6, fontSize:12, color:BLUE, fontWeight:600 }}>Selected: #{t.teeth.join(", #")}</div>}
          </div>)}
          {treatments.length > 1 && <div style={{ textAlign:"right", fontSize:14, fontWeight:700, color:DARK, paddingTop:4 }}>Total: ${totalDebit.toFixed(2)}</div>}
        </div>
        <div style={CS}><div style={SL}>Pricing & Financing</div>
          {[["Same Day Treatment - 20% Off", sameDayDiscount, () => { setSameDayDiscount(!sameDayDiscount); if (!sameDayDiscount) setInOfficePlan(false); }], ["In-Office Plan Member - 20% Off", inOfficePlan, () => { setInOfficePlan(!inOfficePlan); if (!inOfficePlan) setSameDayDiscount(false); }]].map(([l, on, fn]) => <div key={l} onClick={fn} style={{ display:"flex", alignItems:"center", gap:10, marginTop:14, marginBottom:8, cursor:"pointer", padding:"10px 14px", background:on?GREEN_BG:"#f7f9fb", border:`1.5px solid ${on?GREEN:"#e0e0e0"}`, borderRadius:10 }}><div style={{ width:42, height:24, borderRadius:12, background:on?GREEN:"#ccc", position:"relative", flexShrink:0 }}><div style={{ width:20, height:20, borderRadius:10, background:"white", position:"absolute", top:2, left:on?20:2, transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }} /></div><div><div style={{ fontSize:14, fontWeight:700, color:on?GREEN:DARK }}>{l}</div>{on && subtotal > 0 && <div style={{ fontSize:12, color:GREEN }}>Saving ${discountAmount.toFixed(2)}</div>}</div></div>)}
          <label style={LS}>Insurance Coverage (display only)</label><div style={{ position:"relative" }}><span style={DS}>$</span><input type="number" inputMode="decimal" value={insuranceCoverage} onChange={e => setInsuranceCoverage(e.target.value)} placeholder="0.00" style={{ ...IS, paddingLeft:28 }} /></div>
          <label style={LS}>Payment Plan</label><select value={financing} onChange={e => setFinancing(Number(e.target.value))} style={{ ...IS, appearance:"auto" }}>{FINANCING_OPTIONS.map(o => <option key={o.months} value={o.months}>{o.label}</option>)}</select>
          {subtotal > 0 && <div style={{ marginTop:16, background:"#f7f9fb", borderRadius:10, padding:16 }}>
            {activeDiscount&&<><div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, fontSize:13, color:GRAY }}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div><div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:13, fontWeight:700, color:GREEN }}><span>{discountLabel}</span><span>-${discountAmount.toFixed(2)}</span></div></>}
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:14, fontWeight:600, color:DARK }}><span>Credit/Card</span><span>${creditPrice.toFixed(2)}</span></div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, fontSize:13, color:GREEN }}><span>Save 3% with debit/cash/check</span><span>-${savings.toFixed(2)}</span></div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:16, fontWeight:800, color:BLUE, background:LIGHT_BLUE, margin:"6px -8px 0", padding:"10px 8px", borderRadius:"0 0 8px 8px" }}><span>Debit/Cash/Check</span><span>${totalDebit.toFixed(2)}</span></div>
            {insuranceNum>0&&<div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:GREEN, marginTop:8 }}><span>Insurance</span><span>${insuranceNum.toFixed(2)}</span></div>}
            {financing>0&&<div style={{ marginTop:8, paddingTop:8, borderTop:"1px dashed #ddd" }}><div style={{ display:"flex", justifyContent:"space-between", fontSize:14, fontWeight:700, color:DARK }}><span>{financing}mo at 0%</span><span>${monthlyPayment.toFixed(2)}/mo</span></div></div>}
          </div>}
        </div>
        <div style={CS}><div onClick={() => setShowUpgrades(!showUpgrades)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }}><div><div style={SL}>Upgraded Services</div>{selectedUpgrades.length > 0 && <div style={{ fontSize:12, color:GRAY, marginTop:2 }}>{selectedUpgrades.length} selected</div>}</div><svg width="20" height="20" viewBox="0 0 20 20" style={{ transform:showUpgrades?"rotate(180deg)":"rotate(0)", transition:"transform 0.2s" }}><path d="M5 7.5L10 12.5L15 7.5" stroke={GRAY} strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg></div>
          {showUpgrades && <div style={{ marginTop:16, display:"flex", flexWrap:"wrap", gap:8 }}>{UPGRADED_SERVICES.map(s => { const a=selectedUpgrades.includes(s); return <button key={s} onClick={() => toggleUpgrade(s)} style={{ padding:"6px 12px", borderRadius:20, border:`1.5px solid ${a?BLUE:"#ddd"}`, background:a?LIGHT_BLUE:"white", color:a?BLUE:GRAY, fontSize:13, fontWeight:a?600:400, cursor:"pointer" }}>{a&&"\u2713 "}{s}</button>; })}</div>}
        </div>
        <div style={CS}><div style={SL}>Staff Controls</div>
          <div onClick={() => setPushWarranty(!pushWarranty)} style={{ display:"flex", alignItems:"center", gap:10, marginTop:14, cursor:"pointer", padding:"10px 14px", background:pushWarranty?GOLD_BG:"#f7f9fb", border:`1.5px solid ${pushWarranty?GOLD:"#e0e0e0"}`, borderRadius:10 }}>
            <div style={{ width:42, height:24, borderRadius:12, background:pushWarranty?GOLD:"#ccc", position:"relative", flexShrink:0 }}><div style={{ width:20, height:20, borderRadius:10, background:"white", position:"absolute", top:2, left:pushWarranty?20:2, transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }} /></div>
            <div><div style={{ fontSize:14, fontWeight:700, color:pushWarranty?GOLD:DARK }}>{"\u{1F6E1}\uFE0F"} Push Lifetime Warranty</div><div style={{ fontSize:11, color:pushWarranty?GOLD:GRAY, marginTop:2 }}>{pushWarranty?"Included in plan & email":"Hidden"}</div></div>
          </div>
        </div>
        <button onClick={() => { saveRecord("Treatment Plan", { total: totalDebit, summary: treatments.filter(t=>t.name).map(t=>`${t.name}=$${(parseFloat(t.fee)||0).toFixed(2)}`).join(", "), items: treatments.filter(t=>t.name).map(t=>({desc:t.name+(t.teeth.length>0?" (#"+t.teeth.join(", #")+")":""), amount:(parseFloat(t.fee)||0).toFixed(2)})) }); }} disabled={!patientName.trim()} style={{ width:"100%", padding:14, background:savedToProfile?GREEN_BG:"white", color:savedToProfile?GREEN:patientName.trim()?BLUE:GRAY, border:`2px solid ${savedToProfile?GREEN:patientName.trim()?BLUE:"#ddd"}`, borderRadius:12, fontSize:15, fontWeight:700, cursor:patientName.trim()?"pointer":"not-allowed", marginBottom:10 }}>{savedToProfile?"\u2713 Saved to Profile":"\u{1F4BE} Save to Profile"}</button>
        <button onClick={() => { if (!savedToProfile) saveRecord("Treatment Plan", { total: totalDebit, summary: treatments.filter(t=>t.name).map(t=>`${t.name}=$${(parseFloat(t.fee)||0).toFixed(2)}`).join(", "), items: treatments.filter(t=>t.name).map(t=>({desc:t.name+(t.teeth.length>0?" (#"+t.teeth.join(", #")+")":""), amount:(parseFloat(t.fee)||0).toFixed(2)})) }); setShowPreview(true); }} disabled={!formComplete} style={{ width:"100%", padding:16, background:formComplete?BLUE:"#ccc", color:"white", border:"none", borderRadius:12, fontSize:16, fontWeight:700, cursor:formComplete?"pointer":"not-allowed", marginBottom:24 }}>Generate Treatment Plan</button>
      </div>
    </div>);
  }

  // ===========================
  // TREATMENT PLAN PREVIEW
  // ===========================
  return (<div style={{ background:"#f0f0f0", minHeight:"100vh", fontFamily:"Arial, sans-serif" }}>
    <style>{`@media screen { .no-print { display: flex !important; } .print-page { width: 8.5in; max-width: 100%; margin: 0 auto 20px; background: white; box-shadow: 0 2px 12px rgba(0,0,0,0.15); padding: 0.5in 0.75in; } } @media print { .no-print { display: none !important; } body, html { margin: 0; padding: 0; } .print-page { width: 8.5in; padding: 0.5in 0.75in; margin: 0; box-shadow: none; page-break-after: always; background: white; } .print-page:last-child { page-break-after: auto; } }`}</style>
    <div className="no-print" style={{ display:"none", position:"sticky", top:0, zIndex:100, background:BLUE, padding:"10px 16px", justifyContent:"space-between", alignItems:"center" }}>
      <button onClick={() => setShowPreview(false)} style={TB}>{"\u2190"} Edit</button>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        <button onClick={() => { setShowPreview(false); setCollectSignatures(true); setSigStep("patient"); }} style={TB}>{"\u270D\uFE0F"} Sign</button>
        <button onClick={() => { openGmail(patientEmail, "Your Treatment Plan - Buchwald Family Dentistry", buildTPEmail()); setEmailSent(true); }} style={{ ...TB, background:emailSent?"rgba(45,138,78,0.5)":"rgba(255,255,255,0.2)" }}>{emailSent?"\u2713 Sent":"\u2709\uFE0F Email"}</button>
        <button onClick={resetForm} style={TB}>New</button>
        <button onClick={() => savePDF("tp-pdf", `TreatmentPlan_${patientName||"Patient"}.pdf`)} style={TB}>{"\u2B07\uFE0F"} PDF</button>
        <button onClick={() => window.print()} style={{ background:"white", color:BLUE, border:"none", borderRadius:8, padding:"8px 16px", fontSize:14, fontWeight:700, cursor:"pointer" }}>Print</button>
      </div>
    </div>
    <div id="tp-pdf">
    <div className="print-page">
      <div style={{ textAlign:"center", marginBottom:4 }}><Logo width={190} /></div><div style={{ borderBottom:`3px solid ${BLUE}`, marginBottom:12 }} />
      <div style={{ textAlign:"center", fontSize:22, fontWeight:700, color:BLUE, marginBottom:12 }}>Dental Treatment Plan</div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, fontSize:12 }}><div><b style={{ color:GRAY }}>Patient: </b><span style={{ borderBottom:"1px solid #ccc", display:"inline-block", minWidth:220 }}>{patientName}</span></div><div><b style={{ color:GRAY }}>Date: </b><span style={{ borderBottom:"1px solid #ccc", display:"inline-block", minWidth:130 }}>{date}</span></div></div>
      <div style={{ marginBottom:10, fontSize:12 }}><b style={{ color:GRAY }}>Treatment Needs: </b><span style={{ borderBottom:"1px solid #ccc", display:"inline-block", minWidth:350 }}>{treatmentDisplay}</span></div>
      <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:8, fontSize:10.5 }}><thead><tr><th style={{ background:"#f0f0f0", padding:"4px 8px", textAlign:"left", fontWeight:700, borderBottom:"1px solid #ddd" }}>Tooth</th><th style={{ background:"#f0f0f0", padding:"4px 8px", textAlign:"left", fontWeight:700, borderBottom:"1px solid #ddd" }}>Treatment</th><th style={{ background:"#f0f0f0", padding:"4px 8px", textAlign:"right", fontWeight:700, borderBottom:"1px solid #ddd" }}>Fee</th></tr></thead><tbody>
        {treatments.filter(t=>t.name).map((t,i) => <tr key={i}><td style={{ padding:"3px 8px", borderBottom:"1px solid #eee" }}>{t.teeth.length>0?"#"+t.teeth.join(", #"):"-"}</td><td style={{ padding:"3px 8px", borderBottom:"1px solid #eee" }}>{t.name}</td><td style={{ padding:"3px 8px", borderBottom:"1px solid #eee", textAlign:"right" }}>${(parseFloat(t.fee)||0).toFixed(2)}</td></tr>)}
        <tr><td colSpan="2" style={{ padding:"4px 8px", fontWeight:700 }}>Total</td><td style={{ padding:"4px 8px", fontWeight:700, textAlign:"right" }}>${totalDebit.toFixed(2)}</td></tr>
      </tbody></table>
      <div style={{ background:LIGHT_BLUE, border:`1px solid ${BLUE}`, borderRadius:4, padding:"6px 10px", marginBottom:8, fontSize:9.5, fontStyle:"italic", color:GRAY, lineHeight:1.4 }}>* Fees may include upgraded services: {selectedUpgrades.length>0?<>{selectedUpgrades.map((s,i) => <span key={s}><b style={{ color:DARK }}>{s}</b>{i<selectedUpgrades.length-1?", ":""}</span>)}{UPGRADED_SERVICES.filter(s=>!selectedUpgrades.includes(s)).length>0&&", "}{UPGRADED_SERVICES.filter(s=>!selectedUpgrades.includes(s)).join(", ")}</>:UPGRADED_SERVICES.join(", ")}</div>
      {activeDiscount&&<div style={{ background:GREEN_BG, border:`1px solid ${GREEN}`, borderRadius:4, padding:"4px 10px", marginBottom:6, fontSize:10.5, textAlign:"center" }}><b style={{ color:GREEN }}>{discountLabel}</b><span style={{ color:DARK, marginLeft:8 }}>You save ${discountAmount.toFixed(2)}</span></div>}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}><div><div style={{ fontSize:13, fontWeight:700 }}>Patient Pays: <span style={{ fontSize:15 }}>${creditPrice.toFixed(2)}</span></div>{insuranceNum>0&&<div style={{ fontSize:10, color:GREEN, marginTop:2 }}>Insurance: ${insuranceNum.toFixed(2)}</div>}</div><div style={{ background:LIGHT_BLUE, border:`1.5px solid ${BLUE}`, padding:"5px 12px", borderRadius:4, textAlign:"center" }}><div style={{ fontSize:9, color:BLUE }}>Debit/Cash/Check</div><div style={{ fontSize:14, fontWeight:800, color:BLUE }}>${totalDebit.toFixed(2)}</div><div style={{ fontSize:8, color:BLUE, marginTop:1 }}>Save ${savings.toFixed(2)}</div></div></div>
      {financing>0&&<div style={{ background:GOLD_BG, border:"1px solid #D4A017", borderRadius:4, padding:"5px 10px", marginBottom:6, fontSize:10.5, textAlign:"center" }}><b style={{ color:GOLD }}>{financing}mo at 0%:</b><span style={{ color:DARK, marginLeft:8 }}>${monthlyPayment.toFixed(2)}/mo</span></div>}
      <div style={{ fontSize:15, fontWeight:700, color:BLUE, marginBottom:5, marginTop:4 }}>Payment Options</div>
      <div style={{ paddingLeft:16, fontSize:11, lineHeight:1.7, marginBottom:5 }}><div>1. <b>Pay in full</b> at appointment</div><div>2. <b>Crowns:</b> Half at prep, half at seat</div><div>3. <b>6-month CareCredit</b> at 0%</div><div>4. <b>Cherry financing</b> as low as 0%</div></div>
      <div style={{ background:"#FFFBE6", border:"1px solid #D4A017", borderLeft:"3px solid #D4A017", borderRadius:3, padding:"4px 10px", fontSize:10, marginBottom:8 }}><b>Please note:</b> Treatment will not be completed until cost is met in full.</div>
      <div style={{ fontSize:15, fontWeight:700, color:BLUE, marginBottom:5 }}>Patient Consent & Authorization</div>
      <div style={{ fontSize:9.5, lineHeight:1.5, color:DARK }}>
        <p style={{ margin:"0 0 3px", fontWeight:700 }}>I understand if insurance does not pay I am responsible for the full amount.</p>
        <p style={{ margin:"0 0 3px" }}>Treatment options have been presented to me. I understand my insurance may not cover upgraded/cosmetic services. I release Dr. Max Buchwald Jr from the contractual terms of my plan for upgraded services.</p>
        <p style={{ margin:"0 0 3px" }}>I authorize my dental care provider to perform the listed procedures.</p>
        <p style={{ margin:"0 0 3px" }}>These fees are valid for 90 days and do not include treatment on other areas/teeth.</p>
        <p style={{ margin:"0 0 5px" }}>Cancellations with less than 48 hours notice are subject to a $100/hr charge.</p>
      </div>
      <div style={{ marginTop:10 }}><SigBlock sig={patientSig} label="Patient Signature" dateStr={date} /><SigBlock sig={coordinatorSig} label="Treatment Coordinator" dateStr={date} /></div>
    </div>
    <div className="print-page">
      <div style={{ textAlign:"center", marginBottom:4 }}><Logo width={170} /></div><div style={{ borderBottom:`3px solid ${BLUE}`, marginBottom:10 }} />
      <div style={{ textAlign:"center", fontSize:18, fontWeight:700, color:BLUE, marginBottom:8 }}>Understanding Your Dental Insurance</div>
      <p style={{ fontSize:11, lineHeight:1.5, margin:"0 0 6px" }}>Many patients assume medical and dental insurance are similar. They are quite different:</p>
      <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:6, fontSize:10.5 }}><thead><tr><th style={{ background:BLUE, color:"white", padding:"5px 8px", fontWeight:700 }}>Medical Insurance</th><th style={{ background:BLUE, color:"white", padding:"5px 8px", fontWeight:700 }}>Dental Insurance</th></tr></thead><tbody>{[["High deductible","Deductibles below $100"],["High monthly premiums","Low monthly premiums"],["No annual maximum","Annual maximum applies"],["Preauthorization guarantees payment","Predetermination does not guarantee payment"]].map(([m,d],i) => <tr key={i}><td style={{ padding:"4px 8px", border:"1px solid #ddd" }}>{m}</td><td style={{ padding:"4px 8px", border:"1px solid #ddd" }}>{d}</td></tr>)}</tbody></table>
      <p style={{ fontSize:9.5, fontStyle:"italic", color:GRAY, margin:"0 0 6px", lineHeight:1.4 }}>Dental coverage is more like a discount program with a small treatment assistance benefit.</p>
      <div style={{ fontSize:14, fontWeight:700, color:BLUE, marginBottom:4 }}>Why We Prioritize Long-Lasting Work</div>
      <p style={{ fontSize:10.5, lineHeight:1.5, margin:"0 0 3px" }}>Many plans only cover replacement every 5 years. We use materials that last 10-15+ years:</p>
      <ul style={{ fontSize:10.5, lineHeight:1.6, margin:"0 0 3px", paddingLeft:18 }}><li><b>Higher-quality materials</b></li><li><b>Precise technique</b></li><li><b>Better durability</b> - fewer replacements</li></ul>
      <div style={{ borderBottom:`2px solid ${BLUE}`, marginBottom:6 }} />
      {pushWarranty ? <><div style={{ fontSize:14, fontWeight:700, color:BLUE, marginBottom:4 }}>Our Lifetime Warranty</div>
        <p style={{ fontSize:10.5, lineHeight:1.5, margin:"0 0 5px" }}>We offer a <b style={{ color:BLUE }}>Lifetime Warranty</b> on qualifying restorations. If it fails under normal use, we repair or replace at no charge.</p>
        <div style={{ background:"#F0FAFF", border:`1.5px solid ${BLUE}`, borderRadius:4, padding:"7px 10px", marginBottom:6, fontSize:10, lineHeight:1.5 }}>
          <div style={{ fontWeight:700, color:BLUE, fontSize:11, marginBottom:2 }}>Covered</div><p style={{ margin:"0 0 5px" }}>Crowns, bridges, fillings, and other restorations warranted for life.</p>
          <div style={{ fontWeight:700, color:BLUE, fontSize:11, marginBottom:2 }}>Keep It Active</div>
          <ul style={{ margin:"0 0 5px", paddingLeft:16, lineHeight:1.6 }}><li><b>Cleanings every 6 months</b></li><li><b>Night guard</b></li><li><b>Fluoride twice/year</b></li><li><b>Laser bacterial reduction every 12mo</b></li><li><b>InnerView scan every 6mo</b></li></ul>
          <div style={{ fontWeight:700, color:BLUE, fontSize:11, marginBottom:2 }}>Not Covered</div><p style={{ margin:0 }}>Trauma, accidents, failure to maintain care, neglect, or misuse.</p>
        </div></> : <div style={{ padding:"20px 0", textAlign:"center", color:GRAY, fontSize:12, fontStyle:"italic" }}>Ask us about our Lifetime Warranty program!</div>}
      <div style={{ borderBottom:`2px solid ${BLUE}`, marginBottom:6 }} />
      <div style={{ fontSize:11, marginBottom:2 }}><b style={{ color:GRAY }}>Patient Name: </b><span style={{ borderBottom:"1px solid #ccc", display:"inline-block", minWidth:280 }}>{patientName}</span></div>
      <div style={{ marginTop:8 }}><SigBlock sig={patientSig2} label="Patient Signature" dateStr={date} /></div>
    </div>
    </div>
  </div>);
}
