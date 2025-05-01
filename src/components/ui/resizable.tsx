// components/ui/resizable.tsx

'use client'

import * as React from 'react'
import {
    PanelResizeHandle as PanelResizeHandlePrimitive,
    Panel as ResizablePanelPrimitive,
    PanelGroup as ResizablePanelGroupPrimitive,
    } from 'react-resizable-panels'
    import { cn } from '@/lib/utils'

    // Explicit ref types
    type PanelGroupRef = HTMLDivElement
    type PanelRef = HTMLDivElement
    type PanelResizeHandleRef = HTMLDivElement

    const ResizablePanelGroup = React.forwardRef<
    PanelGroupRef,
    React.ComponentPropsWithoutRef<typeof ResizablePanelGroupPrimitive>
    >(({ className, ...props }, ref) => (
    <ResizablePanelGroupPrimitive
        ref={ref}
        className={cn('flex w-full', className)}
        {...props}
    />
    ))
    ResizablePanelGroup.displayName = 'ResizablePanelGroup'

    const ResizablePanel = React.forwardRef<
    PanelRef,
    React.ComponentPropsWithoutRef<typeof ResizablePanelPrimitive>
    >(({ className, ...props }, ref) => (
    <ResizablePanelPrimitive
        ref={ref}
        className={cn('h-full', className)}
        {...props}
    />
    ))
    ResizablePanel.displayName = 'ResizablePanel'

    const ResizableHandle = React.forwardRef<
    PanelResizeHandleRef,
    React.ComponentPropsWithoutRef<typeof PanelResizeHandlePrimitive>
    >(({ className, ...props }, ref) => (
    <PanelResizeHandlePrimitive
        ref={ref}
        className={cn(
        'relative flex w-px items-center justify-center bg-border after:absolute after:h-4 after:w-1 after:rounded-full after:bg-muted',
        className
        )}
        {...props}
    />
))
ResizableHandle.displayName = 'ResizableHandle'

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }