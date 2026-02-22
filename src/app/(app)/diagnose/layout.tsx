import { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default function DiagnoseLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
