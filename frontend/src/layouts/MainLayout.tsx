import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const MainLayout = ({ children }: Props) => {
  return (
    <div className="min-h-screen bg-bgDark text-white">
      {children}
    </div>
  );
};

export default MainLayout;