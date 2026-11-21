import React,{useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {Play,Pause,RotateCcw,FlaskConical} from 'lucide-react';
import {physics} from './physics';

export default function PhysicsLab({onPractice}){
 const [mass,setMass]=useState(3),[force,setForce]=useState(6),[running,setRunning]=useState(false),[time,setTime]=useState(0),[error,setError]=useState(false);
 const mount=useRef(),live=useRef({mass,force,running}),elapsed=useRef(0),reset=useRef(()=>{});
 live.current={mass,force,running};
 const values=physics(force,mass,time);
 function restart(){elapsed.current=0;setTime(0);setRunning(false);reset.current();}
 function change(setter,value){restart();setter(Number(value));}
 useEffect(()=>{
 const host=mount.current;let renderer,frame,observer,controls,visible=true;let intersects;
 try{
 renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;host.append(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(39,1,.1,100);camera.position.set(5,3.2,7);camera.lookAt(0,0,0);
 controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableZoom=false;controls.enableDamping=true;controls.minPolarAngle=.35;controls.maxPolarAngle=Math.PI/2.1;
 scene.add(new THREE.AmbientLight('#d6e9bd',1.8));const light=new THREE.DirectionalLight('#ffffff',3);light.position.set(3,6,4);scene.add(light);
 const group=new THREE.Group();scene.add(group);
 const body=new THREE.Mesh(new THREE.BoxGeometry(1.2,.48,.8),new THREE.MeshStandardMaterial({color:'#c6ff6b',metalness:.5,roughness:.2}));body.position.y=.4;group.add(body);
 const top=new THREE.Mesh(new THREE.BoxGeometry(.8,.15,.6),new THREE.MeshStandardMaterial({color:'#4c5e35',metalness:.7,roughness:.25}));top.position.y=.72;group.add(top);
 const wheels=[];for(const x of [-.43,.43])for(const z of [-.43,.43]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.1,20),new THREE.MeshStandardMaterial({color:'#182010',metalness:.3,roughness:.5}));wheel.rotation.x=Math.PI/2;wheel.position.set(x,.18,z);group.add(wheel);wheels.push(wheel);}
 const arrow=new THREE.ArrowHelper(new THREE.Vector3(1,0,0),new THREE.Vector3(.7,.45,0),1.1,'#c6ff6b',.22,.12);group.add(arrow);
 const floor=new THREE.GridHelper(15,30,'#536d37','#22341c');floor.position.y=-.02;scene.add(floor);
 const track=new THREE.Mesh(new THREE.BoxGeometry(12,.05,.035),new THREE.MeshBasicMaterial({color:'#c6ff6b'}));track.position.set(0,.01,.8);scene.add(track);
 const markers=new THREE.Group();for(let i=0;i<13;i++){const tick=new THREE.Mesh(new THREE.BoxGeometry(.025,.05,.2),new THREE.MeshBasicMaterial({color:'#759752'}));tick.position.set(i-6,.025,.8);markers.add(tick);}scene.add(markers);
 group.position.x=-4;
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;const d=Math.max(10,11/(2*Math.tan(THREE.MathUtils.degToRad(39/2))*camera.aspect));camera.position.copy(new THREE.Vector3(5,3.2,7).normalize().multiplyScalar(d));camera.updateProjectionMatrix();};observer=new ResizeObserver(resize);observer.observe(host);resize();
 intersects=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;});intersects.observe(host);
 const clock=new THREE.Clock();let lastUi=0;reset.current=()=>{group.position.x=-4;wheels.forEach(w=>w.rotation.z=0);};
 const draw=()=>{frame=requestAnimationFrame(draw);const dt=Math.min(clock.getDelta(),.05);if(!visible||document.hidden)return;const current=live.current;if(current.running){elapsed.current=Math.min(3,elapsed.current+dt);if(elapsed.current-lastUi>.08||elapsed.current===3){lastUi=elapsed.current;setTime(elapsed.current);}if(elapsed.current===3)setRunning(false);}else if(elapsed.current===0){lastUi=0;}
 const p=physics(current.force,current.mass,elapsed.current);group.position.x=-4+p.distance*.1;wheels.forEach(w=>w.rotation.z=-p.distance*.8);arrow.setLength(.6+current.force/12,.22,.12);body.scale.y=.6+current.mass/8;controls.update();renderer.render(scene,camera);
 };draw();
 return()=>{cancelAnimationFrame(frame);observer.disconnect();intersects.disconnect();controls.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});renderer.dispose();renderer.domElement.remove();};
 }catch{setError(true);renderer?.dispose();renderer?.domElement.remove();let last=performance.now();const fallback=()=>{frame=requestAnimationFrame(fallback);const now=performance.now(),dt=Math.min((now-last)/1000,.05);last=now;if(live.current.running&&!document.hidden){elapsed.current=Math.min(3,elapsed.current+dt);setTime(elapsed.current);if(elapsed.current===3)setRunning(false);}};fallback();return()=>{cancelAnimationFrame(frame);observer?.disconnect();intersects?.disconnect();controls?.dispose();};}
 },[]);
 return <section className="card physicsLab" id="physics-lab"><div className="physicsHeading"><div><span className="cardLabel"><FlaskConical size={16}/> HANDS-ON PHYSICS</span><h3>Change the force. See what happens.</h3><p>Explore Newton’s second law in a frictionless, straight-line experiment.</p></div><span className="formula">F = ma</span></div><div className="physicsGrid"><div className="experimentStage"><div ref={mount} className="experimentCanvas" role="img" aria-label="Draggable 3D trolley showing the effect of force and mass"/>{error&&<div className="experimentFallback">The numerical experiment still works when 3D is unavailable.</div>}<div className="experimentCaption"><span>3-second trial · Visual distance scaled to fit</span><span>Drag to change view</span></div></div><div className="experimentPanel"><label htmlFor="mass">Mass <output>{mass} kg</output></label><input id="mass" aria-label="Mass in kilograms" type="range" min="1" max="8" step="1" value={mass} onChange={e=>change(setMass,e.target.value)}/><label htmlFor="force">Applied force <output>{force} N</output></label><input id="force" aria-label="Applied force in newtons" type="range" min="0" max="16" step="1" value={force} onChange={e=>change(setForce,e.target.value)}/><div className="physicsReadouts" aria-live="off"><div><small>Acceleration</small><b>{values.acceleration.toFixed(2)} <span>m/s²</span></b></div><div><small>Time</small><b>{time.toFixed(1)} <span>s</span></b></div><div><small>Velocity</small><b>{values.velocity.toFixed(2)} <span>m/s</span></b></div><div><small>Displacement</small><b>{values.distance.toFixed(2)} <span>m</span></b></div></div><div className="experimentActions"><button className="primary" onClick={()=>{if(elapsed.current>=3){elapsed.current=0;setTime(0);}setRunning(v=>!v);}}>{running?<Pause size={16}/>:<Play size={16}/>} {running?'Pause':'Run experiment'}</button><button className="outline" onClick={restart} aria-label="Reset experiment"><RotateCcw size={16}/></button></div><p className="experimentInsight">{force===0?'Zero net force means zero acceleration.':`At ${force} N and ${mass} kg, acceleration is ${values.acceleration.toFixed(2)} m/s². Try doubling the mass while keeping force constant.`}</p><button className="textButton" onClick={()=>onPractice('newton')}>Practice this principle</button></div></div></section>;
}

