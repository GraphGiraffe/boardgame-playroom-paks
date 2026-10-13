# Viewport and interaction evidence

Minimum investigation matrix: 320 px and 390 px portrait, short landscape such as 740×390, tablet and desktop when the changed layout applies. Existing tests cover subsets; inspect their viewport definitions and add/check the missing affected state deliberately. Never claim a whole matrix from one screenshot.

For each affected game/state measure card width/height (5/7), square-cell and die ratio, field bounds, action reserve, hand/controls intersection, horizontal overflow, reachable buttons and scroll ownership. Include 2 and supported 4–6 players, empty/large hands, selected targets, appearing/disappearing actions, animations and reduced motion. Test text scaling and orientation changes when shared layout changes.

Capture before and after at the same viewport, state and zoom. Record viewport, device scale, source SHAs and scenario. Keep rendered evidence outside source. Existing screenshot hooks: PLAYROOM_CAPTURE_DIR in supporting project scenarios; absence of screenshots is not a pass. Use browser discovery in scripts/codex/browser.cjs rather than a machine-specific executable.

A geometry assertion proves only its measured property. Visually inspect covers, contrast, miss markers, Ludo board, compact tables and player indicators. Then verify at least one actual user route using the changed control.
