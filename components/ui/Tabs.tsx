'use client';

import { createContext, useContext, ReactNode } from 'react';

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

interface TabsProps {
  value: string;
  onValueChange: (v: string) => void;
  children: ReactNode;
}

export function Tabs({ value, onValueChange, children }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      {children}
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return <div className={`flex space-x-8 ${className}`}>{children}</div>;
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
}

export function TabsTrigger({ value, children }: TabsTriggerProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsTrigger must be inside Tabs');

  const isActive = ctx.value === value;

  return (
    <button
      onClick={() => ctx.onValueChange(value)}
      className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
        isActive
          ? 'border-teal-600 text-teal-600 font-semibold'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
}

export function TabsContent({ value, children }: TabsContentProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsContent must be inside Tabs');

  if (ctx.value !== value) return null;
  return <div>{children}</div>;
}
