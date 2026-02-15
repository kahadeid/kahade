/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 */

export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  if (!firstFocusable) return () => {};
  
  function handleTabKey(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  }
  
  element.addEventListener('keydown', handleTabKey);
  
  // Focus first element
  firstFocusable.focus();
  
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

export function setupKeyboardNavigation(element: HTMLElement) {
  const items = element.querySelectorAll<HTMLElement>('[role="menuitem"], [role="option"], [role="tab"]');
  
  if (items.length === 0) return () => {};
  
  function handleArrowKeys(e: KeyboardEvent) {
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      return;
    }
    
    e.preventDefault();
    
    const currentIndex = Array.from(items).indexOf(document.activeElement as HTMLElement);
    let nextIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = currentIndex - 1 < 0 ? items.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = items.length - 1;
        break;
    }
    
    items[nextIndex]?.focus();
  }
  
  element.addEventListener('keydown', handleArrowKeys);
  
  return () => {
    element.removeEventListener('keydown', handleArrowKeys);
  };
}

// Check color contrast for WCAG AA
export function checkColorContrast(foreground: string, background: string): boolean {
  const getLuminance = (hex: string) => {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  return ratio >= 4.5;
}

// Add skip link functionality
export function addSkipLink(targetId: string, label: string = 'Skip to main content') {
  const existingSkipLink = document.getElementById('skip-link');
  if (existingSkipLink) return;
  
  const skipLink = document.createElement('a');
  skipLink.id = 'skip-link';
  skipLink.href = `#${targetId}`;
  skipLink.textContent = label;
  skipLink.className = 'sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md';
  
  document.body.insertBefore(skipLink, document.body.firstChild);
}

// Manage focus for modals
export function manageFocusForModal(modalElement: HTMLElement, previousActiveElement: Element | null) {
  const restoreFocus = trapFocus(modalElement);
  
  return () => {
    restoreFocus();
    if (previousActiveElement instanceof HTMLElement) {
      previousActiveElement.focus();
    }
  };
}
