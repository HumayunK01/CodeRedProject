import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotFound from "@/pages/NotFound";

// Suppress console.error from NotFound's useEffect and React Router future-flag warnings
let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
  consoleWarnSpy.mockRestore();
});

// Wrap with MemoryRouter since NotFound uses useLocation and Link
function renderWithRouter(initialRoute = "/unknown-page") {
  return render(
    <MemoryRouter initialEntries={[initialRoute]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <NotFound />
    </MemoryRouter>
  );
}

describe("NotFound page", () => {
  it("renders the 404 heading", () => {
    renderWithRouter();
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders Page Not Found message", () => {
    renderWithRouter();
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
  });

  it("renders a Go Home link pointing to /", () => {
    renderWithRouter();
    const link = screen.getByRole("link", { name: /go home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders a Go Back button", () => {
    renderWithRouter();
    expect(screen.getByRole("button", { name: /go back/i })).toBeInTheDocument();
  });

  it("shows a descriptive message", () => {
    renderWithRouter();
    expect(
      screen.getByText(/the page you're looking for doesn't exist/i)
    ).toBeInTheDocument();
  });
});
