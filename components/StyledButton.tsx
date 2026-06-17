"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

// Soft neutral button (converted from styled-components to styled-jsx).
// Accepts all native <button> props, so it can be dropped in anywhere.
export default function StyledButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children?: ReactNode }) {
  return (
    <>
      <button className={`styled-btn ${className ?? ""}`} {...props}>
        {children}
      </button>
      <style jsx>{`
        .styled-btn {
          background-color: #ffffff;
          border: 1px solid rgb(209, 213, 219);
          border-radius: 0.5rem;
          color: #111827;
          font-size: 0.875rem;
          font-weight: 600;
          line-height: 1.25rem;
          padding: 0.75rem 1rem;
          text-align: center;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          cursor: pointer;
          user-select: none;
          touch-action: manipulation;
        }
        .styled-btn:hover {
          background-color: #f9fafb;
        }
        .styled-btn:focus {
          outline: 2px solid rgba(0, 0, 0, 0.1);
          outline-offset: 2px;
        }
        .styled-btn:focus-visible {
          box-shadow: none;
        }
      `}</style>
    </>
  );
}
