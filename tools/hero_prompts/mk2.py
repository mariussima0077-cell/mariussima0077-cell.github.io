import json,sys
sys.path.insert(0,'.')
import mk
mk.STYLE=mk.STYLE
E={
'm3_0':dict(name='VIKTOR',d="muscular bearded engine-mechanic, short dark hair with a grey streak, purple goggles on his head, white shirt with a purple cross patch, long black-and-purple work apron with wrench emblem, purple gloves, tool belt with wrenches, black boots",
 bg="a dark engine workshop with hanging engine blocks, chains and purple toxic smoke",
 atk="a WRENCH SMASH: 1-2 raises a big wrench; 3 swings; 4 IMPACT: wrench hits forward with a purple impact flash (inside the cell); 5 follow-through; 6-7 back; 8 = idle pose",
 sk="ENGINE DROP (he lifts a whole engine block): 1-2 bends down and grabs a heavy engine block; 3-4 lifts it above his head, straining; 5 PEAK: throws it forward, purple glow; 6 empty hands, purple smoke; 7-8 back to idle. Only effects close to his body (the falling engine is a separate image)",
 fx="a heavy metal engine block falling from the top and slamming the ground at the bottom-center. 1-2 it falls; 3-4 almost hits, purple glow; 5 = IMPACT: big crash with debris, dust and a cloud of toxic purple fumes; 6-8 the engine fades and the purple fumes spread and fade",
 win="flexes his arms, laughs, wrench on the shoulder, thumbs-up"),
'm3_1':dict(name='BIG MO',d="huge burly bearded mechanic, purple cap with goggles, beige shirt with rolled sleeves, dark overalls with purple patches, big wrench and tools in his belt, black-and-purple gloves, heavy boots, metal tank backpack with a purple medical cross",
 bg="a big garage with stacked toolboxes and a glowing purple shield dome",
 atk="a GIANT PUNCH: 1-2 pulls his fist back; 3 starts the punch; 4 IMPACT: fist forward with a purple shock flash (inside the cell); 5 follow-through; 6-7 back; 8 = idle pose",
 sk="TOOLBOX FORTRESS: 1-2 pulls a big metal toolbox from his back; 3-4 lifts it with both hands; 5 PEAK: slams it on the ground, purple light bursts; 6 purple crosses float up around him; 7-8 back to idle. Only effects close to his body (the big shield dome is a separate image)",
 fx="a glowing purple-violet energy shield dome with hexagon pattern growing from the ground at the bottom-center, small healing crosses rising. 1-2 a ring of light on the ground; 3-4 the dome rises; 5 = full bright dome with a flash; 6-8 the dome shimmers and fades into sparkles",
 win="raises both huge arms, big laugh, pats his chest, thumbs-up"),
'm3_2':dict(name='GLORIA',d="young woman painter-mechanic, long blonde-and-purple wavy ponytail, purple goggles on her head, black crop top under a short white jacket, purple paint-splattered pants, paint tank backpack with a hose, purple spray gun, black boots",
 bg="a paint shop with purple paint splashes flying and shiny car bodies",
 atk="a PAINT SHOT: 1-2 raises her spray gun; 3 aims; 4 IMPACT: a short burst of glossy purple paint sprays forward (inside the cell); 5 drops of paint; 6-7 lowers the gun; 8 = idle pose",
 sk="GLOSS WAVE: 1-2 shakes the spray gun, purple drops; 3-4 aims wide, the tank glows; 5 PEAK: sweeps the spray gun sideways, a big purple paint burst near her; 6 paint drops fall; 7-8 back to idle. Only effects close to her body (the big wave is a separate image)",
 fx="a big glossy purple paint wave rolling along the ground from left to right with shiny highlights and drops. 1-2 small splash; 3-4 the wave grows; 5 = IMPACT: the wave crashes at the bottom-center with a big splash; 6-8 the paint flattens into a glossy puddle and fades",
 win="spins her spray gun, winks, blows a kiss of paint drops, proud pose"),
'm3_3':dict(name='DR. OHM',d="old crazy scientist-mechanic, wild spiky white hair, white moustache and beard, purple goggles, white lab coat over a dark vest with belts, brass Tesla-coil backpack with a glowing purple lightning jar, black gloves, black boots",
 bg="a mad electric laboratory with Tesla coils and purple lightning arcs",
 atk="a ZAP: 1-2 raises his gloved hand, purple sparks; 3 charges; 4 IMPACT: a short purple lightning bolt shoots forward from his hand (inside the cell); 5 sparks; 6-7 lowers the hand; 8 = idle pose",
 sk="TESLA COIL: 1-2 pulls a small Tesla coil device from his backpack; 3-4 holds it up, purple sparks; 5 PEAK: places it in front of him, lightning crackles around him; 6 laughs, sparks; 7-8 back to idle. Only effects close to his body (the Tesla tower is a separate image)",
 fx="a small brass Tesla coil tower standing at the bottom-center that shoots crackling purple lightning bolts left and right. 1-2 it appears and charges; 3-4 first small arcs; 5 = IMPACT: big purple lightning burst from the top sphere; 6-8 arcs get smaller and it fades away",
 win="laughs madly with both hands up, sparks around, thumbs-up"),
'm3_4':dict(name='HUGO',d="rugged sniper-mechanic, brown hair with a purple streak, short beard, glowing purple scope monocle over one eye, dark tactical vest with belts and pouches, radio backpack with a heart-monitor screen and antenna, long purple-lit sniper rifle, black boots",
 bg="a night rooftop above the garage city with a big purple crosshair moon",
 atk="a RIFLE SHOT: 1-2 raises the rifle; 3 aims; 4 IMPACT: muzzle flash and a short purple bullet trail forward (inside the cell); 5 recoil; 6-7 lowers the rifle; 8 = idle pose",
 sk="HEADSHOT: 1-2 kneels and shoulders the rifle; 3-4 the scope glows, purple aiming laser; 5 PEAK: fires, big purple muzzle flash; 6 recoil, smoke from the barrel; 7-8 stands up back to idle. Only effects close to his body (the big beam is a separate image)",
 fx="a big purple sniper crosshair target with a powerful purple energy beam hitting it at the bottom-center. 1-2 the crosshair appears and locks; 3-4 it shrinks and glows; 5 = IMPACT: a huge purple beam hits with a bright explosion; 6-8 sparks and smoke fade",
 win="spins the rifle onto his shoulder, smirks, thumbs-up, proud pose"),
'm3_5':dict(name='ARIA NEON',d="young woman street racer, magenta-purple high ponytail, purple goggles on her head, purple crop top with checkered accents, black-and-purple armored pants with neon knee pads, neon purple speaker-wheel backpack, black gloves, neon boots",
 bg="a neon night street with purple lights, light trails and a racing line",
 atk="a NEON KICK: 1-2 spins; 3 starts a spinning kick; 4 IMPACT: kick forward with a neon purple arc (inside the cell); 5 follow-through; 6-7 lands; 8 = idle pose",
 sk="NEON SPIN: 1-2 crouches, neon lights turn on; 3-4 starts spinning, purple light ring around her; 5 PEAK: full fast spin, neon trails; 6 stops, sparks; 7-8 back to idle. Only effects close to her body (the big spinning path is a separate image)",
 fx="a wide spinning neon purple-pink ring tornado moving along the ground from left to right with light trails. 1-2 small ring; 3-4 the spin grows wide; 5 = IMPACT: a bright neon burst at the bottom-center; 6-8 trails fade into sparkles",
 win="dances, flips her ponytail, peace sign, wink, proud pose"),
'm3_6':dict(name='NINA',d="young woman rocket-mechanic, pink-purple high ponytail, goggles on her head, black tank top, black cargo pants with purple straps, purple-and-white checkered nitro tank backpack, fingerless gloves, black boots",
 bg="a drag strip at night with nitro flames and purple smoke",
 atk="a NITRO PUNCH: 1-2 pulls her fist back, nitro hiss; 3 starts the punch; 4 IMPACT: fist forward with a purple nitro blast (inside the cell); 5 follow-through; 6-7 back; 8 = idle pose",
 sk="NITRO ROCKET: 1-2 opens the valve of her nitro tank, purple gas; 3-4 crouches, the tank glows; 5 PEAK: jumps forward riding a burst of purple nitro flame; 6 lands; 7-8 back to idle. She stays inside her cell, only effects close to her body (the rocket is a separate image)",
 fx="a purple-and-white checkered nitro rocket flying from left to right with a purple flame trail, exploding at the bottom-center. 1-2 rocket appears on the left; 3-4 flies fast; 5 = IMPACT: big purple explosion with smaller blasts around; 6-8 smoke and sparks fade",
 win="punches the air, laughs, pats her nitro tank, thumbs-up"),
}
for k,v in E.items():
  v['bg']=v['bg']
mk.H.update(E)
for k in E:
  P=mk.prompts(k)
  for i,(t,p) in enumerate(P):
    p=p.replace('golden LEGENDARY aura','purple EPIC aura')
    if i in(4,6,7): p=p.replace('\nImage 1536x1024','\nKeeps the backpack in EVERY frame. Image 1536x1024',1)
    open(f'{k}_{i}.txt','w').write(p.replace('\n',' '))
print('ok')
