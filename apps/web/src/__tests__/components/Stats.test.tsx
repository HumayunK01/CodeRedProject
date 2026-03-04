import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Stats } from "@/components/home/Stats";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...stripMotionProps(props)}>{children}</div>,
    span: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <span {...stripMotionProps(props)}>{children}</span>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Strip motion-specific props that would cause DOM warnings
function stripMotionProps(props: Record<string, unknown>) {
  const {
    initial, animate, exit, whileInView, whileHover, whileTap,
    transition, viewport, variants, layout, layoutId,
    ...rest
  } = props;
  return rest;
}

describe("Stats component", () => {
  it("renders the section heading", () => {
    render(
      <MemoryRouter>
        <Stats />
      </MemoryRouter>
    );
    expect(screen.getByText("Why Foresee")).toBeInTheDocument();
  });

  it("renders feature card titles", () => {
    render(
      <MemoryRouter>
        <Stats />
      </MemoryRouter>
    );
    expect(screen.getByText("Real-time analytics")).toBeInTheDocument();
    expect(screen.getByText("Mobile accessibility")).toBeInTheDocument();
    expect(screen.getByText("Customizable reports")).toBeInTheDocument();
    expect(screen.getByText("Enhanced security")).toBeInTheDocument();
  });

  it("renders feature descriptions", () => {
    render(
      <MemoryRouter>
        <Stats />
      </MemoryRouter>
    );
    expect(
      screen.getByText(/gain actionable insights/i)
    ).toBeInTheDocument();
  });
});
