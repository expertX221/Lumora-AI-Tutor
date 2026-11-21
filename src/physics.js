export function physics(force,mass,time){
 if(![force,mass,time].every(Number.isFinite)||mass<=0||force<0||time<0)throw new RangeError('Use finite values, positive mass, and nonnegative force and time.');
 const acceleration=force/mass;
 return {acceleration,velocity:acceleration*time,distance:.5*acceleration*time*time};
}
