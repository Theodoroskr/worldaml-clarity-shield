/**
 * Renders a builder form as a standalone, self-contained HTML questionnaire
 * styled like the reference "Individual Onboarding" document:
 * sticky accent header + progress bar, sticky section nav, card sections,
 * two-column field grid, required/optional badges, and a summary footer.
 */

export interface ExportHtmlField {
  id: string;
  type: string;
  label: string;
  key: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: string[];
}

export interface ExportHtmlOptions {
  name: string;
  description?: string;
  fields: ExportHtmlField[];
  accentColor?: string;
  companyName?: string | null;
  logoUrl?: string | null;
  supportEmail?: string | null;
  showPoweredBy?: boolean;
}

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

interface Section {
  title: string;
  anchor: string;
  fields: ExportHtmlField[];
}

function buildSections(fields: ExportHtmlField[]): Section[] {
  const sections: Section[] = [];
  let current: Section | null = null;
  let i = 0;
  for (const f of fields) {
    if (f.type === "heading") {
      i += 1;
      current = { title: f.label || `Section ${i}`, anchor: `sec-${i}`, fields: [] };
      sections.push(current);
      continue;
    }
    if (!current) {
      i += 1;
      current = { title: "General", anchor: `sec-${i}`, fields: [] };
      sections.push(current);
    }
    current.fields.push(f);
  }
  return sections;
}

function renderControl(f: ExportHtmlField): string {
  const name = esc(f.key || f.id);
  const ph = esc(f.placeholder || "");
  const req = f.required ? " required" : "";
  switch (f.type) {
    case "textarea":
    case "address":
      return `<textarea name="${name}" rows="3" placeholder="${ph}"${req}></textarea>`;
    case "select":
      return `<select name="${name}"${req}><option value="">Select…</option>${(f.options || [])
        .map((o) => `<option value="${esc(o)}">${esc(o)}</option>`)
        .join("")}</select>`;
    case "checkbox":
      return `<label class="chk"><input type="checkbox" name="${name}"${req}><span>${esc(
        f.placeholder || "Yes"
      )}</span></label>`;
    case "file":
      return `<label class="file"><input type="file" name="${name}"${req}><span>Click to upload${
        f.required ? " (required)" : ""
      }</span></label>`;
    case "date":
      return `<input type="date" name="${name}"${req}>`;
    case "number":
      return `<input type="number" name="${name}" placeholder="${ph}"${req}>`;
    case "email":
      return `<input type="email" name="${name}" placeholder="${ph}"${req}>`;
    case "phone":
      return `<input type="tel" name="${name}" placeholder="${ph}"${req}>`;
    default:
      return `<input type="text" name="${name}" placeholder="${ph}"${req}>`;
  }
}

function renderField(f: ExportHtmlField): string {
  const wide =
    f.type === "textarea" || f.type === "address" || f.type === "checkbox" || f.type === "file";
  const badge = f.required
    ? `<span class="req">*</span>`
    : `<span class="opt">Optional</span>`;
  return `<div class="field${wide ? " full" : ""}">
      <label>${esc(f.label)} ${badge}</label>
      ${renderControl(f)}
      ${f.helpText ? `<div class="hint">${esc(f.helpText)}</div>` : ""}
    </div>`;
}

export function exportFormHtml(opts: ExportHtmlOptions): string {
  const accent = /^#[0-9a-fA-F]{3,8}$/.test(opts.accentColor || "")
    ? (opts.accentColor as string)
    : "#7030a0";
  const sections = buildSections(opts.fields);
  const total = opts.fields.filter((f) => f.type !== "heading").length;

  const nav = sections
    .map(
      (s, i) =>
        `<a class="navlink${i === 0 ? " active" : ""}" href="#${s.anchor}"><span class="dot"></span>${esc(
          s.title
        )}</a>`
    )
    .join("");

  const cards = sections
    .map(
      (s, i) => `<section class="card" id="${s.anchor}">
      <div class="card-h"><div class="badge">${i + 1}</div><h2>${esc(s.title)}</h2></div>
      <div class="grid">${s.fields.map(renderField).join("")}</div>
    </section>`
    )
    .join("");

  const title = esc(opts.name || "Onboarding Form");
  const company = esc(opts.companyName || "");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
:root{--accent:${accent};--bg:#f4f6fa;--card:#fff;--ink:#1a2230;--muted:#6b7280;--line:#e5e9f0}
*{box-sizing:border-box}
body{margin:0;font-family:Inter,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased}
a{text-decoration:none}
.top{position:sticky;top:0;z-index:20;background:var(--accent);color:#fff;padding:16px 28px;display:flex;align-items:center;justify-content:space-between;gap:16px;box-shadow:0 2px 10px rgba(0,0,0,.12)}
.top h1{font-size:18px;margin:0;font-weight:700}.top .sub{font-size:12px;opacity:.85;margin-top:2px}
.top img{max-height:34px;border-radius:6px;background:#fff;padding:3px}
.top .save{font-size:13px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.3);color:#fff;padding:8px 14px;border-radius:8px;cursor:pointer}
.progress{height:4px;background:rgba(0,0,0,.08);position:sticky;top:70px;z-index:19}.progress>i{display:block;height:100%;width:0;background:var(--accent);transition:width .3s}
.wrap{display:grid;grid-template-columns:260px 1fr;gap:28px;max-width:1180px;margin:24px auto;padding:0 24px}
.nav{position:sticky;top:110px;align-self:start;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px;max-height:calc(100vh - 140px);overflow:auto}
.navlink{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:9px;font-size:13.5px;color:var(--muted);font-weight:500}
.navlink .dot{width:9px;height:9px;border-radius:50%;background:var(--line);flex:0 0 auto}
.navlink:hover{background:var(--bg);color:var(--ink)}
.navlink.active{background:color-mix(in srgb,var(--accent) 10%,#fff);color:var(--accent);font-weight:600}
.navlink.active .dot{background:var(--accent)}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:24px 26px 26px;margin-bottom:22px;box-shadow:0 1px 3px rgba(16,24,40,.04);scroll-margin-top:120px}
.card-h{display:flex;align-items:center;gap:12px;margin:0 0 18px}
.badge{width:30px;height:30px;border-radius:9px;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px}
.card-h h2{font-size:17px;margin:0;font-weight:700}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px 20px}
.field{display:flex;flex-direction:column;gap:6px;min-width:0}.field.full{grid-column:1/-1}
label{font-size:13px;font-weight:600;color:#374151;display:flex;align-items:center;gap:6px}
.req{color:#d64545;font-weight:700}
.opt{font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;padding:1px 6px;border-radius:5px;background:#eef2f7;color:#6b7280}
input,select,textarea{font:inherit;font-size:14px;padding:10px 12px;border:1px solid #d5dbe6;border-radius:9px;background:#fff;color:var(--ink);width:100%;transition:border .15s,box-shadow .15s}
input:focus,select:focus,textarea:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 18%,#fff)}
select{appearance:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'><path d='M6 9l6 6 6-6'/></svg>");background-repeat:no-repeat;background-position:right 12px center;padding-right:34px}
.hint{font-size:12px;color:var(--muted);line-height:1.45}
.chk{display:flex;align-items:center;gap:9px;font-weight:500;color:var(--ink)}
.chk input{width:auto;margin:0}
.file{display:flex;align-items:center;gap:10px;border:1px dashed #cbd3e0;border-radius:9px;padding:9px 12px;cursor:pointer;background:#fafbfd;font-size:13px;color:var(--muted);font-weight:500}
.file input{display:none}
.foot{display:flex;align-items:center;justify-content:space-between;gap:16px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px 22px;margin-bottom:40px}
.foot .meta{font-size:12.5px;color:var(--muted)}
.submit{background:var(--accent);color:#fff;border:none;border-radius:10px;padding:12px 22px;font-weight:700;font-size:14px;cursor:pointer}
.pb{text-align:center;font-size:11.5px;color:var(--muted);padding-bottom:30px}
@media(max-width:900px){.wrap{grid-template-columns:1fr}.nav{display:none}.grid{grid-template-columns:1fr}}
@media print{.top,.progress,.nav,.submit{position:static}.nav{display:none}.wrap{grid-template-columns:1fr}}
</style></head>
<body>
<header class="top">
  <div style="display:flex;align-items:center;gap:14px">
    ${opts.logoUrl ? `<img src="${esc(opts.logoUrl)}" alt="${company || title} logo">` : ""}
    <div><h1>${title}</h1><div class="sub">${esc(
      opts.description || company || "Customer due diligence questionnaire"
    )}</div></div>
  </div>
  <button class="save" type="button" onclick="window.print()">Print / Save PDF</button>
</header>
<div class="progress"><i id="bar"></i></div>
<form class="wrap" id="f" onsubmit="event.preventDefault();alert('This is a standalone export — connect it to your endpoint to submit.');">
  <nav class="nav">${nav}</nav>
  <div>
    ${cards}
    <div class="foot">
      <div class="meta">${total} question${total === 1 ? "" : "s"}${
        opts.supportEmail ? ` · Questions? <a href="mailto:${esc(opts.supportEmail)}">${esc(opts.supportEmail)}</a>` : ""
      }</div>
      <button class="submit" type="submit">Submit questionnaire</button>
    </div>
    ${opts.showPoweredBy === false ? "" : `<div class="pb">Powered by WorldAML</div>`}
  </div>
</form>
<script>
(function(){
  var form=document.getElementById('f'),bar=document.getElementById('bar');
  var links=[].slice.call(document.querySelectorAll('.navlink'));
  var cards=[].slice.call(document.querySelectorAll('.card'));
  function pct(){
    var els=[].slice.call(form.querySelectorAll('input,select,textarea'));
    var filled=els.filter(function(e){return e.type==='checkbox'?e.checked:!!e.value;}).length;
    bar.style.width=(els.length?Math.round(filled/els.length*100):0)+'%';
  }
  form.addEventListener('input',pct);form.addEventListener('change',pct);pct();
  window.addEventListener('scroll',function(){
    var y=window.scrollY+160,idx=0;
    cards.forEach(function(c,i){if(c.offsetTop<=y)idx=i;});
    links.forEach(function(l,i){l.classList.toggle('active',i===idx);});
  });
})();
</script>
</body></html>`;
}
