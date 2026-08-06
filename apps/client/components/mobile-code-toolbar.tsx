/**
 * Mobile Code Toolbar component for quick symbol insertion on mobile keyboards.
 * Features:
 * - One-tap coding symbols ({ }, ( ), ;, =>, Tab, etc.)
 * - Monaco editor cursor integration
 * - Touch-friendly scrolling strip
 *
 * By Nishant Makwana (https://nishantmakwanaa.lovable.app)
 */

'use client';

import { CornerDownLeft, RotateCcw, RotateCw } from 'lucide-react';
import type * as monaco from 'monaco-editor';

import { Button } from '@/components/ui/button';

interface MobileCodeToolbarProps {
  editor: monaco.editor.IStandaloneCodeEditor | null;
}

const SYMBOLS = [
  '{',
  '}',
  '(',
  ')',
  '<',
  '>',
  '/',
  '=',
  ';',
  ':',
  '"',
  "'",
  '`',
  '[',
  ']',
  '+',
  '-',
  '*',
  '!',
  '&',
  '|',
  '=>',
  'Tab'
];

export function MobileCodeToolbar({ editor }: MobileCodeToolbarProps) {
  if (!editor) return null;

  const insertSymbol = (symbol: string) => {
    editor.focus();
    const selection = editor.getSelection();

    if (selection) {
      const textToInsert = symbol === 'Tab' ? '  ' : symbol;
      const op = {
        identifier: { major: 1, minor: 1 },
        range: selection,
        text: textToInsert,
        forceMoveMarkers: true
      };

      editor.executeEdits('mobile-keyboard-toolbar', [op]);
    }
  };

  const handleUndo = () => {
    editor.focus();
    editor.trigger('keyboard', 'undo', null);
  };

  const handleRedo = () => {
    editor.focus();
    editor.trigger('keyboard', 'redo', null);
  };

  return (
    <div
      className="border-border/30 no-scrollbar z-40 flex w-full select-none items-center gap-x-1 overflow-x-auto
        border-t bg-[#1e1e1e] p-1"
    >
      <div className="border-border/20 flex shrink-0 items-center gap-x-1 border-r pr-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          className="text-foreground/80 hover:bg-foreground/10 h-7 px-2 text-xs"
          title="Undo"
        >
          <RotateCcw className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRedo}
          className="text-foreground/80 hover:bg-foreground/10 h-7 px-2 text-xs"
          title="Redo"
        >
          <RotateCw className="size-3.5" />
        </Button>
      </div>

      <div className="flex shrink-0 items-center gap-x-1">
        {SYMBOLS.map(symbol => (
          <Button
            key={symbol}
            variant="secondary"
            size="sm"
            onClick={() => insertSymbol(symbol)}
            className="text-foreground border-border/20 h-7 min-w-[28px] shrink-0 border bg-[#252526] px-2 font-mono
              text-xs shadow-none transition-transform hover:bg-[#37373d] active:scale-95"
          >
            {symbol}
          </Button>
        ))}
      </div>
    </div>
  );
}
