import json
STYLE="STYLE: premium mobile game character animation (AFK Arena quality), glossy cartoon-realistic painted 3D look, chibi-heroic proportions like the reference, smooth shading, NOT pixel art, crisp clean edges, no text, no watermark."
GRID="Image 1536x1024, grid of 4 columns x 2 rows = 8 frames (each cell 384x512), left to right, top to bottom. Pure flat chroma-green background (#00FF00), no grid lines, no borders, no shadows on the green, no green on the character.\nRules: same character size and camera in every cell, facing RIGHT, feet on the same baseline (about 40 px above the bottom), everything fully inside its own cell (nothing cut)."
H={
'm4_3':dict(name='SOFIA LIGHTNING',
 d="young woman storm-mechanic, long flowing silver-white hair with a golden glow, golden tiara headband with a cyan gem, golden earrings, black-and-gold armored bodysuit with glowing lightning lines, short black cape with gold trim, golden armored gauntlets and boots, crackling yellow lightning aura around her",
 bg="a dark stormy sky above a steel garage rooftop, golden lightning bolts in the clouds, rain sparkles",
 atk="a LIGHTNING PUNCH: 1-2 pulls her fist back, sparks gather on the gauntlet; 3 starts the punch; 4 IMPACT: arm fully forward, a short bright yellow lightning blast bursts from her fist (inside the cell); 5 follow-through, sparks; 6-7 pulls back; 8 = idle pose",
 sk="THUNDERSTORM (she calls a storm): 1-2 clenches both fists, golden sparks gather; 3-4 raises both arms to the sky, a small ring of crackling lightning above her head; 5 PEAK: arms up, shouting, lightning shooting upward from her hands; 6 holds the pose, sparks fall around her; 7-8 lowers her arms back to idle. Only the effects close to her body (the big storm is a separate image)",
 fx="a dark storm cloud at the top of each cell with golden-yellow lightning bolts striking down to the impact point at the bottom-center. 1-2 the cloud forms; 3-4 first small sparks; 5 = IMPACT: 3 big lightning bolts hit the ground with a bright flash, sparks and small rocks; 6-8 the bolts and cloud fade away",
 win="cheers with a fist in the air, lightning sparks, thumbs-up and a wink"),
'm4_4':dict(name='ORACLE OTTO',
 d="old wise inventor-mechanic, wild silver-grey hair, white beard and moustache, golden headband with a glowing all-seeing eye emblem on the forehead, long white-and-gold coat over a dark brown vest with belts, brass backpack with a radio antenna and glowing cyan screens, golden gloves and boots, holds a glowing blue holographic tablet",
 bg="a mystic clockwork observatory with giant golden gears, star maps and floating clock dials, soft cyan and gold light",
 atk="an ENERGY RAY: 1-2 raises his gloved hand, golden rings appear in front of the palm; 3 the rings glow brighter; 4 IMPACT: a short golden energy ray shoots forward from his hand (inside the cell); 5 the ray fades with sparkles; 6-7 lowers his hand; 8 = idle pose holding the tablet",
 sk="TIME WARP (he bends time): 1-2 taps his holographic tablet; 3-4 the golden eye on his forehead glows, a golden clock-rune circle appears around him; 5 PEAK: arms spread wide, a big glowing golden eye above his head; 6 a pulse of blue time energy around his body; 7-8 back to idle with the tablet. Only the effects close to his body (the big clock is a separate image)",
 fx="a giant glowing golden-and-cyan clock face seen from the front, with an all-seeing eye in its center, an hourglass and rings of time runes, the clock hands spin. 1-2 it appears small; 3-4 grows and the hands spin fast; 5 = IMPACT: the clock flashes bright and a wave of blue time energy spreads along the ground at the bottom-center; 6-8 it fades into sparkles",
 win="raises both fists happily, the eye on his forehead shines, thumbs-up with a wink"),
'm4_5':dict(name='REX REDLINE',
 d="young muscular racer-mechanic, spiky red hair, brass racing goggles on his forehead, red-and-white checkered racing jacket with gold trim over a black t-shirt with a gold flame emblem, black pants with red-and-white stripes, gold armored boots and black fingerless gloves, brass rocket-exhaust backpack with pipes shooting small flames",
 bg="a night racetrack with a burning asphalt trail, sparks and stadium lights, red and orange glow",
 atk="a FLAME KICK: 1-2 lifts his knee; 3 starts the kick; 4 IMPACT: leg fully forward, a burst of fire from his boot (inside the cell); 5 follow-through, embers; 6-7 puts the leg down; 8 = idle pose",
 sk="INFERNO DASH (rocket-kick dash): 1-2 crouches, his rocket backpack ignites, golden fire aura around him; 3-4 leans forward ready to launch, flames under his feet; 5 PEAK: flying rocket kick forward, leg stretched, fire trail behind him; 6 lands skidding, flames; 7-8 stands up back to idle. He stays INSIDE his own cell, only the effects close to his body (the big fire trail is a separate image)",
 fx="a horizontal fire dash trail crossing the cell from left to right at ground level, with a burning ground streak, rocks and embers. 1-2 small sparks on the left; 3-4 the fire trail rushes to the right; 5 = IMPACT: a big fire explosion at the bottom-center; 6-8 burning ground and embers fade away",
 win="pumps his fist, laughs, flames from the backpack, thumbs-up"),
}
def prompts(i):
  h=H[i];C=f"Character (identical to reference): {h['d']}.\n{STYLE}"
  P=[]
  P.append(("1 SPLASH (1024x1536)",f"Create a vertical splash art 1024x1536 of the hero {h['name']} from the attached reference sheet, for the mobile game TORQUE EMPIRE. Heroic dynamic full-body pose, 3/4 view, background: {h['bg']}, a strong golden LEGENDARY aura around the hero. The top 200 px and the bottom 250 px are calmer and darker (the game puts text and buttons there). No text, no logo.\n{C}"))
  P.append(("2 IDLE (1536x1024)",f"Make an IDLE animation sheet of the hero {h['name']} from the attached reference: a looping breathing idle, clearly visible breathing, shoulders and chest move, hair and coat/cape move with a small delay, frame 8 flows back into frame 1.\n{GRID}\n{C}"))
  P.append(("3 RUN (1536x1024)",f"Make a RUN animation sheet of the hero {h['name']} from the attached reference: an 8-frame run cycle in place (running to the right), arms and legs swing, small dust puffs when a foot hits the ground, frame 8 flows back into frame 1.\n{GRID}\n{C}"))
  P.append(("4 ATTACK (1536x1024)",f"Make an ATTACK animation sheet of the hero {h['name']} from the attached reference, frames: {h['atk']}.\n{GRID}\n{C}"))
  P.append(("5 SKILL (1536x1024)",f"Make a SKILL animation sheet of the hero {h['name']} from the attached reference, skill {h['sk']}.\n{GRID}\n{C}"))
  P.append(("6 SKILL EFFECT (1536x1024)",f"Make the SKILL EFFECT animation for the hero {h['name']} of the mobile game TORQUE EMPIRE – ONLY the effect, NO character: {h['fx']}.\nImage 1536x1024, grid of 4 columns x 2 rows = 8 frames (each cell 384x512), left to right, top to bottom. Pure flat chroma-green background (#00FF00), no grid lines, no borders. The effect is centered in each cell with the impact point at the bottom-center, everything fully inside its own cell (nothing cut).\nSTYLE: premium mobile game VFX (AFK Arena quality), glossy cartoon-realistic painted look, bright glow, crisp clean edges, NOT pixel art, no text, no watermark."))
  P.append(("7 HIT + KO (1536x1024)",f"Make a HIT + KO animation sheet of the hero {h['name']} from the attached reference: TOP ROW (4 frames) = gets hit: flinches back, pained face, small impact flash, recovers; BOTTOM ROW (4 frames) = knocked out: staggers, falls to the knees, falls flat on the ground, last frame lying down with small stars spinning above the head.\n{GRID}\n{C}"))
  P.append(("8 WIN (1536x1024)",f"Make a VICTORY animation sheet of the hero {h['name']} from the attached reference: 8-frame celebration – {h['win']}, frame 8 = proud pose.\n{GRID}\n{C}"))
  return P
if __name__=='__main__':
  out={i:prompts(i) for i in H}
  json.dump(out,open('/home/claude/gen/prompts.json','w'),indent=1)
  print(len(out))
