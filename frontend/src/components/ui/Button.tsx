import { ReactNode } from "react";
import clsx from "clsx";

interface Props {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

const Button = ({ children, onClick, variant = "primary" }: Props) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-6 py-3 rounded-xl font-medium transition shadow-lg",
        {
          "bg-primary hover:bg-indigo-500": variant === "primary",
          "bg-cardDark hover:bg-slate-700": variant === "secondary",
        }
      )}
    >
      {children}
    </button>
  );
};

export default Button;