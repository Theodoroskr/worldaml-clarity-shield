import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signOut: async () => {},
  }),
}));

import { Header } from "./Header";
import { RegionProvider } from "@/contexts/RegionContext";

/**
 * Visual regression test for the desktop header layout.
 *
 * jsdom does not perform real layout, so we cannot measure pixel
 * geometry. Instead, we lock in the structural invariants that
 * guarantee the WorldAML wordmark cannot overlap the first nav item
 * at desktop widths:
 *
 *   1. The logo link is `flex-none` (cannot shrink) and contains a
 *      `whitespace-nowrap` wordmark (cannot wrap into nav).
 *   2. The desktop <nav> has `ml-8` (a hard left gutter from the logo)
 *      and `min-w-0` (it absorbs overflow instead of pushing the logo).
 *   3. The logo is rendered before the nav inside a flex row, so the
 *      gutter sits between them.
 *
 * If any of these invariants regress, this test fails — which is the
 * scenario that historically caused the wordmark to collide with the
 * first nav item ("WorldAML Suite") at common desktop widths.
 */

const COMMON_DESKTOP_WIDTHS = [1280, 1366, 1440, 1536, 1920];

const renderHeader = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <RegionProvider>
          <Header />
        </RegionProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

describe("Header desktop layout — wordmark / nav overlap guard", () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: originalInnerWidth,
    });
  });

  for (const width of COMMON_DESKTOP_WIDTHS) {
    it(`keeps the logo and nav structurally separated at ${width}px`, () => {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        writable: true,
        value: width,
      });
      window.dispatchEvent(new Event("resize"));

      const { container } = renderHeader();

      const logoLink = container.querySelector('a[aria-label="WorldAML home"]');
      const desktopNav = container.querySelector("header nav");

      expect(logoLink, "logo link should render").not.toBeNull();
      expect(desktopNav, "desktop nav should render").not.toBeNull();

      // Invariant 1: logo cannot shrink and does not wrap into the nav.
      expect(logoLink!.className).toMatch(/\bflex-none\b/);
      const wordmark = logoLink!.querySelector("div");
      expect(wordmark, "logo wordmark wrapper should render").not.toBeNull();
      expect(wordmark!.className).toMatch(/\bwhitespace-nowrap\b/);
      expect(wordmark!.className).toMatch(/\bshrink-0\b/);

      // Invariant 2: desktop nav has a hard left gutter and absorbs overflow.
      expect(desktopNav!.className).toMatch(/\bml-(6|8)\b/);
      expect(desktopNav!.className).toMatch(/\bmin-w-0\b/);

      // Invariant 3: logo is a previous sibling of the nav inside a flex row.
      const flexRow = logoLink!.parentElement;
      expect(flexRow, "logo should sit inside a flex row").not.toBeNull();
      expect(flexRow!.className).toMatch(/\bflex\b/);
      expect(flexRow!.contains(desktopNav!)).toBe(true);

      const children = Array.from(flexRow!.children);
      expect(children.indexOf(logoLink!)).toBeLessThan(
        children.indexOf(desktopNav!),
      );
    });
  }
});
