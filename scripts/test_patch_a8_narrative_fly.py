#!/usr/bin/env python3
"""Regression tests for the A8 narrative fly-pill build patch."""

from __future__ import annotations

import unittest

from patch_a8_narrative_fly import (
    FIXED_FUNCTION,
    LEGACY_FUNCTION,
    LEGACY_SECTION_SWITCH,
    LEGACY_STYLE,
    MARKER,
    patch_text,
)


class NarrativeFlyPatchTest(unittest.TestCase):
    def fixture(self) -> str:
        return "\n".join((LEGACY_STYLE, LEGACY_FUNCTION, LEGACY_SECTION_SWITCH, "}"))

    def test_replaces_event_only_cleanup_with_bounded_lifecycle(self) -> None:
        patched, changed = patch_text(self.fixture())

        self.assertTrue(changed)
        self.assertIn(MARKER, patched)
        self.assertNotIn('ghost.addEventListener("transitionend"', patched)
        self.assertIn("cleanupTimer = window.setTimeout(cleanup, 500);", patched)
        self.assertIn("animation.finished.then(cleanup, cleanup);", patched)
        self.assertIn("clearNarrativeFlyAnimations();", patched)
        self.assertIn("transition: none;", patched)

    def test_patch_is_idempotent(self) -> None:
        patched, _ = patch_text(self.fixture())
        second, changed = patch_text(patched)

        self.assertFalse(changed)
        self.assertEqual(second, patched)

    def test_refuses_unknown_upstream_shape(self) -> None:
        incomplete = "\n".join((LEGACY_STYLE, FIXED_FUNCTION, LEGACY_SECTION_SWITCH))
        with self.assertRaisesRegex(ValueError, "incomplete"):
            patch_text(incomplete)


if __name__ == "__main__":
    unittest.main()
