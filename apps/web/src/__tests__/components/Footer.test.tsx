import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "@/components/layout/Footer";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, whileInView, whileHover, whileTap, transition, viewport, variants, layout, layoutId, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    p: ({ children, ...props }: any) => {
      const { initial, animate, exit, whileInView, transition, viewport, ...rest } = props;
      return <p {...rest}>{children}</p>;
    },
    a: ({ children, ...props }: any) => {
      const { initial, animate, exit, whileInView, transition, viewport, whileHover, ...rest } = props;
      return <a {...rest}>{children}</a>;
    },
    span: ({ children, ...props }: any) => {
      const { initial, animate, exit, whileInView, transition, viewport, ...rest } = props;
      return <span {...rest}>{children}</span>;
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("Footer component", () => {
  function renderFooter() {
    return render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Footer />
      </MemoryRouter>
    );
  }

  it("renders the brand name", () => {
    renderFooter();
    // Look for "Foresee" text in the footer
    const foreseeElements = screen.getAllByText(/foresee/i);
    expect(foreseeElements.length).toBeGreaterThan(0);
  });

  it("renders platform links", () => {
    renderFooter();
    expect(screen.getByText("Diagnosis")).toBeInTheDocument();
    expect(screen.getByText("Forecasting")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });

  it("renders legal links", () => {
    renderFooter();
    expect(screen.getByText("Privacy")).toBeInTheDocument();
    expect(screen.getByText("Terms")).toBeInTheDocument();
  });
});
