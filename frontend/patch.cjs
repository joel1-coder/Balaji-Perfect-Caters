const fs = require('fs');
const path = require('path');

// ─── WORK 1: TransactionAudit — Remove checkbox column ──────────────────────
{
  const file = path.join(__dirname, 'src/pages/admin/TransactionAudit.jsx');
  let c = fs.readFileSync(file, 'utf8');

  // Remove the selected state
  c = c.replace(/\n\s*const \[selected, setSelected\] = useState\(\[\]\);/, '');

  // Remove toggle helpers
  c = c.replace(/\n\s*const toggle = \(id\)[\s\S]*?;\n\n\s*const toggleAll[\s\S]*?\};/, '');

  // Remove "items selected" span
  c = c.replace(/<span style=\{\{ color: '#6F6259', fontSize: '0\.85rem' \}\}>\{selected\.length\} items selected<\/span>\s*\n\s*\n\s*/, '');

  // Remove checkbox <th>
  c = c.replace(/<th style=\{s\.th\}>\s*\n\s*<input type="checkbox"[\s\S]*?\/>\s*\n\s*<\/th>\s*\n/, '');

  // Remove checkbox <td> per row
  c = c.replace(/<tr key=\{t\._id\} style=\{\{ \.\.\.s\.tr, backgroundColor: selected\.includes\(t\._id\) \? '#FAF7F2' : 'white' \}\}>\s*\n\s*<td data-label="Select" style=\{s\.td\}><input type="checkbox" checked=\{selected\.includes\(t\._id\)\} onChange=\{\(\) => toggle\(t\._id\)\}\/><\/td>/,
    '<tr key={t._id} style={s.tr}>');

  // Fix colSpan 6 → 5
  c = c.replace('colSpan="6"', 'colSpan="5"');

  fs.writeFileSync(file, c);
  console.log('✓ Work 1 done: TransactionAudit checkboxes removed');
}

// ─── WORK 2: CateringQuotation — Add "Signed by" section ────────────────────
{
  const file = path.join(__dirname, 'src/pages/admin/CateringQuotation.jsx');
  let c = fs.readFileSync(file, 'utf8');

  // Insert signed-by block just before the closing </div></div> of the quotation
  const signedByBlock = `
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
  </div>`;

  // Insert before the last two closing divs inside the bill content
  c = c.replace(
    /(\s*<\/div>\s*<\/div>\s*\)\}\s*<\/div>)/,
    `${signedByBlock}\n  </div>\n  </div>\n  )}\n  </div>`
  );

  fs.writeFileSync(file, c);
  console.log('✓ Work 2 done: Signed by section added to quotation');
}

// ─── WORK 3: QuickBill — Remove 3 step cards, inline customer fields ──────
{
  const file = path.join(__dirname, 'src/pages/admin/QuickBill.jsx');
  let c = fs.readFileSync(file, 'utf8');

  // Remove the entire stepsRow div
  c = c.replace(/\s*<div style=\{s\.stepsRow\} className="quickbill-steps-row">\s*[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\n\s*\n\s*<div style=\{s\.contentArea\}/,
    '\n\n        <div style={s.contentArea}');

  // Replace the memberCard (with Change button + modal) with inline inputs
  c = c.replace(
    /<div style=\{s\.memberCard\}>\s*\n\s*<div>\s*\n\s*<div style=\{s\.memberLabel\}>Customer<\/div>\s*\n\s*<div style=\{s\.memberName\}>\{member\.name\}<\/div>\s*\n\s*<div style=\{s\.memberDept\}>\{member\.dept\}<\/div>\s*\n\s*<\/div>\s*\n\s*<button style=\{s\.memberButton\} onClick=\{handleOpenMember\}>\s*\n\s*Change\s*\n\s*<\/button>\s*\n\s*<\/div>/,
    `<div style={{ padding: '16px', background: 'white', borderRadius: '12px', border: '1px solid #E8DED1', marginBottom: '0' }}>
              <div style={{ fontSize: '0.7rem', color: '#8D7E73', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', marginBottom: '10px' }}>Customer Details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  style={{ padding: '8px 12px', border: '1px solid #E8DED1', borderRadius: '8px', fontSize: '0.9rem', fontFamily: "'Outfit', sans-serif", outline: 'none' }}
                  placeholder="Customer Name"
                  value={member.name}
                  onChange={(e) => setMember({ ...member, name: e.target.value })}
                />
                <input
                  style={{ padding: '8px 12px', border: '1px solid #E8DED1', borderRadius: '8px', fontSize: '0.9rem', fontFamily: "'Outfit', sans-serif", outline: 'none' }}
                  placeholder="Department or Note"
                  value={member.dept}
                  onChange={(e) => setMember({ ...member, dept: e.target.value })}
                />
              </div>
            </div>`
  );

  // Remove the modal entirely
  c = c.replace(/\s*\{showMemberModal && \(\s*\n[\s\S]*?\n\s*\)\}\s*\n/, '\n');

  // Remove showMemberModal and tempMember state
  c = c.replace(/\n\s*const \[showMemberModal, setShowMemberModal\] = useState\(false\);/, '');
  c = c.replace(/\n\s*const \[tempMember, setTempMember\] = useState\(initialMember\);/, '');

  // Remove handleOpenMember and handleUpdateMember
  c = c.replace(/\n\s*const handleOpenMember[\s\S]*?setShowMemberModal\(true\);\s*\n\s*\};/, '');
  c = c.replace(/\n\s*const handleUpdateMember[\s\S]*?setShowMemberModal\(false\);\s*\n\s*\};/, '');

  fs.writeFileSync(file, c);
  console.log('✓ Work 3 done: Step cards removed, inline customer fields added');
}

console.log('\nAll patches applied!');
