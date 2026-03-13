import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import FadeIn from "./fade-in";

let observerCallback: (entries: Array<{ isIntersecting: boolean }>) => void;

beforeEach(() => {
  class MockIntersectionObserver {
    constructor(cb: (entries: Array<{ isIntersecting: boolean }>) => void) {
      observerCallback = cb;
    }
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

describe("FadeIn", () => {
  it("renders children", () => {
    render(<FadeIn><span>Hello</span></FadeIn>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("starts invisible (opacity 0)", () => {
    const { container } = render(<FadeIn><span>Content</span></FadeIn>);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.opacity).toBe("0");
  });

  it("becomes visible when intersection fires", () => {
    const { container } = render(<FadeIn><span>Content</span></FadeIn>);
    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.opacity).toBe("1");
  });

  it("applies custom className", () => {
    const { container } = render(<FadeIn className="test-class"><span>Content</span></FadeIn>);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveClass("test-class");
  });

  it("includes delay in transition style", () => {
    const { container } = render(<FadeIn delay={200}><span>Content</span></FadeIn>);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.transition).toContain("200ms");
  });
});
