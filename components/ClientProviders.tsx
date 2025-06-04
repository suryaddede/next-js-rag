'use client';

// Remove custom toast and just render children
// The Toaster is now added directly to the root layout

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
