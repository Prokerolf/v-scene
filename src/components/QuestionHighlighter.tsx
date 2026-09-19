import React, { useRef, useState, useEffect } from 'react';
import { Highlighter, Edit3, RotateCcw, ShieldCheck, Type, Move, PenTool, Hand, Eraser } from 'lucide-react';

interface QuestionHighlighterProps {
  questionId: string;
  questionNumber?: number;
  questionText: string;
  imageUrl?: string;
}

interface Stroke {
  color: string;
  width: number;
  points: { x: number; y: number }[];
}

export const QuestionHighlighter: React.FC<QuestionHighlighterProps> = ({
  questionId,
  questionNumber,
  questionText,
  imageUrl
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Active pointer tracking
  const activePenPointerId = useRef<number | null>(null);

  // Interaction Mode:
  // 'pencil': Apple Pencil/Mouse draw (HARDWARE PALM REJECTION - 100% Page Scroll Lock during drawing)
  // 'finger': Finger and Pencil draw
  // 'scroll': Pure Scroll Mode (Drawing disabled, Finger scrolls page)
  const [interactionMode, setInteractionMode] = useState<'pencil' | 'finger' | 'scroll'>('finger');

  // Drawing Tools: 'highlighter' | 'pen' | 'eraser'
  const [activeTool, setActiveTool] = useState<'highlighter' | 'pen' | 'eraser'>('highlighter');
  const [selectedColor, setSelectedColor] = useState<'yellow' | 'green' | 'red' | 'blue' | 'black'>('yellow');
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokesMap, setStrokesMap] = useState<{ [qId: string]: Stroke[] }>(() => {
    try {
      const saved = localStorage.getItem('vscene_exam_strokes_map');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Text selection highlight state for Mac / PC mouse users
  const [textHighlightsMap, setTextHighlightsMap] = useState<{ [qId: string]: string[] }>(() => {
    try {
      const saved = localStorage.getItem('vscene_exam_text_highlights_map');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('vscene_exam_strokes_map', JSON.stringify(strokesMap));
    } catch (e) {}
  }, [strokesMap]);

  useEffect(() => {
    try {
      localStorage.setItem('vscene_exam_text_highlights_map', JSON.stringify(textHighlightsMap));
    } catch (e) {}
  }, [textHighlightsMap]);

  const currentStrokes = strokesMap[questionId] || [];
  const currentTextHighlights = textHighlightsMap[questionId] || [];

  // Setup Canvas size on mount & resize ONLY when container dimensions change
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newWidth = Math.floor(rect.width);
        const newHeight = Math.floor(rect.height);
        if (canvasRef.current.width !== newWidth || canvasRef.current.height !== newHeight) {
          canvasRef.current.width = newWidth;
          canvasRef.current.height = newHeight;
        }
        redrawCanvas();
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [questionId]);

  // Redraw canvas whenever strokesMap or questionId changes
  useEffect(() => {
    redrawCanvas();
  }, [questionId, strokesMap]);

  // CRITICAL FIX FOR IPAD SAFARI:
  // Force preventDefault on non-passive touch events in Draw modes ('pencil' / 'finger')
  // This COMPLETELY disables iOS Safari native compositor scroll while writing!
  // Allows 2-finger swipe to scroll page even in drawing mode.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventSafariPageScroll = (e: TouchEvent) => {
      if (interactionMode === 'pencil' || interactionMode === 'finger') {
        // Allow 2-finger gesture for page scroll
        if (e.touches.length === 2) {
          return;
        }
        // Single finger / stylus touch: STOP native page scroll completely!
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    // Must be passive: false for e.preventDefault to work in iOS Safari!
    canvas.addEventListener('touchstart', preventSafariPageScroll, { passive: false });
    canvas.addEventListener('touchmove', preventSafariPageScroll, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', preventSafariPageScroll);
      canvas.removeEventListener('touchmove', preventSafariPageScroll);
    };
  }, [interactionMode]);

  // Stroke Eraser: Erase entire stroke when touched
  const eraseStrokesAt = (x: number, y: number) => {
    const eraserRadius = 22;
    setStrokesMap((prev) => {
      const list = prev[questionId] || [];
      if (list.length === 0) return prev;

      const remaining = list.filter((stroke) => {
        const isHit = stroke.points.some((pt) => {
          const dx = pt.x - x;
          const dy = pt.y - y;
          return (dx * dx + dy * dy) <= (eraserRadius * eraserRadius);
        });
        return !isHit;
      });

      if (remaining.length === list.length) return prev;

      return {
        ...prev,
        [questionId]: remaining
      };
    });
  };

  // Redraw canvas strokes smoothly
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const strokes = strokesMap[questionId] || [];
    strokes.forEach((stroke) => {
      if (!stroke.points || stroke.points.length === 0) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      if (stroke.points.length === 1) {
        ctx.lineTo(stroke.points[0].x + 0.1, stroke.points[0].y + 0.1);
      } else {
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
      }
      ctx.stroke();
    });
  };

  // Map color & tool to RGBA & line width
  const getStrokeStyle = () => {
    if (activeTool === 'highlighter') {
      const width = 22;
      switch (selectedColor) {
        case 'yellow': return { color: 'rgba(250, 204, 21, 0.45)', width };
        case 'green': return { color: 'rgba(74, 222, 128, 0.45)', width };
        case 'red': return { color: 'rgba(248, 113, 113, 0.45)', width };
        case 'blue': return { color: 'rgba(96, 165, 250, 0.45)', width };
        case 'black': return { color: 'rgba(148, 163, 184, 0.45)', width };
        default: return { color: 'rgba(250, 204, 21, 0.45)', width };
      }
    } else {
      const width = 3.5;
      switch (selectedColor) {
        case 'yellow': return { color: 'rgba(234, 179, 8, 0.95)', width };
        case 'green': return { color: 'rgba(34, 197, 94, 0.95)', width };
        case 'red': return { color: 'rgba(239, 68, 68, 0.95)', width };
        case 'blue': return { color: 'rgba(59, 130, 246, 0.95)', width };
        case 'black': return { color: 'rgba(30, 41, 59, 0.95)', width };
        default: return { color: 'rgba(239, 68, 68, 0.95)', width };
      }
    }
  };

  // --- HARDWARE PALM REJECTION & STYLUS DISCRIMINATION ---
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (interactionMode === 'scroll') return;

    const isTouch = e.pointerType === 'touch';

    // In 'pencil' mode:
    // Finger touches (isTouch) are IGNORED for drawing, allowing palm rejection.
    if (interactionMode === 'pencil' && isTouch) {
      return;
    }

    // In 'finger' mode: filter out large palm touches (>25px)
    if (interactionMode === 'finger' && isTouch && (e.width > 25 || e.height > 25)) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch (pErr) {
      console.warn("setPointerCapture failed:", pErr);
    }

    activePenPointerId.current = e.pointerId;
    setIsDrawing(true);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'eraser') {
      eraseStrokesAt(x, y);
      return;
    }

    const style = getStrokeStyle();
    const newStroke: Stroke = {
      color: style.color,
      width: style.width,
      points: [{ x, y }]
    };

    setStrokesMap((prev) => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), newStroke]
    }));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || interactionMode === 'scroll') return;
    if (activePenPointerId.current !== null && e.pointerId !== activePenPointerId.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'eraser') {
      eraseStrokesAt(x, y);
      return;
    }

    setStrokesMap((prev) => {
      const currentList = prev[questionId] || [];
      if (currentList.length === 0) return prev;
      const lastStroke = currentList[currentList.length - 1];
      const updatedLast = {
        ...lastStroke,
        points: [...lastStroke.points, { x, y }]
      };
      return {
        ...prev,
        [questionId]: [...currentList.slice(0, -1), updatedLast]
      };
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePenPointerId.current === e.pointerId) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (pErr) {}
      activePenPointerId.current = null;
    }
    setIsDrawing(false);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePenPointerId.current === e.pointerId) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (pErr) {}
      activePenPointerId.current = null;
    }
    setIsDrawing(false);
  };

  const handleClear = () => {
    setStrokesMap((prev) => ({
      ...prev,
      [questionId]: []
    }));
    setTextHighlightsMap((prev) => ({
      ...prev,
      [questionId]: []
    }));
  };

  // Text Selection Highlight (Mouse on Mac/PC)
  const handleHighlightSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const selectedText = selection.toString().trim();
    if (selectedText.length > 0) {
      setTextHighlightsMap((prev) => ({
        ...prev,
        [questionId]: [...(prev[questionId] || []), selectedText]
      }));
      selection.removeAllRanges();
    }
  };

  // Formatting question text
  const formatQuestionText = () => {
    if (!questionText) return '';
    const cleanText = questionText.trim();
    const regex = /^\d+[\.\s]\s*/;
    if (regex.test(cleanText)) {
      return cleanText;
    }
    return questionNumber !== undefined ? `${questionNumber}. ${cleanText}` : cleanText;
  };

  // Render question text with highlights
  const renderHighlightedQuestion = () => {
    let fullText = formatQuestionText();
    if (!currentTextHighlights || currentTextHighlights.length === 0) {
      return <span>{fullText}</span>;
    }

    let parts: { text: string; isHighlighted: boolean }[] = [{ text: fullText, isHighlighted: false }];

    currentTextHighlights.forEach((phrase) => {
      const nextParts: { text: string; isHighlighted: boolean }[] = [];
      parts.forEach((part) => {
        if (part.isHighlighted) {
          nextParts.push(part);
        } else {
          const splitText = part.text.split(phrase);
          splitText.forEach((segment, idx) => {
            if (segment) nextParts.push({ text: segment, isHighlighted: false });
            if (idx < splitText.length - 1) {
              nextParts.push({ text: phrase, isHighlighted: true });
            }
          });
        }
      });
      parts = nextParts;
    });

    return (
      <span>
        {parts.map((p, idx) =>
          p.isHighlighted ? (
            <mark key={idx} className="bg-amber-300 text-slate-900 font-semibold px-1 rounded shadow-sm">
              {p.text}
            </mark>
          ) : (
            <span key={idx}>{p.text}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div className="w-full space-y-3">
      {/* Floating Toolbar with Fixed Single-Row Alignment */}
      <div className="flex items-center justify-center w-full">
        <div className="bg-white/95 backdrop-blur-md shadow-xl border border-slate-200/90 rounded-full px-4 py-2 flex flex-nowrap items-center justify-center gap-3 max-w-full overflow-x-auto whitespace-nowrap">
          
          {/* Main Interaction Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setInteractionMode('pencil')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                interactionMode === 'pencil'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="โหมดเขียนด้วยปากกา Apple Pencil"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>ปากกา</span>
            </button>

            <button
              type="button"
              onClick={() => setInteractionMode('finger')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                interactionMode === 'finger'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="โหมดวาดด้วยนิ้ว"
            >
              <Hand className="w-3.5 h-3.5" />
              <span>นิ้ว</span>
            </button>

            <button
              type="button"
              onClick={() => setInteractionMode('scroll')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                interactionMode === 'scroll'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="โหมดเลื่อนหน้าจอ"
            >
              <Move className="w-3.5 h-3.5" />
              <span>เลื่อน</span>
            </button>
          </div>

          {/* Tools & Colors */}
          <div className={`flex items-center gap-3 shrink-0 transition-opacity ${interactionMode === 'scroll' ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex items-center gap-1 pr-3 border-r border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTool('highlighter')}
                className={`p-2 rounded-xl transition flex items-center justify-center ${
                  activeTool === 'highlighter'
                    ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-400 font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Highlighter"
              >
                <Highlighter className="w-4.5 h-4.5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('pen')}
                className={`p-2 rounded-xl transition flex items-center justify-center ${
                  activeTool === 'pen'
                    ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-400 font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Pen"
              >
                <Edit3 className="w-4.5 h-4.5" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('eraser')}
                className={`p-2 rounded-xl transition flex items-center justify-center ${
                  activeTool === 'eraser'
                    ? 'bg-rose-100 text-rose-800 ring-2 ring-rose-400 font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="ยางลบทั้งเส้น (Stroke Eraser)"
              >
                <Eraser className="w-4.5 h-4.5" />
              </button>

              <button
                type="button"
                onClick={handleHighlightSelection}
                className="p-2 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition"
                title="Highlight Selected Text"
              >
                <Type className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className={`flex items-center gap-2 pr-1 transition-opacity ${activeTool === 'eraser' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              {[
                { id: 'yellow', bg: 'bg-amber-400', ring: 'ring-amber-400' },
                { id: 'green', bg: 'bg-emerald-400', ring: 'ring-emerald-400' },
                { id: 'red', bg: 'bg-red-500', ring: 'ring-red-400' },
                { id: 'blue', bg: 'bg-blue-500', ring: 'ring-blue-400' },
                { id: 'black', bg: 'bg-slate-800', ring: 'ring-slate-700' }
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c.id as any)}
                  className={`w-5 h-5 md:w-6 md:h-6 rounded-full ${c.bg} transition-all ${
                    selectedColor === c.id
                      ? `ring-4 ${c.ring} scale-110 shadow-sm`
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  title={`Color: ${c.id}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Question Container & Canvas Overlay */}
      <div
        ref={containerRef}
        className="relative w-full p-5 md:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden select-text"
      >
        <div className="relative z-10 text-slate-900 font-medium text-lg md:text-xl leading-relaxed">
          {renderHighlightedQuestion()}
          {imageUrl && (
            <div className="my-4 flex justify-center">
              <img
                src={imageUrl}
                alt="Figure for exam question"
                className="max-h-80 w-auto rounded-xl border border-slate-200 shadow-md object-contain"
              />
            </div>
          )}
        </div>

        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onPointerLeave={handlePointerUp}
          className={`absolute inset-0 z-20 ${
            interactionMode === 'pencil' || interactionMode === 'finger'
              ? 'cursor-crosshair'
              : 'pointer-events-none'
          }`}
          style={{
            touchAction: interactionMode === 'scroll' ? 'auto' : 'none'
          }}
        />
      </div>
    </div>
  );
};
