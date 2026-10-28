'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sliders, Crosshair, X, Copy, Check, Move } from 'lucide-react';

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

function VibeTunerInner() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [inspectMode, setInspectMode] = useState(false);
  const [selectedEl, setSelectedEl] = useState<HTMLElement | null>(null);
  const [tweaks, setTweaks] = useState<Record<string, StyleTweak>>({});
  const [copied, setCopied] = useState(false);

  // Portable Draggable button coordinates
  const [btnPos, setBtnPos] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vibe_tuner_btn_pos');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
      return { x: window.innerWidth - 220, y: window.innerHeight - 70 };
    }
    return { x: 100, y: 100 };
  });

  const [panelPos, setPanelPos] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vibe_tuner_panel_pos');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
      return { x: Math.max(16, window.innerWidth - 360), y: 16 };
    }
    return { x: 100, y: 16 };
  });
  const [isPanelDragging, setIsPanelDragging] = useState(false);
  const panelDragRef = React.useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  });

  const handlePanelPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, input, select, textarea, a, [data-interactive]')) {
      return;
    }
    setIsPanelDragging(true);
    panelDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: panelPos.x,
      initY: panelPos.y,
    };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePanelPointerMove = (e: React.PointerEvent) => {
    if (!isPanelDragging) return;
    const dx = e.clientX - panelDragRef.current.startX;
    const dy = e.clientY - panelDragRef.current.startY;
    const newX = Math.max(10, Math.min(window.innerWidth - 350, panelDragRef.current.initX + dx));
    const newY = Math.max(10, Math.min(window.innerHeight - 100, panelDragRef.current.initY + dy));
    setPanelPos({ x: newX, y: newY });
  };

  const handlePanelPointerUp = (e: React.PointerEvent) => {
    if (!isPanelDragging) return;
    setIsPanelDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    localStorage.setItem('vibe_tuner_panel_pos', JSON.stringify(panelPos));
  };
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = React.useRef<{ startX: number; startY: number; initX: number; initY: number; hasMoved: boolean }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
    hasMoved: false,
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: btnPos.x,
      initY: btnPos.y,
      hasMoved: false,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragRef.current.hasMoved = true;
    }
    const newX = Math.max(10, Math.min(window.innerWidth - 210, dragRef.current.initX + dx));
    const newY = Math.max(10, Math.min(window.innerHeight - 60, dragRef.current.initY + dy));
    setBtnPos({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    localStorage.setItem('vibe_tuner_btn_pos', JSON.stringify(btnPos));
  };

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
      <div
        id="vibe-tuner-root"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          position: 'fixed',
          left: `${btnPos.x}px`,
          top: `${btnPos.y}px`,
          zIndex: 99999,
          touchAction: 'none',
          userSelect: 'none',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (!dragRef.current.hasMoved) {
              setIsOpen(true);
              setInspectMode(true);
            }
          }}
          style={{
            background: isDark ? '#141414' : '#FFFFFF',
            color: isDark ? '#FFD700' : '#B45309',
            border: isDark ? '1.5px solid #FFD700' : '1.5px solid #D97706',
            borderRadius: '999px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: isDragging ? 'grabbing' : 'pointer',
            boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.6)' : '0 10px 25px rgba(217, 119, 6, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: isDragging ? 'none' : 'box-shadow 0.2s',
          }}
        >
          <Move style={{ width: 13, height: 13, opacity: 0.7 }} />
          <Sliders style={{ width: 14, height: 14, color: '#FFD700' }} />
          <span>Vibe Tuner (Alt+S)</span>
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
        top: `${panelPos.y}px`,
        left: `${panelPos.x}px`,
        width: '340px',
        maxHeight: 'calc(100vh - 32px)',
        overflowY: 'auto',
        background: isDark ? '#0F172A' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A',
        border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
        borderRadius: '12px',
        padding: '16px',
        zIndex: 99999,
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.65)' : '0 20px 40px rgba(0,0,0,0.15)',
        userSelect: isPanelDragging ? 'none' : 'auto',
      }}
    >
      {/* Draggable Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          padding: '4px 6px',
          borderRadius: '6px',
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
        }}
      >
        {/* Left side drag handle */}
        <div
          onPointerDown={handlePanelPointerDown}
          onPointerMove={handlePanelPointerMove}
          onPointerUp={handlePanelPointerUp}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: isPanelDragging ? 'grabbing' : 'grab',
            touchAction: 'none',
            userSelect: 'none',
            flex: 1,
            padding: '4px 0',
          }}
          title="Drag to reposition panel"
        >
          <Move style={{ width: 13, height: 13, opacity: 0.6 }} />
          <strong style={{ color: isDark ? '#FACC15' : '#D97706', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sliders style={{ width: 14, height: 14 }} /> Live UI Vibe Tuner
          </strong>
        </div>

        {/* Right side buttons container - completely isolated from drag listeners */}
        <div
          data-interactive="true"
          style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 8 }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setInspectMode(!inspectMode);
            }}
            style={{
              background: inspectMode ? '#FACC15' : (isDark ? '#1E293B' : '#E2E8F0'),
              color: inspectMode ? '#0F172A' : (isDark ? '#E2E8F0' : '#0F172A'),
              border: 'none',
              borderRadius: '6px',
              padding: '4px 8px',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Crosshair style={{ width: 12, height: 12 }} />
            <span>{inspectMode ? 'Inspecting' : 'Inspect Off'}</span>
          </button>

          <button
            type="button"
            aria-label="Close Vibe Tuner"
            data-interactive="true"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (selectedEl) selectedEl.style.outline = '';
              setInspectMode(false);
              setIsOpen(false);
            }}
            style={{
              background: isDark ? '#1E293B' : '#F1F5F9',
              color: isDark ? '#94A3B8' : '#64748B',
              border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`,
              borderRadius: '6px',
              padding: '4px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
            title="Close Vibe Tuner"
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>

      <div
        style={{
          background: isDark ? '#1E293B' : '#F1F5F9',
          padding: '8px 10px',
          borderRadius: '8px',
          marginBottom: 14,
          fontSize: '12px',
          color: isDark ? '#CBD5E1' : '#334155',
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
                Toggle Inline Text Edit
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
                Reset
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
            <label style={{ display: 'block', marginBottom: 4, color: isDark ? '#94A3B8' : '#64748B' }}>Font Family</label>
            <select
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value);
                applyStyle('font-family', e.target.value);
              }}
              style={{
                width: '100%',
                background: isDark ? '#1E293B' : '#FFFFFF',
                color: isDark ? '#F8FAFC' : '#0F172A',
                border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`,
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '13px',
                cursor: 'pointer',
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
              <label style={{ display: 'block', color: isDark ? '#94A3B8' : '#64748B' }}>Size: {fontSize}px</label>
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
                style={{ width: '100%', accentColor: '#FFD700', cursor: 'pointer' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: isDark ? '#94A3B8' : '#64748B' }}>Weight: {fontWeight}</label>
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
                style={{ width: '100%', accentColor: '#FFD700', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', color: isDark ? '#94A3B8' : '#64748B' }}>Line Height: {lineHeight}</label>
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
                style={{ width: '100%', accentColor: '#FFD700', cursor: 'pointer' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: isDark ? '#94A3B8' : '#64748B' }}>Tracking: {letterSpacing}px</label>
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
                style={{ width: '100%', accentColor: '#FFD700', cursor: 'pointer' }}
              />
            </div>
          </div>

          <hr style={{ borderColor: isDark ? '#1E293B' : '#E2E8F0', margin: '2px 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', color: isDark ? '#94A3B8' : '#64748B' }}>Padding X: {paddingX}px</label>
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
                style={{ width: '100%', accentColor: '#FFD700', cursor: 'pointer' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: isDark ? '#94A3B8' : '#64748B' }}>Padding Y: {paddingY}px</label>
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
                style={{ width: '100%', accentColor: '#FFD700', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', color: isDark ? '#94A3B8' : '#64748B' }}>Margin Top: {marginTop}px</label>
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
                style={{ width: '100%', accentColor: '#FFD700', cursor: 'pointer' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: isDark ? '#94A3B8' : '#64748B' }}>Margin Btm: {marginBottom}px</label>
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
                style={{ width: '100%', accentColor: '#FFD700', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', color: isDark ? '#94A3B8' : '#64748B' }}>Gap: {gap}px</label>
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
                style={{ width: '100%', accentColor: '#FFD700', cursor: 'pointer' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: isDark ? '#94A3B8' : '#64748B' }}>Radius: {borderRadius}px</label>
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
                style={{ width: '100%', accentColor: '#FFD700', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: isDark ? '#94A3B8' : '#64748B' }}>
                <span>Text Color</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: isDark ? '#F8FAFC' : '#0F172A' }}>{color}</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', background: isDark ? '#1E293B' : '#F1F5F9', border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`, borderRadius: 6 }}>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    applyStyle('color', e.target.value);
                  }}
                  style={{ width: 28, height: 28, border: 'none', padding: 0, borderRadius: 4, cursor: 'pointer', background: 'transparent' }}
                />
                <span style={{ fontSize: '11px', color: isDark ? '#CBD5E1' : '#475569' }}>Pick color</span>
              </div>
            </div>
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: isDark ? '#94A3B8' : '#64748B' }}>
                <span>Background</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: isDark ? '#F8FAFC' : '#0F172A' }}>{bgColor}</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', background: isDark ? '#1E293B' : '#F1F5F9', border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`, borderRadius: 6 }}>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => {
                    setBgColor(e.target.value);
                    applyStyle('background-color', e.target.value);
                  }}
                  style={{ width: 28, height: 28, border: 'none', padding: 0, borderRadius: 4, cursor: 'pointer', background: 'transparent' }}
                />
                <span style={{ fontSize: '11px', color: isDark ? '#CBD5E1' : '#475569' }}>Pick bg</span>
              </div>
            </div>
          </div>

          <div
            style={{
              background: isDark ? '#1E293B' : '#F1F5F9',
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
            background: Object.keys(tweaks).length > 0 ? (isDark ? '#FACC15' : '#D97706') : (isDark ? '#1E293B' : '#E2E8F0'),
            color: Object.keys(tweaks).length > 0 ? (isDark ? '#0F172A' : '#FFFFFF') : (isDark ? '#64748B' : '#94A3B8'),
            border: 'none',
            borderRadius: '8px',
            padding: '10px',
            fontWeight: 700,
            cursor: Object.keys(tweaks).length > 0 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {copied ? (
            <>
              <Check style={{ width: 15, height: 15 }} />
              <span>Copied AI Patch Prompt!</span>
            </>
          ) : (
            <>
              <Copy style={{ width: 15, height: 15 }} />
              <span>Copy Prompt for AI ({Object.keys(tweaks).length} tweaked)</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}


export default function VibeTuner() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  return <VibeTunerInner />;
}
