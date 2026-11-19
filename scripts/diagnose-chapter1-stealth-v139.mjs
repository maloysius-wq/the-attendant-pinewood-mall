/** Read-only source navigation diagnostics. No geometry, save, or Builder writes. */
import {buildGameplayLayoutV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';
import {storyTargetV70} from '../mall/story-placement-v70.mjs';
const layout=buildGameplayLayoutV70({chapter:1}),start=layout.spawn;
const sites=[
 ['fallow_display',-43,-54],['fallow_access_n',-43,-52],['fallow_access_e',-41,-54],
 ['fallow_access_s',-43,-56],['fallow_access_es',-41,-56],
 ['west_noise_1',-17,-79],['west_noise_2',-18,-80],['west_noise_3',-19,-80],
 ['west_noise_4',-16,-92],['west_noise_5',-19,-94],
 ['arcade_noise_1',-37,-96],['arcade_noise_2',-37,-101],
 ['arcade_noise_3',-33,-96],['arcade_noise_4',-35,-94],
 ['east_noise_1',16,-72],['east_noise_2',18,-78],['east_noise_3',20,-82],['east_noise_4',24,-73],
 ['service_key',6,-81],['breaker_A',-16,-62],['breaker_B',20,-62],['breaker_C',3,-115],
];
for(const [name,x,z] of sites){
 const dest={x,z},route=shortestRouteV70(layout,start,dest);
 const nearby=layout.colliders.filter(c=>x>c.minX-1.0&&x<c.maxX+1.0&&z>c.minZ-1.0&&z<c.maxZ+1.0).map(c=>c.id);
 console.log('STEALTH_SITE '+JSON.stringify({name,x,z,room:layout.roomAt(x,z),stand:layout.canStand(x,z),fromSpawn:route.length,
  nearby:nearby.slice(0,10)}));
}
console.log('STEALTH_ROUTE_BASE '+JSON.stringify({spawn:layout.spawn,door:layout.shell.portals.filter(p=>p.id.includes('service_vestibule')).map(p=>p.id)}));
