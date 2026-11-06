import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three/build/three.module.js';
import {createWorkLighting} from '../builder/work-lighting.js';

test('temporary work lights brighten real scene illumination and restore the atmospheric baseline exactly',()=>{
 const scene=new THREE.Scene();
 scene.fog=new THREE.FogExp2(0x10191b,.0045);
 const renderer={toneMappingExposure:1.14};
 const workLighting=createWorkLighting(scene,renderer);
 const original=workLighting.getState();
 assert.deepEqual(original,{enabled:false,exposure:1.14,fillIntensity:0,fogDensity:.0045});
 const fill=scene.children.find(x=>x.isHemisphereLight);
 assert.ok(fill,'Builder work light must be part of the actual 3D scene');
 workLighting.setEnabled(true);
 const brighter=workLighting.getState();
 assert.equal(brighter.enabled,true);
 assert.ok(brighter.fillIntensity>=1&&brighter.fillIntensity<=1.5,'work mode adds sufficient fill without bleaching CC0 colors');
 assert.equal(fill.intensity,brighter.fillIntensity,'lighting state changes the actual light');
 assert.ok(brighter.exposure>original.exposure,'work mode raises actual WebGL exposure');
 assert.ok(brighter.fogDensity<original.fogDensity,'work mode reveals distant mall areas');
 workLighting.setEnabled(false);
 assert.deepEqual(workLighting.getState(),original,'switching back restores the cinematic values');
 workLighting.dispose();
 assert.equal(scene.children.includes(fill),false,'editor-only work light is removed on disposal');
});
