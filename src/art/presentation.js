// Presentation helpers read geometry/canonical routes and never mutate a world.
export function pickSceneEntity(raycaster, buildingRoot, residentRoot) {
  const hits = raycaster.intersectObjects([...buildingRoot.children, ...residentRoot.children], true);
  for (const hit of hits) {
    const { residentId, buildingId } = hit.object.userData;
    if (residentId) return { kind: 'resident', id: residentId };
    if (buildingId) return { kind: 'building', id: buildingId };
  }
  return null;
}

export function residentMotion(npc) {
  const next = npc.route?.[0];
  const dx = (next?.x ?? npc.targetX ?? npc.x) - npc.x;
  const dz = (next?.z ?? npc.targetZ ?? npc.z) - npc.z;
  const moving = npc.activity === 'walking' && Math.hypot(dx, dz) > .0001;
  return { moving, heading: moving ? Math.atan2(dx, dz) : null };
}
