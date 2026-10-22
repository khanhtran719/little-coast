// Fixed test stage; no simulation or player-storage dependency. These descriptors
// deliberately keep the same physical models, resident count and camera bounds.
export function comparisonLayout(mode) {
  if (!['baseline','fine','compact'].includes(mode)) throw new Error('Unknown comparison layout');
  const compact = mode === 'compact';
  return {
    cellSize:mode==='baseline'?1:1/3,
    buildings: [
      {type:'house',x:compact?-1.5:-2.5,z:0},
      {type:'house',x:compact?-1/6:.5,z:0},
      {type:'cafe',x:compact?7/6:2.5,z:0},
    ],
    residents:[{id:'hai',x:-.8,z:1}],
    road:{minX:-3.5,maxX:3.5,minZ:.5,maxZ:mode==='baseline'?1.5:7/6},
    cameraBounds:{minX:-3.5,maxX:3.5,minZ:-1.5,maxZ:2.5,height:1.2},
  };
}
