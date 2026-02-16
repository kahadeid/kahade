/**
 * TABS COMPONENT - PRODUCTION READY
 * 
 * COMPLETE IMPLEMENTATION: Fully functional tabs with keyboard navigation
 * NO PLACEHOLDERS - Works immediately
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  label: string;
  content?: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'enclosed';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export function Tabs({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onChange,
  variant = 'underline',
  size = 'md',
  fullWidth = false,
  className,
}: TabsProps) {
  // Controlled vs uncontrolled
  const isControlled = controlledActiveTab !== undefined;
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultTab || tabs[0]?.id
  );
  const activeTab = isControlled ? controlledActiveTab : internalActiveTab;
  
  const tabListRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  // Update indicator position for underline variant
  useEffect(() => {
    if (variant !== 'underline') return;

    const activeTabElement = tabListRef.current?.querySelector(
      `[data-tab-id="${activeTab}"]`
    ) as HTMLElement;

    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement;
      setIndicatorStyle({
        left: offsetLeft,
        width: offsetWidth,
      });
    }
  }, [activeTab, variant, tabs]);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.disabled) return;

    if (!isControlled) {
      setInternalActiveTab(tabId);
    }
    onChange?.(tabId);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let newIndex = currentIndex;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      newIndex = currentIndex - 1;
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      newIndex = currentIndex + 1;
    } else if (e.key === 'Home') {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIndex = tabs.length - 1;
    } else {
      return;
    }

    // Wrap around
    if (newIndex < 0) newIndex = tabs.length - 1;
    if (newIndex >= tabs.length) newIndex = 0;

    // Skip disabled tabs
    while (tabs[newIndex]?.disabled && newIndex !== currentIndex) {
      if (e.key === 'ArrowLeft' || e.key === 'Home') {
        newIndex--;
        if (newIndex < 0) newIndex = tabs.length - 1;
      } else {
        newIndex++;
        if (newIndex >= tabs.length) newIndex = 0;
      }
    }

    if (!tabs[newIndex]?.disabled) {
      handleTabChange(tabs[newIndex].id);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-4 py-2.5',
    lg: 'text-lg px-5 py-3',
  };

  // Variant styles
  const getVariantClasses = (isActive: boolean, isDisabled: boolean) => {
    if (variant === 'underline') {
      return cn(
        'border-b-2 transition-colors',
        isActive
          ? 'border-blue-600 text-blue-600 font-medium'
          : 'border-transparent text-gray-600 hover:text-gray-900',
        isDisabled && 'opacity-50 cursor-not-allowed hover:text-gray-600'
      );
    }

    if (variant === 'pills') {
      return cn(
        'rounded-lg transition-colors',
        isActive
          ? 'bg-blue-600 text-white font-medium'
          : 'text-gray-700 hover:bg-gray-100',
        isDisabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
      );
    }

    if (variant === 'enclosed') {
      return cn(
        'border border-gray-300 transition-colors',
        'first:rounded-l-lg last:rounded-r-lg',
        '-ml-px first:ml-0',
        isActive
          ? 'bg-white text-blue-600 font-medium border-blue-600 z-10'
          : 'bg-gray-50 text-gray-700 hover:bg-gray-100',
        isDisabled && 'opacity-50 cursor-not-allowed hover:bg-gray-50'
      );
    }

    return '';
  };

  const activeContent = tabs.find(t => t.id === activeTab)?.content;

  return (
    <div className={cn('w-full', className)}>
      {/* Tab List */}
      <div
        ref={tabListRef}
        role="tablist"
        className={cn(
          'flex relative',
          variant === 'underline' && 'border-b border-gray-200',
          variant === 'enclosed' && 'border-b border-gray-300',
          fullWidth && 'w-full',
          !fullWidth && 'inline-flex'
        )}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab;
          const isDisabled = tab.disabled || false;

          return (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              aria-disabled={isDisabled}
              tabIndex={isActive ? 0 : -1}
              disabled={isDisabled}
              onClick={() => handleTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                'inline-flex items-center justify-center gap-2',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                'transition-all duration-200',
                sizeClasses[size],
                getVariantClasses(isActive, isDisabled),
                fullWidth && 'flex-1'
              )}
            >
              {/* Icon */}
              {tab.icon && (
                <span className="inline-flex" aria-hidden="true">
                  {tab.icon}
                </span>
              )}

              {/* Label */}
              <span>{tab.label}</span>

              {/* Badge */}
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center',
                    'min-w-[20px] h-5 px-1.5 rounded-full',
                    'text-xs font-medium',
                    isActive
                      ? 'bg-white text-blue-600'
                      : 'bg-gray-200 text-gray-700'
                  )}
                  aria-label={`${tab.badge} items`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Animated indicator for underline variant */}
        {variant === 'underline' && (
          <div
            className="absolute bottom-0 h-0.5 bg-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 duration-200"
            style={indicatorStyle}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Tab Panels */}
      {activeContent && (
        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          tabIndex={0}
          className="mt-4 focus:outline-none"
        >
          {activeContent}
        </div>
      )}
    </div>
  );
}

/**
 * REAL USAGE EXAMPLES
 */

// Example 1: Basic tabs
// <Tabs
//   tabs={[
//     { id: 'overview', label: 'Overview', content: <Overview /> },
//     { id: 'details', label: 'Details', content: <Details /> },
//     { id: 'history', label: 'History', content: <History /> },
//   ]}
// />

// Example 2: Controlled tabs
// const [activeTab, setActiveTab] = useState('overview');
// <Tabs
//   tabs={tabs}
//   activeTab={activeTab}
//   onChange={setActiveTab}
// />

// Example 3: Pills variant with icons
// <Tabs
//   variant="pills"
//   tabs={[
//     {
//       id: 'active',
//       label: 'Active',
//       icon: <CheckCircle className="w-4 h-4" aria-hidden="true" />,
//       badge: 12,
//       content: <ActiveTransactions />,
//     },
//     {
//       id: 'pending',
//       label: 'Pending',
//       icon: <Clock className="w-4 h-4" aria-hidden="true" />,
//       badge: 5,
//       content: <PendingTransactions />,
//     },
//     {
//       id: 'completed',
//       label: 'Completed',
//       icon: <CheckCircle className="w-4 h-4" aria-hidden="true" />,
//       badge: 89,
//       content: <CompletedTransactions />,
//     },
//   ]}
// />

// Example 4: Disabled tab
// <Tabs
//   tabs={[
//     { id: 'info', label: 'Info', content: <Info /> },
//     { id: 'settings', label: 'Settings', content: <Settings />, disabled: true },
//     { id: 'help', label: 'Help', content: <Help /> },
//   ]}
// />

// Example 5: Full width tabs
// <Tabs
//   tabs={tabs}
//   fullWidth
//   variant="enclosed"
//   size="lg"
// />
