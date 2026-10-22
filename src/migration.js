import {validateLegacyWorld} from './legacy-v1.js';
import {validateWorld} from './simulation.js';
export function upgradeWorld(world){
 if(world?.version===2){validateWorld(world);return world;}
 validateLegacyWorld(world);
 const next=structuredClone(world);next.version=2;
 next.buildings=world.buildings.map(b=>{const {cells,roadWidth,footprint,...rest}=b;return {...rest,x:b.x*3,z:b.z*3,...(b.type==='road'?{roadWidth:3}:{})};});
 for(const n of next.residents){let previous={x:n.x,z:n.z};const route=[];for(const end of n.route){const dx=end.x-previous.x,dz=end.z-previous.z;const axis=dx?'x':'z',sign=Math.sign(dx||dz);let cursor={...previous};
  // Preserve the old path exactly, inserting lattice centers along each segment.
  while(Math.abs(end[axis]-cursor[axis])>1/3+1e-8){const lattice=(sign>0?Math.floor(cursor[axis]*3+1e-7)+1:Math.ceil(cursor[axis]*3-1e-7)-1)/3;cursor={...cursor,[axis]:lattice};route.push(cursor);}
  route.push({...end});previous=end;
 }n.route=route;}
 validateWorld(next);return next;
}
