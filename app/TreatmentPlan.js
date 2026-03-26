"use client";
import { useState, useRef, useEffect } from "react";

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
  const [patientName, setPatientName] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
  // Multiple treatments
  const [treatments, setTreatments] = useState([{ id: 1, teeth: [], name: "", fee: "" }]);
  const [insuranceCoverage, setInsuranceCoverage] = useState("");
  const [financing, setFinancing] = useState(0); // months
  const [sameDayDiscount, setSameDayDiscount] = useState(false);
  const [selectedUpgrades, setSelectedUpgrades] = useState([]);
  const [showUpgrades, setShowUpgrades] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [collectSignatures, setCollectSignatures] = useState(false);
  const [patientSig, setPatientSig] = useState(null);
  const [coordinatorSig, setCoordinatorSig] = useState(null);
  const [patientSig2, setPatientSig2] = useState(null);
  const [sigStep, setSigStep] = useState("patient");

  // Calculations
  const subtotal = treatments.reduce((sum, t) => sum + (parseFloat(t.fee) || 0), 0);
  const discountAmount = sameDayDiscount ? Math.round(subtotal * 0.20 * 100) / 100 : 0;
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

  const resetForm = () => {
    setPatientName(""); setTreatments([{ id: 1, teeth: [], name: "", fee: "" }]);
    setInsuranceCoverage(""); setFinancing(0); setSameDayDiscount(false); setSelectedUpgrades([]);
    setPatientSig(null); setCoordinatorSig(null); setPatientSig2(null);
    setShowPreview(false); setCollectSignatures(false); setSigStep("patient");
    setDate(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
  };

  // ========== SIGNATURE MODE ==========
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

  // ========== FORM VIEW ==========
  if (!showPreview) {
    return (
      <div style={{ minHeight: "100vh", background: "#f7f9fb", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <style>{`@media print { body { display: none; } }`}</style>
        <div style={{ background: BLUE, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, background: "white", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <img src="/logo.png" alt="" style={{ width: 30, height: "auto" }} />
          </div>
          <div>
            <div style={{ color: "white", fontSize: 16, fontWeight: 700 }}>Buchwald Family Dentistry</div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>Treatment Plan Generator</div>
          </div>
        </div>

        <div style={{ padding: "20px 16px", maxWidth: 480, margin: "0 auto" }}>
          {/* Patient Info */}
          <div style={cardStyle}>
            <div style={sectionLabel}>Patient Info</div>
            <label style={labelStyle}>Patient Name</label>
            <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="First Last" style={inputStyle} />
            <label style={labelStyle}>Date</label>
            <input type="text" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
          </div>

          {/* Treatments */}
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

          {/* Pricing */}
          <div style={cardStyle}>
            <div style={sectionLabel}>Pricing & Financing</div>

            {/* Same Day Discount Toggle */}
            <div onClick={() => setSameDayDiscount(!sameDayDiscount)} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, marginBottom: 8, cursor: "pointer", padding: "10px 14px", background: sameDayDiscount ? "#e6f9ee" : "#f7f9fb", border: `1.5px solid ${sameDayDiscount ? "#2d8a4e" : "#e0e0e0"}`, borderRadius: 10, transition: "all 0.2s" }}>
              <div style={{ width: 42, height: 24, borderRadius: 12, background: sameDayDiscount ? "#2d8a4e" : "#ccc", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                <div style={{ width: 20, height: 20, borderRadius: 10, background: "white", position: "absolute", top: 2, left: sameDayDiscount ? 20 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: sameDayDiscount ? "#2d8a4e" : DARK }}>Same Day Treatment - 20% Off</div>
                {sameDayDiscount && subtotal > 0 && <div style={{ fontSize: 12, color: "#2d8a4e" }}>Saving ${discountAmount.toFixed(2)}</div>}
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
                {sameDayDiscount && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13, color: GRAY }}>
                      <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#2d8a4e" }}>
                      <span>Same Day Discount (20%)</span><span>-${discountAmount.toFixed(2)}</span>
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

          {/* Upgrades */}
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

          <button onClick={() => setShowPreview(true)} disabled={!formComplete}
            style={{ width: "100%", padding: 16, background: formComplete ? BLUE : "#ccc", color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: formComplete ? "pointer" : "not-allowed", marginBottom: 10 }}>
            Generate Treatment Plan
          </button>
          <div style={{ textAlign: "center", fontSize: 12, color: GRAY, padding: "6px 0 24px" }}>Add to Home Screen for quick access</div>
        </div>
      </div>
    );
  }

  // ========== PRINT PREVIEW ==========
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
          <button onClick={resetForm} style={toolbarBtn}>New</button>
          <button onClick={() => window.print()} style={{ background: "white", color: BLUE, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Print</button>
        </div>
      </div>

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

        {/* Treatment breakdown table */}
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

        {/* Same day discount on print */}
        {sameDayDiscount && (
          <div style={{ background: "#e6f9ee", border: "1px solid #2d8a4e", borderRadius: 4, padding: "4px 10px", marginBottom: 6, fontSize: 10.5, textAlign: "center" }}>
            <b style={{ color: "#2d8a4e" }}>Same Day Treatment Discount: 20% Off</b>
            <span style={{ color: DARK, marginLeft: 8 }}>You save ${discountAmount.toFixed(2)}</span>
          </div>
        )}

        {/* Pricing */}
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

        {/* Financing callout */}
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
    </div>
  );
}

const cardStyle = { background: "white", borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" };
const sectionLabel = { fontSize: 13, fontWeight: 700, color: "#0098D4", textTransform: "uppercase", letterSpacing: "0.5px" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 6, marginTop: 14 };
const inputStyle = { width: "100%", padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 16, color: "#1A1A1A", outline: "none", background: "#fafafa", WebkitAppearance: "none" };
const dollarSign = { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#666", fontWeight: 600 };
const toolbarBtn = { background: "rgba(255,255,255,0.2)", color: "white", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" };
