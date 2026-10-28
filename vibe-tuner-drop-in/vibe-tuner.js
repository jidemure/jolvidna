/**
 * Live UI Vibe Tuner - Framework-Agnostic Vanilla JS Inspector (Alt + S)
 * Drop into any HTML, Vue, Svelte, Astro, or PHP project via <script src="vibe-tuner.js"></script>
 */
(function () {
  if (document.getElementById('vibe-tuner-vanilla-root')) return;

  let isOpen = false;
  let inspectMode = false;
  let selectedEl = null;
  const tweaks = {};

  const root = document.createElement('div');
  root.id = 'vibe-tuner-vanilla-root';
  document.body.appendChild(root);

  const getSelector = (el) => {
    if (el.id) return '#' + el.id;
    const cls = Array.from(el.classList).slice(0, 3).join('.');
    return cls ? el.tagName.toLowerCase() + '.' + cls : el.tagName.toLowerCase();
  };

  const applyStyle = (prop, val) => {
    if (!selectedEl) return;
    selectedEl.style.setProperty(prop, val);
    const sel = getSelector(selectedEl);
    const text = (selectedEl.innerText || '').trim().slice(0, 35);
    tweaks[sel] = tweaks[sel] || { selector: sel, text, changes: {} };
    tweaks[sel].changes[prop] = val;
    render();
  };

  const copyPrompt = () => {
    const items = Object.values(tweaks);
    if (!items.length) return;
    const lines = [
      'Please update my source code to permanently apply these exact visual UI tweaks:',
      '',
      ...items.map((it, i) => {
        const css = Object.entries(it.changes).map(([k, v]) => k + ': ' + v).join('; ');
        return (i + 1) + '. Element `' + it.selector + '` (' + it.text + '): `' + css + '`';
      }),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    alert('Copied AI Patch Prompt to clipboard!');
  };

  const render = () => {
    if (!isOpen) {
      root.innerHTML = `
        <button id="vt-open-btn" style="position:fixed;bottom:20px;right:20px;z-index:99999;background:#0F172A;color:#FACC15;border:1px solid #FACC15;border-radius:999px;padding:10px 16px;font:700 13px system-ui;cursor:pointer;box-shadow:0 10px 25px rgba(0,0,0,0.5)">
          ⚡ Vibe Tuner (Alt+S)
        </button>`;
      document.getElementById('vt-open-btn').onclick = () => {
        isOpen = true;
        inspectMode = true;
        render();
      };
      return;
    }

    const selName = selectedEl ? getSelector(selectedEl) : 'Click any element on page to inspect';
    const count = Object.keys(tweaks).length;

    root.innerHTML = `
      <aside style="position:fixed;top:16px;right:16px;width:310px;background:#0F172A;color:#F8FAFC;border:1px solid #334155;border-radius:12px;padding:16px;z-index:99999;font:13px system-ui;box-shadow:0 20px 40px rgba(0,0,0,0.65)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <strong style="color:#FACC15">⚡ Live UI Vibe Tuner</strong>
          <button id="vt-close-btn" style="background:#1E293B;color:#94A3B8;border:none;border-radius:6px;padding:4px 8px;cursor:pointer">✕</button>
        </div>
        <div style="background:#1E293B;padding:8px;border-radius:6px;margin-bottom:12px;font-size:12px;color:#FACC15;word-break:break-all">${selName}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
          <label>Font Size (px)<input id="vt-fs" type="range" min="10" max="80" value="16" style="width:100%;accent-color:#FACC15"></label>
          <label>Weight<input id="vt-fw" type="range" min="100" max="900" step="100" value="400" style="width:100%;accent-color:#FACC15"></label>
          <label>Padding X (px)<input id="vt-px" type="range" min="0" max="128" step="4" value="16" style="width:100%;accent-color:#FACC15"></label>
          <label>Padding Y (px)<input id="vt-py" type="range" min="0" max="128" step="4" value="16" style="width:100%;accent-color:#FACC15"></label>
          <label>Gap (px)<input id="vt-gap" type="range" min="0" max="64" step="4" value="12" style="width:100%;accent-color:#FACC15"></label>
          <label>Radius (px)<input id="vt-rad" type="range" min="0" max="48" step="2" value="8" style="width:100%;accent-color:#FACC15"></label>
        </div>
        <button id="vt-copy-btn" style="width:100%;background:#FACC15;color:#0F172A;border:none;border-radius:8px;padding:10px;font-weight:700;cursor:pointer">
          📋 Copy Prompt for AI (${count} tweaked)
        </button>
      </aside>`;

    document.getElementById('vt-close-btn').onclick = () => {
      if (selectedEl) selectedEl.style.outline = '';
      isOpen = false;
      inspectMode = false;
      render();
    };
    document.getElementById('vt-fs').oninput = (e) => applyStyle('font-size', e.target.value + 'px');
    document.getElementById('vt-fw').oninput = (e) => applyStyle('font-weight', e.target.value);
    document.getElementById('vt-px').oninput = (e) => {
      applyStyle('padding-left', e.target.value + 'px');
      applyStyle('padding-right', e.target.value + 'px');
    };
    document.getElementById('vt-py').oninput = (e) => {
      applyStyle('padding-top', e.target.value + 'px');
      applyStyle('padding-bottom', e.target.value + 'px');
    };
    document.getElementById('vt-gap').oninput = (e) => applyStyle('gap', e.target.value + 'px');
    document.getElementById('vt-rad').oninput = (e) => applyStyle('border-radius', e.target.value + 'px');
    document.getElementById('vt-copy-btn').onclick = copyPrompt;
  };

  window.addEventListener('keydown', (e) => {
    if (e.altKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      isOpen = !isOpen;
      inspectMode = isOpen;
      render();
    }
  });

  document.addEventListener(
    'click',
    (e) => {
      if (!inspectMode || e.target.closest('#vibe-tuner-vanilla-root')) return;
      e.preventDefault();
      e.stopPropagation();
      if (selectedEl) selectedEl.style.outline = '';
      selectedEl = e.target;
      selectedEl.style.outline = '2px solid #FACC15';
      selectedEl.style.outlineOffset = '2px';
      render();
    },
    true
  );

  render();
})();
