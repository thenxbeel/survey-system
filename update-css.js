const fs = require('fs');

const css = `
/* ============================================================
   DARK MODE - FULL SLATE / BLUE PALETTE
   ============================================================ */

[data-theme="dark"] {
  --primary:        #3B82F6;
  --primary-dark:   #2563EB;
  --primary-deeper: #1D4ED8;
  --primary-light:  #60A5FA;
  --accent:         #3B82F6;
  --accent-soft:    rgba(59, 130, 246, 0.12);

  --bg:             #0F172A;
  --bg-subtle:      #111827;
  --card:           #1E293B;
  --border:         #334155;
  --border-strong:  #64748B;
  
  --text:           #F8FAFC;
  --text-secondary: #CBD5E1;
  --text-light:     #94A3B8;
  --text-muted:     #64748B;
  
  --shadow-xs:  0 1px 2px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.4);
  --shadow:     0 2px 10px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.4);
  --shadow-md:  0 8px 24px rgba(0,0,0,0.6), 0 3px 10px rgba(0,0,0,0.4);
  --shadow-lg:  0 16px 48px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4);
  --shadow-xl:  0 32px 80px rgba(0,0,0,0.6), 0 8px 32px rgba(0,0,0,0.4);

  --sidebar-bg:  #111827;
  --login-bg:    #0F172A;
  --hero-bg:     #0F172A;

  --tint-blue:      #172554;
  --tint-blue-fg:   #60A5FA;
  --tint-emerald:   #052E16;
  --tint-emerald-fg:#4ADE80;
  --tint-amber:     #3B2200;
  --tint-amber-fg:  #FBBF24;
  --tint-red:       #3F0D0D;
  --tint-red-fg:    #F87171;
  --tint-purple:    #2E1065;
  --tint-purple-fg: #A78BFA;
}

@media (prefers-color-scheme: dark) {
  [data-theme="system"] {
    --primary:        #3B82F6;
    --primary-dark:   #2563EB;
    --primary-deeper: #1D4ED8;
    --primary-light:  #60A5FA;
    --accent:         #3B82F6;
    --accent-soft:    rgba(59, 130, 246, 0.12);
  
    --bg:             #0F172A;
    --bg-subtle:      #111827;
    --card:           #1E293B;
    --border:         #334155;
    --border-strong:  #64748B;
    
    --text:           #F8FAFC;
    --text-secondary: #CBD5E1;
    --text-light:     #94A3B8;
    --text-muted:     #64748B;
    
    --shadow-xs:  0 1px 2px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.4);
    --shadow:     0 2px 10px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.4);
    --shadow-md:  0 8px 24px rgba(0,0,0,0.6), 0 3px 10px rgba(0,0,0,0.4);
    --shadow-lg:  0 16px 48px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4);
    --shadow-xl:  0 32px 80px rgba(0,0,0,0.6), 0 8px 32px rgba(0,0,0,0.4);
  
    --sidebar-bg:  #111827;
    --login-bg:    #0F172A;
    --hero-bg:     #0F172A;

    --tint-blue:      #172554;
    --tint-blue-fg:   #60A5FA;
    --tint-emerald:   #052E16;
    --tint-emerald-fg:#4ADE80;
    --tint-amber:     #3B2200;
    --tint-amber-fg:  #FBBF24;
    --tint-red:       #3F0D0D;
    --tint-red-fg:    #F87171;
    --tint-purple:    #2E1065;
    --tint-purple-fg: #A78BFA;
  }
}

@layer utilities {
  [data-theme="dark"] .bg-white,
  [data-theme="dark"] .bg-\\[\\#FFFFFF\\] { background-color: var(--card) !important; }

  [data-theme="dark"] .bg-\\[\\#F5F7FA\\],
  [data-theme="dark"] .bg-\\[\\#F4F7FB\\],
  [data-theme="dark"] .bg-\\[\\#F9FAFB\\],
  [data-theme="dark"] .bg-\\[\\#F8FAFC\\],
  [data-theme="dark"] .bg-\\[\\#EBF0F7\\],
  [data-theme="dark"] .bg-\\[\\#F1F5F9\\],
  [data-theme="dark"] .bg-\\[\\#F8FAFD\\] { background-color: var(--bg-subtle) !important; }

  [data-theme="dark"] .bg-\\[\\#EFF6FF\\],
  [data-theme="dark"] .bg-\\[\\#DBEAFE\\] { background-color: var(--tint-blue) !important; }
  
  [data-theme="dark"] .bg-\\[\\#ECFDF5\\],
  [data-theme="dark"] .bg-\\[\\#D1FAE5\\] { background-color: var(--tint-emerald) !important; }
  
  [data-theme="dark"] .bg-\\[\\#FFFBEB\\],
  [data-theme="dark"] .bg-\\[\\#FEF3C7\\] { background-color: var(--tint-amber) !important; }
  
  [data-theme="dark"] .bg-\\[\\#FEF2F2\\],
  [data-theme="dark"] .bg-\\[\\#FEE2E2\\] { background-color: var(--tint-red) !important; }
  
  [data-theme="dark"] .bg-\\[\\#F5F3FF\\] { background-color: var(--tint-purple) !important; }

  [data-theme="dark"] .text-\\[\\#333333\\],
  [data-theme="dark"] .text-\\[\\#1E293B\\],
  [data-theme="dark"] .text-\\[\\#0D1B2E\\],
  [data-theme="dark"] .text-\\[\\#0F172A\\],
  [data-theme="dark"] .text-gray-900,
  [data-theme="dark"] .text-gray-800,
  [data-theme="dark"] .text-gray-700 { color: var(--text) !important; }

  [data-theme="dark"] .text-\\[\\#475569\\],
  [data-theme="dark"] .text-\\[\\#4A5568\\],
  [data-theme="dark"] .text-\\[\\#555555\\],
  [data-theme="dark"] .text-\\[\\#6B7A90\\],
  [data-theme="dark"] .text-\\[\\#64748B\\] { color: var(--text-secondary) !important; }

  [data-theme="dark"] .text-\\[\\#8A94A6\\],
  [data-theme="dark"] .text-\\[\\#8FA0B5\\],
  [data-theme="dark"] .text-\\[\\#A0AABF\\] { color: var(--text-light) !important; }

  [data-theme="dark"] .text-\\[\\#B0B8C4\\],
  [data-theme="dark"] .text-\\[\\#B0BDCC\\] { color: var(--text-muted) !important; }

  [data-theme="dark"] .border-\\[\\#E6EDF3\\],
  [data-theme="dark"] .border-\\[\\#E2E8F3\\],
  [data-theme="dark"] .border-\\[\\#C8D4E3\\],
  [data-theme="dark"] .border-\\[\\#CBD5E1\\],
  [data-theme="dark"] .border-\\[\\#F0F4F8\\] { border-color: var(--border) !important; }

  [data-theme="dark"] .text-\\[\\#0B4A8B\\] { color: var(--primary) !important; }
  [data-theme="dark"] .bg-\\[\\#0B4A8B\\] { background-color: var(--primary) !important; }
  [data-theme="dark"] .border-\\[\\#0B4A8B\\] { border-color: var(--primary) !important; }
  
  @media (prefers-color-scheme: dark) {
    [data-theme="system"] .bg-white,
    [data-theme="system"] .bg-\\[\\#FFFFFF\\] { background-color: var(--card) !important; }

    [data-theme="system"] .bg-\\[\\#F5F7FA\\],
    [data-theme="system"] .bg-\\[\\#F4F7FB\\],
    [data-theme="system"] .bg-\\[\\#F9FAFB\\],
    [data-theme="system"] .bg-\\[\\#F8FAFC\\],
    [data-theme="system"] .bg-\\[\\#EBF0F7\\],
    [data-theme="system"] .bg-\\[\\#F1F5F9\\],
    [data-theme="system"] .bg-\\[\\#F8FAFD\\] { background-color: var(--bg-subtle) !important; }

    [data-theme="system"] .bg-\\[\\#EFF6FF\\],
    [data-theme="system"] .bg-\\[\\#DBEAFE\\] { background-color: var(--tint-blue) !important; }
    
    [data-theme="system"] .bg-\\[\\#ECFDF5\\],
    [data-theme="system"] .bg-\\[\\#D1FAE5\\] { background-color: var(--tint-emerald) !important; }
    
    [data-theme="system"] .bg-\\[\\#FFFBEB\\],
    [data-theme="system"] .bg-\\[\\#FEF3C7\\] { background-color: var(--tint-amber) !important; }
    
    [data-theme="system"] .bg-\\[\\#FEF2F2\\],
    [data-theme="system"] .bg-\\[\\#FEE2E2\\] { background-color: var(--tint-red) !important; }
    
    [data-theme="system"] .bg-\\[\\#F5F3FF\\] { background-color: var(--tint-purple) !important; }

    [data-theme="system"] .text-\\[\\#333333\\],
    [data-theme="system"] .text-\\[\\#1E293B\\],
    [data-theme="system"] .text-\\[\\#0D1B2E\\],
    [data-theme="system"] .text-\\[\\#0F172A\\],
    [data-theme="system"] .text-gray-900,
    [data-theme="system"] .text-gray-800,
    [data-theme="system"] .text-gray-700 { color: var(--text) !important; }

    [data-theme="system"] .text-\\[\\#475569\\],
    [data-theme="system"] .text-\\[\\#4A5568\\],
    [data-theme="system"] .text-\\[\\#555555\\],
    [data-theme="system"] .text-\\[\\#6B7A90\\],
    [data-theme="system"] .text-\\[\\#64748B\\] { color: var(--text-secondary) !important; }

    [data-theme="system"] .text-\\[\\#8A94A6\\],
    [data-theme="system"] .text-\\[\\#8FA0B5\\],
    [data-theme="system"] .text-\\[\\#A0AABF\\] { color: var(--text-light) !important; }

    [data-theme="system"] .text-\\[\\#B0B8C4\\],
    [data-theme="system"] .text-\\[\\#B0BDCC\\] { color: var(--text-muted) !important; }

    [data-theme="system"] .border-\\[\\#E6EDF3\\],
    [data-theme="system"] .border-\\[\\#E2E8F3\\],
    [data-theme="system"] .border-\\[\\#C8D4E3\\],
    [data-theme="system"] .border-\\[\\#CBD5E1\\],
    [data-theme="system"] .border-\\[\\#F0F4F8\\] { border-color: var(--border) !important; }

    [data-theme="system"] .text-\\[\\#0B4A8B\\] { color: var(--primary) !important; }
    [data-theme="system"] .bg-\\[\\#0B4A8B\\] { background-color: var(--primary) !important; }
    [data-theme="system"] .border-\\[\\#0B4A8B\\] { border-color: var(--primary) !important; }
  }
}
`;

let g = fs.readFileSync('app/globals.css', 'utf8');

let idx = g.indexOf('/* ============================================================');
let lastIdx = idx;
while (idx !== -1) {
  let next = g.indexOf('/* ============================================================', idx + 1);
  if (next !== -1) { lastIdx = next; idx = next; }
  else { break; }
}

if (lastIdx !== -1 && (g.substring(lastIdx).includes('DARK MODE'))) {
  g = g.substring(0, lastIdx);
}

fs.writeFileSync('app/globals.css', g + '\n' + css);
