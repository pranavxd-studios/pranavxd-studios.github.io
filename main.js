(function(){
var RM=matchMedia('(prefers-reduced-motion:reduce)').matches,
FINE=matchMedia('(hover:hover) and (pointer:fine)').matches,
DPR=Math.min(devicePixelRatio||1,2),MOB=innerWidth<700,
$=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
/* page transitions */
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a');
if(!a||e.metaKey||e.ctrlKey||e.shiftKey||a.target||a.origin!==location.origin||(a.pathname===location.pathname&&a.hash))return;
e.preventDefault();document.body.classList.add('out');setTimeout(function(){location.href=a.href},170)});
addEventListener('pageshow',function(){document.body.classList.remove('out')});
if(RM)return;
/* helpers: run a frame loop only while the element is on screen */
function loop(el,fn){var vis=true,run=false,last=0;
new IntersectionObserver(function(e){vis=e[0].isIntersecting;go()}).observe(el);
document.addEventListener('visibilitychange',go);
function ok(){return vis&&!document.hidden}
function go(){if(ok()&&!run){run=true;last=performance.now();requestAnimationFrame(f)}}
function f(t){if(!ok()){run=false;return}fn(t,Math.min(t-last,50));last=t;requestAnimationFrame(f)}go()}
function layer(host){var c=document.createElement('canvas');c.className='fx';host.appendChild(c);var x=c.getContext('2d'),o={c:c,x:x,W:0,H:0};
function rs(){var r=host.getBoundingClientRect();o.W=r.width;o.H=r.height;c.width=r.width*DPR;c.height=r.height*DPR;x.setTransform(DPR,0,0,DPR,0,0)}
rs();addEventListener('resize',rs);return o}
function pointer(host,cb){var p={x:0,y:0,on:false,t:-1e9};
function m(e){var r=host.getBoundingClientRect(),t=e.touches?e.touches[0]:e;p.x=t.clientX-r.left;p.y=t.clientY-r.top;p.on=true;p.t=performance.now();if(cb)cb(p)}
host.addEventListener('pointermove',m);host.addEventListener('touchmove',m,{passive:true});
host.addEventListener('pointerleave',function(){p.on=false;if(cb)cb(p)});return p}
/* 1. home: flashlight + dust that only shows inside the beam */
var st=$('.stage');
if(st){var L=layer(st),p=pointer(st),cur={x:L.W/2,y:L.H*.55},n=MOB?28:64,d=[];
for(var i=0;i<n;i++)d.push({x:Math.random()*L.W,y:Math.random()*L.H,r:.6+Math.random()*1.6,vx:(Math.random()-.5)*.012,vy:-.004-Math.random()*.012,ph:Math.random()*6});
loop(st,function(t,dt){var R=Math.min(innerWidth*.34,260),tx,ty;
if(p.on&&t-p.t<3000){tx=p.x;ty=p.y}else{tx=L.W*(.5+.32*Math.sin(t/2600));ty=L.H*(.55+.18*Math.sin(t/1900+1))}
cur.x+=(tx-cur.x)*.12;cur.y+=(ty-cur.y)*.12;
st.style.setProperty('--x',cur.x+'px');st.style.setProperty('--y',cur.y+'px');
var x=L.x;x.clearRect(0,0,L.W,L.H);
for(var i=0;i<n;i++){var q=d[i];q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.y<-5)q.y=L.H+5;if(q.x<-5)q.x=L.W+5;if(q.x>L.W+5)q.x=-5;
var dx=q.x-cur.x,dy=q.y-cur.y,l=Math.max(0,1-Math.sqrt(dx*dx+dy*dy)/R),a=.04+.8*l*l*(.65+.35*Math.sin(t/500+q.ph));
x.fillStyle='rgba(207,227,255,'+a+')';x.beginPath();x.arc(q.x,q.y,q.r*(1+l),0,6.283);x.fill()}})}
/* 2. Don't Look Back: eyes in the dark that close when your light finds them */
var dl=$('body.gp:not(.red) .top');
if(dl){var E=layer(dl),bm=document.createElement('div');bm.className='beam';dl.appendChild(bm);
var pp=pointer(dl,function(p){if(p.on){bm.style.setProperty('--px',p.x+'px');bm.style.setProperty('--py',p.y+'px')}else{bm.style.setProperty('--px','-999px')}}),eyes=[],next=800,max=MOB?2:3;
function free(){var blk=$$('.cover,.wrap>div',dl).map(function(e){var r=e.getBoundingClientRect(),h=dl.getBoundingClientRect();return{l:r.left-h.left-24,r:r.right-h.left+24,t:r.top-h.top-24,b:r.bottom-h.top+24}});
for(var k=0;k<25;k++){var x=30+Math.random()*(E.W-60),y=24+Math.random()*(E.H-48),ok=true;
for(var j=0;j<blk.length;j++)if(x>blk[j].l&&x<blk[j].r&&y>blk[j].t&&y<blk[j].b){ok=false;break}
if(ok)return{x:x,y:y}}}
loop(dl,function(t){var x=E.x;x.clearRect(0,0,E.W,E.H);
if(t>next&&eyes.length<max){var f=free();if(f){eyes.push({x:f.x,y:f.y,s:3+Math.random()*3,t0:t,dur:3500+Math.random()*3000,sc:false})}next=t+1500+Math.random()*2500}
for(var i=eyes.length-1;i>=0;i--){var e=eyes[i],age=t-e.t0,a=Math.min(1,age/700);
if(!e.sc&&pp.on){var dx=pp.x-e.x,dy=pp.y-e.y;if(dx*dx+dy*dy<12100){e.sc=true;e.t0=t-(e.dur-260);age=e.dur-260}}
if(age>e.dur-500)a=Math.max(0,(e.dur-age)/500);
if(!e.sc&&age>e.dur*.55&&age<e.dur*.55+130)a*=.05;
if(age>=e.dur){eyes.splice(i,1);continue}
for(var s=-1;s<2;s+=2){var ex=e.x+s*e.s*2.4,g=x.createRadialGradient(ex,e.y,0,ex,e.y,e.s*4);
g.addColorStop(0,'rgba(255,90,90,'+.95*a+')');g.addColorStop(.25,'rgba(255,40,50,'+.5*a+')');g.addColorStop(1,'rgba(255,40,50,0)');
x.fillStyle=g;x.beginPath();x.arc(ex,e.y,e.s*4,0,6.283);x.fill()}}})}
/* 3. UNTIL 6 AM: a shift clock that runs from 12:00 AM to 6:00 AM as you scroll */
if($('body.red')){var c=document.createElement('div'),h1=$('.top h1');c.className='clock';c.setAttribute('aria-hidden','true');
c.innerHTML='<i></i><div><small>SHIFT CLOCK</small><b>12:00 AM</b><s><u></u></s></div>';document.body.appendChild(c);
var b=$('b',c),u=$('u',c),sm=$('small',c),tk=0;
function upd(){tk=0;var m=document.documentElement.scrollHeight-innerHeight,f=m>0?Math.min(1,scrollY/m):0,mi=Math.round(f*360),hh=(12+Math.floor(mi/60))%12||12,mm=mi%60;
b.textContent=hh+':'+(mm<10?'0':'')+mm+' AM';u.style.width=f*100+'%';c.classList.toggle('show',scrollY>140);
var dn=f>.995;c.classList.toggle('done',dn);sm.textContent=dn?'YOU SURVIVED':'SHIFT CLOCK'}
addEventListener('scroll',function(){if(!tk)tk=requestAnimationFrame(upd)},{passive:true});addEventListener('resize',upd);upd()}
/* 4. glitch headline on game pages */
var gh=$('.top h1');
if(gh){gh.dataset.text=gh.textContent;gh.classList.add('glitch');
var gl=function(){gh.classList.remove('go');void gh.offsetWidth;gh.classList.add('go')};
gh.addEventListener('pointerenter',gl);setInterval(function(){if(!document.hidden&&Math.random()<.6)gl()},6500)}
/* 5. CCTV frames for screenshots */
$$('.shots img').forEach(function(im,i){var f=document.createElement('figure');f.className='scan';im.parentNode.insertBefore(f,im);f.appendChild(im);
var r=document.createElement('b');r.textContent='REC CAM 0'+(i?5:1);f.appendChild(r)});
/* 6. 3D tilt on covers and game cards (mouse only) */
if(FINE)$$('.pic,.top .cover').forEach(function(el){
el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
el.style.transform='perspective(800px) rotateX('+(-y*8)+'deg) rotateY('+(x*10)+'deg) scale(1.02)'});
el.addEventListener('pointerleave',function(){el.style.transform=''})});
})();
