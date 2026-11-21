# Elemental arena component

This trusted SDK component preserves the native 0.21 arena, hand, planning controls, health tokens, public reveals, effect layers and participant presentation. The host vendors its JavaScript and CSS through the explicit companion build. Pack-authored HTML, CSS and render functions never execute in the host.

`render` receives an authorized scene, public participant identities, finite authorized commands, local view state and injected text/UI helpers. `arenaLayout.kind` is `elemental-grid`; labels are localized message references. `arena` supplies public board data and the viewer's permitted hand/draft, precomputed previews and per-player health/metric descriptors. Plan snapshots carry their own authorized metric descriptors. Hidden hands and private plans belong to the rules projection and must not be added by this component.

The result contains field, hand and public participant markup. Only the trusted web adapter patches it, keeps host-owned layout slots stable and binds exact currently authorized commands. Local card/action/direction selection is presentation state; it never resolves a move. Public frame selection drives the same component for reveal, movement, attack, results and history. History withdraws live permissions.

The component consumes the canonical shared view-kit and game components. Keep artboard coordinates, cell/figure/highlight/effect layers, square card faces and the original planning controls; do not introduce a second visual design for SDK packs.
