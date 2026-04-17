import { useState, useRef } from "react";

// ─── Appointment & Invoice Number Generators ──────────────────────
const generateAppointmentNumber = (doctorId, dateStr) => {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  const serial = Math.floor(100 + Math.random() * 900);
  return `APT-${yy}${mm}${dd}-D${doctorId}-${serial}`;
};

const generateInvoiceNumber = () => {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
  return `INV-${stamp}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// ─── Generate next 3 available days (skipping Sundays) ───────────
const getNextDays = () => {
  const days = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  // Start from tomorrow
  d.setDate(d.getDate() + 1);
  while (days.length < 3) {
    if (d.getDay() !== 0) { // skip Sunday
      days.push(d.toISOString().split("T")[0]);
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
};

// ─── Generate time slots for a given day index ────────────────────
const generateSlots = (dayIndex) => {
  const allSlots = [
    ["09:00","09:30","10:00","10:30","11:00","11:30","14:00","14:30","15:00","15:30","16:00","16:30"],
    ["09:30","10:00","10:30","11:00","11:30","13:00","13:30","15:00","15:30","16:00","17:00"],
    ["09:00","09:30","10:30","11:00","14:00","14:30","15:00","16:00","16:30","17:00"],
  ];
  return allSlots[dayIndex % allSlots.length];
};

// ─── Doctors ──────────────────────────────────────────────────────
const DAYS = getNextDays();

const buildSlots = (offsets) => {
  const obj = {};
  DAYS.forEach((d, i) => { obj[d] = generateSlots(i + offsets); });
  return obj;
};

const doctors = [
  {
    id: 1,
    name: "Dr. Sana Mirza",
    specialty: "General Physician",
    experience: "12 years",
    fee: 1500,
    reg: 200,
    avatar: "SM",
    color: "#2D6A4F",
    slots: buildSlots(0),
  },
  {
    id: 2,
    name: "Dr. Kamran Hussain",
    specialty: "Skin Specialist",
    experience: "9 years",
    fee: 2500,
    reg: 200,
    avatar: "KH",
    color: "#1D3557",
    slots: buildSlots(1),
  },
  {
    id: 3,
    name: "Dr. Ayesha Noor",
    specialty: "Dentist",
    experience: "7 years",
    fee: 2000,
    reg: 200,
    avatar: "AN",
    color: "#7B2D8B",
    slots: buildSlots(2),
  },
];

const STEPS = ["Doctor", "Date & Time", "Your Details", "Confirm"];

const formatDate = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
};

// ─── Main Component ───────────────────────────────────────────────
export default function App() {
  const [step, setStep]               = useState(0);
  const [doctor, setDoctor]           = useState(null);
  const [date, setDate]               = useState(null);
  const [slot, setSlot]               = useState(null);
  const [form, setForm]               = useState({ name: "", phone: "", reason: "" });
  const [booked, setBooked]           = useState(false);
  const [apptNo, setApptNo]           = useState("");
  const [invNo, setInvNo]             = useState("");
  const [bookedAt, setBookedAt]       = useState(null);
  const receiptRef                    = useRef(null);

  const slots = doctor && date ? doctor.slots[date] || [] : [];

  const canNext = () => {
    if (step === 0) return !!doctor;
    if (step === 1) return !!date && !!slot;
    if (step === 2) return form.name.trim().length > 0 && form.phone.trim().length > 0;
    return true;
  };

  const confirm = () => {
    setApptNo(generateAppointmentNumber(doctor.id, date));
    setInvNo(generateInvoiceNumber());
    setBookedAt(new Date());
    setBooked(true);
  };

  const printReceipt = () => {
    const html = receiptRef.current.innerHTML;
    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head><title>Receipt – ${apptNo}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:28px;max-width:460px;margin:auto;color:#1A1A2E}
      .row{display:flex;justify-content:space-between;padding:7px 0;font-size:14px;border-bottom:1px solid #eee}
      .lbl{color:#888}.val{font-weight:600}
      h2{font-size:20px;margin-bottom:2px} .sub{font-size:11px;color:#aaa;letter-spacing:2px;text-transform:uppercase}
      .total{font-size:18px;color:#2D6A4F;font-weight:700}
      .stamp{text-align:center;margin-top:18px;padding:10px 16px;border:2px solid #2D6A4F;border-radius:8px;color:#2D6A4F;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700}
      .divider{border:none;border-top:1px dashed #ccc;margin:12px 0}
    </style></head><body>
    ${html}
    <script>window.print();<\/script></body></html>`);
    w.document.close();
  };

  // ── Styles ────────────────────────────────────────────────────
  const S = {
    page:      { minHeight:"100vh", background:"#F5F0EB", fontFamily:"Arial, sans-serif" },
    header:    { background:"#1A1A2E", padding:"16px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" },
    logo:      { color:"#E8D5B7", fontSize:"20px", fontWeight:"bold", letterSpacing:"1px" },
    logoSub:   { color:"#7C9E9A", fontSize:"10px", letterSpacing:"3px", textTransform:"uppercase", display:"block", marginTop:"2px" },
    onlineBadge: { background:"#2D6A4F", color:"#fff", fontSize:"11px", padding:"4px 12px", borderRadius:"20px" },
    wrap:      { maxWidth:"720px", margin:"0 auto", padding:"28px 14px 60px" },

    // step bar
    stepBar:   { display:"flex", alignItems:"center", marginBottom:"32px" },
    stepItem:  { flex:1, textAlign:"center", position:"relative" },
    stepLine:  (done) => ({ position:"absolute", top:"15px", left:"50%", width:"100%", height:"2px", background: done ? "#2D6A4F" : "#D4C9BC", zIndex:0 }),
    stepCircle:(active,done) => ({
      width:"30px", height:"30px", borderRadius:"50%", margin:"0 auto 5px",
      background: done ? "#2D6A4F" : active ? "#1A1A2E" : "#D4C9BC",
      color: done||active ? "#fff" : "#999",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:"12px", fontWeight:"bold", position:"relative", zIndex:1,
      border: active ? "3px solid #E8D5B7" : "none",
    }),
    stepLabel: (active,done) => ({ fontSize:"9px", letterSpacing:"1.5px", textTransform:"uppercase", color: done?"#2D6A4F":active?"#1A1A2E":"#AAA" }),

    card:       { background:"#fff", borderRadius:"14px", padding:"24px", boxShadow:"0 3px 20px rgba(0,0,0,0.06)", marginBottom:"16px" },
    secTitle:   { fontSize:"11px", letterSpacing:"3px", textTransform:"uppercase", color:"#AAA", marginBottom:"18px" },

    // doctor card
    docCard:   (sel, col) => ({
      display:"flex", alignItems:"center", gap:"14px", padding:"14px 18px",
      borderRadius:"12px", border: sel ? `2px solid ${col}` : "2px solid #EEE",
      background: sel ? `${col}10` : "#FAFAFA", cursor:"pointer", transition:"all .2s", marginBottom:"10px",
    }),
    avatar:    (col) => ({ width:"48px", height:"48px", borderRadius:"50%", background:col, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", fontWeight:"bold", flexShrink:0 }),
    docName:   { fontSize:"16px", fontWeight:"bold", color:"#1A1A2E", marginBottom:"2px" },
    docSpec:   { fontSize:"13px", color:"#666", marginBottom:"2px" },
    docExp:    { fontSize:"11px", color:"#AAA" },
    feeTag:    (col) => ({ marginLeft:"auto", background:`${col}15`, color:col, padding:"5px 12px", borderRadius:"20px", fontSize:"13px", fontWeight:"bold", flexShrink:0 }),

    // date
    daysRow:   { display:"flex", gap:"8px", marginBottom:"22px", flexWrap:"wrap" },
    dayBtn:    (sel) => ({
      flex:1, minWidth:"100px", padding:"12px 8px", borderRadius:"12px", cursor:"pointer", textAlign:"center", transition:"all .2s",
      border: sel ? "2px solid #1A1A2E" : "2px solid #E0D9D0",
      background: sel ? "#1A1A2E" : "#FAF8F5",
      color: sel ? "#E8D5B7" : "#555",
    }),
    dayName:   { fontSize:"9px", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"3px" },
    dayDate:   { fontSize:"15px", fontWeight:"bold" },

    slotsGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(84px,1fr))", gap:"8px" },
    slotBtn:   (sel) => ({
      padding:"9px 6px", borderRadius:"10px", textAlign:"center", cursor:"pointer", fontSize:"14px", transition:"all .2s",
      border: sel ? "2px solid #2D6A4F" : "2px solid #E0D9D0",
      background: sel ? "#2D6A4F" : "#FAF8F5",
      color: sel ? "#fff" : "#444", fontWeight: sel ? "bold" : "normal",
    }),

    // form
    inputGroup: { marginBottom:"16px" },
    label:     { display:"block", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", color:"#888", marginBottom:"7px" },
    input:     { width:"100%", padding:"11px 14px", borderRadius:"10px", border:"2px solid #E0D9D0", fontSize:"15px", color:"#1A1A2E", background:"#FAF8F5", outline:"none", boxSizing:"border-box", fontFamily:"Arial,sans-serif" },
    textarea:  { width:"100%", padding:"11px 14px", borderRadius:"10px", border:"2px solid #E0D9D0", fontSize:"15px", color:"#1A1A2E", background:"#FAF8F5", outline:"none", resize:"vertical", minHeight:"80px", boxSizing:"border-box", fontFamily:"Arial,sans-serif" },

    // summary
    sumRow:    { display:"flex", justifyContent:"space-between", padding:"11px 0", borderBottom:"1px solid #F0EAE0", fontSize:"14px" },
    sumLbl:    { color:"#888" },
    sumVal:    { color:"#1A1A2E", fontWeight:"bold" },

    // whatsapp note
    waNote:    { background:"#E8F5E9", border:"1px solid #A5D6A7", borderRadius:"10px", padding:"12px 16px", fontSize:"13px", color:"#2D6A4F", marginTop:"16px", display:"flex", alignItems:"flex-start", gap:"10px" },

    // buttons
    btnRow:    { display:"flex", gap:"10px", marginTop:"24px" },
    btnBack:   { flex:1, padding:"13px", borderRadius:"11px", border:"2px solid #D4C9BC", background:"transparent", color:"#666", fontSize:"14px", cursor:"pointer", fontFamily:"Arial,sans-serif" },
    btnNext:   (dis) => ({ flex:2, padding:"13px", borderRadius:"11px", border:"none", background: dis ? "#D4C9BC" : "#1A1A2E", color: dis ? "#AAA" : "#E8D5B7", fontSize:"14px", cursor: dis ? "not-allowed" : "pointer", fontWeight:"bold", fontFamily:"Arial,sans-serif", letterSpacing:"0.5px" }),
    btnBook:   { flex:1, padding:"13px", borderRadius:"11px", border:"none", background:"#2D6A4F", color:"#fff", fontSize:"14px", cursor:"pointer", fontWeight:"bold", fontFamily:"Arial,sans-serif" },
  };

  // ── Confirmation Screen ───────────────────────────────────────
  if (booked) {
    const total = doctor.fee + doctor.reg;
    const issuedAt = bookedAt?.toLocaleString("en-PK", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
    const tokenNum = apptNo.split("-")[3];

    return (
      <div style={S.page}>
        <div style={S.header}>
          <div><div style={S.logo}>ClinicReady</div><span style={S.logoSub}>Appointment System</span></div>
          <span style={S.onlineBadge}>● Confirmed</span>
        </div>
        <div style={S.wrap}>

          {/* Appointment Token */}
          <div style={{ ...S.card, borderLeft:`5px solid ${doctor.color}` }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"14px", flexWrap:"wrap" }}>
              <div>
                <div style={{ fontSize:"10px", letterSpacing:"3px", textTransform:"uppercase", color:"#AAA", marginBottom:"5px" }}>Appointment Number</div>
                <div style={{ fontSize:"22px", fontWeight:"bold", color:"#1A1A2E", letterSpacing:"2px", fontFamily:"monospace" }}>{apptNo}</div>
                <div style={{ marginTop:"10px", fontSize:"14px", color:"#555", lineHeight:"1.7" }}>
                  <div>📅 {formatDate(date)}</div>
                  <div>🕐 {slot}</div>
                  <div>👨‍⚕️ {doctor.name} — {doctor.specialty}</div>
                  <div>👤 {form.name} · 📱 {form.phone}</div>
                </div>
              </div>
              <div style={{ background:doctor.color, color:"#fff", borderRadius:"12px", padding:"16px 20px", textAlign:"center", minWidth:"80px" }}>
                <div style={{ fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", opacity:.8, marginBottom:"4px" }}>Token</div>
                <div style={{ fontSize:"36px", fontWeight:"bold", fontFamily:"monospace", lineHeight:1 }}>{tokenNum}</div>
                <div style={{ fontSize:"9px", opacity:.7, marginTop:"4px" }}>Queue No.</div>
              </div>
            </div>
            <div style={S.waNote}>
              <span style={{ fontSize:"18px" }}>💬</span>
              <span>Show this number at reception. A WhatsApp confirmation will be sent to <strong>{form.phone}</strong>.</span>
            </div>
          </div>

          {/* Payment Receipt */}
          <div style={S.card}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"18px" }}>
              <div>
                <div style={S.secTitle}>Payment Receipt</div>
                <div style={{ fontSize:"12px", color:"#AAA", marginTop:"-14px" }}>Payable at clinic counter on arrival</div>
              </div>
              <button onClick={printReceipt} style={{ background:"#1A1A2E", color:"#E8D5B7", border:"none", borderRadius:"8px", padding:"8px 14px", fontSize:"12px", cursor:"pointer", fontFamily:"Arial,sans-serif" }}>
                🖨️ Print / Save PDF
              </button>
            </div>

            <div ref={receiptRef}>
              {/* Clinic header for print */}
              <h2 style={{ fontSize:"20px", fontWeight:"bold", color:"#1A1A2E" }}>Karachi Medical Centre</h2>
              <p className="sub" style={{ fontSize:"11px", color:"#AAA", letterSpacing:"2px", textTransform:"uppercase", margin:"2px 0 14px" }}>ClinicReady Appointment System</p>

              <hr className="divider" style={{ border:"none", borderTop:"1px dashed #ccc", margin:"10px 0" }} />

              {[
                ["Invoice No.", invNo],
                ["Appointment No.", apptNo],
                ["Issued", issuedAt],
              ].map(([l,v]) => (
                <div key={l} style={S.sumRow}><span style={S.sumLbl}>{l}</span><span style={{ ...S.sumVal, fontFamily:"monospace", fontSize:"13px" }}>{v}</span></div>
              ))}

              <div style={{ margin:"14px 0 6px", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", color:"#AAA" }}>Patient</div>
              <div style={{ fontSize:"15px", fontWeight:"bold", color:"#1A1A2E" }}>{form.name}</div>
              <div style={{ fontSize:"13px", color:"#666" }}>{form.phone}</div>
              {form.reason && <div style={{ fontSize:"13px", color:"#666", marginTop:"2px" }}>Reason: {form.reason}</div>}

              <div style={{ margin:"16px 0 8px", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", color:"#AAA" }}>Fee Breakdown</div>
              {[
                [`Consultation — ${doctor.specialty}`, `Rs. ${doctor.fee.toLocaleString()}`],
                ["Registration / File Fee",              `Rs. ${doctor.reg.toLocaleString()}`],
              ].map(([l,v]) => (
                <div key={l} style={S.sumRow}><span style={{ color:"#444" }}>{l}</span><span style={S.sumVal}>{v}</span></div>
              ))}

              <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0 0", fontSize:"16px" }}>
                <span style={{ fontWeight:"bold", color:"#1A1A2E" }}>Total Payable</span>
                <span style={{ fontWeight:"bold", color:"#2D6A4F", fontSize:"20px" }}>Rs. {total.toLocaleString()}</span>
              </div>

              <div className="stamp" style={{ textAlign:"center", marginTop:"16px", padding:"10px 14px", border:"2px solid #2D6A4F", borderRadius:"8px", color:"#2D6A4F", fontSize:"11px", letterSpacing:"2px", textTransform:"uppercase", fontWeight:"bold" }}>
                ✦ Fee Payable at Clinic Counter ✦
              </div>
            </div>
          </div>

          <div style={{ textAlign:"center", fontSize:"12px", color:"#AAA", marginTop:"6px" }}>
            Please arrive 10 minutes early. Bring this receipt and any previous reports.
          </div>
        </div>
      </div>
    );
  }

  // ── Booking Flow ──────────────────────────────────────────────
  return (
    <div style={S.page}>
      <div style={S.header}>
        <div><div style={S.logo}>ClinicReady</div><span style={S.logoSub}>Appointment System</span></div>
        <span style={S.onlineBadge}>● Accepting Bookings</span>
      </div>

      <div style={S.wrap}>
        {/* Step Bar */}
        <div style={S.stepBar}>
          {STEPS.map((s, i) => (
            <div key={s} style={S.stepItem}>
              {i < STEPS.length - 1 && <div style={S.stepLine(step > i)} />}
              <div style={{ position:"relative", zIndex:1 }}>
                <div style={S.stepCircle(step===i, step>i)}>{step>i ? "✓" : i+1}</div>
                <div style={S.stepLabel(step===i, step>i)}>{s}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Step 0 — Doctor */}
        {step === 0 && (
          <div style={S.card}>
            <div style={S.secTitle}>Select a Doctor</div>
            {doctors.map(doc => (
              <div key={doc.id} style={S.docCard(doctor?.id===doc.id, doc.color)} onClick={() => setDoctor(doc)}>
                <div style={S.avatar(doc.color)}>{doc.avatar}</div>
                <div>
                  <div style={S.docName}>{doc.name}</div>
                  <div style={S.docSpec}>{doc.specialty}</div>
                  <div style={S.docExp}>{doc.experience} experience</div>
                </div>
                <div style={S.feeTag(doc.color)}>Rs. {doc.fee.toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}

        {/* Step 1 — Date & Slot */}
        {step === 1 && (
          <div style={S.card}>
            <div style={S.secTitle}>Select Date</div>
            <div style={S.daysRow}>
              {DAYS.map(d => {
                const obj = new Date(d + "T00:00:00");
                return (
                  <div key={d} style={S.dayBtn(date===d)} onClick={() => { setDate(d); setSlot(null); }}>
                    <div style={S.dayName}>{obj.toLocaleDateString("en-PK",{weekday:"short"})}</div>
                    <div style={S.dayDate}>{obj.toLocaleDateString("en-PK",{day:"numeric",month:"short"})}</div>
                  </div>
                );
              })}
            </div>
            {date && (
              <>
                <div style={S.secTitle}>Available Slots</div>
                <div style={S.slotsGrid}>
                  {slots.map(s => (
                    <div key={s} style={S.slotBtn(slot===s)} onClick={() => setSlot(s)}>{s}</div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2 — Patient Details */}
        {step === 2 && (
          <div style={S.card}>
            <div style={S.secTitle}>Your Details</div>
            <div style={S.inputGroup}>
              <label style={S.label}>Full Name *</label>
              <input style={S.input} placeholder="e.g. Ahmed Khan" value={form.name} onChange={e => setForm({...form,name:e.target.value})} />
            </div>
            <div style={S.inputGroup}>
              <label style={S.label}>WhatsApp Number *</label>
              <input style={S.input} placeholder="e.g. 0300-1234567" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} />
            </div>
            <div style={S.inputGroup}>
              <label style={S.label}>Reason for Visit (optional)</label>
              <textarea style={S.textarea} placeholder="Briefly describe your concern..." value={form.reason} onChange={e => setForm({...form,reason:e.target.value})} />
            </div>
            <div style={S.waNote}>
              <span style={{fontSize:"18px"}}>💬</span>
              <span>A booking confirmation will be sent to your WhatsApp automatically.</span>
            </div>
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <div style={S.card}>
            <div style={S.secTitle}>Review & Confirm</div>
            {[
              ["Doctor",           doctor?.name],
              ["Specialty",        doctor?.specialty],
              ["Date",             date ? formatDate(date) : ""],
              ["Time",             slot],
              ["Patient",          form.name],
              ["WhatsApp",         form.phone],
            ].map(([l,v]) => (
              <div key={l} style={S.sumRow}><span style={S.sumLbl}>{l}</span><span style={S.sumVal}>{v}</span></div>
            ))}
            <div style={{ ...S.sumRow, borderBottom:"none" }}>
              <span style={S.sumLbl}>Consultation Fee</span>
              <span style={{ ...S.sumVal, color:"#2D6A4F", fontSize:"17px" }}>Rs. {doctor?.fee.toLocaleString()}</span>
            </div>
            <div style={S.waNote}>
              <span style={{fontSize:"18px"}}>📋</span>
              <span>Please bring any previous reports. Fee is payable at the clinic counter.</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <div style={S.btnRow}>
          {step > 0 && <button style={S.btnBack} onClick={() => setStep(step-1)}>← Back</button>}
          {step < 3
            ? <button style={S.btnNext(!canNext())} disabled={!canNext()} onClick={() => setStep(step+1)}>Continue →</button>
            : <button style={S.btnBook} onClick={confirm}>✓ Confirm Appointment</button>
          }
        </div>
      </div>
    </div>
  );
}
