/**
 * ACCORDION COMPONENT - PRODUCTION READY
 * 
 * COMPLETE IMPLEMENTATION: Accordion with keyboard navigation
 * NO PLACEHOLDERS - Works immediately
 */

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  type?: 'single' | 'multiple';
  defaultExpanded?: string | string[];
  expanded?: string | string[];
  onChange?: (expanded: string | string[]) => void;
  allowToggle?: boolean;
  className?: string;
}

export function Accordion({
  items,
  type = 'single',
  defaultExpanded,
  expanded: controlledExpanded,
  onChange,
  allowToggle = true,
  className,
}: AccordionProps) {
  // Controlled vs uncontrolled
  const isControlled = controlledExpanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState<string | string[]>(
    defaultExpanded || (type === 'multiple' ? [] : '')
  );
  
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  // Check if item is expanded
  const isExpanded = (itemId: string): boolean => {
    if (type === 'multiple') {
      return Array.isArray(expanded) && expanded.includes(itemId);
    }
    return expanded === itemId;
  };

  // Handle toggle
  const handleToggle = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item?.disabled) return;

    let newExpanded: string | string[];

    if (type === 'multiple') {
      const currentExpanded = (Array.isArray(expanded) ? expanded : []) as string[];
      if (currentExpanded.includes(itemId)) {
        newExpanded = currentExpanded.filter(id => id !== itemId);
      } else {
        newExpanded = [...currentExpanded, itemId];
      }
    } else {
      // Single mode
      if (expanded === itemId && allowToggle) {
        newExpanded = '';
      } else {
        newExpanded = itemId;
      }
    }

    if (!isControlled) {
      setInternalExpanded(newExpanded);
    }
    onChange?.(newExpanded);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, itemId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle(itemId);
    }
  };

  return (
    <div className={cn('divide-y divide-gray-200 dark:divide-gray-700 border rounded-lg', className)}>
      {items.map((item, index) => {
        const itemExpanded = isExpanded(item.id);

        return (
          <div key={item.id} className="group">
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => handleToggle(item.id)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
              disabled={item.disabled}
              aria-expanded={itemExpanded}
              aria-controls={`accordion-panel-${item.id}`}
              className={cn(
                'w-full flex items-center justify-between gap-3',
                'px-6 py-4 text-left',
                'transition-colors',
                !item.disabled && 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                item.disabled && 'opacity-50 cursor-not-allowed',
                'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500'
              )}
            >
              {/* Icon & Title */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {item.icon && (
                  <span className="flex-shrink-0 text-gray-500" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {item.title}
                </span>
              </div>

              {/* Chevron */}
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-gray-500 flex-shrink-0',
                  'transition-transform duration-200',
                  itemExpanded && 'rotate-180'
                )}
                aria-hidden="true"
              />
            </button>

            {/* Accordion Panel */}
            <div
              id={`accordion-panel-${item.id}`}
              role="region"
              aria-labelledby={`accordion-header-${item.id}`}
              className={cn(
                'overflow-hidden transition-all duration-200',
                itemExpanded ? 'max-h-screen' : 'max-h-0'
              )}
            >
              <div className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Simple Accordion Item (non-grouped)
 */
export interface SimpleAccordionItemProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AccordionItem({
  title,
  children,
  icon,
  defaultExpanded = false,
  disabled = false,
  className,
}: SimpleAccordionItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    if (!disabled) {
      setIsExpanded(prev => !prev);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={cn('border rounded-lg', className)}>
      {/* Header */}
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-expanded={isExpanded}
        className={cn(
          'w-full flex items-center justify-between gap-3',
          'px-6 py-4 text-left',
          'transition-colors',
          !disabled && 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
          disabled && 'opacity-50 cursor-not-allowed',
          'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500'
        )}
      >
        {/* Icon & Title */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {icon && (
            <span className="flex-shrink-0 text-gray-500" aria-hidden="true">
              {icon}
            </span>
          )}
          <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {title}
          </span>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray-500 flex-shrink-0',
            'transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {/* Panel */}
      <div
        role="region"
        className={cn(
          'overflow-hidden transition-all duration-200',
          isExpanded ? 'max-h-screen' : 'max-h-0'
        )}
      >
        <div className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 border-t">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * REAL USAGE EXAMPLES
 */

// Example 1: Basic accordion (single expansion)
// <Accordion
//   items={[
//     {
//       id: '1',
//       title: 'What is escrow?',
//       content: 'Escrow is a financial arrangement where a third party holds...'
//     },
//     {
//       id: '2',
//       title: 'How does it work?',
//       content: 'The buyer sends payment to our secure escrow account...'
//     },
//     {
//       id: '3',
//       title: 'What are the fees?',
//       content: 'Our fees are competitive and transparent...'
//     },
//   ]}
// />

// Example 2: Multiple expansion
// <Accordion
//   type="multiple"
//   defaultExpanded={['1', '2']}
//   items={faqItems}
// />

// Example 3: Controlled accordion
// const [expanded, setExpanded] = useState('1');
// <Accordion
//   items={items}
//   expanded={expanded}
//   onChange={setExpanded}
// />

// Example 4: With icons
// <Accordion
//   items={[
//     {
//       id: '1',
//       title: 'Account Settings',
//       icon: <Settings className="w-5 aria-hidden="true" h-5" />,
//       content: <AccountSettingsForm />
//     },
//     {
//       id: '2',
//       title: 'Security',
//       icon: <Shield className="w-5 aria-hidden="true" h-5" />,
//       content: <SecuritySettings />
//     },
//   ]}
// />

// Example 5: Simple accordion item
// <div className="space-y-2">
//   <AccordionItem title="Shipping Information" defaultExpanded>
//     <p>Your order will be shipped within 3-5 business days...</p>
//   </AccordionItem>
//   
//   <AccordionItem title="Return Policy">
//     <p>You can return items within 30 days...</p>
//   </AccordionItem>
// </div>

// Example 6: FAQ section
// function FAQ() {
//   const faqs = [
//     {
//       id: '1',
//       title: 'Bagaimana cara membuat transaksi?',
//       content: (
//         <div className="space-y-2">
//           <p>Untuk membuat transaksi baru:</p>
//           <ol className="list-decimal list-inside space-y-1">
//             <li>Klik tombol "Buat Transaksi"</li>
//             <li>Isi detail transaksi</li>
//             <li>Invite pihak lain</li>
//             <li>Tunggu konfirmasi</li>
//           </ol>
//         </div>
//       ),
//     },
//     {
//       id: '2',
//       title: 'Berapa lama proses escrow?',
//       content: 'Proses escrow biasanya memakan waktu 3-7 hari kerja...'
//     },
//   ];
//   
//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
//       <Accordion items={faqs} />
//     </div>
//   );
// }
