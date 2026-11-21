import React,{useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {gsap} from 'gsap';
import {scaleLinear} from 'd3';
import {animate} from 'animejs';
import {Pause,Play,RotateCcw,Maximize2,Minimize2,Orbit,MousePointer2} from 'lucide-react';
import {concepts} from './engine';
import assets from './assets.json';

const colorFor=scaleLinear().domain([0,.4,.7,1]).range(['#FFBD76','#E0D69D','#C6FF6B','#80EDBE']).clamp(true);
const positions=concepts.map((c,i)=>{const a=i/12*Math.PI*2;return new THREE.Vector3(Math.cos(a)*3.8,Math.sin(a)*2.3,Math.sin(a*2)*1.2);});
const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function Count({value}){const ref=useRef();useEffect(()=>{const el=ref.current;if(reduced()){el.textContent=value;return;}const counter={value:Number(el.textContent)||0};const anim=animate(counter,{value,duration:900,ease:'outExpo',onUpdate:()=>{el.textContent=Math.round(counter.value);}});return()=>anim.pause();},[value]);return <span ref={ref}>{value}</span>;}

export default function Universe({state,mode='hero',selected,onSelect}){
 const mount=useRef(),api=useRef(),labels=useRef({}),data=useRef(state),callback=useRef(onSelect),[paused,setPaused]=useState(reduced),[expanded,setExpanded]=useState(false),[failed,setFailed]=useState(false),[hovered,setHovered]=useState(null),[modelReady,setModelReady]=useState(false);
 data.current=state;callback.current=onSelect;
 useEffect(()=>{let renderer,frame,observer,controls,disposed=false;const el=mount.current;if(!el)return;let objects=[],tweens=[];
 try{
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;el.prepend(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.set(mode==='bars'?7:0,mode==='bars'?5:1.2,mode==='bars'?10:13.5);
 controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.06;controls.enablePan=false;controls.minDistance=mode==='hero'?7:5;controls.maxDistance=20;controls.autoRotateSpeed=.3;controls.autoRotate=!reduced();controls.enableZoom=mode!=='hero';controls.target.set(0,0,0);
 const world=new THREE.Group();scene.add(world);scene.add(new THREE.AmbientLight('#e6f3df',1.5));const key=new THREE.DirectionalLight('#ffffff',3.5);key.position.set(4,6,7);scene.add(key);const rim=new THREE.PointLight('#c6ff6b',25);rim.position.set(-4,1,3);scene.add(rim);const back=new THREE.PointLight('#8bb3a2',16);back.position.set(3,-3,-4);scene.add(back);
 const ringGroup=new THREE.Group();world.add(ringGroup);const coreGroup=new THREE.Group();world.add(coreGroup);
 const metal=new THREE.MeshStandardMaterial({color:'#c7d5c6',metalness:.85,roughness:.18});
 if(mode!=='bars'){
 const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.84,1),new THREE.MeshPhysicalMaterial({color:'#daf6b2',metalness:.6,roughness:.14,clearcoat:1,emissive:'#163004',emissiveIntensity:.4}));coreGroup.add(core);
 const wire=new THREE.Mesh(new THREE.IcosahedronGeometry(.87,1),new THREE.MeshBasicMaterial({color:'#c6ff6b',wireframe:true,transparent:true,opacity:.35}));coreGroup.add(wire);
 for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(1.55+i*.28,.022,10,120),i===1?metal:new THREE.MeshStandardMaterial({color:'#c6ff6b',emissive:'#3e6413',emissiveIntensity:.65,metalness:.65,roughness:.18}));ring.rotation.set(.55+i*.8,i*.7,i*.25);ringGroup.add(ring);}
 if(assets.tripoModel&&mode==='hero')new GLTFLoader().load(assets.tripoModel,gltf=>{if(disposed){gltf.scene.traverse(o=>{o.geometry?.dispose();if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});return;}const box=new THREE.Box3().setFromObject(gltf.scene),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());const container=new THREE.Group();gltf.scene.position.sub(center);container.add(gltf.scene);container.scale.setScalar(3.7/Math.max(size.x,size.y,size.z));gltf.scene.traverse(o=>{if(o.isMesh){o.material=new THREE.MeshPhysicalMaterial({color:'#b9ca9f',metalness:.75,roughness:.22,clearcoat:1});}});core.visible=false;wire.visible=false;ringGroup.visible=false;coreGroup.add(container);setModelReady(true);},undefined,()=>{});
 }
 const nodes=concepts.map((c,i)=>{
 const score=data.current.mastery[c.id];const mat=new THREE.MeshStandardMaterial({color:colorFor(score),metalness:.4,roughness:.24,emissive:colorFor(score),emissiveIntensity:.12});
 const mesh=new THREE.Mesh(mode==='bars'?new THREE.BoxGeometry(.48,1,.48):new THREE.SphereGeometry(.12+score*.12,24,16),mat);mesh.userData.id=c.id;
 if(mode==='bars'){mesh.position.set((i%6-2.5)*.95,score*2-1.6,(Math.floor(i/6)-.5)*2.2);mesh.scale.y=.2+score*4;}else mesh.position.copy(positions[i]);world.add(mesh);objects.push(mesh);
 if(mode!=='bars'){
 const halo=new THREE.Mesh(new THREE.TorusGeometry(.3,.008,6,50),new THREE.MeshBasicMaterial({color:colorFor(score),transparent:true,opacity:.4}));halo.position.copy(positions[i]);halo.rotation.x=i*.4;world.add(halo);
 const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),positions[i]]),new THREE.LineBasicMaterial({color:'#718360',transparent:true,opacity:mode==='hero'?.13:.06}));world.add(line);
 }
 return mesh;
 });
 if(mode==='graph')concepts.forEach((c,i)=>c.prerequisites.forEach(id=>{const j=concepts.findIndex(n=>n.id===id);const start=positions[j],end=positions[i],mid=start.clone().add(end).multiplyScalar(.5);mid.z+=.3;const curve=new THREE.QuadraticBezierCurve3(start,mid,end);const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(40)),new THREE.LineBasicMaterial({color:'#c6ff6b',transparent:true,opacity:.3}));world.add(line);const dir=end.clone().sub(curve.getPoint(.88)).normalize();world.add(new THREE.ArrowHelper(dir,curve.getPoint(.89),.25,'#c6ff6b',.12,.07));}));
 if(mode==='bars'){const floor=new THREE.GridHelper(10,20,'#4c5e31','#202a21');floor.position.y=-1.75;world.add(floor);controls.target.y=-.1;}
 const stars=new Float32Array(200*3);for(let i=0;i<stars.length;i++)stars[i]=Math.sin(i*127.1+17)*14;const starGeo=new THREE.BufferGeometry();starGeo.setAttribute('position',new THREE.BufferAttribute(stars,3));const particles=new THREE.Points(starGeo,new THREE.PointsMaterial({color:'#b8d18f',size:.018,transparent:true,opacity:.5}));scene.add(particles);
 const resize=()=>{const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};observer=new ResizeObserver(resize);observer.observe(el);resize();
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down;
 const hit=e=>{const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(objects)[0]?.object;};
 const onMove=e=>{const obj=hit(e);renderer.domElement.style.cursor=obj?'pointer':'grab';setHovered(v=>v===(obj?.userData.id||null)?v:obj?.userData.id||null);};
 const onDown=e=>{down=[e.clientX,e.clientY];};const onUp=e=>{if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])<6){const obj=hit(e);if(obj)callback.current?.(obj.userData.id);}down=null;};
 renderer.domElement.addEventListener('pointermove',onMove);renderer.domElement.addEventListener('pointerdown',onDown);renderer.domElement.addEventListener('pointerup',onUp);
 const lost=e=>{e.preventDefault();setFailed(true);};renderer.domElement.addEventListener('webglcontextlost',lost);
 let active=true;const intersection=new IntersectionObserver(entries=>{active=entries[0].isIntersecting;});intersection.observe(el);
 const clock=new THREE.Clock();let last=0;
 const render=()=>{frame=requestAnimationFrame(render);const t=clock.getElapsedTime();if(!active||document.hidden||t-last<1/40)return;last=t;controls.update();if(!api.current?.paused){ringGroup.rotation.y=t*.12;coreGroup.rotation.y=t*.08;coreGroup.position.y=Math.sin(t*.65)*.09;particles.rotation.y=t*.008;}
 const rect=el.getBoundingClientRect();nodes.forEach((node,i)=>{const label=labels.current[concepts[i].id];if(!label)return;const p=node.getWorldPosition(new THREE.Vector3()).project(camera);label.style.transform=`translate(-50%,-50%) translate(${(p.x*.5+.5)*rect.width}px,${(-p.y*.5+.5)*rect.height+(mode==='bars'?27:30)}px)`;label.style.opacity=p.z>1||Math.abs(p.x)>1.1||Math.abs(p.y)>1.1?'0':'1';});renderer.render(scene,camera);};
 api.current={paused:reduced(),controls,nodes,world,camera,reset:()=>{controls.autoRotate=false;tweens.push(gsap.to(camera.position,{x:mode==='bars'?7:0,y:mode==='bars'?5:1.2,z:mode==='bars'?10:13.5,duration:reduced()?0:1.2,ease:'power3.out'}));tweens.push(gsap.to(controls.target,{x:0,y:0,z:0,duration:reduced()?0:1}));},focus:id=>{const node=nodes.find(n=>n.userData.id===id);if(!node)return;controls.autoRotate=false;const p=node.getWorldPosition(new THREE.Vector3());tweens.push(gsap.to(controls.target,{x:p.x*.25,y:p.y*.25,z:p.z*.25,duration:reduced()?0:.9,ease:'power2.out'}));}};render();
 return()=>{disposed=true;cancelAnimationFrame(frame);observer?.disconnect();intersection.disconnect();controls.dispose();tweens.forEach(t=>t.kill());renderer.domElement.removeEventListener('pointermove',onMove);renderer.domElement.removeEventListener('pointerdown',onDown);renderer.domElement.removeEventListener('pointerup',onUp);renderer.domElement.removeEventListener('webglcontextlost',lost);scene.traverse(o=>{o.geometry?.dispose();if(o.material){const list=Array.isArray(o.material)?o.material:[o.material];list.forEach(m=>{Object.values(m).forEach(v=>v?.isTexture&&v.dispose());m.dispose();});}});renderer.dispose();renderer.domElement.remove();api.current=null;};
 }catch{setFailed(true);renderer?.dispose();renderer?.domElement.remove();return()=>{disposed=true;cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();};}
 },[mode]);
 useEffect(()=>{if(api.current){api.current.paused=paused;api.current.controls.autoRotate=!paused;}},[paused]);
 useEffect(()=>{if(selected)api.current?.focus(selected);},[selected]);
 useEffect(()=>{api.current?.nodes.forEach(n=>{const score=state.mastery[n.userData.id];n.material.color.set(colorFor(score));n.material.emissive.set(colorFor(score));if(mode==='bars'){gsap.to(n.scale,{y:.2+score*4,duration:reduced()?0:1});gsap.to(n.position,{y:score*2-1.6,duration:reduced()?0:1});}});},[state,mode]);
 return <div className={`universe universe-${mode} ${expanded?'universe-expanded':''}`}>
 <div className="universe-canvas" ref={mount} role="img" aria-label={mode==='bars'?'Interactive 3D concept mastery columns':'Interactive 3D knowledge constellation'}>
 {mode!=='hero'&&!failed&&concepts.map(c=><button key={c.id} className={`space-label ${selected===c.id?'is-selected':''} ${hovered===c.id?'is-hovered':''}`} ref={el=>labels.current[c.id]=el} onClick={()=>onSelect?.(c.id)}><b>{c.name}</b><span>{Math.round(state.mastery[c.id]*100)}% mastery</span></button>)}
 </div>
 {failed?<div className="space-fallback"><Orbit size={36}/><h3>Your concept universe</h3><p>3D rendering isn’t available on this device. Every concept is still accessible below.</p><div>{concepts.map(c=><button key={c.id} onClick={()=>onSelect?.(c.id)}>{c.name} · {Math.round(state.mastery[c.id]*100)}%</button>)}</div></div>:<><div className="space-corner"><span className="live-dot"/>{mode==='hero'?(modelReady?'YOUR LEARNING CORE':'KNOWLEDGE IN ORBIT'):mode==='bars'?'MASTERY IN THREE DIMENSIONS':'YOUR CONNECTED UNDERSTANDING'}</div><div className="space-controls"><span><MousePointer2 size={13}/>{mode==='hero'?'Drag to explore':'Drag to orbit · Select a concept'}</span><button aria-label={paused?'Resume scene motion':'Pause scene motion'} onClick={()=>setPaused(v=>!v)}>{paused?<Play size={15}/>:<Pause size={15}/>}</button><button aria-label="Reset 3D camera" onClick={()=>api.current?.reset()}><RotateCcw size={15}/></button>{mode!=='hero'&&<button aria-label={expanded?'Exit expanded view':'Expand 3D view'} onClick={()=>setExpanded(v=>!v)}>{expanded?<Minimize2 size={15}/>:<Maximize2 size={15}/>}</button>}</div></>}
 </div>;
}
