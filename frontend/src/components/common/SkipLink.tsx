/**
 * Skip Link Component for Accessibility
 * Allows keyboard users to skip navigation and go directly to main content
 */

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

export function SkipLink({ href, children }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-black focus:text-white focus:rounded-lg focus:shadow-lg focus:ring-2 focus:ring-white focus:ring-offset-2"
    >
      {children}
    </a>
  );
}
