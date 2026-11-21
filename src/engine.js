export const concepts = [
 ['distance','Distance & displacement',[], 'Displacement is the shortest directed change in position, not the total path.'],
 ['speed','Speed',['distance'],'Speed is distance divided by time.'],
 ['velocity','Velocity',['speed'],'Velocity includes direction; speed does not.'],
 ['acceleration','Acceleration',['velocity'],'Acceleration is change in velocity per second and may be negative.'],
 ['uniform','Uniform motion',['velocity'],'Constant velocity means zero acceleration.'],
 ['graphs','Motion graphs',['velocity','acceleration'],'The slope of a velocity–time graph is acceleration; its area is displacement.'],
 ['equations','Equations of motion',['acceleration','uniform'],'Use v = u + at only when acceleration is constant.'],
 ['inertia','Inertia',[],'Inertia is resistance to a change of motion, not a force.'],
 ['force','Net force',['inertia','acceleration'],'A net force changes velocity; constant velocity requires zero net force.'],
 ['newton','Newton’s second law',['force'],'Net force equals mass times acceleration.'],
 ['momentum','Momentum',['velocity','newton'],'Momentum is mass times velocity and includes direction.'],
 ['gravity','Free fall',['equations','force'],'Ignoring air resistance, all masses fall with the same acceleration.']
].map(([id,name,prerequisites,lesson])=>({id,name,prerequisites,lesson}));
const bank = [
 ['A runner travels 30 m east, then 10 m west. What is the displacement?',['20 m east','40 m east','20 m west','40 m west'],0,'Adding path lengths gives distance, not displacement.','distance.*(same|equal).*displacement|displacement.*(total|entire).*path'],
 ['A cyclist covers 120 m in 20 s. What is the average speed?',['6 m/s','100 m/s','2400 m/s','0.17 m/s'],0,'Speed is distance divided by time, not their product.','speed.*(multiply|product)|time.*divided.*distance'],
 ['A car turns a corner at constant speed. Does its velocity change?',['Yes, its direction changes','No, speed is constant','Only if it speeds up','Only if it stops'],0,'Velocity can change when direction changes, even at constant speed.','velocity.*(same|constant|unchanged).*speed|speed.*constant.*(no|not).*change'],
 ['A car moving east slows from 20 m/s to 10 m/s in 5 s. Taking east as positive, its acceleration is…',['−2 m/s²','+2 m/s²','0 m/s²','−6 m/s²'],0,'Acceleration can be negative: (10 − 20) / 5 = −2 m/s².','acceleration.*(always|must|cannot|can.t).*(positive|negative)|slowing.*positive'],
 ['An object moves with constant velocity. Its acceleration is…',['Zero','Positive','Negative','Increasing'],0,'Acceleration measures change in velocity, not the presence of motion.','moving.*(must|has).*acceleration|velocity.*nonzero.*acceleration'],
 ['What does the area under a velocity–time graph represent?',['Displacement','Acceleration','Force','Speed'],0,'Slope gives acceleration; area gives displacement.','area.*acceleration|slope.*displacement'],
 ['With u = 4 m/s, a = 2 m/s² and t = 3 s, find v.',['10 m/s','6 m/s','18 m/s','5 m/s'],0,'For constant acceleration, v = u + at = 4 + 2 × 3.','v.*u.*a.*divid'],
 ['When a bus stops suddenly, a passenger leans forward because…',['Their body tends to keep moving','A forward force appears','Gravity pulls them forward','Their mass decreases'],0,'Inertia keeps the body moving; it is not a new forward force.','inertia.*(is a force|pushes)|forward force'],
 ['A puck moves at constant velocity on frictionless ice. Its net force is…',['Zero','Forward','Backward','Increasing'],0,'Force is needed to change velocity, not sustain constant velocity.','(need|require).*force.*(keep|continue|moving)|force.*(always|must).*motion'],
 ['A 3 kg object accelerates at 4 m/s². What is its net force?',['12 N','1.33 N','7 N','0.75 N'],0,'F = ma, so 3 × 4 = 12 N.','force.*mass.*divid'],
 ['A 2 kg ball moves east at 3 m/s. Its momentum is…',['6 kg·m/s east','1.5 kg·m/s east','5 kg·m/s','6 N'],0,'Momentum is mass × velocity, including its direction.','momentum.*(no direction|scalar)|momentum.*force'],
 ['A heavy and a light ball fall in a vacuum. Which accelerates faster?',['Neither; acceleration is equal','The heavy ball','The light ball','It depends on their speed'],0,'Without air resistance, gravitational acceleration does not depend on mass.','(heavy|heavier|more mass).*(faster|greater acceleration)|mass.*(increases|determines).*acceleration']
];
function rawQuestion(id, mastery=0.3, variant=0){
 const i=concepts.findIndex(c=>c.id===id), b=bank[i], level=mastery<.4?'Foundation':mastery<.7?'Developing':'Challenge';
 if(['speed','acceleration','equations','newton','momentum'].includes(id) && variant>0){
 const n=2+(variant%7), a=3+(variant%5); let prompt,answer,unit;
 if(id==='speed'){prompt=`A student travels ${n*a} m in ${a} s. Find the average speed.`;answer=n;unit='m/s';}
 if(id==='acceleration'){prompt=`Velocity changes from ${n*a} to 0 m/s in ${a} s. Find acceleration in the original positive direction.`;answer=-n;unit='m/s²';}
 if(id==='equations'){prompt=`Initial velocity is ${n} m/s and constant acceleration is ${a} m/s². Find velocity after ${n} s.`;answer=n+a*n;unit='m/s';}
 if(id==='newton'){prompt=`What net force accelerates a ${n} kg object at ${a} m/s²?`;answer=n*a;unit='N';}
 if(id==='momentum'){prompt=`Find the momentum of a ${n} kg object moving east at ${a} m/s.`;answer=n*a;unit='kg·m/s east';}
 const opts=[answer,answer+a,answer-a,answer+2*a].map(v=>`${v} ${unit}`); return {id,prompt,options:opts,correct:0,level,explanation:b[3],pattern:b[4]};
 }
 return {id,prompt:level==='Challenge'?b[0]+' Explain the governing principle and why an alternative is incorrect.':b[0],options:b[1],correct:b[2],level,explanation:b[3],pattern:b[4]};
}
export function question(id,mastery=.3,variant=0){const q=rawQuestion(id,mastery,variant);const shift=(concepts.findIndex(c=>c.id===id)+variant)%4;const order=[0,1,2,3].map(i=>(i+shift)%4);return {...q,options:order.map(i=>q.options[i]),correct:order.indexOf(q.correct)};}
export function detect(q,reason){const match=reason.match(new RegExp(q.pattern,'i'));return match?{misconception:q.explanation,evidence:match[0]}:null;}
export function updateMastery(old,correct,misconception){return Math.max(.05,Math.min(.98,old+(correct?.14:-.1)-(misconception?.08:0)));}
export function schedule(score,correct,now=Date.now()){return now+(correct?(score>.75?7:score>.45?3:1)*86400000:600000);}
export function choose(state){return [...concepts].sort((a,b)=>{const rank=c=>(state.mastery[c.id]??.3)-(state.due[c.id]<=Date.now()?.18:0);return rank(a)-rank(b);})[0];}
export const initial=()=>({mastery:Object.fromEntries(concepts.map(c=>[c.id,.3])),due:{},history:[],diagnostic:0,complete:false});

