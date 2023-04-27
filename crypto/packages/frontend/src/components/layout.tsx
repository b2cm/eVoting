import { ReactElement } from "react";
import { Outlet } from "react-router-dom";

export interface LayoutProps {
  children?: ReactElement;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen w-screen">
      <header className="px-2 w-full text-xl font-bold text-white py-4 bg-purple-900">
        E-voting
      </header>
      {children ?? <Outlet />}
    </div>
  );
}
