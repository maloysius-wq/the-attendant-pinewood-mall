import {MALL} from './masterplan-v66.mjs';
import {FURNISHINGS_V69} from './furnishing-plan-v69.mjs';

const BY_ID=new Map(MALL.rooms.map(r=>[r.id,r]));
const LAST_SHIFT=new Map(FURNISHINGS_V69.storyAnchors.map(a=>[a.id,a]));
const FIXED={
  1:{
    'breaker:A':['west_gallery',-16,-62],
    'breaker:B':['east_gallery',20,-62],
    'breaker:C':['north_service',3,-115],
    'exit':['freight_lobby',17,-113]
  },
  2:{
    'breaker:D':['relay_d',-30,-95],
    'breaker:E':['relay_e',-11,-94],
    'ch2_control_v21:feeder':['feeder_room',2,-93],
    'ch2_control_v21:pump':['sump_pit',-29,-75],
    'Security Keycard':['freight_b1',23,-110],
    'GAVIN-TICKET':['gavin_niche',23,-78],
    'door':['b1_stair',31,-111]
  },
  3:{
    'ch3_console_v22:cctv':['security',36,-111],
    'ch3_console_v22:route':['security',41,-111],
    'LUIS-ROUTE':['security',43,-105],
    'door':['annex_threshold',42,-99]
  },
  4:{
    'ch4_route_map_v23':['receiving_r12',53,-107],
    'ch4_locker_v23':['staff_lockers',74,-80],
    'LS-06':['staff_lockers',72,-81],
    'JO-CLOSING-NOTES':['training_t04',72,-102],
    'PRE-1986-LOG':['receiving_r12',53,-105],
    'ch4_staff_photo_v23':['staff_lockers',75,-84],
    'door':['receiving_r12',53,-111]
  },
  5:{
    'JO-ROSTER-PAGES':['payroll_office',36,-89],
    'PAYROLL-1997':['payroll_office',36,-86],
    'TIMECLOCK-1997':['contractor_ledger',75,-89],
    'ch5_roster_terminal_v24':['roster_records',50,-89],
    'ch5_sessions_terminal_v24':['pa_control',75,-109],
    'door':['eli_chase',61,-104]
  },
  6:{
    'ch6_exit_v25':['east_exit_vestibule',83,-42]
  }
};
const FALLBACK={
  1:['central_gallery',6,-83],
  2:['b1_spine',10,-92],
  3:['security',38,-106],
  4:['east_wing_spine',60,-74],
  5:['mezz_hall',57,-97],
  6:['pa_control',73,-109]
};

export function storyTargetV70({chapter,type='',id='',label='',controlId='',index=0}={}){
 if(!Number.isInteger(chapter)||chapter<1||chapter>6)throw RangeError('Invalid chapter for story placement');
 const evidence=LAST_SHIFT.get(label)||LAST_SHIFT.get(id);
 if(evidence)return {room:evidence.room,x:evidence.x,z:evidence.z,canonical:true};
 const keys=[type+':'+(controlId||id),id,label,type];
 const match=keys.map(k=>FIXED[chapter][k]).find(Boolean);
 if(match)return {room:match[0],x:match[1],z:match[2],canonical:true};
 const [room,x,z]=FALLBACK[chapter];
 const r=BY_ID.get(room);
 const column=index%3-1,row=Math.floor(index/3)%3-1;
 return {room,x:Math.max(r.x1+.8,Math.min(r.x2-.8,x+column*1.3)),
  z:Math.max(r.z1+.8,Math.min(r.z2-.8,z+row*1.3)),canonical:false};
}
