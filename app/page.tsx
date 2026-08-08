"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, MeshReflectorMaterial, RoundedBox, Sparkles } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import * as THREE from "three";

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
const range = (p: number, start: number, length: number) => clamp((p - start) / length);

const subscribeOnce = () => () => {};

function useClientExperience() {
  const hydrated = useSyncExternalStore(subscribeOnce, () => true, () => false);
  const guest = useSyncExternalStore(
    subscribeOnce,
    () => new URLSearchParams(location.search).get("guest") || "Friend",
    () => "Friend",
  );
  let webgl = false;
  if (hydrated) {
    try {
      const canvas = document.createElement("canvas");
      webgl = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch { webgl = false; }
  }
  return { guest, webgl };
}

function useJourney() {
  const progress = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.current = max ? scrollY / max : 0;
    };
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / innerWidth - 0.5) * 2;
      pointer.current.y = (e.clientY / innerHeight - 0.5) * 2;
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("pointermove", move, { passive: true });
    return () => { removeEventListener("scroll", update); removeEventListener("pointermove", move); };
  }, []);
  return { progress, pointer };
}

function Envelope({ progress, pointer }: ReturnType<typeof useJourney>) {
  const group = useRef<THREE.Group>(null);
  const flap = useRef<THREE.Mesh>(null);
  const card = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const p = progress.current;
    if (!group.current || !flap.current || !card.current) return;
    const open = range(p, .035, .075);
    const leave = range(p, .13, .075);
    flap.current.rotation.x = THREE.MathUtils.damp(flap.current.rotation.x, -Math.PI * open, 5, dt);
    card.current.position.y = THREE.MathUtils.damp(card.current.position.y, open * 2.35, 5, dt);
    card.current.position.z = THREE.MathUtils.damp(card.current.position.z, open * 1.4, 5, dt);
    card.current.rotation.x = THREE.MathUtils.damp(card.current.rotation.x, -.08 + pointer.current.y * .045, 4, dt);
    card.current.rotation.y = THREE.MathUtils.damp(card.current.rotation.y, pointer.current.x * .08, 4, dt);
    group.current.position.z = -leave * 5;
    group.current.scale.setScalar(1 - leave * .82);
  });
  return <group ref={group} position={[0, -.35, 0]}>
    <RoundedBox args={[3.7, 2.55, .12]} radius={.06} smoothness={5}>
      <meshPhysicalMaterial color="#e8dfd1" roughness={.62} metalness={.04} clearcoat={.25} />
    </RoundedBox>
    <mesh ref={flap} position={[0, 1.25, .07]} rotation={[0, 0, Math.PI]}>
      <shapeGeometry args={[useMemo(() => { const s = new THREE.Shape(); s.moveTo(-1.82,0);s.lineTo(1.82,0);s.lineTo(0,-1.3);s.closePath();return s; },[])]} />
      <meshPhysicalMaterial color="#f3ebdf" side={THREE.DoubleSide} roughness={.55} />
    </mesh>
    <group ref={card} position={[0, .05, .2]}>
      <RoundedBox args={[3.05, 2.05, .07]} radius={.045} smoothness={5}>
        <meshPhysicalMaterial color="#d8d2e2" transmission={.42} thickness={.6} roughness={.18} metalness={.12} clearcoat={1} />
      </RoundedBox>
      <mesh position={[0, 0, .065]}><ringGeometry args={[.38,.46,64]} /><meshStandardMaterial color="#c39b54" metalness={1} roughness={.2} /></mesh>
      <mesh position={[0,0,.08]}><circleGeometry args={[.18,64]} /><meshStandardMaterial color="#7d5d93" metalness={.7} roughness={.23} /></mesh>
    </group>
  </group>;
}

function RibbonPath({ progress }: { progress: React.MutableRefObject<number> }) {
  const ribbon = useRef<THREE.Mesh>(null);
  const cup = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Group>(null);
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-7,-1,-4), new THREE.Vector3(-3,1,-8), new THREE.Vector3(1,-.4,-12), new THREE.Vector3(5,1.4,-17), new THREE.Vector3(0,0,-22)
  ]), []);
  useFrame((_,dt) => {
    const reveal = range(progress.current,.17,.22);
    if (ribbon.current) ribbon.current.scale.y = THREE.MathUtils.damp(ribbon.current.scale.y, reveal, 4, dt);
    if (cup.current) cup.current.scale.setScalar(THREE.MathUtils.damp(cup.current.scale.x, range(progress.current,.22,.05) * (1-range(progress.current,.35,.04)),5,dt));
    if (ring.current) ring.current.scale.setScalar(THREE.MathUtils.damp(ring.current.scale.x, range(progress.current,.36,.05) * (1-range(progress.current,.5,.04)),5,dt));
  });
  return <group>
    <mesh ref={ribbon}><tubeGeometry args={[curve,160,.045,12,false]} /><meshStandardMaterial color="#c6a5ef" emissive="#633b91" emissiveIntensity={2} /></mesh>
    <group ref={cup} position={[-3,1,-8]} scale={0}>
      <mesh><cylinderGeometry args={[.55,.43,.8,48]} /><meshPhysicalMaterial color="#f0e9dd" roughness={.28} clearcoat={.8} /></mesh>
      <mesh position={[.57,.05,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.29,.08,16,32]} /><meshStandardMaterial color="#f0e9dd" /></mesh>
      <Sparkles count={18} scale={2} size={2} speed={.25} color="#dbc1ff" />
    </group>
    <group ref={ring} position={[4.8,1.3,-17]} scale={0}>
      <RoundedBox args={[1.6,1.3,1.35]} radius={.18} smoothness={5}><meshPhysicalMaterial color="#4c263f" roughness={.38} /></RoundedBox>
      <mesh position={[0,.85,.1]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.35,.075,20,64]} /><meshStandardMaterial color="#d9b15f" metalness={1} roughness={.12} /></mesh>
      <mesh position={[0,1.18,.1]}><octahedronGeometry args={[.16]} /><meshPhysicalMaterial color="#ffffff" transmission={.5} roughness={0} /></mesh>
    </group>
  </group>
}

function Venue({ progress }: { progress: React.MutableRefObject<number> }) {
  const arch = useRef<THREE.Group>(null);
  const calendar = useRef<THREE.Group>(null);
  useFrame((_,dt) => {
    const show = range(progress.current,.53,.08);
    if (arch.current) arch.current.scale.setScalar(THREE.MathUtils.damp(arch.current.scale.x,show,5,dt));
    if (calendar.current) {
      calendar.current.position.y = THREE.MathUtils.damp(calendar.current.position.y, range(progress.current,.63,.06) * 1.2,4,dt);
      calendar.current.rotation.y += dt * .08;
    }
  });
  return <group position={[0,0,-30]}>
    <group ref={arch} scale={0}>
      <mesh rotation={[0,0,0]}><torusGeometry args={[3.4,.28,28,96,Math.PI]} /><meshPhysicalMaterial color="#e9dfd2" roughness={.2} metalness={.18} clearcoat={1} /></mesh>
      <mesh position={[-3.4,-2,0]}><cylinderGeometry args={[.28,.38,4,32]} /><meshStandardMaterial color="#e9dfd2" /></mesh>
      <mesh position={[3.4,-2,0]}><cylinderGeometry args={[.28,.38,4,32]} /><meshStandardMaterial color="#e9dfd2" /></mesh>
      {Array.from({length:18}).map((_,i)=><Float key={i} speed={1+i%3} floatIntensity={.6}><mesh position={[(i%2?1:-1)*(2.6+(i%4)*.25),1.1-(i%6)*.5,(i%3)*.2]} rotation={[i,.2*i,0]}><sphereGeometry args={[.16,12,8]} /><meshStandardMaterial color={i%3===0?"#b78fe2":"#f0dfd2"} /></mesh></Float>)}
    </group>
    <group ref={calendar} position={[0,0,1]}>
      <RoundedBox args={[3.4,2.35,.12]} radius={.12} smoothness={5}><meshPhysicalMaterial color="#f4eee5" transmission={.22} thickness={.5} roughness={.12} clearcoat={1} /></RoundedBox>
      <mesh position={[0,.45,.09]}><planeGeometry args={[2.2,.06]} /><meshStandardMaterial color="#a78abc" /></mesh>
      <mesh position={[0,-.15,.09]}><planeGeometry args={[1.25,.08]} /><meshStandardMaterial color="#332b38" /></mesh>
      <mesh position={[0,-.46,.09]}><planeGeometry args={[1.65,.035]} /><meshStandardMaterial color="#867d87" /></mesh>
    </group>
  </group>;
}

function CameraRig({ progress, pointer }: ReturnType<typeof useJourney>) {
  const { camera } = useThree();
  useFrame((_,dt) => {
    const p=progress.current;
    const points = [
      new THREE.Vector3(0,0,7), new THREE.Vector3(0,.2,4.5), new THREE.Vector3(-2,1,-3),
      new THREE.Vector3(-3,1,-7), new THREE.Vector3(3,1,-15), new THREE.Vector3(0,0,-23), new THREE.Vector3(0,.2,-26.5), new THREE.Vector3(0,0,-35)
    ];
    const scaled=clamp(p/.86)* (points.length-1), idx=Math.min(points.length-2,Math.floor(scaled)), t=scaled-idx;
    const target=points[idx].clone().lerp(points[idx+1],t);
    target.x += pointer.current.x*.16; target.y -= pointer.current.y*.1;
    camera.position.lerp(target,1-Math.exp(-dt*2.4));
    camera.lookAt(0,0,camera.position.z-6);
  });
  return null;
}

function WorldCanvas({ journey }: { journey: ReturnType<typeof useJourney> }) {
  return <Canvas className="world-canvas" dpr={[1,1.7]} camera={{position:[0,0,7],fov:42}} gl={{antialias:true,alpha:false}}>
    <color attach="background" args={["#120e17"]} />
    <fog attach="fog" args={["#120e17",10,35]} />
    <ambientLight intensity={.7} /><directionalLight position={[4,7,6]} intensity={3.2} color="#ffe1bd" /><pointLight position={[-4,1,-12]} intensity={35} color="#a36dde" />
    <Suspense fallback={null}><Environment preset="sunset" /><Envelope {...journey}/><RibbonPath progress={journey.progress}/><Venue progress={journey.progress}/>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-2.15,-15]}><planeGeometry args={[70,70]} /><MeshReflectorMaterial blur={[600,120]} resolution={512} mixBlur={1} mixStrength={25} roughness={.72} depthScale={1} color="#171018" metalness={.22}/></mesh>
      <Sparkles count={90} scale={[22,8,42]} size={1.5} speed={.12} color="#e7d7ff" />
    </Suspense><CameraRig {...journey}/>
  </Canvas>;
}

function RSVP() {
  const [answer,setAnswer]=useState<"yes"|"no"|null>(null); const [meal,setMeal]=useState("Celebration menu"); const [sent,setSent]=useState(false);
  if(sent) return <div className="rsvp-card success"><span className="success-orb">✓</span><p className="kicker">Response received</p><h2>{answer==="yes"?"We’ll save you a place in our world.":"Your love still reaches us."}</h2><button onClick={()=>setSent(false)}>Edit response</button></div>;
  return <form className="rsvp-card" onSubmit={e=>{e.preventDefault();if(answer)setSent(true)}}>
    <p className="kicker">The final stop</p><h2>Will you join us?</h2><div className="rsvp-choices"><button type="button" className={answer==="yes"?"selected":""} onClick={()=>setAnswer("yes")}><span>✦</span>Joyfully, yes</button><button type="button" className={answer==="no"?"selected":""} onClick={()=>setAnswer("no")}><span>♡</span>With love, no</button></div>
    {answer==="yes"&&<div className="form-reveal"><label>How should we welcome you?<input required placeholder="Your name" /></label><label>Your table preference<select value={meal} onChange={e=>setMeal(e.target.value)}><option>Celebration menu</option><option>Vegetarian menu</option><option>Tell us privately</option></select></label></div>}
    {answer&&<label className="form-reveal">Leave a little love<textarea placeholder="A note for Alexander & Chioma" /></label>}
    <button className="send-response" disabled={!answer}>Send my response <span>→</span></button>
  </form>;
}

export default function Home() {
  const journey=useJourney(); const [begun,setBegun]=useState(false); const { guest, webgl } = useClientExperience();
  useEffect(()=>{document.body.classList.add("locked");return()=>document.body.classList.remove("locked")},[]);
  const begin=()=>{setBegun(true);document.body.classList.remove("locked");setTimeout(()=>scrollTo({top:innerHeight*.7,behavior:"smooth"}),500)};
  return <main className={begun?"experience begun":"experience"}>
    {webgl ? <WorldCanvas journey={journey}/> : <div className="fallback-world" aria-hidden="true"><div className="fallback-glow"/><div className="fallback-envelope"><div className="fallback-flap"/><div className="fallback-card"><i>A</i><span>&</span><i>C</i></div><div className="fallback-seal">∞</div></div></div>}<div className="vignette"/><div className="noise"/>
    <header><a href="#invitation">A<span>∞</span>C</a><div className="journey-line"><i/><span>Our wedding world</span></div><button onClick={()=>scrollTo({top:document.body.scrollHeight,behavior:"smooth"})}>RSVP</button></header>
    <section id="invitation" className="beat beat-intro">
      <div className="intro-copy"><p className="kicker">A private world for {guest}</p><h1>You’re invited<br/>to step inside.</h1><button className="enter" onClick={begin}><span>Open the envelope</span><i>↓</i></button></div>
      <p className="gesture">Scroll to unfold the story</p>
    </section>
    <section className="beat beat-card"><div className="glass-copy"><p className="kicker">Together with their families</p><h2>Alexander<br/><i>&</i> Chioma</h2><p>invite you to witness the beginning<br/>of their forever.</p></div></section>
    <section className="beat beat-begin"><div className="story-label left"><span>01</span><p>Where it all began</p><h3>One conversation.<br/>A thousand reasons<br/>to keep talking.</h3><time>2021 · Lagos</time></div></section>
    <section className="beat beat-yes"><div className="story-label right"><span>02</span><p>Then came the question</p><h3>She said<br/><em>yes.</em></h3><time>2025 · Somewhere unforgettable</time></div></section>
    <section className="beat beat-venue"><div className="detail-copy"><p className="kicker">The celebration</p><h2>September 15<br/><i>Twenty twenty-seven</i></h2><div className="details"><div><span>02:00 PM</span><p>The Vow<br/>The Glass House, Lagos</p></div><div><span>04:30 PM</span><p>The Gathering<br/>Moon Garden, Victoria Island</p></div></div><button>Add to calendar <span>＋</span></button></div></section>
    <section className="beat beat-dress"><div className="dress-copy"><p className="kicker">Dress the part</p><h2>Dusk,<br/>devotion<br/><i>& a little magic.</i></h2><p>Formal · expressive · unmistakably you</p><div><span/><span/><span/><span/></div></div></section>
    <section className="beat beat-rsvp"><div className="sunset"><i/><i/><i/></div><RSVP/><footer><span>A ∞ C</span><p>September 15, 2027 · Lagos</p><small>A wedding world by Dyrane</small></footer></section>
  </main>;
}
