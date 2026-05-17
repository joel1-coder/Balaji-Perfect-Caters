import { useState, useCallback } from "react";
import AdminLayout from "../../components/AdminLayout";

// PRICING ENGINE 


const LOCATION_MULTIPLIERS = {
 local: { label: "Within City", multiplier: 1.00, deliveryBase: 0 },
 suburban: { label: "Suburban Area", multiplier: 1.05, deliveryBase: 500 },
 outstation:{ label: "Outstation", multiplier: 1.12, deliveryBase: 1500 },
};

const SERVICES = {
 selfPickup: { label: "Self Pickup", cost: 0 },
 delivery: { label: "Delivery Only", cost: null }, // dynamic
 fullService: { label: "Delivery + Setup", cost: null }, // dynamic + 800
};

const CGST_RATE = 0.025;
const SGST_RATE = 0.025;

function computeLineItem(line, locationKey) {
  const item = { label: line.customLabel || 'Custom Item', basePrice: Number(line.customPrice) || 0, unit: line.customUnit || 'unit', category: 'Custom' };
  if (line.qty <= 0) return null;

  const qty = line.qty;
  const manualDiscountPct = line.manualDiscount;

  const loc = LOCATION_MULTIPLIERS[locationKey];
  const adjustedBase = +(item.basePrice * loc.multiplier).toFixed(2);

  const discountVal = (manualDiscountPct !== "" && manualDiscountPct !== null && manualDiscountPct !== undefined) ? Math.min(100, Math.max(0, parseFloat(manualDiscountPct) || 0)) : 0;

  const discountedPrice = +(adjustedBase * (1 - discountVal / 100)).toFixed(2);
  const subtotal = +(discountedPrice * qty).toFixed(2);

  return {
    key: line.key,
    label: item.label,
    category: item.category,
    unit: item.unit,
    qty,
    basePrice: item.basePrice,
    adjustedBase,
    discountPct: discountVal,
    pricePerUnit: discountedPrice,
    subtotal,
  };
}

function computeBill(orderLines, locationKey, serviceKey, eventPax) {
  const loc = LOCATION_MULTIPLIERS[locationKey];
  const items = orderLines.map((line) => computeLineItem(line, locationKey)).filter(Boolean);

  const itemsTotal = items.reduce((s, i) => s + i.subtotal, 0);

 // Delivery charge
 let deliveryCharge = 0;
 if (serviceKey!== "selfPickup") {
 deliveryCharge = loc.deliveryBase;
 if (serviceKey === "fullService") deliveryCharge += 800;
 }

 // Packaging: 2 per 10 units
 const totalUnits = orderLines.reduce((s, l) => s + l.qty, 0);
 const packagingCharge = Math.ceil(totalUnits / 10) * 2;

 // Staffing: if pax > 150
 const staffingCharge = eventPax > 150? Math.ceil((eventPax - 150) / 50) * 1500: 0;

 const preTax = itemsTotal + deliveryCharge + packagingCharge + staffingCharge;
 const cgst = +(preTax * CGST_RATE).toFixed(2);
 const sgst = +(preTax * SGST_RATE).toFixed(2);
 const grandTotal = +(preTax + cgst + sgst).toFixed(2);

 return { items, itemsTotal, deliveryCharge, packagingCharge, staffingCharge, preTax, cgst, sgst, grandTotal };
}

// UI 

const fmt = (n) => "Rs. " + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });


export default function CateringQuotation() {
 const [orderLines, setOrderLines] = useState([{ key: "custom", customLabel: "", customPrice: "", customUnit: "unit", qty: 50, manualDiscount: "" }]);
 const [location, setLocation] = useState("local");
 const [service, setService] = useState("delivery");
 const [pax, setPax] = useState(100);
 const [clientName, setClientName] = useState("");
 const [eventDate, setEventDate] = useState("");
 const [showBill, setShowBill] = useState(false);

 const addLine = () => setOrderLines(prev => [...prev, { key: "custom", customLabel: "", customPrice: "", customUnit: "unit", qty: 50, manualDiscount: "" }]);
 const removeLine = (i) => setOrderLines(prev => prev.filter((_, idx) => idx!== i));
 const updateLine = (i, field, val) =>
 setOrderLines(prev => prev.map((l, idx) => idx === i? {...l,
 [field]: field === "qty"? Math.max(1, parseInt(val)||1): val
 }: l));

 const bill = computeBill(orderLines, location, service, pax);

 return (
 <AdminLayout>
 <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", minHeight: "100vh", background: "#FAF7F2", color: "#1a0f00" }}>
 {/* Header */}
 <div style={{
 background: "linear-gradient(135deg, #7A0008 0%, #E3A23B 60%, #F2C36B 100%)",
 padding: "36px 32px 28px",
 color: "#fff",
 position: "relative",
 overflow: "hidden"
 }}>
 <div style={{
 position: "absolute", top: -40, right: -40, width: 200, height: 200,
 borderRadius: "50%", background: "rgba(255,255,255,0.06)"
 }} />
 <div style={{ position: "relative" }}>
 <div style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", opacity: 0.75, marginBottom: 6 }}>
 Catering Management System
 </div>
 <h1 style={{ margin: 0, fontSize: 32, fontWeight: "normal", letterSpacing: 1 }}>
 Dynamic Quotation Builder
 </h1>
 <p style={{ margin: "8px 0 0", opacity: 0.8, fontSize: 14 }}>
 Instant itemized billing with bulk discounts, taxes & service charges
 </p>
 </div>
 </div>

 <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 60px" }}>

 {/* Event Details */}
 <Section title="Event Details">
 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
 <Field label="Client / Organization">
 <input value={clientName} onChange={e => setClientName(e.target.value)}
 placeholder="e.g. Sharma Weddings" style={inputStyle} />
 </Field>
 <Field label="Event Date">
 <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} style={inputStyle} />
 </Field>
 <Field label="Expected Guests (Pax)">
 <input type="number" min={1} value={pax} onChange={e => setPax(Math.max(1, parseInt(e.target.value)||1))}
 style={inputStyle} />
 {pax > 150 && <Note>Staffing surcharge applies for {pax} guests</Note>}
 </Field>
 </div>
 </Section>

 {/* Location & Service */}
 <Section title="Logistics">
 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
 <Field label="Delivery Location">
 <select value={location} onChange={e => setLocation(e.target.value)} style={inputStyle}>
 {Object.entries(LOCATION_MULTIPLIERS).map(([k, v]) => (
 <option key={k} value={k}>{v.label}</option>
 ))}
 </select>
 {location!== "local" && (
 <Note>+{((LOCATION_MULTIPLIERS[location].multiplier - 1)*100).toFixed(0)}% location surcharge on item prices</Note>
 )}
 </Field>
 <Field label="Service Type">
 <select value={service} onChange={e => setService(e.target.value)} style={inputStyle}>
 {Object.entries(SERVICES).map(([k, v]) => (
 <option key={k} value={k}>{v.label}</option>
 ))}
 </select>
 </Field>
 </div>
 </Section>

 {/* Order Lines */}
 <Section title="Order Items">
 <div style={{ marginBottom: 8, fontSize: 12, color: "#9C6B22", letterSpacing: 1, textTransform: "uppercase" }}>
 Leave discount blank for no discount enter a % only if needed
 </div>
 {orderLines.map((line, i) => {
 const preview = computeLineItem(line, location);
 return (
 <div key={i} style={{
 display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto auto",
 gap: 12, alignItems: "start", marginBottom: 12,
 background: "#FFF9EF", borderRadius: 10, padding: "12px 14px",
 border: "1px solid #F2C36B"
 }}>
 <div>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      <input type="text" placeholder="Item Name" value={line.customLabel || ''} onChange={e => updateLine(i, 'customLabel', e.target.value)} style={{...inputStyle, padding: '6px 8px'}} />
      <input type="number" placeholder="Unit Price" value={line.customPrice || ''} onChange={e => updateLine(i, 'customPrice', e.target.value)} style={{...inputStyle, padding: '6px 8px'}} />
    </div>
 </div>
 <div>
 <input type="number" min={1} value={line.qty}
 onChange={e => updateLine(i, "qty", e.target.value)} style={inputStyle}
 placeholder="Qty" />
 </div>
 <div>
 <div style={{ position: "relative" }}>
 <input
 type="number" min={0} max={100} step={0.5}
 value={line.manualDiscount}
 onChange={e => updateLine(i, "manualDiscount", e.target.value)}
 placeholder="Optional %"
 style={{...inputStyle, paddingRight: 28 }}
 />
 <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#9C6B22", pointerEvents: "none" }}>%</span>
 </div>
 </div>
 <div style={{ textAlign: "right", minWidth: 90, paddingTop: 8 }}>
 {preview && (
 <div>
 <div style={{ fontSize: 13, fontWeight: "bold", color: "#7A0008" }}>{fmt(preview.subtotal)}</div>
 {preview.discountPct > 0 && (
 <div style={{ fontSize: 11, color: "#A86612" }}>{preview.discountPct.toFixed(1)}%</div>
 )}
 </div>
 )}
 </div>
 <button onClick={() => removeLine(i)} style={{
 background: "none", border: "1px solid #fca5a5", color: "#dc2626",
 borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 16, marginTop: 2
 }}>Remove</button>
 </div>
 );
 })}
 <button onClick={addLine} style={{
 background: "#fff", border: "2px dashed #E3A23B", color: "#E3A23B",
 padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontSize: 14,
 width: "100%", marginTop: 4, letterSpacing: 0.5
 }}>+ Add Item</button>
 </Section>

 {/* Live Summary */}
 <Section title="Live Cost Summary">
 <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #F2C36B" }}>
 {/* Items breakdown */}
 <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
 <thead>
 <tr style={{ background: "#7A0008", color: "#fff" }}>
 {["Item","Qty","Rate/Unit","Discount","Subtotal"].map(h => (
 <th key={h} style={{ padding: "10px 14px", textAlign: h==="Item"?"left":"right", fontWeight: "normal", letterSpacing: 0.5 }}>{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {bill.items.map((item, i) => (
 <tr key={i} style={{ borderBottom: "1px solid #F2C36B", background: i%2===0?"#FAF7F2":"#fff" }}>
 <td style={{ padding: "10px 14px" }}>
 <div style={{ fontWeight: "bold" }}>{item.label}</div>
 <div style={{ fontSize: 11, color: "#5A0006" }}>{item.category}</div>
 </td>
 <td style={{ padding: "10px 14px", textAlign: "right" }}>{item.qty} {item.unit}</td>
 <td style={{ padding: "10px 14px", textAlign: "right" }}>{fmt(item.pricePerUnit)}</td>
 <td style={{ padding: "10px 14px", textAlign: "right", color: item.discountPct > 0? "#16a34a": "#999" }}>
 {item.discountPct > 0? `${item.discountPct}%`: ""}
 </td>
 <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: "bold" }}>{fmt(item.subtotal)}</td>
 </tr>
 ))}
 </tbody>
 </table>

 {/* Charges */}
 <div style={{ padding: "16px 20px", background: "#FAF7F2", borderTop: "2px solid #F2C36B" }}>
 <ChargeRow label="Items Subtotal" value={fmt(bill.itemsTotal)} />
 {bill.deliveryCharge > 0 && <ChargeRow label={`${SERVICES[service].label} Charge`} value={fmt(bill.deliveryCharge)} />}
 <ChargeRow label="Packaging & Handling" value={fmt(bill.packagingCharge)} />
 {bill.staffingCharge > 0 && <ChargeRow label={`Staffing Surcharge (${pax} guests)`} value={fmt(bill.staffingCharge)} note="For events >150 guests" />}
 <ChargeRow label="Pre-Tax Total" value={fmt(bill.preTax)} bold />
 <ChargeRow label={`CGST @ ${(CGST_RATE*100).toFixed(1)}%`} value={fmt(bill.cgst)} />
 <ChargeRow label={`SGST @ ${(SGST_RATE*100).toFixed(1)}%`} value={fmt(bill.sgst)} />
 <div style={{ marginTop: 12, padding: "14px 16px", background: "#7A0008", borderRadius: 10, display: "flex", justifyContent: "space-between", color: "#fff" }}>
 <span style={{ fontSize: 18, letterSpacing: 1 }}>GRAND TOTAL</span>
 <span style={{ fontSize: 22, fontWeight: "bold" }}>{fmt(bill.grandTotal)}</span>
 </div>
 </div>
 </div>
 </Section>

 {/* Generate Formal Quote */}
 <div style={{ textAlign: "center", marginTop: 8 }}>
 <button onClick={() => setShowBill(b => !b)} style={{
 background: "linear-gradient(135deg, #7A0008, #F2C36B)",
 color: "#fff", border: "none", padding: "14px 40px",
 borderRadius: 50, fontSize: 15, cursor: "pointer", letterSpacing: 1,
 boxShadow: "0 4px 20px rgba(194,65,12,0.4)"
 }}>
 {showBill ? "Hide Formal Quotation" : "Generate Formal Quotation"}
 </button>

 {showBill && (
   <button onClick={() => {
     const printContent = document.getElementById('quotation-bill').innerHTML;
     const printWindow = window.open('', '', 'width=800,height=900');
     printWindow.document.write(`
       <html>
         <head>
           <title>Quotation - Balaji Perfect Caters</title>
           <style>
             body { font-family: 'Outfit', sans-serif; padding: 20px; color: #5A0006; }
             * { box-sizing: border-box; }
             @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
           </style>
         </head>
         <body>
           ${printContent}
           <script>
             window.onload = function() { window.print(); window.close(); }
           </script>
         </body>
       </html>
     `);
     printWindow.document.close();
   }} style={{
     background: "#5A0006", color: "#fff", border: "none", padding: "14px 24px",
     borderRadius: 50, fontSize: 15, cursor: "pointer", marginLeft: 16
   }}>
     Download as PDF
   </button>
 )}
 </div>

 {showBill && (
 <div id="quotation-bill" style={{
 marginTop: 28, background: "#fff", borderRadius: 16, padding: "36px 40px",
 border: "2px solid #F2C36B", boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
 position: "relative", overflow: "hidden"
 }}>
 <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/bpc-logo.jpeg')", backgroundPosition: "center", backgroundSize: "contain", backgroundRepeat: "no-repeat", opacity: 0.06, zIndex: 0, pointerEvents: "none" }} />
 <div style={{ position: "relative", zIndex: 1 }}>
 <div style={{ borderBottom: "3px double #7A0008", paddingBottom: 20, marginBottom: 24 }}>
 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
 <div>
 <div style={{ fontSize: 22, fontWeight: "bold", color: "#7A0008" }}>Balaji Perfect Caters</div>
 <div style={{ fontSize: 12, color: "#5A0006", marginTop: 4 }}>Premium Catering Services</div>
 </div>
 <div style={{ textAlign: "right" }}>
 <div style={{ fontSize: 18, fontWeight: "bold", color: "#7A0008" }}>QUOTATION</div>
 <div style={{ fontSize: 12, color: "#5A0006" }}>Date: {new Date().toLocaleDateString("en-IN", {day:"2-digit",month:"long",year:"numeric"})}</div>
 <div style={{ fontSize: 12, color: "#5A0006" }}>Valid for 7 days</div>
 </div>
 </div>
 </div>

 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28, fontSize: 13 }}>
 <div>
 <div style={{ fontWeight: "bold", color: "#7A0008", marginBottom: 6, textTransform: "uppercase", fontSize: 11, letterSpacing: 1 }}>Bill To</div>
 <div style={{ fontWeight: "bold", fontSize: 15 }}>{clientName || ""}</div>
 <div style={{ color: "#5A0006", marginTop: 4 }}>
 Event Date: {eventDate? new Date(eventDate).toLocaleDateString("en-IN", {day:"2-digit",month:"long",year:"numeric"}): ""}<br/>
 Guests: {pax} pax<br/>
 Location: {LOCATION_MULTIPLIERS[location].label}<br/>
 Service: {SERVICES[service].label}
 </div>
 </div>
 {bill.items.some(i => i.discountPct > 0) && (
 <div style={{ background: "#FFF8E8", borderRadius: 10, padding: "12px 16px", border: "1px solid #F2C36B" }}>
 <div style={{ fontWeight: "bold", color: "#7A0008", marginBottom: 6, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Discounts Applied</div>
 {bill.items.filter(i => i.discountPct > 0).map(i => (
 <div key={i.key} style={{ fontSize: 12, color: "#7A0008" }}> {i.label}: {i.discountPct.toFixed(1)}% off</div>
 ))}
 </div>
 )}
 </div>

 <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 24 }}>
 <thead>
 <tr style={{ borderBottom: "2px solid #7A0008" }}>
 {["#","Item","Category","Qty","Base Rate","Adj. Rate","Disc.","Total"].map(h => (
 <th key={h} style={{ padding: "8px 10px", textAlign: h==="Item"||h==="#"||h==="Category"?"left":"right", color: "#7A0008", fontWeight: "bold", fontSize: 11, textTransform: "uppercase" }}>{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {bill.items.map((item, i) => (
 <tr key={i} style={{ borderBottom: "1px solid #F2C36B" }}>
 <td style={{ padding: "9px 10px", color: "#5A0006" }}>{i+1}</td>
 <td style={{ padding: "9px 10px", fontWeight: "bold" }}>{item.label}</td>
 <td style={{ padding: "9px 10px", color: "#5A0006" }}>{item.category}</td>
 <td style={{ padding: "9px 10px", textAlign: "right" }}>{item.qty} {item.unit}</td>
 <td style={{ padding: "9px 10px", textAlign: "right", color: "#5A0006", textDecoration: item.discountPct > 0? "line-through": "none" }}>{fmt(item.adjustedBase)}</td>
 <td style={{ padding: "9px 10px", textAlign: "right" }}>{fmt(item.pricePerUnit)}</td>
 <td style={{ padding: "9px 10px", textAlign: "right", color: item.discountPct > 0? "#A86612": "#999" }}>{item.discountPct > 0? `${item.discountPct.toFixed(1)}%`: ""}</td>
 <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: "bold" }}>{fmt(item.subtotal)}</td>
 </tr>
 ))}
 </tbody>
 </table>

 <div style={{ display: "flex", justifyContent: "flex-end" }}>
 <div style={{ minWidth: 280, fontSize: 13 }}>
 <FRow label="Items Subtotal" value={fmt(bill.itemsTotal)} />
 {bill.deliveryCharge > 0 && <FRow label={SERVICES[service].label} value={fmt(bill.deliveryCharge)} />}
 <FRow label="Packaging & Handling" value={fmt(bill.packagingCharge)} />
 {bill.staffingCharge > 0 && <FRow label="Staffing Surcharge" value={fmt(bill.staffingCharge)} />}
 <FRow label="Pre-Tax Amount" value={fmt(bill.preTax)} divider />
 <FRow label={`CGST (${(CGST_RATE*100).toFixed(1)}%)`} value={fmt(bill.cgst)} />
 <FRow label={`SGST (${(CGST_RATE*100).toFixed(1)}%)`} value={fmt(bill.sgst)} />
 <div style={{
 display: "flex", justifyContent: "space-between", padding: "12px 0",
 borderTop: "3px double #7A0008", marginTop: 6, fontWeight: "bold", fontSize: 16, color: "#7A0008"
 }}>
 <span>Grand Total</span><span>{fmt(bill.grandTotal)}</span>
 </div>
 <div style={{ fontSize: 11, color: "#5A0006", textAlign: "right", marginTop: 4 }}>
 Amount in words: {toWords(bill.grandTotal)} rupees only
 </div>
 </div>
 </div>
  {/* Signed by */}
  <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, paddingTop: 24, borderTop: '1px solid #E3A23B' }}>
  <div style={{ textAlign: 'center' }}>
  <div style={{ borderTop: '1px solid #5A0006', marginBottom: 8, paddingTop: 8, color: '#7A0008', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }}>CUSTOMER SIGNATURE</div>
  <div style={{ fontSize: 11, color: '#9C6B22' }}>Signed by: {clientName || '_______________'}</div>
  </div>
  <div style={{ textAlign: 'center' }}>
  <div style={{ borderTop: '1px solid #5A0006', marginBottom: 8, paddingTop: 8, color: '#7A0008', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }}>AUTHORISED SIGNATORY</div>
  <div style={{ fontSize: 11, color: '#9C6B22' }}>Signed by: Balaji Perfect Caters</div>
  </div>
  </div>
  </div>
  </div>
  )}
  </div>
 </div>
 </AdminLayout>
 );
}

// SMALL HELPERS 

function Section({ title, children }) {
 return (
 <div style={{ marginBottom: 24 }}>
 <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#9C6B22", marginBottom: 12, fontWeight: "bold" }}>
 {title}
 </div>
 {children}
 </div>
 );
}

function Field({ label, children }) {
 return (
 <div>
 <label style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#5A0006", display: "block", marginBottom: 5 }}>{label}</label>
 {children}
 </div>
 );
}

function Note({ children }) {
 return <div style={{ fontSize: 11, color: "#9C6B22", marginTop: 4 }}> {children}</div>;
}

function ChargeRow({ label, value, bold, note }) {
 return (
 <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px dashed #F2C36B", fontSize: bold? 14: 13, fontWeight: bold? "bold": "normal" }}>
 <span>{label}{note && <span style={{ fontSize: 11, color: "#9C6B22", marginLeft: 6 }}>({note})</span>}</span>
 <span>{value}</span>
 </div>
 );
}

function FRow({ label, value, divider }) {
 return (
 <div style={{
 display: "flex", justifyContent: "space-between",
 padding: "6px 0",
 borderTop: divider? "1px solid #E3A23B": "none",
 marginTop: divider? 6: 0
 }}>
 <span style={{ color: "#5A0006" }}>{label}</span>
 <span style={{ fontWeight: divider? "bold": "normal" }}>{value}</span>
 </div>
 );
}

const inputStyle = {
 width: "100%", padding: "9px 12px", borderRadius: 8,
 border: "1px solid #F2C36B", background: "#FAF7F2",
 fontSize: 13, color: "#1a0f00", outline: "none",
 boxSizing: "border-box", fontFamily: "inherit"
};

function toWords(n) {
 const ones = ["","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
 const tens = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
 const int = Math.floor(n);
 if (int === 0) return "zero";
 const parts = [];
 if (int >= 100000) { parts.push(toWords(Math.floor(int/100000)) + " lakh"); }
 if (int % 100000 >= 1000) { parts.push(toWords(Math.floor((int%100000)/1000)) + " thousand"); }
 if (int % 1000 >= 100) { parts.push(ones[Math.floor((int%1000)/100)] + " hundred"); }
 const rem = int % 100;
 if (rem >= 20) { parts.push(tens[Math.floor(rem/10)] + (rem%10? "-" + ones[rem%10]: "")); }
 else if (rem > 0) { parts.push(ones[rem]); }
 return parts.join(" ");
}
