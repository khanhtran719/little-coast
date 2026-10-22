import { canPlace, canPlaceRoad } from './simulation.js';
import { occupiedCells, roadStroke } from './grid.js';

// One read-only plan feeds the mouse/keyboard ghost and command validation.
export function constructionPlan(world, {type, cell, rotation=0, movingId=null, roadStart=null}) {
  if (!type || !cell) return {ok:false, message:'Chọn vị trí xây dựng.', cells:[]};
  if (type === 'road' && !movingId) {
    const from = roadStart || cell;
    return {...canPlaceRoad(world, from, cell), cells:roadStroke(from, cell)};
  }
  const original = movingId ? world.buildings.find(b=>b.id===movingId) : null;
  const candidate = {...original, type, x:cell.x, z:cell.z, rotation};
  return {...canPlace(world, type, cell.x, cell.z, movingId, rotation), cells:occupiedCells(candidate)};
}
