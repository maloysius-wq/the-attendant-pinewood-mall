import * as THREE from '../../vendor/three/build/three.module.js';
import {OrbitControls} from '../../vendor/three/examples/jsm/controls/OrbitControls.js';
import {renderConstructionScene} from '../../mall/render-shell-v67.js';

const world=document.getElementById('world');
const cover=document.getElementById('loading');
const chapterSelect=document.getElementById('chapter');
const viewSelect=document.getElementById('view-select');
const roofToggle=document.getElementById('roof');
const surveyToggle=document.getElementById('survey-light');
const state={
 ready:false,errors:[],firstFrameFullyLoaded:false,
 texturesLoaded:0,modelsLoaded:0,walls:0,floor:'G',
 chapter:1,eastExitLocked:true,shot:'service',ceilingMeshes:0,ceilingRooms:[],
 storefrontCount:0,storefrontNames:[],storefrontEntries:[],
 closedBayCount:0,closedBayNames:[],checkpointV117:null,
 staffServiceV127:[],staffFixtureCountV127:0,annexCorridorV127B:null,
 galleryColumnsV118:[],galleryColumnCount:0,
 galleryAmenitiesV120:null,benchCountV120:0,directoryCountV120:0,wayfindingCountV120:0,
 anchorRetailV121:[],anchorRetailCountV121:0,
 anchorIdentityV122:null,ceilingPanelCountV122:0,departmentSignCountV122:0,
 anchorStockV123:[],stockCountV123:0,supportedStockV123:0,groundStockV123:0,
 cassetteCastleV124:null,cassetteFixtureCountV124:0,cassetteCeilingCountV124:0,cassetteCaseCountV124:0,vinylSleeveCountV124:0,cassettePosterCountV124:0,
 videoPlanetV125:null,videoFixtureCountV125:0,videoCeilingCountV125:0,videoVhsCountV125:0,videoPosterCountV125:0,
 sunburstArcadeV126:null,sunburstFixtureCountV126:0,sunburstLampCountV126:0,sunburstPosterCountV126:0,
 annexAnchorV128:null,annexAnchorFixtureCountV128:0,annexAnchorLampCountV128:0,annexAnchorStockCountV128:0,
 firebreakV129:null,firebreakClosedAreaV129:0,firebreakRemainingV129:520,
 rearServiceV131:null,rearSourceFloorV131:0,rearRemainderV131:435,
  originalFrontV133:null,frontRemainingV133:372,
 ceilingFinishes:[],allCeilingsTextured:false,surveyLightOn:true
};
const shots={
 service:{floor:'G',eye:[12,1.72,-27],target:[11,1.8,-49],label:'GROUND · CONTRACTOR SERVICE ENTRY',title:'Contractor Service Vestibule',
  note:'The opening cinematic leads to this exact side door, with an unobstructed pedestrian route into the mall.'},
 checkin:{floor:'G',eye:[12.4,1.76,-35.2],target:[13.65,1.83,-31.0],
  label:'GROUND · AFTER-HOURS CHECK-IN',title:'Closed Security Check-In',
  note:'The former oversized vestibule now contains an enclosed observation office with a physical, collision-blocking glass pane and a central contractor route.'},
 officeInterior:{floor:'G',eye:[14.8,1.65,-35.8],target:[14.8,1.25,-30.0],
  label:'GROUND · CLOSED OFFICE INTERIOR (SURVEY ONLY)',title:'Inside the Sealed Check-In Office',
  note:'Survey camera only: the player cannot enter this closed cell. Original licensed desk and chair are installed inside the physically sealed room.'},
 serviceTurn:{floor:'G',eye:[10.65,1.70,-39.4],target:[10,1.78,-43.4],
  label:'GROUND · HINGED-DOOR APPROACH',title:'Turn toward the Mall',
  note:'The narrow contractor entry widens before the original real hinged inner door. The cinematic eye and scripted door remain in their original locations.'},
 boarded:{floor:'G',eye:[-10.5,1.75,-41],target:[-10.5,2.3,-22.5],label:'GROUND · MAIN ENTRANCE',title:'Boarded Public Entry',
  note:'The once-prominent public doors are shuttered and fully blocked. The contractor must use the authorized service access.'},
 atrium:{floor:'G',eye:[0,1.78,-52],target:[0,1.5,-71],label:'GROUND · CENTRAL ATRIUM',title:'Pinewood’s Dry Fountain',
  note:'A single-story public gallery with a double-height glazed atrium. The abandoned fountain anchors orientation and later reveals.'},
 atriumLounge:{floor:'G',eye:[0,1.76,-52],target:[0,1.6,-62],
  label:'GROUND · ORIGINAL ATRIUM LOUNGE',title:'Actual 1979 Mall Benches',
  note:'Four verified source-licensed CC0 Kenney benches sit at deliberate fountain approaches, all original evidence and circulation remain open.'},
 directorySouth:{floor:'G',eye:[0.7,1.72,-47.5],target:[-3,1.43,-52],
  label:'GROUND · 1989 MAIN DIRECTORY',title:'Grounded Old Mall Directory',
  note:'A printed original-era wayfinding map in a real fixed, collidable unit; not a floating sign or user-authored Builder placement.'},
 directoryNorth:{floor:'G',eye:[6.8,1.72,-96.5],target:[3,1.33,-101],
  label:'GROUND · NORTHERN TENANT DIRECTORY',title:'Second Grounded Directory',
  note:'Original-sized fixed mall wayfinding at the north side of the fountain, with clear chapter routes.'},
 westLounge:{floor:'G',eye:[-20,1.7,-81],target:[-15.8,1.0,-87],
  label:'GROUND · WEST SHOPPING REST POINT',title:'Real Bench at West Shopping Walk',
  note:'Actual scaled CC0 bench, not a generated cube, kept out of the west x−20 through route and real 4.2-metre shop entries.'},
 eastLounge:{floor:'G',eye:[20,1.7,-81],target:[15.8,1.0,-87],
  label:'GROUND · EAST SHOPPING REST POINT',title:'Real Bench at East Shopping Walk',
  note:'Actual scaled CC0 bench outside east x20 circulation, supported by the original 1979 structural piers.'},
 fallows:{floor:'G',eye:[-32.1,1.73,-60.5],target:[-42.0,1.2,-60.5],
  label:'GROUND · FALLOW\'S 1979 ORIGINAL ANCHOR',title:"Fallow's Real Store Fittings",
  note:'Seventeen licensed displays, V122 failing ceiling lights, and real V123 folded stock, returns cartons, and supported original table merchandise. The 4.2m entry stays open.'},
 eastAnchor:{floor:'G',eye:[32.5,1.73,-52.0],target:[42.2,1.2,-52.0],
  label:'GROUND · ORIGINAL EAST ANCHOR STORE',title:'East Original Department Store Fittings',
  note:'Thirteen original displays, aged lighting, and V123 source-auditioned clearance/returns stock fitted around the 4.2m glazed storefront and original checkout aisles.'},
 fallowPlan:{floor:'G',eye:[-33,10.5,-49],target:[-38,0,-61],
  label:'1979 FALLOW\'S · SOURCE-ROOF REMOVED (SURVEY ONLY)',title:"Fallow's Original Floor Plan",
  note:'Survey-only cutaway: the real carpet and all 17 imported shop display objects without the overhead roof; no game camera, chapter or mall data was changed.'},
 eastAnchorPlan:{floor:'G',eye:[32,9.6,-44],target:[38,0,-52],
  label:'1979 ORIGINAL EAST ANCHOR · SOURCE-ROOF REMOVED (SURVEY ONLY)',title:'Original East Anchor Floor Plan',
  note:'Survey-only cutaway of exact 17 × 18 metre original department store and all 13 actual licensed fixtures, not conceptual arrangement.'},
 westGallery:{floor:'G',eye:[-20,1.75,-49],target:[-20,1.9,-104],
  label:'GROUND · WEST 1979 RETAIL GALLERY',title:'West Shopping Walk Columns',
  note:'Original-period structural piers frame the 1979 retail modules and connect to the existing soffit, with an unobstructed central walking line.'},
 eastGallery:{floor:'G',eye:[20,1.75,-49],target:[20,1.9,-102],
  label:'GROUND · EAST 1979 RETAIL GALLERY',title:'East Shopping Walk Columns',
  note:'Matching supported gallery columns leave the existing Video Planet, department store and food-court entrances completely open.'},
 atriumColumns:{floor:'G',eye:[0,1.75,-49],target:[0,4.5,-89],
  label:'GROUND · ORIGINAL HIGH ATRIUM',title:'Structural Fountain Colonnade',
  note:'Ten paired posts rise to the genuine solid roof outside the skylight; the central fountain and two LS evidence locations remain clear.'},
 west:{floor:'G',eye:[-19,1.74,-83],target:[-37,1.8,-82],label:'GROUND · WEST RETAIL',title:'Cassette Castle',
  note:'The 1979 original shop now has real CC0 fixture displays and authentic 1997 taped-music retail identity without blocking its 4.2m glazed entry.'},
 cassetteInside:{floor:'G',eye:[-31.2,1.72,-81.5],target:[-42,1.3,-80],
  label:'GROUND · CASSETTE CASTLE SHOP INTERIOR',title:'Real Vintage Music Store',
  note:'Twelve genuinely CC0 licensed display models, original human-scale cassette and vinyl stock, and a full 1997 print identity mounted on the genuine old masonry.'},
 cassetteCounter:{floor:'G',eye:[-37,1.7,-80.1],target:[-43,1.35,-77.1],
  label:'GROUND · CASSETTE CASTLE CHECKOUT',title:'Music Shop Checkout and Tape Displays',
  note:'Original staffed counter and record browsing racks preserved. Period print and dimmed original source ceiling lights are installed inside the real 1979 boundaries.'},
 cassetteRear:{floor:'G',eye:[-38,1.72,-84.5],target:[-40,1.6,-89],
  label:'GROUND · CASSETTE CASTLE REAR DISPLAYS',title:'Old Cassette and Vinyl Departments',
  note:'Five verified full-size source shelf bays are grouped by believable original shopping departments, with grounded cassette merchandise.'},
 arcadeFront:{floor:'G',eye:[-20,1.73,-98.5],target:[-38,1.6,-98.5],
  label:'GROUND · ORIGINAL SUNBURST ARCADE FRONTAGE',title:'Sunburst Arcade 1997',
  note:'Original full-width 4.2m glass entrance, real 17x17m suite, and preserved vintage cabinet positions.'},
 arcadeInside:{floor:'G',eye:[-31.5,1.73,-98.5],target:[-40.5,1.25,-95.5],
  label:'GROUND · SUNBURST ARCADE CENTER',title:'Actual 1997 Coin-Op Floor',
  note:'18 measured CC0 source cabinet meshes join original claw, basketball, air hockey and older machine props.'},
 arcadeNorth:{floor:'G',eye:[-38.1,1.73,-94.1],target:[-38.0,1.35,-91.65],
  label:'GROUND · SUNBURST NORTHERN MACHINE BANK',title:'Original Upright Cabinet Row',
  note:'Human-scale source machines and fictional Pinewood game marquees beneath genuine partially working fluorescents.'},
 arcadeWest:{floor:'G',eye:[-40,1.73,-98.5],target:[-44.3,1.37,-100.3],
  label:'GROUND · SUNBURST WESTERN PINBALL ROW',title:'Coin-Op Machines and Prize Wall',
  note:'Real source pinball, cabinet and prize racks with old fictional wall advertisements.'},
 arcadePlan:{floor:'G',eye:[-36,12.3,-89],target:[-38,0,-98.5],
  label:'SUNBURST · ORIGINAL SUITE CUTAWAY',title:'289m² Arcade Footprint',
  note:'Survey-only roof-free view verifies genuine source walls, door entry, separate arcade floor carpet and navigable machine rows.'},
 videoFront:{floor:'G',eye:[20,1.73,-70.5],target:[38,1.7,-70.5],
   label:'GROUND · VIDEO PLANET GLASS FRONTAGE',title:'Video Planet 1997 Rental Store',
   note:'Original 4.2m doorway, existing counter, authenticated CC0 perimeter fixtures and rental displays.'},
 videoInside:{floor:'G',eye:[31.1,1.72,-70.5],target:[42,1.48,-70],
   label:'GROUND · VIDEO PLANET RENTAL AISLES',title:'Original 1997 VHS Rental Store',
   note:'Fictional rental tapes on real CC0 fixtures, period prints and uneven roof lighting.'},
 videoCounter:{floor:'G',eye:[39.5,1.72,-70.5],target:[34.8,1.35,-65],
   label:'GROUND · VIDEO PLANET CASH DESK',title:'Counter and Luis’s Route Sketch',
   note:'Original counter, supported demo VHS and LS-03 evidence corridor remain physically accessible.'},
 videoRear:{floor:'G',eye:[38.8,1.72,-75],target:[42.3,1.5,-78.1],
   label:'GROUND · VIDEO PLANET RETURNS',title:'Late-Night Rental Returns',
   note:'Authentic grounded shelf bays, genuine merchandise table, return rack and fictional film promos.'},
 videoPlan:{floor:'G',eye:[38,11.4,-60],target:[38,0,-71],
   label:'VIDEO PLANET · ORIGINAL ROOM CUTAWAY',title:'1997 Rental Shop Floor Plan',
   note:'Roof-free survey verifies the 17×19m tenant, original evidence point and 4.2m glass entrance.'},
 cassettePlan:{floor:'G',eye:[-33,11.2,-72],target:[-38,0,-82],
  label:'CASSETTE CASTLE · SURVEY-ONLY ROOF CUTAWAY',title:'Original Music Store Floor Plan',
  note:'Survey-only roof-free view of canonical 17 × 17m music tenant, source-licensed furniture and real checkout/access paths.'},
 firebreakFront:{floor:'G',eye:[-24.2,1.73,-45.5],target:[-29.2,2.15,-45.5],
  label:'GROUND · 1979 FALLOW\'S NORTH FIREBREAK',title:'Source-Masonry Sealed Transfer',
  note:'Actual two source-reinforced end walls reuse the original 1979 retail and V116 reserve masonry; no new playable room or door.'},
 firebreakAngle:{floor:'G',eye:[-20.5,1.73,-48.5],target:[-29.1,2.1,-45.5],
  label:'GROUND · 1997 FIREBREAK FRONTAGE',title:'Original Closed North Stock Transfer',
  note:'Physical source wall with fixed original hand-lettered sign. The authentic Fallow\'s original 4.2m storefront remains untouched.'},
 firebreakPlan:{floor:'G',eye:[-37.5,16,-45.5],target:[-37.5,0,-45.5],
  label:'SURVEY · EXACT NORTHWEST ORIGINAL BUILDING SEAM',title:'85m² Original Service Void Closed',
  note:'Real roof-off geometry shows the 85m² enclosure, its source floor and sole new x=-46 and x=-29 walls. 435m² remains unallocated.'},
 rearSealInside:{floor:'G',eye:[40.5,1.75,-116.7],target:[36.5,3.1,-116.1],
   label:'GROUND · ORIGINAL EAST REAR SERVICE VOID (SURVEY)',title:'Original Rear Service Masonry',
   note:'Architectural survey inside the inaccessible 1979 rear service void; existing exterior walls and authentic short endcaps.'},
  rearSealNorth:{floor:'G',eye:[42.8,1.72,-116.6],target:[46.5,1.9,-115],
   label:'GROUND · ORIGINAL SERVICE END WALL',title:'One-Metre Original North Endcap',
   note:'Source wall and closed seam; no invented employee door or artificial mask.'},
  rearSealPlan:{floor:'G',eye:[38.5,16,-113.5],target:[38.5,0,-116.7],
   label:'SURVEY · 1979 EAST REAR SOURCE CUTAWAY',title:'61.5m² Real Floor and Open Fire Stair',
   note:'Roof-off original 63m² rear envelope; the 1.5m² north fire-stair shaft stays physically open.'},
  rearSealStair:{floor:'G',eye:[32.2,8.5,-113.6],target:[32,0,-115.2],
   label:'SURVEY · REAL CHAPTER 3 NORTH STAIR',title:'Protected B1-to-Security Stair Opening',
   note:'Roof-off original vertical transition with no false ceiling or floor over the real stairwell.'},
  frontSeamInside:{floor:'G',eye:[8,1.7,-34.5],target:[8,2,-42.9],
   label:'SURVEY · ORIGINAL BOARDED/CONTRACTOR FRONT SEAM',title:'Real Closed 1979 Front Service Interstice',
   note:'Actual 2m original service strip between boarded public lobby and V113 contractor vestibule, original facade, and new attached rear masonry.'},
  frontSeamPlan:{floor:'G',eye:[8,15.4,-30],target:[8,0,-33],
   label:'SURVEY · REAL ORIGINAL FRONT SOURCE CUTAWAY',title:'41m² Original Contractor-Facing Service Relief',
   note:'Roof-off shared source shows old y=0 slab, one attached plaster ceiling and one carefully cut-back rear wall connecting the existing x9 vestibule source masonry.'},
  frontSeamDoorApproach:{floor:'G',eye:[11.8,1.73,-38.5],target:[9.25,2.05,-43],
   label:'GROUND · REAL CONTRACTOR INNER FIRE-DOOR APPROACH',title:'Original V113 Hinged-Frame Clearance',
   note:'Canonical physical walls. The real licensed animated hinged leaf is separately tested on its game and cinematic path through all opening angles.'},
  closedNorth:{floor:'G',eye:[-22,1.75,-51],target:[-22,2.8,-43],label:'GROUND · NORTH FORMER RETAIL',title:'Needle & Thread · Shuttered',
  note:'A bounded original-era closed tenant suite beside the boarded main lobby. The steel shutter is physically sealed.'},
 closedAnnex:{floor:'G',eye:[61,1.75,-69],target:[55.8,2.2,-69],label:'GROUND · ANNEX SERVICE FRONTAGE',title:'East Wing Former Tenants',
  note:'Previously featureless Annex west wall now has actual service-bounded tenant fronts and period shutters.'},
 closedSouth:{floor:'G',eye:[-22,1.75,-104],target:[-23,2.5,-111],label:'GROUND · WEST SERVICE',title:'Old Janitorial Stores',
  note:'The staff supply room is separated from the public gallery by a closed roll-down shutter.'},
 northService:{floor:'G',eye:[3.7,1.72,-115],target:[8.0,1.85,-115],
  label:'GROUND · NORTH MAINTENANCE SPARES',title:'Original Rear-Service Utility Closet',
  note:'Actual original source-attached maintenance bay, with a closed shutter and locally verified CC0 cabinet.'},
 securityService:{floor:'G',eye:[39.2,1.72,-109.8],target:[44.1,1.73,-108],
  label:'GROUND · SECURITY SUPPORT',title:'Original CCTV Tape Archive',
  note:'Real security-office evidence tape bay; chapter consoles, stairwell and LS-05 remain accessible.'},
 trainingService:{floor:'G',eye:[75.7,1.72,-102.5],target:[79.6,1.77,-102.5],
  label:'GROUND · ANNEX TRAINING SERVICE',title:'Training T-04 AV Equipment Store',
  note:'A shuttered source room inside the true annex training suite, with original notes and training desk outside its wall.'},
 kitchenService:{floor:'G',eye:[77.9,1.72,-92],target:[82.2,1.6,-92],
  label:'GROUND · EAST ANNEX STAFF KITCHEN',title:'Passable Break Room Kitchen',
  note:'A real 2.4m open service doorway with CC0 kitchen cupboard and physical gameplay cabinet collision.'},
 lockerService:{floor:'G',eye:[78.5,1.72,-81],target:[82.2,1.7,-81],
  label:'GROUND · LOCKER ROOM SUPPORT',title:'Original Uniforms and Supply Bay',
  note:'A sealed uniform stock enclosure behind the live lockers, outside the LS-06 mixtape and canonical story interactions.'},
 annexAnchorFront:{floor:'G',eye:[60.7,1.73,-61.5],target:[72.5,1.64,-61.5],
  label:'GROUND · NORTHSTAR HOME ENTRY',title:'True 4.2m West Door',
  note:'The actual staff-corridor aperture connects to the 540m² Northstar shop and preserves the chapter route.'},
 annexAnchorInside:{floor:'G',eye:[68.2,1.72,-61.5],target:[82.5,1.65,-63.5],
  label:'GROUND · NORTHSTAR HOME 1997',title:'Actual Licensed Housewares Shop',
  note:'Real full-scale GLB retail fittings, original boxed home stock, original wall prints and gameplay collision.'},
 annexAnchorGoods:{floor:'G',eye:[73.9,1.72,-70.8],target:[80.5,1.25,-69.0],
  label:'GROUND · NORTHSTAR ORIGINAL GOODS',title:'1997 Home and Gifts',
  note:'Hand-authored original cartons supported by previously source-auditioned physical shelves and display tables.'},
 annexAnchorExit:{floor:'G',eye:[75,1.73,-56.6],target:[75,1.65,-47.5],
  label:'GROUND · NORTHSTAR EXIT APPROACH',title:'Real Chapter 6 Exit Connection',
  note:'Preserved unobstructed 4.2m original north doorway to the employee egress vestibule.'},
 annexAnchorPlan:{floor:'G',eye:[75,23,-61.5],target:[75,0,-61.5],
  label:'GROUND · NORTHSTAR ORIGINAL CUTAWAY',title:'True 540m² Store and Both Doors',
  note:'Source cutaway reveals full-size fixtures, physical route elbow, and unchanged main floor and egress geometry.'},
 annexAnchorNight:{floor:'G',eye:[72,1.72,-60.5],target:[81,1.70,-62.5],
  label:'GROUND · NORTHSTAR AFTER HOURS',title:'Genuine Failed and Working Ceiling Panels',
  note:'Original 7.61m high source-attached licensed CC0 fluorescents without survey-only illumination.'},
 annexSouth:{floor:'G',eye:[60.5,1.72,-99],target:[60.5,1.72,-84],
  label:'GROUND · 1992 EMPLOYEE SERVICE ROUTE',title:'Real 639 m² Original Staff Corridor',
  note:'Original 9 m by 71 m service hallway now has source-replaced tiled floor, real mounted CC0 ceiling lamps and service doors kept open.'},
 annexTraining:{floor:'G',eye:[60.5,1.72,-100],target:[64.8,2.93,-102.5],
  label:'GROUND · ORIGINAL ANNEX STAFF ENTRIES',title:'Authentic Staff Door Plates',
  note:'Wall-fixed wayfinding above existing real door lintels; original T-04 training, break, locker, Annex and east-exit paths unchanged.'},
 annexNorth:{floor:'G',eye:[60.5,1.72,-50],target:[60.5,1.72,-72],
  label:'GROUND · ANNEX SERVICE NORTH RETURN',title:'Underside-Mounted Late-Shift Lighting',
  note:'All eight physically measured licensed fluorescent meshes attach to the original 3.36 m service soffit; three remain failed.'},
 annexPlan:{floor:'G',eye:[60.5,63,-69.5],target:[60.5,0,-69.5],
  label:'GROUND · 1992 STAFF ROUTE CUTAWAY',title:'639 m² True Tile Replacement',
  note:'Survey-only overhead removes the ceiling to inspect the one true nonoverlapping tile slab and original doors.'},
 annexStaff:{floor:'G',eye:[60,1.72,-87],target:[60,1.72,-58],
  label:'GROUND · 1992 STAFF SPINE',title:'East Annex Employee Route',
  note:'Real east-wing staff corridor with original story thresholds and five new source-attached back-of-house service functions.'},
 east:{floor:'G',eye:[60,1.75,-54],target:[60,1.75,-97],label:'GROUND · EAST ANNEX',title:'The Later East Wing',
  note:'The East Wing is a period-specific addition to the original mall, with its own employee circulation and sealed thresholds.'},
 security:{floor:'G',eye:[34,1.73,-104],target:[36.5,1.7,-110],label:'GROUND · SECURITY DESK',title:'Security and CCTV',
  note:'A proper room off the original circulation system, connected to the old back-of-house routes.'},
 below:{floor:'B1',eye:[11,-2.45,-101],target:[-24,-2.3,-95],label:'B1 · BELOW GRADE',title:'Basement Service Spine',
  note:'The electrical, relay, feeder, and flood-threat spaces form an actual connected service floor under the mall.'},
 stairs:{floor:'B1',eye:[31.8,-2.42,-112.9],target:[32.1,-.9,-108.7],label:'B1 · NORTH FIRE STAIR',title:'Physical Stairwell',
  note:'Twenty-four actual basement treads rise to the ground floor; no teleport or decorative ramp.'},
 mezz:{floor:'M1',eye:[1.5,7.18,-97],target:[0,2.5,-75],label:'M1 · ADMIN MEZZANINE',title:'Atrium Overlook',
  note:'The administrative mezzanine has offices, real floor slabs, a guard rail, and sightlines into the dark atrium.'},
 pa:{floor:'M1',eye:[72,7.18,-109],target:[73,7.2,-96],label:'M1 · PA CONTROL',title:'Closing and PA Controls',
  note:'The final-phase upper administration and public-address system are spatially linked to the East Wing.'},
 exit:{floor:'G',eye:[77,1.74,-42],target:[87,1.75,-42],label:'GROUND · EMPLOYEE EXIT',title:'Chapter-Gated East Exit',
  note:'The east door is physically barred until the final chapter, when the clock-out route becomes available.'},
 aerial:{floor:'G',eye:[130,103,102],target:[17,0,-72],label:'ALL LEVELS · CUTAWAY',title:'Joined Mall Structure',
  note:'The public mall, basement service level, and administrative mezzanine occupy one consistent world.'}
};
let scene,camera,renderer,orbit,built,surveyLight,aerialAmbient;
const publicApi={
 ready:false,
 getState:()=>JSON.parse(JSON.stringify({...state,
  cameraPosition:camera?.position.toArray()||null,
  cameraForward:camera?.getWorldDirection(new THREE.Vector3()).toArray()||null,
  cameraTarget:shots[state.shot].target
 })),
 goto:setShot,
 setChapter
};
window.__PINEWOOD_MALL_CONSTRUCTION_V67__=publicApi;
function syncReadout(){
 const shot=shots[state.shot];
 document.getElementById('view-floor').textContent=shot.label;
 document.getElementById('view-title').textContent=shot.title;
 document.getElementById('view-note').textContent=shot.note;
 document.querySelectorAll('[data-shot]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.shot===state.shot)));
 viewSelect.value=state.shot;
 document.getElementById('door-stat').textContent=state.eastExitLocked?'LOCKED':'OPEN';
}
function setShot(name){
 if(!shots[name])throw Error('Unknown inspection camera: '+name);
 state.shot=name;state.floor=shots[name].floor;syncReadout();
 // A distant cutaway cannot be judged through full-range scene fog and the
 // camera-mounted near-field lamp. This survey-only overhead fill is never
 // installed in the Builder, opening film or playable game.
 if(scene?.fog)scene.fog.density=['aerial','annexPlan','annexAnchorPlan','firebreakPlan','rearSealPlan','rearSealStair','frontSeamPlan'].includes(name)?.0011:.005;
 if(aerialAmbient)aerialAmbient.intensity=name==='annexAnchorPlan'?2.8:name==='firebreakPlan'?2.2:['rearSealPlan','rearSealStair','frontSeamPlan'].includes(name)?2.1:['aerial','annexPlan'].includes(name)?1.3:0;
 if(!camera)return;
 const s=shots[name];camera.position.set(...s.eye);
 const target=new THREE.Vector3(...s.target);
 camera.lookAt(target);
 if(orbit){
  orbit.target.copy(target);orbit.enabled=name==='aerial';
  // OrbitControls.update() clamps every camera to minDistance=18, even when
  // controls are disabled. Fixed vestibule/office cameras are intentionally
  // 3–6m from their target; never run orbit distance-clamping on those shots.
  if(orbit.enabled)orbit.update();
 }
 if(built)built.setRoofVisible(roofToggle.checked&&!['aerial','fallowPlan','eastAnchorPlan','cassettePlan','videoPlan','arcadePlan','annexPlan','annexAnchorPlan','firebreakPlan','rearSealPlan','rearSealStair','frontSeamPlan'].includes(name));
 renderer?.render(scene,camera);
}
function setChapter(value){
 const chapter=Number(value);
 if(!Number.isInteger(chapter)||chapter<1||chapter>6)throw Error('Invalid chapter');
 state.chapter=chapter;state.eastExitLocked=chapter<6;
 if(built)built.setChapter(chapter);
 chapterSelect.value=String(chapter);syncReadout();
 renderer?.render(scene,camera);
}
function resize(){
 if(!renderer||!camera)return;
 const w=Math.max(320,world.clientWidth),h=Math.max(300,world.clientHeight);
 camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
}
function renderOnDemand(){if(renderer&&scene&&camera)renderer.render(scene,camera);}
async function begin(){
 try{
  const clock=document.querySelector('#loading progress');
  scene=new THREE.Scene();scene.background=new THREE.Color(0x0c181a);
  aerialAmbient=new THREE.AmbientLight(0xdce3dc,0);scene.add(aerialAmbient);
  scene.fog=new THREE.FogExp2(0x0e1718,.005);
  camera=new THREE.PerspectiveCamera(69,1,.06,650);
  // Survey instrumentation exists ONLY on this review page, never Builder,
  // cinematic, authored scene, or playable game lighting rigs.
  surveyLight=new THREE.PointLight(0xe5e8d6,95,35,2);
  camera.add(surveyLight);
  scene.add(camera);
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.4));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.16;
  world.prepend(renderer.domElement);
  resize();
  orbit=new OrbitControls(camera,renderer.domElement);
  orbit.enableDamping=false;orbit.minDistance=18;orbit.maxDistance=260;orbit.enabled=false;
  orbit.addEventListener('change',renderOnDemand);
  setShot('service');
  clock.value=30;
  built=await renderConstructionScene({scene,chapter:state.chapter});
  clock.value=94;
  state.texturesLoaded=built.texturesLoaded;
  state.modelsLoaded=built.modelsLoaded;
  state.closedBayCount=built.closedBaysV116.length;
  state.closedBayNames=built.closedBaysV116.map(b=>b.name);
  state.checkpointV117={...built.checkpointV117};
  state.staffServiceV127=[...built.staffServiceV127];
  state.staffFixtureCountV127=built.staffFixtureCountV127;
  state.annexCorridorV127B={...built.annexCorridorV127B};
  state.galleryColumnsV118=[...built.galleryColumnsV118];
  state.galleryColumnCount=state.galleryColumnsV118.length;
  state.galleryAmenitiesV120={
   benches:[...built.galleryAmenitiesV120.benches],
   directories:[...built.galleryAmenitiesV120.directories],
   wayfinding:[...built.galleryAmenitiesV120.wayfinding]
  };
  state.benchCountV120=state.galleryAmenitiesV120.benches.length;
  state.directoryCountV120=state.galleryAmenitiesV120.directories.length;
  state.wayfindingCountV120=state.galleryAmenitiesV120.wayfinding.length;
  state.anchorRetailV121=[...built.anchorRetailV121];
  state.anchorRetailCountV121=state.anchorRetailV121.length;
  state.anchorIdentityV122={panels:[...built.anchorIdentityV122.panels],signs:[...built.anchorIdentityV122.signs]};
  state.ceilingPanelCountV122=state.anchorIdentityV122.panels.length;
  state.departmentSignCountV122=state.anchorIdentityV122.signs.length;
  state.anchorStockV123=[...built.anchorStockV123];
  state.stockCountV123=state.anchorStockV123.length;
  state.supportedStockV123=state.anchorStockV123.filter(p=>p.support).length;
  state.groundStockV123=state.stockCountV123-state.supportedStockV123;
  state.cassetteCastleV124={...built.cassetteCastleV124};
  state.cassetteFixtureCountV124=state.cassetteCastleV124.fixtures.length;
  state.cassetteCeilingCountV124=state.cassetteCastleV124.fluorescents.length;
  state.cassetteCaseCountV124=state.cassetteCastleV124.authoredPeriodStock.totalCassetteCases;
  state.vinylSleeveCountV124=state.cassetteCastleV124.authoredPeriodStock.vinylSleeves;
  state.cassettePosterCountV124=state.cassetteCastleV124.posters.length;
  state.videoPlanetV125={...built.videoPlanetV125};
  state.videoFixtureCountV125=state.videoPlanetV125.fixtures.length;
  state.videoCeilingCountV125=state.videoPlanetV125.fluorescents.length;
  state.videoVhsCountV125=state.videoPlanetV125.stock.totalVhsCases;
  state.videoPosterCountV125=state.videoPlanetV125.posters.length;
  state.sunburstArcadeV126={...built.sunburstArcadeV126};
  state.sunburstFixtureCountV126=state.sunburstArcadeV126.fixtures.length;
  state.sunburstLampCountV126=state.sunburstArcadeV126.fluorescents.length;
  state.sunburstPosterCountV126=state.sunburstArcadeV126.posters.length;
  state.annexAnchorV128={...built.annexAnchorV128};
  state.annexAnchorFixtureCountV128=state.annexAnchorV128.fixtures.length;
  state.annexAnchorLampCountV128=state.annexAnchorV128.lights.length;
  state.annexAnchorStockCountV128=state.annexAnchorV128.authoredOriginalStock;
  state.firebreakV129={...built.firebreakV129};
  state.firebreakClosedAreaV129=state.firebreakV129.survey.newlyEnclosed;
  state.firebreakRemainingV129=state.firebreakV129.survey.remaining;
  state.rearServiceV131={...built.rearServiceV131};
  state.rearSourceFloorV131=state.rearServiceV131.survey.actualFloorResolved;
  state.rearRemainderV131=state.rearServiceV131.survey.physicalResidualRemaining;
  state.originalFrontV133={...built.originalFrontV133};
  state.frontRemainingV133=state.originalFrontV133.unresolvedAfter;
  state.storefrontCount=built.storefrontsV115.length;
  state.storefrontNames=built.storefrontsV115.map(f=>f.sign);
  state.storefrontEntries=built.storefrontsV115.map(f=>({room:f.id,entryWidth:f.entryWidth,windowSpan:f.windowSpan}));
  state.walls=built.shells.reduce((n,s)=>n+s.walls.length,0);
  state.ceilingMeshes=built.ceilings.children.length;
  // Keep the legacy 41-room ceiling audit scoped to canonical room names;
  // V117 adds two subordinate drop ceilings but does not create story rooms.
  state.ceilingRooms=[...new Set(built.ceilings.children.map(mesh=>mesh.userData.roomCeiling)
   .filter(name=>!String(name).startsWith('v117_')&&!String(name).startsWith('v129_')&&!String(name).startsWith('v131_')&&!String(name).startsWith('v133_')))].sort();
  state.ceilingFinishes=[...new Set(built.ceilings.children.map(mesh=>({
   id:mesh.userData.ceilingFinish,
   texture:mesh.material.map?.image?.src?.split('/').pop()||null
  })).map(x=>JSON.stringify(x)))].map(x=>JSON.parse(x));
  state.allCeilingsTextured=built.ceilings.children.length>0&&built.ceilings.children.every(mesh=>
   mesh.material.isMeshStandardMaterial&&!!mesh.material.map?.image?.width);
  state.errors=[...built.geometryErrors];
  document.getElementById('walls-stat').textContent=String(state.walls);
  document.getElementById('models-stat').textContent=String(state.modelsLoaded);
  document.getElementById('floors-stat').textContent=String(built.shells.length);
  document.getElementById('build-status').textContent=
   '3 joined floors · '+state.walls+' structural partitions · '+state.texturesLoaded+
   ' preloaded material maps · '+state.modelsLoaded+' placed CC0 fixtures · '+
   state.storefrontCount+' glazed shopfronts · '+state.closedBayCount+' enclosed support bays · '+
   state.checkpointV117.cells+' closed service-checkpoint cells · '+
   state.staffServiceV127.length+' authentic 1997 staff/support subdivisions · '+
   state.staffFixtureCountV127+' licensed CC0 staff service cabinets · '+
   state.annexCorridorV127B.tiledArea+'m² true Annex service tile · '+
   state.firebreakClosedAreaV129+'m² original north service firebreak enclosed · '+
   state.rearSourceFloorV131+'m² original east rear physical floor closed with original stair gap · '+
   state.rearRemainderV131+'m² V131 historic remainder · '+
   state.originalFrontV133.enclosure.originalArea+'m² original front service physically sealed · '+
   state.frontRemainingV133+'m² original footprint still unresolved · '+
   state.annexCorridorV127B.panels.length+' licensed ceiling fluorescents · '+
   state.annexCorridorV127B.signs.length+' source-mounted staff plates · '+
   state.annexCorridorV127B.cabinets.length+' licensed Annex filing stations · '+
   state.galleryColumnCount+' original structural gallery piers · '+
   state.anchorRetailCountV121+' real source-licensed 1979 department-store fittings · '+
   state.ceilingPanelCountV122+' actual pinned ceiling fixtures · '+state.departmentSignCountV122+' wall-fixed internal signs · '+
   state.stockCountV123+' source-verified original retail stock / returns pieces · '+
   state.cassetteFixtureCountV124+' genuine CC0 Cassette Castle fixtures · '+
   state.cassetteCeilingCountV124+' original 1979 music-shop fluorescent panels · '+
   state.cassetteCaseCountV124+' original full-scale music cassettes · '+
   state.vinylSleeveCountV124+' original printed vinyl sleeves · '+
   state.cassettePosterCountV124+' original source-mounted shop posters · '+
   state.videoFixtureCountV125+' genuine CC0 Video Planet rental fixtures · '+
   state.videoVhsCountV125+' original VHS rental cases · '+
   state.videoPosterCountV125+' original fictional film posters · '+
   state.sunburstFixtureCountV126+' real CC0 full-size Sunburst arcade machines · '+
   state.sunburstLampCountV126+' authentic arcade ceiling fluorescents · '+
   state.annexAnchorFixtureCountV128+' true Northstar GLB fixtures · '+
   state.annexAnchorLampCountV128+' Northstar source-mounted ceiling lamps · '+
   state.annexAnchorStockCountV128+' original boxed home goods · '+
   state.benchCountV120+' genuine CC0 benches · '+state.directoryCountV120+
   ' original ground directories. No remote 3D assets.';
  setChapter(state.chapter);
  setShot(state.shot);
  renderer.render(scene,camera);
  // The complete static scene has been rendered before the opaque
  // preloading cover can disappear. Nothing streams into view afterward.
  state.firstFrameFullyLoaded=!!built.firstFrameFullyLoaded;
  state.ready=true;publicApi.ready=true;
  clock.value=100;cover.classList.add('hidden');
 }catch(error){
  state.errors.push(String(error?.stack||error));
  cover.querySelector('strong').textContent='Construction review could not load';
  cover.querySelector('span').textContent=String(error?.message||error);
  document.getElementById('build-status').textContent=String(error?.stack||error);
  console.error(error);
 }
}
for(const b of document.querySelectorAll('[data-shot]'))b.addEventListener('click',()=>setShot(b.dataset.shot));
viewSelect.addEventListener('change',e=>setShot(e.target.value));
chapterSelect.addEventListener('change',e=>setChapter(e.target.value));
roofToggle.addEventListener('change',()=>{built?.setRoofVisible(roofToggle.checked&&!['aerial','fallowPlan','eastAnchorPlan','cassettePlan','videoPlan','arcadePlan','annexPlan','annexAnchorPlan','firebreakPlan','rearSealPlan','rearSealStair','frontSeamPlan'].includes(state.shot));renderOnDemand()});
surveyToggle.addEventListener('change',()=>{
  state.surveyLightOn=surveyToggle.checked;
  if(surveyLight)surveyLight.intensity=state.surveyLightOn?95:0;
  renderOnDemand();
});
window.addEventListener('resize',()=>{resize();renderOnDemand()});
window.addEventListener('pagehide',()=>{built?.dispose();orbit?.dispose();renderer?.dispose();});
begin();
