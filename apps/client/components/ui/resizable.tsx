'use client';

import { GripHorizontal, GripVertical } from 'lucide-react';
import * as ResizablePrimitive from 'react-resizable-panels';

import { cn } from '@/lib/utils';

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
      className,
    )}
    {...props}
  />
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
  withHandle = true,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      `relative flex items-center justify-center transition-colors bg-blue-500/50 hover:bg-blue-400
      focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
      w-1 data-[panel-group-direction=vertical]:w-full
      h-full data-[panel-group-direction=vertical]:h-2.5
      after:absolute after:inset-0 after:m-auto
      data-[panel-group-direction=horizontal]:after:w-4 data-[panel-group-direction=horizontal]:after:h-full
      data-[panel-group-direction=vertical]:after:h-4 data-[panel-group-direction=vertical]:after:w-full`,
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-20 flex items-center justify-center rounded-full bg-slate-200 text-slate-900 border border-white/80 shadow-lg transition-transform hover:scale-110 active:scale-95 data-[panel-group-direction=vertical]:h-3.5 data-[panel-group-direction=vertical]:w-12 data-[panel-group-direction=horizontal]:h-12 data-[panel-group-direction=horizontal]:w-3.5">
        <GripVertical className="h-3 w-3 data-[panel-group-direction=vertical]:hidden" />
        <GripHorizontal className="h-3.5 w-3.5 hidden data-[panel-group-direction=vertical]:block text-slate-900" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
