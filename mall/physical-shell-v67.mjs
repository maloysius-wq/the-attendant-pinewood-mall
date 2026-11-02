// v67 physical construction contract. RED phase placeholder; tests must fail first.
export function constructPhysicalShell({level='G'}={}){return {level,y:NaN,walls:[],doors:[],portals:[],floorPlates:[],roofs:[],railings:[],verticals:[],stairs:[],fixtures:[],texturePaths:{}}}
export function isSegmentBlocked(){return false}
export function validatePhysicalShell(){return ['Physical shell not constructed']}
