import React, { useState, useEffect, useCallback } from 'react';

interface StyleTweak {
  selector: string;
  tagName: string;
  textPreview: string;
  changes: Record<string, string>;
}

const FONT_FAMILIES = [
  { label: 'Default / Inherit', value: '' },
  { label: 'Inter (Sans)', value: "'Inter', sans-serif" },
  { label: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', sans-serif" },
  { label: 'Space Grotesk', value: "'Space Grotesk', sans-serif" },
  { label: 'Playfair Display (Serif)', value: "'Playfair Display', serif" },
  { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
];

export default function VibeTuner() {
  const [isOpen, setIsOpen] = useState(false);
  const [inspectMode, setInspectMode] = useState(false);
  const [selectedEl, setSelectedEl] = useState<HTMLElement | null>(null);
  const [tweaks, setTweaks] = useState<Record<string, StyleTweak>>({});
  const [copied, setCopied] = useState(false);

  // Live control states
  const [fontSize, setFontSize] = useState(16);
  const [fontWeight, setFontWeight] = useState(400);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [fontFamily, setFontFamily] = useState('');
  const [paddingX, setPaddingX] = useState(0);
  const [paddingY, setPaddingY] = useState(0);
  const [marginTop, setMarginTop] = useState(0);
  const [marginBottom, setMarginBottom] = useState(0);
  const [gap, setGap] = useState(0);
  const [borderRadius, setBorderRadius] = useState(0);
  const [color, setColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#0f172a');

  const getSelector = (el: HTMLElement): string => {
    if (el.id) return `#${el.id}`;
    const classes = Array.from(el.classList)
      .filter((c) => !c.startsWith('vibe-tuner'))
      .slice(0, 3)
      .join('.');
    return classes ? `${el.tagName.toLowerCase()}.${classes}` : el.tagName.toLowerCase();
  };

  const rgbToHex = (rgb: string) => {
    const match = rgb.match(/\d+/g);
    if (!match || match.length < 3) return '#0f172a';
    return (
      '#' +
      match
        .slice(0, 3)
        .map((x) => parseInt(x, 10).toString(16).padStart(2, '0'))
        .join('')
    );
  };

  // Compute WCAG relative luminance & contrast ratio
  const getContrastRatio = (hex1: string, hex2: string): number => {
    const lum = (hex: string) => {
      const clean = hex.replace('#', '');
      if (clean.length !== 6) return 0;
      const rgb = [0, 2, 4].map((i) => {
        const c = parseInt(clean.slice(i, i + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    };
    const l1 = lum(hex1);
    const l2 = lum(hex2);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
  };

  const loadElementStyles = useCallback((el: HTMLElement) => {
    const computed = window.getComputedStyle(el);
    const fs = parseFloat(computed.fontSize) || 16;
    const lh = parseFloat(computed.lineHeight) / fs || 1.5;

    setFontSize(Math.round(fs));
    setFontWeight(parseInt(computed.fontWeight, 10) || 400);
    setLineHeight(Number(lh.toFixed(2)));
    setLetterSpacing(parseFloat(computed.letterSpacing) || 0);
    setFontFamily(el.style.fontFamily || '');
    setPaddingX(Math.round(parseFloat(computed.paddingLeft) || 0));
    setPaddingY(Math.round(parseFloat(computed.paddingTop) || 0));
    setMarginTop(Math.round(parseFloat(computed.marginTop) || 0));
    setMarginBottom(Math.round(parseFloat(computed.marginBottom) || 0));
    setGap(Math.round(parseFloat(computed.gap) || 0));
    setBorderRadius(Math.round(parseFloat(computed.borderRadius) || 0));
    setColor(rgbToHex(computed.color));
    setBgColor(rgbToHex(computed.backgroundColor));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setInspectMode((prev) => !prev);
      } else if (e.key === 'Escape') {
        setInspectMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!inspectMode) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('#vibe-tuner-root')) return;
      e.preventDefault();
      e.stopPropagation();

      if (selectedEl) selectedEl.style.outline = '';
      target.style.outline = '2px solid #FACC15';
      target.style.outlineOffset = '2px';

      setSelectedEl(target);
      loadElementStyles(target);
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [inspectMode, selectedEl, loadElementStyles]);

  const applyStyle = (prop: string, value: string) => {
    if (!selectedEl) return;
    selectedEl.style.setProperty(prop, value);
    const selector = getSelector(selectedEl);
    const textPreview = (selectedEl.innerText || '').trim().slice(0, 35);

    setTweaks((prev) => ({
      ...prev,
      [selector]: {
        selector,
        tagName: selectedEl.tagName.toLowerCase(),
        textPreview,
        changes: {
          ...(prev[selector]?.changes || {}),
          [prop]: value,
        },
      },
    }));
  };

  const resetSelectedElement = () => {
    if (!selectedEl) return;
    const selector = getSelector(selectedEl);
    const recorded = tweaks[selector]?.changes || {};
    Object.keys(recorded).forEach((prop) => selectedEl.style.removeProperty(prop));
    loadElementStyles(selectedEl);
    setTweaks((prev) => {
      const copy = { ...prev };
      delete copy[selector];
      return copy;
    });
  };

  const copyAgentPrompt = () => {
    const entries = Object.values(tweaks);
    if (entries.length === 0) return;

    const lines = [
      'Please update my source code to permanently apply these exact visual UI tweaks (aligned with Master UI/UX Standard v2.0):',
      '',
      ...entries.map((item, idx) => {
        const props = Object.entries(item.changes)
          .map(([k, v]) => `${k}: ${v}`)
          .join('; ');
        return `${idx + 1}. Element \`${item.selector}\` ${
          item.textPreview ? `(text: "${item.textPreview}...")` : ''
        }\n   - Apply styles: \`${props}\` (convert to matching Tailwind utility classes or design tokens).`;
      }),
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const contrast = getContrastRatio(color, bgColor);

  if (!isOpen) {
    return (
      <div id="vibe-tuner-root" style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 99999 }}>
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setInspectMode(true);
          }}
          style={{
            background: '#0F172A',
            color: '#FACC15',
            border: '1px solid #FACC15',
            borderRadius: '999px',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          }}
        >
          ⚡ Vibe Tuner (Alt+S)
        </button>
      </div>
    );
  }

  return (
    <aside
      id="vibe-tuner-root"
      aria-label="Live UI Vibe Tuner"
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        width: '330px',
        maxHeight: 'calc(100vh - 32px)',
        overflowY: 'auto',
        background: '#0F172A',
        color: '#F8FAFC',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '16px',
        zIndex: 99999,
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.65)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <strong style={{ color: '#FACC15', fontSize: '14px' }}>⚡ Live UI Vibe Tuner</strong>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={() => setInspectMode(!inspectMode)}
            style={{
              background: inspectMode ? '#FACC15' : '#1E293B',
              color: inspectMode ? '#0F172A' : '#E2E8F0',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 8px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {inspectMode ? '🎯 Inspecting' : 'Inspect Off'}
          </button>
          <button
            type="button"
            aria-label="Close Vibe Tuner"
            onClick={() => {
              if (selectedEl) selectedEl.style.outline = '';
              setInspectMode(false);
              setIsOpen(false);
            }}
            style={{
              background: '#1E293B',
              color: '#94A3B8',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      <div
        style={{
          background: '#1E293B',
          padding: '8px 10px',
          borderRadius: '8px',
          marginBottom: 14,
          fontSize: '12px',
          color: '#CBD5E1',
          wordBreak: 'break-all',
        }}
      >
        {selectedEl ? (
          <>
            <span style={{ color: '#FACC15', fontWeight: 600 }}>{getSelector(selectedEl)}</span>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <button
                type="button"
                onClick={() => {
                  selectedEl.contentEditable = selectedEl.contentEditable === 'true' ? 'false' : 'true';
                  selectedEl.focus();
                }}
                style={{
                  background: '#334155',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                ✏️ Toggle Inline Text Edit
              </button>
              <button
                type="button"
                onClick={resetSelectedElement}
                style={{
                  background: '#334155',
                  color: '#FCA5A5',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                ↺ Reset
              </button>
            </div>
          </>
        ) : (
          'Click any element on the page to adjust its spacing, typography, or colors.'
        )}
      </div>

      {selectedEl && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, color: '#94A3B8' }}>Font Family</label>
            <select
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value);
                applyStyle('font-family', e.target.value);
              }}
              style={{
                width: '100%',
                background: '#1E293B',
                color: '#fff',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '6px',
              }}
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f.label} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', color: '#94A3B8' }}>Size: {fontSize}px</label>
              <input
                type="range"
                min={10}
                max={96}
                value={fontSize}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFontSize(val);
                  applyStyle('font-size', `${val}px`);
                }}
                style={{ width: '100%', accentColor: '#FACC15' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94A3B8' }}>Weight: {fontWeight}</label>
              <input
                type="range"
                min={100}
                max={900}
                step={100}
                value={fontWeight}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFontWeight(val);
                  applyStyle('font-weight', String(val));
                }}
                style={{ width: '100%', accentColor: '#FACC15' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', color: '#94A3B8' }}>Line Height: {lineHeight}</label>
              <input
                type="range"
                min={0.9}
                max={2.2}
                step={0.05}
                value={lineHeight}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLineHeight(val);
                  applyStyle('line-height', String(val));
                }}
                style={{ width: '100%', accentColor: '#FACC15' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94A3B8' }}>Tracking: {letterSpacing}px</label>
              <input
                type="range"
                min={-4}
                max={10}
                step={0.5}
                value={letterSpacing}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLetterSpacing(val);
                  applyStyle('letter-spacing', `${val}px`);
                }}
                style={{ width: '100%', accentColor: '#FACC15' }}
              />
            </div>
          </div>

          <hr style={{ borderColor: '#1E293B', margin: '2px 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', color: '#94A3B8' }}>Padding X: {paddingX}px</label>
              <input
                type="range"
                min={0}
                max={128}
                step={4}
                value={paddingX}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPaddingX(val);
                  applyStyle('padding-left', `${val}px`);
                  applyStyle('padding-right', `${val}px`);
                }}
                style={{ width: '100%', accentColor: '#FACC15' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94A3B8' }}>Padding Y: {paddingY}px</label>
              <input
                type="range"
                min={0}
                max={128}
                step={4}
                value={paddingY}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPaddingY(val);
                  applyStyle('padding-top', `${val}px`);
                  applyStyle('padding-bottom', `${val}px`);
                }}
                style={{ width: '100%', accentColor: '#FACC15' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', color: '#94A3B8' }}>Margin Top: {marginTop}px</label>
              <input
                type="range"
                min={0}
                max={128}
                step={4}
                value={marginTop}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMarginTop(val);
                  applyStyle('margin-top', `${val}px`);
                }}
                style={{ width: '100%', accentColor: '#FACC15' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94A3B8' }}>Margin Btm: {marginBottom}px</label>
              <input
                type="range"
                min={0}
                max={128}
                step={4}
                value={marginBottom}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMarginBottom(val);
                  applyStyle('margin-bottom', `${val}px`);
                }}
                style={{ width: '100%', accentColor: '#FACC15' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', color: '#94A3B8' }}>Gap: {gap}px</label>
              <input
                type="range"
                min={0}
                max={64}
                step={4}
                value={gap}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setGap(val);
                  applyStyle('gap', `${val}px`);
                }}
                style={{ width: '100%', accentColor: '#FACC15' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94A3B8' }}>Radius: {borderRadius}px</label>
              <input
                type="range"
                min={0}
                max={48}
                step={2}
                value={borderRadius}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setBorderRadius(val);
                  applyStyle('border-radius', `${val}px`);
                }}
                style={{ width: '100%', accentColor: '#FACC15' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, color: '#94A3B8' }}>Text Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  applyStyle('color', e.target.value);
                }}
                style={{ width: '100%', height: 32, border: 'none', borderRadius: 4, cursor: 'pointer' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, color: '#94A3B8' }}>Background</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => {
                  setBgColor(e.target.value);
                  applyStyle('background-color', e.target.value);
                }}
                style={{ width: '100%', height: 32, border: 'none', borderRadius: 4, cursor: 'pointer' }}
              />
            </div>
          </div>

          <div
            style={{
              background: '#1E293B',
              padding: '6px 10px',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
            }}
          >
            <span>WCAG Contrast Ratio:</span>
            <strong style={{ color: contrast >= 4.5 ? '#4ADE80' : contrast >= 3.0 ? '#FACC15' : '#F87171' }}>
              {contrast}:1 ({contrast >= 4.5 ? 'PASS AA' : contrast >= 3.0 ? 'LARGE TEXT ONLY' : 'FAIL AA'})
            </strong>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #1E293B' }}>
        <button
          type="button"
          onClick={copyAgentPrompt}
          disabled={Object.keys(tweaks).length === 0}
          style={{
            width: '100%',
            background: Object.keys(tweaks).length > 0 ? '#FACC15' : '#1E293B',
            color: Object.keys(tweaks).length > 0 ? '#0F172A' : '#64748B',
            border: 'none',
            borderRadius: '8px',
            padding: '10px',
            fontWeight: 700,
            cursor: Object.keys(tweaks).length > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          {copied
            ? '✅ Copied AI Patch Prompt!'
            : `📋 Copy Prompt for AI (${Object.keys(tweaks).length} tweaked)`}
        </button>
      </div>
    </aside>
  );
}
