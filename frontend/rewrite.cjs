const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'admin', 'CateringQuotation.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Remove MENU entirely, up to LOCATION_MULTIPLIERS
content = content.replace(/const MENU = \{[\s\S]*?\};\r?\n/, '');

// 2. Update computeLineItem
content = content.replace(
  /function computeLineItem\(line, locationKey\) \{[\s\S]*?if \(!item \|\| line\.qty <= 0\) return null;/,
  `function computeLineItem(line, locationKey) {
  const item = { label: line.customLabel || 'Custom Item', basePrice: Number(line.customPrice) || 0, unit: line.customUnit || 'unit', category: 'Custom' };
  if (line.qty <= 0) return null;`
);

// 3. Remove categories definition
content = content.replace(/const categories = \[\.\.\.new Set\(Object\.values\(MENU\)\.map\(m => m\.category\)\)\];\r?\n/, '');

// 4. Update initial state and addLine
content = content.replace(
  /const \[orderLines, setOrderLines\] = useState\(\[\{ key: "idli", qty: 100, manualDiscount: "" \}\]\);/,
  `const [orderLines, setOrderLines] = useState([{ key: "custom", customLabel: "", customPrice: "", customUnit: "unit", qty: 50, manualDiscount: "" }]);`
);

content = content.replace(
  /const addLine = \(\) => setOrderLines\(prev => \[\.\.\.prev, \{ key: "idli", qty: 50, manualDiscount: "" \}\]\);/,
  `const addLine = () => setOrderLines(prev => [...prev, { key: "custom", customLabel: "", customPrice: "", customUnit: "unit", qty: 50, manualDiscount: "" }]);`
);

// 5. Update the map rendering loop (remove select completely)
content = content.replace(
  /<select value=\{line\.key\}[\s\S]*?<\/select>\r?\n\s*\{line\.key === 'custom' && \(\r?\n\s*<div style=\{\{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 \}\}>\r?\n\s*<input type="text" placeholder="Item Name"[\s\S]*?<\/div>\r?\n\s*\)\}/,
  `<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      <input type="text" placeholder="Item Name" value={line.customLabel || ''} onChange={e => updateLine(i, 'customLabel', e.target.value)} style={{...inputStyle, padding: '6px 8px'}} />
      <input type="number" placeholder="Unit Price" value={line.customPrice || ''} onChange={e => updateLine(i, 'customPrice', e.target.value)} style={{...inputStyle, padding: '6px 8px'}} />
    </div>`
);

fs.writeFileSync(file, content);
console.log('done');
