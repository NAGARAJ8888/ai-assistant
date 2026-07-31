"use client";

import { useEffect, useState } from "react";

/**
 * Tracks the Visual Viewport API to detect when the mobile virtual keyboard
 * opens/closes. Returns the keyboard height (the difference between the layout
 * viewport height and the visual viewport height) and whether the keyboard is
 * currently open.
 *
 * - On iOS Safari, `window.visualViewport` is supported and fires `resize`
 *   events when the keyboard appears.
 * - On Android Chrome, `window.visualViewport` is supported and fires `resize`
 *   events when the keyboard appears.
 *
 * The hook is a no-op on desktop browsers where `visualViewport` is undefined.
 */
export interface VisualViewportState {
  /** True when the virtual keyboard is open (visual viewport is shorter than layout viewport). */
  keyboardOpen: boolean;
  /** Height of the on-screen keyboard in CSS pixels. 0 when closed. */
  keyboardHeight: number;
  /** Visual viewport height (the area not covered by the keyboard). */
  visualHeight: number;
  /** Visual viewport offset from the top of the layout viewport. */
  visualOffsetTop: number;
}

export function useVisualViewport(): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>({
    keyboardOpen: false,
    keyboardHeight: 0,
    visualHeight: 0,
    visualOffsetTop: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const vv = window.visualViewport;
    if (!vv) {
      // Desktop / unsupported — just report the window inner height.
      setState({
        keyboardOpen: false,
        keyboardHeight: 0,
        visualHeight: window.innerHeight,
        visualOffsetTop: 0,
      });
      return;
    }

    const update = () => {
      const layoutHeight = window.innerHeight;
      const visualHeight = vv.height;
      // The keyboard height is the difference between the layout viewport
      // and the visual viewport. We also account for the visual viewport
      // offset (e.g. when iOS zooms/scrolls the page).
      const keyboardHeight = Math.max(
        0,
        layoutHeight - vv.height - vv.offsetTop,
      );
      setState({
        keyboardOpen: keyboardHeight > 80, // ignore tiny differences (toolbars)
        keyboardHeight,
        visualHeight,
        visualOffsetTop: vv.offsetTop,
      });
    };

    update();

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return state;
}
