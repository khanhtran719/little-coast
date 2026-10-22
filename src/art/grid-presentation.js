import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CELL_SIZE, cellToWorld, occupiedCells, buildingCenter } from '../grid.js';

// These surfaces read the same owned cells as placement/pathfinding. No bounding
// rectangle shortcut: a road's concave corner must remain visibly unoccupied.
function mergedGeometry(parts) {
  const geometry = parts.length ? mergeGeometries(parts) : new THREE.BufferGeometry();
  parts.forEach(part => part.dispose());
  return geometry;
}

export function createRoadSurface(building) {
  const center = buildingCenter(building);
  const parts = occupiedCells(building).map(cell => new THREE.BoxGeometry(CELL_SIZE-.002,.025,CELL_SIZE-.002)
    .translate(cellToWorld(cell.x)-center.x,.0125,cellToWorld(cell.z)-center.z));
  const group = new THREE.Group();
  group.position.set(center.x,0,center.z);
  const surface = new THREE.Mesh(mergedGeometry(parts),new THREE.MeshStandardMaterial({color:'#c9b18a',roughness:1}));
  surface.receiveShadow = true; group.add(surface);
  return group;
}

export function createCellOverlay(cells, { color='#78b89a', opacity=.32, y=.17 }={}) {
  const group = new THREE.Group(), positions = [], parts = [];
  const occupied = new Set(cells.map(cell=>`${cell.x},${cell.z}`));
  for (const cell of cells) {
    const x=cellToWorld(cell.x),z=cellToWorld(cell.z),half=CELL_SIZE/2;
    const plane = new THREE.PlaneGeometry(CELL_SIZE,CELL_SIZE); plane.rotateX(-Math.PI/2); plane.translate(x,y,z); parts.push(plane);
    for (const [dx,dz,edge] of [[-1,0,[x-half,z-half,x-half,z+half]],[1,0,[x+half,z-half,x+half,z+half]],[0,-1,[x-half,z-half,x+half,z-half]],[0,1,[x-half,z+half,x+half,z+half]]]) {
      if (occupied.has(`${cell.x+dx},${cell.z+dz}`)) continue;
      positions.push(edge[0],y+.003,edge[1],edge[2],y+.003,edge[3]);
    }
  }
  const surface = new THREE.Mesh(mergedGeometry(parts),new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,side:THREE.DoubleSide}));
  const boundaryGeometry = new THREE.BufferGeometry(); boundaryGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  const boundary = new THREE.LineSegments(boundaryGeometry,new THREE.LineBasicMaterial({color,transparent:true,opacity:.95,depthWrite:false}));
  group.add(surface,boundary); return group;
}
