const fs = require('fs');
const file = 'C:\\Canteen\\frontend\\src\\pages\\admin\\CateringQuotation.jsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

for(let i=0; i<lines.length; i++) {
  if (lines[i].includes('const preview = computeLineItem(line.key, line.qty, location, line.manualDiscount);')) {
    lines[i] = '  const preview = computeLineItem(line, location);';
  }
}

for(let i=0; i<lines.length; i++) {
  if (lines[i].includes('</select>') && lines[i-1] && lines[i-1].includes('))}')) {
    if (lines[i-2] && lines[i-2].includes('</optgroup>')) {
      lines[i] = `  <optgroup label="Custom Options">
    <option value="custom">Custom Item...</option>
  </optgroup>
  </select>
  {line.key === 'custom' && (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
      <input type="text" placeholder="Item Name" value={line.customLabel || ''} onChange={e => updateLine(i, 'customLabel', e.target.value)} style={{...inputStyle, padding: '6px 8px'}} />
      <input type="number" placeholder="Unit Price" value={line.customPrice || ''} onChange={e => updateLine(i, 'customPrice', e.target.value)} style={{...inputStyle, padding: '6px 8px'}} />
    </div>
  )}`;
      break;
    }
  }
}

fs.writeFileSync(file, lines.join('\n'));
console.log('done via line array');
