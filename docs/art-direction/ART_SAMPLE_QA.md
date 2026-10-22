# Art sample QA — 22/10/2026

Owner: QA agent, bounded review for `ART-DEV-04/05`. This report records CPU tests and code review of the procedural character and house/café samples. It does not certify the final art style, player recognition, WebGL performance, or human playtest acceptance.

Sources read: `AGENTS.md`, production decisions/backlog/first-playable report, `IMPLEMENTATION_CONTRACT.md`, `DEV_HANDOFF.md`, character/environment design handoffs, factory code and renderer integration. The cast style-master PNG was opened for reference. Concept images are reference art; these factories generate original 3D geometry and do not convert the images into a GLB or production rig.

## Automated evidence

Environment: Node.js **v24.17.0**, installed Three.js dependency, real Three.js CPU geometry/matrix operations; no mock renderer, DOM or GPU. Owner wrote `tests/art-integration.test.js` before the two factory modules existed. Initial execution failed with **ERR_MODULE_NOT_FOUND** for `src/art/characters.js` (RED).

After the final browser-driven character/flower/proportion refinements and static building batching landed, `node --test tests/art-models.test.js tests/art-integration.test.js tests/art-picking.test.js`: **15 passed, 0 failed, 0 skipped**. The five integration tests below belong to this QA owner; the other ten model/regression/picking tests belong to the integrating owner.

| Check | Observed result |
| --- | --- |
| Frozen canonical seed world passed into factory/animation | PASS — serialization unchanged; world still validates |
| Four canonical IDs after resident array reversal and real validated save encode/decode | PASS — identity-bound appearances repeat exactly, four signatures remain distinct |
| In-place animation, repeated paused simulation time, movement and reduced motion | PASS — root position/quaternion/scale and resident ID unchanged; repeated pose deterministic; all matrices finite |
| Dispose one Hải/house/café instance while another remains | PASS — retained instance resources receive no disposal events; no cross-instance shared cache was destroyed |
| House and café in Làng Chài and Xóm Biển, all four quarter-turns | PASS — finite bounds within canonical 1×1 tile, feet/base at ground, entrance oriented toward +Z before root rotation |

These tests exercise presentation factories with real simulation/persistence data. The integrating owner's picking tests additionally use a real Three.js CPU Raycaster to verify closest-object occlusion, empty picks and heading from the next canonical route segment. A regression verifies shirt details remain outside the torso. They do not call the live `createScene` WebGL renderer or browser UI. Scene stamping/picking, Move/Delete interaction, zoom/orbit, before/after images and actual WebGL inspection remain the integrating owner's browser verification; CPU tests must not be relabeled as those checks. Full `npm test` and `npm run build` evidence belongs to the integrated production report.

## Asset inventory, not performance measurements

Counts below traverse the factory-produced meshes. Triangle totals count each mesh instance; material and geometry totals count unique resource objects inside that model. They are **not measured draw calls, GPU memory or FPS**. Dimensions are axis-aligned rest-pose bounds in world units before scene root rotation.

| Asset | Meshes | Triangles | Materials | Geometries | X × Y × Z |
| --- | ---: | ---: | ---: | ---: | --- |
| Hải | 85 | 5,780 | 21 | 9 | 0.261 × 0.618 × 0.127 |
| Lan | 85 | 5,724 | 20 | 9 | 0.278 × 0.587 × 0.149 |
| Minh | 84 | 5,676 | 20 | 9 | 0.228 × 0.642 × 0.127 |
| An | 89 | 5,912 | 19 | 9 | 0.231 × 0.580 × 0.127 |
| House, either region | 22 | 4,788 | 21 | 21 | 0.926 × 1.018 × 0.914 |
| Café, either region | 21 | 5,840 | 20 | 21 | 0.914 × 0.977 × 0.914 |

Character triangle counts remain in the candidate 3k–6k range. Static house/café details are now merged by material, reducing the earlier 256/283 meshes to 22/21. House triangles fit the candidate 2k–5k range; café remains above it at 5,840. Character material counts still exceed the candidate 1–2, and character meshes remain unbatched articulated parts. The sample does not establish a device budget or an acceptable frame rate.

## Code-review conclusions and remaining scope

No blocking factory or integration correctness defect found in the reviewed revision. Models keep +Y up/+Z forward, ownership per instance, canonical-ID selection and root-motion-free animation. Facial/hair/clothing features distinguish the existing cast without creating additional residents or attaching new gameplay facts. Attached building props stay under their model root. `scene.js` stamps canonical building IDs on the final batched meshes; character meshes keep canonical resident IDs. The single closest-hit raycast considers buildings and residents together. Build-mode cell handling still precedes entity selection. Animation receives `world.time`, and walking heading follows the next road segment rather than pointing diagonally at the final destination; it never changes canonical coordinates. Window emissive surfaces retain private material clones, avoiding illumination of unrelated dark recesses.

**P2 follow-up:** character mesh/material counts and café triangle count remain optimization candidates for repeated browser assets. Measure the integrated renderer on a named device, then consolidate static character features/materials and simplify the largest contributors before expanding the whole kit. Building static batching is implemented already. Do not infer a successful performance budget from CPU tests or screenshots.

**Scope limit:** the current Xóm Biển sample changes plaster palette while retaining the same one-tile house/café geometry. This is a region presentation variant, not a completed residential neighborhood, balcony kit, promenade or second-region vertical slice. This QA report does not assess neighborhood composition or cast recognition at the default gameplay camera; distinct mesh signatures prove deterministic difference, not perceptual readability. The integrating owner is collecting the final visual evidence separately.

QA owner did not operate an interactive browser in parallel with the integrating owner's session. No player study, human approval, external asset download or final production-art acceptance is claimed.
