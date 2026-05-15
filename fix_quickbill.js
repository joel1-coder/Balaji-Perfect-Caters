const fs = require('fs');

// Fix QuickBill.jsx
const qbPath = 'frontend/src/pages/admin/QuickBill.jsx';
let qb = fs.readFileSync(qbPath, 'utf8');

// Fix all corrupted characters
const qbFixes = [
  // Trash icon on Clear List button (line 151)
  [/ðŸ—'\s*Clear List/g, '🗑️ Clear List'],
  // Save/disk icon on SAVE ORDER button (line 190)
  [/ðŸ'¾/g, '💾'],
  // Edit pencil icon on member edit button (line 202)
  [/œŽ/g, '✏️'],
  // Recent transactions label (line 234) - "± RECENT TRANSACTIONS"
  [/±\s*RECENT TRANSACTIONS/g, '🕐 RECENT TRANSACTIONS'],
  // [SEARCH] placeholder
  [/\[SEARCH\]/g, '🔍'],
  // [NOTIFY] button
  [/\[NOTIFY\]/g, '🔔'],
  // [MENU] button
  [/\[MENU\]/g, '☰'],
  // [CART] in card title
  [/\[CART\]/g, '🛒'],
  // Rupee symbol corruptions
  [/â‚¹/g, '₹'],
  [/‚¹/g, '₹'],
];

qbFixes.forEach(([pattern, replacement]) => {
  qb = qb.replace(pattern, replacement);
});

fs.writeFileSync(qbPath, qb, 'utf8');
console.log('✅ Fixed QuickBill.jsx');

// Fix UserLayout.jsx
const ulPath = 'frontend/src/components/UserLayout.jsx';
let ul = fs.readFileSync(ulPath, 'utf8');

const ulFixes = [
  [/ðŸ'¤/g, '👤'],   // user icon
  [/âš¡/g, '⚡'],    // lightning bolt
  [/ðŸ"‹/g, '📋'],   // clipboard
  [/â€˜/g, "'"],
  [/Â/g, ''],
  // Any remaining corrupted chars
  [/[^\x00-\x7F\u20B9\u2700-\u27BF\u1F300-\u1F9FF\u2600-\u26FF\u2100-\u214F\u2190-\u21FF]{2,}/g, (m) => {
    console.log('Unhandled in UserLayout:', JSON.stringify(m));
    return m;
  }],
];

ulFixes.forEach(([pattern, replacement]) => {
  ul = ul.replace(pattern, replacement);
});

fs.writeFileSync(ulPath, ul, 'utf8');
console.log('✅ Fixed UserLayout.jsx');

console.log('All done!');
