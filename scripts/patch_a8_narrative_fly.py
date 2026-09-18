#!/usr/bin/env python3
"""Patch the pinned Shortcut Quest A8 build with deterministic fly-pill cleanup."""

from __future__ import annotations

import argparse
from pathlib import Path


MARKER = "A8 NARRATIVE FLY LIFECYCLE FIX 2026"

LEGACY_STYLE = """      transition: left 0.35s ease, top 0.35s ease, transform 0.35s ease, opacity 0.35s ease;
"""

FIXED_STYLE = f"""      /* {MARKER} */
      transition: none;
"""

LEGACY_FUNCTION = """    function animateNarrativeOptionFly(source, target) {
      if (!source || !target || typeof document === "undefined") return;
      const sourceRect = source.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const ghost = document.createElement("span");
      ghost.className = "narrative-fly";
      ghost.textContent = source.textContent;
      ghost.style.left = `${sourceRect.left + sourceRect.width / 2}px`;
      ghost.style.top = `${sourceRect.top + sourceRect.height / 2}px`;
      document.body.appendChild(ghost);
      requestAnimationFrame(() => {
        ghost.style.left = `${targetRect.left + targetRect.width / 2}px`;
        ghost.style.top = `${targetRect.top + targetRect.height / 2}px`;
        ghost.style.transform = "translate(-50%, -50%) scale(0.85)";
        ghost.style.opacity = "0.15";
      });
      ghost.addEventListener("transitionend", () => ghost.remove(), { once: true });
    }
"""

FIXED_FUNCTION = f"""    // {MARKER}
    function removeNarrativeFly(ghost) {{
      if (!ghost) return;
      if (typeof ghost.getAnimations === "function") {{
        ghost.getAnimations().forEach(animation => animation.cancel());
      }}
      ghost.remove();
    }}

    function clearNarrativeFlyAnimations() {{
      document.querySelectorAll(".narrative-fly").forEach(removeNarrativeFly);
    }}

    function animateNarrativeOptionFly(source, target) {{
      if (!source || !target || typeof document === "undefined") return;
      const sourceRect = source.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const sourceLeft = sourceRect.left + sourceRect.width / 2;
      const sourceTop = sourceRect.top + sourceRect.height / 2;
      const targetLeft = targetRect.left + targetRect.width / 2;
      const targetTop = targetRect.top + targetRect.height / 2;
      const ghost = document.createElement("span");
      ghost.className = "narrative-fly";
      ghost.textContent = source.textContent;
      ghost.style.left = `${{sourceLeft}}px`;
      ghost.style.top = `${{sourceTop}}px`;
      document.body.appendChild(ghost);

      let animation = null;
      let finished = false;
      let cleanupTimer = 0;
      const cleanup = () => {{
        if (finished) return;
        finished = true;
        if (cleanupTimer) window.clearTimeout(cleanupTimer);
        removeNarrativeFly(ghost);
      }};

      // Never allow a transient visual node to outlive its 360 ms effect.
      cleanupTimer = window.setTimeout(cleanup, 500);
      if (typeof ghost.animate !== "function" ||
          (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {{
        cleanup();
        return;
      }}

      // Animate layout coordinates instead of a moving transformed compositor layer.
      animation = ghost.animate([
        {{ left: `${{sourceLeft}}px`, top: `${{sourceTop}}px`, opacity: 1 }},
        {{ left: `${{targetLeft}}px`, top: `${{targetTop}}px`, opacity: 0.15 }}
      ], {{ duration: 360, easing: "ease", fill: "forwards" }});
      animation.finished.then(cleanup, cleanup);
    }}
"""

LEGACY_SECTION_SWITCH = """    function showSectionById(id) {
      const sections = document.querySelectorAll(".section");
"""

FIXED_SECTION_SWITCH = """    function showSectionById(id) {
      clearNarrativeFlyAnimations();
      const sections = document.querySelectorAll(".section");
"""


def _replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise ValueError(f"Expected exactly one {label} marker, found {count}")
    return text.replace(old, new, 1)


def patch_text(text: str) -> tuple[str, bool]:
    """Return patched A8 HTML and whether a change was made."""
    if MARKER in text:
        required = (
            "function clearNarrativeFlyAnimations()",
            "cleanupTimer = window.setTimeout(cleanup, 500);",
            "animation.finished.then(cleanup, cleanup);",
            "clearNarrativeFlyAnimations();",
        )
        missing = [needle for needle in required if needle not in text]
        if missing:
            raise ValueError(f"Existing {MARKER} patch is incomplete: {missing}")
        return text, False

    patched = _replace_once(text, LEGACY_STYLE, FIXED_STYLE, "narrative-fly style")
    patched = _replace_once(patched, LEGACY_FUNCTION, FIXED_FUNCTION, "narrative-fly function")
    patched = _replace_once(
        patched,
        LEGACY_SECTION_SWITCH,
        FIXED_SECTION_SWITCH,
        "section-switch cleanup",
    )
    return patched, True


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("path", type=Path, help="Assembled A8 index.html")
    args = parser.parse_args()

    source = args.path.read_text(encoding="utf-8")
    patched, changed = patch_text(source)
    if changed:
        args.path.write_text(patched, encoding="utf-8")
        print(f"Patched deterministic A8 narrative-fly cleanup: {args.path}")
    else:
        print(f"A8 narrative-fly cleanup already patched: {args.path}")


if __name__ == "__main__":
    main()
