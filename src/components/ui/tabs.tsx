"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const TAB_VALUES = ["next-n", "month", "custom"] as const;

const SlideDirectionContext = React.createContext<number>(0);

function useSlideDirection() {
  return React.useContext(SlideDirectionContext);
}

type TabsProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>;

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({ onValueChange, value, ...props }, ref) => {
  const prevValueRef = React.useRef(value ?? TAB_VALUES[0]);
  const [slideDirection, setSlideDirection] = React.useState(0);

  React.useEffect(() => {
    if (value != null) prevValueRef.current = value;
  }, [value]);

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      const oldIndex = TAB_VALUES.indexOf(
        (prevValueRef.current ?? TAB_VALUES[0]) as (typeof TAB_VALUES)[number]
      );
      const newIndex = TAB_VALUES.indexOf(newValue as (typeof TAB_VALUES)[number]);
      const direction =
        oldIndex >= 0 && newIndex >= 0 ? (newIndex > oldIndex ? 1 : -1) : 0;
      setSlideDirection(direction);
      prevValueRef.current = newValue;
      onValueChange?.(newValue);
    },
    [onValueChange]
  );

  return (
    <SlideDirectionContext.Provider value={slideDirection}>
      <TabsPrimitive.Root
        ref={ref}
        value={value}
        onValueChange={handleValueChange}
        {...props}
      />
    </SlideDirectionContext.Provider>
  );
});
Tabs.displayName = TabsPrimitive.Root.displayName;

interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  /** Pass the current tab value to enable sliding indicator animation */
  value?: string;
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, value, ...props }, ref) => {
  const activeIndex = value ? TAB_VALUES.indexOf(value as (typeof TAB_VALUES)[number]) : 0;
  const showIndicator = value && activeIndex >= 0;

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "relative inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground transition-colors duration-200",
        showIndicator && "tabs-with-indicator",
        className
      )}
      {...props}
    >
      {showIndicator && (
        <div
          className="tab-indicator-slide absolute left-1 top-1 z-0 h-[calc(100%-8px)] w-[calc((100%-8px)/3)] rounded-md bg-primary shadow-sm"
          style={{ "--tab-index": activeIndex } as React.CSSProperties}
          aria-hidden
        />
      )}
      {props.children}
    </TabsPrimitive.List>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-primary-foreground data-[state=active]:bg-primary [.tabs-with-indicator_&]:z-10 [.tabs-with-indicator_&][data-state=active]:bg-transparent",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const slideDirection = useSlideDirection();
  const slideClass =
    slideDirection === 1
      ? "tab-content-slide-right"
      : slideDirection === -1
        ? "tab-content-slide-left"
        : "animate-fade-in";

  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "mt-4 overflow-hidden ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      <div className={cn("min-w-full", slideClass)}>{children}</div>
    </TabsPrimitive.Content>
  );
});
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
