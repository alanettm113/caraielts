// components/ui/resizable.tsx

'use client'

import * as React from 'react'
import {
    PanelResizeHandle as PanelResizeHandlePrimitive,
    Panel as ResizablePanelPrimitive,
    PanelGroup as ResizablePanelGroupPrimitive,
    ImperativePanelGroupHandle,
} from 'react-resizable-panels'
import { cn } from '@/lib/utils'

// ✅ FIX: Use correct ref type for ResizablePanelGroup
    const ResizablePanelGroup = React.forwardRef<
    ImperativePanelGroupHandle,
    React.ComponentPropsWithoutRef<typeof ResizablePanelGroupPrimitive>
    >(({ className, ...props }, ref) => (
    <ResizablePanelGroupPrimitive
        ref={ref}
        className={cn('flex w-full', className)}
        {...props}
    />
    ))
    ResizablePanelGroup.displayName = 'ResizablePanelGroup'

    // ✅ These are fine, still div refs
    const ResizablePanel = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<typeof ResizablePanelPrimitive>
    >(({ className, ...props }, ref) => (
    <ResizablePanelPrimitive
        
        className={cn('h-full', className)}
        {...props}
    />
    ))
    ResizablePanel.displayName = 'ResizablePanel'

    const ResizableHandle = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<typeof PanelResizeHandlePrimitive>
    >(({ className, ...props }, ref) => (
    <PanelResizeHandlePrimitive
        
        className={cn(
        'relative flex w-px items-center justify-center bg-border after:absolute after:h-4 after:w-1 after:rounded-full after:bg-muted',
        className
        )}
        {...props}
    />
    ))
    ResizableHandle.displayName = 'ResizableHandle'

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
