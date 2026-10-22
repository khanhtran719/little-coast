export const CELL_SIZE=1/3;
export const MAP=Object.freeze({width:66,depth:48,regionStart:42,anchor:Object.freeze({x:1,z:22})});
export const cellToWorld=i=>(i-1)/3;
export const worldToCell=value=>Math.floor((value+.5)*3+1e-9);
export function footprint(value,rotation=undefined){
 const b=typeof value==='string'?{type:value}:value;
 const turn=rotation??b.rotation??0;
 let width=b.footprint?.width??(b.type==='road'?(b.roadWidth??2):3),depth=b.footprint?.depth??width;
 if(b.cells?.length){width=Math.max(...b.cells.map(p=>p.x))+1;depth=Math.max(...b.cells.map(p=>p.z))+1;}
 return turn%2?{width:depth,depth:width}:{width,depth};
}
export function occupiedCells(b){
 const raw=b.cells||Array.from({length:(b.footprint?.width??(b.type==='road'?(b.roadWidth??2):3))*(b.footprint?.depth??(b.type==='road'?(b.roadWidth??2):3))},(_,i)=>{
 const width=b.footprint?.width??(b.type==='road'?(b.roadWidth??2):3);return{x:i%width,z:Math.floor(i/width)};});
 let points=raw.map(p=>({...p}));
 for(let t=0;t<(b.rotation??0);t++)points=points.map(p=>({x:p.z,z:-p.x}));
 const minX=Math.min(...points.map(p=>p.x)),minZ=Math.min(...points.map(p=>p.z));
 return points.map(p=>({x:b.x+p.x-minX,z:b.z+p.z-minZ}));
}
export function buildingCenter(b){const size=footprint(b);return{x:cellToWorld(b.x+(size.width-1)/2),z:cellToWorld(b.z+(size.depth-1)/2)};}
export function roadStroke(from,to){
 const cells=new Map();const stamp=(x,z)=>{for(let dx=0;dx<2;dx++)for(let dz=0;dz<2;dz++)cells.set(`${x+dx},${z+dz}`,{x:x+dx,z:z+dz});};
 if(!from||!to||![from.x,from.z,to.x,to.z].every(Number.isSafeInteger))return[];
 if(Math.abs(to.x-from.x)+Math.abs(to.z-from.z)>MAP.width+MAP.depth)return[];
 for(let x=Math.min(from.x,to.x);x<=Math.max(from.x,to.x);x++)stamp(x,from.z);
 for(let z=Math.min(from.z,to.z);z<=Math.max(from.z,to.z);z++)stamp(to.x,z);
 return [...cells.values()];
}
