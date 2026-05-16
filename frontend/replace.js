const fs = require('fs');
const file = 'C:\\Canteen\\frontend\\src\\pages\\admin\\CateringQuotation.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'const preview = computeLineItem(line.key, line.qty, location, line.manualDiscount);',
  'const preview = computeLineItem(line, location);'
);

content = content.replace(
  /<\/optgroup>\r?\n\s*\}\)\}\r?\n\s*<\/select>\r?\n\s*<\/div>/,
  `</optgroup>
  ))}
  <optgroup label="Custom Options">
    <option value="custom">Custom Item...</option>
  </optgroup>
  </select>
  {line.key === 'custom' && (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
      <input type="text" placeholder="Item Name" value={line.customLabel || ''} onChange={e => updateLine(i, "customLabel", e.target.value)} style={{...inputStyle, padding: '6px 8px'}} />
      <input type="number" placeholder="Unit Price" value={line.customPrice || ''} onChange={e => updateLine(i, "customPrice", e.target.value)} style={{...inputStyle, padding: '6px 8px'}} />
    </div>
  )}
  </div>`
);

fs.writeFileSync(file, content);
console.log('done');
