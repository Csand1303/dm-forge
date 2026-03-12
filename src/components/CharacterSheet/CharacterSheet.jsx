import { useState, useMemo } from "react";

// ─── SPELL DATA (2024 PHB) ────────────────────────────────────────────────────
// Full descriptions + upcast info per spell
const SPELL_DETAILS = {
  // ── CANTRIPS ──
  "Acid Splash":{lvl:0,school:"Conjuration",cast:"1 Action",range:"60 ft",duration:"Instantaneous",desc:"You hurl a bubble of acid. Choose one or two creatures you can see within range. If you choose two, they must be within 5 feet of each other. A target must succeed on a Dexterity saving throw or take 1d6 acid damage.",upcast:"The spell's damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6)."},
  "Blade Ward":{lvl:0,school:"Abjuration",cast:"1 Action",range:"Self",duration:"1 round",desc:"You extend your hand and trace a sigil of warding in the air. Until the end of your next turn, you have resistance against bludgeoning, piercing, and slashing damage dealt by weapon attacks.",upcast:""},
  "Booming Blade":{lvl:0,school:"Evocation",cast:"1 Action",range:"Self (5-ft radius)",duration:"1 round",desc:"You brandish the weapon used in the spell's casting and make a melee attack with it against one creature within 5 feet of you. On a hit, the target suffers the weapon attack's normal effects and then becomes sheathed in booming energy. If the target willingly moves 1 foot or more before then, the target takes 1d8 thunder damage.",upcast:"The damage increases when you reach 5th level (weapon 1d8+1d8), 11th level (weapon 2d8+2d8), 17th level (weapon 3d8+3d8)."},
  "Chill Touch":{lvl:0,school:"Necromancy",cast:"1 Action",range:"Touch",duration:"1 round",desc:"You create a ghostly, skeletal hand in the space of a creature within range. Make a melee spell attack against the creature. On a hit, the target takes 1d10 necrotic damage, and it can't regain hit points until the start of your next turn.",upcast:"The damage increases by 1d10 at 5th level (2d10), 11th level (3d10), and 17th level (4d10)."},
  "Dancing Lights":{lvl:0,school:"Evocation",cast:"1 Action",range:"120 ft",duration:"Concentration, up to 1 minute",desc:"You create up to four torch-sized lights within range, making them appear as torches, lanterns, or glowing orbs that hover in the air for the duration. You can also combine the four lights into one glowing vaguely humanoid form of Medium size.",upcast:""},
  "Eldritch Blast":{lvl:0,school:"Evocation",cast:"1 Action",range:"120 ft",duration:"Instantaneous",desc:"A beam of crackling energy streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 force damage. The spell creates more than one beam when you reach higher levels: two beams at 5th level, three beams at 11th level, four beams at 17th level.",upcast:"Additional beams at 5th (2), 11th (3), and 17th (4) level. You can direct the beams at the same target or at different ones."},
  "Fire Bolt":{lvl:0,school:"Evocation",cast:"1 Action",range:"120 ft",duration:"Instantaneous",desc:"You hurl a mote of fire at a creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 fire damage. A flammable object hit by this spell ignites if it isn't being worn or carried.",upcast:"Damage increases to 2d10 at 5th level, 3d10 at 11th level, 4d10 at 17th level."},
  "Friends":{lvl:0,school:"Enchantment",cast:"1 Action",range:"Self",duration:"Concentration, up to 1 minute",desc:"You magically emanate a sense of friendship toward one creature you can see within range. The target must succeed on a Wisdom saving throw or be charmed by you for the duration. When the spell ends, the creature knows it was charmed and may become hostile.",upcast:""},
  "Guidance":{lvl:0,school:"Divination",cast:"1 Action",range:"Touch",duration:"Concentration, up to 1 minute",desc:"You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one ability check of its choice. It can roll the die before or after making the ability check. The spell then ends.",upcast:""},
  "Light":{lvl:0,school:"Evocation",cast:"1 Action",range:"Touch",duration:"1 hour",desc:"You touch one object that is no larger than 10 feet in any dimension. Until the spell ends, the object sheds bright light in a 20-foot radius and dim light for an additional 20 feet. The light can be colored as you like. Completely covering the object with something opaque blocks the light.",upcast:""},
  "Mage Hand":{lvl:0,school:"Conjuration",cast:"1 Action",range:"30 ft",duration:"1 minute",desc:"A spectral, floating hand appears at a point you choose within range. The hand lasts for the duration or until you dismiss it as an action. The hand vanishes if it is ever more than 30 feet from you or if you cast this spell again. You can use the hand to manipulate an object, open an unlocked door or container, stow or retrieve an item from an open container, or pour the contents out of a vial.",upcast:""},
  "Mending":{lvl:0,school:"Transmutation",cast:"1 Minute",range:"Touch",duration:"Instantaneous",desc:"This spell repairs a single break or tear in an object you touch, such as a broken chain link, two halves of a broken key, a torn cloak, or a leaking wineskin. As long as the break or tear is no larger than 1 foot in any dimension, you mend it, leaving no trace of the former damage.",upcast:""},
  "Message":{lvl:0,school:"Transmutation",cast:"1 Action",range:"120 ft",duration:"1 round",desc:"You point your finger toward a creature within range and whisper a message. The target (and only the target) hears the message and can reply in a whisper that only you can hear.",upcast:""},
  "Minor Illusion":{lvl:0,school:"Illusion",cast:"1 Action",range:"30 ft",duration:"1 minute",desc:"You create a sound or an image of an object within range that lasts for the duration. The illusion also ends if you dismiss it as an action or cast this spell again. If you create a sound, its volume can range from a whisper to a scream.",upcast:""},
  "Poison Spray":{lvl:0,school:"Conjuration",cast:"1 Action",range:"30 ft",duration:"Instantaneous",desc:"You extend your hand toward a creature you can see within range and project a puff of noxious gas. The creature must succeed on a Constitution saving throw or take 1d12 poison damage.",upcast:"Damage increases to 2d12 at 5th level, 3d12 at 11th level, 4d12 at 17th level."},
  "Prestidigitation":{lvl:0,school:"Transmutation",cast:"1 Action",range:"10 ft",duration:"Up to 1 hour",desc:"This spell is a minor magical trick that novice spellcasters use for practice. You create one of the following magical effects: a harmless sensory effect, light or snuff a flame, chill/warm/flavor nonliving material, make a small mark or symbol appear, create a nonmagical trinket, or clean/soil an object.",upcast:""},
  "Ray of Frost":{lvl:0,school:"Evocation",cast:"1 Action",range:"60 ft",duration:"Instantaneous",desc:"A frigid beam of blue-white light streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, it takes 1d8 cold damage, and its speed is reduced by 10 feet until the start of your next turn.",upcast:"Damage increases to 2d8 at 5th level, 3d8 at 11th level, 4d8 at 17th level."},
  "Sacred Flame":{lvl:0,school:"Evocation",cast:"1 Action",range:"60 ft",duration:"Instantaneous",desc:"Flame-like radiance descends on a creature that you can see within range. The target must succeed on a Dexterity saving throw or take 1d8 radiant damage. The target gains no benefit from cover for this saving throw.",upcast:"Damage increases to 2d8 at 5th level, 3d8 at 11th level, 4d8 at 17th level."},
  "Shillelagh":{lvl:0,school:"Transmutation",cast:"Bonus Action",range:"Touch",duration:"1 minute",desc:"The wood of a club or quarterstaff you are holding is imbued with nature's power. For the duration, you can use your spellcasting ability instead of Strength for the attack and damage rolls of melee attacks using that weapon, and the weapon's damage die becomes a d8. The weapon also becomes magical.",upcast:""},
  "Shocking Grasp":{lvl:0,school:"Evocation",cast:"1 Action",range:"Touch",duration:"Instantaneous",desc:"Lightning springs from your hand to deliver a shock to a creature you try to touch. Make a melee spell attack against the target. You have advantage on the attack roll if the target is wearing armor made of metal. On a hit, the target takes 1d8 lightning damage, and it can't take reactions until the start of its next turn.",upcast:"Damage increases to 2d8 at 5th level, 3d8 at 11th level, 4d8 at 17th level."},
  "Spare the Dying":{lvl:0,school:"Necromancy",cast:"1 Action",range:"Touch",duration:"Instantaneous",desc:"You touch a living creature that has 0 hit points. The creature becomes stable. This spell has no effect on undead or constructs.",upcast:""},
  "Thaumaturgy":{lvl:0,school:"Transmutation",cast:"1 Action",range:"30 ft",duration:"Up to 1 minute",desc:"You manifest a minor wonder, a sign of supernatural power, within range. You create one of the following magical effects: your voice booms, flames flicker, harmless tremors shake, an unlocked door flies open or slams shut, your eyes glow, or you alter your appearance.",upcast:""},
  "Toll the Dead":{lvl:0,school:"Necromancy",cast:"1 Action",range:"60 ft",duration:"Instantaneous",desc:"You point at one creature you can see within range, and the sound of a dolorous bell fills the air around it for a moment. The target must succeed on a Wisdom saving throw or take 1d8 necrotic damage. If the target is missing any of its hit points, it instead takes 1d12 necrotic damage.",upcast:"Damage increases to 2d8/2d12 at 5th level, 3d8/3d12 at 11th, 4d8/4d12 at 17th."},
  "True Strike":{lvl:0,school:"Divination",cast:"1 Action",range:"Self",duration:"Instantaneous",desc:"You extend your hand and point a finger at a target in range. Your magic grants you a brief insight into the target's defenses. Make a melee or ranged spell attack against the target using your spellcasting ability. On a hit, the target takes 1d6 force damage plus 1d6 of a damage type chosen when you gain this spell.",upcast:"Damage increases at 5th (2d6+2d6), 11th (3d6+3d6), 17th (4d6+4d6)."},
  "Vicious Mockery":{lvl:0,school:"Enchantment",cast:"1 Action",range:"60 ft",duration:"Instantaneous",desc:"You unleash a string of insults laced with subtle enchantments at a creature you can see within range. If the target can hear you (it need not understand you), it must succeed on a Wisdom saving throw or take 1d4 psychic damage and have disadvantage on the next attack roll it makes before the end of its next turn.",upcast:"Damage increases to 2d4 at 5th level, 3d4 at 11th level, 4d4 at 17th level."},
  "Word of Radiance":{lvl:0,school:"Evocation",cast:"1 Action",range:"5 ft",duration:"Instantaneous",desc:"You utter a divine word, and burning radiance erupts from you. Each creature of your choice that you can see within range must succeed on a Constitution saving throw or take 1d6 radiant damage.",upcast:"Damage increases to 2d6 at 5th level, 3d6 at 11th level, 4d6 at 17th level."},
  "Druidcraft":{lvl:0,school:"Transmutation",cast:"1 Action",range:"30 ft",duration:"Instantaneous",desc:"Whispering to the spirits of nature, you create one of the following effects within range: a tiny, harmless sensory effect that predicts weather for 24 hours, cause a flower to bloom or seed to sprout, create a tiny burst of harmless nature sounds, light or snuff a fire.",upcast:""},
  "Elementalism":{lvl:0,school:"Transmutation",cast:"1 Action",range:"30 ft",duration:"Instantaneous",desc:"You exert control over the elements, creating one of the following effects within range: a breeze stirs the air, create a small flame, create a harmless tremor in the ground, ripple or move water in a small area, or chill/warm nearby air.",upcast:""},
  "Produce Flame":{lvl:0,school:"Conjuration",cast:"Bonus Action",range:"Self",duration:"10 minutes",desc:"A flickering flame appears in your hand. The flame remains there for the duration and harms neither you nor your equipment. The flame sheds bright light in a 20-foot radius and dim light for an additional 20 feet. The spell ends if you cast it again. You can also attack with the flame, hurling it as a ranged spell attack (30 ft range), dealing 1d8 fire damage on a hit.",upcast:"Damage increases to 2d8 at 5th level, 3d8 at 11th level, 4d8 at 17th level."},
  "Shape Water":{lvl:0,school:"Transmutation",cast:"1 Action",range:"30 ft",duration:"Instantaneous or 1 hour",desc:"You choose an area of water that fits within a 5-foot cube within range. You manipulate it in one of the following ways: move or redirect it, cause it to form simple shapes, change its color or opacity, or freeze it.",upcast:""},
  "Starry Wisp":{lvl:0,school:"Evocation",cast:"1 Action",range:"60 ft",duration:"Instantaneous",desc:"You launch a mote of light at one creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d8 radiant damage, and until the end of your next turn, it emits dim light in a 10-foot radius and can't benefit from the invisible condition.",upcast:"Damage increases to 2d8 at 5th level, 3d8 at 11th level, 4d8 at 17th level."},
  "Thunderclap":{lvl:0,school:"Evocation",cast:"1 Action",range:"5 ft (self)",duration:"Instantaneous",desc:"You create a burst of thunderous sound that can be heard up to 100 feet away. Each creature within range, other than you, must succeed on a Constitution saving throw or take 1d6 thunder damage.",upcast:"Damage increases to 2d6 at 5th level, 3d6 at 11th level, 4d6 at 17th level."},
  // ── LEVEL 1 ──
  "Alarm":{lvl:1,school:"Abjuration",cast:"1 Minute (Ritual)",range:"30 ft",duration:"8 hours",desc:"You set an alarm against unwanted intrusion. Choose a door, a window, or an area within range that is no larger than a 20-foot cube. Until the spell ends, an alarm alerts you whenever a Tiny or larger creature touches or enters the warded area.",upcast:""},
  "Animal Friendship":{lvl:1,school:"Enchantment",cast:"1 Action",range:"30 ft",duration:"24 hours",desc:"This spell lets you convince a beast that you mean it no harm. Choose a beast that you can see within range. It must see and hear you. If the beast's Intelligence is 4 or higher, the spell fails. Otherwise, the beast must succeed on a Wisdom saving throw or be charmed by you for the spell's duration.",upcast:"When cast at 2nd level or higher, you can affect one additional beast for each slot level above 1st."},
  "Armor of Agathys":{lvl:1,school:"Abjuration",cast:"1 Action",range:"Self",duration:"1 hour",desc:"A protective magical force surrounds you, manifesting as a spectral frost that covers you and your gear. You gain 5 temporary hit points for the duration. If a creature hits you with a melee attack while you have these temporary hit points, the creature takes 5 cold damage.",upcast:"Both the temporary hit points and cold damage increase by 5 for each slot level above 1st."},
  "Arms of Hadar":{lvl:1,school:"Conjuration",cast:"1 Action",range:"Self (10-ft radius)",duration:"Instantaneous",desc:"You invoke the power of Hadar, the Dark Hunger. Tendrils of dark energy erupt from you and batter all creatures within 10 feet of you. Each creature in that area must make a Strength saving throw. On a failed save, a target takes 2d6 necrotic damage and can't take reactions until its next turn. On a successful save, the creature takes half damage but suffers no other effect.",upcast:"Damage increases by 1d6 for each slot level above 1st."},
  "Bane":{lvl:1,school:"Enchantment",cast:"1 Action",range:"30 ft",duration:"Concentration, up to 1 minute",desc:"Up to three creatures of your choice that you can see within range must make Charisma saving throws. Whenever a target that fails this saving throw makes an attack roll or a saving throw before the spell ends, the target must roll a d4 and subtract the number rolled from the attack roll or saving throw.",upcast:"You can target one additional creature for each slot level above 1st."},
  "Bless":{lvl:1,school:"Enchantment",cast:"1 Action",range:"30 ft",duration:"Concentration, up to 1 minute",desc:"You bless up to three creatures of your choice within range. Whenever a blessed target makes an attack roll or a saving throw before the spell ends, the target can roll a d4 and add the number rolled to the attack roll or saving throw.",upcast:"You can target one additional creature for each slot level above 1st."},
  "Burning Hands":{lvl:1,school:"Evocation",cast:"1 Action",range:"Self (15-ft cone)",duration:"Instantaneous",desc:"As you hold your hands with thumbs touching and fingers spread, a thin sheet of flames shoots forth from your outstretched fingertips. Each creature in a 15-foot cone must make a Dexterity saving throw. A creature takes 3d6 fire damage on a failed save, or half as much damage on a successful one.",upcast:"Damage increases by 1d6 for each slot level above 1st."},
  "Charm Person":{lvl:1,school:"Enchantment",cast:"1 Action",range:"30 ft",duration:"1 hour",desc:"You attempt to charm a humanoid you can see within range. It must make a Wisdom saving throw, and does so with advantage if you or your companions are fighting it. If it fails the saving throw, it is charmed by you until the spell ends or until you or your companions do anything harmful to it.",upcast:"You can target one additional creature for each slot level above 1st. The creatures must be within 30 feet of each other when you target them."},
  "Chromatic Orb":{lvl:1,school:"Evocation",cast:"1 Action",range:"90 ft",duration:"Instantaneous",desc:"You hurl a 4-inch-diameter sphere of energy at a creature that you can see within range. You choose acid, cold, fire, lightning, poison, or thunder for the type of orb you create, and then make a ranged spell attack against the target. If the attack hits, the creature takes 3d8 damage of the type you chose.",upcast:"Damage increases by 1d8 for each slot level above 1st."},
  "Command":{lvl:1,school:"Enchantment",cast:"1 Action",range:"60 ft",duration:"1 round",desc:"You speak a one-word command to a creature you can see within range. The target must succeed on a Wisdom saving throw or follow the command on its next turn. The spell has no effect if the target is undead, if it doesn't understand your language, or if the command is directly harmful to it. Some typical commands: Approach, Drop, Flee, Grovel, Halt.",upcast:"You can affect one additional creature for each slot level above 1st."},
  "Compelled Duel":{lvl:1,school:"Enchantment",cast:"Bonus Action",range:"30 ft",duration:"Concentration, up to 1 minute",desc:"You attempt to compel a creature into a duel. One creature that you can see within range must make a Wisdom saving throw. On a failed save, the creature is drawn to you, compelled by your divine demand. For the duration, it has disadvantage on attack rolls against creatures other than you, and must make a Wisdom saving throw each time it attempts to move to a space that is more than 30 feet away from you.",upcast:""},
  "Comprehend Languages":{lvl:1,school:"Divination",cast:"1 Action (Ritual)",range:"Self",duration:"1 hour",desc:"For the duration, you understand the literal meaning of any spoken language that you hear. You also understand any written language that you see, but you must be touching the surface on which the words are written. It takes about 1 minute to read one page of text.",upcast:""},
  "Create or Destroy Water":{lvl:1,school:"Transmutation",cast:"1 Action",range:"30 ft",duration:"Instantaneous",desc:"You either create or destroy water. Create Water: You create up to 10 gallons of clean water within range in an open container. Alternatively, the water falls as rain in a 30-foot cube within range. Destroy Water: You destroy up to 10 gallons of water in an open container within range.",upcast:"You create or destroy 10 additional gallons for each slot level above 1st, or the cube of rain or ice increases by 5 feet for each slot above 1st."},
  "Cure Wounds":{lvl:1,school:"Evocation",cast:"1 Action",range:"Touch",duration:"Instantaneous",desc:"A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs.",upcast:"The healing increases by 1d8 for each slot level above 1st."},
  "Detect Evil and Good":{lvl:1,school:"Divination",cast:"1 Action",range:"Self",duration:"Concentration, up to 10 minutes",desc:"For the duration, you know if there is an aberration, celestial, elemental, fey, fiend, or undead within 30 feet of you, as well as where the creature is located. Similarly, you know if there is a place or object within 30 feet of you that has been magically consecrated or desecrated.",upcast:""},
  "Detect Magic":{lvl:1,school:"Divination",cast:"1 Action (Ritual)",range:"Self",duration:"Concentration, up to 10 minutes",desc:"For the duration, you sense the presence of magic within 30 feet of you. If you sense magic in this way, you can use your action to see a faint aura around any visible creature or object in the area that bears magic, and you learn its school of magic, if any.",upcast:""},
  "Detect Poison and Disease":{lvl:1,school:"Divination",cast:"1 Action (Ritual)",range:"Self",duration:"Concentration, up to 10 minutes",desc:"For the duration, you can sense the presence and location of poisons, poisonous creatures, and diseases within 30 feet of you. You also identify the kind of poison, poisonous creature, or disease in each case.",upcast:""},
  "Disguise Self":{lvl:1,school:"Illusion",cast:"1 Action",range:"Self",duration:"1 hour",desc:"You make yourself — including your clothing, armor, weapons, and other belongings on your person — look different until the spell ends or until you use your action to dismiss it. You can seem 1 foot shorter or taller and can appear thin, fat, or in between. You can't change your body type, so you must adopt a form that has the same basic arrangement of limbs.",upcast:""},
  "Dissonant Whispers":{lvl:1,school:"Enchantment",cast:"1 Action",range:"60 ft",duration:"Instantaneous",desc:"You whisper a discordant melody that only one creature of your choice within range can hear, wracking it with terrible pain. The target must make a Wisdom saving throw. On a failed save, it takes 3d6 psychic damage and must immediately use its reaction, if available, to move as far as its speed allows away from you.",upcast:"Damage increases by 1d6 for each slot level above 1st."},
  "Divine Favor":{lvl:1,school:"Evocation",cast:"Bonus Action",range:"Self",duration:"Concentration, up to 1 minute",desc:"Your prayer empowers you with divine radiance. Until the spell ends, your weapon attacks deal an extra 1d4 radiant damage on a hit.",upcast:""},
  "Divine Smite":{lvl:1,school:"Evocation",cast:"Bonus Action",range:"Self",duration:"Instantaneous",desc:"The first time you hit with a melee weapon attack during this spell's casting, your weapon flares with white light, and the attack deals an extra 2d8 radiant damage to the target. The damage increases by 1d8 if the target is an undead or a fiend, to a maximum of 6d8.",upcast:"The extra damage increases by 1d8 for each slot level above 1st."},
  "Ensnaring Strike":{lvl:1,school:"Conjuration",cast:"Bonus Action",range:"Self",duration:"Concentration, up to 1 minute",desc:"The next time you hit a creature with a weapon attack before this spell ends, a writhing mass of thorny vines appears at the point of impact, and the target must succeed on a Strength saving throw or be restrained by the magical vines until the spell ends.",upcast:"Damage increases by 1d6 for each slot level above 1st."},
  "Entangle":{lvl:1,school:"Conjuration",cast:"1 Action",range:"90 ft",duration:"Concentration, up to 1 minute",desc:"Grasping weeds and vines sprout from the ground in a 20-foot square starting from a point within range. For the duration, these plants turn the ground in the area into difficult terrain. A creature in the area when you cast the spell must succeed on a Strength saving throw or be restrained by the entangling plants until the spell ends.",upcast:""},
  "Expeditious Retreat":{lvl:1,school:"Transmutation",cast:"Bonus Action",range:"Self",duration:"Concentration, up to 10 minutes",desc:"This spell allows you to move at an incredible pace. When you cast this spell, and then as a bonus action on each of your turns until the spell ends, you can take the Dash action.",upcast:""},
  "Faerie Fire":{lvl:1,school:"Evocation",cast:"1 Action",range:"60 ft",duration:"Concentration, up to 1 minute",desc:"Each object in a 20-foot cube within range is outlined in blue, green, or violet light (your choice). Any creature in the area when the spell is cast is also outlined in light if it fails a Dexterity saving throw. For the duration, objects and affected creatures shed dim light in a 10-foot radius. Attack rolls against an affected creature or object have advantage.",upcast:""},
  "False Life":{lvl:1,school:"Necromancy",cast:"1 Action",range:"Self",duration:"1 hour",desc:"Bolstering yourself with a necromantic facsimile of life, you gain 1d4 + 4 temporary hit points for the duration.",upcast:"You gain 5 additional temporary hit points for each slot level above 1st."},
  "Feather Fall":{lvl:1,school:"Transmutation",cast:"1 Reaction",range:"60 ft",duration:"1 minute",desc:"Choose up to five falling creatures within range. A falling creature's rate of descent slows to 60 feet per round until the spell ends. If the creature lands before the spell ends, it takes no falling damage and can land on its feet, and the spell ends for that creature.",upcast:""},
  "Find Familiar":{lvl:1,school:"Conjuration",cast:"1 Hour (Ritual)",range:"10 ft",duration:"Instantaneous",desc:"You gain the service of a familiar, a spirit that takes an animal form you choose: bat, cat, crab, frog (toad), hawk, lizard, octopus, owl, poisonous snake, fish (quipper), rat, raven, sea horse, spider, or weasel. Appearing in an unoccupied space within range, the familiar has the statistics of the chosen form.",upcast:""},
  "Fog Cloud":{lvl:1,school:"Conjuration",cast:"1 Action",range:"120 ft",duration:"Concentration, up to 1 hour",desc:"You create a 20-foot-radius sphere of fog centered on a point within range. The sphere spreads around corners, and its area is heavily obscured. It lasts for the duration or until a wind of moderate or greater speed (at least 10 miles per hour) disperses it.",upcast:"The radius of the fog cloud increases by 20 feet for each slot level above 1st."},
  "Goodberry":{lvl:1,school:"Transmutation",cast:"1 Action",range:"Touch",duration:"Instantaneous",desc:"Up to ten berries appear in your hand and are infused with magic for the duration. A creature can use its action to eat one berry. Eating a berry restores 1 hit point, and the berry provides enough nourishment to sustain a creature for one day.",upcast:""},
  "Grease":{lvl:1,school:"Conjuration",cast:"1 Action",range:"60 ft",duration:"1 minute",desc:"Slick grease covers the ground in a 10-foot square centered on a point within range and turns it into difficult terrain for the duration. When the grease appears, each creature standing in its area must succeed on a Dexterity saving throw or fall prone. A creature that enters the area or ends its turn there must also succeed on a Dexterity saving throw or fall prone.",upcast:""},
  "Guiding Bolt":{lvl:1,school:"Evocation",cast:"1 Action",range:"120 ft",duration:"1 round",desc:"A flash of light streaks toward a creature of your choice within range. Make a ranged spell attack against the target. On a hit, the target takes 4d6 radiant damage, and the next attack roll made against this target before the end of your next turn has advantage, thanks to the mystical dim light glittering on the target until then.",upcast:"Damage increases by 1d6 for each slot level above 1st."},
  "Hail of Thorns":{lvl:1,school:"Conjuration",cast:"Bonus Action",range:"Self",duration:"Concentration, up to 1 minute",desc:"The next time you hit a creature with a ranged weapon attack before the spell ends, this spell creates a rain of thorns that sprouts from your ranged weapon or ammunition. In addition to the normal effect of the attack, the target of the attack and each creature within 5 feet of it must make a Dexterity saving throw. A creature takes 1d10 piercing damage on a failed save, or half as much damage on a successful one.",upcast:"Damage increases by 1d10 for each slot level above 1st."},
  "Healing Word":{lvl:1,school:"Evocation",cast:"Bonus Action",range:"60 ft",duration:"Instantaneous",desc:"A creature of your choice that you can see within range regains hit points equal to 1d4 + your spellcasting ability modifier. This spell has no effect on undead or constructs.",upcast:"The healing increases by 1d4 for each slot level above 1st."},
  "Hellish Rebuke":{lvl:1,school:"Evocation",cast:"1 Reaction",range:"60 ft",duration:"Instantaneous",desc:"You point your finger, and the creature that damaged you is momentarily surrounded by hellish flames. The creature must make a Dexterity saving throw. It takes 2d10 fire damage on a failed save, or half as much damage on a successful one.",upcast:"Damage increases by 1d10 for each slot level above 1st."},
  "Heroism":{lvl:1,school:"Enchantment",cast:"1 Action",range:"Touch",duration:"Concentration, up to 1 minute",desc:"A willing creature you touch is imbued with bravery. Until the spell ends, the creature is immune to being frightened and gains temporary hit points equal to your spellcasting ability modifier at the start of each of its turns. When the spell ends, the target loses any remaining temporary hit points from this spell.",upcast:"You can target one additional creature for each slot level above 1st."},
  "Hex":{lvl:1,school:"Enchantment",cast:"Bonus Action",range:"90 ft",duration:"Concentration, up to 1 hour",desc:"You place a curse on a creature that you can see within range. Until the spell ends, you deal an extra 1d6 necrotic damage to the target whenever you hit it with an attack. Also, choose one ability when you cast the spell. The target has disadvantage on ability checks made with the chosen ability.",upcast:"Duration increases: 8 hours at 3rd-4th level, 24 hours at 5th-6th level, until dispelled at 7th+."},
  "Hunter's Mark":{lvl:1,school:"Divination",cast:"Bonus Action",range:"90 ft",duration:"Concentration, up to 1 hour",desc:"You choose a creature you can see within range and mystically mark it as your quarry. Until the spell ends, you deal an extra 1d6 damage to the target whenever you hit it with a weapon attack, and you have advantage on any Wisdom (Perception) or Wisdom (Survival) check you make to find it.",upcast:"Duration increases: 8 hours at 3rd-4th level, 24 hours at 5th-6th level."},
  "Ice Knife":{lvl:1,school:"Conjuration",cast:"1 Action",range:"60 ft",duration:"Instantaneous",desc:"You create a shard of ice and fling it at one creature within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 piercing damage. Hit or miss, the shard then explodes. The target and each creature within 5 feet of the point where the ice exploded must succeed on a Dexterity saving throw or take 2d6 cold damage.",upcast:"The cold damage increases by 1d6 for each slot level above 1st."},
  "Identify":{lvl:1,school:"Divination",cast:"1 Minute (Ritual)",range:"Touch",duration:"Instantaneous",desc:"You choose one object that you must touch throughout the casting of the spell. If it is a magic item or some other magic-imbued object, you learn its properties and how to use them, whether it requires attunement, and how many charges it has. You learn whether any spells are affecting the item.",upcast:""},
  "Illusory Script":{lvl:1,school:"Illusion",cast:"1 Minute (Ritual)",range:"Touch",duration:"10 days",desc:"You write on parchment, paper, or some other suitable writing material and imbue it with a potent illusion that lasts for the duration. To you and any creatures you designate when you cast the spell, the writing appears normal, written in your hand, and conveys whatever meaning you intended when you wrote the text.",upcast:""},
  "Inflict Wounds":{lvl:1,school:"Necromancy",cast:"1 Action",range:"Touch",duration:"Instantaneous",desc:"Make a melee spell attack against a creature you can reach. On a hit, the target takes 2d10 necrotic damage.",upcast:"Damage increases by 1d10 for each slot level above 1st."},
  "Jump":{lvl:1,school:"Transmutation",cast:"1 Action",range:"Touch",duration:"1 minute",desc:"You touch a creature. The creature's jump distance is tripled until the spell ends.",upcast:"You can target one additional creature for each slot level above 1st."},
  "Longstrider":{lvl:1,school:"Transmutation",cast:"1 Action",range:"Touch",duration:"1 hour",desc:"You touch a creature. The target's speed increases by 10 feet until the spell ends.",upcast:"You can target one additional creature for each slot level above 1st."},
  "Mage Armor":{lvl:1,school:"Abjuration",cast:"1 Action",range:"Touch",duration:"8 hours",desc:"You touch a willing creature who isn't wearing armor, and a protective magical force surrounds it until the spell ends. The target's base AC becomes 13 + its Dexterity modifier. The spell ends if the target dons armor or if you dismiss the spell as an action.",upcast:""},
  "Magic Missile":{lvl:1,school:"Evocation",cast:"1 Action",range:"120 ft",duration:"Instantaneous",desc:"You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range. A dart deals 1d4 + 1 force damage to its target. The darts all strike simultaneously, and you can direct them to hit one creature or several.",upcast:"The spell creates one more dart for each slot level above 1st."},
  "Protection from Evil and Good":{lvl:1,school:"Abjuration",cast:"1 Action",range:"Touch",duration:"Concentration, up to 10 minutes",desc:"Until the spell ends, one willing creature you touch is protected against certain types of creatures: aberrations, celestials, elementals, fey, fiends, and undead. The protection grants several benefits against attacks from those creatures: disadvantage on attacks, no charm/frighten/possession.",upcast:""},
  "Purify Food and Drink":{lvl:1,school:"Transmutation",cast:"1 Action (Ritual)",range:"10 ft",duration:"Instantaneous",desc:"All nonmagical food and drink within a 5-foot-radius sphere centered on a point of your choice within range is purified and rendered free of poison and disease.",upcast:""},
  "Ray of Sickness":{lvl:1,school:"Necromancy",cast:"1 Action",range:"60 ft",duration:"Instantaneous",desc:"A ray of sickening greenish energy lashes out toward a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 2d8 poison damage and must make a Constitution saving throw. On a failed save, it is also poisoned until the end of your next turn.",upcast:"Damage increases by 1d8 for each slot level above 1st."},
  "Sanctuary":{lvl:1,school:"Abjuration",cast:"Bonus Action",range:"30 ft",duration:"1 minute",desc:"You ward a creature within range against attack. Until the spell ends, any creature who targets the warded creature with an attack or a harmful spell must first make a Wisdom saving throw. On a failed save, the creature must choose a new target or lose the attack or spell. The spell doesn't protect the warded creature from area effects.",upcast:""},
  "Searing Smite":{lvl:1,school:"Evocation",cast:"Bonus Action",range:"Self",duration:"Concentration, up to 1 minute",desc:"The next time you hit a creature with a melee weapon attack during the spell's duration, your weapon flares with white-hot intensity, and the attack deals an extra 1d6 fire damage to the target and causes the target to ignite in flames. At the start of each of its turns until the spell ends, the target must make a Constitution saving throw. On a failed save, it takes 1d6 fire damage.",upcast:"Initial extra damage increases by 1d6 for each slot level above 1st."},
  "Shield":{lvl:1,school:"Abjuration",cast:"1 Reaction",range:"Self",duration:"1 round",desc:"An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile.",upcast:""},
  "Shield of Faith":{lvl:1,school:"Abjuration",cast:"Bonus Action",range:"60 ft",duration:"Concentration, up to 10 minutes",desc:"A shimmering field appears and surrounds a creature of your choice within range, granting it a +2 bonus to AC for the duration.",upcast:""},
  "Silent Image":{lvl:1,school:"Illusion",cast:"1 Action",range:"60 ft",duration:"Concentration, up to 10 minutes",desc:"You create the image of an object, a creature, or some other visible phenomenon that is no larger than a 15-foot cube. The image appears at a spot within range and lasts for the duration. The image is purely visual; it isn't accompanied by sound, smell, or other sensory effects.",upcast:""},
  "Sleep":{lvl:1,school:"Enchantment",cast:"1 Action",range:"90 ft",duration:"1 minute",desc:"This spell sends creatures into a magical slumber. Roll 5d8; the total is how many hit points of creatures this spell can affect. Creatures within 20 feet of a point you choose within range are affected in ascending order of their current hit points (starting with the creature with the lowest current hit points).",upcast:"Roll an additional 2d8 for each slot level above 1st."},
  "Speak with Animals":{lvl:1,school:"Divination",cast:"1 Action (Ritual)",range:"Self",duration:"10 minutes",desc:"You gain the ability to comprehend and verbally communicate with beasts for the duration. The knowledge and awareness of many beasts is limited by their intelligence, but at minimum, beasts can give you information about nearby locations and monsters, including whatever they can perceive or have perceived within the past day.",upcast:""},
  "Thunderous Smite":{lvl:1,school:"Evocation",cast:"Bonus Action",range:"Self",duration:"Concentration, up to 1 minute",desc:"The first time you hit with a melee weapon attack during this spell's duration, your weapon rings with thunder that is audible within 300 feet of you, and the attack deals an extra 2d6 thunder damage to the target. Additionally, if the target is a creature, it must succeed on a Strength saving throw or be pushed 10 feet away from you and knocked prone.",upcast:""},
  "Thunderwave":{lvl:1,school:"Evocation",cast:"1 Action",range:"Self (15-ft cube)",duration:"Instantaneous",desc:"A wave of thunderous force sweeps out from you. Each creature in a 15-foot cube originating from you must make a Constitution saving throw. On a failed save, a creature takes 2d8 thunder damage and is pushed 10 feet away from you. On a successful save, the creature takes half as much damage and isn't pushed.",upcast:"Damage increases by 1d8 for each slot level above 1st."},
  "Unseen Servant":{lvl:1,school:"Conjuration",cast:"1 Action (Ritual)",range:"60 ft",duration:"1 hour",desc:"This spell creates an invisible, mindless, shapeless, Medium force that performs simple tasks at your command until the spell ends. The servant springs into existence in an unoccupied space on the ground within range. It has AC 10, 1 hit point, and a Strength of 2, and it can't attack.",upcast:""},
  "Witch Bolt":{lvl:1,school:"Evocation",cast:"1 Action",range:"30 ft",duration:"Concentration, up to 1 minute",desc:"A beam of crackling, blue energy lances out toward a creature within range, forming a sustained arc of lightning between you and the target. Make a ranged spell attack against that creature. On a hit, the target takes 1d12 lightning damage, and on each of your turns for the duration, you can use your action to deal 1d12 lightning damage to the target automatically.",upcast:"Initial damage increases by 1d12 for each slot level above 1st."},
  "Wrathful Smite":{lvl:1,school:"Evocation",cast:"Bonus Action",range:"Self",duration:"Concentration, up to 1 minute",desc:"The next time you hit with a melee weapon attack during this spell's duration, your attack deals an extra 1d6 psychic damage. Additionally, if the target is a creature, it must make a Wisdom saving throw or be frightened of you until the spell ends.",upcast:""},
  // ── LEVEL 2 ──
  "Aid":{lvl:2,school:"Abjuration",cast:"1 Action",range:"30 ft",duration:"8 hours",desc:"Your spell bolsters your allies with toughness and resolve. Choose up to three creatures within range. Each target's hit point maximum and current hit points increase by 5 for the duration.",upcast:"A target's hit points increase by an additional 5 for each slot level above 2nd."},
  "Alter Self":{lvl:2,school:"Transmutation",cast:"1 Action",range:"Self",duration:"Concentration, up to 1 hour",desc:"You assume a different form. When you cast the spell, choose one of the following options: Aquatic Adaptation (breathe water, swim speed), Change Appearance (alter your appearance), or Natural Weapons (your unarmed strikes deal 1d6 bludgeoning/piercing/slashing damage and count as magical).",upcast:""},
  "Arcane Lock":{lvl:2,school:"Abjuration",cast:"1 Action",range:"Touch",duration:"Until dispelled",desc:"You touch a closed door, window, gate, chest, or other entryway, and it becomes locked for the duration. You and the creatures you designate when you cast this spell can open the object normally. You can also set a password that, when spoken within 5 feet of the object, suppresses this spell for 1 minute.",upcast:""},
  "Barkskin":{lvl:2,school:"Abjuration",cast:"Bonus Action",range:"Touch",duration:"1 hour",desc:"You touch a willing creature. Until the spell ends, the target's skin has a rough, bark-like appearance, and the target's AC can't be less than 16, regardless of what kind of armor it is wearing.",upcast:""},
  "Blindness/Deafness":{lvl:2,school:"Necromancy",cast:"1 Action",range:"30 ft",duration:"1 minute",desc:"You can blind or deafen a foe. Choose one creature that you can see within range to make a Constitution saving throw. If it fails, the target is either blinded or deafened (your choice) for the duration. At the end of each of its turns, the target can make a Constitution saving throw. On a success, the spell ends.",upcast:"You can target one additional creature for each slot level above 2nd."},
  "Blur":{lvl:2,school:"Illusion",cast:"1 Action",range:"Self",duration:"Concentration, up to 1 minute",desc:"Your body becomes blurred, shifting and wavering to all who can see you. For the duration, any creature has disadvantage on attack rolls against you. An attacker is immune to this effect if it doesn't rely on sight, as with blindsight, or can see through illusions, as with truesight.",upcast:""},
  "Calm Emotions":{lvl:2,school:"Enchantment",cast:"1 Action",range:"60 ft",duration:"Concentration, up to 1 minute",desc:"You attempt to suppress strong emotions in a group of people. Each humanoid in a 20-foot-radius sphere centered on a point you choose within range must make a Charisma saving throw; a creature can choose to fail this saving throw if it wishes. If a creature fails its saving throw, choose one of the following two effects: suppress charmed/frightened, or indifferent about creatures of your choice.",upcast:""},
  "Cloud of Daggers":{lvl:2,school:"Conjuration",cast:"1 Action",range:"60 ft",duration:"Concentration, up to 1 minute",desc:"You fill the air with spinning daggers in a cube 5 feet on each side, centered on a point you choose within range. A creature takes 4d4 slashing damage when it enters the spell's area for the first time on a turn or starts its turn there.",upcast:"Damage increases by 2d4 for each slot level above 2nd."},
  "Darkness":{lvl:2,school:"Evocation",cast:"1 Action",range:"60 ft",duration:"Concentration, up to 10 minutes",desc:"Magical darkness spreads from a point you choose within range to fill a 15-foot-radius sphere for the duration. The darkness spreads around corners. A creature with darkvision can't see through this magical darkness, and nonmagical light can't illuminate it.",upcast:""},
  "Darkvision":{lvl:2,school:"Transmutation",cast:"1 Action",range:"Touch",duration:"8 hours",desc:"You touch a willing creature to grant it the ability to see in the dark. For the duration, that creature has darkvision out to a range of 60 feet.",upcast:"You can target one additional creature for each slot level above 2nd."},
  "Detect Thoughts":{lvl:2,school:"Divination",cast:"1 Action",range:"Self",duration:"Concentration, up to 1 minute",desc:"For the duration, you can read the thoughts of certain creatures. When you cast the spell and as your action on each turn until the spell ends, you can focus your mind on any one creature that you can see within 30 feet of you. If the creature you choose has an Intelligence of 3 or lower or doesn't speak any language, the creature is unaffected.",upcast:""},
  "Enhance Ability":{lvl:2,school:"Transmutation",cast:"1 Action",range:"Touch",duration:"Concentration, up to 1 hour",desc:"You touch a creature and bestow upon it a magical enhancement. Choose one of the following effects: Bull's Strength (advantage on Strength checks, double carry capacity), Cat's Grace (advantage on Dexterity checks, no falling damage up to 20 ft), Bear's Endurance (advantage on Constitution checks, gain 2d6 temp HP), Fox's Cunning (advantage on Intelligence checks), Owl's Wisdom (advantage on Wisdom checks), Eagle's Splendor (advantage on Charisma checks).",upcast:"You can target one additional creature for each slot level above 2nd."},
  "Enlarge/Reduce":{lvl:2,school:"Transmutation",cast:"1 Action",range:"30 ft",duration:"Concentration, up to 1 minute",desc:"You cause a creature or an object you can see within range to grow larger or smaller for the duration. Choose either a creature or a non-magical object that is neither worn nor carried. Enlarge: doubles in size, weapon dice go up one step, advantage on Strength checks/saves. Reduce: halves in size, weapon dice go down one step, disadvantage on Strength checks/saves.",upcast:""},
  "Enthrall":{lvl:2,school:"Enchantment",cast:"1 Action",range:"60 ft",duration:"1 minute",desc:"You weave a distracting string of words, causing creatures of your choice that you can see within range and that can hear you to make a Wisdom saving throw. Any creature that can't be charmed succeeds on this saving throw automatically, and if you or your companions are fighting a creature, it has advantage on the save. On a failed save, the target has disadvantage on Wisdom (Perception) checks made to perceive any creature other than you.",upcast:""},
  "Find Steed":{lvl:2,school:"Conjuration",cast:"10 Minutes",range:"30 ft",duration:"Instantaneous",desc:"You summon a spirit that assumes the form of an unusually intelligent, strong, and loyal steed, creating a long-lasting bond with it. Appearing in an unoccupied space within range, the steed takes on a form that you choose: a warhorse, a pony, a camel, an elk, or a mastiff.",upcast:""},
  "Flame Blade":{lvl:2,school:"Evocation",cast:"Bonus Action",range:"Self",duration:"Concentration, up to 10 minutes",desc:"You evoke a fiery blade in your free hand. The blade is similar in size and shape to a scimitar, and it lasts for the duration. If you let go of the blade, it disappears, but you can evoke the blade again as a bonus action. You can use your action to make a melee spell attack with the fiery blade. On a hit, the target takes 3d6 fire damage. The flaming blade sheds bright light in a 10-foot radius and dim light for an additional 10 feet.",upcast:"Damage increases by 1d6 for every two slot levels above 2nd."},
  "Flaming Sphere":{lvl:2,school:"Conjuration",cast:"1 Action",range:"60 ft",duration:"Concentration, up to 1 minute",desc:"A 5-foot-diameter sphere of fire appears in an unoccupied space of your choice within range and lasts for the duration. Any creature that ends its turn within 5 feet of the sphere must make a Dexterity saving throw. The creature takes 2d6 fire damage on a failed save, or half as much damage on a successful one.",upcast:"Damage increases by 1d6 for each slot level above 2nd."},
  "Gust of Wind":{lvl:2,school:"Evocation",cast:"1 Action",range:"Self (60-ft line)",duration:"Concentration, up to 1 minute",desc:"A line of strong wind 60 feet long and 10 feet wide blasts from you in a direction you choose for the spell's duration. Each creature that starts its turn in the line must succeed on a Strength saving throw or be pushed 15 feet away from you in a direction following the line.",upcast:""},
  "Heat Metal":{lvl:2,school:"Transmutation",cast:"1 Action",range:"60 ft",duration:"Concentration, up to 1 minute",desc:"Choose a manufactured metal object, such as a metal weapon or a suit of heavy or medium metal armor, that you can see within range. You cause the object to glow red-hot. Any creature in physical contact with the object takes 2d8 fire damage when you cast the spell. Until the spell ends, you can use a bonus action on each of your subsequent turns to cause this damage again.",upcast:"Damage increases by 1d8 for each slot level above 2nd."},
  "Hold Person":{lvl:2,school:"Enchantment",cast:"1 Action",range:"60 ft",duration:"Concentration, up to 1 minute",desc:"Choose a humanoid that you can see within range. The target must succeed on a Wisdom saving throw or be paralyzed for the duration. At the end of each of its turns, the target can make another Wisdom saving throw. On a success, the spell ends on the target.",upcast:"You can target one additional humanoid for each slot level above 2nd."},
  "Invisibility":{lvl:2,school:"Illusion",cast:"1 Action",range:"Touch",duration:"Concentration, up to 1 hour",desc:"A creature you touch becomes invisible until the spell ends. Anything the target is wearing or carrying is invisible as long as it is on the target's person. The spell ends for a target that attacks or casts a spell.",upcast:"You can target one additional creature for each slot level above 2nd."},
  "Knock":{lvl:2,school:"Transmutation",cast:"1 Action",range:"60 ft",duration:"Instantaneous",desc:"Choose an object that you can see within range. The object can be a door, a box, a chest, a set of manacles, a padlock, or another object that contains a mundane or magical means that prevents access. A target that is held shut by a mundane lock or that is stuck or barred becomes unlocked, unstuck, or unbarred.",upcast:""},
  "Lesser Restoration":{lvl:2,school:"Abjuration",cast:"1 Action",range:"Touch",duration:"Instantaneous",desc:"You touch a creature and can end either one disease or one condition afflicting it. The condition can be blinded, deafened, paralyzed, or poisoned.",upcast:""},
  "Levitate":{lvl:2,school:"Transmutation",cast:"1 Action",range:"60 ft",duration:"Concentration, up to 10 minutes",desc:"One creature or loose object of your choice that you can see within range rises vertically, up to 20 feet, and remains suspended there for the duration. The spell can levitate a target that weighs up to 500 pounds. An unwilling creature that succeeds on a Constitution saving throw is unaffected.",upcast:""},
  "Locate Animals or Plants":{lvl:2,school:"Divination",cast:"1 Action (Ritual)",range:"Self",duration:"Instantaneous",desc:"Describe or name a specific kind of beast or plant. Concentrating on the voice of nature in your surroundings, you learn the direction and distance to the closest creature or plant of that kind within 5 miles, if any are present.",upcast:""},
  "Locate Object":{lvl:2,school:"Divination",cast:"1 Action",range:"Self",duration:"Concentration, up to 10 minutes",desc:"Describe or name an object that is familiar to you. You sense the direction to the object's location, as long as that object is within 1,000 feet of you. If the object is in motion, you know the direction of its movement.",upcast:""},
  "Magic Mouth":{lvl:2,school:"Illusion",cast:"1 Minute (Ritual)",range:"30 ft",duration:"Until dispelled",desc:"You implant a message within an object in range, a message that is uttered when a trigger condition is met. Choose an object that you can see and that isn't being worn or carried by another creature. Then speak the message, which must be 25 words or less, though it can be delivered over as long as 10 minutes.",upcast:""},
  "Magic Weapon":{lvl:2,school:"Transmutation",cast:"Bonus Action",range:"Touch",duration:"1 hour",desc:"You touch a nonmagical weapon. Until the spell ends, that weapon becomes a magic weapon with a +1 bonus to attack rolls and damage rolls.",upcast:"+2 bonus at 4th level, +3 bonus at 6th level."},
  "Misty Step":{lvl:2,school:"Conjuration",cast:"Bonus Action",range:"Self",duration:"Instantaneous",desc:"Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space that you can see.",upcast:""},
  "Mirror Image":{lvl:2,school:"Illusion",cast:"1 Action",range:"Self",duration:"1 minute",desc:"Three illusory duplicates of yourself appear in your space. Until the spell ends, the duplicates move with you and mimic your actions, shifting position so it's impossible to track which image is real. You can use your action to dismiss the illusory duplicates. Each time a creature targets you with an attack during the spell's duration, roll a d20 to determine whether the attack instead targets one of your duplicates.",upcast:""},
  "Moonbeam":{lvl:2,school:"Evocation",cast:"1 Action",range:"120 ft",duration:"Concentration, up to 1 minute",desc:"A silvery beam of pale light shines down in a 5-foot-radius, 40-foot-high cylinder centered on a point within range. Until the spell ends, dim light fills the cylinder. When a creature enters the spell's area for the first time on a turn or starts its turn there, it is engulfed in ghostly flames that cause searing pain, and it must make a Constitution saving throw. It takes 2d10 radiant damage on a failed save, or half as much damage on a successful one.",upcast:"Damage increases by 1d10 for each slot level above 2nd."},
  "Pass without Trace":{lvl:2,school:"Abjuration",cast:"1 Action",range:"Self",duration:"Concentration, up to 1 hour",desc:"A veil of shadows and silence radiates from you, masking you and your companions from detection. For the duration, each creature you choose within 30 feet of you (including you) has a +10 bonus to Dexterity (Stealth) checks and can't be tracked except by magical means. A creature that receives this bonus leaves behind no tracks or other traces of its passage.",upcast:""},
  "Prayer of Healing":{lvl:2,school:"Evocation",cast:"10 Minutes",range:"30 ft",duration:"Instantaneous",desc:"Up to six creatures of your choice that you can see within range each regain hit points equal to 2d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs.",upcast:"The healing increases by 1d8 for each slot level above 2nd."},
  "Protection from Poison":{lvl:2,school:"Abjuration",cast:"1 Action",range:"Touch",duration:"1 hour",desc:"You touch a creature. If it is poisoned, you neutralize the poison. If more than one poison afflicts the target, you neutralize one poison that you know is there, or you neutralize one at random. For the duration, the target has advantage on saving throws against being poisoned, and it has resistance to poison damage.",upcast:""},
  "Ray of Enfeeblement":{lvl:2,school:"Necromancy",cast:"1 Action",range:"60 ft",duration:"Concentration, up to 1 minute",desc:"A black beam of enervating energy springs from your finger toward a creature within range. Make a ranged spell attack against the target. On a hit, the target deals only half damage with weapon attacks that use Strength until the spell ends.",upcast:""},
  "Rope Trick":{lvl:2,school:"Transmutation",cast:"1 Action",range:"Touch",duration:"1 hour",desc:"You touch a length of rope that is up to 60 feet long. One end of the rope then rises into the air until the whole rope hangs perpendicular to the ground. At the upper end of the rope, an invisible entrance opens to an extradimensional space that lasts until the spell ends. The extradimensional space can be reached by climbing to the top of the rope.",upcast:""},
  "Scorching Ray":{lvl:2,school:"Evocation",cast:"1 Action",range:"120 ft",duration:"Instantaneous",desc:"You create three rays of fire and hurl them at targets within range. You can hurl them at one target or several. Make a ranged spell attack for each ray. On a hit, the target takes 2d6 fire damage.",upcast:"One additional ray for each slot level above 2nd."},
  "See Invisibility":{lvl:2,school:"Divination",cast:"1 Action",range:"Self",duration:"1 hour",desc:"For the duration, you see invisible creatures and objects as if they were visible, and you can see into the Ethereal Plane, out to a range of 60 feet.",upcast:""},
  "Shatter":{lvl:2,school:"Evocation",cast:"1 Action",range:"60 ft",duration:"Instantaneous",desc:"A sudden loud ringing noise, painfully intense, erupts from a point of your choice within range. Each creature in a 10-foot-radius sphere centered on that point must make a Constitution saving throw. A creature takes 3d8 thunder damage on a failed save, or half as much damage on a successful one. A creature made of inorganic material such as stone, crystal, or metal has disadvantage on this saving throw.",upcast:"Damage increases by 1d8 for each slot level above 2nd."},
  "Silence":{lvl:2,school:"Illusion",cast:"1 Action (Ritual)",range:"120 ft",duration:"Concentration, up to 10 minutes",desc:"For the duration, no sound can be created within or pass through a 20-foot-radius sphere centered on a point you choose within range. Any creature or object entirely inside the sphere is immune to thunder damage, and creatures are deafened while entirely inside it.",upcast:""},
  "Spider Climb":{lvl:2,school:"Transmutation",cast:"1 Action",range:"Touch",duration:"Concentration, up to 1 hour",desc:"Until the spell ends, one willing creature you touch gains the ability to move up, down, and across vertical surfaces and upside down along ceilings, while leaving its hands free. The target also gains a climbing speed equal to its walking speed.",upcast:"You can target one additional creature for each slot level above 2nd."},
  "Spike Growth":{lvl:2,school:"Transmutation",cast:"1 Action",range:"150 ft",duration:"Concentration, up to 10 minutes",desc:"The ground in a 20-foot radius centered on a point within range twists and sprouts hard spikes and thorns. The area becomes difficult terrain for the duration. When a creature moves into or within the area, it takes 2d4 piercing damage for every 5 feet it travels.",upcast:""},
  "Spiritual Weapon":{lvl:2,school:"Evocation",cast:"Bonus Action",range:"60 ft",duration:"Concentration, up to 1 minute",desc:"You create a floating, spectral weapon within range that lasts for the duration or until you cast this spell again. When you cast the spell, you can make a melee spell attack against a creature within 5 feet of the weapon. On a hit, the target takes force damage equal to 1d8 + your spellcasting ability modifier.",upcast:"Damage increases by 1d8 for every two slot levels above 2nd."},
  "Suggestion":{lvl:2,school:"Enchantment",cast:"1 Action",range:"30 ft",duration:"Concentration, up to 8 hours",desc:"You suggest a course of activity (limited to a sentence or two) and magically influence a creature you can see within range that can hear and understand you. Creatures that can't be charmed are immune to this effect. The suggestion must be worded in such a manner as to make the course of action sound reasonable.",upcast:""},
  "Summon Beast":{lvl:2,school:"Conjuration",cast:"1 Action",range:"90 ft",duration:"Concentration, up to 1 hour",desc:"You call forth a bestial spirit. It manifests in an unoccupied space that you can see within range. This corporeal form uses the Bestial Spirit stat block. When you cast the spell, choose an environment: Air, Land, or Water. The creature resembles an animal of your choice that is native to the chosen environment.",upcast:"The creature's hit points increase by 5 for each slot level above 2nd."},
  "Warding Bond":{lvl:2,school:"Abjuration",cast:"1 Action",range:"Touch",duration:"1 hour",desc:"This spell wards a willing creature you touch and creates a mystic connection between you and the target until the spell ends. While the target is within 60 feet of you, it gains a +1 bonus to AC and saving throws, and it has resistance to all damage. Also, each time it takes damage, you take the same amount of damage.",upcast:""},
  "Web":{lvl:2,school:"Conjuration",cast:"1 Action",range:"60 ft",duration:"Concentration, up to 1 hour",desc:"You conjure a mass of thick, sticky webbing at a point of your choice within range. The webs fill a 20-foot cube from that point for the duration. The webs are difficult terrain and lightly obscure their area. If the webs aren't anchored between two solid masses (such as walls or trees) or layered across a floor, wall, or ceiling, the conjured web collapses on itself, and the spell ends at the start of your next turn.",upcast:""},
  "Zone of Truth":{lvl:2,school:"Enchantment",cast:"1 Action",range:"60 ft",duration:"10 minutes",desc:"You create a magical zone that guards against deception in a 15-foot-radius sphere centered on a point of your choice within range. Until the spell ends, a creature that enters the spell's area for the first time on a turn or starts its turn there must make a Charisma saving throw. On a failed save, a creature can't speak a deliberate lie while in the radius.",upcast:""},
  // ── LEVEL 3 ──
  "Animate Dead":{lvl:3,school:"Necromancy",cast:"1 Minute",range:"10 ft",duration:"Instantaneous",desc:"This spell creates an undead servant. Choose a pile of bones or a corpse of a Medium or Small humanoid within range. Your spell imbues the target with a foul mimicry of life, raising it as an undead creature. The target becomes a skeleton if you chose bones or a zombie if you chose a corpse.",upcast:"You animate or reassert control over two additional undead creatures for each slot level above 3rd."},
  "Bestow Curse":{lvl:3,school:"Necromancy",cast:"1 Action",range:"Touch",duration:"Concentration, up to 1 minute",desc:"You touch a creature, and that creature must succeed on a Wisdom saving throw or become cursed for the duration of the spell. When you cast this spell, choose the nature of the curse from the following options: disadvantage on ability checks and saving throws with one ability score; disadvantage on attack rolls against you; must make a Wisdom saving throw each turn or waste its action; take extra 1d8 necrotic damage whenever you hit it.",upcast:"Duration increases: 10 minutes at 4th, 8 hours at 5th, 24 hours at 7th, until dispelled at 9th."},
  "Blink":{lvl:3,school:"Transmutation",cast:"1 Action",range:"Self",duration:"1 minute",desc:"Roll a d20 at the end of each of your turns for the duration of the spell. On a roll of 11 or higher, you vanish from your current plane of existence and appear in the Ethereal Plane. At the start of your next turn, you return to the plane you vanished from in the space you left.",upcast:""},
  "Call Lightning":{lvl:3,school:"Conjuration",cast:"1 Action",range:"120 ft",duration:"Concentration, up to 10 minutes",desc:"A storm cloud appears in the shape of a cylinder that is 10 feet tall with a 60-foot radius, centered on a point you can see above you. You can use your action to call down lightning on a target point. A creature within 5 feet of that point must make a Dexterity saving throw. The creature takes 3d10 lightning damage on a failed save, or half as much on a successful one.",upcast:"Damage increases by 1d10 for each slot level above 3rd."},
  "Clairvoyance":{lvl:3,school:"Divination",cast:"10 Minutes",range:"1 mile",duration:"Concentration, up to 10 minutes",desc:"You create an invisible sensor within range in a location familiar to you (a place you have visited or seen before) or in an obvious location that is unfamiliar to you (such as behind a door, around a corner, or in a grove of trees). The sensor remains in place for the duration, and it can't be attacked or otherwise interacted with.",upcast:""},
  "Conjure Animals":{lvl:3,school:"Conjuration",cast:"1 Action",range:"60 ft",duration:"Concentration, up to 1 hour",desc:"You summon fey spirits that take the form of beasts and appear in unoccupied spaces that you can see within range. You can choose a challenge rating for the summoned creatures (up to 1/4, 1/2, 1, or 2, depending on slot level).",upcast:"You summon more/stronger creatures at higher levels."},
  "Counterspell":{lvl:3,school:"Abjuration",cast:"1 Reaction",range:"60 ft",duration:"Instantaneous",desc:"You attempt to interrupt a creature in the process of casting a spell. If the creature is casting a spell of 3rd level or lower, its spell fails and has no effect. If it is casting a spell of 4th level or higher, make an ability check using your spellcasting ability. The DC equals 10 + the spell's level. On a success, the creature's spell fails and has no effect.",upcast:"The interrupted spell automatically fails if its level is less than or equal to the slot used."},
  "Daylight":{lvl:3,school:"Evocation",cast:"1 Action",range:"60 ft",duration:"1 hour",desc:"A 60-foot-radius sphere of light spreads out from a point you choose within range. The sphere is bright light and sheds dim light for an additional 60 feet. If you chose a point on an object you are holding or one that isn't being worn or carried, the light shines from the object with and moves with it.",upcast:""},
  "Dispel Magic":{lvl:3,school:"Abjuration",cast:"1 Action",range:"120 ft",duration:"Instantaneous",desc:"Choose one creature, object, or magical effect within range. Any spell of 3rd level or lower on the target ends. For each spell of 4th level or higher on the target, make an ability check using your spellcasting ability. The DC equals 10 + the spell's level. On a successful check, the spell ends.",upcast:"Automatically ends spells whose level is equal to or lower than the slot used."},
  "Fear":{lvl:3,school:"Illusion",cast:"1 Action",range:"Self (30-ft cone)",duration:"Concentration, up to 1 minute",desc:"You project a phantasmal image of a creature's worst fears. Each creature in a 30-foot cone must succeed on a Wisdom saving throw or drop whatever it is holding and become frightened for the duration.",upcast:""},
  "Fireball":{lvl:3,school:"Evocation",cast:"1 Action",range:"150 ft",duration:"Instantaneous",desc:"A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame. Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one.",upcast:"Damage increases by 1d6 for each slot level above 3rd."},
  "Fly":{lvl:3,school:"Transmutation",cast:"1 Action",range:"Touch",duration:"Concentration, up to 10 minutes",desc:"You touch a willing creature. The target gains a flying speed of 60 feet for the duration. When the spell ends, the target falls if it is still aloft, unless it can stop the fall.",upcast:"You can target one additional creature for each slot level above 3rd."},
  "Gaseous Form":{lvl:3,school:"Transmutation",cast:"1 Action",range:"Touch",duration:"Concentration, up to 1 hour",desc:"You transform a willing creature you touch, along with everything it's wearing and carrying, into a misty cloud for the duration. The spell ends if the creature drops to 0 hit points. An incorporeal creature isn't affected.",upcast:""},
  "Haste":{lvl:3,school:"Transmutation",cast:"1 Action",range:"30 ft",duration:"Concentration, up to 1 minute",desc:"Choose a willing creature that you can see within range. Until the spell ends, the target's speed is doubled, it gains a +2 bonus to AC, it has advantage on Dexterity saving throws, and it gains an additional action on each of its turns. When the spell ends, the target can't move or take actions until after its next turn.",upcast:""},
  "Hypnotic Pattern":{lvl:3,school:"Illusion",cast:"1 Action",range:"120 ft",duration:"Concentration, up to 1 minute",desc:"You create a twisting pattern of colors that weaves through the air inside a 30-foot cube within range. The pattern appears for a moment and vanishes. Each creature in the area who sees the pattern must make a Wisdom saving throw. On a failed save, the creature becomes charmed for the duration. While charmed by this spell, the creature is incapacitated and has a speed of 0.",upcast:""},
  "Lightning Bolt":{lvl:3,school:"Evocation",cast:"1 Action",range:"Self (100-ft line)",duration:"Instantaneous",desc:"A stroke of lightning forming a line 100 feet long and 5 feet wide blasts out from you in a direction you choose. Each creature in the line must make a Dexterity saving throw. A creature takes 8d6 lightning damage on a failed save, or half as much damage on a successful one.",upcast:"Damage increases by 1d6 for each slot level above 3rd."},
  "Magic Circle":{lvl:3,school:"Abjuration",cast:"1 Minute",range:"10 ft",duration:"1 hour",desc:"You create a 10-foot-radius, 20-foot-tall cylinder of magical energy centered on a point on the ground that you can see within range. Glowing runes appear wherever the cylinder intersects with the floor or another surface. Choose one or more of the following types of creatures: celestials, elementals, fey, fiends, or undead.",upcast:"Duration increases by 1 hour for each slot level above 3rd."},
  "Major Image":{lvl:3,school:"Illusion",cast:"1 Action",range:"120 ft",duration:"Concentration, up to 10 minutes",desc:"You create the image of an object, a creature, or some other visible phenomenon that is no larger than a 20-foot cube. The image appears at a spot that you can see within range and lasts for the duration. It seems completely real, including sounds, smells, and temperature appropriate to the thing depicted.",upcast:"When cast at 6th level or higher, the spell lasts until dispelled, without requiring concentration."},
  "Mass Healing Word":{lvl:3,school:"Evocation",cast:"Bonus Action",range:"60 ft",duration:"Instantaneous",desc:"As you call out words of restoration, up to six creatures of your choice that you can see within range regain hit points equal to 1d4 + your spellcasting ability modifier. This spell has no effect on undead or constructs.",upcast:"The healing increases by 1d4 for each slot level above 3rd."},
  "Plant Growth":{lvl:3,school:"Transmutation",cast:"1 Action or 8 Hours",range:"150 ft",duration:"Instantaneous",desc:"This spell channels vitality into plants within a specific area. There are two possible uses for the spell, granting either immediate or long-term benefits. If you cast this spell using 1 action, choose a point within range. All normal plants in a 100-foot radius centered on that point become thick and overgrown.",upcast:""},
  "Protection from Energy":{lvl:3,school:"Abjuration",cast:"1 Action",range:"Touch",duration:"Concentration, up to 1 hour",desc:"For the duration, the willing creature you touch has resistance to one damage type of your choice: acid, cold, fire, lightning, or thunder.",upcast:""},
  "Remove Curse":{lvl:3,school:"Abjuration",cast:"1 Action",range:"Touch",duration:"Instantaneous",desc:"At your touch, all curses affecting one creature or object end. If the object is a cursed magic item, its curse remains, but the spell breaks its owner's attunement to the object so it can be removed or discarded.",upcast:""},
  "Revivify":{lvl:3,school:"Necromancy",cast:"1 Action",range:"Touch",duration:"Instantaneous",desc:"You touch a creature that has died within the last minute. That creature returns to life with 1 hit point. This spell can't return to life a creature that has died of old age, nor can it restore any missing body parts.",upcast:""},
  "Sending":{lvl:3,school:"Evocation",cast:"1 Action",range:"Unlimited",duration:"1 round",desc:"You send a short message of twenty-five words or fewer to a creature with which you are familiar. The creature hears the message in its mind, recognizes you as the sender if it knows you, and can answer in a like manner immediately. The spell enables creatures with Intelligence scores of at least 1 to understand the meaning of your message.",upcast:""},
  "Slow":{lvl:3,school:"Transmutation",cast:"1 Action",range:"120 ft",duration:"Concentration, up to 1 minute",desc:"You alter time around up to six creatures of your choice in a 40-foot cube within range. Each target must succeed on a Wisdom saving throw or be affected by this spell for the duration. An affected target's speed is halved, it takes a -2 penalty to AC and Dexterity saving throws, and it can't use reactions.",upcast:""},
  "Speak with Dead":{lvl:3,school:"Necromancy",cast:"1 Action",range:"10 ft",duration:"10 minutes",desc:"You grant the semblance of life and intelligence to a corpse of your choice within range, allowing it to answer the questions you pose. The corpse must still have a mouth and can't be undead. The spell doesn't return the creature's soul to its body, only its animating spirit.",upcast:""},
  "Stinking Cloud":{lvl:3,school:"Conjuration",cast:"1 Action",range:"90 ft",duration:"Concentration, up to 1 minute",desc:"You create a 20-foot-radius sphere of yellow, nauseating gas centered on a point within range. The cloud spreads around corners, and its area is heavily obscured. The cloud lingers in the air for the duration. Each creature that is completely within the cloud at the start of its turn must make a Constitution saving throw against poison.",upcast:""},
  "Tongues":{lvl:3,school:"Divination",cast:"1 Action",range:"Touch",duration:"1 hour",desc:"This spell grants the creature you touch the ability to understand any spoken language it hears. Moreover, when the target speaks, any creature that knows at least one language and can hear the target understands what it says.",upcast:""},
  "Vampiric Touch":{lvl:3,school:"Necromancy",cast:"1 Action",range:"Self",duration:"Concentration, up to 1 minute",desc:"The touch of your shadow-wreathed hand can siphon life force from others to heal your wounds. Make a melee spell attack against a creature within your reach. On a hit, the target takes 3d6 necrotic damage, and you regain hit points equal to half the amount of necrotic damage dealt.",upcast:"Damage increases by 1d6 for each slot level above 3rd."},
  "Water Breathing":{lvl:3,school:"Transmutation",cast:"1 Action (Ritual)",range:"30 ft",duration:"24 hours",desc:"This spell grants up to ten willing creatures you can see within range the ability to breathe underwater until the spell ends. Affected creatures also retain their normal mode of respiration.",upcast:""},
  "Water Walk":{lvl:3,school:"Transmutation",cast:"1 Action (Ritual)",range:"30 ft",duration:"1 hour",desc:"This spell grants the ability to move across any liquid surface — such as water, acid, mud, snow, quicksand, or lava — as if it were harmless solid ground (creatures crossing molten lava can still take damage from the heat) to up to ten willing creatures you can see within range for the duration.",upcast:""},
  // ── LEVEL 4 ──
  "Banishment":{lvl:4,school:"Abjuration",cast:"1 Action",range:"60 ft",duration:"Concentration, up to 1 minute",desc:"You attempt to send one creature that you can see within range to another plane of existence. The target must succeed on a Charisma saving throw or be banished. If the target is native to a different plane of existence than the one you're on, the target is banished with a faint popping noise, returning to its home plane.",upcast:"You can target one additional creature for each slot level above 4th."},
  "Blight":{lvl:4,school:"Necromancy",cast:"1 Action",range:"30 ft",duration:"Instantaneous",desc:"Necromantic energy washes over a creature of your choice that you can see within range, draining moisture and vitality from it. The target must make a Constitution saving throw. The target takes 8d8 necrotic damage on a failed save, or half as much damage on a successful one. This spell has no effect on undead or constructs.",upcast:"Damage increases by 1d8 for each slot level above 4th."},
  "Charm Monster":{lvl:4,school:"Enchantment",cast:"1 Action",range:"30 ft",duration:"1 hour",desc:"You attempt to charm a creature you can see within range. It must make a Wisdom saving throw, and it does so with advantage if you or your companions are fighting it. If it fails the saving throw, it is charmed by you until the spell ends or until you or your companions do anything harmful to it.",upcast:"You can target one additional creature for each slot level above 4th."},
  "Compulsion":{lvl:4,school:"Enchantment",cast:"1 Action",range:"30 ft",duration:"Concentration, up to 1 minute",desc:"Creatures of your choice that you can see within range and that can hear you must make a Wisdom saving throw. A target automatically succeeds on this saving throw if it can't be charmed. On a failed save, a target is affected by this spell. Until the spell ends, you can use a bonus action on each of your turns to designate a direction that is horizontal to you.",upcast:""},
  "Confusion":{lvl:4,school:"Enchantment",cast:"1 Action",range:"90 ft",duration:"Concentration, up to 1 minute",desc:"This spell assaults and twists creatures' minds, spawning delusions and provoking uncontrolled action. Each creature in a 10-foot-radius sphere centered on a point you choose within range must succeed on a Wisdom saving throw when you cast this spell or be affected by it. Roll a d10 each turn to determine their random behavior.",upcast:"The radius of the sphere increases by 5 feet for each slot level above 4th."},
  "Death Ward":{lvl:4,school:"Abjuration",cast:"1 Action",range:"Touch",duration:"8 hours",desc:"You touch a creature and grant it a measure of protection from death. The first time the target would drop to 0 hit points as a result of taking damage, the target instead drops to 1 hit point, and the spell ends. If the spell is still in effect when the target is subjected to an effect that would kill it instantaneously without dealing damage, that effect is instead negated against the target, and the spell ends.",upcast:""},
  "Dimension Door":{lvl:4,school:"Conjuration",cast:"1 Action",range:"500 ft",duration:"Instantaneous",desc:"You teleport yourself from your current location to any other spot within range. You arrive at exactly the spot desired. It can be a place you can see, one you can visualize, or one you can describe by stating distance and direction, such as '200 feet straight downward.'",upcast:""},
  "Dominate Beast":{lvl:4,school:"Enchantment",cast:"1 Action",range:"60 ft",duration:"Concentration, up to 1 minute",desc:"You attempt to beguile a beast that you can see within range. It must succeed on a Wisdom saving throw or be charmed by you for the duration. If you or creatures that are friendly to you are fighting it, it has advantage on the saving throw.",upcast:"Duration increases: 10 minutes at 5th, 1 hour at 6th, 8 hours at 7th+."},
  "Fire Shield":{lvl:4,school:"Evocation",cast:"1 Action",range:"Self",duration:"10 minutes",desc:"Thin and wispy flames wreathe your body for the duration, shedding bright light in a 10-foot radius and dim light for an additional 10 feet. The flames provide you with a warm shield or a chill shield, as you choose. The warm shield grants you resistance to cold damage, and the chill shield grants you resistance to fire damage.",upcast:""},
  "Freedom of Movement":{lvl:4,school:"Abjuration",cast:"1 Action",range:"Touch",duration:"1 hour",desc:"You touch a willing creature. For the duration, the target's movement is unaffected by difficult terrain, and spells and other magical effects can neither reduce the target's speed nor cause the target to be paralyzed or restrained.",upcast:""},
  "Greater Invisibility":{lvl:4,school:"Illusion",cast:"1 Action",range:"Touch",duration:"Concentration, up to 1 minute",desc:"You or a creature you touch becomes invisible until the spell ends. Anything the target is wearing or carrying is invisible as long as it is on the target's person. Unlike Invisibility, this spell doesn't end when the target attacks or casts a spell.",upcast:""},
  "Hallucinatory Terrain":{lvl:4,school:"Illusion",cast:"10 Minutes",range:"300 ft",duration:"24 hours",desc:"You make natural terrain in a 150-foot cube in range look, sound, and smell like some other sort of natural terrain. Thus, open fields or a road can be made to resemble a swamp, hill, crevasse, or some other difficult or impassable terrain.",upcast:""},
  "Ice Storm":{lvl:4,school:"Evocation",cast:"1 Action",range:"300 ft",duration:"Instantaneous",desc:"A hail of rock-hard ice pounds to the ground in a 20-foot-radius, 40-foot-high cylinder centered on a point within range. Each creature in the cylinder must make a Dexterity saving throw. A creature takes 2d8 bludgeoning damage and 4d6 cold damage on a failed save, or half as much damage on a successful one.",upcast:"Bludgeoning damage increases by 1d8 for each slot level above 4th."},
  "Locate Creature":{lvl:4,school:"Divination",cast:"1 Action",range:"Self",duration:"Concentration, up to 1 hour",desc:"Describe or name a creature that is familiar to you. You sense the direction to the creature's location, as long as that creature is within 1,000 feet of you. If the creature is in motion, you know the direction of its movement.",upcast:""},
  "Phantasmal Killer":{lvl:4,school:"Illusion",cast:"1 Action",range:"120 ft",duration:"Concentration, up to 1 minute",desc:"You tap into the nightmares of a creature you can see within range and create an illusory manifestation of its deepest fears, visible only to that creature. The target must make a Wisdom saving throw. On a failed save, the target becomes frightened for the duration. At the end of each of the target's turns before the spell ends, the target must succeed on a Wisdom saving throw or take 4d10 psychic damage.",upcast:"Damage increases by 1d10 for each slot level above 4th."},
  "Polymorph":{lvl:4,school:"Transmutation",cast:"1 Action",range:"60 ft",duration:"Concentration, up to 1 hour",desc:"This spell transforms a creature that you can see within range into a new form. An unwilling creature must make a Wisdom saving throw to avoid the effect. The spell has no effect on a shapechanger or a creature with 0 hit points. The transformation lasts for the duration, or until the target drops to 0 hit points or dies.",upcast:""},
  "Stone Shape":{lvl:4,school:"Transmutation",cast:"1 Action",range:"Touch",duration:"Instantaneous",desc:"You touch a stone object of Medium size or smaller or a section of stone no more than 5 feet in any dimension and form it into any shape that suits your purpose.",upcast:""},
  "Stoneskin":{lvl:4,school:"Abjuration",cast:"1 Action",range:"Touch",duration:"Concentration, up to 1 hour",desc:"This spell turns the flesh of a willing creature you touch as hard as stone. Until the spell ends, the target has resistance to nonmagical bludgeoning, piercing, and slashing damage.",upcast:""},
  "Wall of Fire":{lvl:4,school:"Evocation",cast:"1 Action",range:"120 ft",duration:"Concentration, up to 1 minute",desc:"You create a wall of fire on a solid surface within range. The wall can be up to 60 feet long, 20 feet high, and 1 foot thick, or a ringed wall up to 20 feet in diameter, 20 feet high, and 1 foot thick. The wall is opaque and lasts for the duration. When the wall appears, each creature within its area must make a Dexterity saving throw. On a failed save, a creature takes 5d8 fire damage, or half as much damage on a successful save.",upcast:"Damage increases by 1d8 for each slot level above 4th."},
  // ── LEVEL 5 ──
  "Animate Objects":{lvl:5,school:"Transmutation",cast:"1 Action",range:"120 ft",duration:"Concentration, up to 1 minute",desc:"Objects come to life at your command. Choose up to ten nonmagical objects within range that are not being worn or carried. Medium targets count as two objects, Large targets count as four objects, Huge targets count as eight objects. You can't animate any object larger than Huge. Each target animates and becomes a creature under your control until the spell ends or until reduced to 0 hit points.",upcast:"You can animate two additional objects for each slot level above 5th."},
  "Awaken":{lvl:5,school:"Transmutation",cast:"8 Hours",range:"Touch",duration:"Instantaneous",desc:"After spending the casting time tracing magical pathways within a precious gemstone, you touch a Huge or smaller beast or plant. The target must have either no Intelligence score or an Intelligence of 3 or less. The target gains an Intelligence of 10. The target also gains the ability to speak one language you know.",upcast:""},
  "Cloudkill":{lvl:5,school:"Conjuration",cast:"1 Action",range:"120 ft",duration:"Concentration, up to 10 minutes",desc:"You create a 20-foot-radius sphere of poisonous, yellow-green fog centered on a point you choose within range. The fog spreads around corners. It lasts for the duration or until strong wind disperses the fog, ending the spell. Its area is heavily obscured. When a creature enters the spell's area for the first time on a turn or starts its turn there, that creature must make a Constitution saving throw. The creature takes 5d8 poison damage on a failed save, or half as much damage on a successful one.",upcast:"Damage increases by 1d8 for each slot level above 5th."},
  "Cone of Cold":{lvl:5,school:"Evocation",cast:"1 Action",range:"Self (60-ft cone)",duration:"Instantaneous",desc:"A blast of cold air erupts from your hands. Each creature in a 60-foot cone must make a Constitution saving throw. A creature takes 8d8 cold damage on a failed save, or half as much damage on a successful one. A creature killed by this spell becomes a frozen statue until it thaws.",upcast:"Damage increases by 1d8 for each slot level above 5th."},
  "Dominate Person":{lvl:5,school:"Enchantment",cast:"1 Action",range:"60 ft",duration:"Concentration, up to 1 minute",desc:"You attempt to beguile a humanoid that you can see within range. It must succeed on a Wisdom saving throw or be charmed by you for the duration. While the target is charmed, you have a telepathic link with it as long as the two of you are on the same plane of existence.",upcast:"Duration increases: 10 minutes at 6th, 1 hour at 7th, 8 hours at 8th+."},
  "Dream":{lvl:5,school:"Illusion",cast:"1 Minute",range:"Special",duration:"8 hours",desc:"This spell shapes a creature's dreams. Choose a creature known to you as the target of this spell. The target must be on the same plane of existence as you. Creatures that don't sleep, such as elves, can't be contacted by this spell. You, or a willing creature you touch, enters a trance state, acting as a messenger.",upcast:""},
  "Geas":{lvl:5,school:"Enchantment",cast:"1 Minute",range:"60 ft",duration:"30 days",desc:"You place a magical command on a creature that you can see within range, forcing it to carry out some service or refrain from some action or course of activity as you decide. If the creature can understand you, it must succeed on a Wisdom saving throw or become charmed by you for the duration.",upcast:"Duration increases: 1 year at 7th, permanent at 9th."},
  "Greater Restoration":{lvl:5,school:"Abjuration",cast:"1 Action",range:"Touch",duration:"Instantaneous",desc:"You imbue a creature you touch with positive energy to undo a debilitating effect. You can reduce the target's exhaustion level by one, or end one of the following effects on the target: one effect that charmed or petrified the target, one curse including the attunement to a cursed magic item, any reduction to one of the target's ability scores, or one effect reducing the target's hit point maximum.",upcast:""},
  "Hold Monster":{lvl:5,school:"Enchantment",cast:"1 Action",range:"90 ft",duration:"Concentration, up to 1 minute",desc:"Choose a creature that you can see within range. The target must succeed on a Wisdom saving throw or be paralyzed for the duration. This spell has no effect on undead. At the end of each of its turns, the target can make another Wisdom saving throw. On a success, the spell ends on the target.",upcast:"You can target one additional creature for each slot level above 5th."},
  "Insect Plague":{lvl:5,school:"Conjuration",cast:"1 Action",range:"300 ft",duration:"Concentration, up to 10 minutes",desc:"Swarming, biting locusts fill a 20-foot-radius sphere centered on a point you choose within range. The sphere spreads around corners. The sphere remains for the duration, and its area is lightly obscured. The sphere's area is difficult terrain. When the area appears, each creature in it must make a Constitution saving throw. A creature takes 4d10 piercing damage on a failed save, or half as much damage on a successful one.",upcast:"Damage increases by 1d10 for each slot level above 5th."},
  "Legend Lore":{lvl:5,school:"Divination",cast:"10 Minutes",range:"Self",duration:"Instantaneous",desc:"Name or describe a person, place, or object. The spell brings to your mind a brief summary of the significant lore about the thing you named. The lore might consist of current tales, forgotten stories, or even secret lore that has never been widely known.",upcast:""},
  "Mass Cure Wounds":{lvl:5,school:"Evocation",cast:"1 Action",range:"60 ft",duration:"Instantaneous",desc:"A wave of healing energy washes out from a point of your choice within range. Choose up to six creatures in a 30-foot-radius sphere centered on that point. Each target regains hit points equal to 3d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs.",upcast:"Healing increases by 1d8 for each slot level above 5th."},
  "Modify Memory":{lvl:5,school:"Enchantment",cast:"1 Action",range:"30 ft",duration:"Concentration, up to 1 minute",desc:"You attempt to reshape another creature's memories. One creature that you can see must make a Wisdom saving throw. If you are fighting the creature, it has advantage on the saving throw. On a failed save, the target becomes charmed by you for the duration. The charmed target is incapacitated and unaware of its surroundings, though it can still hear you.",upcast:"You can alter the target's memories of an event that took place up to 7 days ago (6th level), 30 days ago (7th), 1 year ago (8th), or any time in the creature's past (9th)."},
  "Raise Dead":{lvl:5,school:"Necromancy",cast:"1 Hour",range:"Touch",duration:"Instantaneous",desc:"You return a dead creature you touch to life, provided that it has been dead no longer than 10 days. If the creature's soul is both willing and at liberty to rejoin the body, the creature returns to life with 1 hit point. This spell also neutralizes any poisons and cures nonmagical diseases that affected the creature at the time it died.",upcast:""},
  "Scrying":{lvl:5,school:"Divination",cast:"10 Minutes",range:"Self",duration:"Concentration, up to 10 minutes",desc:"You can see and hear a particular creature you choose that is on the same plane of existence as you. The target must make a Wisdom saving throw, which is modified by how well you know the target and the sort of physical connection you have to it.",upcast:""},
  "Telekinesis":{lvl:5,school:"Transmutation",cast:"1 Action",range:"60 ft",duration:"Concentration, up to 10 minutes",desc:"You gain the ability to move or manipulate creatures or objects by thought. When you cast the spell, and as your action each round for the duration, you can exert your will on one creature or object that you can see within range, causing the appropriate effect below. You can affect the same target round after round, or choose a new one at any time.",upcast:""},
  "Teleportation Circle":{lvl:5,school:"Conjuration",cast:"1 Minute",range:"10 ft",duration:"1 round",desc:"As you cast the spell, you draw a 10-foot-diameter circle on the ground inscribed with sigils that link your location to a permanent teleportation circle of your choice whose sigil sequence you know and that is on the same plane of existence as you. A shimmering portal opens within the circle you drew and remains open until the end of your next turn.",upcast:""},
  "Wall of Stone":{lvl:5,school:"Evocation",cast:"1 Action",range:"120 ft",duration:"Concentration, up to 10 minutes",desc:"A nonmagical wall of solid stone springs into existence at a point you choose within range. The wall is 6 inches thick and is composed of ten 10-foot-by-10-foot panels. Each panel must be contiguous with at least one other panel. Alternatively, you can create 10-foot-by-20-foot panels that are only 3 inches thick.",upcast:""},
  // ── LEVELS 6-9 (abbreviated but complete) ──
  "Arcane Gate":{lvl:6,school:"Conjuration",cast:"1 Action",range:"500 ft",duration:"Concentration, up to 10 minutes",desc:"You create linked teleportation portals that remain open for the duration. Choose two points on the ground that you can see, one point within 10 feet of you and one point within 500 feet of you. A circular portal, 10 feet in diameter, opens over each point.",upcast:""},
  "Chain Lightning":{lvl:6,school:"Evocation",cast:"1 Action",range:"150 ft",duration:"Instantaneous",desc:"You create a bolt of lightning that arcs toward a target of your choice that you can see within range. Three bolts then leap from that target to as many as three other targets, each of which must be within 30 feet of the first target. A target can be a creature or an object and can be targeted by only one of the bolts. A target must make a Dexterity saving throw. The target takes 10d8 lightning damage on a failed save, or half as much damage on a successful one.",upcast:"One additional bolt leaps from the first target to another target for each slot level above 6th."},
  "Circle of Death":{lvl:6,school:"Necromancy",cast:"1 Action",range:"150 ft",duration:"Instantaneous",desc:"A sphere of negative energy ripples out in a 60-foot-radius sphere from a point within range. Each creature in that area must make a Constitution saving throw. A target takes 8d6 necrotic damage on a failed save, or half as much damage on a successful one.",upcast:"Damage increases by 2d6 for each slot level above 6th."},
  "Disintegrate":{lvl:6,school:"Transmutation",cast:"1 Action",range:"60 ft",duration:"Instantaneous",desc:"A thin green ray springs from your pointing finger to a target you can see within range. The target can be a creature, an object, or a creation of magical force, such as the wall created by wall of force. A creature targeted by this spell must make a Dexterity saving throw. On a failed save, the target takes 10d6 + 40 force damage. The target is disintegrated if this damage leaves it with 0 hit points.",upcast:"Damage increases by 3d6 for each slot level above 6th."},
  "Eyebite":{lvl:6,school:"Necromancy",cast:"1 Action",range:"Self",duration:"Concentration, up to 1 minute",desc:"For the spell's duration, your eyes become an inky void imbued with dread power. One creature of your choice within 60 feet of you that you can see must succeed on a Wisdom saving throw or be affected until the spell ends. On a failed save you can make a target asleep, panicked, or sickened.",upcast:""},
  "Globe of Invulnerability":{lvl:6,school:"Abjuration",cast:"1 Action",range:"Self (10-ft radius)",duration:"Concentration, up to 1 minute",desc:"An immobile, faintly shimmering barrier springs into existence in a 10-foot radius around you and remains for the duration. Any spell of 5th level or lower cast from outside the barrier can't affect creatures or objects within it, even if the spell is cast using a higher level spell slot.",upcast:"The barrier blocks spells of one level higher for each slot level above 6th."},
  "Heal":{lvl:6,school:"Evocation",cast:"1 Action",range:"60 ft",duration:"Instantaneous",desc:"Choose a creature that you can see within range. A surge of positive energy washes through the creature, causing it to regain 70 hit points. This spell also ends blindness, deafness, and any diseases affecting the target.",upcast:"Healing increases by 10 for each slot level above 6th."},
  "Heroes' Feast":{lvl:6,school:"Conjuration",cast:"10 Minutes",range:"30 ft",duration:"Instantaneous",desc:"You bring forth a great feast, including magnificent food and drink. The feast takes 1 hour to consume and disappears at the end of that time, and the beneficial effects don't set in until this hour is over. Up to twelve other creatures can partake of the feast. For the next 24 hours, each creature is immune to poison and disease, immune to being frightened, makes all Wisdom saving throws with advantage, and gains 2d10 temporary hit points.",upcast:""},
  "Mass Suggestion":{lvl:6,school:"Enchantment",cast:"1 Action",range:"60 ft",duration:"24 hours",desc:"You suggest a course of activity (limited to a sentence or two) and magically influence up to twelve creatures of your choice that you can see within range and that can hear and understand you. Creatures that can't be charmed are immune to this effect. The suggestion must be worded in such a manner as to make the course of action sound reasonable.",upcast:"Duration increases to 10 days at 7th, 30 days at 8th, 180 days at 9th."},
  "Sunbeam":{lvl:6,school:"Evocation",cast:"1 Action",range:"Self (60-ft line)",duration:"Concentration, up to 1 minute",desc:"A beam of brilliant light flashes out from your hand in a 5-foot-wide, 60-foot-long line. Each creature in the line must make a Constitution saving throw. On a failed save, a creature takes 6d8 radiant damage and is blinded until your next turn. On a successful save, it takes half as much damage and isn't blinded by this spell.",upcast:""},
  "True Seeing":{lvl:6,school:"Divination",cast:"1 Action",range:"Touch",duration:"1 hour",desc:"You give the willing creature you touch the ability to see things as they actually are. For the duration, the creature has truesight, notices secret doors hidden by magic, and can see into the Ethereal Plane, all out to a range of 120 feet.",upcast:""},
  "Delayed Blast Fireball":{lvl:7,school:"Evocation",cast:"1 Action",range:"150 ft",duration:"Concentration, up to 1 minute",desc:"A beam of yellow light flashes from your pointing finger, then condenses to linger at a chosen point within range as a glowing bead for the duration. When the spell ends, either because your concentration is broken or because you decide to end it, the bead blossoms with a low roar into an explosion of flame. Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. The base damage is 12d6 fire.",upcast:"Damage increases by 1d6 for each slot level above 7th."},
  "Etherealness":{lvl:7,school:"Transmutation",cast:"1 Action",range:"Self",duration:"Up to 8 hours",desc:"You step into the border regions of the Ethereal Plane, in the area where it overlaps with your current plane. You remain in the Border Ethereal for the duration or until you use your action to dismiss the spell. During this time, you can move in any direction. If you move up or down, every foot of movement costs an extra foot.",upcast:"You can target up to three willing creatures (including yourself) for each slot level above 7th."},
  "Finger of Death":{lvl:7,school:"Necromancy",cast:"1 Action",range:"60 ft",duration:"Instantaneous",desc:"You send negative energy coursing through a creature that you can see within range, causing it searing pain. The target must make a Constitution saving throw. It takes 7d8 + 30 necrotic damage on a failed save, or half as much damage on a successful one. A humanoid killed by this spell rises at the start of your next turn as a zombie that is permanently under your command.",upcast:""},
  "Forcecage":{lvl:7,school:"Evocation",cast:"1 Action",range:"100 ft",duration:"1 hour",desc:"An immovable, invisible, cube-shaped prison composed of magical force springs into existence around an area you choose within range. The prison can be a cage or a solid box as you choose. A creature inside the cage can't leave it by nonmagical means. If the creature tries to use teleportation or interplanar travel to leave the cage, it must first make a Charisma saving throw.",upcast:""},
  "Plane Shift":{lvl:7,school:"Conjuration",cast:"1 Action",range:"Touch",duration:"Instantaneous",desc:"You and up to eight willing creatures who link hands in a circle are transported to a different plane of existence. You can specify a target destination in general terms, such as the City of Brass on the Elemental Plane of Fire or the palace of Dispater on the second level of the Nine Hells, and you appear in or near that destination.",upcast:""},
  "Regenerate":{lvl:7,school:"Transmutation",cast:"1 Minute",range:"Touch",duration:"1 hour",desc:"You touch a creature and stimulate its natural healing ability. The target regains 4d8 + 15 hit points. For the duration of the spell, the target regains 1 hit point at the start of each of its turns (10 hit points each minute). The target's severed body members (fingers, legs, tails, and so on), if any, are restored after 2 minutes.",upcast:""},
  "Resurrection":{lvl:7,school:"Necromancy",cast:"1 Hour",range:"Touch",duration:"Instantaneous",desc:"You touch a dead creature that has been dead for no more than a century, that didn't die of old age, and that isn't undead. If its soul is free and willing, the target returns to life with all its hit points. This spell neutralizes any poisons and cures normal diseases afflicting the creature when it died.",upcast:""},
  "Symbol":{lvl:7,school:"Abjuration",cast:"1 Minute",range:"Touch",duration:"Until dispelled or triggered",desc:"When you cast this spell, you inscribe a harmful glyph either on a surface (such as a section of floor, a wall, or a table) or within an object that can be closed (such as a book, a scroll, or a treasure chest) to conceal the glyph. The glyph can cover an area no larger than 10 feet in diameter.",upcast:""},
  "Teleport":{lvl:7,school:"Conjuration",cast:"1 Action",range:"10 ft",duration:"Instantaneous",desc:"This spell instantly transports you and up to eight willing creatures of your choice that you can see within range, or a single object that you can see within range, to a destination you select. If you target an object, it must be able to fit entirely inside a 10-foot cube, and it can't be held or carried by an unwilling creature.",upcast:""},
  "Antimagic Field":{lvl:8,school:"Abjuration",cast:"1 Action",range:"Self (10-ft radius)",duration:"Concentration, up to 1 hour",desc:"A 10-foot-radius invisible sphere of antimagic surrounds you. This area is divorced from the magical energy that suffuses the multiverse. Within the sphere, spells can't be cast, summoned creatures disappear, and even magic items become mundane.",upcast:""},
  "Control Weather":{lvl:8,school:"Transmutation",cast:"10 Minutes",range:"Self (5-mile radius)",duration:"Concentration, up to 8 hours",desc:"You take control of the weather within 5 miles of you for the duration. You must be outdoors to cast this spell. Moving to a place where you don't have a clear path to the sky ends the spell early. When you cast the spell, you change the current weather conditions, which are determined by the DM based on the climate and season.",upcast:""},
  "Demiplane":{lvl:8,school:"Conjuration",cast:"1 Action",range:"60 ft",duration:"1 hour",desc:"You create a shadowy door on a flat solid surface that you can see within range. The door is large enough to allow Medium creatures to pass through unhindered. When opened, the door leads to a demiplane that appears to be an empty room 30 feet in each dimension, made of wood or stone.",upcast:""},
  "Dominate Monster":{lvl:8,school:"Enchantment",cast:"1 Action",range:"60 ft",duration:"Concentration, up to 1 hour",desc:"You attempt to beguile a creature that you can see within range. It must succeed on a Wisdom saving throw or be charmed by you for the duration. If you or creatures that are friendly to you are fighting it, it has advantage on the saving throw.",upcast:""},
  "Feeblemind":{lvl:8,school:"Enchantment",cast:"1 Action",range:"150 ft",duration:"Instantaneous",desc:"You blast the mind of a creature you can see within range, attempting to shatter its intellect and personality. The target takes 4d6 psychic damage and must make an Intelligence saving throw. On a failed save, the creature's Intelligence and Charisma scores become 1. The creature can't cast spells, activate magic items, understand language, or communicate in any intelligible way.",upcast:""},
  "Holy Aura":{lvl:8,school:"Abjuration",cast:"1 Action",range:"Self",duration:"Concentration, up to 1 minute",desc:"Divine light washes out from you and coalesces in a soft radiance in a 30-foot radius around you. Creatures of your choice in that radius when you cast this spell and friendly creatures that enter the area shed soft radiance in a 5-foot radius, have advantage on all saving throws, and other creatures have disadvantage on attack rolls against them.",upcast:""},
  "Incendiary Cloud":{lvl:8,school:"Conjuration",cast:"1 Action",range:"150 ft",duration:"Concentration, up to 1 minute",desc:"A swirling cloud of smoke shot through with white-hot embers appears in a 20-foot-radius sphere centered on a point within range. The cloud spreads around corners and is heavily obscured. It lasts for the duration or until a wind of moderate or greater speed (at least 10 miles per hour) disperses it. When the cloud appears, each creature in it must make a Dexterity saving throw. A creature takes 10d8 fire damage on a failed save, or half as much damage on a successful one.",upcast:""},
  "Power Word Stun":{lvl:8,school:"Enchantment",cast:"1 Action",range:"60 ft",duration:"Instantaneous",desc:"You speak a word of power that overwhelms the mind of one creature you can see within range, leaving it dumbfounded. If the target has 150 hit points or fewer, it is stunned. Otherwise, the spell has no effect. The stunned target must make a Constitution saving throw at the end of each of its turns. On a successful save, the stunning effect ends.",upcast:""},
  "Sunburst":{lvl:8,school:"Evocation",cast:"1 Action",range:"150 ft",duration:"Instantaneous",desc:"Brilliant sunlight blazes in a 60-foot radius centered on a point you choose within range. Each creature in that light must make a Constitution saving throw. On a failed save, a creature takes 12d6 radiant damage and is blinded for 1 minute. On a successful save, it takes half as much damage and isn't blinded by this spell.",upcast:""},
  "Astral Projection":{lvl:9,school:"Necromancy",cast:"1 Hour",range:"10 ft",duration:"Special",desc:"You and up to eight willing creatures within range project your astral bodies into the Astral Plane (the spell fails and the casting is wasted if you are already on that plane). The material body you leave behind is unconscious and in a state of suspended animation; it doesn't need food or air and doesn't age.",upcast:""},
  "Foresight":{lvl:9,school:"Divination",cast:"1 Minute",range:"Touch",duration:"8 hours",desc:"You touch a willing creature and bestow a limited ability to see into the immediate future. For the duration, the target can't be surprised and has advantage on attack rolls, ability checks, and saving throws. Additionally, other creatures have disadvantage on attack rolls against the target for the duration.",upcast:""},
  "Gate":{lvl:9,school:"Conjuration",cast:"1 Action",range:"60 ft",duration:"Concentration, up to 1 minute",desc:"You conjure a portal linking an unoccupied space you can see within range to a precise location on a different plane of existence. The portal is a circular opening, which you can make 5 to 20 feet in diameter. You can orient the portal in any direction you choose. The portal lasts for the duration.",upcast:""},
  "Imprisonment":{lvl:9,school:"Abjuration",cast:"1 Minute",range:"30 ft",duration:"Until dispelled",desc:"You create a magical restraint to hold a creature that you can see within range. The target must make a Wisdom saving throw. On a failed save, it is bound by the spell; if it succeeds, it is immune to this spell if you cast it again.",upcast:""},
  "Mass Heal":{lvl:9,school:"Evocation",cast:"1 Action",range:"60 ft",duration:"Instantaneous",desc:"A flood of healing energy flows from you into injured creatures around you. You restore up to 700 hit points, divided as you choose among any number of creatures that you can see within range. Creatures healed by this spell are also cured of all diseases and any effect making them blinded or deafened.",upcast:""},
  "Meteor Swarm":{lvl:9,school:"Evocation",cast:"1 Action",range:"1 mile",duration:"Instantaneous",desc:"Blazing orbs of fire plummet to the ground at four different points you can see within range. Each creature in a 40-foot-radius sphere centered on each point you choose must make a Dexterity saving throw. The sphere spreads around corners. A creature takes 20d6 fire damage and 20d6 bludgeoning damage on a failed save, or half as much damage on a successful one.",upcast:""},
  "Power Word Kill":{lvl:9,school:"Enchantment",cast:"1 Action",range:"60 ft",duration:"Instantaneous",desc:"You utter a word of power that can compel one creature you can see within range to die instantly. If the creature you choose has 100 hit points or fewer, it dies. Otherwise, the spell has no effect.",upcast:""},
  "Time Stop":{lvl:9,school:"Transmutation",cast:"1 Action",range:"Self",duration:"Instantaneous",desc:"You briefly stop the flow of time for everyone but yourself. No time passes for other creatures, while you take 1d4 + 1 turns in a row, during which you can use actions and move as normal. This effect ends if one of the actions you use during this period, or any effects that you create during this period, affects a creature other than you or an object being worn or carried by someone other than you.",upcast:""},
  "True Polymorph":{lvl:9,school:"Transmutation",cast:"1 Action",range:"30 ft",duration:"Concentration, up to 1 hour",desc:"Choose one creature or nonmagical object that you can see within range. You transform the creature into a different creature, the creature into an object, or the object into a creature (the object must be neither worn nor carried by another creature). The transformation lasts for the duration, or until the target drops to 0 hit points or dies. If you concentrate on this spell for the full duration, the transformation lasts until it is dispelled.",upcast:""},
  "True Resurrection":{lvl:9,school:"Necromancy",cast:"1 Hour",range:"Touch",duration:"Instantaneous",desc:"You touch a creature that has been dead for no longer than 200 years and that died for any reason except old age. If the creature's soul is free and willing, the creature is restored to life with all its hit points. This spell closes all wounds, neutralizes any poison, cures all diseases, and lifts any curses affecting the creature when it died.",upcast:""},
  "Weird":{lvl:9,school:"Illusion",cast:"1 Action",range:"120 ft",duration:"Concentration, up to 1 minute",desc:"Drawing on the deepest fears of a group of creatures, you create illusory creatures in their minds, visible only to them. Each creature in a 30-foot-radius sphere centered on a point of your choice within range must make a Wisdom saving throw. On a failed save, the creature becomes frightened for the duration. The illusion calls on the creature's deepest fears, manifesting its worst nightmares as an implacable threat.",upcast:""},
  "Wish":{lvl:9,school:"Conjuration",cast:"1 Action",range:"Self",duration:"Instantaneous",desc:"Wish is the mightiest spell a mortal creature can cast. By simply speaking aloud, you can alter the very foundations of reality in accord with your desires. The basic use of this spell is to duplicate any other spell of 8th level or lower. You don't need to meet any requirements in that spell, including costly components.",upcast:""},
  "Psychic Scream":{lvl:9,school:"Enchantment",cast:"1 Action",range:"90 ft",duration:"Instantaneous",desc:"You unleash the power of your mind to blast the intellect of up to ten creatures of your choice that you can see within range. Creatures that have an Intelligence score of 2 or lower are unaffected. Each target must make an Intelligence saving throw. On a failed save, a target takes 14d6 psychic damage and is stunned. On a successful save, a target takes half as much damage and isn't stunned.",upcast:""},
  "Power Word Heal":{lvl:9,school:"Evocation",cast:"1 Action",range:"Touch",duration:"Instantaneous",desc:"A wave of healing energy washes over the creature you touch. The target regains all its hit points. If the creature is charmed, frightened, paralyzed, or stunned, the condition ends. If the creature is prone, it can use its reaction to stand up. This spell has no effect on undead or constructs.",upcast:""},
  "Storm of Vengeance":{lvl:9,school:"Conjuration",cast:"1 Action",range:"Sight",duration:"Concentration, up to 1 minute",desc:"A churning storm cloud forms, centered on a point you can see and spreading to a radius of 360 feet. Lightning flashes in the area, thunder booms, and strong winds roar. Each creature under the cloud (no more than 5,000 feet beneath the cloud) when it appears must make a Constitution saving throw. On a failed save, a creature takes 2d6 thunder damage and becomes deafened for 5 minutes.",upcast:""},
  "Shapechange":{lvl:9,school:"Transmutation",cast:"1 Action",range:"Self",duration:"Concentration, up to 1 hour",desc:"You assume the form of a different creature for the duration. The new form can be of any creature with a challenge rating equal to your level or lower. The creature can't be a construct or an undead, and you must have seen the sort of creature at least once. You transform into the average example of that creature.",upcast:""},
  "Prismatic Wall":{lvl:9,school:"Abjuration",cast:"1 Action",range:"60 ft",duration:"10 minutes",desc:"A shimmering, multicolored plane of light forms a vertical opaque wall—up to 90 feet long, 30 feet high, and 1 inch thick—centered on a point you can see within range. Alternatively, you can shape the wall into a sphere up to 30 feet in diameter centered on a point you choose within range.",upcast:""},
};

// ─── CLASS SPELL LISTS ────────────────────────────────────────────────────────
const CLASS_SPELLS = {
  Bard:{casting:"CHA",slots:"full",spells:{0:["Blade Ward","Dancing Lights","Friends","Light","Mage Hand","Mending","Message","Minor Illusion","Prestidigitation","Thunderclap","True Strike","Vicious Mockery"],1:["Animal Friendship","Bane","Charm Person","Command","Comprehend Languages","Cure Wounds","Detect Magic","Disguise Self","Dissonant Whispers","Faerie Fire","Feather Fall","Healing Word","Heroism","Identify","Illusory Script","Longstrider","Silent Image","Sleep","Speak with Animals","Thunderwave","Unseen Servant"],2:["Aid","Animal Messenger","Blindness/Deafness","Calm Emotions","Cloud of Daggers","Crown of Madness","Detect Thoughts","Enhance Ability","Enthrall","Heat Metal","Hold Person","Invisibility","Knock","Lesser Restoration","Locate Animals or Plants","Locate Object","Magic Mouth","Phantasmal Force","See Invisibility","Shatter","Silence","Suggestion","Zone of Truth"],3:["Bestow Curse","Clairvoyance","Dispel Magic","Fear","Feign Death","Glyph of Warding","Hypnotic Pattern","Leomund's Tiny Hut","Major Image","Mass Healing Word","Nondetection","Plant Growth","Sending","Slow","Speak with Dead","Tongues","Stinking Cloud"],4:["Compulsion","Confusion","Dimension Door","Freedom of Movement","Greater Invisibility","Hallucinatory Terrain","Locate Creature","Phantasmal Killer","Polymorph"],5:["Animate Objects","Awaken","Dominate Person","Dream","Geas","Greater Restoration","Hold Monster","Legend Lore","Mass Cure Wounds","Mislead","Modify Memory","Raise Dead","Scrying","Seeming","Teleportation Circle"],6:["Eyebite","Find the Path","Mass Suggestion","Otto's Irresistible Dance","Programmed Illusion","True Seeing"],7:["Etherealness","Forcecage","Mirage Arcane","Mordenkainen's Sword","Project Image","Regenerate","Resurrection","Symbol","Teleport"],8:["Dominate Monster","Feeblemind","Glibness","Mind Blank","Power Word Stun"],9:["Foresight","Power Word Heal","Power Word Kill","Psychic Scream","True Polymorph"]}},
  Cleric:{casting:"WIS",slots:"full",spells:{0:["Guidance","Light","Mending","Resistance","Sacred Flame","Spare the Dying","Thaumaturgy","Toll the Dead","Word of Radiance"],1:["Bane","Bless","Command","Create or Destroy Water","Cure Wounds","Detect Evil and Good","Detect Magic","Detect Poison and Disease","Guiding Bolt","Healing Word","Inflict Wounds","Protection from Evil and Good","Purify Food and Drink","Sanctuary","Shield of Faith"],2:["Aid","Augury","Blindness/Deafness","Calm Emotions","Continual Flame","Enhance Ability","Find Traps","Gentle Repose","Hold Person","Lesser Restoration","Locate Object","Prayer of Healing","Protection from Poison","Silence","Spiritual Weapon","Warding Bond","Zone of Truth"],3:["Animate Dead","Beacon of Hope","Bestow Curse","Clairvoyance","Create Food and Water","Daylight","Dispel Magic","Feign Death","Glyph of Warding","Magic Circle","Mass Healing Word","Meld into Stone","Protection from Energy","Remove Curse","Revivify","Sending","Speak with Dead","Spirit Guardians","Tongues","Water Walk"],4:["Banishment","Control Water","Death Ward","Divination","Freedom of Movement","Guardian of Faith","Locate Creature","Stone Shape"],5:["Commune","Contagion","Dawn","Dispel Evil and Good","Flame Strike","Geas","Greater Restoration","Hallow","Insect Plague","Legend Lore","Mass Cure Wounds","Planar Binding","Raise Dead","Scrying","Summon Celestial"],6:["Blade Barrier","Create Undead","Find the Path","Forbiddance","Harm","Heal","Heroes' Feast","Planar Ally","True Seeing","Word of Recall"],7:["Conjure Celestial","Divine Word","Etherealness","Fire Storm","Plane Shift","Regenerate","Resurrection","Symbol"],8:["Antimagic Field","Control Weather","Earthquake","Holy Aura"],9:["Astral Projection","Gate","Mass Heal","True Resurrection"]}},
  Druid:{casting:"WIS",slots:"full",spells:{0:["Druidcraft","Elementalism","Guidance","Mending","Poison Spray","Produce Flame","Resistance","Shape Water","Shillelagh","Spare the Dying","Starry Wisp","Thunderclap"],1:["Animal Friendship","Charm Person","Create or Destroy Water","Cure Wounds","Detect Magic","Detect Poison and Disease","Entangle","Faerie Fire","Fog Cloud","Goodberry","Healing Word","Ice Knife","Jump","Longstrider","Purify Food and Drink","Speak with Animals","Thunderwave"],2:["Aid","Animal Messenger","Augury","Barkskin","Beast Sense","Continual Flame","Darkvision","Enhance Ability","Enlarge/Reduce","Find Traps","Flame Blade","Flaming Sphere","Gust of Wind","Heat Metal","Hold Person","Lesser Restoration","Locate Animals or Plants","Locate Object","Moonbeam","Pass without Trace","Protection from Poison","Spike Growth","Summon Beast"],3:["Aura of Vitality","Call Lightning","Conjure Animals","Daylight","Dispel Magic","Erupting Earth","Feign Death","Meld into Stone","Plant Growth","Protection from Energy","Revivify","Sleet Storm","Speak with Plants","Summon Fey","Water Breathing","Water Walk","Wind Wall"],4:["Blight","Charm Monster","Confusion","Conjure Minor Elementals","Conjure Woodland Beings","Control Water","Dominate Beast","Freedom of Movement","Giant Insect","Grasping Vine","Hallucinatory Terrain","Ice Storm","Locate Creature","Polymorph","Stone Shape","Stoneskin","Summon Elemental","Wall of Fire"],5:["Antilife Shell","Awaken","Commune with Nature","Cone of Cold","Contagion","Control Winds","Geas","Greater Restoration","Insect Plague","Mass Cure Wounds","Planar Binding","Reincarnate","Scrying","Tree Stride","Wall of Stone","Wrath of Nature"],6:["Bones of the Earth","Conjure Fey","Find the Path","Flesh to Stone","Heal","Heroes' Feast","Move Earth","Sunbeam","Transport via Plants","True Seeing","Wall of Thorns","Wind Walk"],7:["Fire Storm","Mirage Arcane","Plane Shift","Regenerate","Reverse Gravity","Symbol"],8:["Animal Shapes","Antipathy/Sympathy","Control Weather","Earthquake","Feeblemind","Sunburst"],9:["Foresight","Shapechange","Storm of Vengeance","True Resurrection"]}},
  Paladin:{casting:"CHA",slots:"half",spells:{1:["Bless","Command","Compelled Duel","Cure Wounds","Detect Evil and Good","Detect Magic","Detect Poison and Disease","Divine Favor","Divine Smite","Heroism","Protection from Evil and Good","Purify Food and Drink","Sanctuary","Searing Smite","Shield of Faith","Thunderous Smite","Wrathful Smite"],2:["Aid","Branding Smite","Find Steed","Gentle Repose","Lesser Restoration","Locate Object","Magic Weapon","Prayer of Healing","Protection from Poison","Warding Bond","Zone of Truth"],3:["Aura of Vitality","Blinding Smite","Create Food and Water","Daylight","Dispel Magic","Elemental Weapon","Magic Circle","Remove Curse","Revivify","Speak with Dead"],4:["Aura of Life","Aura of Purity","Banishment","Death Ward","Locate Creature","Staggering Smite"],5:["Banishing Smite","Circle of Power","Destructive Wave","Dispel Evil and Good","Geas","Holy Weapon","Raise Dead","Summon Celestial"]}},
  Ranger:{casting:"WIS",slots:"half",spells:{1:["Alarm","Animal Friendship","Cure Wounds","Detect Magic","Detect Poison and Disease","Ensnaring Strike","Entangle","Fog Cloud","Goodberry","Hail of Thorns","Hunter's Mark","Jump","Longstrider","Speak with Animals"],2:["Animal Messenger","Barkskin","Beast Sense","Cordon of Arrows","Darkvision","Find Traps","Gust of Wind","Lesser Restoration","Locate Animals or Plants","Locate Object","Pass without Trace","Protection from Poison","Silence","Spike Growth","Summon Beast"],3:["Conjure Animals","Conjure Barrage","Daylight","Dispel Magic","Elemental Weapon","Lightning Arrow","Nondetection","Plant Growth","Protection from Energy","Revivify","Speak with Plants","Summon Fey","Water Breathing","Water Walk","Wind Wall"],4:["Dominate Beast","Freedom of Movement","Grasping Vine","Guardian of Nature","Locate Creature","Stoneskin","Summon Elemental"],5:["Commune with Nature","Conjure Volley","Swift Quiver","Tree Stride","Wrath of Nature"]}},
  Sorcerer:{casting:"CHA",slots:"full",spells:{0:["Acid Splash","Blade Ward","Chill Touch","Dancing Lights","Elementalism","Fire Bolt","Friends","Light","Mage Hand","Mending","Message","Minor Illusion","Poison Spray","Prestidigitation","Ray of Frost","Shocking Grasp","Thunderclap","True Strike"],1:["Burning Hands","Charm Person","Chromatic Orb","Color Spray","Comprehend Languages","Detect Magic","Disguise Self","Expeditious Retreat","False Life","Feather Fall","Fog Cloud","Jump","Mage Armor","Magic Missile","Shield","Silent Image","Sleep","Thunderwave","Witch Bolt"],2:["Alter Self","Blindness/Deafness","Blur","Cloud of Daggers","Crown of Madness","Darkness","Darkvision","Detect Thoughts","Enhance Ability","Enlarge/Reduce","Gust of Wind","Hold Person","Invisibility","Knock","Levitate","Mirror Image","Misty Step","Phantasmal Force","Scorching Ray","See Invisibility","Shatter","Spider Climb","Suggestion","Web"],3:["Blink","Clairvoyance","Counterspell","Daylight","Dispel Magic","Fear","Fireball","Fly","Gaseous Form","Haste","Hypnotic Pattern","Lightning Bolt","Major Image","Protection from Energy","Slow","Stinking Cloud","Tongues","Water Breathing","Water Walk"],4:["Banishment","Blight","Confusion","Dimension Door","Dominate Beast","Fire Shield","Greater Invisibility","Ice Storm","Polymorph","Stoneskin","Wall of Fire"],5:["Animate Objects","Cloudkill","Cone of Cold","Creation","Dominate Person","Hold Monster","Insect Plague","Seeming","Telekinesis","Teleportation Circle","Wall of Stone"],6:["Arcane Gate","Chain Lightning","Circle of Death","Disintegrate","Eyebite","Globe of Invulnerability","Mass Suggestion","Move Earth","Sunbeam","True Seeing"],7:["Delayed Blast Fireball","Etherealness","Finger of Death","Fire Storm","Plane Shift","Prismatic Spray","Reverse Gravity","Teleport"],8:["Dominate Monster","Earthquake","Incendiary Cloud","Power Word Stun","Sunburst"],9:["Gate","Meteor Swarm","Power Word Kill","Time Stop","Wish"]}},
  Warlock:{casting:"CHA",slots:"pact",spells:{0:["Blade Ward","Chill Touch","Eldritch Blast","Friends","Mage Hand","Minor Illusion","Poison Spray","Prestidigitation","True Strike"],1:["Armor of Agathys","Arms of Hadar","Charm Person","Comprehend Languages","Expeditious Retreat","Hellish Rebuke","Hex","Illusory Script","Protection from Evil and Good","Unseen Servant","Witch Bolt"],2:["Cloud of Daggers","Crown of Madness","Darkness","Enthrall","Hold Person","Invisibility","Mirror Image","Misty Step","Ray of Enfeeblement","Shatter","Spider Climb","Suggestion"],3:["Counterspell","Dispel Magic","Fear","Fly","Gaseous Form","Hunger of Hadar","Hypnotic Pattern","Magic Circle","Major Image","Remove Curse","Summon Fey","Tongues","Vampiric Touch"],4:["Banishment","Blight","Dimension Door","Hallucinatory Terrain","Summon Aberration"],5:["Contact Other Plane","Dream","Hold Monster","Scrying","Teleportation Circle"],6:["Arcane Gate","Circle of Death","Conjure Fey","Create Undead","Eyebite","Flesh to Stone","Mass Suggestion","True Seeing"],7:["Etherealness","Finger of Death","Forcecage","Plane Shift"],8:["Demiplane","Dominate Monster","Feeblemind","Glibness","Power Word Stun"],9:["Astral Projection","Foresight","Gate","Imprisonment","Power Word Kill","True Polymorph","Weird"]}},
  Wizard:{casting:"INT",slots:"full",spells:{0:["Acid Splash","Blade Ward","Chill Touch","Dancing Lights","Elementalism","Fire Bolt","Friends","Light","Mage Hand","Mending","Message","Minor Illusion","Poison Spray","Prestidigitation","Ray of Frost","Shocking Grasp","Thunderclap","True Strike"],1:["Alarm","Burning Hands","Charm Person","Chromatic Orb","Color Spray","Comprehend Languages","Detect Magic","Disguise Self","Expeditious Retreat","False Life","Feather Fall","Find Familiar","Fog Cloud","Grease","Ice Knife","Identify","Illusory Script","Jump","Longstrider","Mage Armor","Magic Missile","Protection from Evil and Good","Ray of Sickness","Shield","Silent Image","Sleep","Thunderwave","Unseen Servant","Witch Bolt"],2:["Alter Self","Arcane Lock","Blindness/Deafness","Blur","Cloud of Daggers","Continual Flame","Crown of Madness","Darkness","Darkvision","Detect Thoughts","Enlarge/Reduce","Flaming Sphere","Gentle Repose","Gust of Wind","Hold Person","Invisibility","Knock","Levitate","Locate Object","Magic Mouth","Magic Weapon","Melf's Acid Arrow","Mirror Image","Misty Step","Phantasmal Force","Ray of Enfeeblement","Rope Trick","Scorching Ray","See Invisibility","Shatter","Spider Climb","Suggestion","Web"],3:["Animate Dead","Bestow Curse","Blink","Clairvoyance","Counterspell","Dispel Magic","Fear","Fireball","Fly","Gaseous Form","Glyph of Warding","Haste","Hypnotic Pattern","Leomund's Tiny Hut","Lightning Bolt","Magic Circle","Major Image","Nondetection","Phantom Steed","Protection from Energy","Remove Curse","Sending","Slow","Stinking Cloud","Tongues","Vampiric Touch","Water Breathing"],4:["Arcane Eye","Banishment","Blight","Confusion","Conjure Minor Elementals","Control Water","Dimension Door","Evard's Black Tentacles","Fabricate","Fire Shield","Greater Invisibility","Hallucinatory Terrain","Ice Storm","Leomund's Secret Chest","Locate Creature","Mordenkainen's Faithful Hound","Mordenkainen's Private Sanctum","Otiluke's Resilient Sphere","Phantasmal Killer","Polymorph","Stone Shape","Stoneskin","Vitriolic Sphere","Wall of Fire"],5:["Animate Objects","Bigby's Hand","Cloudkill","Cone of Cold","Conjure Elemental","Contact Other Plane","Creation","Dominate Person","Dream","Geas","Hold Monster","Legend Lore","Mislead","Modify Memory","Passwall","Planar Binding","Rary's Telepathic Bond","Scrying","Seeming","Telekinesis","Teleportation Circle","Wall of Force","Wall of Stone"],6:["Arcane Gate","Chain Lightning","Circle of Death","Contingency","Create Undead","Disintegrate","Drawmij's Instant Summons","Eyebite","Flesh to Stone","Globe of Invulnerability","Guards and Wards","Magic Jar","Mass Suggestion","Move Earth","Otiluke's Freezing Sphere","Otto's Irresistible Dance","Programmed Illusion","Sunbeam","True Seeing","Wall of Ice"],7:["Delayed Blast Fireball","Etherealness","Finger of Death","Forcecage","Mirage Arcane","Mordenkainen's Magnificent Mansion","Mordenkainen's Sword","Plane Shift","Prismatic Spray","Project Image","Reverse Gravity","Sequester","Simulacrum","Symbol","Teleport"],8:["Antimagic Field","Antipathy/Sympathy","Clone","Control Weather","Demiplane","Dominate Monster","Feeblemind","Incendiary Cloud","Maze","Mind Blank","Power Word Stun","Sunburst"],9:["Astral Projection","Foresight","Gate","Imprisonment","Meteor Swarm","Power Word Kill","Prismatic Wall","Shapechange","Time Stop","True Polymorph","Weird","Wish"]}},
  Fighter:{casting:"INT",slots:"third",subclassOnly:"Eldritch Knight",spells:{0:["Blade Ward","Booming Blade","Fire Bolt","Green-Flame Blade","Light","Mage Hand","Mind Sliver","Minor Illusion","Ray of Frost","Shocking Grasp","True Strike"],1:["Absorb Elements","Burning Hands","Chromatic Orb","Color Spray","Detect Magic","Disguise Self","Expeditious Retreat","False Life","Feather Fall","Fog Cloud","Grease","Ice Knife","Jump","Longstrider","Mage Armor","Magic Missile","Protection from Evil and Good","Ray of Sickness","Shield","Sleep","Thunderwave","Witch Bolt"],2:["Blindness/Deafness","Blur","Cloud of Daggers","Darkness","Darkvision","Enlarge/Reduce","Hold Person","Invisibility","Levitate","Mirror Image","Misty Step","Scorching Ray","See Invisibility","Shatter","Spider Climb","Web"],3:["Counterspell","Dispel Magic","Fear","Fireball","Fly","Haste","Hypnotic Pattern","Lightning Bolt","Magic Circle","Protection from Energy","Remove Curse","Slow","Tongues","Water Breathing"],4:["Banishment","Blight","Confusion","Dimension Door","Greater Invisibility","Ice Storm","Polymorph","Stoneskin","Wall of Fire"]}},
  Rogue:{casting:"INT",slots:"third",subclassOnly:"Arcane Trickster",spells:{0:["Blade Ward","Booming Blade","Dancing Lights","Fire Bolt","Friends","Green-Flame Blade","Light","Mage Hand","Minor Illusion","Prestidigitation","True Strike"],1:["Charm Person","Color Spray","Comprehend Languages","Disguise Self","Expeditious Retreat","False Life","Feather Fall","Find Familiar","Fog Cloud","Grease","Illusory Script","Jump","Longstrider","Mage Armor","Silent Image","Sleep","Thunderwave","Unseen Servant"],2:["Alter Self","Blur","Crown of Madness","Darkness","Darkvision","Detect Thoughts","Enlarge/Reduce","Hold Person","Invisibility","Knock","Levitate","Mirror Image","Misty Step","Phantasmal Force","See Invisibility","Spider Climb","Suggestion","Web"],3:["Blink","Clairvoyance","Counterspell","Dispel Magic","Fear","Fly","Gaseous Form","Hypnotic Pattern","Major Image","Nondetection","Phantom Steed","Remove Curse","Sending","Slow","Tongues"],4:["Arcane Eye","Confusion","Dimension Door","Greater Invisibility","Hallucinatory Terrain","Phantasmal Killer","Polymorph"]}},
  Barbarian:{casting:null,slots:null,spells:{}},
  Monk:{casting:null,slots:null,spells:{}},
};

// ─── SLOT TABLES ─────────────────────────────────────────────────────────────
const FULL_SLOTS  = [null,{1:2},{1:3},{1:4,2:2},{1:4,2:3},{1:4,2:3,3:2},{1:4,2:3,3:3},{1:4,2:3,3:3,4:1},{1:4,2:3,3:3,4:2},{1:4,2:3,3:3,4:3,5:1},{1:4,2:3,3:3,4:3,5:2},{1:4,2:3,3:3,4:3,5:2,6:1},{1:4,2:3,3:3,4:3,5:2,6:1},{1:4,2:3,3:3,4:3,5:2,6:1,7:1},{1:4,2:3,3:3,4:3,5:2,6:1,7:1},{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1},{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1},{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1,9:1},{1:4,2:3,3:3,4:3,5:3,6:1,7:1,8:1,9:1},{1:4,2:3,3:3,4:3,5:3,6:2,7:1,8:1,9:1},{1:4,2:3,3:3,4:3,5:3,6:2,7:2,8:1,9:1}];
const HALF_SLOTS  = [null,null,{1:2},{1:3},{1:3,2:1},{1:4,2:2},{1:4,2:2},{1:4,2:3},{1:4,2:3},{1:4,2:3,3:2},{1:4,2:3,3:2},{1:4,2:3,3:3},{1:4,2:3,3:3},{1:4,2:3,3:3,4:1},{1:4,2:3,3:3,4:1},{1:4,2:3,3:3,4:2},{1:4,2:3,3:3,4:2},{1:4,2:3,3:3,4:3,5:1},{1:4,2:3,3:3,4:3,5:1},{1:4,2:3,3:3,4:3,5:2},{1:4,2:3,3:3,4:3,5:2}];
const THIRD_SLOTS = [null,null,null,{1:2},{1:3},{1:3},{1:3},{1:4,2:2},{1:4,2:2},{1:4,2:2},{1:4,2:3},{1:4,2:3},{1:4,2:3},{1:4,2:3,3:2},{1:4,2:3,3:2},{1:4,2:3,3:2},{1:4,2:3,3:3},{1:4,2:3,3:3},{1:4,2:3,3:3},{1:4,2:3,3:3,4:1},{1:4,2:3,3:3,4:1}];
const PACT_SLOTS  = [null,{1:1,pL:1},{1:2,pL:1},{2:2,pL:2},{2:2,pL:2},{3:2,pL:3},{3:2,pL:3},{4:2,pL:4},{4:2,pL:4},{5:2,pL:5},{5:2,pL:5},{5:3,pL:5},{5:3,pL:5},{5:3,pL:5},{5:3,pL:5},{5:3,pL:5},{5:3,pL:5},{5:4,pL:5},{5:4,pL:5},{5:4,pL:5},{5:4,pL:5}];

const SCHOOL_COL = {Abjuration:"#3a6ea5",Conjuration:"#7a5c9e",Divination:"#c8952a",Enchantment:"#c44b8a",Evocation:"#b52222",Illusion:"#4a9e7a",Necromancy:"#4a4a4a",Transmutation:"#5c8a3a"};

function getSlots(cls, level) {
  const cd = CLASS_SPELLS[cls];
  if (!cd || !cd.slots) return null;
  if (cd.slots==="full")  return FULL_SLOTS[Math.min(level,20)]||null;
  if (cd.slots==="half")  return level<2?null:HALF_SLOTS[Math.min(level,20)]||null;
  if (cd.slots==="third") return level<3?null:THIRD_SLOTS[Math.min(level,20)]||null;
  if (cd.slots==="pact")  return PACT_SLOTS[Math.min(level,20)]||null;
  return null;
}
function maxSpellLevel(cls, level) {
  const s = getSlots(cls, level);
  if (!s) return 0;
  const pactLvl = s.pL;
  const normalMax = Math.max(0, ...Object.keys(s).filter(k=>k!=="pL").map(Number).filter(k=>s[k]>0));
  return pactLvl ? Math.max(normalMax, pactLvl) : normalMax;
}
function isCaster(cls, sub) {
  if (!cls) return false;
  const cd = CLASS_SPELLS[cls];
  if (!cd || !cd.slots) return false;
  if (cd.subclassOnly) return sub===cd.subclassOnly;
  return true;
}
function getAvailableSpells(cls, level) {
  if (!cls || !CLASS_SPELLS[cls]) return {};
  const cd = CLASS_SPELLS[cls];
  const maxLvl = maxSpellLevel(cls, level);
  const result = {};
  Object.entries(cd.spells).forEach(([l, names]) => {
    const ln = Number(l);
    if (ln === 0 || ln <= maxLvl) result[ln] = names;
  });
  return result;
}

// ─── FEAT DATA (2024 PHB Origin Feats — background-bound + General feats) ────
// Origin feats: each background grants one specific feat at 1st level
// General feats: available at level 4, 8, 12, 16, 19 (or via class features)
const ORIGIN_FEATS = {
  // Background → feat name
  Acolyte:        "Magic Initiate (Cleric)",
  Charlatan:      "Skilled",
  Criminal:       "Alert",
  Entertainer:    "Musician",
  "Folk Hero":    "Crafter",
  "Guild Artisan":"Crafter",
  Hermit:         "Magic Initiate (Druid)",
  Noble:          "Skilled",
  Outlander:      "Tough",
  Sage:           "Magic Initiate (Wizard)",
  Sailor:         "Tavern Brawler",
  Soldier:        "Savage Attacker",
  Urchin:         "Lucky",
  Gladiator:      "Savage Attacker",
  "Haunted One":  "Alert",
  Knight:         "Skilled",
  Pirate:         "Tavern Brawler",
  Spy:            "Alert",
};

const FEAT_DB = {
  // ── ORIGIN FEATS (1st level, from background) ──
  "Alert": {
    type:"origin", prereq:"None",
    desc:"Always on the lookout for danger, you gain the following benefits:\n• Initiative Bonus: You gain a +5 bonus to Initiative.\n• No Surprise: You aren't Surprised while you're conscious.\n• Swap Initiative: Immediately after you roll Initiative, you can swap your Initiative with the Initiative of one willing ally in the same combat. You can't make this swap if you or the ally has the Incapacitated condition.",
    benefit:"+5 Initiative, can't be surprised, can swap Initiative with an ally.",
  },
  "Crafter": {
    type:"origin", prereq:"None",
    desc:"You have a knack for crafting things and always seem to have needed supplies on hand. You gain the following benefits:\n• Tool Proficiency: You gain proficiency with three different Artisan's Tools of your choice.\n• Discount: Whenever you buy a nonmagical item, you receive a 20% discount on it.\n• Faster Crafting: When you craft an item using a tool with which you have proficiency, the required crafting time is halved.",
    benefit:"Proficiency with 3 artisan's tools, 20% discount on nonmagical items, half crafting time.",
  },
  "Lucky": {
    type:"origin", prereq:"None",
    desc:"You have inexplicable luck that seems to kick in at just the right moment. You have 3 Luck Points. Whenever you make a d20 Test, you can spend 1 Luck Point to roll an extra d20 and use the higher result. You can also spend 1 Luck Point when an attack roll is made against you, rolling a d20 and using the lower result. You regain your expended Luck Points when you finish a Long Rest.",
    benefit:"3 Luck Points per Long Rest. Use before or after rolling to add a d20 and take the better result.",
  },
  "Magic Initiate (Cleric)": {
    type:"origin", prereq:"None",
    desc:"You have learned the basics of Cleric magic. You learn two cantrips of your choice from the Cleric spell list, and one 1st-level Cleric spell. You can cast that 1st-level spell once per Long Rest using this feat (without a spell slot). Your spellcasting ability for these spells is Wisdom.",
    benefit:"2 Cleric cantrips + 1 Cleric 1st-level spell (cast once/Long Rest, WIS-based).",
  },
  "Magic Initiate (Druid)": {
    type:"origin", prereq:"None",
    desc:"You have learned the basics of Druid magic. You learn two cantrips of your choice from the Druid spell list, and one 1st-level Druid spell. You can cast that 1st-level spell once per Long Rest using this feat (without a spell slot). Your spellcasting ability for these spells is Wisdom.",
    benefit:"2 Druid cantrips + 1 Druid 1st-level spell (cast once/Long Rest, WIS-based).",
  },
  "Magic Initiate (Wizard)": {
    type:"origin", prereq:"None",
    desc:"You have learned the basics of Wizard magic. You learn two cantrips of your choice from the Wizard spell list, and one 1st-level Wizard spell. You can cast that 1st-level spell once per Long Rest using this feat (without a spell slot). Your spellcasting ability for these spells is Intelligence.",
    benefit:"2 Wizard cantrips + 1 Wizard 1st-level spell (cast once/Long Rest, INT-based).",
  },
  "Musician": {
    type:"origin", prereq:"None",
    desc:"You are a practiced musician, granting you the following benefits:\n• Instrument Training: You gain proficiency with three Musical Instruments of your choice.\n• Inspiring Song: As you finish a Short or Long Rest, you can play a song on a Musical Instrument with which you have proficiency and give Heroic Inspiration to allies who hear the song. The number of allies you can affect equals your Proficiency Bonus.",
    benefit:"Proficiency with 3 instruments. After a Short/Long Rest, grant Heroic Inspiration to allies (up to PB).",
  },
  "Savage Attacker": {
    type:"origin", prereq:"None",
    desc:"You have trained to deal particularly damaging strikes. Once per turn when you hit a target with a weapon, you can roll the weapon's damage dice twice and use either roll against the target.",
    benefit:"Once per turn on a hit: roll weapon damage dice twice, take the higher result.",
  },
  "Skilled": {
    type:"origin", prereq:"None",
    desc:"You have exceptionally broad learning. You gain proficiency in any combination of three skills or tools of your choice.",
    benefit:"Gain proficiency in any 3 skills or tools of your choice.",
  },
  "Tavern Brawler": {
    type:"origin", prereq:"None",
    desc:"Accustomed to rough-and-tumble fighting, you gain the following benefits:\n• Enhanced Unarmed Strike: When you hit with your Unarmed Strike and deal damage, you can deal Bludgeoning damage equal to 1d4 + your Strength modifier, instead of the normal damage.\n• Damage Rerolls: Whenever you roll a damage die for your Unarmed Strike, you can reroll the die if it rolls a 1, and you must use the new roll.\n• Shove: When you hit a creature with an Unarmed Strike as part of the Attack action on your turn, you can deal damage to the target and also push it 5 feet away. Both effects happen whether the creature succeeds or fails its saving throw.\n• Furniture as Weapons: You can wield furniture as a weapon, using the rules of the Greatclub for Small or Medium furniture and the rules of the Maul for Large furniture.",
    benefit:"Unarmed Strike deals 1d4+STR, can reroll 1s on damage, can shove on a hit.",
  },
  "Tough": {
    type:"origin", prereq:"None",
    desc:"Your hit point maximum increases by an amount equal to twice your total level when you gain this feat. Whenever you gain a level thereafter, your hit point maximum increases by an additional 2 hit points.",
    benefit:"+2 HP per character level (retroactive to current level).",
  },
  // ── GENERAL FEATS (available at 4th, 8th, 12th, 16th, 19th level) ──
  "Ability Score Improvement": {
    type:"general", prereq:"None",
    desc:"You increase one Ability Score of your choice by 2, or you increase two Ability Scores of your choice by 1 each. This feat can be taken multiple times.",
    benefit:"+2 to one ability score, or +1 to two ability scores.",
  },
  "Actor": {
    type:"general", prereq:"CHA 13+",
    desc:"Skilled at mimicry and dramatics, you gain the following benefits:\n• Ability Score Increase: Increase your Charisma score by 1, to a maximum of 20.\n• Impersonation: While disguised as a real or fictional person, you have Advantage on Charisma (Deception or Performance) checks to convince others you are that person.\n• Mimicry: You can mimic the voice of another person or sounds made by other creatures. You must have heard the person speaking or the creature making the sound for at least 1 minute. A creature that hears the mimicry can determine it is an imitation with a successful Wisdom (Insight) check opposed by your Charisma (Deception or Performance) check.",
    benefit:"+1 CHA. Advantage on Deception/Performance when impersonating. Can mimic voices.",
  },
  "Athlete": {
    type:"general", prereq:"STR or DEX 13+",
    desc:"You have undergone extensive physical training to gain the following benefits:\n• Ability Score Increase: Increase your Strength or Dexterity by 1 (max 20).\n• Climb Speed: You gain a Climb Speed equal to your Speed.\n• Hop Up: When you are Prone, you can right yourself with only 5 feet of movement.\n• Jumping: Your Jump distance is determined by your Strength score rather than your Strength modifier.",
    benefit:"+1 STR or DEX. Gain climb speed. Stand from prone with only 5 ft. Better jumping.",
  },
  "Charger": {
    type:"general", prereq:"Proficiency with any weapon",
    desc:"You have trained to charge headlong into battle, gaining the following benefits:\n• Improved Dash: When you take the Dash action, your Speed increases by 10 feet for that action.\n• Charge Attack: If you move at least 10 feet in a straight line immediately before hitting with an attack as part of the Attack action, choose one of the following: gain a +1d8 bonus to the attack's damage roll, or push the target up to 10 feet, provided the target is Large or smaller. You can use this benefit only once per turn.",
    benefit:"Dash gives +10 Speed. After 10 ft move, attacks deal +1d8 or push target 10 ft.",
  },
  "Chef": {
    type:"general", prereq:"None",
    desc:"Time and effort spent mastering the culinary arts has paid off. You gain the following benefits:\n• Ability Score Increase: Increase your Constitution or Wisdom score by 1 (max 20).\n• Cook's Utensils: You gain proficiency with Cook's Utensils if you don't already have it.\n• Replenishing Meal: As part of a Short Rest, you can cook special food, provided you have ingredients and Cook's Utensils on hand. You can prepare enough food for a number of creatures equal to 4 + your Proficiency Bonus. Each creature that eats the food and spends one or more Hit Dice during the Short Rest can forgo one die's result to instead regain the maximum number of hit points the die can restore.\n• Bolstering Treats: With 1 hour of work or when you finish a Long Rest, you can cook a number of treats equal to your Proficiency Bonus. These special treats last 8 hours after being made. A creature can use a Bonus Action to eat one of those treats to gain Temporary Hit Points equal to your Proficiency Bonus.",
    benefit:"+1 CON or WIS. Cook utensils prof. Short Rest meals maximise one hit die. Temp HP treats.",
  },
  "Crossbow Expert": {
    type:"general", prereq:"Proficiency with any weapon",
    desc:"Thanks to extensive practice with crossbows, you gain the following benefits:\n• Ignore Loading: You ignore the Loading property of crossbows with which you are proficient.\n• Firing in Melee: Being within 5 feet of an enemy doesn't impose Disadvantage on your attack rolls with Hand Crossbows.\n• Dual Wielding: When you use the Attack action and attack with a one-handed weapon, you can use a Bonus Action to attack with a Hand Crossbow you are holding.",
    benefit:"Ignore Loading on crossbows. No Disadvantage in melee. Bonus Action attack with hand crossbow.",
  },
  "Defensive Duelist": {
    type:"general", prereq:"DEX 13+",
    desc:"You have learned to parry your opponents' attacks, gaining the following benefits:\n• Ability Score Increase: Increase your Dexterity score by 1 (max 20).\n• Parry: If you are holding a Finesse weapon and another creature hits you with a melee attack, you can use your Reaction to add your Proficiency Bonus to your Armor Class for that attack, potentially causing the attack to miss you.",
    benefit:"+1 DEX. Reaction: add PB to AC when hit with a melee attack while holding a finesse weapon.",
  },
  "Dual Wielder": {
    type:"general", prereq:"Proficiency with any weapon",
    desc:"You have become adept at using two weapons simultaneously, gaining the following benefits:\n• Ability Score Increase: Increase your Strength or Dexterity score by 1 (max 20).\n• Enhanced Dual Wielding: When you use your off-hand weapon attack as a Bonus Action, that attack can use any one-handed weapon, not just a Light weapon, provided you are wielding two melee weapons.\n• Quick Draw: You can draw or stow two one-handed weapons when you would normally be able to draw or stow only one.",
    benefit:"+1 STR or DEX. Off-hand attacks with any one-handed weapon. Draw two weapons at once.",
  },
  "Dungeon Delver": {
    type:"general", prereq:"None",
    desc:"Alert to the hidden traps and secret doors found in many dungeons, you gain the following benefits:\n• Trap Advantage: You have Advantage on Wisdom (Perception) and Intelligence (Investigation) checks made to detect the presence of secret doors or traps.\n• Trap Resistance: You have Resistance to damage dealt by traps.\n• Avoid Traps: You can search for traps while traveling at a normal pace, instead of only at a slow pace.",
    benefit:"Advantage detecting traps/secret doors. Resistance to trap damage. Search at normal pace.",
  },
  "Durable": {
    type:"general", prereq:"CON 13+",
    desc:"Hardy and resilient, you gain the following benefits:\n• Ability Score Increase: Increase your Constitution score by 1 (max 20).\n• Defy Death: You have Advantage on Death Saving Throws.\n• Speedy Recovery: As a Bonus Action, you can expend one of your Hit Dice, roll the die, and regain a number of Hit Points equal to the roll.",
    benefit:"+1 CON. Advantage on Death saves. Bonus Action: expend Hit Die and heal.",
  },
  "Elemental Adept": {
    type:"general", prereq:"Spellcasting or Pact Magic feature",
    desc:"You have mastered magical elements, gaining the following benefits:\n• Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1 (max 20).\n• Energy Mastery: Choose one of the following damage types: Acid, Cold, Fire, Lightning, or Thunder. Spells you cast ignore Resistance to damage of the chosen type. In addition, when you roll damage for a spell you cast that deals damage of that type, you can treat any 1 on a damage die as a 2.",
    benefit:"+1 INT/WIS/CHA. Your spells ignore resistance to one damage type. Treat 1s as 2s on damage.",
  },
  "Fey Touched": {
    type:"general", prereq:"None",
    desc:"Your exposure to the Feywild's magic has changed you, granting you the following benefits:\n• Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1 (max 20).\n• Misty Step: You learn the Misty Step spell.\n• Fey Magic: You learn one 1st-level spell from the Divination or Enchantment school. You can cast each of these spells once per Long Rest without a spell slot. When you cast them using a slot, they use your normal spellcasting ability. If you don't have a spellcasting ability, you use Intelligence, Wisdom, or Charisma (your choice).",
    benefit:"+1 INT/WIS/CHA. Learn Misty Step + one 1st-level Divination/Enchantment spell. Each castable once/Long Rest free.",
  },
  "Grappler": {
    type:"general", prereq:"STR or DEX 13+",
    desc:"You have developed the skills necessary to hold your own in close-quarters grappling, gaining the following benefits:\n• Ability Score Increase: Increase your Strength or Dexterity score by 1 (max 20).\n• Punch and Grab: When you hit a creature with an Unarmed Strike as part of the Attack action, you can deal damage to the target and also grapple it.\n• Rapid Grapple: You can use a Bonus Action to try to grapple a creature.\n• Wrestling: You have Advantage on attack rolls against a creature Grappled by you.",
    benefit:"+1 STR or DEX. Grapple on Unarmed Strike hit. Bonus Action grapple. Advantage on attacks vs. grappled foes.",
  },
  "Great Weapon Master": {
    type:"general", prereq:"Proficiency with any martial weapon",
    desc:"You have learned to make sweeping attacks and get the most from a heavy weapon, gaining the following benefits:\n• Ability Score Increase: Increase your Strength score by 1 (max 20).\n• Heavy Weapon Mastery: When you hit a creature with a weapon that has the Heavy property, you can cause the weapon to deal extra damage to the target equal to your Proficiency Bonus.\n• Hew: Immediately after you score a Critical Hit with a melee weapon or reduce a creature to 0 HP with one, you can make one melee weapon attack as a Bonus Action.",
    benefit:"+1 STR. Heavy weapons deal +PB damage on hit. Bonus Action attack after crit or killing blow.",
  },
  "Heavily Armored": {
    type:"general", prereq:"Medium Armor proficiency",
    desc:"You have trained to use Heavy Armor effectively, gaining the following benefits:\n• Ability Score Increase: Increase your Strength score by 1 (max 20).\n• Armor Training: You gain proficiency with Heavy Armor.",
    benefit:"+1 STR. Gain Heavy Armor proficiency.",
  },
  "Heavy Armor Master": {
    type:"general", prereq:"Heavy Armor proficiency",
    desc:"You can use your armor to deflect strikes that would kill others, gaining the following benefits:\n• Ability Score Increase: Increase your Strength score by 1 (max 20).\n• Damage Reduction: When you're hit by an attack while you're wearing Heavy Armor, any Bludgeoning, Piercing, and Slashing damage dealt to you by that attack is reduced by 3.",
    benefit:"+1 STR. Bludgeoning/Piercing/Slashing damage reduced by 3 while wearing heavy armor.",
  },
  "Inspiring Leader": {
    type:"general", prereq:"CHA 13+",
    desc:"You are an able leader, granting you the following benefits:\n• Ability Score Increase: Increase your Wisdom or Charisma score by 1 (max 20).\n• Encouraging Speech: At the end of a Short or Long Rest, you can give an inspiring speech to up to six friendly creatures (which can include yourself) who can see or hear you and who can understand you. Each creature can gain Temporary Hit Points equal to your level + your Charisma modifier.",
    benefit:"+1 WIS or CHA. After Short/Long Rest, give up to 6 allies Temp HP = level + CHA mod.",
  },
  "Keen Mind": {
    type:"general", prereq:"INT 13+",
    desc:"You have trained yourself to be mentally sharp. You gain the following benefits:\n• Ability Score Increase: Increase your Intelligence score by 1 (max 20).\n• Lore Knowledge: Choose one of the following skills: Arcana, History, Investigation, Nature, or Religion. If you lack proficiency with the chosen skill, you gain proficiency in it. If you already have proficiency in it, you gain Expertise with it.\n• Quick Study: You can take the Study action as a Bonus Action.",
    benefit:"+1 INT. Proficiency or Expertise in one knowledge skill. Study as a Bonus Action.",
  },
  "Lightly Armored": {
    type:"general", prereq:"None",
    desc:"You have trained to use Light Armor effectively, gaining the following benefits:\n• Ability Score Increase: Increase your Strength or Dexterity score by 1 (max 20).\n• Armor Training: You gain proficiency with Light Armor and Shields.",
    benefit:"+1 STR or DEX. Gain Light Armor and Shield proficiency.",
  },
  "Mage Slayer": {
    type:"general", prereq:"None",
    desc:"You have practiced techniques useful in melee combat against spellcasters, gaining the following benefits:\n• Ability Score Increase: Increase your Strength or Dexterity score by 1 (max 20).\n• Concentration Breaker: When you damage a creature that is concentrating, it has Disadvantage on the saving throw it makes to maintain Concentration.\n• Guarded Mind: If you fail an Intelligence, Wisdom, or Charisma saving throw, you can cause yourself to succeed instead. Once you use this benefit, you can't use it again until you finish a Long Rest.",
    benefit:"+1 STR or DEX. Concentration saves have Disadvantage when you deal damage. Once/LR: turn one mental save failure into success.",
  },
  "Medium Armor Master": {
    type:"general", prereq:"Medium Armor proficiency",
    desc:"You have practiced moving in medium armor, gaining the following benefits:\n• No Stealth Penalty: Wearing Medium Armor no longer imposes Disadvantage on Dexterity (Stealth) checks.\n• Improved Armored Defense: When you wear Medium Armor, you can add up to 3 to your Armor Class, rather than up to 2.",
    benefit:"No Stealth disadvantage in medium armor. Add up to +3 DEX (not +2) to AC.",
  },
  "Mobile": {
    type:"general", prereq:"None",
    desc:"You are exceptionally speedy and agile, gaining the following benefits:\n• Speed Increase: Your Speed increases by 10 feet.\n• Dash Agility: When you take the Dash action, Difficult Terrain doesn't cost you extra movement on that turn.\n• Agile Movement: When you make a melee attack against a creature, you don't provoke Opportunity Attacks from it until the end of the current turn, whether you hit or not.",
    benefit:"+10 Speed. Ignore difficult terrain when Dashing. No opportunity attacks from creatures you attack.",
  },
  "Moderately Armored": {
    type:"general", prereq:"Light Armor proficiency",
    desc:"You have trained to use Medium Armor and Shields effectively, gaining the following benefits:\n• Ability Score Increase: Increase your Strength or Dexterity score by 1 (max 20).\n• Armor Training: You gain proficiency with Medium Armor and Shields.",
    benefit:"+1 STR or DEX. Gain Medium Armor and Shield proficiency.",
  },
  "Mounted Combatant": {
    type:"general", prereq:"Proficiency with any weapon",
    desc:"You have developed a bond with your mounts, granting you the following benefits:\n• Ability Score Increase: Increase your Strength, Dexterity, or Wisdom score by 1 (max 20).\n• Mounted Strike: While mounted, you have Advantage on melee attack rolls against any unmounted creature within 5 feet of your mount that is smaller than your mount.\n• Leap Aside: If your mount is subjected to an effect that allows it to make a Dexterity saving throw to take only half damage, it instead takes no damage if it succeeds on the saving throw, and only half damage if it fails.\n• Veer: While mounted, you can force an attack that hits your mount to instead target you, provided you are a valid target for that attack.",
    benefit:"+1 STR/DEX/WIS. Advantage on attacks vs. unmounted creatures. Protect mount from saves.",
  },
  "Observant": {
    type:"general", prereq:"None",
    desc:"Quick to notice details of your environment, you gain the following benefits:\n• Ability Score Increase: Increase your Intelligence or Wisdom score by 1 (max 20).\n• Keen Observer: Choose one of the following skills: Insight, Investigation, or Perception. If you lack proficiency with the chosen skill, you gain proficiency in it. If you already have proficiency in it, you gain Expertise with it.\n• Quick Search: You can take the Search action as a Bonus Action.",
    benefit:"+1 INT or WIS. Proficiency or Expertise in Insight, Investigation, or Perception. Search as Bonus Action.",
  },
  "Piercer": {
    type:"general", prereq:"Proficiency with any weapon",
    desc:"You have achieved a penetrating precision in combat, gaining the following benefits:\n• Ability Score Increase: Increase your Strength or Dexterity score by 1 (max 20).\n• Puncture: Once per turn, when you hit a creature with an attack that deals Piercing damage, you can reroll one of the attack's damage dice, and you must use the new roll.\n• Enhanced Critical: When you score a Critical Hit that deals Piercing damage to a creature, you can roll one additional damage die when determining the extra Piercing damage the target takes.",
    benefit:"+1 STR or DEX. Reroll one damage die once per turn on piercing hits. Extra die on piercing critical hits.",
  },
  "Poisoner": {
    type:"general", prereq:"None",
    desc:"You have trained with poisons and have access to a wider array of them, gaining the following benefits:\n• Ability Score Increase: Increase your Dexterity or Intelligence score by 1 (max 20).\n• Potent Poison: When you make a damage roll that deals Poison damage, it ignores Resistance to Poison damage.\n• Brew Poison: You gain proficiency with the Poisoner's Kit if you don't already have it. With 1 hour of work using a Poisoner's Kit and expending 50 GP worth of materials, you can create a number of doses of Basic Poison equal to your Proficiency Bonus. Once applied to a weapon or piece of ammunition, the poison retains its potency for 1 minute or until you hit with the weapon or ammunition. When a creature takes the poisoned weapon's damage, that creature must succeed on a DC 14 Constitution saving throw or take 2d8 Poison damage and have the Poisoned condition until the end of your next turn.",
    benefit:"+1 DEX or INT. Ignore Poison resistance. Craft Basic Poison (PB doses per hour).",
  },
  "Polearm Master": {
    type:"general", prereq:"Proficiency with any weapon",
    desc:"You have learned to fight with polearms expertly, gaining the following benefits:\n• Ability Score Increase: Increase your Strength or Dexterity score by 1 (max 20).\n• Pole Strike: Immediately after you take the Attack action and attack with a Polearm weapon that has the Reach or Versatile property on your turn, you can use a Bonus Action to make a melee attack with the opposite end of the weapon. That attack uses the same ability modifier as the primary attack and deals 1d4 Bludgeoning damage.\n• Reactive Strike: While you are holding a Polearm weapon that has the Reach or Versatile property, you can use your Reaction to make one melee attack against a creature that enters the reach you have with that weapon.",
    benefit:"+1 STR or DEX. Bonus Action butt-end attack (1d4). Reaction attack when enemy enters reach.",
  },
  "Resilient": {
    type:"general", prereq:"None",
    desc:"You have developed the resilience to better withstand certain dangers, gaining the following benefits:\n• Ability Score Increase: Choose one ability score. Increase that score by 1 (max 20).\n• Saving Throw Proficiency: You gain proficiency in saving throws using the chosen ability score.",
    benefit:"+1 to one ability score. Gain proficiency in that ability's saving throw.",
  },
  "Ritual Caster": {
    type:"general", prereq:"INT, WIS, or CHA 13+",
    desc:"You have studied ritual magic, gaining the following benefits:\n• Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1 (max 20).\n• Ritual Spells: Choose two 1st-level spells that have the Ritual tag from any class's spell list. You always have those spells prepared, and you can cast them with any spell slots you have. The spells' spellcasting ability is the ability increased by this feat. You can cast these spells as Rituals. Whenever you gain a new level, you can replace one of those spells with a different spell with the Ritual tag from any class's spell list.",
    benefit:"+1 INT/WIS/CHA. Always have 2 ritual spells prepared. Cast them as rituals.",
  },
  "Sentinel": {
    type:"general", prereq:"Proficiency with any weapon",
    desc:"You have mastered techniques to take advantage of every drop in any enemy's guard, gaining the following benefits:\n• Ability Score Increase: Increase your Strength or Dexterity score by 1 (max 20).\n• Guardian: Immediately after a creature within your reach takes the Disengage action or hits a target other than you with an attack, you can make an Opportunity Attack against that creature.\n• Halt: When you hit a creature with an Opportunity Attack, the creature's Speed becomes 0 for the rest of the current turn.\n• Opportunity Attacker: Creatures within your reach provoke Opportunity Attacks from you even if they take the Disengage action before leaving your reach.",
    benefit:"+1 STR or DEX. Opportunity Attack on Disengage or attacks targeting others. Stop movement on Opportunity hit.",
  },
  "Shadow-Touched": {
    type:"general", prereq:"None",
    desc:"Your exposure to the Shadowfell's magic has changed you, granting you the following benefits:\n• Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1 (max 20).\n• Invisibility: You learn the Invisibility spell.\n• Shadow Magic: You learn one 1st-level spell from the Illusion or Necromancy school. You can cast each of these spells without expending a spell slot once per Long Rest. When you cast them with a spell slot, you use your spellcasting ability. If none, choose INT, WIS, or CHA.",
    benefit:"+1 INT/WIS/CHA. Learn Invisibility + one 1st-level Illusion/Necromancy spell. Each free once/Long Rest.",
  },
  "Sharpshooter": {
    type:"general", prereq:"Proficiency with any weapon",
    desc:"You have mastered ranged weapons and can make shots that others find impossible, gaining the following benefits:\n• Ability Score Increase: Increase your Dexterity score by 1 (max 20).\n• Bypass Cover: Your ranged attacks with weapons ignore Half Cover and Three-Quarters Cover.\n• Firing in Melee: Being within 5 feet of an enemy and the Prone condition don't impose Disadvantage on your ranged attack rolls with weapons.\n• Long Shots: Attacking at long range doesn't impose Disadvantage on your ranged attack rolls with weapons.",
    benefit:"+1 DEX. Ignore cover. No Disadvantage in melee or at long range with ranged weapons.",
  },
  "Shield Master": {
    type:"general", prereq:"Proficiency with shields",
    desc:"You have trained to use shields not just for protection but also for offense, gaining the following benefits:\n• Ability Score Increase: Increase your Strength score by 1 (max 20).\n• Shield Bash: If you attack a creature within 5 feet of you as part of the Attack action and hit, you can make a Bonus Action unarmed strike against it using your shield hand. On a hit, you deal 1d4 Bludgeoning damage.\n• Interpose Shield: If you are subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you can use your Reaction to take no damage if you succeed on the saving throw, interposing your shield between yourself and the source of the effect.",
    benefit:"+1 STR. Shield Bash Bonus Action (1d4). Use Reaction to negate damage on a Dex save success.",
  },
  "Skill Expert": {
    type:"general", prereq:"None",
    desc:"You have honed your proficiency with particular skills, granting you the following benefits:\n• Ability Score Increase: Increase one ability score of your choice by 1 (max 20).\n• Skill Proficiency: You gain proficiency in one skill of your choice.\n• Expertise: You gain Expertise with one skill in which you have proficiency.",
    benefit:"+1 to one ability. Proficiency in 1 skill. Expertise in 1 skill you're proficient in.",
  },
  "Skulker": {
    type:"general", prereq:"DEX 13+",
    desc:"You are expert at slinking through shadows, gaining the following benefits:\n• Ability Score Increase: Increase your Dexterity score by 1 (max 20).\n• Blindsight: You have Blindsight with a range of 10 feet.\n• Fog of War: You exploit the distractions of battle, gaining Advantage on any Dexterity (Stealth) check you make as part of the Hide action during combat.\n• Sniper: If you make an attack roll while Hidden and the roll misses, making the attack roll doesn't reveal your location.",
    benefit:"+1 DEX. 10 ft Blindsight. Advantage on Stealth in combat. Missed attacks don't reveal you.",
  },
  "Slasher": {
    type:"general", prereq:"Proficiency with any weapon",
    desc:"You have learned where to cut to have the greatest effect, gaining the following benefits:\n• Ability Score Increase: Increase your Strength or Dexterity score by 1 (max 20).\n• Hamstring: Once per turn when you hit a creature with an attack that deals Slashing damage, you can reduce the Speed of that creature by 10 feet until the start of your next turn.\n• Enhanced Critical: When you score a Critical Hit that deals Slashing damage to a creature, it has Disadvantage on attack rolls until the start of your next turn.",
    benefit:"+1 STR or DEX. Slashing hits reduce target Speed by 10 ft. Slashing critical hits impose Disadvantage.",
  },
  "Speedy": {
    type:"general", prereq:"DEX or CON 13+",
    desc:"You possess exceptional speed and stamina, gaining the following benefits:\n• Ability Score Increase: Increase your Dexterity or Constitution score by 1 (max 20).\n• Speed Increase: Your Speed increases by 10 feet.\n• Dash in Armor: When you use the Dash action while wearing Medium or Heavy Armor, you can move an extra 10 feet.\n• Agile Movement: Opportunity Attacks made against you have Disadvantage.",
    benefit:"+1 DEX or CON. +10 Speed. Extra 10 ft when Dashing in armor. Disadvantage on Opportunity Attacks vs. you.",
  },
  "Spell Sniper": {
    type:"general", prereq:"Spellcasting or Pact Magic feature",
    desc:"You have learned techniques to enhance your attacks with certain kinds of spells, gaining the following benefits:\n• Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1 (max 20).\n• Bypass Cover: Your attack rolls for spells ignore Half Cover and Three-Quarters Cover.\n• Casting in Melee: Being within 5 feet of an enemy doesn't impose Disadvantage on attack rolls you make with spells.\n• Increased Range: When you cast a spell that has a range of at least 10 feet and requires you to make an attack roll, the spell's range increases by 60 feet.",
    benefit:"+1 INT/WIS/CHA. Spell attacks ignore cover. No Disadvantage in melee. +60 ft range on attack-roll spells.",
  },
  "Telekinetic": {
    type:"general", prereq:"None",
    desc:"You learn to move things with your mind, gaining the following benefits:\n• Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1 (max 20).\n• Minor Telekinesis: You learn the Mage Hand cantrip. You can cast it without verbal or somatic components, and you can make the spectral hand invisible. If you already know Mage Hand, its range increases by 30 feet when you cast it. In either case, INT, WIS, or CHA is your spellcasting ability.\n• Telekinetic Shove: As a Bonus Action, you can try to telekinetically shove one creature you can see within 30 feet of you. When you do so, the target must succeed on a Strength saving throw (DC 8 + your spellcasting ability modifier + your Proficiency Bonus) or be moved 5 feet toward or away from you.",
    benefit:"+1 INT/WIS/CHA. Invisible Mage Hand. Bonus Action: push/pull creature 5 ft (STR save).",
  },
  "Telepathic": {
    type:"general", prereq:"None",
    desc:"You awaken the ability to mentally connect with others, granting you the following benefits:\n• Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1 (max 20).\n• Telepathic Speech: You can speak telepathically to any creature you can see within 60 feet of you. Your telepathic utterances are in a language you know, and the creature understands you only if it knows that language. Your communication doesn't give the creature the ability to respond to you telepathically.\n• Detect Thoughts: You can cast Detect Thoughts, requiring no spell slot or components, and you must finish a Long Rest before you can cast it this way again. INT, WIS, or CHA is your spellcasting ability for the spell.",
    benefit:"+1 INT/WIS/CHA. Telepathic speech (60 ft). Cast Detect Thoughts once/Long Rest without a slot.",
  },
  "War Caster": {
    type:"general", prereq:"Spellcasting or Pact Magic feature",
    desc:"You have practiced casting spells in the midst of combat, giving you the following benefits:\n• Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1 (max 20).\n• Concentration: You have Advantage on Constitution saving throws that you make to maintain Concentration.\n• Reactive Spell: When a creature provokes an Opportunity Attack from you by leaving your reach, you can use your Reaction to cast a spell at the creature, rather than making an Opportunity Attack. The spell must have a casting time of 1 Action and must target only that creature.\n• Somatic Components: You can perform the Somatic components of spells even when you have weapons or a Shield in one or both hands.",
    benefit:"+1 INT/WIS/CHA. Advantage on Concentration saves. Cast spells for Opportunity Attacks. Cast with hands full.",
  },
  "Weapon Master": {
    type:"general", prereq:"None",
    desc:"You have practiced extensively with a variety of weapons, gaining the following benefits:\n• Ability Score Increase: Increase your Strength or Dexterity score by 1 (max 20).\n• Weapon Proficiency: You gain Martial weapon proficiency with four weapons of your choice. Each weapon must be a Simple or Martial weapon.",
    benefit:"+1 STR or DEX. Gain proficiency with 4 weapons of your choice.",
  },
};

// ─── WEAPON PROPERTY DEFINITIONS ─────────────────────────────────────────────
const PROPERTY_DEFS = {
  "Ammunition":     { color:"#5c7a3a", desc:"Requires ammunition (arrows, bolts, bullets, needles). You can recover half your expended ammunition after a battle." },
  "Finesse":        { color:"#7a4a9e", desc:"When attacking with this weapon, use STR or DEX for attack and damage rolls — your choice. Useful for Rogues and DEX-based fighters." },
  "Heavy":          { color:"#8b3a1a", desc:"Small creatures have Disadvantage on attack rolls with Heavy weapons. Tiny creatures can't use them at all." },
  "Light":          { color:"#3a7a5c", desc:"Light weapons are ideal for two-weapon fighting. When you attack with a Light weapon, you can use a Bonus Action to attack with another Light weapon in your other hand." },
  "Loading":        { color:"#7a3a3a", desc:"Because of the time required to load this weapon, you can fire only one piece of ammunition from it when you use an action, bonus action, or reaction to fire it." },
  "Reach":          { color:"#3a5c8b", desc:"This weapon adds 5 feet to your reach when you attack with it. This also applies to opportunity attacks." },
  "Special":        { color:"#8b7a1a", desc:"This weapon has unusual rules. Refer to the weapon's description in the PHB for full details." },
  "Thrown":         { color:"#5c8b3a", desc:"You can throw this weapon to make a ranged attack. Uses the same ability modifier as a melee attack." },
  "Two-Handed":     { color:"#6a3a8b", desc:"This weapon requires two hands when you attack with it." },
  "Versatile":      { color:"#1a6a8b", desc:"This weapon can be used with one or two hands. The two-handed damage die is shown in parentheses — use it when wielding with both hands." },
  "Silvered":       { color:"#7a7a8b", desc:"Some monsters are vulnerable or immune to nonmagical attacks unless made with silvered weapons." },
  "Magical":        { color:"#9e4a7a", desc:"This weapon is considered magical for the purposes of overcoming resistance and immunity to nonmagical attacks." },
  "Monk":           { color:"#3a8b7a", desc:"Monks can use this weapon with their Martial Arts feature." },
  "Nick":           { color:"#8b5a1a", desc:"When you make the extra attack of the Light property, you can make it as part of the Attack action instead of as a Bonus Action. You can make this extra attack only once per turn." },
  "Vex":            { color:"#6a8b1a", desc:"If you hit a creature with this weapon, you have Advantage on your next attack roll against that creature before the end of your next turn." },
  "Graze":          { color:"#8b1a5a", desc:"If your attack roll misses a creature, you can deal damage equal to your ability modifier used for the attack. This damage is the same type as the weapon deals." },
  "Slow":           { color:"#3a3a8b", desc:"If you hit a creature with this weapon, the creature's Speed is reduced by 10 feet until the start of your next turn." },
  "Push":           { color:"#8b6a1a", desc:"If you hit a creature with this weapon, you can push the creature up to 10 feet straight away from yourself if it is Large or smaller." },
  "Topple":         { color:"#1a8b6a", desc:"If you hit a creature with this weapon, you can force the creature to make a CON saving throw (DC 8 + STR or DEX mod + PB). On a failure, the creature has the Prone condition." },
  "Cleave":         { color:"#8b3a5a", desc:"If you hit a creature with a melee attack roll using this weapon, you can make a melee attack roll with the weapon against a second creature within 5 feet of the first that is also within your reach. On a hit, the second creature takes the weapon's damage but you don't add your ability modifier to that damage roll." },
  "Sap":            { color:"#5a8b3a", desc:"If you hit a creature with this weapon, that creature has Disadvantage on its next attack roll before the start of your next turn." },
  "Ensnaring":      { color:"#8b3a8b", desc:"If you hit a creature with this weapon, you can use your Bonus Action to attempt to grapple the creature." },
  "Thrown (20/60)": { color:"#5c8b3a", desc:"Normal range 20 ft, long range 60 ft. Attacks beyond normal range have Disadvantage." },
  "Thrown (30/120)":{ color:"#5c8b3a", desc:"Normal range 30 ft, long range 120 ft. Attacks beyond normal range have Disadvantage." },
};

// ─── EQUIPMENT DATABASE (2024 PHB + expanded) ─────────────────────────────────
// weapon fields: damage, versatileDmg, damageType, ability, finesse, range, properties[], category
// armor fields: armorType, acBase, stealthDis (bool), strReq
const EQUIPMENT_DB = {
  // ════════════════════════════════════════════════════════════════════════════
  // ARMOUR
  // ════════════════════════════════════════════════════════════════════════════
  "Padded Armor":     { type:"armor", armorType:"light",  acBase:11, weight:8,  cost:"5 gp",   stealthDis:true,  strReq:0,  desc:"Light armor. AC = 11 + DEX. Disadvantage on Stealth." },
  "Leather Armor":    { type:"armor", armorType:"light",  acBase:11, weight:10, cost:"10 gp",  stealthDis:false, strReq:0,  desc:"Light armor. AC = 11 + DEX." },
  "Studded Leather":  { type:"armor", armorType:"light",  acBase:12, weight:13, cost:"45 gp",  stealthDis:false, strReq:0,  desc:"Light armor. AC = 12 + DEX." },
  "Hide Armor":       { type:"armor", armorType:"medium", acBase:12, weight:12, cost:"10 gp",  stealthDis:false, strReq:0,  desc:"Medium armor. AC = 12 + DEX (max +2)." },
  "Chain Shirt":      { type:"armor", armorType:"medium", acBase:13, weight:20, cost:"50 gp",  stealthDis:false, strReq:0,  desc:"Medium armor. AC = 13 + DEX (max +2)." },
  "Scale Mail":       { type:"armor", armorType:"medium", acBase:14, weight:45, cost:"50 gp",  stealthDis:true,  strReq:0,  desc:"Medium armor. AC = 14 + DEX (max +2). Disadvantage on Stealth." },
  "Breastplate":      { type:"armor", armorType:"medium", acBase:14, weight:20, cost:"400 gp", stealthDis:false, strReq:0,  desc:"Medium armor. AC = 14 + DEX (max +2)." },
  "Half Plate":       { type:"armor", armorType:"medium", acBase:15, weight:40, cost:"750 gp", stealthDis:true,  strReq:0,  desc:"Medium armor. AC = 15 + DEX (max +2). Disadvantage on Stealth." },
  "Ring Mail":        { type:"armor", armorType:"heavy",  acBase:14, weight:40, cost:"30 gp",  stealthDis:true,  strReq:0,  desc:"Heavy armor. AC 14. Disadvantage on Stealth." },
  "Chain Mail":       { type:"armor", armorType:"heavy",  acBase:16, weight:55, cost:"75 gp",  stealthDis:true,  strReq:13, desc:"Heavy armor. AC 16. Disadvantage on Stealth. STR 13 required." },
  "Splint":           { type:"armor", armorType:"heavy",  acBase:17, weight:60, cost:"200 gp", stealthDis:true,  strReq:15, desc:"Heavy armor. AC 17. Disadvantage on Stealth. STR 15 required." },
  "Plate":            { type:"armor", armorType:"heavy",  acBase:18, weight:65, cost:"1500 gp",stealthDis:true,  strReq:15, desc:"Heavy armor. AC 18. Disadvantage on Stealth. STR 15 required." },
  "Shield":           { type:"armor", armorType:"shield", acBase:2,  weight:6,  cost:"10 gp",  stealthDis:false, strReq:0,  desc:"+2 to AC. Requires one free hand. You are not proficient with it unless you have Shield proficiency." },

  // ════════════════════════════════════════════════════════════════════════════
  // SIMPLE MELEE WEAPONS
  // ════════════════════════════════════════════════════════════════════════════
  "Club":          { type:"weapon", category:"Simple Melee",  damage:"1d4",  versatileDmg:null,  damageType:"Bludgeoning", ability:"STR", weight:2,  cost:"1 sp",  finesse:false, range:null,       properties:["Light"] },
  "Dagger":        { type:"weapon", category:"Simple Melee",  damage:"1d4",  versatileDmg:null,  damageType:"Piercing",    ability:"STR", weight:1,  cost:"2 gp",  finesse:true,  range:"20/60",    properties:["Finesse","Light","Nick","Thrown (20/60)","Vex"] },
  "Greatclub":     { type:"weapon", category:"Simple Melee",  damage:"1d8",  versatileDmg:null,  damageType:"Bludgeoning", ability:"STR", weight:10, cost:"2 sp",  finesse:false, range:null,       properties:["Two-Handed","Push"] },
  "Handaxe":       { type:"weapon", category:"Simple Melee",  damage:"1d6",  versatileDmg:null,  damageType:"Slashing",    ability:"STR", weight:2,  cost:"5 gp",  finesse:false, range:"20/60",    properties:["Light","Nick","Thrown (20/60)","Vex"] },
  "Javelin":       { type:"weapon", category:"Simple Melee",  damage:"1d6",  versatileDmg:null,  damageType:"Piercing",    ability:"STR", weight:2,  cost:"5 sp",  finesse:false, range:"30/120",   properties:["Thrown (30/120)","Slow"] },
  "Light Hammer":  { type:"weapon", category:"Simple Melee",  damage:"1d4",  versatileDmg:null,  damageType:"Bludgeoning", ability:"STR", weight:2,  cost:"2 gp",  finesse:false, range:"20/60",    properties:["Light","Nick","Thrown (20/60)","Sap"] },
  "Mace":          { type:"weapon", category:"Simple Melee",  damage:"1d6",  versatileDmg:null,  damageType:"Bludgeoning", ability:"STR", weight:4,  cost:"5 gp",  finesse:false, range:null,       properties:["Sap"] },
  "Quarterstaff":  { type:"weapon", category:"Simple Melee",  damage:"1d6",  versatileDmg:"1d8", damageType:"Bludgeoning", ability:"STR", weight:4,  cost:"2 sp",  finesse:false, range:null,       properties:["Versatile","Topple","Monk"] },
  "Sickle":        { type:"weapon", category:"Simple Melee",  damage:"1d4",  versatileDmg:null,  damageType:"Slashing",    ability:"STR", weight:2,  cost:"1 gp",  finesse:false, range:null,       properties:["Light","Nick"] },
  "Spear":         { type:"weapon", category:"Simple Melee",  damage:"1d6",  versatileDmg:"1d8", damageType:"Piercing",    ability:"STR", weight:3,  cost:"1 gp",  finesse:false, range:"20/60",    properties:["Thrown (20/60)","Versatile","Sap","Monk"] },

  // ════════════════════════════════════════════════════════════════════════════
  // SIMPLE RANGED WEAPONS
  // ════════════════════════════════════════════════════════════════════════════
  "Light Crossbow":{ type:"weapon", category:"Simple Ranged", damage:"1d8",  versatileDmg:null,  damageType:"Piercing",    ability:"DEX", weight:5,  cost:"25 gp", finesse:false, range:"80/320",   properties:["Ammunition","Loading","Two-Handed","Slow"] },
  "Dart":          { type:"weapon", category:"Simple Ranged", damage:"1d4",  versatileDmg:null,  damageType:"Piercing",    ability:"DEX", weight:0.25,cost:"5 cp", finesse:true,  range:"20/60",    properties:["Finesse","Thrown (20/60)","Vex"] },
  "Shortbow":      { type:"weapon", category:"Simple Ranged", damage:"1d6",  versatileDmg:null,  damageType:"Piercing",    ability:"DEX", weight:2,  cost:"25 gp", finesse:false, range:"80/320",   properties:["Ammunition","Two-Handed","Vex"] },
  "Sling":         { type:"weapon", category:"Simple Ranged", damage:"1d4",  versatileDmg:null,  damageType:"Bludgeoning", ability:"DEX", weight:0,  cost:"1 sp",  finesse:false, range:"30/120",   properties:["Ammunition","Slow"] },

  // ════════════════════════════════════════════════════════════════════════════
  // MARTIAL MELEE WEAPONS
  // ════════════════════════════════════════════════════════════════════════════
  "Battleaxe":     { type:"weapon", category:"Martial Melee", damage:"1d8",  versatileDmg:"1d10",damageType:"Slashing",    ability:"STR", weight:4,  cost:"10 gp", finesse:false, range:null,       properties:["Versatile","Cleave"] },
  "Flail":         { type:"weapon", category:"Martial Melee", damage:"1d8",  versatileDmg:null,  damageType:"Bludgeoning", ability:"STR", weight:2,  cost:"10 gp", finesse:false, range:null,       properties:["Sap"] },
  "Glaive":        { type:"weapon", category:"Martial Melee", damage:"1d10", versatileDmg:null,  damageType:"Slashing",    ability:"STR", weight:6,  cost:"20 gp", finesse:false, range:null,       properties:["Heavy","Reach","Two-Handed","Graze","Cleave"] },
  "Greataxe":      { type:"weapon", category:"Martial Melee", damage:"1d12", versatileDmg:null,  damageType:"Slashing",    ability:"STR", weight:7,  cost:"30 gp", finesse:false, range:null,       properties:["Heavy","Two-Handed","Cleave"] },
  "Greatsword":    { type:"weapon", category:"Martial Melee", damage:"2d6",  versatileDmg:null,  damageType:"Slashing",    ability:"STR", weight:6,  cost:"50 gp", finesse:false, range:null,       properties:["Heavy","Two-Handed","Graze"] },
  "Halberd":       { type:"weapon", category:"Martial Melee", damage:"1d10", versatileDmg:null,  damageType:"Slashing",    ability:"STR", weight:6,  cost:"20 gp", finesse:false, range:null,       properties:["Heavy","Reach","Two-Handed","Cleave"] },
  "Lance":         { type:"weapon", category:"Martial Melee", damage:"1d12", versatileDmg:null,  damageType:"Piercing",    ability:"STR", weight:6,  cost:"10 gp", finesse:false, range:null,       properties:["Reach","Special","Topple"] },
  "Longsword":     { type:"weapon", category:"Martial Melee", damage:"1d8",  versatileDmg:"1d10",damageType:"Slashing",    ability:"STR", weight:3,  cost:"15 gp", finesse:false, range:null,       properties:["Versatile","Sap"] },
  "Maul":          { type:"weapon", category:"Martial Melee", damage:"2d6",  versatileDmg:null,  damageType:"Bludgeoning", ability:"STR", weight:10, cost:"10 gp", finesse:false, range:null,       properties:["Heavy","Two-Handed","Push","Topple"] },
  "Morningstar":   { type:"weapon", category:"Martial Melee", damage:"1d8",  versatileDmg:null,  damageType:"Piercing",    ability:"STR", weight:4,  cost:"15 gp", finesse:false, range:null,       properties:["Sap"] },
  "Pike":          { type:"weapon", category:"Martial Melee", damage:"1d10", versatileDmg:null,  damageType:"Piercing",    ability:"STR", weight:18, cost:"5 gp",  finesse:false, range:null,       properties:["Heavy","Reach","Two-Handed","Push"] },
  "Rapier":        { type:"weapon", category:"Martial Melee", damage:"1d8",  versatileDmg:null,  damageType:"Piercing",    ability:"STR", weight:2,  cost:"25 gp", finesse:true,  range:null,       properties:["Finesse","Vex"] },
  "Scimitar":      { type:"weapon", category:"Martial Melee", damage:"1d6",  versatileDmg:null,  damageType:"Slashing",    ability:"STR", weight:3,  cost:"25 gp", finesse:true,  range:null,       properties:["Finesse","Light","Nick"] },
  "Shortsword":    { type:"weapon", category:"Martial Melee", damage:"1d6",  versatileDmg:null,  damageType:"Piercing",    ability:"STR", weight:2,  cost:"10 gp", finesse:true,  range:null,       properties:["Finesse","Light","Nick","Vex"] },
  "Trident":       { type:"weapon", category:"Martial Melee", damage:"1d6",  versatileDmg:"1d8", damageType:"Piercing",    ability:"STR", weight:4,  cost:"5 gp",  finesse:false, range:"20/60",    properties:["Thrown (20/60)","Versatile","Topple"] },
  "War Pick":      { type:"weapon", category:"Martial Melee", damage:"1d8",  versatileDmg:"1d10",damageType:"Piercing",    ability:"STR", weight:2,  cost:"5 gp",  finesse:false, range:null,       properties:["Versatile","Vex"] },
  "Warhammer":     { type:"weapon", category:"Martial Melee", damage:"1d8",  versatileDmg:"1d10",damageType:"Bludgeoning", ability:"STR", weight:2,  cost:"15 gp", finesse:false, range:null,       properties:["Versatile","Push"] },
  "Whip":          { type:"weapon", category:"Martial Melee", damage:"1d4",  versatileDmg:null,  damageType:"Slashing",    ability:"STR", weight:3,  cost:"2 gp",  finesse:true,  range:null,       properties:["Finesse","Reach","Slow"] },
  "Yklwa":         { type:"weapon", category:"Martial Melee", damage:"1d8",  versatileDmg:null,  damageType:"Piercing",    ability:"STR", weight:3,  cost:"1 gp",  finesse:false, range:"10/30",    properties:["Thrown (10/30)","Monk"] },
  "Net":           { type:"weapon", category:"Martial Melee", damage:"—",    versatileDmg:null,  damageType:"—",           ability:"STR", weight:3,  cost:"1 gp",  finesse:false, range:"5/15",     properties:["Thrown (5/15)","Ensnaring","Special"] },

  // ════════════════════════════════════════════════════════════════════════════
  // MARTIAL RANGED WEAPONS
  // ════════════════════════════════════════════════════════════════════════════
  "Blowgun":       { type:"weapon", category:"Martial Ranged",damage:"1",    versatileDmg:null,  damageType:"Piercing",    ability:"DEX", weight:1,  cost:"10 gp", finesse:false, range:"25/100",   properties:["Ammunition","Loading","Sap"] },
  "Hand Crossbow": { type:"weapon", category:"Martial Ranged",damage:"1d6",  versatileDmg:null,  damageType:"Piercing",    ability:"DEX", weight:3,  cost:"75 gp", finesse:false, range:"30/120",   properties:["Ammunition","Light","Loading","Vex"] },
  "Heavy Crossbow":{ type:"weapon", category:"Martial Ranged",damage:"1d10", versatileDmg:null,  damageType:"Piercing",    ability:"DEX", weight:18, cost:"50 gp", finesse:false, range:"100/400",  properties:["Ammunition","Heavy","Loading","Two-Handed","Push"] },
  "Longbow":       { type:"weapon", category:"Martial Ranged",damage:"1d8",  versatileDmg:null,  damageType:"Piercing",    ability:"DEX", weight:2,  cost:"50 gp", finesse:false, range:"150/600",  properties:["Ammunition","Heavy","Two-Handed","Slow"] },
  "Musket":        { type:"weapon", category:"Martial Ranged",damage:"1d12", versatileDmg:null,  damageType:"Piercing",    ability:"DEX", weight:10, cost:"500 gp",finesse:false, range:"40/120",   properties:["Ammunition","Loading","Two-Handed","Slow"] },
  "Pistol":        { type:"weapon", category:"Martial Ranged",damage:"1d10", versatileDmg:null,  damageType:"Piercing",    ability:"DEX", weight:3,  cost:"250 gp",finesse:false, range:"30/90",    properties:["Ammunition","Loading","Vex"] },

  // ════════════════════════════════════════════════════════════════════════════
  // AMMUNITION
  // ════════════════════════════════════════════════════════════════════════════
  "Arrows (20)":          { type:"gear", category:"Ammunition", weight:1,  cost:"1 gp",   desc:"Standard arrows for shortbows and longbows. 20 per bundle." },
  "Crossbow Bolts (20)":  { type:"gear", category:"Ammunition", weight:1.5,cost:"1 gp",   desc:"Bolts for hand, light, or heavy crossbows. 20 per bundle." },
  "Blowgun Needles (50)": { type:"gear", category:"Ammunition", weight:1,  cost:"1 gp",   desc:"Needles for blowguns. 50 per bundle." },
  "Sling Bullets (20)":   { type:"gear", category:"Ammunition", weight:1.5,cost:"4 cp",   desc:"Lead bullets for slings. 20 per bundle." },
  "Silver Arrows (20)":   { type:"gear", category:"Ammunition", weight:1,  cost:"100 gp", desc:"Silver-tipped arrows. Bypass certain creature immunities (lycanthropes, some fiends)." },

  // ════════════════════════════════════════════════════════════════════════════
  // ADVENTURING GEAR
  // ════════════════════════════════════════════════════════════════════════════
  "Backpack":             { type:"gear", category:"Container",    weight:5,  cost:"2 gp",   desc:"Can hold 30 lb of gear; 1 cubic foot capacity." },
  "Chest":                { type:"gear", category:"Container",    weight:25, cost:"5 gp",   desc:"Holds up to 300 lb; 12 cubic feet capacity. Has a lock." },
  "Pouch":                { type:"gear", category:"Container",    weight:1,  cost:"5 sp",   desc:"Holds up to 6 lb of gear; ⅕ cubic foot capacity." },
  "Saddlebags":           { type:"gear", category:"Container",    weight:8,  cost:"4 gp",   desc:"Holds up to 30 lb across two bags." },
  "Rope, Hempen (50 ft)": { type:"gear", category:"Tools",       weight:10, cost:"1 gp",   desc:"Hempen rope, 50 feet. Has 2 HP and can be burst with a DC 17 STR check." },
  "Rope, Silk (50 ft)":   { type:"gear", category:"Tools",       weight:5,  cost:"10 gp",  desc:"Silk rope, 50 feet. Has 3 HP and can be burst with a DC 20 STR check." },
  "Crowbar":              { type:"gear", category:"Tools",       weight:5,  cost:"2 gp",   desc:"Grants Advantage on STR checks where leverage can be applied." },
  "Grappling Hook":       { type:"gear", category:"Tools",       weight:4,  cost:"2 gp",   desc:"Can be thrown up to 20 ft, then used to climb with a rope." },
  "Ladder (10 ft)":       { type:"gear", category:"Tools",       weight:25, cost:"1 sp",   desc:"A 10-foot wooden ladder." },
  "Tinderbox":            { type:"gear", category:"Tools",       weight:1,  cost:"5 sp",   desc:"Flint, fire steel, and tinder. Lighting a fire takes 1 action (torch) to 1 minute (campfire)." },
  "Torch":                { type:"gear", category:"Light",       weight:1,  cost:"1 cp",   desc:"Burns for 1 hour, shedding bright light in a 20-ft radius and dim light for another 20 ft. Can deal 1 fire damage on a hit." },
  "Candle":               { type:"gear", category:"Light",       weight:0,  cost:"1 cp",   desc:"Burns for 1 hour, shedding bright light in a 5-ft radius and dim light for another 5 ft." },
  "Lamp":                 { type:"gear", category:"Light",       weight:1,  cost:"5 sp",   desc:"Burns oil. Sheds bright light in a 15-ft radius and dim light for 30 ft. Burns for 6 hours on a flask of oil." },
  "Lantern, Bullseye":    { type:"gear", category:"Light",       weight:2,  cost:"10 gp",  desc:"Casts bright light in a 60-ft cone and dim light for another 60 ft. Burns for 6 hours per flask of oil." },
  "Lantern, Hooded":      { type:"gear", category:"Light",       weight:2,  cost:"5 gp",   desc:"Sheds bright light in a 30-ft radius and dim light for 30 ft. Can be hooded (dim light 5-ft radius). Burns for 6 hours." },
  "Oil Flask":            { type:"gear", category:"Light",       weight:1,  cost:"1 sp",   desc:"Can fuel a lamp or lantern for 6 hours, or be thrown as a splash weapon (DC 10 DEX, 5 fire damage for 2 rounds)." },
  "Bedroll":              { type:"gear", category:"Comfort",     weight:7,  cost:"1 gp",   desc:"Provides comfortable sleeping. Required for most Long Rest scenarios in the wild." },
  "Blanket":              { type:"gear", category:"Comfort",     weight:3,  cost:"5 sp",   desc:"Keeps you warm. Useful in cold climates." },
  "Rations (1 day)":      { type:"gear", category:"Supplies",    weight:2,  cost:"5 sp",   desc:"Dry food suitable for extended travel (hard biscuits, dried fruit, jerky)." },
  "Waterskin":            { type:"gear", category:"Supplies",    weight:5,  cost:"2 sp",   desc:"Holds 4 pints of liquid (full weight 5 lb)." },
  "Mess Kit":             { type:"gear", category:"Supplies",    weight:1,  cost:"2 sp",   desc:"Tin box with a cup, cutlery, and a pot; enough for one person." },
  "Soap":                 { type:"gear", category:"Supplies",    weight:0,  cost:"2 cp",   desc:"A bar of mundane soap." },
  "Caltrops (bag of 20)": { type:"gear", category:"Combat",      weight:2,  cost:"1 gp",   desc:"Scatter over 5-ft square. Creatures moving through must make DC 15 DEX save or stop and take 1 piercing damage; Speed reduced by 10 until healed." },
  "Ball Bearings (bag)":  { type:"gear", category:"Combat",      weight:2,  cost:"1 gp",   desc:"Pour over 10-ft square. Creatures moving through make DC 10 DEX save or fall Prone." },
  "Hunting Trap":         { type:"gear", category:"Combat",      weight:25, cost:"5 gp",   desc:"DC 13 DEX save or stopped. 2d6 piercing damage + grappled until freed (DC 13 STR or thieves' tools)." },
  "Acid (vial)":          { type:"gear", category:"Combat",      weight:1,  cost:"25 gp",  desc:"As an action, throw at creature or object within 20 ft. 2d6 acid damage on a hit, 1 on save (DC 10 DEX)." },
  "Alchemist's Fire":     { type:"gear", category:"Combat",      weight:1,  cost:"50 gp",  desc:"Sticky flammable material. Throw up to 20 ft. Target takes 1d4 fire per turn until the fire is put out (action, DC 10 DEX)." },
  "Antitoxin":            { type:"gear", category:"Medicine",    weight:0,  cost:"50 gp",  desc:"Advantage on CON saving throws against poison for 1 hour. Not affected by natural poisons." },
  "Healer's Kit":         { type:"gear", category:"Medicine",    weight:3,  cost:"5 gp",   desc:"10 uses. As an action, stabilise a creature at 0 HP without a Medicine check." },
  "Herbalism Kit":        { type:"gear", category:"Tools",       weight:3,  cost:"5 gp",   desc:"Proficiency allows you to identify and apply herbs. Used to craft antitoxin and healing potions." },
  "Thieves' Tools":       { type:"gear", category:"Tools",       weight:1,  cost:"25 gp",  desc:"Proficiency required for pick-lock and disarm-trap checks. Small file, set of lock picks, mirror, scissors, pliers." },
  "Climber's Kit":        { type:"gear", category:"Tools",       weight:12, cost:"25 gp",  desc:"Pitons, boot tips, gloves, harness. Lets you use climber's kit to anchor yourself. No longer fall if you fail by 4 or less." },
  "Disguise Kit":         { type:"gear", category:"Tools",       weight:3,  cost:"25 gp",  desc:"Cosmetics, hair dye, small props. Proficiency lets you make Charisma (Deception) checks to change your appearance." },
  "Forgery Kit":          { type:"gear", category:"Tools",       weight:5,  cost:"15 gp",  desc:"Papers, wax, gold and copper wire. Proficiency lets you forge documents and replicate signatures." },
  "Navigator's Tools":    { type:"gear", category:"Tools",       weight:2,  cost:"25 gp",  desc:"Sextant, compass, charts. Proficiency lets you chart a course and avoid hazards." },
  "Poisoner's Kit":       { type:"gear", category:"Tools",       weight:2,  cost:"50 gp",  desc:"Vials, chemicals, stirring rods. Proficiency lets you craft poisons." },
  "Spellbook":            { type:"gear", category:"Spellcasting",weight:3,  cost:"50 gp",  desc:"Essential for Wizards. Holds your prepared spells. Lose it and you lose access to your spells until you copy them again." },
  "Holy Symbol":          { type:"gear", category:"Spellcasting",weight:1,  cost:"5 gp",   desc:"Amulet, emblem, or reliquary. Clerics and Paladins can use this as a spellcasting focus." },
  "Druidic Focus":        { type:"gear", category:"Spellcasting",weight:1,  cost:"1 gp",   desc:"Sprig of mistletoe, totem, wooden staff, or yew wand. Druids can use this as a spellcasting focus." },
  "Arcane Focus":         { type:"gear", category:"Spellcasting",weight:1,  cost:"10 gp",  desc:"Crystal, orb, rod, staff, or wand. Wizards, Sorcerers, and Warlocks can use this as a spellcasting focus." },
  "Component Pouch":      { type:"gear", category:"Spellcasting",weight:2,  cost:"25 gp",  desc:"Leather pouch with material components for spellcasting (replaces most individual components)." },
  "Ink and Pen":          { type:"gear", category:"Scholar",     weight:0,  cost:"10 gp",  desc:"A vial of black ink and a quill pen. Required for scribing spells and writing notes." },
  "Parchment (sheet)":    { type:"gear", category:"Scholar",     weight:0,  cost:"1 sp",   desc:"A single sheet of parchment suitable for writing." },
  "Book":                 { type:"gear", category:"Scholar",     weight:5,  cost:"25 gp",  desc:"A blank or lore-filled book of 100 pages." },
  "Map or Scroll Case":   { type:"gear", category:"Scholar",     weight:1,  cost:"1 gp",   desc:"Protects up to 10 rolled sheets of parchment or 5 rolled maps." },
  "Abacus":               { type:"gear", category:"Scholar",     weight:2,  cost:"2 gp",   desc:"Wooden frame with beads for mathematical calculation." },
  "Mirror, Steel":        { type:"gear", category:"Tools",       weight:0.5,cost:"5 gp",   desc:"A small hand mirror. Useful for seeing around corners or signalling." },
  "Magnifying Glass":     { type:"gear", category:"Scholar",     weight:0,  cost:"100 gp", desc:"Grants Advantage on Investigation checks to examine fine details. Can start fires in bright sunlight." },
  "Spyglass":             { type:"gear", category:"Scholar",     weight:1,  cost:"1000 gp",desc:"Magnifies objects up to 5× while viewing through it." },
  "Signal Whistle":       { type:"gear", category:"Tools",       weight:0,  cost:"5 cp",   desc:"Can be heard clearly up to 600 ft in open terrain." },
  "Hourglass":            { type:"gear", category:"Tools",       weight:1,  cost:"25 gp",  desc:"Measures one hour." },
  "Manacles":             { type:"gear", category:"Tools",       weight:6,  cost:"2 gp",   desc:"Can bind a Small or Medium creature. Breaking free requires DC 20 STR check or lockpicking (DC 15)." },
  "Padlock":              { type:"gear", category:"Tools",       weight:1,  cost:"5 gp",   desc:"A sturdy lock with a key. DC 15 to pick. Useful for securing chests and doors." },
  "Sealing Wax":          { type:"gear", category:"Tools",       weight:0,  cost:"5 sp",   desc:"Used to seal letters and documents with a signet impression." },
  "Tent, Two-Person":     { type:"gear", category:"Comfort",     weight:20, cost:"2 gp",   desc:"A portable shelter for two. Provides protection from wind and light rain." },
  "Fishing Tackle":       { type:"gear", category:"Supplies",    weight:4,  cost:"1 gp",   desc:"A hook, line, sinker, and rod. Proficiency allows catching fish during a Short Rest." },
  "Hammer":               { type:"gear", category:"Tools",       weight:3,  cost:"1 gp",   desc:"Standard hammer. Can drive pitons, hang things, break light objects." },
  "Piton":                { type:"gear", category:"Tools",       weight:0.25,cost:"5 cp",  desc:"An iron spike used for climbing. Each holds up to 250 lb." },
  "Grappling Hook":       { type:"gear", category:"Tools",       weight:4,  cost:"2 gp",   desc:"Attach to a rope and throw up to 20 ft. A DC 13 STR check to set firmly." },
  "Basket":               { type:"gear", category:"Container",   weight:2,  cost:"4 sp",   desc:"Wicker basket. Holds 2 cubic feet / 40 lb." },
  "Bucket":               { type:"gear", category:"Container",   weight:2,  cost:"5 cp",   desc:"Holds 3 gallons of liquid or ½ cubic foot of solid material." },
  "Block and Tackle":     { type:"gear", category:"Tools",       weight:5,  cost:"1 gp",   desc:"A set of pulleys with a cable. Allows you to lift 4× the weight you normally could." },
  "Shovel":               { type:"gear", category:"Tools",       weight:5,  cost:"2 gp",   desc:"A sturdy spade for digging. Standard tool for gravedigging and earthwork." },
  "Sledgehammer":         { type:"gear", category:"Tools",       weight:10, cost:"2 gp",   desc:"A heavy hammer for breaking stone, doors, and other large objects." },
  "Vial":                 { type:"gear", category:"Container",   weight:0,  cost:"1 gp",   desc:"A small glass vial. Holds up to 4 ounces of liquid." },
  "Flask or Tankard":     { type:"gear", category:"Container",   weight:1,  cost:"2 cp",   desc:"Holds up to 8 ounces of liquid." },
  "Jug or Pitcher":       { type:"gear", category:"Container",   weight:4,  cost:"2 cp",   desc:"Holds up to 1 gallon of liquid." },
  "Cooking Pot":          { type:"gear", category:"Supplies",    weight:10, cost:"2 gp",   desc:"A large iron pot suitable for camp cooking." },
  "Fine Clothes":         { type:"gear", category:"Clothing",    weight:6,  cost:"15 gp",  desc:"Elegant outfit. Required for some social interactions at noble courts." },
  "Traveller's Clothes":  { type:"gear", category:"Clothing",    weight:4,  cost:"2 gp",   desc:"Practical outfit for travel: boots, cloak, breeches, shirt." },
  "Costume":              { type:"gear", category:"Clothing",    weight:4,  cost:"5 gp",   desc:"A complete disguise or performance costume." },
  "Robes":                { type:"armor", armorType:"clothing", acBase:10, weight:4,  cost:"1 gp",   stealthDis:false, strReq:0, desc:"Simple robes. AC 10 + DEX modifier." },
  "Wizard's Robes":       { type:"armor", armorType:"clothing", acBase:10, weight:4,  cost:"5 gp",   stealthDis:false, strReq:0, desc:"Long flowing robes favoured by arcane spellcasters. AC 10 + DEX modifier." },
  "Monk's Robes":         { type:"armor", armorType:"clothing", acBase:10, weight:3,  cost:"2 gp",   stealthDis:false, strReq:0, desc:"Light, practical robes suited to martial movement and meditation. AC 10 + DEX modifier." },
  "Cleric's Vestments":   { type:"armor", armorType:"clothing", acBase:10, weight:4,  cost:"5 gp",   stealthDis:false, strReq:0, desc:"Ceremonial vestments of a religious order. AC 10 + DEX modifier." },
  "Druid's Robes":        { type:"armor", armorType:"clothing", acBase:10, weight:4,  cost:"2 gp",   stealthDis:false, strReq:0, desc:"Naturally dyed robes made of rough-spun wool or plant fibre. AC 10 + DEX modifier." },
  "Noble's Outfit":       { type:"gear", category:"Clothing",    weight:6,  cost:"75 gp",  desc:"Silk, velvet, and gold-thread. Grants Advantage on Charisma checks in aristocratic social situations." },
  "Cloak":                { type:"gear", category:"Clothing",    weight:1,  cost:"1 gp",   desc:"A simple travelling cloak. Provides minor weather protection." },
  "Hooded Cloak":         { type:"gear", category:"Clothing",    weight:1,  cost:"1 gp",   desc:"A cloak with a deep hood. Useful for concealing identity in crowds." },
  // ── PACKS ──
  "Explorer's Pack":      { type:"gear", category:"Packs",       weight:59, cost:"10 gp",  desc:"Backpack, bedroll, mess kit, tinderbox, 10 torches, 10 days rations, waterskin, 50 ft hempen rope." },
  "Burglar's Pack":       { type:"gear", category:"Packs",       weight:47, cost:"16 gp",  desc:"Backpack, ball bearings, 10 ft string, bell, candles, crowbar, hammer, pitons, lantern, oil, rations, tinderbox, waterskin." },
  "Diplomat's Pack":      { type:"gear", category:"Packs",       weight:36, cost:"39 gp",  desc:"Chest, fine clothes, ink, pen, lamp, 2 oil flasks, papers, perfume, sealing wax, soap." },
  "Dungeoneer's Pack":    { type:"gear", category:"Packs",       weight:61, cost:"12 gp",  desc:"Backpack, crowbar, hammer, 10 pitons, 10 torches, tinderbox, 10 days rations, waterskin, 50 ft hempen rope." },
  "Entertainer's Pack":   { type:"gear", category:"Packs",       weight:38, cost:"40 gp",  desc:"Backpack, bedroll, 2 costumes, 5 candles, rations, waterskin, disguise kit." },
  "Priest's Pack":        { type:"gear", category:"Packs",       weight:24, cost:"19 gp",  desc:"Backpack, blanket, 10 candles, tinderbox, alms box, 2 incense blocks, censer, vestments, 2 days rations, waterskin." },
  "Scholar's Pack":       { type:"gear", category:"Packs",       weight:22, cost:"40 gp",  desc:"Backpack, book of lore, ink, pen, 10 parchment sheets, sand bag, small knife." },
  // ── MUSICAL INSTRUMENTS ──
  "Lute":                 { type:"gear", category:"Musical Instrument", weight:2, cost:"35 gp",  desc:"A stringed instrument. Bards are commonly proficient with the lute." },
  "Flute":                { type:"gear", category:"Musical Instrument", weight:1, cost:"2 gp",   desc:"A simple wind instrument." },
  "Drum":                 { type:"gear", category:"Musical Instrument", weight:3, cost:"6 gp",   desc:"A percussion instrument." },
  "Viol":                 { type:"gear", category:"Musical Instrument", weight:1, cost:"30 gp",  desc:"A bowed stringed instrument, similar to a modern violin." },
  "Horn":                 { type:"gear", category:"Musical Instrument", weight:2, cost:"3 gp",   desc:"A brass horn. Can double as a signal instrument." },
  // ── HEALING & POTIONS ──
  "Potion of Healing":    { type:"gear", category:"Potion",      weight:0.5,cost:"50 gp",  desc:"Drinking restores 2d4+2 HP. Takes an action to drink or administer." },
  "Potion of Greater Healing":{ type:"gear", category:"Potion",  weight:0.5,cost:"150 gp", desc:"Restores 4d4+4 HP." },
  "Potion of Superior Healing":{ type:"gear", category:"Potion", weight:0.5,cost:"500 gp", desc:"Restores 8d4+8 HP." },
  "Antitoxin":            { type:"gear", category:"Potion",      weight:0,  cost:"50 gp",  desc:"Advantage on CON saves against poison for 1 hour." },
  // ── ARTISAN'S TOOLS ──
  "Alchemist's Supplies": { type:"gear", category:"Artisan Tools",weight:8, cost:"50 gp",  desc:"Proficiency lets you identify potions and poisons, and craft alchemical items." },
  "Brewer's Supplies":    { type:"gear", category:"Artisan Tools",weight:9, cost:"20 gp",  desc:"Proficiency lets you brew ales, mead, and identify alcoholic drinks." },
  "Calligrapher's Supplies":{ type:"gear", category:"Artisan Tools",weight:5,cost:"10 gp", desc:"Inks, pens, paper. Proficiency used for illuminating texts and documents." },
  "Carpenter's Tools":    { type:"gear", category:"Artisan Tools",weight:6, cost:"8 gp",   desc:"Adze, saw, plane. Proficiency used for building and repairing wooden structures." },
  "Cartographer's Tools": { type:"gear", category:"Artisan Tools",weight:6, cost:"15 gp",  desc:"Proficiency lets you draw accurate maps and identify terrain." },
  "Cobbler's Tools":      { type:"gear", category:"Artisan Tools",weight:5, cost:"5 gp",   desc:"Proficiency used for crafting and repairing footwear." },
  "Cook's Utensils":      { type:"gear", category:"Artisan Tools",weight:8, cost:"1 gp",   desc:"Proficiency used for preparing food. Chef feat requires this." },
  "Glassblower's Tools":  { type:"gear", category:"Artisan Tools",weight:5, cost:"30 gp",  desc:"Proficiency for crafting glass objects and identifying glass-based items." },
  "Jeweller's Tools":     { type:"gear", category:"Artisan Tools",weight:2, cost:"25 gp",  desc:"Proficiency for appraising and crafting jewellery." },
  "Leatherworker's Tools":{ type:"gear", category:"Artisan Tools",weight:5, cost:"5 gp",   desc:"Proficiency for crafting leather goods including armour components." },
  "Mason's Tools":        { type:"gear", category:"Artisan Tools",weight:8, cost:"10 gp",  desc:"Proficiency for stonecutting and masonry work." },
  "Painter's Supplies":   { type:"gear", category:"Artisan Tools",weight:5, cost:"10 gp",  desc:"Brushes, pigments, canvas. Proficiency for visual arts." },
  "Potter's Tools":       { type:"gear", category:"Artisan Tools",weight:3, cost:"10 gp",  desc:"Proficiency for crafting ceramic goods." },
  "Smith's Tools":        { type:"gear", category:"Artisan Tools",weight:8, cost:"20 gp",  desc:"Hammer, tongs, bellows. Proficiency for metalwork and armour repair." },
  "Tinker's Tools":       { type:"gear", category:"Artisan Tools",weight:10,cost:"50 gp",  desc:"Proficiency for crafting small mechanical devices and clockwork items." },
  "Weaver's Tools":       { type:"gear", category:"Artisan Tools",weight:5, cost:"1 gp",   desc:"Proficiency for crafting textiles and clothing." },
  "Woodcarver's Tools":   { type:"gear", category:"Artisan Tools",weight:5, cost:"1 gp",   desc:"Proficiency for crafting wooden objects and decorative items." },
  // ── GAMING SETS ──
  "Dice Set":             { type:"gear", category:"Gaming Set",  weight:0,  cost:"1 sp",   desc:"A set of dice for games of chance." },
  "Dragonchess Set":      { type:"gear", category:"Gaming Set",  weight:0.5,cost:"1 gp",   desc:"A 3D version of chess popular in the Forgotten Realms." },
  "Playing Card Set":     { type:"gear", category:"Gaming Set",  weight:0,  cost:"5 sp",   desc:"A standard deck of cards." },
  "Three-Dragon Ante Set":{ type:"gear", category:"Gaming Set",  weight:0,  cost:"1 gp",   desc:"A card game of risk and bluffing." },
};


// ─── STARTING EQUIPMENT BY CLASS ─────────────────────────────────────────────
// "packs": array of equipment sets (player picks one option per group)
// "gold": starting gold (player chooses equipment packs OR buys with gold)
const CLASS_EQUIPMENT = {
  Barbarian: {
    gold: 75,
    packs: [
      { label:"Option A", items:["Greataxe","4× Handaxe","Explorer's Pack"] },
      { label:"Option B", items:["Handaxe","Handaxe","Explorer's Pack"] },
    ],
  },
  Bard: {
    gold: 125,
    packs: [
      { label:"Option A", items:["Rapier","Diplomat's Pack","Leather Armor","Dagger","Musical Instrument"] },
      { label:"Option B", items:["Longsword","Diplomat's Pack","Leather Armor","Dagger","Musical Instrument"] },
      { label:"Option C", items:["Shortsword","Entertainer's Pack","Leather Armor","Dagger","Musical Instrument"] },
    ],
  },
  Cleric: {
    gold: 110,
    packs: [
      { label:"Option A", items:["Mace","Scale Mail","Light Crossbow","Priest's Pack","Shield","Holy Symbol"] },
      { label:"Option B", items:["Mace","Leather Armor","Light Crossbow","Priest's Pack","Shield","Holy Symbol"] },
    ],
  },
  Druid: {
    gold: 50,
    packs: [
      { label:"Option A", items:["Quarterstaff","Leather Armor","Explorer's Pack","Druidic Focus"] },
      { label:"Option B", items:["Quarterstaff","Leather Armor","Explorer's Pack","Druidic Focus","Shield"] },
    ],
  },
  Fighter: {
    gold: 175,
    packs: [
      { label:"Option A (Heavy)", items:["Chain Mail","Longsword","Shield","Light Crossbow","Dungeoneer's Pack"] },
      { label:"Option B (Ranged)", items:["Leather Armor","Longsword","Shortbow","Dungeoneer's Pack"] },
    ],
  },
  Monk: {
    gold: 5,
    packs: [
      { label:"Option A", items:["Shortsword","Dungeoneer's Pack"] },
      { label:"Option B", items:["Shortsword","Shortsword","Dungeoneer's Pack"] },
    ],
  },
  Paladin: {
    gold: 150,
    packs: [
      { label:"Option A", items:["Longsword","Shield","Javelin","Javelin","Javelin","Javelin","Javelin","Priest's Pack","Chain Mail","Holy Symbol"] },
      { label:"Option B", items:["Greataxe","Javelin","Javelin","Javelin","Javelin","Javelin","Priest's Pack","Chain Mail","Holy Symbol"] },
    ],
  },
  Ranger: {
    gold: 125,
    packs: [
      { label:"Option A", items:["Scale Mail","Shortsword","Shortsword","Dungeoneer's Pack","Longbow"] },
      { label:"Option B", items:["Leather Armor","Longsword","Dungeoneer's Pack","Shortbow"] },
    ],
  },
  Rogue: {
    gold: 100,
    packs: [
      { label:"Option A", items:["Rapier","Shortbow","Burglar's Pack","Leather Armor","Dagger","Dagger","Thieves' Tools"] },
      { label:"Option B", items:["Shortsword","Shortbow","Burglar's Pack","Leather Armor","Dagger","Dagger","Thieves' Tools"] },
    ],
  },
  Sorcerer: {
    gold: 75,
    packs: [
      { label:"Option A", items:["Light Crossbow","Dungeoneer's Pack","Arcane Focus","Dagger","Dagger"] },
      { label:"Option B", items:["Light Crossbow","Dungeoner's Pack","Component Pouch","Dagger","Dagger"] },
    ],
  },
  Warlock: {
    gold: 100,
    packs: [
      { label:"Option A", items:["Light Crossbow","Dungeoneer's Pack","Arcane Focus","Dagger","Dagger","Leather Armor"] },
      { label:"Option B", items:["Rapier","Dungeoneer's Pack","Component Pouch","Dagger","Leather Armor"] },
    ],
  },
  Wizard: {
    gold: 75,
    packs: [
      { label:"Option A", items:["Quarterstaff","Scholar's Pack","Arcane Focus","Spellbook"] },
      { label:"Option B", items:["Dagger","Scholar's Pack","Component Pouch","Spellbook"] },
    ],
  },
  Barbarian_extra: null,
  Monk_extra: null,
};

// AC calculation from equipped items
// Returns the auto-calculated AC from equipped items, or null if nothing relevant equipped.
// Rules:
//   heavy armour  → acBase, no DEX
//   medium armour → acBase + DEX (max +2)
//   light armour  → acBase + full DEX
//   clothing/robes → treated as unarmoured (don't override manual AC)
//   shield        → flat +2 bonus, no DEX contribution of its own
//   unarmoured    → 10 + full DEX (only when real armour is equipped; shield-only falls back to manual)
function calcEquippedAC(equippedItems, dexMod) {
  let bodyAC = null, bodyType = null, shieldBonus = 0;
  (equippedItems||[]).forEach(item => {
    const d = EQUIPMENT_DB[item.name] || EQUIPMENT_DB[item.baseName];
    if (!d) return;
    // All armour except shields sets the body AC (clothing/robes = light, full DEX)
    if (d.type === "armor" && d.armorType !== "shield") {
      bodyAC   = d.acBase;
      bodyType = d.armorType;   // "light" | "medium" | "heavy" | "clothing"
    }
    if (d.type === "armor" && d.armorType === "shield") {
      shieldBonus = 2;          // flat +2, no DEX
    }
  });
  // Nothing that affects AC is equipped → let caller use manual/default AC
  if (bodyAC === null && shieldBonus === 0) return null;
  // Shield equipped but no body armour → add +2 to whatever the caller's base is.
  // Return null so caller applies it: caller's base (manual or 10+DEX) + 2.
  // We signal "shield only" by returning a sentinel we handle in derivedAC instead.
  if (bodyAC === null) return { shieldOnly: true, bonus: 2 };
  // Body armour equipped
  const dexContrib = bodyType === "heavy"  ? 0
                   : bodyType === "medium" ? Math.min(dexMod, 2)
                   :                        dexMod;  // light or clothing → full DEX
  return bodyAC + dexContrib + shieldBonus;
}

// Attack roll bonus for a weapon item
function calcAttackBonus(item, strMod, dexMod, pb) {
  const d = EQUIPMENT_DB[item.name] || EQUIPMENT_DB[item.baseName];
  if (!d || d.type !== "weapon") return null;
  const useDex = d.finesse ? Math.max(strMod, dexMod) > strMod : false;
  const abilityMod = (d.weaponType === "ranged" || useDex) ? dexMod : strMod;
  return abilityMod + pb;
}

// ─── DEFAULT CHAR ─────────────────────────────────────────────────────────────
const defaultChar = {
  id:null,name:"",playerName:"",class:"",subclass:"",level:1,background:"",species:"",alignment:"",xp:0,inspiration:false,
  abilities:{STR:10,DEX:10,CON:10,INT:10,WIS:10,CHA:10},
  savingThrows:{STR:false,DEX:false,CON:false,INT:false,WIS:false,CHA:false},
  classSkills:[],speciesSkills:[],
  skills:{Acrobatics:{ability:"DEX",proficient:false,expert:false},"Animal Handling":{ability:"WIS",proficient:false,expert:false},Arcana:{ability:"INT",proficient:false,expert:false},Athletics:{ability:"STR",proficient:false,expert:false},Deception:{ability:"CHA",proficient:false,expert:false},History:{ability:"INT",proficient:false,expert:false},Insight:{ability:"WIS",proficient:false,expert:false},Intimidation:{ability:"CHA",proficient:false,expert:false},Investigation:{ability:"INT",proficient:false,expert:false},Medicine:{ability:"WIS",proficient:false,expert:false},Nature:{ability:"INT",proficient:false,expert:false},Perception:{ability:"WIS",proficient:false,expert:false},Performance:{ability:"CHA",proficient:false,expert:false},Persuasion:{ability:"CHA",proficient:false,expert:false},Religion:{ability:"INT",proficient:false,expert:false},"Sleight of Hand":{ability:"DEX",proficient:false,expert:false},Stealth:{ability:"DEX",proficient:false,expert:false},Survival:{ability:"WIS",proficient:false,expert:false}},
  hp:{max:10,current:10,temp:0},hpManual:false,ac:10,initiative:0,speed:30,hitDice:{total:"1d8",used:0},deathSaves:{successes:0,failures:0},
  slotsUsed:{1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0},
  spells:[],
  // Equipment: each item {id, name, qty, weight, equipped, notes}
  equipment:[],
  equipMode:"packs", // "packs" | "gold"
  feats:[],          // array of feat names the character has
  inventory:[],cp:0,sp:0,ep:0,gp:0,pp:0,
  toolProficiencies:[],
  extraLanguages:[],
  proficiencies:"",languages:"",features:"",traits:"",ideals:"",bonds:"",flaws:"",notes:"",
};

const CLASSES=["Barbarian","Bard","Cleric","Druid","Fighter","Monk","Paladin","Ranger","Rogue","Sorcerer","Warlock","Wizard"];
const BACKGROUNDS=["Acolyte","Charlatan","Criminal","Entertainer","Folk Hero","Guild Artisan","Hermit","Noble","Outlander","Sage","Sailor","Soldier","Urchin","Gladiator","Haunted One","Knight","Pirate","Spy"];
const SPECIES=["Human","Elf","Dwarf","Halfling","Gnome","Half-Elf","Half-Orc","Tiefling","Dragonborn","Aasimar","Goliath","Tabaxi","Kenku","Lizardfolk","Tortle","Fairy","Harengon","Owlin","Satyr","Custom"];
const ALIGNMENTS=["Lawful Good","Neutral Good","Chaotic Good","Lawful Neutral","True Neutral","Chaotic Neutral","Lawful Evil","Neutral Evil","Chaotic Evil","Unaligned"];
const SUBCLASSES={Fighter:["Battle Master","Champion","Eldritch Knight","Psi Warrior","Echo Knight","Rune Knight","Samurai","Arcane Archer","Banneret"],Rogue:["Arcane Trickster","Assassin","Inquisitive","Mastermind","Phantom","Scout","Soulknife","Swashbuckler","Thief"],Barbarian:["Berserker","Totem Warrior","Ancestral Guardian","Storm Herald","Zealot","Beast","Wild Magic","Giant"],Monk:["Way of the Open Hand","Way of Shadow","Way of the Four Elements","Way of the Astral Self","Way of the Drunken Master","Way of the Kensei","Way of Mercy","Way of the Sun Soul"],Bard:["College of Lore","College of Valor","College of Glamour","College of Swords","College of Whispers","College of Creation","College of Eloquence","College of Spirits"],Cleric:["Life","Light","Trickery","War","Nature","Tempest","Knowledge","Forge","Grave","Arcana","Death","Order","Peace","Twilight"],Druid:["Circle of the Land","Circle of the Moon","Circle of Dreams","Circle of the Shepherd","Circle of Spores","Circle of Stars","Circle of Wildfire"],Paladin:["Oath of Devotion","Oath of the Ancients","Oath of Vengeance","Oath of Conquest","Oath of Redemption","Oath of Glory","Oath of the Watchers","Oathbreaker"],Ranger:["Hunter","Beast Master","Gloom Stalker","Horizon Walker","Monster Slayer","Fey Wanderer","Swarmkeeper","Drakewarden"],Sorcerer:["Draconic Bloodline","Wild Magic","Divine Soul","Shadow Magic","Storm Sorcery","Aberrant Mind","Clockwork Soul"],Warlock:["Archfey","Fiend","Great Old One","Undying","Celestial","Hexblade","Fathomless","Genie"],Wizard:["School of Abjuration","School of Conjuration","School of Divination","School of Enchantment","School of Evocation","School of Illusion","School of Necromancy","School of Transmutation","Bladesinging","Order of Scribes","War Magic","Chronurgy Magic","Graviturgy Magic"]};

const pb = l=>Math.ceil(l/4)+1;
const mod = s=>Math.floor((s-10)/2);
const fmt = m=>m>=0?`+${m}`:`${m}`;

// ─── STANDARD ARRAY & ABILITY SUGGESTIONS ────────────────────────────────────
const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
const AB_ORDER = ["STR","DEX","CON","INT","WIS","CHA"];

// Per-class suggested array assignments + rationale for each score
const CLASS_ABILITY_SUGGESTIONS = {
  Barbarian: {
    label: "Strength Barbarian",
    spread: { STR:15, CON:14, DEX:13, WIS:12, CHA:10, INT:8 },
    rationale: {
      STR:"Your primary attack stat — every melee hit and damage roll scales off this.",
      DEX:"Unarmoured Defence uses DEX; also helps Dexterity saves and initiative.",
      CON:"Second pillar of Unarmoured Defence, and your enormous HP pool scales with CON.",
      WIS:"Wisdom saves protect against many of the most dangerous spells and effects.",
      CHA:"Useful for Intimidation but not mechanically central — can be left low.",
      INT:"Barbarians rarely need INT — safe dump stat.",
    },
  },
  Bard: {
    label: "Face / Spellcaster",
    spread: { CHA:15, DEX:14, CON:13, WIS:12, INT:10, STR:8 },
    rationale: {
      CHA:"Your spellcasting ability for all spells and Bardic Inspiration — must be highest.",
      DEX:"Bards wear light armour; DEX feeds your AC, initiative, and Dexterity saves.",
      CON:"High CON lets you maintain Concentration spells under fire and boosts HP.",
      WIS:"Wisdom saves are among the most common in the game — keep this respectable.",
      INT:"Bards are knowledgeable but INT isn't mechanically critical — leave it average.",
      STR:"You're not swinging swords — safe to dump.",
    },
  },
  Cleric: {
    label: "Divine Caster",
    spread: { WIS:15, CON:14, STR:13, CHA:12, DEX:10, INT:8 },
    rationale: {
      WIS:"Your spellcasting ability — every spell save DC, attack roll, and Channel Divinity scales here.",
      CON:"Clerics are front-line healers who need Concentration; high CON keeps those spells alive.",
      STR:"Many Clerics wear heavy armour and wade into melee — STR helps attack rolls if you do.",
      CHA:"Useful for Turn Undead effects and social encounters; secondary priority.",
      DEX:"With heavy armour DEX doesn't help your AC — useful only for saves and Stealth.",
      INT:"Almost no Cleric features use INT — safe dump stat.",
    },
  },
  Druid: {
    label: "Nature Caster / Wild Shaper",
    spread: { WIS:15, CON:14, DEX:13, INT:12, CHA:10, STR:8 },
    rationale: {
      WIS:"Your spellcasting ability — governs spell save DC and attack rolls for all Druid magic.",
      CON:"Concentration spells (Entangle, Conjure Animals, etc.) dominate Druid playstyle — CON saves matter.",
      DEX:"Druids wear medium armour; DEX adds up to +2 AC and helps initiative.",
      INT:"Nature, History, and Arcana checks use INT; decent secondary stat for knowledgeable Druids.",
      CHA:"Not central to Druid mechanics — can stay average.",
      STR:"Wild Shape replaces your physical stats — STR is a safe dump stat.",
    },
  },
  Fighter: {
    label: "Strength Fighter",
    spread: { STR:15, CON:14, DEX:13, WIS:12, INT:10, CHA:8 },
    rationale: {
      STR:"Your attack and damage stat for all melee weapons — the heart of your combat effectiveness.",
      CON:"More HP and better Constitution saving throws; critical for surviving in the front line.",
      DEX:"Even with heavy armour, DEX boosts Dexterity saves and Acrobatics.",
      WIS:"Wisdom saves protect against mind-control spells that can turn you against your party.",
      INT:"Knowledge skills can be useful; not mechanically critical for most Fighter builds.",
      CHA:"Fighters rarely lead social encounters — safe dump stat unless you're the party face.",
    },
  },
  Monk: {
    label: "Ki Warrior",
    spread: { DEX:15, WIS:14, CON:13, STR:12, CHA:10, INT:8 },
    rationale: {
      DEX:"Monks use DEX for attacks, AC (Unarmoured Defence), and Acrobatics — your most important stat.",
      WIS:"Second half of Unarmoured Defence (AC = 10 + DEX + WIS); also powers Stunning Strike saves.",
      CON:"Boosts HP and CON saves; helpful for maintaining focus mid-combat.",
      STR:"Some Monk features use STR for grappling and Athletics — useful but not critical.",
      CHA:"Monks are disciplined, not charismatic — safe to leave average.",
      INT:"Almost no Monk features use INT — safe dump stat.",
    },
  },
  Paladin: {
    label: "Holy Warrior",
    spread: { STR:15, CHA:14, CON:13, WIS:12, DEX:10, INT:8 },
    rationale: {
      STR:"Your attack and damage stat for all Paladin melee combat and Divine Smite.",
      CHA:"Powers Aura of Protection (arguably the strongest class feature in the game), Lay on Hands, and spellcasting DC.",
      CON:"Front-line durability and Concentration for Bless — keep this solid.",
      WIS:"Wisdom saves are common and dangerous; decent secondary priority.",
      DEX:"Heavy armour negates the AC benefit — useful only for Dexterity saves.",
      INT:"Paladin features are STR/CHA/CON focused — safe dump stat.",
    },
  },
  Ranger: {
    label: "Ranged Hunter",
    spread: { DEX:15, WIS:14, CON:13, STR:12, INT:10, CHA:8 },
    rationale: {
      DEX:"Your primary attack and damage stat for bows and finesse weapons; also feeds AC in light/medium armour.",
      WIS:"Your spellcasting ability; also helps Perception checks, which Rangers make constantly.",
      CON:"Keeps you alive in the field and protects Concentration spells like Hunter's Mark.",
      STR:"Useful for Athletics and grappling but not central to typical Ranger playstyle.",
      INT:"Investigation and Nature are on-theme but INT isn't mechanically central — leave average.",
      CHA:"Rangers are solitary — not the party face. Safe to dump.",
    },
  },
  Rogue: {
    label: "Sneak Attacker",
    spread: { DEX:15, CON:14, INT:13, WIS:12, CHA:10, STR:8 },
    rationale: {
      DEX:"Everything — attacks, damage, AC, Stealth, Sleight of Hand, Thieves' Tools. Your single most important stat.",
      CON:"Rogues get into trouble; high CON keeps you breathing long enough to Disengage.",
      INT:"Investigation, Arcana, and History are common Rogue skills; many archetypes (Arcane Trickster) use INT.",
      WIS:"Insight and Perception are critical for a Rogue — keeping WIS respectable pays off constantly.",
      CHA:"Useful for Deception and Persuasion; worth keeping decent but not a top priority.",
      STR:"You avoid direct confrontations — safe dump stat.",
    },
  },
  Sorcerer: {
    label: "Innate Caster",
    spread: { CHA:15, CON:14, DEX:13, WIS:12, INT:10, STR:8 },
    rationale: {
      CHA:"Your spellcasting ability — governs every spell save DC and attack roll. Non-negotiable primary stat.",
      CON:"Sorcerers are squishy; CON saves maintain Concentration and CON mod adds to Sorcery Points indirectly.",
      DEX:"Light armour and no shield means DEX directly feeds AC — keep this decent.",
      WIS:"Protects against the most common and dangerous save types (Wisdom saves).",
      INT:"Arcana checks are thematic but INT isn't mechanically important for Sorcerers.",
      STR:"You're lobbing fireballs from the back — safe to dump entirely.",
    },
  },
  Warlock: {
    label: "Pact Caster",
    spread: { CHA:15, CON:14, DEX:13, WIS:12, INT:10, STR:8 },
    rationale: {
      CHA:"Your spellcasting ability for Eldritch Blast, all invocations, and Pact Magic — must be highest.",
      CON:"With only two spell slots, you'll often be in melee range; CON saves and HP matter a lot.",
      DEX:"Light armour means DEX feeds your AC directly — second defensive priority.",
      WIS:"Wisdom saves protect against charm and fear effects — important for front-line Warlocks.",
      INT:"Arcana is thematic but INT has no mechanical role in Warlock features.",
      STR:"Warlocks fight at range or with Hexblade magic — safe dump stat.",
    },
  },
  Wizard: {
    label: "Arcane Scholar",
    spread: { INT:15, CON:14, DEX:13, WIS:12, CHA:10, STR:8 },
    rationale: {
      INT:"Your spellcasting ability — governs every spell save DC, attack roll, and Arcane Recovery. Maximum priority.",
      CON:"The most important secondary stat: CON saves maintain Concentration on spells like Hypnotic Pattern and Fly.",
      DEX:"No armour means DEX is your only AC contribution (unless you cast Mage Armor) — keep this decent.",
      WIS:"Perception is the most rolled skill in the game; WIS saves also protect against many nasty effects.",
      CHA:"Wizards rarely lead social scenes — average is fine.",
      STR:"You're solving problems with magic — safe to dump entirely.",
    },
  },
};

const POINT_BUY_COSTS = {8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};
const POINT_BUY_BUDGET = 27;

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=UnifrakturMaguntia&family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--ink:#1a0a00;--vel:#f5e6c8;--vd:#e8d5a3;--vm:#eeddb5;--gold:#c8952a;--gl:#e8b84b;--cr:#8b1a1a;--crl:#b52222;--br:#5c3317;--brl:#7a4a20;--sh:rgba(26,10,0,.35)}
body{background:#2a1a0a;font-family:'IM Fell English',Georgia,serif;color:var(--ink);min-height:100vh}
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:var(--vd)}::-webkit-scrollbar-thumb{background:var(--br);border-radius:3px}
.app{display:flex;min-height:100vh}
.roster{width:245px;min-width:245px;background:#1a0a02;border-right:3px solid var(--gold);display:flex;flex-direction:column;position:relative;overflow:hidden}
/* ── MOBILE DRAWER ── */
@media(max-width:640px){
  .roster{position:fixed;top:0;left:0;height:100vh;z-index:200;transform:translateX(-100%);transition:transform .28s cubic-bezier(.4,0,.2,1);box-shadow:4px 0 24px rgba(0,0,0,.6)}
  .roster.open{transform:translateX(0)}
  .roster-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:199}
  .roster-overlay.open{display:block}
  .mob-menu-btn{display:flex!important}
  .app{display:block}
  .main{width:100%}
  .hdr{padding:0 10px;min-height:48px;gap:6px}
  .htitle{font-size:18px}
  .hprint{padding:5px 8px;font-size:8px;letter-spacing:.5px}
  .hprint-print{display:none!important}
  .mob-save-btn{display:flex!important}
  .tabs{position:fixed;bottom:0;left:0;right:0;z-index:100;background:#160800;border-top:2px solid rgba(200,149,42,.4);border-bottom:none;justify-content:space-around}
  .tb{flex:1;padding:10px 4px 14px;font-size:8px;letter-spacing:.8px;text-align:center;border-bottom:none!important;border-top:3px solid transparent;margin:0;top:0}
  .tb.ac{border-top-color:var(--gold);border-bottom:none!important;background:rgba(200,149,42,.08)}
  .cnt{padding:10px 8px 70px;overflow-y:auto}
  .idg{grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:7px;padding:8px}
  .abr{gap:6px;padding:8px}
  .ab{width:64px;padding:6px 4px}
  .pg{margin-bottom:8px}
}
.mob-menu-btn{display:none;background:none;border:none;cursor:pointer;color:var(--gold);font-size:22px;padding:4px 6px;line-height:1;flex-shrink:0}
.mob-save-btn{display:none;padding:5px 12px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:1.5px;background:var(--gold);color:var(--ink);border:none;border-radius:3px;cursor:pointer;font-weight:700;text-transform:uppercase;white-space:nowrap}
.roster::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(200,149,42,.06) 29px);pointer-events:none}
.rt{font-family:'Cinzel Decorative',serif;color:var(--gold);font-size:11px;letter-spacing:2px;text-align:center;padding:15px 10px 7px;border-bottom:1px solid rgba(200,149,42,.3);text-shadow:0 0 10px rgba(200,149,42,.4)}
.rorn{text-align:center;color:var(--gold);opacity:.35;font-size:14px;margin:3px 0}
.rl{flex:1;overflow-y:auto;padding:5px}
.ri{padding:8px 10px;margin:3px 0;border-radius:3px;border:1px solid rgba(200,149,42,.18);cursor:pointer;background:rgba(200,149,42,.03);transition:all .2s;position:relative}
.ri:hover{background:rgba(200,149,42,.1);border-color:var(--gold)}
.ri.ac{background:rgba(200,149,42,.14);border-color:var(--gold)}
.rin{font-family:'Cinzel',serif;color:var(--gold);font-size:11px;font-weight:600}
.ris{color:rgba(245,230,200,.4);font-size:9px;font-style:italic;margin-top:2px}
.rdel{position:absolute;right:5px;top:50%;transform:translateY(-50%);color:var(--cr);opacity:0;background:none;border:none;cursor:pointer;font-size:12px;transition:opacity .2s;padding:2px 4px}
.ri:hover .rdel{opacity:1}
.bnew{margin:9px;padding:8px;font-family:'Cinzel',serif;font-size:10px;letter-spacing:1.5px;background:var(--cr);color:var(--vel);border:2px solid var(--crl);border-radius:3px;cursor:pointer;transition:all .2s;text-transform:uppercase}
.bnew:hover{background:var(--crl)}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.hdr{background:linear-gradient(135deg,#1a0a02,#2d1505);border-bottom:3px solid var(--gold);padding:0 16px;display:flex;align-items:center;gap:12px;min-height:58px;flex-wrap:wrap}
.htitle{font-family:'UnifrakturMaguntia',cursive;color:var(--gold);font-size:24px;text-shadow:0 0 16px rgba(200,149,42,.5)}
.hprint{padding:6px 14px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:1.5px;background:transparent;color:rgba(200,149,42,.7);border:1.5px solid rgba(200,149,42,.4);border-radius:3px;cursor:pointer;font-weight:700;text-transform:uppercase;transition:all .2s;white-space:nowrap}
.hprint:hover{background:rgba(200,149,42,.1);color:var(--gold);border-color:var(--gold)}
.hsave{padding:6px 16px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;background:var(--gold);color:var(--ink);border:none;border-radius:3px;cursor:pointer;font-weight:700;text-transform:uppercase;transition:all .2s;white-space:nowrap}
.hsave:hover{background:var(--gl)}
/* ── PRINT / PDF EXPORT ────────────────────────────────────────────── */
@media print {
  *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  body{background:#f5e6c8!important;margin:0;padding:0}
  .app{display:block!important;min-height:unset}
  .roster{display:none!important}
  .hdr{display:none!important}
  .tabs{display:none!important}
  .hprint{display:none!important}
  .main{overflow:visible!important;display:block}
  .cnt{overflow:visible!important;padding:0!important;background:#f5e6c8!important}
  .pg{break-inside:avoid;page-break-inside:avoid;border:1px solid rgba(92,51,23,.25)!important;margin-bottom:6px!important}
  /* Hide all interactive / builder UI in print */
  .no-print{display:none!important}
  .ab-method-row{display:none!important}
  .array-tray{display:none!important}
  .ab-apply-row{display:none!important}
  .sug-panel{display:none!important}
  .eq-browser{display:none!important}
  .eq-start-chooser{display:none!important}
  .feat-take,.feat-remove,.toggle-btn,.equip-toggle,.eq-del{display:none!important}
  .sug-apply-btn,.sug-close-btn,.array-pip,.ab-clear{display:none!important}
  /* Compact ability score boxes */
  .abs{font-size:16px!important}
  .abm{font-size:10px!important}
  /* Remove backgrounds on inputs */
  input[type=number],input[type=text],textarea{border:none!important;background:transparent!important;resize:none!important}
  button:not(.hprint){pointer-events:none}
  /* Property tooltip — hide tooltip bubble in print */
  .prop-tooltip .tt{display:none!important}
  @page{margin:12mm;size:A4 portrait}
}
.tabs{display:flex;background:#160800;border-bottom:2px solid rgba(200,149,42,.3);overflow-x:auto}
.tb{padding:10px 16px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:1.5px;background:none;border:none;color:rgba(200,149,42,.4);cursor:pointer;text-transform:uppercase;transition:all .2s;border-bottom:3px solid transparent;margin-bottom:-2px;position:relative;top:2px;white-space:nowrap}
.tb:hover{color:var(--gold)}
.tb.ac{color:var(--gold);border-bottom-color:var(--gold);background:rgba(200,149,42,.05)}
.cnt{flex:1;overflow-y:auto;padding:14px;background:#1e0e04}
.pg{background:var(--vel);border:2px solid var(--br);border-radius:4px;box-shadow:inset 0 0 28px rgba(92,51,23,.1),0 3px 12px var(--sh);position:relative;margin-bottom:12px}
.pg::before{content:'';position:absolute;inset:3px;border:1px solid rgba(92,51,23,.18);border-radius:2px;pointer-events:none}
.st{font-family:'Cinzel Decorative',serif;font-size:9px;letter-spacing:3px;color:var(--cr);text-transform:uppercase;text-align:center;padding:8px 14px 5px;border-bottom:1px solid rgba(139,26,26,.22)}
.st::before,.st::after{content:'✦';color:var(--gold);margin:0 7px;font-size:7px}
.idg{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:9px;padding:11px}
.f{display:flex;flex-direction:column;gap:3px}
.f label{font-family:'Cinzel',serif;font-size:7px;letter-spacing:2px;color:var(--br);text-transform:uppercase}
.f input,.f select,.f textarea{background:transparent;border:none;border-bottom:1px solid rgba(92,51,23,.32);font-family:'IM Fell English',serif;font-size:13px;color:var(--ink);padding:2px;outline:none;width:100%;transition:border-color .2s}
.f input:focus,.f select:focus{border-bottom-color:var(--cr)}
.f textarea{resize:vertical;min-height:55px;border:1px solid rgba(92,51,23,.32);padding:5px;border-radius:2px;font-size:12px}
.si{background:transparent;border:none;border-bottom:1px solid rgba(92,51,23,.32);font-family:'IM Fell English',serif;font-size:13px;color:var(--ink);padding:2px;outline:none;width:100%}
.abr{display:flex;justify-content:center;gap:9px;padding:11px;flex-wrap:wrap}
.ab{display:flex;flex-direction:column;align-items:center;background:linear-gradient(180deg,var(--vd),var(--vm));border:2px solid var(--br);border-radius:4px;padding:8px 6px;width:74px;box-shadow:inset 0 1px 3px rgba(255,255,255,.4),0 2px 5px var(--sh);transition:border-color .15s,box-shadow .15s;position:relative}
.ab.target{border-color:var(--cr);box-shadow:0 0 0 3px rgba(139,26,26,.2),inset 0 1px 3px rgba(255,255,255,.4)}
.ab.assigned{border-color:var(--gold)}
.ab-pick-hint{font-family:'Cinzel',serif;font-size:6px;color:var(--cr);letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;animation:pulse .9s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
.ab-clear{position:absolute;top:2px;right:2px;width:12px;height:12px;background:none;border:none;cursor:pointer;color:var(--br);font-size:9px;line-height:1;opacity:.5;transition:opacity .15s;padding:0}
.ab-clear:hover{opacity:1;color:var(--cr)}
.abl{font-family:'Cinzel',serif;font-size:8px;letter-spacing:2px;color:var(--cr);font-weight:700}
/* STANDARD ARRAY TRAY */
.ab-method-row{display:flex;gap:7px;padding:8px 11px;border-bottom:1px solid rgba(92,51,23,.14);flex-wrap:wrap;align-items:center}
.ab-method-lbl{font-family:'Cinzel',serif;font-size:8px;letter-spacing:2px;color:var(--br);text-transform:uppercase;margin-right:4px}
.array-tray{display:flex;gap:6px;padding:9px 11px;flex-wrap:wrap;border-bottom:1px solid rgba(92,51,23,.14);align-items:center}
.array-tray-lbl{font-family:'Cinzel',serif;font-size:8px;letter-spacing:1.5px;color:var(--br);text-transform:uppercase;margin-right:4px;flex-shrink:0}
.array-pip{width:36px;height:36px;border-radius:4px;border:2px solid var(--br);display:flex;align-items:center;justify-content:center;font-family:'Cinzel Decorative',serif;font-size:15px;font-weight:700;color:var(--ink);cursor:pointer;transition:all .18s;background:linear-gradient(180deg,var(--vd),var(--vm));box-shadow:0 2px 5px var(--sh)}
.array-pip:hover:not(.used){border-color:var(--gold);color:var(--gold)}
.array-pip.used{opacity:.28;cursor:default;border-style:dashed;pointer-events:none}
.array-pip.selected{border-color:var(--cr);color:var(--cr);box-shadow:0 0 0 2px rgba(139,26,26,.28)}
.ab-apply-row{display:flex;gap:8px;padding:7px 11px;border-top:1px solid rgba(92,51,23,.14);flex-wrap:wrap;align-items:center}
/* SUGGESTIONS */
.sug-panel{background:linear-gradient(135deg,rgba(26,10,2,.97),rgba(30,14,4,.99));border:2px solid var(--gold);border-radius:5px;padding:14px 16px}
.sug-header{display:flex;align-items:baseline;gap:10px;margin-bottom:10px;flex-wrap:wrap}
.sug-class-name{font-family:'Cinzel Decorative',serif;font-size:13px;color:var(--gold)}
.sug-build{font-family:'Cinzel',serif;font-size:8px;letter-spacing:2px;color:rgba(200,149,42,.6);text-transform:uppercase}
.sug-scores{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px}
.sug-score-item{display:flex;flex-direction:column;align-items:center;background:rgba(200,149,42,.08);border:1px solid rgba(200,149,42,.3);border-radius:3px;padding:5px 8px;min-width:52px}
.sug-score-ab{font-family:'Cinzel',serif;font-size:7px;letter-spacing:2px;color:var(--gold);text-transform:uppercase}
.sug-score-val{font-family:'Cinzel Decorative',serif;font-size:20px;color:var(--vel);line-height:1.1}
.sug-score-mod{font-family:'Cinzel',serif;font-size:10px;color:var(--gold);margin-top:1px}
.sug-rationale{display:grid;grid-template-columns:repeat(auto-fill,minmax(195px,1fr));gap:6px;margin-bottom:12px}
.sug-rat-item{display:flex;gap:7px;align-items:flex-start;padding:5px 7px;background:rgba(245,230,200,.04);border:1px solid rgba(92,51,23,.22);border-radius:3px}
.sug-rat-ab{font-family:'Cinzel',serif;font-size:9px;font-weight:700;color:var(--gold);width:26px;flex-shrink:0;padding-top:1px}
.sug-rat-desc{font-size:10px;color:rgba(245,230,200,.75);line-height:1.5}
.sug-apply-btn{padding:7px 20px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;background:var(--gold);color:#1a0a00;border:none;border-radius:3px;cursor:pointer;transition:opacity .15s;text-transform:uppercase;font-weight:700}
.sug-apply-btn:hover{opacity:.85}
.sug-close-btn{padding:7px 14px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:1px;background:transparent;color:rgba(200,149,42,.7);border:1px solid rgba(200,149,42,.35);border-radius:3px;cursor:pointer;transition:all .15s}
.sug-close-btn:hover{color:var(--gold);border-color:var(--gold)}
.abs{width:48px;text-align:center;font-family:'Cinzel Decorative',serif;font-size:22px;color:var(--ink);background:transparent;border:none;border-bottom:1px solid rgba(92,51,23,.28);outline:none}
.abm{font-family:'Cinzel',serif;font-size:12px;font-weight:700;color:var(--br);margin-top:2px;background:rgba(92,51,23,.1);border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(92,51,23,.18)}
.cbr{display:flex;justify-content:center;gap:12px;padding:11px;flex-wrap:wrap}
.cb{display:flex;flex-direction:column;align-items:center;gap:3px;background:linear-gradient(180deg,var(--vd),var(--vm));border:2px solid var(--br);border-radius:4px;padding:8px 11px;min-width:72px;box-shadow:inset 0 1px 3px rgba(255,255,255,.4),0 2px 5px var(--sh)}
.cbl{font-family:'Cinzel',serif;font-size:7px;letter-spacing:1.5px;color:var(--br);text-transform:uppercase;text-align:center}
.cbi{text-align:center;font-family:'Cinzel',serif;font-size:19px;font-weight:700;color:var(--ink);background:transparent;border:none;border-bottom:1px solid rgba(92,51,23,.28);outline:none;width:54px}
.hps{display:flex;gap:9px;padding:11px;flex-wrap:wrap;align-items:flex-start}
.hpb{background:linear-gradient(180deg,#f5e6c8,#e8d5a3);border:2px solid var(--cr);border-radius:4px;padding:9px 13px;text-align:center;flex:1;min-width:130px}
.hpl{font-family:'Cinzel',serif;font-size:7px;letter-spacing:2px;color:var(--cr);text-transform:uppercase;margin-bottom:5px}
.hpn{font-family:'Cinzel Decorative',serif;font-size:24px;color:var(--ink);background:transparent;border:none;border-bottom:2px solid var(--cr);outline:none;text-align:center;width:52px}
.pip{width:16px;height:16px;border-radius:50%;border:2px solid var(--br);cursor:pointer;transition:all .15s}
.pip.s.on{background:#2d6a2d;border-color:#2d6a2d}
.pip.f.on{background:var(--cr);border-color:var(--cr)}
.pbr{display:flex;align-items:center;gap:9px;padding:8px 11px;border-bottom:1px solid rgba(92,51,23,.16);flex-wrap:wrap}
.pbl{font-family:'Cinzel',serif;font-size:8px;letter-spacing:2px;color:var(--br);text-transform:uppercase}
.pbv{font-family:'Cinzel Decorative',serif;font-size:17px;font-weight:700;color:var(--cr);background:rgba(139,26,26,.08);border:1px solid rgba(139,26,26,.22);border-radius:3px;padding:1px 8px}
.ib{margin-left:auto;display:flex;align-items:center;gap:6px}
.it{width:24px;height:24px;border-radius:50%;border:2px solid var(--gold);cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;background:transparent;font-size:13px}
.it.on{background:var(--gold)}
.ssg{display:grid;grid-template-columns:1fr 1fr}
.sc{padding:9px 11px}
.sc:first-child{border-right:1px solid rgba(92,51,23,.16)}
.sr{display:flex;align-items:center;gap:6px;padding:2px 0}
.pc{width:12px;height:12px;border-radius:50%;border:1.5px solid var(--br);cursor:pointer;flex-shrink:0;transition:all .15s}
.pc.fi{background:var(--cr);border-color:var(--cr)}
.pc.ex{background:var(--gold);border-color:var(--gold)}
.sa{font-family:'Cinzel',serif;font-size:6px;color:var(--br);width:20px;letter-spacing:1px}
.sn{font-size:10px;flex:1}
.sb{font-family:'Cinzel',serif;font-size:10px;font-weight:700;color:var(--cr);width:24px;text-align:right}
/* SPELL STYLES */
.nocast{text-align:center;padding:28px 18px;color:var(--br);font-style:italic;font-size:13px;line-height:1.9}
.nocast b{color:var(--cr);font-style:normal}
.cmeta{display:flex;gap:12px;padding:9px 11px;flex-wrap:wrap;align-items:center;border-bottom:1px solid rgba(92,51,23,.16)}
.cms{text-align:center}
.cml{font-family:'Cinzel',serif;font-size:7px;letter-spacing:1px;color:var(--br);text-transform:uppercase}
.cmv{font-family:'Cinzel',serif;font-size:16px;font-weight:700;color:var(--cr)}
.pact-note{background:rgba(200,149,42,.08);border:1px solid rgba(200,149,42,.25);border-radius:3px;padding:5px 11px;margin:8px 11px 3px;font-family:'Cinzel',serif;font-size:9px;color:#7a5c00;letter-spacing:1px;text-align:center}
.slotg{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;padding:9px}
.slb{background:linear-gradient(180deg,var(--vd),var(--vm));border:1px solid var(--br);border-radius:3px;padding:6px;text-align:center}
.sll{font-family:'Cinzel',serif;font-size:7px;letter-spacing:1px;color:var(--br);margin-bottom:3px}
.slps{display:flex;justify-content:center;gap:3px;flex-wrap:wrap;margin-bottom:3px}
.slp{width:14px;height:14px;border-radius:50%;border:1.5px solid var(--br);cursor:pointer;transition:all .15s}
.slp.u{background:var(--cr);border-color:var(--cr)}
.slp.p{border-color:var(--gold)}
.slp.p.u{background:var(--gold);border-color:var(--gold)}
.slc{font-family:'Cinzel',serif;font-size:9px;color:var(--br)}
/* SPELL BROWSER */
.sbrow{display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap;align-items:center}
.sbtab{padding:3px 9px;font-family:'Cinzel',serif;font-size:8px;letter-spacing:1px;border:1px solid rgba(92,51,23,.28);border-radius:2px;background:transparent;cursor:pointer;color:var(--br);transition:all .15s}
.sbtab.ac{background:var(--cr);color:var(--vel);border-color:var(--cr)}
.spbr{padding:9px 11px}
.spg{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:4px;max-height:260px;overflow-y:auto;padding-right:3px}
.spc{display:flex;align-items:flex-start;gap:5px;padding:6px 7px;border:1px solid rgba(92,51,23,.18);border-radius:3px;cursor:pointer;transition:all .15s;background:rgba(245,230,200,.25)}
.spc:hover{border-color:var(--gold);background:rgba(200,149,42,.08)}
.spc.kn{border-color:var(--cr);background:rgba(139,26,26,.07)}
.spc.pr{border-color:var(--gold);background:rgba(200,149,42,.13)}
.dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:3px}
.spni{font-size:10px;line-height:1.3;flex:1}
.spsch{font-size:8px;font-style:italic;color:var(--br);display:block}
.spbadge{font-family:'Cinzel',serif;font-size:7px;padding:1px 4px;border-radius:2px;color:var(--vel);display:block;margin-top:2px}
/* KNOWN SPELLS LIST */
.ksl{padding:0 11px 9px}
.ksi{display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid rgba(92,51,23,.1);cursor:pointer;transition:background .1s}
.ksi:hover{background:rgba(200,149,42,.07)}
.ksprep{width:12px;height:12px;border-radius:50%;border:1.5px solid var(--gold);cursor:pointer;flex-shrink:0;transition:all .15s}
.ksprep.pr{background:var(--gold)}
.kslvl{font-family:'Cinzel',serif;font-size:7px;background:var(--cr);color:var(--vel);padding:1px 4px;border-radius:2px;flex-shrink:0}
.ksn{flex:1;font-size:11px}
.kssch{font-size:9px;color:var(--br);font-style:italic}
.bd{background:none;border:none;color:var(--cr);cursor:pointer;font-size:11px;padding:0 3px;opacity:.4}
.bd:hover{opacity:1}
/* SPELL MODAL */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px}
.modal{background:var(--vel);border:3px solid var(--br);border-radius:6px;max-width:520px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.6),inset 0 0 40px rgba(92,51,23,.1);position:relative}
.modal::before{content:'';position:absolute;inset:4px;border:1px solid rgba(92,51,23,.2);border-radius:3px;pointer-events:none}
.modal-hdr{padding:14px 16px 10px;border-bottom:1px solid rgba(92,51,23,.25);display:flex;align-items:flex-start;gap:10px}
.modal-title{font-family:'Cinzel',serif;font-size:17px;font-weight:700;color:var(--cr);flex:1;line-height:1.2}
.modal-close{background:none;border:none;color:var(--br);cursor:pointer;font-size:18px;padding:0 4px;line-height:1}
.modal-close:hover{color:var(--cr)}
.modal-meta{display:flex;flex-wrap:wrap;gap:8px;padding:8px 16px;border-bottom:1px solid rgba(92,51,23,.15);background:rgba(92,51,23,.04)}
.modal-meta-item{display:flex;flex-direction:column;gap:1px;min-width:80px}
.modal-meta-lbl{font-family:'Cinzel',serif;font-size:7px;letter-spacing:1.5px;color:var(--br);text-transform:uppercase}
.modal-meta-val{font-size:12px;color:var(--ink)}
.modal-desc{padding:12px 16px;font-size:13px;line-height:1.7;color:var(--ink)}
.modal-upcast{margin:10px 16px;padding:8px 10px;background:rgba(139,26,26,.06);border-left:3px solid var(--cr);border-radius:0 3px 3px 0;font-size:12px;font-style:italic;line-height:1.6}
.modal-upcast-lbl{font-family:'Cinzel',serif;font-size:8px;letter-spacing:1px;color:var(--cr);text-transform:uppercase;font-style:normal;display:block;margin-bottom:3px}
.modal-actions{padding:10px 16px 14px;display:flex;gap:8px;border-top:1px solid rgba(92,51,23,.15)}
.btn-modal{padding:7px 14px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:1.5px;border-radius:3px;cursor:pointer;transition:all .15s;text-transform:uppercase;border:none}
.btn-learn{background:var(--cr);color:var(--vel)}.btn-learn:hover{background:var(--crl)}
.btn-forget{background:rgba(139,26,26,.15);color:var(--cr);border:1px solid var(--cr)!important}.btn-forget:hover{background:rgba(139,26,26,.25)}
.btn-prep{background:rgba(200,149,42,.2);color:#7a5c00;border:1px solid var(--gold)!important}.btn-prep:hover{background:rgba(200,149,42,.35)}
/* INVENTORY */
.cr{display:flex;gap:9px;padding:9px 11px;flex-wrap:wrap;border-bottom:1px solid rgba(92,51,23,.16)}
.cub{text-align:center}
.cul{font-family:'Cinzel',serif;font-size:7px;letter-spacing:1.5px;color:var(--br)}
.cui{width:48px;text-align:center;font-family:'Cinzel',serif;font-size:14px;font-weight:700;background:transparent;border:none;border-bottom:1px solid rgba(92,51,23,.32);outline:none;color:var(--ink)}
.ita{display:grid;grid-template-columns:1fr 42px 65px;gap:6px;padding:8px 11px;align-items:end;border-bottom:1px solid rgba(92,51,23,.16)}
.itr{display:flex;align-items:center;gap:6px;padding:4px 11px;border-bottom:1px solid rgba(92,51,23,.09)}
.itq{font-family:'Cinzel',serif;font-size:9px;color:var(--br);width:26px}
.itn{flex:1;font-size:11px}
.ng{display:grid;grid-template-columns:1fr 1fr;gap:9px;padding:11px}
.ta{min-height:90px;border:1px solid rgba(92,51,23,.28);padding:6px;border-radius:2px;font-family:'IM Fell English',serif;font-size:12px;color:var(--ink);background:transparent;outline:none;resize:vertical;width:100%}
.es{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;min-height:360px;color:rgba(200,149,42,.3)}
.er{font-family:'UnifrakturMaguntia',cursive;font-size:68px;line-height:1}
.et{font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;margin-top:12px;text-transform:uppercase}
.school-badge{display:inline-block;padding:1px 5px;border-radius:2px;font-family:'Cinzel',serif;font-size:8px;color:#fff;letter-spacing:1px;text-transform:uppercase}
/* WARNINGS */
.warn-box{background:rgba(139,26,26,.08);border:1.5px solid rgba(139,26,26,.4);border-radius:4px;padding:8px 12px;margin-bottom:12px}
.warn-title{font-family:'Cinzel',serif;font-size:8px;letter-spacing:2px;color:var(--cr);text-transform:uppercase;margin-bottom:5px}
.warn-item{display:flex;align-items:flex-start;gap:6px;font-size:11px;color:var(--cr);margin:3px 0;line-height:1.4}
.warn-item::before{content:'⚠';font-size:10px;flex-shrink:0;margin-top:1px}
/* PROFICIENCY CHECKLIST */
.prof-section{padding:10px 11px}
.prof-lbl{font-family:'Cinzel',serif;font-size:8px;letter-spacing:2px;color:var(--br);text-transform:uppercase;margin-bottom:6px;display:flex;align-items:center;gap:6px}
.prof-count{font-family:'Cinzel',serif;font-size:9px;background:var(--cr);color:var(--vel);border-radius:10px;padding:1px 7px}
.prof-count.ok{background:#2d6a2d}
.prof-count.over{background:#b84a00}
.skill-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:4px;margin-bottom:8px}
.skill-chip{display:flex;align-items:center;gap:6px;padding:4px 8px;border:1px solid rgba(92,51,23,.2);border-radius:3px;cursor:pointer;transition:all .15s;font-size:11px;background:rgba(245,230,200,.3)}
.skill-chip:hover{border-color:var(--gold);background:rgba(200,149,42,.1)}
.skill-chip.granted{border-color:#2d6a2d;background:rgba(45,106,45,.08);cursor:default}
.skill-chip.chosen{border-color:var(--cr);background:rgba(139,26,26,.08)}
.skill-chip.spec-chosen{border-color:var(--gold);background:rgba(200,149,42,.1)}
.skill-chip.expert{border-color:var(--gold);background:rgba(200,149,42,.18)}
.chip-dot{width:9px;height:9px;border-radius:50%;border:1.5px solid var(--br);flex-shrink:0;transition:all .15s}
.chip-dot.granted{background:#2d6a2d;border-color:#2d6a2d}
.chip-dot.chosen{background:var(--cr);border-color:var(--cr)}
.chip-dot.spec{background:var(--gold);border-color:var(--gold)}
.chip-dot.expert{background:var(--gold);border-color:var(--gold);box-shadow:0 0 0 2px rgba(200,149,42,.3)}
.chip-ab{font-family:'Cinzel',serif;font-size:7px;color:var(--br);width:22px;flex-shrink:0}
.chip-bonus{font-family:'Cinzel',serif;font-size:10px;font-weight:700;color:var(--cr);margin-left:auto;width:24px;text-align:right}
.save-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}
.save-chip{display:flex;align-items:center;gap:5px;padding:5px 8px;border:1px solid rgba(92,51,23,.2);border-radius:3px;font-size:11px;background:rgba(245,230,200,.3)}
.save-chip.auto{border-color:var(--cr);background:rgba(139,26,26,.07);cursor:default}
.save-chip.manual{border-color:rgba(92,51,23,.3);cursor:pointer}
.save-chip.manual:hover{border-color:var(--gold)}
.save-chip.active{border-color:var(--gold);background:rgba(200,149,42,.1)}
/* TRAIT CARDS */
.trait-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px;padding:9px 11px}
.trait-card{background:linear-gradient(180deg,var(--vd),var(--vm));border:1px solid var(--br);border-radius:3px;padding:7px 9px}
.trait-name{font-family:'Cinzel',serif;font-size:9px;font-weight:700;color:var(--cr);margin-bottom:3px}
.trait-desc{font-size:10px;line-height:1.5;color:var(--ink)}
.species-meta{display:flex;gap:14px;padding:8px 11px;flex-wrap:wrap;border-bottom:1px solid rgba(92,51,23,.12)}
.species-meta-item{text-align:center}
.species-meta-lbl{font-family:'Cinzel',serif;font-size:7px;letter-spacing:1px;color:var(--br);text-transform:uppercase}
.species-meta-val{font-family:'Cinzel',serif;font-size:13px;font-weight:700;color:var(--cr)}
.resist-tag{display:inline-block;padding:1px 6px;border-radius:2px;font-family:'Cinzel',serif;font-size:8px;background:rgba(139,26,26,.12);color:var(--cr);border:1px solid rgba(139,26,26,.25);margin:2px 2px 0 0}
.toggle-btn{padding:3px 10px;font-family:'Cinzel',serif;font-size:8px;letter-spacing:1px;border:1px solid rgba(92,51,23,.3);border-radius:2px;background:transparent;cursor:pointer;color:var(--br);transition:all .15s}
.toggle-btn:hover{border-color:var(--gold);color:var(--gold)}
/* EQUIPMENT TAB */
.eq-mode-row{display:flex;gap:8px;padding:9px 11px;border-bottom:1px solid rgba(92,51,23,.16);align-items:center;flex-wrap:wrap}
.eq-mode-btn{padding:5px 14px;font-family:'Cinzel',serif;font-size:8px;letter-spacing:1.5px;border:1.5px solid rgba(92,51,23,.3);border-radius:3px;background:transparent;cursor:pointer;color:var(--br);transition:all .15s;text-transform:uppercase}
.eq-mode-btn.ac{background:var(--cr);color:var(--vel);border-color:var(--cr)}
.eq-mode-btn:not(.ac):hover{border-color:var(--gold);color:var(--gold)}
.pack-option{padding:9px 11px;border-bottom:1px solid rgba(92,51,23,.1)}
.pack-label{font-family:'Cinzel',serif;font-size:9px;color:var(--cr);letter-spacing:1px;margin-bottom:4px}
.pack-items{font-size:11px;color:var(--br);margin-bottom:6px;line-height:1.6}
.pack-load-btn{padding:4px 12px;font-family:'Cinzel',serif;font-size:8px;letter-spacing:1px;background:var(--cr);color:var(--vel);border:none;border-radius:2px;cursor:pointer;transition:opacity .15s}
.pack-load-btn:hover{opacity:.85}
.gold-start{padding:11px;text-align:center}
.gold-start-val{font-family:'Cinzel Decorative',serif;font-size:32px;color:var(--gold);text-shadow:0 0 12px rgba(200,149,42,.3)}
.gold-start-lbl{font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;color:var(--br);text-transform:uppercase;margin-top:2px}
.gold-start-btn{margin-top:9px;padding:5px 18px;font-family:'Cinzel',serif;font-size:8px;letter-spacing:1px;background:rgba(200,149,42,.15);color:#7a5c00;border:1px solid var(--gold);border-radius:2px;cursor:pointer;transition:all .15s}
.gold-start-btn:hover{background:rgba(200,149,42,.3)}
/* EQUIPPED ITEMS */
.eq-item{display:flex;align-items:center;gap:7px;padding:6px 11px;border-bottom:1px solid rgba(92,51,23,.08);transition:background .1s}
.eq-item:hover{background:rgba(200,149,42,.04)}
.eq-item.equipped{background:rgba(139,26,26,.04)}
.equip-toggle{width:18px;height:18px;border-radius:3px;border:1.5px solid var(--br);cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;transition:all .15s;background:transparent}
.equip-toggle.on{background:var(--cr);border-color:var(--cr);color:var(--vel)}
.eq-name{flex:1;font-size:11px;font-weight:600}
.eq-name.equipped{color:var(--cr)}
.eq-tag{font-family:'Cinzel',serif;font-size:7px;padding:1px 5px;border-radius:2px;letter-spacing:1px;text-transform:uppercase}
.eq-tag.armor{background:rgba(45,106,45,.15);color:#2d6a2d;border:1px solid #2d6a2d}
.eq-tag.weapon{background:rgba(139,26,26,.1);color:var(--cr);border:1px solid var(--cr)}
.eq-tag.shield{background:rgba(92,51,23,.12);color:var(--br);border:1px solid var(--br)}
.eq-tag.gear{background:rgba(200,149,42,.1);color:#7a5c00;border:1px solid rgba(200,149,42,.4)}
.eq-stat{font-family:'Cinzel',serif;font-size:9px;color:var(--br);min-width:30px;text-align:right}
.eq-del{background:none;border:none;color:var(--br);cursor:pointer;font-size:12px;opacity:.35;padding:0 2px;line-height:1}
.eq-del:hover{opacity:1;color:var(--cr)}
/* ATTACK SUMMARY */
.atk-card{display:flex;align-items:center;gap:8px;padding:7px 11px;background:linear-gradient(90deg,rgba(139,26,26,.06),transparent);border-left:3px solid var(--cr);margin:4px 11px;border-radius:0 3px 3px 0}
.atk-name{flex:1;font-size:11px;font-weight:600}
.atk-bonus{font-family:'Cinzel',serif;font-size:14px;font-weight:700;color:var(--cr);width:38px;text-align:center}
.atk-dmg{font-family:'Cinzel',serif;font-size:10px;color:var(--br);width:80px;text-align:right}
/* EQUIPMENT BROWSER */
.eq-browser{padding:9px 11px}
.eq-search-row{display:flex;gap:6px;margin-bottom:7px;flex-wrap:wrap}
.eq-search{flex:1;min-width:120px;background:transparent;border:1px solid rgba(92,51,23,.28);border-radius:2px;padding:4px 8px;font-family:'IM Fell English',serif;font-size:12px;color:var(--ink);outline:none}
.eq-search:focus{border-color:var(--cr)}
.eq-filt{padding:3px 9px;font-family:'Cinzel',serif;font-size:8px;letter-spacing:1px;border:1px solid rgba(92,51,23,.28);border-radius:2px;background:transparent;cursor:pointer;color:var(--br);transition:all .15s}
.eq-filt.ac{background:var(--cr);color:var(--vel);border-color:var(--cr)}
.eq-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:5px;max-height:380px;overflow-y:auto}
.eq-cat-row{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:7px}
.eq-cat-lbl{font-family:'Cinzel',serif;font-size:7px;letter-spacing:1.5px;color:var(--br);text-transform:uppercase;align-self:center;margin-right:2px}
.eq-db-cat{font-family:'Cinzel',serif;font-size:7px;letter-spacing:1px;color:rgba(200,149,42,.7);text-transform:uppercase;margin-bottom:1px}
.dmg-type-S{color:#c0392b}.dmg-type-P{color:#8e44ad}.dmg-type-B{color:#2980b9}.dmg-type-F{color:#e67e22}.dmg-type-C{color:#1abc9c}.dmg-type-other{color:#7f8c8d}
.eq-db-item{padding:7px 9px;border:1px solid rgba(92,51,23,.18);border-radius:3px;cursor:pointer;background:rgba(245,230,200,.2);transition:all .15s;display:flex;flex-direction:column;gap:3px}
.eq-db-item:hover{border-color:var(--gold);background:rgba(200,149,42,.08)}
.eq-db-name{font-size:11px;font-weight:600}
.eq-db-sub{font-size:9px;color:var(--br);font-family:'Cinzel',serif;letter-spacing:.5px}
.eq-db-props{display:flex;flex-wrap:wrap;gap:3px;margin-top:2px}
/* PROPERTY TAGS */
.prop-tag{display:inline-flex;align-items:center;padding:1px 5px;border-radius:2px;font-family:'Cinzel',serif;font-size:7px;letter-spacing:.5px;font-weight:700;color:#fff;cursor:help;transition:opacity .1s;white-space:nowrap}
.prop-tag:hover{opacity:.8}
/* PROPERTY TOOLTIP */
.prop-tooltip{position:relative;display:inline-block}
.prop-tooltip .tt{visibility:hidden;background:#1a0a00;color:var(--vel);font-family:'IM Fell English',serif;font-size:11px;line-height:1.5;text-align:left;padding:8px 11px;border-radius:4px;border:1px solid var(--gold);position:absolute;z-index:200;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);white-space:normal;width:220px;box-shadow:0 4px 16px rgba(0,0,0,.6);pointer-events:none}
.prop-tooltip:hover .tt{visibility:visible}
/* DAMAGE TYPE BADGES */
.dmg-badge{display:inline-block;padding:1px 6px;border-radius:2px;font-family:'Cinzel',serif;font-size:8px;letter-spacing:.5px;background:rgba(92,51,23,.15);color:var(--br);border:1px solid rgba(92,51,23,.25)}
/* EQUIPPED ITEM — expanded */
.eq-item-body{flex:1;min-width:0}
.eq-item-stats{display:flex;flex-wrap:wrap;gap:5px;margin-top:3px;align-items:center}
/* FEATS */
.feat-origin{background:linear-gradient(135deg,rgba(200,149,42,.08),rgba(139,26,26,.06));border:1.5px solid var(--gold);border-radius:4px;padding:10px 13px;margin-bottom:9px}
.feat-origin-lbl{font-family:'Cinzel',serif;font-size:7px;letter-spacing:2px;color:var(--gold);text-transform:uppercase;margin-bottom:4px}
.feat-origin-name{font-family:'Cinzel',serif;font-size:14px;font-weight:700;color:var(--cr);cursor:pointer;transition:color .15s}
.feat-origin-name:hover{color:var(--crl)}
.feat-origin-benefit{font-size:11px;color:var(--br);margin-top:3px;line-height:1.5;font-style:italic}
.feat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:5px}
.feat-card{padding:8px 10px;border:1px solid rgba(92,51,23,.2);border-radius:3px;background:rgba(245,230,200,.25);cursor:pointer;transition:all .15s}
.feat-card:hover{border-color:var(--gold);background:rgba(200,149,42,.08)}
.feat-card.active{border-color:var(--cr);background:rgba(139,26,26,.07)}
.feat-card-name{font-family:'Cinzel',serif;font-size:10px;font-weight:700;color:var(--cr);margin-bottom:3px}
.feat-card-type{font-family:'Cinzel',serif;font-size:7px;letter-spacing:1px;color:var(--br);text-transform:uppercase;margin-bottom:4px}
.feat-card-benefit{font-size:10px;color:var(--ink);line-height:1.4}
.feat-card-prereq{font-size:9px;color:var(--br);font-style:italic;margin-top:3px}
/* FEAT MODAL */
.feat-modal{background:var(--vel);border:3px solid var(--gold);border-radius:6px;max-width:540px;width:100%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.6);position:relative}
.feat-modal::before{content:'';position:absolute;inset:4px;border:1px solid rgba(200,149,42,.25);border-radius:3px;pointer-events:none}
.feat-modal-hdr{padding:14px 16px 10px;border-bottom:1px solid rgba(92,51,23,.2);display:flex;align-items:flex-start;gap:10px}
.feat-modal-title{font-family:'Cinzel',serif;font-size:18px;font-weight:700;color:var(--cr);flex:1}
.feat-modal-type{display:inline-block;padding:2px 8px;border-radius:2px;font-family:'Cinzel',serif;font-size:8px;letter-spacing:1.5px;text-transform:uppercase;margin-top:3px}
.feat-modal-type.origin{background:rgba(200,149,42,.2);color:#7a5c00;border:1px solid var(--gold)}
.feat-modal-type.general{background:rgba(139,26,26,.1);color:var(--cr);border:1px solid var(--cr)}
.feat-modal-prereq{font-size:11px;color:var(--br);padding:7px 16px;border-bottom:1px solid rgba(92,51,23,.1);font-style:italic}
.feat-modal-desc{padding:12px 16px;font-size:12px;line-height:1.8;color:var(--ink);white-space:pre-line}
.feat-modal-actions{padding:10px 16px 14px;display:flex;gap:8px;border-top:1px solid rgba(92,51,23,.15)}
`;

// ─── CLASS DATA (2024 PHB) ────────────────────────────────────────────────────
const CLASS_DATA = {
  Barbarian: {
    savingThrows: ["STR","CON"],
    skillChoices: ["Animal Handling","Athletics","Intimidation","Nature","Perception","Survival"],
    skillCount: 2,
    hitDie: "d12",
    armor: ["Light armor","Medium armor","Shields"],
    weapons: ["Simple weapons","Martial weapons"],
    tools: [],
  },
  Bard: {
    savingThrows: ["DEX","CHA"],
    skillChoices: ["Acrobatics","Animal Handling","Arcana","Athletics","Deception","History","Insight","Intimidation","Investigation","Medicine","Nature","Perception","Performance","Persuasion","Religion","Sleight of Hand","Stealth","Survival"],
    skillCount: 3,
    hitDie: "d8",
    armor: ["Light armor"],
    weapons: ["Simple weapons","Hand crossbows","Longswords","Rapiers","Shortswords"],
    tools: ["Three musical instruments of your choice"],
  },
  Cleric: {
    savingThrows: ["WIS","CHA"],
    skillChoices: ["History","Insight","Medicine","Persuasion","Religion"],
    skillCount: 2,
    hitDie: "d8",
    armor: ["Light armor","Medium armor","Shields"],
    weapons: ["Simple weapons"],
    tools: [],
  },
  Druid: {
    savingThrows: ["INT","WIS"],
    skillChoices: ["Arcana","Animal Handling","Insight","Medicine","Nature","Perception","Religion","Survival"],
    skillCount: 2,
    hitDie: "d8",
    armor: ["Light armor","Medium armor","Shields (non-metal)"],
    weapons: ["Simple weapons","Herbalism kit"],
    tools: ["Herbalism kit"],
  },
  Fighter: {
    savingThrows: ["STR","CON"],
    skillChoices: ["Acrobatics","Animal Handling","Athletics","History","Insight","Intimidation","Perception","Survival"],
    skillCount: 2,
    hitDie: "d10",
    armor: ["All armor","Shields"],
    weapons: ["Simple weapons","Martial weapons"],
    tools: [],
  },
  Monk: {
    savingThrows: ["STR","DEX"],
    skillChoices: ["Acrobatics","Athletics","History","Insight","Religion","Stealth"],
    skillCount: 2,
    hitDie: "d8",
    armor: [],
    weapons: ["Simple weapons","Shortswords"],
    tools: ["One type of artisan's tools or one musical instrument"],
  },
  Paladin: {
    savingThrows: ["WIS","CHA"],
    skillChoices: ["Athletics","Insight","Intimidation","Medicine","Persuasion","Religion"],
    skillCount: 2,
    hitDie: "d10",
    armor: ["All armor","Shields"],
    weapons: ["Simple weapons","Martial weapons"],
    tools: [],
  },
  Ranger: {
    savingThrows: ["STR","DEX"],
    skillChoices: ["Animal Handling","Athletics","Insight","Investigation","Nature","Perception","Stealth","Survival"],
    skillCount: 3,
    hitDie: "d10",
    armor: ["Light armor","Medium armor","Shields"],
    weapons: ["Simple weapons","Martial weapons"],
    tools: [],
  },
  Rogue: {
    savingThrows: ["DEX","INT"],
    skillChoices: ["Acrobatics","Athletics","Deception","Insight","Intimidation","Investigation","Perception","Performance","Persuasion","Sleight of Hand","Stealth"],
    skillCount: 4,
    hitDie: "d8",
    armor: ["Light armor"],
    weapons: ["Simple weapons","Hand crossbows","Longswords","Rapiers","Shortswords"],
    tools: ["Thieves' tools"],
  },
  Sorcerer: {
    savingThrows: ["CON","CHA"],
    skillChoices: ["Arcana","Deception","Insight","Intimidation","Persuasion","Religion"],
    skillCount: 2,
    hitDie: "d6",
    armor: [],
    weapons: ["Daggers","Darts","Slings","Quarterstaffs","Light crossbows"],
    tools: [],
  },
  Warlock: {
    savingThrows: ["WIS","CHA"],
    skillChoices: ["Arcana","Deception","History","Intimidation","Investigation","Nature","Religion"],
    skillCount: 2,
    hitDie: "d8",
    armor: ["Light armor"],
    weapons: ["Simple weapons"],
    tools: [],
  },
  Wizard: {
    savingThrows: ["INT","WIS"],
    skillChoices: ["Arcana","History","Insight","Investigation","Medicine","Religion"],
    skillCount: 2,
    hitDie: "d6",
    armor: [],
    weapons: ["Daggers","Darts","Slings","Quarterstaffs","Light crossbows"],
    tools: [],
  },
};

// ─── CLASS FEATURES BY LEVEL (2024 PHB) ───────────────────────────────────────
const CLASS_FEATURES = {
  Barbarian: {
    1:  ["Rage (2/Long Rest, +2 dmg)", "Unarmoured Defence (10 + CON + DEX)", "Weapon Mastery (2 weapons)"],
    2:  ["Reckless Attack", "Danger Sense (Adv. on DEX saves vs seen effects)"],
    3:  ["Primal Knowledge (1 skill)", "Subclass Feature"],
    4:  ["Ability Score Improvement"],
    5:  ["Extra Attack", "Fast Movement (+10 ft unarmoured)"],
    6:  ["Subclass Feature"],
    7:  ["Feral Instinct (Adv. on Initiative; act while surprised)", "Instinctive Pounce"],
    8:  ["Ability Score Improvement"],
    9:  ["Brutal Strike (forgo Reckless Adv. for +10 dmg on one hit)"],
    10: ["Subclass Feature"],
    11: ["Relentless Rage (CON save DC 10 + rages used to stay at 1 HP)"],
    12: ["Ability Score Improvement"],
    13: ["Improved Brutal Strike (+10 dmg on two hits or extra effects)"],
    14: ["Subclass Feature"],
    15: ["Persistent Rage (Rage ends only if Incapacitated or you end it)"],
    16: ["Ability Score Improvement"],
    17: ["Improved Brutal Strike II"],
    18: ["Indomitable Might (STR check minimum = STR score)"],
    19: ["Ability Score Improvement"],
    20: ["Primal Champion (+4 STR, +4 CON)"],
  },
  Bard: {
    1:  ["Bardic Inspiration (CHA mod uses/Long Rest, d6)", "Spellcasting (CHA)"],
    2:  ["Expertise (2 skills)", "Jack of All Trades (+½ PB to unproficient checks)", "Song of Rest (d6 HP on short rest)"],
    3:  ["Subclass Feature", "Expertise (2 more skills)"],
    4:  ["Ability Score Improvement"],
    5:  ["Bardic Inspiration d8", "Font of Inspiration (regain on Short Rest)", "Magical Secrets (2 spells any class)"],
    6:  ["Subclass Feature", "Countercharm (Action: allies Adv. vs Frightened/Charmed)"],
    7:  ["Magical Secrets (2 more spells)"],
    8:  ["Ability Score Improvement"],
    9:  ["Song of Rest d8", "Magical Secrets (2 more spells)"],
    10: ["Bardic Inspiration d10", "Expertise (2 more)", "Magical Secrets (2 more)"],
    11: ["Magical Secrets (2 more)"],
    12: ["Ability Score Improvement"],
    13: ["Song of Rest d10", "Magical Secrets (2 more)"],
    14: ["Subclass Feature", "Magical Secrets (2 more)"],
    15: ["Bardic Inspiration d12", "Magical Secrets (2 more)"],
    16: ["Ability Score Improvement"],
    17: ["Song of Rest d12", "Magical Secrets (2 more)"],
    18: ["Superior Inspiration (regain 1 Bardic Inspiration on initiative if none left)"],
    19: ["Ability Score Improvement"],
    20: ["Words of Creation (you always know Power Word Heal & Power Word Kill)"],
  },
  Cleric: {
    1:  ["Divine Order (Protector or Thaumaturge)", "Spellcasting (WIS)", "Subclass (Divine Domain) Feature"],
    2:  ["Channel Divinity (1/rest): Turn Undead, Divine Spark", "Subclass Feature"],
    3:  ["Subclass Feature"],
    4:  ["Ability Score Improvement"],
    5:  ["Sear Undead (Channel Divinity damages turned undead)"],
    6:  ["Subclass Feature"],
    7:  ["Blessed Strikes (d8 radiant or +1d8 on spell)"],
    8:  ["Ability Score Improvement"],
    9:  ["Subclass Feature", "Channel Divinity (2/rest)"],
    10: ["Divine Intervention (call on deity; roll under level to succeed)"],
    11: ["Improved Blessed Strikes (d8 radiant on every hit)"],
    12: ["Ability Score Improvement"],
    13: ["Channel Divinity (3/rest)"],
    14: ["Improved Divine Intervention (always succeeds)"],
    15: ["Subclass Feature"],
    16: ["Ability Score Improvement"],
    17: ["Subclass Feature"],
    18: ["Channel Divinity (4/rest)"],
    19: ["Ability Score Improvement", "Epic Boon"],
    20: ["Greater Divine Intervention"],
  },
  Druid: {
    1:  ["Druidic (secret language)", "Primal Order (Magician or Warden)", "Spellcasting (WIS)", "Wild Companion (ritual Find Familiar)"],
    2:  ["Wild Shape (CR ¼ no fly/swim, 2 uses/Short Rest)", "Subclass Feature"],
    3:  ["Subclass Feature"],
    4:  ["Ability Score Improvement", "Wild Shape Improvement (CR ½, swim)"],
    5:  ["Wild Resurgence (spend spell slot to regain Wild Shape, or vice versa)"],
    6:  ["Subclass Feature", "Elemental Fury (extra dmg in Wild Shape)"],
    7:  ["Subclass Feature"],
    8:  ["Ability Score Improvement", "Wild Shape Improvement (CR 1, fly)"],
    9:  ["Subclass Feature"],
    10: ["Subclass Feature"],
    11: ["Subclass Feature"],
    12: ["Ability Score Improvement"],
    13: ["Subclass Feature"],
    14: ["Subclass Feature", "Improved Elemental Fury"],
    15: ["Subclass Feature"],
    16: ["Ability Score Improvement"],
    17: ["Subclass Feature"],
    18: ["Beast Spells (cast while in Wild Shape)", "Timeless Body (age 10× slower)"],
    19: ["Ability Score Improvement", "Epic Boon"],
    20: ["Archdruid (unlimited Wild Shape; ignore V/S components)"],
  },
  Fighter: {
    1:  ["Fighting Style", "Second Wind (1d10+level HP, Bonus Action, 1/Short Rest)", "Weapon Mastery (3 weapons)"],
    2:  ["Action Surge (1/Short Rest, extra Action)"],
    3:  ["Subclass Feature", "Tactical Mind (spend Second Wind on Initiative check)"],
    4:  ["Ability Score Improvement", "Weapon Mastery (4 weapons)"],
    5:  ["Extra Attack (attack twice)"],
    6:  ["Ability Score Improvement", "Weapon Mastery (5 weapons)"],
    7:  ["Subclass Feature"],
    8:  ["Ability Score Improvement"],
    9:  ["Indomitable (reroll failed save, 1/Long Rest)", "Tactical Shift (reposition allies on Second Wind)"],
    10: ["Subclass Feature", "Weapon Mastery (6 weapons)"],
    11: ["Extra Attack II (attack three times)"],
    12: ["Ability Score Improvement"],
    13: ["Indomitable (2/Long Rest)", "Studied Attacks (Adv. after miss)"],
    14: ["Ability Score Improvement"],
    15: ["Subclass Feature"],
    16: ["Ability Score Improvement"],
    17: ["Action Surge (2/Short Rest)", "Indomitable (3/Long Rest)"],
    18: ["Subclass Feature"],
    19: ["Ability Score Improvement", "Epic Boon"],
    20: ["Extra Attack III (attack four times)"],
  },
  Monk: {
    1:  ["Martial Arts (d6 unarmed, DEX for attacks, Bonus Action unarmed)", "Unarmoured Defence (10 + WIS + DEX)", "Weapon Mastery (2 simple/shortsword)"],
    2:  ["Monk's Focus (Focus Points = level)", "Flurry of Blows (1 Focus, 2 unarmed strikes)", "Patient Defence (1 Focus, Disengage+Dodge)", "Step of the Wind (1 Focus, Disengage/Dash+jump)","Unarmoured Movement (+10 ft)"],
    3:  ["Deflect Attacks (reduce ranged dmg, throw back 1 Focus)", "Subclass Feature"],
    4:  ["Ability Score Improvement", "Slow Fall (reduce fall dmg by 5×level)", "Weapon Mastery (3 weapons)"],
    5:  ["Extra Attack", "Martial Arts d8", "Stunning Strike (1 Focus, CON save or Stunned)"],
    6:  ["Empowered Strikes (unarmed count as magical)", "Subclass Feature", "Unarmoured Movement (+15 ft)"],
    7:  ["Evasion (DEX save: no dmg on success, half on fail)", "Subclass Feature"],
    8:  ["Ability Score Improvement"],
    9:  ["Acrobatic Movement (run on vertical surfaces/liquids on turn)", "Unarmoured Movement (+20 ft)", "Weapon Mastery (4 weapons)"],
    10: ["Heightened Focus (enhanced Flurry/Patient/Step)", "Self-Restoration (end 1 condition for free on turn)", "Subclass Feature"],
    11: ["Martial Arts d10", "Subclass Feature", "Unarmoured Movement (+25 ft)"],
    12: ["Ability Score Improvement"],
    13: ["Deflect Energy (deflect energy dmg)"],
    14: ["Disciplined Survivor (proficiency in all saves)", "Subclass Feature", "Unarmoured Movement (+30 ft)"],
    15: ["Perfect Focus (regain 4 Focus on initiative if ≤4 left)", "Subclass Feature"],
    16: ["Ability Score Improvement"],
    17: ["Martial Arts d12", "Subclass Feature", "Unarmoured Movement (+35 ft)"],
    18: ["Superior Defence (reduce dmg by PB while not incapacitated)", "Subclass Feature"],
    19: ["Ability Score Improvement", "Epic Boon"],
    20: ["Body and Mind (+4 DEX, +4 WIS)"],
  },
  Paladin: {
    1:  ["Lay on Hands (pool = 5×level HP)", "Spellcasting (CHA)", "Weapon Mastery (2 weapons)"],
    2:  ["Fighting Style", "Paladin's Smite (expend spell slot for radiant dmg)", "Subclass Feature"],
    3:  ["Channel Divinity (1/rest): Vow of Enmity, subclass option", "Subclass Feature"],
    4:  ["Ability Score Improvement"],
    5:  ["Extra Attack", "Faithful Steed (ritual Find Steed)"],
    6:  ["Aura of Protection (CHA mod to saves, 10 ft)"],
    7:  ["Subclass Feature"],
    8:  ["Ability Score Improvement"],
    9:  ["Abjure Foes (Channel Divinity: Frighten undead/fiends)"],
    10: ["Aura of Courage (allies immune to Frightened, 10 ft)"],
    11: ["Radiant Strikes (unarmed + weapon strikes deal +1d8 radiant)"],
    12: ["Ability Score Improvement"],
    13: ["Channel Divinity (2/rest)"],
    14: ["Restoring Touch (Lay on Hands removes conditions)"],
    15: ["Subclass Feature"],
    16: ["Ability Score Improvement"],
    17: ["Aura of Protection expands (30 ft)"],
    18: ["Aura of Courage expands (30 ft)"],
    19: ["Ability Score Improvement", "Epic Boon"],
    20: ["Sacred Weapon (Channel Divinity on weapon: CHA to atk, bright light, counts as magical)"],
  },
  Ranger: {
    1:  ["Favoured Enemy (Hunter's Mark 1/Long Rest free)", "Spellcasting (WIS)", "Weapon Mastery (2 weapons)"],
    2:  ["Deft Explorer (Expertise in one skill, extra language)", "Fighting Style"],
    3:  ["Subclass Feature", "Subclass Feature 2"],
    4:  ["Ability Score Improvement"],
    5:  ["Extra Attack", "Roving (+10 ft speed, climb & swim speed)"],
    6:  ["Deft Explorer II (Expertise in another skill, extra language)"],
    7:  ["Subclass Feature", "Tireless (gain Temp HP = 1d8+WIS; remove Exhaustion 1/Short Rest)"],
    8:  ["Ability Score Improvement"],
    9:  ["Nature's Veil (Hide as Bonus Action, 1/Short Rest, invisible until next turn)"],
    10: ["Deft Explorer III (Expertise in another skill)"],
    11: ["Subclass Feature"],
    12: ["Ability Score Improvement"],
    13: ["Subclass Feature"],
    14: ["Subclass Feature"],
    15: ["Subclass Feature"],
    16: ["Ability Score Improvement"],
    17: ["Precise Hunter (Adv. on attack rolls vs Hunter's Mark target)"],
    18: ["Feral Senses (perceive invisible creatures within 30 ft)"],
    19: ["Ability Score Improvement", "Epic Boon"],
    20: ["Foe Slayer (add WIS mod to atk or dmg vs Hunter's Mark target, 1/turn)"],
  },
  Rogue: {
    1:  ["Expertise (2 skills)", "Sneak Attack (1d6)", "Thieves' Cant", "Weapon Mastery (2 light/finesse)"],
    2:  ["Cunning Action (Bonus Action: Dash, Disengage, or Hide)"],
    3:  ["Steady Aim (Bonus Action: Adv. on next attack, speed becomes 0)", "Subclass Feature"],
    4:  ["Ability Score Improvement"],
    5:  ["Cunning Strike (−1d6 Sneak Attack for: Poison/Trip/Withdraw/Distract)", "Sneak Attack 3d6", "Uncanny Dodge (Reaction: halve damage)"],
    6:  ["Expertise (2 more skills)"],
    7:  ["Evasion", "Reliable Talent (min 10 on proficient checks)"],
    8:  ["Ability Score Improvement"],
    9:  ["Subclass Feature"],
    10: ["Ability Score Improvement"],
    11: ["Improved Cunning Strike (−1d6 for extra Cunning Strike effects)", "Sneak Attack 6d6"],
    12: ["Ability Score Improvement"],
    13: ["Subclass Feature", "Subtle Strikes (Adv. when ally adj. to target)"],
    14: ["Devious Strikes (additional: Daze/Knock Out/Obscure)"],
    15: ["Slippery Mind (proficiency in WIS and CHA saves)"],
    16: ["Ability Score Improvement"],
    17: ["Subclass Feature"],
    18: ["Elusive (no Adv. against you while not incapacitated)"],
    19: ["Ability Score Improvement", "Epic Boon"],
    20: ["Stroke of Luck (turn miss into hit or failed check into 20, 1/Short Rest)"],
  },
  Sorcerer: {
    1:  ["Innate Sorcery (Bonus Action: advantage on spell attacks, Difficult terrain doesn't slow, 1 min, 2/Long Rest)", "Sorcerous Origin (Subclass)", "Spellcasting (CHA)"],
    2:  ["Font of Magic (Sorcery Points = level)", "Metamagic (2 options)"],
    3:  ["Metamagic (3 options)", "Subclass Feature"],
    4:  ["Ability Score Improvement"],
    5:  ["Sorcerous Restoration (regain 4 Sorcery Points on Short Rest)"],
    6:  ["Subclass Feature"],
    7:  ["Sorcery Incarnate (while Innate Sorcery active: apply 2 Metamagic options)"],
    8:  ["Ability Score Improvement"],
    9:  ["Subclass Feature"],
    10: ["Metamagic (4 options)"],
    11: ["Subclass Feature"],
    12: ["Ability Score Improvement"],
    13: ["Subclass Feature"],
    14: ["Subclass Feature"],
    15: ["Subclass Feature"],
    16: ["Ability Score Improvement"],
    17: ["Metamagic (5 options)", "Subclass Feature"],
    18: ["Subclass Feature"],
    19: ["Ability Score Improvement", "Epic Boon"],
    20: ["Arcane Apotheosis (while Innate Sorcery: one Metamagic for free each turn)"],
  },
  Warlock: {
    1:  ["Eldritch Invocations (1)", "Pact Magic (CHA)", "Subclass Feature"],
    2:  ["Eldritch Invocations (3 total)"],
    3:  ["Subclass Feature", "The Pact Boon (Pact of the Blade/Chain/Talisman/Tome)"],
    4:  ["Ability Score Improvement", "Eldritch Invocations (4 total)"],
    5:  ["Eldritch Invocations (5 total)"],
    6:  ["Subclass Feature"],
    7:  ["Eldritch Invocations (6 total)"],
    8:  ["Ability Score Improvement"],
    9:  ["Contact Patron (Divination/Commune ritual, 1/Long Rest)", "Eldritch Invocations (7 total)"],
    10: ["Subclass Feature"],
    11: ["Mystic Arcanum (1 6th-level spell/Long Rest)", "Eldritch Invocations (8 total)"],
    12: ["Ability Score Improvement"],
    13: ["Mystic Arcanum (7th level)", "Eldritch Invocations (9 total)"],
    14: ["Subclass Feature"],
    15: ["Mystic Arcanum (8th level)", "Eldritch Invocations (10 total)"],
    16: ["Ability Score Improvement"],
    17: ["Mystic Arcanum (9th level)", "Eldritch Invocations (11 total)"],
    18: ["Eldritch Invocations (12 total)"],
    19: ["Ability Score Improvement", "Epic Boon", "Eldritch Invocations (13 total)"],
    20: ["Eldritch Master (regain Pact Magic slots: 1 min ritual, 1/Long Rest)"],
  },
  Wizard: {
    1:  ["Arcane Recovery (recover ½ level spell slots on Short Rest)", "Ritual Adept (ritual-cast any ritual in spellbook)", "Spellcasting (INT)", "Subclass Feature"],
    2:  ["Scholar (Expertise in Arcana or History, one extra language/tool)"],
    3:  ["Subclass Feature"],
    4:  ["Ability Score Improvement"],
    5:  ["Memorise Spell (1 spell → cast without slot, 1/Long Rest)"],
    6:  ["Subclass Feature"],
    7:  ["Subclass Feature"],
    8:  ["Ability Score Improvement"],
    9:  ["Subclass Feature"],
    10: ["Subclass Feature"],
    11: ["Subclass Feature"],
    12: ["Ability Score Improvement"],
    13: ["Subclass Feature"],
    14: ["Subclass Feature"],
    15: ["Subclass Feature"],
    16: ["Ability Score Improvement"],
    17: ["Subclass Feature"],
    18: ["Spell Mastery (cast 1 chosen 1st- and 2nd-level spell without slot)"],
    19: ["Ability Score Improvement", "Epic Boon"],
    20: ["Signature Spells (2 chosen 3rd-level spells always prepared; cast each free 1/Long Rest)"],
  },
};

// ─── SUBCLASS FEATURES (2024 PHB) ─────────────────────────────────────────────
const SUBCLASS_FEATURES = {
  // ── BARBARIAN ──────────────────────────────────────────────────────────────
  Barbarian: {
    "Berserker": {
      3:  ["Frenzy (while Raging: one weapon attack as Bonus Action each turn)"],
      6:  ["Mindless Rage (can't be Charmed or Frightened while Raging)"],
      10: ["Retaliation (Reaction: melee attack when hit by adjacent creature)"],
      14: ["Intimidating Presence (Action: Frighten creature WIS save, 1/Long Rest)"],
    },
    "Totem Warrior": {
      3:  ["Spirit Seeker (ritual Beast Sense & Speak with Animals)", "Totem Spirit (Bear: resistance all dmg; Eagle: Dash as Bonus Action; Wolf: allies have Adv. on melee attacks vs your target)"],
      6:  ["Aspect of the Beast (Bear: double carry; Eagle: see 1 mile; Wolf: track at fast pace)"],
      10: ["Spirit Walker (ritual Commune with Nature)"],
      14: ["Totemic Attunement (Bear: frighten adj. enemies; Eagle: foes have disadv. on opp. attacks; Wolf: knock prone on hit)"],
    },
    "Ancestral Guardian": {
      3:  ["Ancestral Protectors (first target you hit in Rage: has disadv. on attacks vs others, resistance to dmg vs others)"],
      6:  ["Spirit Shield (Reaction: reduce dmg to ally by 2d6/3d6/4d6)"],
      10: ["Consult the Spirits (Clairvoyance 1/Short Rest without a spell slot)"],
      14: ["Vengeful Ancestors (Spirit Shield deals same dmg to attacker)"],
    },
    "Storm Herald": {
      3:  ["Storm Aura (Desert: fire dmg; Sea: lightning/thunder; Tundra: temp HP to allies in 10 ft)"],
      6:  ["Storm Soul (Desert: fire resistance, swim/breathe water; Sea: lightning resistance; Tundra: cold resistance, ignore difficult terrain from ice/snow)"],
      10: ["Shielding Storm (allies in aura gain resistance matching Storm Soul)"],
      14: ["Raging Storm (Desert: Dex save or prone + on fire; Sea: Str save or pushed 20 ft; Tundra: Str save or speed 0)"],
    },
    "Zealot": {
      3:  ["Divine Fury (extra 1d6+½ level radiant or necrotic on first hit each turn)", "Warrior of the Gods (spells that restore your HP don't need a spell slot)"],
      6:  ["Fanatical Focus (once per Rage: reroll failed save)"],
      10: ["Zealous Presence (Bonus Action: allies within 60 ft gain Adv. on attacks & saves for 1 round, 1/Long Rest)"],
      14: ["Rage Beyond Death (while Raging: dropping to 0 HP doesn't knock you unconscious; you die only if Rage ends at 0 HP)"],
    },
    "Beast": {
      3:  ["Form of the Beast (while Raging: gain Bite, Claws, or Tail natural weapon)"],
      6:  ["Bestial Soul (natural weapon counts as magical; swim/climb speed, or jump distance doubled)"],
      10: ["Infectious Fury (hit creature must make WIS save or attack ally or take 2d12 psychic, 1/Rage)"],
      14: ["Call the Hunt (bonus action: up to 5 allies deal +1d6 on weapon attacks for duration of Rage, 1/Long Rest)"],
    },
    "Wild Magic": {
      3:  ["Magic Awareness (Action: detect spells/magic items within 60 ft, 1/Long Rest)", "Wild Surge (roll d8 on Rage start for random magical effect)"],
      6:  ["Bolstering Magic (touch ally: roll d3 to add to attack/check, or expend Rage use to restore 1 spell slot)"],
      10: ["Unstable Backlash (when you take dmg/fail save while Raging: trigger new Wild Surge)"],
      14: ["Controlled Surge (roll d8 twice, choose which Wild Surge to use)"],
    },
    "Giant": {
      3:  ["Giant Power (Primal Knowledge: Giant; throw Tiny/Small creatures as improvised weapon)", "Giant's Havoc (Rage: reach +5 ft; size increases one step)"],
      6:  ["Elemental Cleaver (Rage: weapon deals +1d6 acid/cold/fire/lightning/thunder, choose per Rage)"],
      10: ["Mighty Impel (Bonus Action: throw Large or smaller creature 30 ft, Str save or prone)"],
      14: ["Demiurgic Colossus (Rage: reach +10 ft; size becomes Huge if Medium or smaller; Mighty Impel range 60 ft)"],
    },
  },
  // ── BARD ───────────────────────────────────────────────────────────────────
  Bard: {
    "College of Lore": {
      3:  ["Bonus Proficiencies (3 skills of your choice)", "Cutting Words (Reaction: subtract Bardic Inspiration die from creature's roll)"],
      6:  ["Magical Discoveries (2 spells from any class list)"],
      14: ["Peerless Skill (add Bardic Inspiration die to your own ability check)"],
    },
    "College of Valor": {
      3:  ["Bonus Proficiencies (medium armour, shields, martial weapons)", "Combat Inspiration (allies use Inspiration die for AC or weapon dmg)"],
      6:  ["Extra Attack"],
      14: ["Battle Magic (when you cast a Bard spell: weapon attack as Bonus Action)"],
    },
    "College of Glamour": {
      3:  ["Mantle of Inspiration (Bonus Action: give allies Temp HP = Bardic Inspiration die + CHA; they can move without opp. attacks)", "Enthralling Performance (10-min performance: CHA mod creatures Charmed 1 hr)"],
      6:  ["Mantle of Majesty (Bonus Action: cast Command without slot each turn for 1 min, 1/Long Rest)"],
      14: ["Unbreakable Majesty (Bonus Action: magical presence — attackers make CHA save or lose attack; 1/Short Rest)"],
    },
    "College of Swords": {
      3:  ["Bonus Proficiencies (medium armour, Scimitar)", "Fighting Style (Dueling or Two-Weapon)", "Blade Flourish (move + speed when you attack; spend Inspiration for Defensive/Slashing/Mobile Flourish)"],
      6:  ["Extra Attack"],
      14: ["Master's Flourish (Blade Flourish without spending Bardic Inspiration, roll d6 instead)"],
    },
    "College of Whispers": {
      3:  ["Psychic Blades (spend Bardic Inspiration on hit: +2d6/3d6/5d6/8d6 psychic)", "Words of Terror (after performing 1 min: target Frightened of you for 1 hr, WIS save)"],
      6:  ["Mantle of Whispers (Reaction on humanoid death: shadow disguise of creature, CHA mod hours, 1/Short Rest)"],
      14: ["Shadow Lore (Action: whisper to creature 30 ft — WIS save or Frightened and obeys your commands for 8 hrs; only you can hear; 1/Long Rest)"],
    },
    "College of Creation": {
      3:  ["Mote of Potential (Bardic Inspiration die gives bonus effects depending on use)", "Performance of Creation (Action: create one nonmagical item worth ≤ 20× level gp; CHA mod hours)"],
      6:  ["Animating Performance (animate Large or smaller object for 1 hr, 1/Long Rest)"],
      14: ["Creative Crescendo (Performance of Creation makes CHA mod items simultaneously)"],
    },
    "College of Eloquence": {
      3:  ["Silver Tongue (min 10 on Persuasion/Deception checks)", "Unsettling Words (Bardic Inspiration: subtract die from target's next save)"],
      6:  ["Unfailing Inspiration (if ally fails roll using Bardic Inspiration, they keep the die)", "Universal Speech (Comprehend Languages for free, 1/Long Rest; CHA mod creatures understand you)"],
      14: ["Infectious Inspiration (Reaction: give Bardic Inspiration to ally that succeeded using one; free use)"],
    },
    "College of Spirits": {
      3:  ["Guiding Whispers (Guidance cantrip)", "Spiritual Focus (use spiritual focus as spellcasting focus; +1d6 to healing/dmg spells)", "Tales from Beyond (spend Bardic Inspiration to roll Spirit Tales table for random effect)"],
      6:  ["Spirit Session (ritual to contact spirits: learn one divination or necromancy spell, lasts until Long Rest)"],
      14: ["Mystical Connection (roll Spirit Tales twice, choose which tale)"],
    },
  },
  // ── CLERIC ─────────────────────────────────────────────────────────────────
  Cleric: {
    "Life": {
      1:  ["Bonus Proficiency (heavy armour)", "Disciple of Life (healing spells restore extra 2+spell-level HP)", "Domain Spells: Bless, Cure Wounds"],
      2:  ["Channel Divinity: Preserve Life (restore HP pool = 5×level to any creatures)"],
      3:  ["Domain Spells: Aid, Lesser Restoration"],
      5:  ["Domain Spells: Mass Healing Word, Revivify"],
      6:  ["Blessed Healer (when you heal another: you regain 2+spell-level HP)"],
      7:  ["Domain Spells: Death Ward, Guardian of Faith"],
      9:  ["Domain Spells: Mass Cure Wounds, Raise Dead"],
      17: ["Supreme Healing (healing spells use max die result)"],
    },
    "Light": {
      1:  ["Bonus Cantrip (Light)", "Warding Flare (Reaction: impose disadv. on attacker, CHA mod/Long Rest)", "Domain Spells: Burning Hands, Faerie Fire"],
      2:  ["Channel Divinity: Radiance of the Dawn (dispel magical darkness; radiant dmg to enemies)"],
      3:  ["Domain Spells: Flaming Sphere, Scorching Ray"],
      5:  ["Domain Spells: Daylight, Fireball"],
      6:  ["Improved Flare (Warding Flare also protects allies)"],
      7:  ["Domain Spells: Guardian of Faith, Wall of Fire"],
      9:  ["Domain Spells: Flame Strike, Scrying"],
      17: ["Corona of Light (Action: 60-ft aura of sunlight; enemies have disadv. on saves vs fire/radiant)"],
    },
    "Trickery": {
      1:  ["Blessing of the Trickster (touch ally: Adv. on Stealth for 1 hr)", "Domain Spells: Charm Person, Disguise Self"],
      2:  ["Channel Divinity: Invoke Duplicity (illusory duplicate; cast spells as if from its space; Adv. on attacks vs adjacent enemies)"],
      3:  ["Domain Spells: Mirror Image, Pass without Trace"],
      5:  ["Domain Spells: Blink, Dispel Magic"],
      6:  ["Trickster's Transposition (Bonus Action: swap places with duplicate)"],
      7:  ["Domain Spells: Dimension Door, Polymorph"],
      9:  ["Domain Spells: Dominate Person, Modify Memory"],
      17: ["Improved Duplicity (create 4 duplicates; up to two at once)"],
    },
    "War": {
      1:  ["Bonus Proficiencies (martial weapons, heavy armour)", "War Priest (weapon attack as Bonus Action, WIS mod/Long Rest)", "Domain Spells: Divine Favor, Shield of Faith"],
      2:  ["Channel Divinity: Guided Strike (+10 to attack roll)"],
      3:  ["Domain Spells: Magic Weapon, Spiritual Weapon"],
      5:  ["Domain Spells: Crusader's Mantle, Spirit Guardians"],
      6:  ["Channel Divinity: War God's Blessing (Reaction: give ally +10 to hit)"],
      7:  ["Domain Spells: Freedom of Movement, Stoneskin"],
      9:  ["Domain Spells: Flame Strike, Hold Monster"],
      17: ["Avatar of Battle (resistance to bludgeoning, piercing, slashing from nonmagical weapons)"],
    },
    "Nature": {
      1:  ["Acolyte of Nature (Druidcraft cantrip; proficiency in one skill: Animal Handling, Nature, Survival)", "Bonus Proficiency (heavy armour)", "Domain Spells: Animal Friendship, Speak with Animals"],
      2:  ["Channel Divinity: Charm Animals and Plants"],
      3:  ["Domain Spells: Barkskin, Spike Growth"],
      5:  ["Domain Spells: Plant Growth, Wind Wall"],
      6:  ["Dampen Elements (Reaction: grant resistance to acid/cold/fire/lightning/thunder to self or ally)"],
      7:  ["Domain Spells: Dominate Beast, Grasping Vine"],
      9:  ["Domain Spells: Insect Plague, Tree Stride"],
      17: ["Master of Nature (Command charmed animals/plants as Bonus Action)"],
    },
    "Tempest": {
      1:  ["Bonus Proficiencies (martial weapons, heavy armour)", "Wrath of the Storm (Reaction: deal 2d8 lightning/thunder when hit, DEX save for half)", "Domain Spells: Fog Cloud, Thunderwave"],
      2:  ["Channel Divinity: Destructive Wrath (maximize lightning/thunder dmg roll)"],
      3:  ["Domain Spells: Gust of Wind, Shatter"],
      5:  ["Domain Spells: Call Lightning, Sleet Storm"],
      6:  ["Thunderbolt Strike (push Large/smaller creatures 10 ft on lightning dmg)"],
      7:  ["Domain Spells: Control Water, Ice Storm"],
      9:  ["Domain Spells: Destructive Wave, Insect Plague"],
      17: ["Stormborn (fly speed = walking speed outdoors)"],
    },
    "Knowledge": {
      1:  ["Blessings of Knowledge (proficiency + expertise in 2 languages and 2 skills: Arcana, History, Nature, Religion)", "Domain Spells: Command, Identify"],
      2:  ["Channel Divinity: Knowledge of the Ages (proficiency in any skill or tool for 10 min)", "Channel Divinity: Read Thoughts (read surface thoughts, WIS save; then Command)"],
      3:  ["Domain Spells: Augury, Suggestion"],
      5:  ["Domain Spells: Nondetection, Speak with Dead"],
      6:  ["Channel Divinity: Read Thoughts"],
      7:  ["Domain Spells: Arcane Eye, Confusion"],
      9:  ["Domain Spells: Legend Lore, Scrying"],
      17: ["Visions of the Past (meditate to see recent events connected to object or place)"],
    },
    "Forge": {
      1:  ["Bonus Proficiency (heavy armour, Smith's Tools)", "Blessing of the Forge (touch weapon or armour: +1 magic until Long Rest)", "Domain Spells: Identify, Searing Smite"],
      2:  ["Channel Divinity: Artisan's Blessing (create metal item worth ≤ 100 gp in 1 hr)"],
      3:  ["Domain Spells: Heat Metal, Magic Weapon"],
      5:  ["Domain Spells: Elemental Weapon, Protection from Energy"],
      6:  ["Soul of the Forge (resistance to fire; +1 AC in medium/heavy armour)"],
      7:  ["Domain Spells: Fabricate, Wall of Fire"],
      9:  ["Domain Spells: Animate Objects, Creation"],
      17: ["Saint of Forge and Fire (immunity to fire; resistant to bludgeoning/piercing/slashing from nonmagical weapons in heavy armour)"],
    },
    "Grave": {
      1:  ["Circle of Mortality (healing a creature at 0 HP maximises dice)", "Eyes of the Grave (sense undead within 60 ft, WIS mod/Long Rest)", "Domain Spells: Bane, False Life"],
      2:  ["Channel Divinity: Path to the Grave (curse creature — next hit is a critical)"],
      3:  ["Domain Spells: Gentle Repose, Ray of Enfeeblement"],
      5:  ["Domain Spells: Revivify, Vampiric Touch"],
      6:  ["Sentinel at Death's Door (Reaction: negate a critical hit, WIS mod/Long Rest)"],
      7:  ["Domain Spells: Blight, Death Ward"],
      9:  ["Domain Spells: Antilife Shell, Raise Dead"],
      17: ["Keeper of Souls (harvest life energy when enemy dies near you; restore HP = creature's HD)"],
    },
    "Order": {
      1:  ["Bonus Proficiencies (heavy armour, Persuasion)", "Voice of Authority (when you cast a spell on ally using a slot: they can use Reaction to make one weapon attack)", "Domain Spells: Command, Heroism"],
      2:  ["Channel Divinity: Order's Demand (Charm creatures in 30-ft cone, WIS save)"],
      3:  ["Domain Spells: Hold Person, Zone of Truth"],
      5:  ["Domain Spells: Mass Healing Word, Slow"],
      6:  ["Embodiment of the Law (cast enchantment spells of 1st+ level as Bonus Action, WIS mod/Long Rest)"],
      7:  ["Domain Spells: Compulsion, Locate Creature"],
      9:  ["Domain Spells: Commune, Dominate Person"],
      17: ["Order's Wrath (when Voice of Authority activates: +2d8 psychic dmg on that attack)"],
    },
    "Peace": {
      1:  ["Emboldening Bond (bond creatures = PB; bonded creatures add d4 to any d20 when within 30 ft of bonded ally)", "Implement of Peace (proficiency in Insight, Performance, or Persuasion)", "Domain Spells: Heroism, Sanctuary"],
      2:  ["Channel Divinity: Balm of Peace (move up to speed, heal each creature you pass within 5 ft = 2d6+WIS)"],
      3:  ["Domain Spells: Aid, Warding Bond"],
      5:  ["Domain Spells: Beacon of Hope, Sending"],
      6:  ["Protective Bond (bonded creature takes dmg: another bonded creature can Reaction to teleport and take the dmg instead)"],
      7:  ["Domain Spells: Aura of Purity, Otiluke's Resilient Sphere"],
      9:  ["Domain Spells: Greater Restoration, Rary's Telepathic Bond"],
      17: ["Expansive Bond (Protective Bond works regardless of distance; resistance to dmg when teleporting for Protective Bond)"],
    },
    "Twilight": {
      1:  ["Bonus Proficiencies (martial weapons, heavy armour)", "Eyes of Night (darkvision 300 ft; share with WIS mod creatures for 1 hr, 1/Long Rest)", "Vigilant Blessing (touch creature: Adv. on initiative until it rolls)", "Domain Spells: Faerie Fire, Sleep"],
      2:  ["Channel Divinity: Twilight Sanctuary (30-ft sphere of dim light aura; allies gain Temp HP = cleric level + WIS or end Frightened/Charmed)"],
      3:  ["Domain Spells: Moonbeam, See Invisibility"],
      5:  ["Domain Spells: Aura of Vitality, Leomund's Tiny Hut"],
      6:  ["Steps of Night (Bonus Action in darkness: fly speed = walking speed, 1/Long Rest)"],
      7:  ["Domain Spells: Aura of Life, Greater Invisibility"],
      9:  ["Domain Spells: Circle of Power, Mislead"],
      17: ["Twilight Shroud (Twilight Sanctuary grants half cover to creatures inside)"],
    },
    "Death": {
      1:  ["Bonus Proficiency (martial weapons)", "Reaper (necromancy cantrips target 2 creatures)", "Domain Spells: False Life, Ray of Sickness"],
      2:  ["Channel Divinity: Touch of Death (maximise necromancy/poison dmg + extra 5+2×level necrotic)"],
      3:  ["Domain Spells: Blindness/Deafness, Ray of Enfeeblement"],
      5:  ["Domain Spells: Animate Dead, Vampiric Touch"],
      6:  ["Inescapable Destruction (necrotic dmg ignores resistance)"],
      7:  ["Domain Spells: Blight, Death Ward"],
      9:  ["Domain Spells: Antilife Shell, Cloudkill"],
      17: ["Improved Reaper (1st–5th level necromancy spells can target 2 creatures within range)"],
    },
    "Arcana": {
      1:  ["Arcane Initiate (Wizard cantrips ×2)", "Domain Spells: Detect Magic, Magic Missile"],
      2:  ["Channel Divinity: Arcane Abjuration (Turn Celestials/Elementals/Fey/Fiends; banish at level 5)"],
      3:  ["Domain Spells: Magic Weapon, Nystul's Magic Aura"],
      5:  ["Domain Spells: Dispel Magic, Magic Circle"],
      6:  ["Spell Breaker (when you heal ally: also end one spell on them of level ≤ spell slot used)"],
      7:  ["Domain Spells: Arcane Eye, Leomund's Secret Chest"],
      9:  ["Domain Spells: Planar Binding, Teleportation Circle"],
      17: ["Arcane Mastery (add 4 Wizard spells to spell list: 6th, 7th, 8th, 9th level each)"],
    },
  },
  // ── DRUID ──────────────────────────────────────────────────────────────────
  Druid: {
    "Circle of the Land": {
      2:  ["Land's Aid (Channel Wildshape: damage nearby foes & heal allies)", "Circle Spells (biome-based spells always prepared)"],
      3:  ["Land's Stride (difficult terrain doesn't slow you; immune to plants that impede movement)"],
      6:  ["Natural Recovery (Short Rest: recover spell slots totalling ½ level, rounded up)"],
      10: ["Nature's Ward (immune to Poison, Charmed, Frightened from elementals/fey; resistant to chosen damage type)"],
      14: ["Nature's Sanctuary (beasts/plants make WIS save or can't attack you)"],
    },
    "Circle of the Moon": {
      2:  ["Combat Wild Shape (Wild Shape as Bonus Action; expend spell slots to regain HP in Wild Shape)", "Circle Forms (Wild Shape CR = level / 3, rounded down; can become elementals at level 10)"],
      6:  ["Primal Strike (Wild Shape attacks count as magical)"],
      10: ["Elemental Wild Shape (expend 2 Wild Shape uses to become an Air/Earth/Fire/Water Elemental)"],
      14: ["Thousand Forms (cast Alter Self at will)"],
    },
    "Circle of Dreams": {
      2:  ["Balm of the Summer Court (d6s = level; Bonus Action: touch creature, expend dice to heal + gain Temp HP)"],
      6:  ["Hearth of Moonlight and Shadow (short rest: 30-ft sphere of comfort; dim light, no sounds escape, undead/fiends disadv.)"],
      10: ["Hidden Paths (Bonus Action: teleport 60 ft; or touch willing creature to teleport them, WIS mod/Long Rest)"],
      14: ["Walker in Dreams (after Short Rest: Dream, Scrying, or Teleportation Circle 1/Long Rest)"],
    },
    "Circle of the Shepherd": {
      2:  ["Speech of the Woods (Speak with Animals; Sylvan language)", "Spirit Totem (Bonus Action: summon Bear/Hawk/Unicorn spirit aura 60 ft for 1 min, 1/Short Rest)"],
      6:  ["Mighty Summoner (summoned/conjured beasts/fey get +2 HP/HD and attacks count as magical)"],
      10: ["Guardian Spirit (summoned/conjured beasts/fey regain HP = ½ your druid level at end of turn)"],
      14: ["Faithful Summons (when incapacitated: automatically summon 4 spirit beasts CR 2)"],
    },
    "Circle of Spores": {
      2:  ["Halo of Spores (Reaction: 1d4/1d6/1d8 necrotic to nearby creature, CON save)", "Symbiotic Entity (Channel Wildshape: 4×level Temp HP, halo deals +1d6 necrotic, melee attacks deal +1d6 necrotic for 10 min)"],
      3:  ["Circle Spells: Blindness/Deafness, Gentle Repose"],
      5:  ["Fungal Infestation (when a Small/Medium beast/humanoid dies within 10 ft: animate as zombie, 1 hr, CON mod/Long Rest)"],
      6:  ["Circle Spells: Animate Dead, Gaseous Form"],
      9:  ["Circle Spells: Blight, Confusion"],
      10: ["Spreading Spores (Channel Wildshape: place spore cloud 10-ft cube, creatures entering take Halo dmg)"],
      14: ["Fungal Body (immune to Blinded, Deafened, Frightened, Poisoned; critical hits become normal hits)"],
    },
    "Circle of Stars": {
      2:  ["Star Map (Guidance cantrip; Guiding Bolt prepared; cast Guiding Bolt WIS mod/Long Rest free)", "Starry Form (Channel Wildshape: Archer/Chalice/Dragon constellation for 10 min)"],
      6:  ["Cosmic Omen (Long Rest: roll d6 — odd=Weal (Reaction: +1d6 to ally's roll) or even=Woe (Reaction: -1d6 to enemy's roll), WIS mod/Long Rest)"],
      10: ["Twinkling Constellations (Starry Form features improve; can change form each turn)"],
      14: ["Full of Stars (while Starry Form: resistant to bludgeoning/piercing/slashing; become partially incorporeal)"],
    },
    "Circle of Wildfire": {
      2:  ["Enhanced Bond (roll d8 twice when healing/dmg spells from familiar's space)", "Summon Wildfire Spirit (Channel Wildshape: summon wildfire spirit 1 hr)"],
      3:  ["Circle Spells: Burning Hands, Cure Wounds"],
      5:  ["Circle Spells: Flaming Sphere, Scorching Ray"],
      6:  ["Cauterizing Flames (when creature within 60 ft dies: green flame; Reaction to heal or deal fire dmg, WIS mod/Long Rest)"],
      7:  ["Circle Spells: Aura of Life, Fire Shield"],
      9:  ["Circle Spells: Flame Strike, Mass Cure Wounds"],
      10: ["Blazing Revival (when Spirit within 120 ft and you drop to 0 HP: extinguish spirit to return to 1 HP, 1/Long Rest)"],
      14: ["Firestorm (Reaction when Spirit damages: also deal 2d10 fire dmg to each creature near Spirit)"],
    },
  },
  // ── FIGHTER ────────────────────────────────────────────────────────────────
  Fighter: {
    "Battle Master": {
      3:  ["Combat Superiority (4 Superiority Dice d8; 3 maneuvers)", "Student of War (proficiency with Artisan's Tools)"],
      7:  ["Know Your Enemy (1 min study: learn 2 of STR/DEX/CON/AC/CR/class levels/HP compared to yours)", "Superiority Dice d10 (7 maneuvers)"],
      10: ["Improved Combat Superiority (Superiority Dice d10; 5 maneuvers)"],
      15: ["Relentless (if no Superiority Dice on initiative: regain 1)"],
      18: ["Superiority Dice d12 (9 maneuvers)"],
    },
    "Champion": {
      3:  ["Improved Critical (crit on 19–20)"],
      7:  ["Remarkable Athlete (+½ PB to STR/DEX/CON checks; running jump += STR mod)"],
      10: ["Additional Fighting Style"],
      15: ["Superior Critical (crit on 18–20)"],
      18: ["Survivor (regain 5+CON mod HP at start of turn when at ≤ ½ max HP)"],
    },
    "Eldritch Knight": {
      3:  ["Spellcasting (INT, Wizard spells)", "Weapon Bond (ritual bond to 2 weapons; summon as Bonus Action, can't be disarmed)"],
      7:  ["War Magic (when you cast a cantrip: weapon attack as Bonus Action)"],
      10: ["Eldritch Strike (hit creature: disadv. on next save vs your spell this turn)"],
      15: ["Arcane Charge (Action Surge: also Misty Step for free)"],
      18: ["Improved War Magic (when you cast any spell: weapon attack as Bonus Action)"],
    },
    "Psi Warrior": {
      3:  ["Psionic Power (Psionic Energy dice = 2×PB, d6; Protective Field, Psionic Strike, Telekinetic Movement)"],
      7:  ["Telekinetic Adept (Psi-Powered Leap: fly speed 2× walking 1 round; Telekinetic Thrust: Str save or knocked prone/moved 10 ft on Psionic Strike)"],
      10: ["Guarded Mind (resistance to psychic dmg; Action + 1 die: end Charmed/Frightened)"],
      15: ["Bulwark of Force (Bonus Action: PB creatures within 30 ft gain half-cover for 1 min, 1/Long Rest)"],
      18: ["Telekinetic Master (Telekinesis at will; maintain with Bonus Action; still attack normally)"],
    },
    "Echo Knight": {
      3:  ["Manifest Echo (Bonus Action: create echo; redirect attacks to echo; swap places with echo; echo's attacks deal 1d6+mod dmg)", "Unleash Incarnation (Extra Attack via echo, CON mod/Long Rest)"],
      7:  ["Echo Avatar (see/hear through echo up to 10 min)"],
      10: ["Shadow Martyr (Reaction: echo takes a hit meant for ally)"],
      15: ["Reclaim Potential (when echo is destroyed: gain 2d6+CON mod Temp HP, CON mod/Long Rest)"],
      18: ["Legion of One (manifest 2 echoes; regain 1 use on initiative if none left)"],
    },
    "Rune Knight": {
      3:  ["Bonus Proficiency (Smith's Tools)", "Giant's Might (Bonus Action: grow to Large for 1 min, +1d6 dmg, Adv. on STR checks/saves, CON mod/Long Rest)", "Rune Carving (learn 2 runes from: Cloud/Stone/Storm/Fire/Frost/Hill)"],
      7:  ["Runic Shield (Reaction: cause attacker to reroll when ally is hit, PB/Long Rest)"],
      10: ["Great Stature (+2d4 in height; Large form uses d8 extra dmg)"],
      15: ["Master of Runes (invoke each rune twice instead of once)"],
      18: ["Runic Juggernaut (Huge size in Giant's Might; +1d10 extra dmg; advantage on STR checks)"],
    },
    "Samurai": {
      3:  ["Bonus Proficiency (History, Insight, Performance, or Persuasion; one language)", "Fighting Spirit (Bonus Action: Adv. on weapon attacks + 5/10/15 Temp HP for 1 min, 3/Long Rest)"],
      7:  ["Elegant Courtier (WIS mod to CHA (Persuasion); extra save proficiency from INT/WIS/CHA)"],
      10: ["Tireless Spirit (if no Fighting Spirit uses, regain 1 on initiative)"],
      15: ["Rapid Strike (once per turn: forgo Adv. on attack for extra attack)"],
      18: ["Strength Before Death (when reduced to 0 HP: interrupt and take a bonus turn; drop unconscious after)"],
    },
    "Arcane Archer": {
      3:  ["Arcane Archer Lore (Arcana or Nature proficiency; choose Prestidigitation or Druidcraft)", "Arcane Shot (2 options; 2 uses/Short Rest)"],
      7:  ["Curving Shot (miss with Arcane Shot: redirect to new target as Bonus Action)"],
      10: ["Magic Arrow (arrows count as magical)"],
      15: ["Ever-Ready Shot (regain 1 Arcane Shot use on initiative if none left)"],
      18: ["Improved Arcane Shot (4 Arcane Shot options; 3 uses/Short Rest)"],
    },
  },
  // ── MONK ───────────────────────────────────────────────────────────────────
  Monk: {
    "Way of the Open Hand": {
      3:  ["Open Hand Technique (after Flurry of Blows hit: knock prone (DEX save), push 15 ft (STR save), or prevent reactions)"],
      6:  ["Wholeness of Body (Action: regain HP = 3× Monk level, 1/Long Rest)"],
      11: ["Tranquility (after Long Rest: Sanctuary effect until you attack/cast)"],
      17: ["Quivering Palm (1 Focus: vibrations in target; Action later to reduce to 0 HP, CON save; or deal 10d10 necrotic)"],
    },
    "Way of Shadow": {
      3:  ["Shadow Arts (1 Focus: cast Darkness, Darkvision, Pass without Trace, or Silence)"],
      6:  ["Shadow Step (Bonus Action: teleport between dim light/darkness; Adv. on first attack)"],
      11: ["Cloak of Shadows (Action in dim light/darkness: become invisible until attack/cast/bright light)"],
      17: ["Opportunist (Reaction: attack when adjacent ally hits a creature)"],
    },
    "Way of the Four Elements": {
      3:  ["Disciple of the Elements (learn 2 Elemental Disciplines; spend Focus Points to cast spells)"],
      6:  ["Additional Elemental Discipline"],
      11: ["Additional Elemental Discipline"],
      17: ["Additional Elemental Discipline; access to powerful 4th-level disciplines"],
    },
    "Way of the Astral Self": {
      3:  ["Arms of the Astral Self (Bonus Action + 1 Focus: summon astral arms for WIS attacks + extra bonus action hit; lasts 10 min)"],
      6:  ["Visage of the Astral Self (1 Focus: astral visage; Adv. on Insight/Intimidation; speak and understand all languages; darkvision 120 ft)"],
      11: ["Body of the Astral Self (1 Focus: astral body — Deflect Energy upgrade; reaction dmg to attackers; +WIS to AC)"],
      17: ["Awakened Astral Self (no Focus cost for Arms + Visage + Body; extra attack with astral arms)"],
    },
    "Way of the Drunken Master": {
      3:  ["Bonus Proficiency (Performance; Brewer's Supplies)", "Drunken Technique (Flurry of Blows: also Disengage; +10 ft movement)"],
      6:  ["Tipsy Sway (enemies miss you: redirect to another creature as Reaction; stand from prone uses only 5 ft)"],
      11: ["Drunkard's Luck (Adv. on d20 when Disadvantage; costs 2 Focus)"],
      17: ["Intoxicated Frenzy (Flurry of Blows: up to 3 extra attacks on separate creatures)"],
    },
    "Way of the Kensei": {
      3:  ["Path of the Kensei (choose 2 Kensei weapons; one-handed ranged or +2 AC Bonus Action with melee)"],
      6:  ["One with the Blade (Kensei attacks magical; Deft Strike: +1d4 dmg for 1 Focus)"],
      11: ["Sharpen the Blade (Bonus Action: +1/+2/+3 attack+dmg for 1/2/3 Focus for 1 min)"],
      17: ["Unerring Accuracy (reroll one missed attack per turn)"],
    },
    "Way of Mercy": {
      3:  ["Implements of Mercy (Insight & Medicine proficiency; Herbalism Kit)", "Hand of Healing (spend Focus: touch creature to heal 1d6+WIS; or as part of Flurry of Blows for free)", "Hand of Harm (1 Focus: add 1d6+WIS necrotic on unarmed hit + Poisoned 1 turn)"],
      6:  ["Physician's Touch (Hand of Healing: also end one disease/condition; Hand of Harm: also Poisoned)"],
      11: ["Flurry of Healing and Harm (Flurry of Blows: replace hits with Hand of Healing for free)"],
      17: ["Hand of Ultimate Mercy (150 gp incense; touch dead creature ≤ 24 hrs: cast Raise Dead, 1/Long Rest)"],
    },
    "Way of the Sun Soul": {
      3:  ["Radiant Sun Bolt (ranged spell attack, 1d6+DEX/STR radiant; Extra Attack replaces one for 2 bolts for 1 Focus)"],
      6:  ["Searing Arc Strike (after attacking: cast Burning Hands for 2+spell-level Focus)"],
      11: ["Searing Sunburst (Action: 20-ft radius 2d6 radiant; CON save; spend 1–3 Focus for +2d6 each)"],
      17: ["Sun Shield (bright light aura 30 ft; reaction when hit: 5+WIS radiant)"],
    },
  },
  // ── PALADIN ────────────────────────────────────────────────────────────────
  Paladin: {
    "Oath of Devotion": {
      3:  ["Sacred Weapon (Channel Divinity: CHA mod to attacks; weapon sheds light; counts as magical)", "Oath Spells: Protection from Evil and Good, Shield of Faith"],
      5:  ["Oath Spells: Aid, Zone of Truth"],
      7:  ["Aura of Devotion (allies within 10 ft can't be Charmed)"],
      9:  ["Oath Spells: Beacon of Hope, Dispel Magic"],
      13: ["Oath Spells: Freedom of Movement, Guardian of Faith"],
      15: ["Purity of Spirit (Protection from Evil and Good always active on you)"],
      17: ["Oath Spells: Commune, Flame Strike"],
      20: ["Holy Nimbus (aura of sunlight 30 ft; enemies in aura take 10 radiant at turn start; Adv. on saves vs fiend/undead spells)"],
    },
    "Oath of the Ancients": {
      3:  ["Nature's Wrath (Channel Divinity: restrain creature, STR/DEX save)", "Oath Spells: Ensnaring Strike, Speak with Animals", "Turn the Faithless (Channel Divinity: Turn fey & fiends)"],
      5:  ["Oath Spells: Moonbeam, Misty Step"],
      7:  ["Aura of Warding (allies within 10 ft resistant to spell dmg)"],
      9:  ["Oath Spells: Plant Growth, Protection from Energy"],
      13: ["Oath Spells: Ice Storm, Stoneskin"],
      15: ["Undying Sentinel (when dropped to 0 HP: stay at 1 HP instead, 1/Long Rest)"],
      17: ["Oath Spells: Commune with Nature, Tree Stride"],
      20: ["Elder Champion (transform: regain 10 HP per turn; cast 1st-level Oath spells for free; enemies within 10 ft have disadv. on saves vs Paladin spells)"],
    },
    "Oath of Vengeance": {
      3:  ["Abjure Enemy (Channel Divinity: Frighten one creature 1 min, WIS save; fiend/undead have disadv.)", "Oath Spells: Bane, Hunter's Mark", "Vow of Enmity (Channel Divinity: Adv. on attacks vs one creature for 1 min)"],
      5:  ["Oath Spells: Hold Person, Misty Step"],
      7:  ["Relentless Avenger (on opp. attack hit: move ½ speed as Reaction)"],
      9:  ["Oath Spells: Haste, Protection from Energy"],
      13: ["Oath Spells: Banishment, Dimension Door"],
      15: ["Soul of Vengeance (when target of Vow of Enmity attacks: Reaction to make weapon attack)"],
      17: ["Oath Spells: Hold Monster, Scrying"],
      20: ["Avenging Angel (fly speed 60 ft; aura of menace 30 ft — WIS save or Frightened + disadv. on attacks for 1 min)"],
    },
    "Oath of Conquest": {
      3:  ["Conquering Presence (Channel Divinity: Frightened in 30-ft cone, WIS save)", "Guided Strike (Channel Divinity: +10 to hit)", "Oath Spells: Armor of Agathys, Command"],
      5:  ["Oath Spells: Hold Person, Spiritual Weapon"],
      7:  ["Aura of Conquest (Frightened creatures within 10 ft: speed 0; take psychic dmg when they start turn there)"],
      9:  ["Oath Spells: Bestow Curse, Fear"],
      13: ["Oath Spells: Dominate Beast, Stoneskin"],
      15: ["Scornful Rebuke (when you take dmg: attacker takes psychic dmg = CHA mod)"],
      17: ["Oath Spells: Cloudkill, Dominate Person"],
      20: ["Invincible Conqueror (extra attack; resistance to all dmg; crit on 19–20 for 1 min, 1/Long Rest)"],
    },
    "Oath of Redemption": {
      3:  ["Emissary of Peace (Channel Divinity: +5 to Persuasion for 10 min)", "Oath Spells: Sanctuary, Sleep", "Rebuke the Violent (Channel Divinity: Reaction when ally is hit — attacker takes same dmg radiant, WIS save for half)"],
      5:  ["Oath Spells: Calm Emotions, Hold Person"],
      7:  ["Aura of the Guardian (Reaction: take dmg meant for ally within 10 ft; you take it instead)"],
      9:  ["Oath Spells: Counterspell, Hypnotic Pattern"],
      13: ["Oath Spells: Otiluke's Resilient Sphere, Stoneskin"],
      15: ["Protective Spirit (if at < ½ HP at end of turn: regain 1d6+½ Paladin level HP)"],
      17: ["Oath Spells: Hold Monster, Wall of Force"],
      20: ["Emissary of Redemption (resistance to all dmg from creatures; when a creature damages you: it takes radiant dmg = ½ dmg dealt; until you attack it or cast on it)"],
    },
    "Oath of Glory": {
      3:  ["Inspiring Smite (Channel Divinity: after Divine Smite — distribute 2d8+Paladin level Temp HP to creatures within 30 ft)", "Oath Spells: Guiding Bolt, Heroism", "Peerless Athlete (Channel Divinity: Adv. on STR/DEX checks; double carry; +10 jump for 1 hr)"],
      5:  ["Oath Spells: Enhance Ability, Magic Weapon"],
      7:  ["Aura of Alacrity (ally starting turn in 10 ft gains +10 speed for that turn)"],
      9:  ["Oath Spells: Haste, Protection from Energy"],
      13: ["Oath Spells: Compulsion, Freedom of Movement"],
      15: ["Glorious Defense (Reaction: +CHA mod to ally's AC; if attack misses — weapon attack vs attacker for free, CHA mod/Long Rest)"],
      17: ["Oath Spells: Legend Lore, Yolande's Regal Presence"],
      20: ["Living Legend (CHA mod to saves; once per turn missed attack = hit; cast Zone of Truth for free; all for 1 min, 1/Long Rest)"],
    },
    "Oath of the Watchers": {
      3:  ["Abjure the Extraplanar (Channel Divinity: Turn aberrations/celestials/elementals/fey/fiends)", "Oath Spells: Alarm, Detect Magic", "Watcher's Will (Channel Divinity: CHA mod creatures within 30 ft Adv. on INT/WIS/CHA saves for 1 min)"],
      5:  ["Oath Spells: Moonbeam, See Invisibility"],
      7:  ["Aura of the Sentinel (allies within 10 ft add PB to initiative)"],
      9:  ["Oath Spells: Counterspell, Nondetection"],
      13: ["Oath Spells: Aura of Purity, Banishment"],
      15: ["Vigilant Rebuke (Reaction when ally/you succeeds on INT/WIS/CHA save: deal 2d8+CHA force to the caster)"],
      17: ["Oath Spells: Hold Monster, Scrying"],
      20: ["Mortal Bulwark (truesight 120 ft; Adv. on attacks vs aberrations/celestials/elementals/fey/fiends; when you hit one: banish it unless it saves, for 1 min, 1/Long Rest)"],
    },
    "Oathbreaker": {
      3:  ["Channel Divinity: Control Undead (undead must obey, WIS save)", "Channel Divinity: Dreadful Aspect (Frighten nearby creatures 1 min, WIS save)", "Oath Spells: Hellish Rebuke, Inflict Wounds"],
      5:  ["Oath Spells: Crown of Madness, Darkness"],
      7:  ["Aura of Hate (you and undead/fiends within 10 ft add CHA mod to melee dmg)"],
      9:  ["Oath Spells: Animate Dead, Bestow Curse"],
      13: ["Oath Spells: Blight, Confusion"],
      15: ["Supernatural Resistance (resistance to bludgeoning/piercing/slashing from nonmagical weapons)"],
      17: ["Oath Spells: Contagion, Dominate Person"],
      20: ["Dread Lord (aura of gloom 30 ft — sunlight suppressed; Frightened creatures make WIS saves at disadvantage; shadow dmg to enemies in aura; summoned shadows)"],
    },
  },
  // ── RANGER ─────────────────────────────────────────────────────────────────
  Ranger: {
    "Hunter": {
      3:  ["Hunter's Prey (Colossus Slayer: +1d8 on injured target 1/turn; Giant Killer: Reaction attack on Large+; Horde Breaker: extra attack on adjacent)"],
      7:  ["Defensive Tactics (Escape the Horde: no opp. attacks on Disengage; Multiattack Defense: +4 AC after hit; Steel Will: Adv. vs Frightened)"],
      11: ["Multiattack (Volley: ranged attack in 10-ft radius; Whirlwind Attack: melee all adjacent)"],
      15: ["Superior Hunter's Defense (Evasion; Stand Against the Tide: redirect miss to another; Uncanny Dodge)"],
    },
    "Beast Master": {
      3:  ["Ranger's Companion (bond a Beast up to CR ¼; acts on your turn, uses your PB for attacks/saves; extra action to command)", "Primal Bond (add PB to companion's ability checks; or give it an ASI)"],
      7:  ["Exceptional Training (on your turn: command companion to Dash/Disengage/Dodge/Help as Bonus Action; companion's attacks count as magical)"],
      11: ["Bestial Fury (companion attacks twice when commanded to attack)"],
      15: ["Share Spells (when you cast a spell on yourself: companion is also affected if within 30 ft)"],
    },
    "Gloom Stalker": {
      3:  ["Dread Ambusher (initiative +WIS; extra attack on first turn; +1d8 dmg on first attack)", "Gloom Stalker Magic: Disguise Self", "Umbral Sight (darkvision 60 ft; invisible to darkvision in darkness)"],
      5:  ["Gloom Stalker Magic: Rope Trick"],
      7:  ["Iron Mind (proficiency in WIS saves)"],
      9:  ["Gloom Stalker Magic: Fear"],
      11: ["Stalker's Flurry (once per turn: miss → immediately make another attack)"],
      13: ["Gloom Stalker Magic: Greater Invisibility"],
      15: ["Shadowy Dodge (Reaction when hit: attackers have disadv. until end of turn)"],
      17: ["Gloom Stalker Magic: Seeming"],
    },
    "Horizon Walker": {
      3:  ["Detect Portal (sense planar portals within 1 mile, 1/Short Rest)", "Horizon Walker Magic: Protection from Evil and Good", "Planar Warrior (Bonus Action: +1d8 force on next hit, target = force dmg)"],
      5:  ["Horizon Walker Magic: Misty Step"],
      7:  ["Ethereal Step (Bonus Action: Etherealness until end of turn, 1/Short Rest at 11th; free at 11th)"],
      9:  ["Horizon Walker Magic: Haste"],
      11: ["Distant Strike (teleport 10 ft before each attack; third attack = different target)"],
      13: ["Horizon Walker Magic: Banishment"],
      15: ["Spectral Defense (Reaction when hit: resistance to that attack)"],
      17: ["Horizon Walker Magic: Teleportation Circle"],
    },
    "Monster Slayer": {
      3:  ["Hunter's Sense (Action: learn immunities/resistances/vulnerabilities of target, 1/Short Rest)", "Monster Slayer Magic: Protection from Evil and Good", "Slayer's Prey (Bonus Action: mark target; +1d6 on first hit each turn)"],
      5:  ["Monster Slayer Magic: Zone of Truth"],
      7:  ["Supernatural Defense (add 1d6 to saves vs marked target's spells/abilities)"],
      9:  ["Monster Slayer Magic: Magic Circle"],
      11: ["Magic-User's Nemesis (Reaction: Counterspell/Dispel Magic once on marked target, 1/Short Rest)"],
      13: ["Monster Slayer Magic: Banishment"],
      15: ["Slayer's Counter (Reaction: attack marked target when they force you to make a save)"],
      17: ["Monster Slayer Magic: Hold Monster"],
    },
    "Fey Wanderer": {
      3:  ["Dreadful Strikes (once/turn: +1d4 psychic, increases to 1d6 at level 11)", "Fey Wanderer Magic: Charm Person", "Otherworldly Glamour (add WIS mod to CHA checks; proficiency in Deception, Performance, or Persuasion)"],
      5:  ["Fey Wanderer Magic: Misty Step"],
      7:  ["Beguiling Twist (Reaction when nearby creature succeeds on Charmed/Frightened save: redirect to another creature, WIS save)"],
      9:  ["Fey Wanderer Magic: Dispel Magic"],
      11: ["Fey Reinforcements (Summon Fey 1/Long Rest free; Misty Step without slot)"],
      13: ["Fey Wanderer Magic: Dimension Door"],
      15: ["Misty Wanderer (Misty Step also brings willing creature; WIS mod/Long Rest)"],
      17: ["Fey Wanderer Magic: Mislead"],
    },
    "Swarmkeeper": {
      3:  ["Gathered Swarm (swarm of nature spirits orbits you; on hit: +1d6 piercing, or move target 15 ft, or move yourself 5 ft)", "Swarmkeeper Magic: Mage Hand"],
      5:  ["Swarmkeeper Magic: Web"],
      7:  ["Writhing Tide (Bonus Action: fly speed = walking speed for 1 min; swarm lifts you; WIS mod/Long Rest)"],
      9:  ["Swarmkeeper Magic: Gaseous Form"],
      11: ["Mighty Swarm (Gathered Swarm effects improve: 1d8; knocked prone or moved 30 ft; Reaction to give half cover)"],
      13: ["Swarmkeeper Magic: Arcane Eye"],
      15: ["Swarming Dispersal (Reaction when hit: become resistance to that dmg, teleport up to 30 ft, WIS mod/Long Rest)"],
      17: ["Swarmkeeper Magic: Insect Plague"],
    },
    "Drakewarden": {
      3:  ["Draconic Gift (Draconic language; Thaumaturgy cantrip)", "Drake Companion (summon CR 0 drake; scales with level; bond action to command; shares proficiency bonus)"],
      5:  ["Drake Companion (CR ¼ → gains Infused Strikes: attacks count as magical)"],
      7:  ["Bond of Fang and Scale (ride drake; drake gains resistance matching its damage type; your spells can originate from drake)"],
      11: ["Drake's Breath (Action or Drake's action: 30-ft cone breath weapon, Dex save, 8d6 dmg of drake's type; WIS mod/Long Rest)"],
      15: ["Perfected Bond (drake size Huge; once per turn: extra 1d6 on hit; Reaction when you take dmg: drake retaliates on attacker)"],
    },
  },
  // ── ROGUE ──────────────────────────────────────────────────────────────────
  Rogue: {
    "Arcane Trickster": {
      3:  ["Spellcasting (INT, Wizard spells)", "Mage Hand Legerdemain (Mage Hand: invisible, extra manipulate actions, Sleight of Hand vs Perception)"],
      9:  ["Magical Ambush (if hidden when casting: target has disadv. on save)"],
      13: ["Versatile Trickster (Bonus Action: Mage Hand distracts target: Adv. on next attack)"],
      17: ["Spell Thief (Reaction after creature casts on you: attempt to steal the spell; INT save; cast it once in 8 hrs; they can't until then)"],
    },
    "Assassin": {
      3:  ["Assassinate (Adv. when creature hasn't taken a turn; auto-crit on surprised creatures)", "Bonus Proficiencies (Disguise Kit, Poisoner's Kit)"],
      9:  ["Infiltration Expertise (1 week + 25 gp: perfect false identity)"],
      13: ["Impostor (unerring mimicry of voice/writing after 3 hr study)"],
      17: ["Death Strike (doubled dmg on Assassinate crit, CON save to negate the doubling)"],
    },
    "Inquisitive": {
      3:  ["Ear for Deceit (min 8 on Insight checks)", "Eye for Detail (Bonus Action: Perception or Investigation)", "Insightful Fighting (Bonus Action: Insight vs Deception; Sneak Attack without ally if success, 1 min)"],
      9:  ["Steady Eye (Adv. on Perception/Investigation if you didn't move this turn)"],
      13: ["Unerring Eye (Action: sense illusions/disguises within 30 ft, WIS mod/Long Rest)"],
      17: ["Eye for Weakness (while Insightful Fighting: +3d6 to Sneak Attack against that target)"],
    },
    "Mastermind": {
      3:  ["Master of Intrigue (Disguise Kit, Forgery Kit, Gaming Set proficiency; 2 languages)", "Master of Tactics (Help as Bonus Action from up to 30 ft away)"],
      9:  ["Insightful Manipulator (1 min study: learn 2 of Proficiencies/CHA score/INT score/levels compared to yours)"],
      13: ["Misdirection (Reaction: redirect spell/attack to adjacent creature who has been giving you cover)"],
      17: ["Soul of Deceit (thoughts always appear benign to magic; lie to detect thoughts)"],
    },
    "Phantom": {
      3:  ["Whispers of the Dead (Short Rest: gain proficiency in one skill or tool)", "Wails from the Grave (after Sneak Attack: deal ½ Sneak Attack dice necrotic to second creature)"],
      9:  ["Tokens of the Departed (when creature dies within 30 ft: soul trinket; use for advantage on death saves or one Wails from the Grave; up to PB trinkets)"],
      13: ["Ghost Walk (Bonus Action: ghostly form — move through creatures/objects, resistance to all dmg, disadv. on attacks; 10 min, 1/Long Rest or soul trinket)"],
      17: ["Death's Friend (soul trinket gives extra Sneak Attack die on one attack; Wails from the Grave for free if no trinkets)"],
    },
    "Scout": {
      3:  ["Skirmisher (Reaction when creature ends turn within 5 ft: move ½ speed without opp. attacks)", "Survivalist (Proficiency + Expertise in Nature and Survival)"],
      9:  ["Superior Mobility (+10 ft speed; climb and swim speed equal walking speed)"],
      13: ["Ambush Master (initiative advantage; first creature you hit = allies have Adv. on attacks against it until your next turn)"],
      17: ["Sudden Strike (Extra attack on attack action; second attack can Sneak Attack too, but only 1 Sneak Attack per turn)"],
    },
    "Soulknife": {
      3:  ["Psionic Power (Psionic Energy dice = 2×PB, d6)", "Psychic Blades (manifest two psychic blades: 1d6+DEX/STR psychic finesse thrown weapons; bonus action second blade for 1d4+mod)"],
      9:  ["Soul Blades (Homing Strikes: spend die to add to missed attack; Psychic Teleportation: Bonus Action + die → teleport = roll × 10 ft)"],
      13: ["Psychic Veil (Invisibility for 1 hr, 1/Long Rest or Psionic die)"],
      17: ["Rend Mind (Stun creature on Psychic Blades hit, WIS save; 1/Long Rest or 3 Psionic dice)"],
    },
    "Swashbuckler": {
      3:  ["Fancy Footwork (after attacking creature: no opp. attacks from it that turn)", "Rakish Audacity (initiative +CHA mod; Sneak Attack in 1v1 without ally)"],
      9:  ["Panache (1 min: Persuasion contest — hostile Frightened if lost; friendly Charmed)"],
      13: ["Elegant Maneuver (Bonus Action: Adv. on next Acrobatics or Athletics check)"],
      17: ["Master Duelist (once per Short Rest: if you miss — reroll with Adv.)"],
    },
    "Thief": {
      3:  ["Fast Hands (Cunning Action: Sleight of Hand, Thieves' Tools, Use Object)", "Second-Story Work (climb at full speed; running jump += DEX mod)"],
      9:  ["Supreme Sneak (Adv. on Stealth if you move ≤ ½ speed)"],
      13: ["Use Magic Device (ignore class/race/level requirements on magic items)"],
      17: ["Thief's Reflexes (take two turns on first round; second at initiative −10)"],
    },
  },
  // ── SORCERER ───────────────────────────────────────────────────────────────
  Sorcerer: {
    "Draconic Bloodline": {
      1:  ["Draconic Resilience (HP +1/level; AC 13+DEX unarmoured)"],
      3:  ["Draconic Sorcery (add one Draconic spell to spells known)"],
      6:  ["Elemental Affinity (add CHA mod to dmg of chosen type; spend 1 Sorcery Point for resistance to that type 1 hr)"],
      9:  ["Draconic Sorcery II"],
      14: ["Dragon Wings (Bonus Action: sprout wings with fly speed = walking speed)"],
      18: ["Draconic Presence (Awe or Fear aura 60 ft, WIS save, 1 min; 5 Sorcery Points, 1/Long Rest)"],
    },
    "Wild Magic": {
      1:  ["Wild Magic Surge (DM may call d20 roll after low-level spells; 1 = Wild Magic table)", "Tides of Chaos (gain Adv. on attack/check/save; DM can trigger Wild Surge to reset)"],
      6:  ["Bend Luck (Reaction: add/subtract 1d4 to/from any roll; 2 Sorcery Points)"],
      14: ["Controlled Chaos (roll twice on Wild Magic table, choose result)"],
      18: ["Spell Bombardment (once per turn: when you roll max on a dmg die — add another die of same type)"],
    },
    "Divine Soul": {
      1:  ["Divine Magic (choose affinity: good/evil/law/chaos/neutrality; add spells from Cleric list)", "Favored by the Gods (if you fail a save or miss an attack: add 2d4; 1/Short Rest)"],
      6:  ["Empowered Healing (once per turn: reroll healing dice for 1 Sorcery Point)"],
      14: ["Angelic Form (Bonus Action: grow spectral wings, fly speed = walking speed; shining eyes giving blindsight 10 ft)"],
      18: ["Unearthly Recovery (Bonus Action at ≤ ½ HP: regain ½ max HP; 1/Long Rest)"],
    },
    "Shadow Magic": {
      1:  ["Eyes of the Dark (Darkness for 2 Sorcery Points; see through Darkness spell)", "Strength of the Grave (when reduced to 0: CHA save vs ½ killing blow dmg to stay at 1 HP; not radiant; 1/Long Rest)"],
      6:  ["Hound of Ill Omen (2 Sorcery Points: summon shadow hound — moves to target, disadvantage on saves vs your spells while adjacent; lasts ½ level rounds)"],
      14: ["Shadow Walk (Bonus Action in dim light/dark: teleport 120 ft to dim light/dark)"],
      18: ["Umbral Form (6 Sorcery Points: become shadow for 1 min; resistance all non-force/radiant; move through objects/creatures)"],
    },
    "Storm Sorcery": {
      1:  ["Wind Speaker (Primordial language)", "Tempestuous Magic (Bonus Action before/after casting ≥1st level: fly 10 ft without opp. attacks)"],
      6:  ["Heart of the Storm (resistance to lightning/thunder; lightning/thunder spell dmg pulse = ½ spell level to nearby creatures)", "Storm Guide (stop rain in 20-ft radius; control wind direction)"],
      14: ["Storm's Fury (Reaction when hit: deal lightning = Sorcerer level + push 20 ft STR save)"],
      18: ["Wind Soul (immunity to lightning/thunder; fly speed 60 ft; share 30 ft fly for 1 hr with group for 5 Sorcery Points)"],
    },
    "Aberrant Mind": {
      1:  ["Psionic Spells (Telepathy, Detect Thoughts + 2 divination/enchantment spells added)", "Telepathic Speech (speak telepathically with one creature for INT mod min)"],
      3:  ["Psionic Sorcery (cast Psionic Spells for 1 less Sorcery Point; no V/S components)"],
      6:  ["Psychic Defenses (resistance to psychic; Adv. on Charmed/Frightened saves)"],
      14: ["Revelation in Flesh (1+ Sorcery Points: gain one or more: see invisible 60 ft; swim speed + breathe water; fly speed; move through objects as difficult terrain)"],
      18: ["Warping Implosion (Action: teleport 120 ft; creatures within 30 ft of original space take 3d10 force + pulled toward space STR save; 1/Long Rest or 5 Sorcery Points)"],
    },
    "Clockwork Soul": {
      1:  ["Clockwork Magic (Alarm, Protection from Evil and Good + 2 abjuration/transmutation spells added)", "Restore Balance (Reaction: cancel Adv. or disadv. on a roll within 60 ft; PB/Long Rest)"],
      3:  ["Bastion of Law (1–5 Sorcery Points: give creature d8 per point as dmg shield until Short/Long Rest)"],
      6:  ["Trance of Order (Bonus Action: min 10 on attack rolls and saves for 1 min; 1/Long Rest or 5 Sorcery Points)"],
      14: ["Clockwork Cavalcade (Action: 30-ft cube — repair 4d8+4 HP to each creature; end ongoing spells; repair one damaged magic item; 1/Long Rest or 7 Sorcery Points)"],
    },
  },
  // ── WARLOCK ────────────────────────────────────────────────────────────────
  Warlock: {
    "Archfey": {
      1:  ["Fey Presence (Action: Charm or Frighten creatures in 10-ft cube, WIS save; 1/Short Rest)"],
      6:  ["Misty Escape (Reaction when taking dmg: teleport 60 ft + become invisible until next turn; 1/Short Rest)"],
      10: ["Beguiling Defenses (immune to Charmed; Reaction when target tries to Charm: turn effect back on caster 1 min, WIS save)"],
      14: ["Dark Delirium (Action: one creature in 60 ft hallucinates for 1 min, WIS save; incapacitated/speed 0; repeat save each turn; 1/Short Rest)"],
    },
    "Fiend": {
      1:  ["Dark One's Blessing (when you kill a creature: Temp HP = CHA mod + Warlock level)", "Expanded Spells: Burning Hands, Command"],
      3:  ["Expanded Spells: Blindness/Deafness, Scorching Ray"],
      5:  ["Dark One's Own Luck (add d10 to ability check or save; 1/Short Rest)", "Expanded Spells: Fireball, Stinking Cloud"],
      7:  ["Expanded Spells: Fire Shield, Wall of Fire"],
      9:  ["Expanded Spells: Flame Strike, Hallow"],
      10: ["Fiendish Resilience (choose dmg type after Short/Long Rest: resistance to it)"],
      14: ["Hurl Through Hell (when you hit: banish to hell; 10d10 psychic on return; 1/Long Rest)"],
    },
    "Great Old One": {
      1:  ["Awakened Mind (telepathically speak with any creature that has a language within 30 ft)", "Expanded Spells: Dissonant Whispers, Tasha's Hideous Laughter"],
      3:  ["Expanded Spells: Detect Thoughts, Phantasmal Force"],
      5:  ["Expanded Spells: Clairvoyance, Sending"],
      6:  ["Entropic Ward (Reaction when targeted: impose disadv. on attack; on miss: Adv. on your next attack; 1/Short Rest)"],
      7:  ["Expanded Spells: Dominate Beast, Evard's Black Tentacles"],
      9:  ["Expanded Spells: Dominate Person, Telekinesis"],
      10: ["Thought Shield (resistance to psychic; telepathic damage also damages attacker)"],
      14: ["Create Thrall (touch incapacitated humanoid: Charmed, telepathic link, no concentration)"],
    },
    "Celestial": {
      1:  ["Bonus Cantrips (Light, Sacred Flame)", "Healing Light (pool = 1 + Warlock level d6s; Bonus Action: heal creature 60 ft for up to 5d6)"],
      3:  ["Radiant Soul (resistance to radiant/fire; add CHA mod to radiant/fire spell dmg 1 die)", "Expanded Spells: Cure Wounds, Guiding Bolt"],
      5:  ["Expanded Spells: Flaming Sphere, Lesser Restoration"],
      6:  ["Expanded Spells: Daylight, Revivify"],
      7:  ["Expanded Spells: Guardian of Faith, Wall of Fire"],
      9:  ["Expanded Spells: Flame Strike, Greater Restoration"],
      10: ["Celestial Resilience (Temp HP = Warlock level + CHA mod on short/long rest; 5 nearby creatures too)"],
      14: ["Searing Vengeance (when you or nearby ally would fail death save: return to 1 HP, deal radiant = 2d8+CHA mod, Blinded; 1/Long Rest)"],
    },
    "Hexblade": {
      1:  ["Hexblade's Curse (Bonus Action: curse creature 1 min; crit on 19+; regain HP on kill = Warlock level + CHA mod; 1/Short Rest)", "Hex Warrior (medium armour/shield/martial weapons prof.; one weapon uses CHA for attacks)"],
      3:  ["Expanded Spells: Shield, Wrathful Smite"],
      5:  ["Accursed Specter (when you kill humanoid: animate their specter, Int/Wis/Cha 10, PB bonus; 1/Long Rest)", "Expanded Spells: Blur, Branding Smite"],
      6:  ["Expanded Spells: Blink, Elemental Weapon"],
      7:  ["Expanded Spells: Phantasmal Killer, Staggering Smite"],
      9:  ["Expanded Spells: Banishing Smite, Cone of Cold"],
      10: ["Armor of Hexes (if Hexblade's Curse target attacks you: roll d6 — on 4+, miss automatically)"],
      14: ["Master of Hexes (teleport Hexblade's Curse to new creature without using action when old target drops to 0)"],
    },
    "Fathomless": {
      1:  ["Tentacle of the Deeps (Bonus Action: 10-ft tentacle — 1d8 cold dmg + speed −10 ft, WIS mod/Short Rest)", "Gift of the Sea (swim speed 40 ft; breathe underwater)"],
      3:  ["Expanded Spells: Create or Destroy Water, Thunderwave"],
      5:  ["Oceanic Soul (resistance to cold; speak with water-breathing creatures)", "Expanded Spells: Gust of Wind, Silence"],
      6:  ["Guardian Coil (Reaction: tentacle reduces dmg to you or adjacent ally by 1d8)", "Expanded Spells: Lightning Bolt, Sleet Storm"],
      7:  ["Expanded Spells: Control Water, Summon Elemental (water)"],
      9:  ["Expanded Spells: Cone of Cold, Telekinesis"],
      10: ["Grasping Tentacles (cast Evard's Black Tentacles; 1/Long Rest free; you gain Temp HP = Warlock level; concentration can't be broken by dmg on that spell)"],
      14: ["Fathomless Plunge (Action: teleport yourself + up to 5 creatures up to 1 mile to unoccupied underwater/seaside space; 1/Short Rest)"],
    },
    "Genie": {
      1:  ["Genie's Vessel (magic lamp/urn/ring/bottle; Bottled Respite: enter vessel for INT mod hours 1/Long Rest; vessel has HP, AC)", "Genie's Wrath (once/turn: extra dmg type on hit = PB; type = genie type)"],
      3:  ["Expanded Spells (vary by genie type: Dao/Djinni/Efreeti/Marid)"],
      6:  ["Elemental Gift (resistance matching genie type; Bonus Action: fly speed 30 ft for 10 min; PB/Long Rest)"],
      10: ["Sanctuary Vessel (creatures invited into vessel gain Short Rest benefits; optional healing)"],
      14: ["Limited Wish (6th-level or lower spell from any class; 1d4 Long Rests before reuse)"],
    },
    "Undying": {
      1:  ["Among the Dead (Spare the Dying cantrip; undead must save to target you; Adv. on saves vs disease)", "Expanded Spells: False Life, Ray of Sickness"],
      3:  ["Expanded Spells: Blindness/Deafness, Silence"],
      5:  ["Defy Death (stabilize at 0 HP using death save success; regain 1d8+CON mod HP; 1/Long Rest)", "Expanded Spells: Feign Death, Speak with Dead"],
      6:  ["Indestructible Life (Bonus Action: regain 1d8 + Warlock level HP, 1/Short Rest)"],
      7:  ["Expanded Spells: Aura of Life, Death Ward"],
      9:  ["Expanded Spells: Contagion, Legend Lore"],
      10: ["Undying Nature (no need to breathe; age at 1/10 rate; immune to aging magic; don't need food/water)"],
      14: ["Indestructible Life (also end one Blinded/Deafened/Paralyzed/Poisoned condition on yourself)"],
    },
  },
  // ── WIZARD ─────────────────────────────────────────────────────────────────
  Wizard: {
    "School of Abjuration": {
      3:  ["Abjuration Savant (half gold/time to copy abjuration spells)", "Arcane Ward (cast abjuration: protective ward HP = 2×wizard level+INT; absorbs dmg; recreate by casting abjuration ≥1st)"],
      6:  ["Projected Ward (Reaction: ward absorbs hit to nearby ally)"],
      10: ["Improved Abjuration (+PB to Counterspell/Dispel Magic checks)"],
      14: ["Spell Resistance (Adv. on saves vs spells; resistance to spell dmg)"],
    },
    "School of Conjuration": {
      3:  ["Conjuration Savant (half gold/time to copy conjuration spells)", "Minor Conjuration (Action: conjure object in 10 ft; 1 ft³; 10 lb; lasts 1 hr or until used; not precious materials)"],
      6:  ["Benign Transposition (Teleport 30 ft to unoccupied space or swap with willing creature; 1/Long Rest or conjuration spell cast)"],
      10: ["Focused Conjuration (concentration can't be broken by dmg while conjuring)"],
      14: ["Durable Summons (summoned/conjured creatures +30 Temp HP)"],
    },
    "School of Divination": {
      3:  ["Divination Savant (half gold/time to copy divination spells)", "Portent (roll 2 d20 after Long Rest; replace any roll with a Portent die before result)"],
      6:  ["Expert Divination (casting divination spell of 2nd+: regain lower-level spell slot)"],
      10: ["The Third Eye (Action: darkvision 60 ft; see ethereal 60 ft; read any language; or see invisible — lasts until Long Rest)"],
      14: ["Greater Portent (3 Portent dice instead of 2)"],
    },
    "School of Enchantment": {
      3:  ["Enchantment Savant (half gold/time to copy enchantment spells)", "Hypnotic Gaze (Action: Incapacitate adjacent creature; repeat CHA save each turn; 1/Long Rest)"],
      6:  ["Instinctive Charm (Reaction when targeted by attack: redirect to nearest creature, WIS save; 1/Long Rest)"],
      10: ["Split Enchantment (enchantment spell with 1 target: also affect a second creature)"],
      14: ["Alter Memories (remove memory of enchantment; CHA check to extend amnesia by hours = CHA mod)"],
    },
    "School of Evocation": {
      3:  ["Evocation Savant (half gold/time to copy evocation spells)", "Sculpt Spells (choose level+1 creatures to auto-succeed on save vs your evocation spells; no dmg on success)"],
      6:  ["Potent Cantrip (creatures that succeed save vs cantrip still take half dmg)"],
      10: ["Empowered Evocation (+INT mod to any evocation spell dmg roll)"],
      14: ["Overchannel (max dmg on 1st–5th level spells; subsequent uses in a day deal 2d12 necrotic per spell level)"],
    },
    "School of Illusion": {
      3:  ["Illusion Savant (half gold/time to copy illusion spells)", "Improved Minor Illusion (Minor Illusion cantrip with both sound+image simultaneously)"],
      6:  ["Malleable Illusions (Action: change nature of existing illusion spell you cast)"],
      10: ["Illusory Self (Reaction when attacked: create illusory duplicate; attacker hits duplicate instead; 1/Short Rest)"],
      14: ["Illusory Reality (after casting 1st+ illusion: Action to make one nonliving element real for 1 min)"],
    },
    "School of Necromancy": {
      3:  ["Grim Harvest (when you kill with a spell: regain HP = 2× spell level, or 3× for necromancy)", "Necromancy Savant (half gold/time to copy necromancy spells)"],
      6:  ["Undead Thralls (Animate Dead animates one extra; HP +wizard level; dmg +PB)"],
      10: ["Inured to Undeath (resistance to necrotic; max HP can't be reduced)"],
      14: ["Command Undead (Charisma check to take control of undead; INT 8+ gets WIS save)"],
    },
    "School of Transmutation": {
      3:  ["Transmutation Savant (half gold/time to copy transmutation spells)", "Minor Alchemy (transform one material of Small+ object to another; lasts 1 hr)"],
      6:  ["Transmuter's Stone (create stone with one benefit: darkvision; extra speed +10; proficiency in CON saves; resistance to acid/cold/fire/lightning/thunder)"],
      10: ["Shapechanger (Polymorph at will on self only without slot; can't concentrate on other spells)"],
      14: ["Master Transmuter (Action: destroy stone to: transmute matter; remove curses/diseases/poisons; cast Raise Dead; reduce age by 3d10 years)"],
    },
    "Bladesinging": {
      3:  ["Training in War and Song (light armour, one-handed weapon, Performance proficiency)", "Bladesong (Bonus Action: 1 min — +INT mod to AC; walking speed +10; Adv. on Acrobatics; INT mod to concentration saves; CHA mod+INT mod/Long Rest)"],
      6:  ["Extra Attack (2 attacks; replace one with a cantrip)"],
      10: ["Song of Defense (Reaction while Bladesong: expend spell slot to reduce dmg by 5× slot level)"],
      14: ["Song of Victory (add INT mod to weapon dmg while Bladesong)"],
    },
    "Order of Scribes": {
      3:  ["Awakened Spellbook (spellbook gains INT 10; ritual casting without prep; swap dmg types on spells for free)", "Wizardly Quill (free ink quill; copy spells in 2 min/level; quill erases its own writing)"],
      6:  ["Manifest Mind (Action: spellbook manifests spectral mind anywhere in 300 ft; cast through it; lasts 10 min; PB/Long Rest)"],
      10: ["Master Scrivener (after Long Rest: transcribe spell into scroll for free; lasts until next Long Rest)"],
      14: ["One with the Word (while Manifest Mind: take dmg → expunge spell from book to negate all dmg; expunged spell returns after 1d6 Long Rests; 1/Long Rest)"],
    },
    "War Magic": {
      3:  ["Arcane Deflection (Reaction when hit or fail save: +2 AC or +4 save; can only cast cantrips next turn)", "Tactical Wit (+INT mod to initiative)"],
      6:  ["Power Surge (store energy when you counterspell/dispel; add stored surge to a spell for +die dmg once)"],
      10: ["Durable Magic (+2 AC and saves while concentrating on a spell)"],
      14: ["Deflecting Shroud (Arcane Deflection: release energy at up to 3 creatures; 2d6 force each)"],
    },
    "Chronurgy Magic": {
      3:  ["Chronal Shift (when creature rolls d20 within 30 ft: Reaction to reroll; must use second roll; 2/Long Rest)", "Temporal Awareness (+INT mod to initiative)"],
      6:  ["Momentary Stasis (Action: Restrain/Incapacitate Large or smaller creature, CON save; can spend higher slot for more targets; 1/Short Rest)"],
      10: ["Arcane Abeyance (cast 4th-level or lower spell into mote; ally can release it; lasts 1 hr; 1/Short Rest)"],
      14: ["Convergent Future (roll any creature's d20 within 60 ft; choose result 1–20; gain exhaustion per use until Long Rest)"],
    },
    "Graviturgy Magic": {
      3:  ["Adjust Density (Action: halve or double weight of creature; Tiny+: halve=fly speed, double=speed −10 ft; Large−: halve=speed+10, double=speed−10; 1 min; INT mod/Long Rest)", "Gravity Well (when you cast spell on creature: move it 5 ft in any direction)"],
      6:  ["Violent Attraction (Reaction when creature within 60 ft takes dmg: add 1d10 of same type; or weapon attack hit: +1d10; INT mod/Long Rest)"],
      10: ["Event Horizon (Action: 30-ft gravity aura 1 min; creatures entering/starting there STR save or 2d10 force + 0 speed; INTmod/Long Rest)"],
      14: ["Gravity Fissure (Action: 100-ft line 5 ft wide — INT save 8d8 force; creatures adjacent to line STR save or pulled in and take dmg; 1/Long Rest)"],
    },
  },
};

// ─── SPELL LIMITS BY CLASS (2024 PHB) ────────────────────────────────────────
// "known"  → fixed list; chars know exactly this many spells (not incl. cantrips)
// "prepare"→ prepare from full list each day; limit = mod + level (or similar)
// "book"   → Wizard: learns 6+2/level spells (always prepared from INT mod+level)
const SPELL_LIMITS = {
  // Known casters: fixed spells known per level
  Bard:     { type:"known",   cantrips:[2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
              known:[4,5,6,7,8,9,10,11,12,14,15,15,16,18,19,19,20,22,22,22] },
  Ranger:   { type:"known",   cantrips:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
              known:[2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15] },
  Sorcerer: { type:"known",   cantrips:[4,4,4,5,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
              known:[2,4,6,7,8,9,10,11,12,12,13,13,14,14,15,15,16,16,16,16] },
  Warlock:  { type:"known",   cantrips:[2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
              known:[2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,14,15] },
  // Prepare casters: prepare mod+level spells from full list
  Cleric:   { type:"prepare", castingMod:"WIS" },
  Druid:    { type:"prepare", castingMod:"WIS" },
  Paladin:  { type:"prepare", castingMod:"CHA", halfCaster:true },
  // Book casters: spellbook, prepare INT mod+level
  Wizard:   { type:"book",    castingMod:"INT",
              cantrips:[3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5] },
};
const SPECIES_DATA = {
  Human: {
    speed: 30,
    size: "Medium",
    abilityBonuses: {},  // 2024 PHB: Humans use flexible ASI (handled separately)
    traits: [
      { name:"Resourceful", desc:"You gain Heroic Inspiration whenever you finish a Long Rest." },
      { name:"Skilful", desc:"You gain proficiency in one skill of your choice." },
      { name:"Versatile", desc:"You gain the Lucky feat, or another 1st-level feat of your choice." },
    ],
    skillBonus: 1, // 1 extra skill from Skilful
    languages: ["Common","One language of your choice"],
    darkvision: 0,
    resistances: [],
    extraNotes: "Flexible ability score improvement: +2 to one score, +1 to another (or +1 to three).",
  },
  Elf: {
    speed: 30,
    size: "Medium",
    abilityBonuses: {},
    traits: [
      { name:"Darkvision", desc:"60 ft. You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light." },
      { name:"Elven Lineage", desc:"Choose a lineage: Drow (Faerie Fire 1/day), High Elf (cantrip), or Wood Elf (Longstrider 1/day). Spells use Intelligence." },
      { name:"Fey Ancestry", desc:"You have advantage on saving throws you make to avoid or end the Charmed condition." },
      { name:"Keen Senses", desc:"You have proficiency in the Perception skill." },
      { name:"Trance", desc:"You don't need to sleep. When you finish a Long Rest, you can reduce the time to 4 hours of meditation (trancing)." },
    ],
    grantedSkills: ["Perception"],
    languages: ["Common","Elvish"],
    darkvision: 60,
    resistances: [],
    extraNotes: "Subtype (Drow / High Elf / Wood Elf) affects Elven Lineage trait.",
  },
  Dwarf: {
    speed: 30,
    size: "Medium",
    abilityBonuses: {},
    traits: [
      { name:"Darkvision", desc:"120 ft darkvision." },
      { name:"Dwarven Resilience", desc:"You have advantage on saving throws you make to avoid or end the Poisoned condition. You also have Resistance to Poison damage." },
      { name:"Dwarven Toughness", desc:"Your hit point maximum increases by 1, and it increases by 1 again whenever you gain a level." },
      { name:"Stonecunning", desc:"As a Bonus Action, you gain Tremorsense with a range of 60 feet for 10 minutes. You must be on a stone surface or touching a stone surface to use this trait. You can use this Bonus Action a number of times equal to your Proficiency Bonus, and you regain all uses when you finish a Long Rest." },
    ],
    languages: ["Common","Dwarvish"],
    darkvision: 120,
    resistances: ["Poison"],
    extraNotes: "Dwarven Toughness: +1 max HP per level.",
  },
  Halfling: {
    speed: 30,
    size: "Small",
    abilityBonuses: {},
    traits: [
      { name:"Brave", desc:"You have advantage on saving throws you make to avoid or end the Frightened condition." },
      { name:"Halfling Nimbleness", desc:"You can move through the space of any creature that is a size larger than yours, but you can't stop in the same space." },
      { name:"Luck", desc:"When you roll a 1 on the d20 for an attack roll, ability check, or saving throw, you can reroll the die and must use the new roll." },
      { name:"Naturally Stealthy", desc:"You can attempt to Hide even when you are obscured only by a creature that is at least one size larger than you." },
    ],
    languages: ["Common","Halfling"],
    darkvision: 0,
    resistances: [],
    extraNotes: "",
  },
  Gnome: {
    speed: 30,
    size: "Small",
    abilityBonuses: {},
    traits: [
      { name:"Darkvision", desc:"60 ft darkvision." },
      { name:"Gnomish Cunning", desc:"You have advantage on Intelligence, Wisdom, and Charisma saving throws." },
      { name:"Gnomish Lineage", desc:"Choose Forest Gnome (Minor Illusion cantrip, speak with small animals) or Rock Gnome (Mending cantrip, tinker proficiency, animate small clockwork)." },
    ],
    languages: ["Common","Gnomish"],
    darkvision: 60,
    resistances: [],
    extraNotes: "",
  },
  "Half-Elf": {
    speed: 30,
    size: "Medium",
    abilityBonuses: {},
    traits: [
      { name:"Darkvision", desc:"60 ft darkvision." },
      { name:"Fey Ancestry", desc:"Advantage on saves against Charmed." },
      { name:"Skill Versatility", desc:"You gain proficiency in two skills of your choice." },
    ],
    skillBonus: 2,
    languages: ["Common","Elvish","One additional language"],
    darkvision: 60,
    resistances: [],
    extraNotes: "Skill Versatility grants 2 extra skill proficiencies of your choice.",
  },
  "Half-Orc": {
    speed: 30,
    size: "Medium",
    abilityBonuses: {},
    traits: [
      { name:"Darkvision", desc:"60 ft darkvision." },
      { name:"Adrenaline Rush", desc:"You can take the Dash action as a Bonus Action. You can use this trait a number of times equal to your Proficiency Bonus, regaining expended uses when you finish a Short or Long Rest." },
      { name:"Relentless Endurance", desc:"When you are reduced to 0 HP but not killed outright, you can drop to 1 HP instead. Once you use this trait, you can't use it again until you finish a Long Rest." },
      { name:"Savage Attacks", desc:"When you score a critical hit with a melee weapon attack, you can roll one of the weapon's damage dice one additional time and add it to the extra damage of the critical hit." },
    ],
    languages: ["Common","Orc"],
    darkvision: 60,
    resistances: [],
    extraNotes: "",
  },
  Tiefling: {
    speed: 30,
    size: "Medium",
    abilityBonuses: {},
    traits: [
      { name:"Darkvision", desc:"60 ft darkvision." },
      { name:"Fiendish Legacy", desc:"Choose Abyssal (Poison Spray cantrip → Darkness/Blindness/Deafness), Chthonic (Chill Touch → False Life/Ray of Sickness), or Infernal (Fire Bolt → Hellish Rebuke/Darkness). Spells use Intelligence, Wisdom, or Charisma (your choice)." },
      { name:"Otherworldly Presence", desc:"You know the Thaumaturgy cantrip. Intelligence, Wisdom, or Charisma is your spellcasting ability for it (choose when you gain this trait)." },
    ],
    languages: ["Common","One language of your choice"],
    darkvision: 60,
    resistances: [],
    extraNotes: "Resistance depends on Fiendish Legacy choice (Poison / Necrotic / Fire).",
  },
  Dragonborn: {
    speed: 30,
    size: "Medium",
    abilityBonuses: {},
    traits: [
      { name:"Draconic Ancestry", desc:"Choose a dragon type which determines your Breath Weapon damage type and Damage Resistance." },
      { name:"Breath Weapon", desc:"As an action, you exhale destructive energy. The DC equals 8 + CON modifier + Proficiency Bonus. Scales with level: 2d6 at 1st, 3d6 at 5th, 4d6 at 11th, 5d6 at 17th." },
      { name:"Damage Resistance", desc:"Resistance to the damage type associated with your Draconic Ancestry." },
      { name:"Darkvision", desc:"60 ft darkvision." },
      { name:"Draconic Flight", desc:"At 5th level, you can use a Bonus Action to give yourself a Fly speed equal to your walking speed. You can use this trait a number of times equal to your Proficiency Bonus per Long Rest." },
    ],
    languages: ["Common","Draconic"],
    darkvision: 60,
    resistances: ["Chosen element (fire/cold/lightning/acid/poison/thunder/necrotic/radiant/psychic/force)"],
    extraNotes: "Resistance and Breath Weapon type match your chosen Draconic Ancestry.",
  },
  Aasimar: {
    speed: 30,
    size: "Medium",
    abilityBonuses: {},
    traits: [
      { name:"Darkvision", desc:"60 ft darkvision." },
      { name:"Celestial Resistance", desc:"You have Resistance to Necrotic and Radiant damage." },
      { name:"Healing Hands", desc:"As an action, you touch a creature and roll a number of d4s equal to your Proficiency Bonus. The creature regains hit points equal to the total. Once used, you can't use this again until a Long Rest." },
      { name:"Light Bearer", desc:"You know the Light cantrip." },
      { name:"Celestial Revelation", desc:"At 3rd level, choose Heavenly Wings (fly speed 30 ft, Radiant damage bonus), Inner Radiance (Radiant aura damage), or Necrotic Shroud (frighten enemies, Necrotic damage bonus)." },
    ],
    languages: ["Common","One language of your choice"],
    darkvision: 60,
    resistances: ["Necrotic","Radiant"],
    extraNotes: "",
  },
  Goliath: {
    speed: 35,
    size: "Medium",
    abilityBonuses: {},
    traits: [
      { name:"Giant Ancestry", desc:"Choose a giant type granting a special ability: Cloud (Misty Step), Fire (burn on hit), Frost (slow on hit), Hill (push on hit), Stone (temp HP), Storm (thunder burst)." },
      { name:"Large Form", desc:"At 1st level, you can change your size to Large as a Bonus Action. This lasts until you use a Bonus Action to revert, or until a Long Rest." },
      { name:"Powerful Build", desc:"You count as one size larger for carrying capacity and the weight you can push, drag, or lift." },
    ],
    languages: ["Common","Giant"],
    darkvision: 0,
    resistances: [],
    extraNotes: "Speed 35 ft.",
  },
  Tabaxi: {
    speed: 30,
    size: "Medium",
    abilityBonuses: {},
    traits: [
      { name:"Darkvision", desc:"60 ft darkvision." },
      { name:"Feline Agility", desc:"Your reflexes and agility allow you to move with a burst of speed. When you move on your turn in combat, you can double your speed until the end of the turn. Once you use this trait, you can't use it again until you move 0 feet on one of your turns." },
      { name:"Cat's Claws", desc:"Your claws can be used to make unarmed strikes. When you hit with them, the strike deals 1d6 + STR slashing damage, instead of the bludgeoning damage normal for an unarmed strike." },
      { name:"Cat's Talent", desc:"You have proficiency in the Perception and Stealth skills." },
    ],
    grantedSkills: ["Perception","Stealth"],
    languages: ["Common","One other language"],
    darkvision: 60,
    resistances: [],
    extraNotes: "",
  },
  Kenku: {
    speed: 30,
    size: "Medium",
    abilityBonuses: {},
    traits: [
      { name:"Expert Forgery", desc:"You can duplicate other creatures' handwriting and craftwork. You have advantage on checks made to produce forgeries or duplicates of existing objects." },
      { name:"Kenku Recall", desc:"You have proficiency in two skills of your choice. You can also always use your Proficiency Bonus for checks with these skills, even if you gain Expertise in them later." },
      { name:"Mimicry", desc:"You can mimic sounds you have heard, including voices. A creature that hears the sounds can tell they are imitations with a successful Insight check opposed by your Deception check." },
    ],
    skillBonus: 2,
    languages: ["Common and can understand Auran but speaks only through Mimicry"],
    darkvision: 0,
    resistances: [],
    extraNotes: "Kenku Recall grants 2 extra skill proficiencies of your choice.",
  },
  Lizardfolk: {
    speed: 30,
    size: "Medium",
    abilityBonuses: {},
    traits: [
      { name:"Bite", desc:"Your fanged maw is a natural weapon. You can use it to make an unarmed strike dealing 1d6 + STR piercing damage." },
      { name:"Cunning Artisan", desc:"As part of a Short Rest, you can harvest bone and hide from a slain beast, construct, dragon, monstrosity, or plant creature of size Small or larger to create one of the following: a shield, a club, a javelin, or 1d4 darts or blowgun needles." },
      { name:"Hold Breath", desc:"You can hold your breath for up to 15 minutes at a time." },
      { name:"Hungry Jaws", desc:"In battle, you can throw yourself into a feeding frenzy. As a bonus action, you can make a special attack with your Bite. On a hit, you gain temporary hit points equal to your CON modifier (minimum 1)." },
      { name:"Natural Armour", desc:"You have tough, scaly skin. When you aren't wearing armor, your AC is 13 + DEX modifier. You can use your natural armor to determine your AC if the armor you wear would leave you with a lower AC." },
      { name:"Lizardfolk Senses", desc:"You have proficiency in the Perception and Stealth skills." },
    ],
    grantedSkills: ["Perception","Stealth"],
    languages: ["Common","Draconic"],
    darkvision: 0,
    resistances: [],
    extraNotes: "Natural Armor: AC = 13 + DEX mod when unarmored.",
  },
  Tortle: {
    speed: 30,
    size: "Medium",
    abilityBonuses: {},
    traits: [
      { name:"Claws", desc:"You have claws that you can use to make unarmed strikes. When you hit with them, the strike deals 1d6 + STR slashing damage." },
      { name:"Hold Breath", desc:"You can hold your breath for up to 1 hour." },
      { name:"Natural Armour", desc:"Your shell provides a base AC of 17 (your natural armor). You can't use a shield while benefitting from it." },
      { name:"Shell Defense", desc:"You can withdraw into your shell as an action. Until you emerge (bonus action), you have a +4 bonus to AC and advantage on STR and CON saves, but you can't move and have disadvantage on DEX saves." },
      { name:"Survival Instinct", desc:"You gain proficiency in the Survival skill." },
    ],
    grantedSkills: ["Survival"],
    languages: ["Common","Aquan"],
    darkvision: 0,
    resistances: [],
    extraNotes: "Natural Armor gives AC 17 — no DEX bonus, no shield.",
  },
  Fairy: {
    speed: 30,
    size: "Small",
    abilityBonuses: {},
    traits: [
      { name:"Fairy Magic", desc:"You know the Druidcraft and Faerie Fire spells. You can cast Faerie Fire once per Long Rest. INT, WIS, or CHA is your spellcasting ability (choose once)." },
      { name:"Flight", desc:"You have a Fly speed of 30 feet. To use this speed, you can't be wearing medium or heavy armor." },
      { name:"Natural Illusionist", desc:"You know the Minor Illusion cantrip." },
    ],
    languages: ["Common","Sylvan"],
    darkvision: 0,
    resistances: [],
    extraNotes: "Fly speed 30 ft (not in medium/heavy armor).",
  },
  Harengon: {
    speed: 30,
    size: "Small/Medium",
    abilityBonuses: {},
    traits: [
      { name:"Hare-Trigger", desc:"You can add your Proficiency Bonus to your Initiative rolls." },
      { name:"Leporine Senses", desc:"You have proficiency in the Perception skill." },
      { name:"Lucky Footwork", desc:"When you fail a DEX saving throw, you can use your Reaction to roll a d4 and add it to the save, potentially turning the failure into a success." },
      { name:"Rabbit Hop", desc:"As a Bonus Action, you can jump a number of feet equal to five times your Proficiency Bonus, without provoking opportunity attacks. You can use this a number of times equal to your Proficiency Bonus per Long Rest." },
    ],
    grantedSkills: ["Perception"],
    languages: ["Common","One other language"],
    darkvision: 0,
    resistances: [],
    extraNotes: "+PB to Initiative rolls.",
  },
  Owlin: {
    speed: 30,
    size: "Small/Medium",
    abilityBonuses: {},
    traits: [
      { name:"Darkvision", desc:"120 ft darkvision." },
      { name:"Flight", desc:"You have a Fly speed equal to your walking speed. You can't use this fly speed if you're wearing medium or heavy armor." },
      { name:"Silent Feathers", desc:"You have proficiency in the Stealth skill." },
    ],
    grantedSkills: ["Stealth"],
    languages: ["Common","One other language"],
    darkvision: 120,
    resistances: [],
    extraNotes: "Fly speed = walking speed.",
  },
  Satyr: {
    speed: 35,
    size: "Medium",
    abilityBonuses: {},
    traits: [
      { name:"Ram", desc:"You can use your Ram to make unarmed strikes. When you hit with it, the strike deals 1d4 + STR bludgeoning damage." },
      { name:"Magic Resistance", desc:"You have advantage on saving throws against spells and other magical effects." },
      { name:"Mirthful Leaps", desc:"Whenever you make a long or high jump, you can roll a d8 and add the number rolled to the number of feet you cover, even when making a standing jump." },
      { name:"Reveler", desc:"You have proficiency in the Performance and Persuasion skills, and you have proficiency with one musical instrument of your choice." },
    ],
    grantedSkills: ["Performance","Persuasion"],
    languages: ["Common","Sylvan"],
    darkvision: 0,
    resistances: [],
    extraNotes: "Speed 35 ft. Advantage on saves vs. spells.",
  },
  Custom: {
    speed: 30,
    size: "Medium",
    abilityBonuses: {},
    traits: [
      { name:"Custom Species", desc:"Work with your DM to define traits for your custom species." },
    ],
    languages: ["Common","One other language"],
    darkvision: 0,
    resistances: [],
    extraNotes: "Manually enter traits in the Features section.",
  },
};

// ─── BACKGROUND DATA (2024 PHB) ───────────────────────────────────────────────
const BACKGROUND_DATA = {
  Acolyte:       { skills:["Insight","Religion"],       tools:[],                           feat:"Magic Initiate (Cleric)" },
  Charlatan:     { skills:["Deception","Sleight of Hand"], tools:["Forgery kit"],            feat:"Skilled" },
  Criminal:      { skills:["Deception","Stealth"],      tools:["Thieves' tools"],            feat:"Alert" },
  Entertainer:   { skills:["Acrobatics","Performance"], tools:["Disguise kit","One musical instrument"], feat:"Musician" },
  "Folk Hero":   { skills:["Animal Handling","Survival"], tools:["One type of artisan's tools","Vehicles (land)"], feat:"Crafter" },
  "Guild Artisan":{ skills:["Insight","Persuasion"],    tools:["One type of artisan's tools"], feat:"Crafter" },
  Hermit:        { skills:["Medicine","Religion"],      tools:["Herbalism kit"],             feat:"Magic Initiate (Druid)" },
  Noble:         { skills:["History","Persuasion"],     tools:["One type of gaming set"],    feat:"Skilled" },
  Outlander:     { skills:["Athletics","Survival"],     tools:["One type of musical instrument"], feat:"Tough" },
  Sage:          { skills:["Arcana","History"],         tools:[],                            feat:"Magic Initiate (Wizard)" },
  Sailor:        { skills:["Athletics","Perception"],   tools:["Navigator's tools","Vehicles (water)"], feat:"Tavern Brawler" },
  Soldier:       { skills:["Athletics","Intimidation"], tools:["One type of gaming set","Vehicles (land)"], feat:"Savage Attacker" },
  Urchin:        { skills:["Sleight of Hand","Stealth"], tools:["Disguise kit","Thieves' tools"], feat:"Lucky" },
  Gladiator:     { skills:["Athletics","Performance"],  tools:["One type of musical instrument"], feat:"Savage Attacker" },
  "Haunted One": { skills:["Arcana","Investigation"],   tools:[],                            feat:"Alert" },
  Knight:        { skills:["History","Persuasion"],     tools:["One type of gaming set"],    feat:"Skilled" },
  Pirate:        { skills:["Athletics","Perception"],   tools:["Navigator's tools","Vehicles (water)"], feat:"Tavern Brawler" },
  Spy:           { skills:["Deception","Stealth"],      tools:["Thieves' tools"],            feat:"Alert" },
};

// Helper: compute all granted skill proficiencies (non-choice) for current char
function getGrantedSkills(cls, species, background) {
  const set = new Set();
  // Species granted skills
  const sp = SPECIES_DATA[species];
  if (sp?.grantedSkills) sp.grantedSkills.forEach(s=>set.add(s));
  // Background skills
  const bg = BACKGROUND_DATA[background];
  if (bg?.skills) bg.skills.forEach(s=>set.add(s));
  return set;
}

// Helper: compute auto saving throw proficiencies from class
function getClassSavingThrows(cls) {
  return CLASS_DATA[cls]?.savingThrows || [];
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function CharacterSheet({ characters: initChars = [], onChange }) {
  const [characters,setCharacters] = useState(initChars);
  const [activeId,setActiveId] = useState(null);
  const [char,setChar] = useState(null);
  const [tab,setTab] = useState("stats");
  const [newItem,setNewItem] = useState({name:"",qty:1,weight:0});
  const [spellTab,setSpellTab] = useState(0);
  const [spellSearch,setSpellSearch] = useState("");
  const [selectedSpell,setSelectedSpell] = useState(null);
  const [showTraits,setShowTraits] = useState(false);
  const [featModal,setFeatModal] = useState(null);       // feat name being viewed
  const [eqSearch,setEqSearch] = useState("");           // equipment browser search
  const [eqFilter,setEqFilter] = useState("all");        // all|armor|weapon|gear
  const [eqCategory,setEqCategory] = useState("all");    // sub-category filter for gear
  const [showSuggestions,setShowSuggestions] = useState(false);
  const [printMode,setPrintMode] = useState(false);
  const [exporting,setExporting] = useState(false);
  const [rosterOpen,setRosterOpen] = useState(false);
  const [exportError,setExportError] = useState(null);

  // ── PDF EXPORT ────────────────────────────────────────────────────────────
  const handleExportPDF = async () => {
    if (!char) return;
    setExporting(true);
    setExportError(null);
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.esm.min.js");

      // ── Derived values ──────────────────────────────────────────────────────
      const ab     = char.abilities || {};
      const abMod  = s => Math.floor(((s||10)-10)/2);
      const fmtM   = m => m>=0?`+${m}`:`${m}`;
      const lvl    = char.level || 1;
      const PBval  = Math.ceil(lvl/4)+1;
      const classD = CLASS_DATA[char.class]||{};
      const classSaves = classD.savingThrows||[];
      const specD  = SPECIES_DATA[char.species]||{};
      const skills = char.skills||{};
      const equipped = (char.equipment||[]).filter(i=>i.equipped);
      const maxHP  = char.hpManual ? char.hp.max : Math.max(1, derivedMaxHP ?? char.hp.max);
      const acFinal = derivedAC ?? char.ac ?? 10;
      const passPerc = 10 + abMod(ab.WIS) + (skills.Perception?.proficient?PBval:0) + (skills.Perception?.expert?PBval*2:0);
      const speed  = char.speed || specD.speed || 30;
      const hitDie = classD.hitDie || "d8";

      // ── PDF setup ───────────────────────────────────────────────────────────
      const pdfDoc = await PDFDocument.create();
      const boldFont  = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const regFont   = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const W = 595, H = 842; // A4

      // ── Colour helpers ──────────────────────────────────────────────────────
      const RED    = rgb(0.55,0.1,0.1);
      const DARK   = rgb(0.08,0.04,0.01);
      const MID    = rgb(0.36,0.2,0.09);
      const LIGHT  = rgb(0.96,0.9,0.78);
      const GOLD   = rgb(0.78,0.58,0.16);
      const WHITE  = rgb(1,1,1);
      const BGPAGE = rgb(0.98,0.95,0.88);

      // ── Drawing helpers ─────────────────────────────────────────────────────
      const drawPage = () => {
        const page = pdfDoc.addPage([W,H]);
        page.drawRectangle({x:0,y:0,width:W,height:H,color:BGPAGE});
        return page;
      };
      const txt = (page,text,x,y,{size=9,font=regFont,color=DARK,maxWidth}={}) => {
        if (!text && text!=="0") return;
        let s = String(text);
        if (maxWidth && boldFont.widthOfTextAtSize(s,size)>maxWidth) {
          while (s.length>1 && regFont.widthOfTextAtSize(s+"…",size)>maxWidth) s=s.slice(0,-1);
          s+="…";
        }
        page.drawText(s,{x,y,size,font,color});
      };
      const box = (page,x,y,w,h,{fill=WHITE,stroke=MID,strokeWidth=0.5,radius=2}={}) => {
        page.drawRectangle({x,y,width:w,height:h,color:fill,borderColor:stroke,borderWidth:strokeWidth});
      };
      const line = (page,x1,y1,x2,y2,{color=MID,thickness=0.5}={}) => {
        page.drawLine({start:{x:x1,y:y1},end:{x:x2,y:y2},thickness,color});
      };
      const hdr = (page,label,x,y,w) => {
        page.drawRectangle({x,y,width:w,height:13,color:RED});
        txt(page,label,x+4,y+3,{size:7,font:boldFont,color:WHITE});
      };
      // Small labelled stat box
      const statBox = (page,label,value,x,y,bw=52,bh=32) => {
        box(page,x,y,bw,bh,{fill:WHITE,stroke:MID});
        txt(page,String(value??"-"),x+bw/2 - boldFont.widthOfTextAtSize(String(value??"-"),14)/2,y+bh-16,{size:14,font:boldFont,color:RED});
        txt(page,label,x+bw/2 - regFont.widthOfTextAtSize(label,6.5)/2,y+3,{size:6.5,color:MID});
      };
      // Ability score block (score + modifier bubble)
      const abilityBlock = (page,label,score,x,y) => {
        const m = abMod(score);
        box(page,x,y,44,56,{fill:WHITE,stroke:MID,strokeWidth:0.7});
        txt(page,label,x+22-boldFont.widthOfTextAtSize(label,7)/2,y+47,{size:7,font:boldFont,color:MID});
        txt(page,String(score),x+22-boldFont.widthOfTextAtSize(String(score),15)/2,y+27,{size:15,font:boldFont,color:DARK});
        // modifier circle
        page.drawCircle({x:x+22,y:y+11,size:9,color:RED});
        const ms=fmtM(m); txt(page,ms,x+22-boldFont.widthOfTextAtSize(ms,7)/2,y+8,{size:7,font:boldFont,color:WHITE});
      };
      // Proficiency dot + label + value row
      const skillRow = (page,label,value,proficient,expert,x,y,rowW=148) => {
        const dotColor = expert?RED:proficient?GOLD:rgb(0.8,0.75,0.65);
        page.drawCircle({x:x+5,y:y+3.5,size:3.5,color:dotColor});
        txt(page,label,x+12,y+1,{size:7.5});
        txt(page,value,x+rowW-18,y+1,{size:7.5,font:boldFont,color:RED});
      };

      // ════════════════════════════════════════════════════════════════════════
      // PAGE 1
      // ════════════════════════════════════════════════════════════════════════
      const p1 = drawPage();

      // ── Title bar ──────────────────────────────────────────────────────────
      p1.drawRectangle({x:0,y:H-38,width:W,height:38,color:RED});
      txt(p1,"D&D 2024 CHARACTER SHEET",W/2-boldFont.widthOfTextAtSize("D&D 2024 CHARACTER SHEET",13)/2,H-25,{size:13,font:boldFont,color:WHITE});

      // ── Header row ─────────────────────────────────────────────────────────
      const hdrY = H-70;
      [["Character Name", char.name||"", 20, 180],
       ["Class", `${char.class||"—"} ${char.subclass?`(${char.subclass})`:""}`, 210, 130],
       ["Level", String(lvl), 350, 40],
       ["Background", char.background||"—", 400, 90],
       ["Species", char.species||"—", 500, 75],
      ].forEach(([lbl,val,x,w])=>{
        box(p1,x,hdrY,w,22);
        txt(p1,lbl,x+2,hdrY+1,{size:5.5,color:MID});
        txt(p1,val,x+3,hdrY+9,{size:9,font:boldFont,maxWidth:w-6});
      });
      [["Alignment", char.alignment||"—", 20, 80],
       ["Player", char.playerName||"", 110, 100],
       ["XP", String(char.xp||0), 220, 60],
      ].forEach(([lbl,val,x,w])=>{
        box(p1,x,hdrY-26,w,22);
        txt(p1,lbl,x+2,hdrY-25,{size:5.5,color:MID});
        txt(p1,val,x+3,hdrY-17,{size:9,font:boldFont,maxWidth:w-6});
      });

      // ── Ability scores (left column) ────────────────────────────────────────
      const abY0 = H-175;
      ["STR","DEX","CON","INT","WIS","CHA"].forEach((k,i)=>{
        abilityBlock(p1, k, ab[k]||10, 20, abY0 - i*62);
      });

      // ── Core stats strip ────────────────────────────────────────────────────
      const coreY = H-145;
      [["Armour Class", String(acFinal), 76],
       ["Initiative", fmtM(abMod(ab.DEX)), 134],
       ["Speed", `${speed} ft`, 192],
       ["Proficiency Bonus", fmtM(PBval), 250],
       ["Passive Perception", String(passPerc), 308],
      ].forEach(([lbl,val,x])=>statBox(p1,lbl,val,x,coreY,52,38));

      // ── HP ──────────────────────────────────────────────────────────────────
      box(p1,76,coreY-46,228,40);
      txt(p1,"HIT POINTS",76+2,coreY-46+1,{size:5.5,color:MID,font:boldFont});
      txt(p1,`Max: ${maxHP}`,76+4,coreY-46+28,{size:9,font:boldFont,color:RED});
      txt(p1,`Current: ${char.hp.current??maxHP}`,76+80,coreY-46+28,{size:9,font:boldFont});
      txt(p1,`Temp: ${char.hp.temp||0}`,76+170,coreY-46+28,{size:9});
      txt(p1,`Hit Dice: ${lvl}${hitDie}  ·  Used: ${char.hitDice?.used||0}`,76+4,coreY-46+14,{size:8,color:MID});

      // Death saves
      box(p1,310,coreY-46,50,40);
      txt(p1,"DEATH SAVES",310+2,coreY-46+1,{size:5,color:MID,font:boldFont});
      ["Successes","Failures"].forEach((lbl,row)=>{
        txt(p1,lbl,312,coreY-46+29-row*14,{size:6});
        [0,1,2].forEach(i=>{
          const filled = (row===0?char.deathSaves?.successes:char.deathSaves?.failures)||0;
          p1.drawCircle({x:334+i*8,y:coreY-46+27-row*14,size:3,color:i<filled?RED:rgb(0.85,0.8,0.7)});
        });
      });

      // ── Saving throws ───────────────────────────────────────────────────────
      const saveX=76, saveY=coreY-100;
      hdr(p1,"SAVING THROWS",saveX,saveY+14*6+2,155);
      ["STR","DEX","CON","INT","WIS","CHA"].forEach((k,i)=>{
        const prof = classSaves.includes(k)||(char.savingThrows?.[k]||false);
        const val = abMod(ab[k]||10)+(prof?PBval:0);
        skillRow(p1,k,fmtM(val),prof,false,saveX,saveY+i*14,155);
      });

      // ── Skills ──────────────────────────────────────────────────────────────
      const skillList=[
        ["Acrobatics","DEX"],["Animal Handling","WIS"],["Arcana","INT"],
        ["Athletics","STR"],["Deception","CHA"],["History","INT"],
        ["Insight","WIS"],["Intimidation","CHA"],["Investigation","INT"],
        ["Medicine","WIS"],["Nature","INT"],["Perception","WIS"],
        ["Performance","CHA"],["Persuasion","CHA"],["Religion","INT"],
        ["Sleight of Hand","DEX"],["Stealth","DEX"],["Survival","WIS"],
      ];
      const skX=76, skY=saveY-16;
      hdr(p1,"SKILLS",skX,skY+skillList.length*13+2,155);
      skillList.forEach(([name,abl],i)=>{
        const sk=skills[name]||{};
        const val=abMod(ab[abl]||10)+(sk.expert?PBval*2:sk.proficient?PBval:0);
        skillRow(p1,`${name} (${abl})`,fmtM(val),sk.proficient||sk.expert,sk.expert,skX,skY+(skillList.length-1-i)*13,155);
      });

      // ── Weapons ─────────────────────────────────────────────────────────────
      const wepX=242, wepY=H-235;
      hdr(p1,"ATTACKS & WEAPONS",wepX,wepY,330);
      const weapons2=equipped.filter(i=>{const d=EQUIPMENT_DB[i.name]||EQUIPMENT_DB[i.baseName];return d?.type==="weapon";});
      const soloV=weapons2.length===1&&!equipped.some(i=>(EQUIPMENT_DB[i.name]||EQUIPMENT_DB[i.baseName])?.armorType==="shield");
      txt(p1,"Name",wepX+4,wepY-10,{size:7,color:MID,font:boldFont});
      txt(p1,"Atk Bonus",wepX+140,wepY-10,{size:7,color:MID,font:boldFont});
      txt(p1,"Damage / Type",wepX+195,wepY-10,{size:7,color:MID,font:boldFont});
      weapons2.slice(0,6).forEach((item,idx)=>{
        const d=EQUIPMENT_DB[item.name]||EQUIPMENT_DB[item.baseName];
        if(!d) return;
        const wy=wepY-22-idx*16;
        box(p1,wepX,wy,330,14,{fill:idx%2===0?WHITE:rgb(0.96,0.92,0.84)});
        const useDex=d.finesse?(abMod(ab.DEX)>=abMod(ab.STR)):d.weaponType==="ranged";
        const atk=fmtM((useDex?abMod(ab.DEX):abMod(ab.STR))+PBval);
        const dmg=(soloV&&d.versatileDmg)?d.versatileDmg:d.damage;
        txt(p1,item.name,wepX+4,wy+3,{size:8,font:boldFont,maxWidth:130});
        txt(p1,atk,wepX+155,wy+3,{size:9,font:boldFont,color:RED});
        txt(p1,`${dmg} ${d.damageType}`,wepX+195,wy+3,{size:8,maxWidth:130});
      });
      if(weapons2.length===0) txt(p1,"No weapons equipped",wepX+4,wepY-28,{size:8,color:MID});

      // ── Equipment ───────────────────────────────────────────────────────────
      const eqX=242, eqY=wepY-22-Math.max(1,weapons2.length)*16-20;
      hdr(p1,"EQUIPMENT",eqX,eqY,200);
      const eqText=(char.equipment||[]).map(i=>`${i.qty>1?i.qty+"× ":""}${i.name}`).join(", ");
      // wrap text
      const eqWords=eqText.split(", "); let eqLine=""; let eqLY=eqY-12;
      eqWords.forEach(w=>{
        const test=eqLine?eqLine+", "+w:w;
        if(regFont.widthOfTextAtSize(test,7.5)>194){txt(p1,eqLine,eqX+3,eqLY,{size:7.5});eqLine=w;eqLY-=11;}
        else eqLine=test;
      });
      if(eqLine) txt(p1,eqLine,eqX+3,eqLY,{size:7.5});

      // ── Coins ────────────────────────────────────────────────────────────────
      const coinX=448, coinY=wepY-22-Math.max(1,weapons2.length)*16-20;
      hdr(p1,"COINS",coinX,coinY,120);
      [["CP",char.cp||0],["SP",char.sp||0],["EP",char.ep||0],["GP",char.gp||0],["PP",char.pp||0]].forEach(([lbl,val],i)=>{
        box(p1,coinX,coinY-14-i*14,120,13);
        txt(p1,lbl,coinX+4,coinY-12-i*14,{size:7.5,color:MID});
        txt(p1,String(val),coinX+96,coinY-12-i*14,{size:8,font:boldFont});
      });

      // ── Proficiencies & Languages ────────────────────────────────────────────
      const profX=242, profY=Math.min(eqY-eqWords.length*4-70, coinY-100);
      hdr(p1,"PROFICIENCIES & LANGUAGES",profX,profY,330);
      const profLines=[
        classD.armor?.length?`Armour: ${classD.armor.join(", ")}`:"",
        classD.weapons?.length?`Weapons: ${classD.weapons.join(", ")}`:"",
        (char.toolProficiencies||[]).length?`Tools: ${(char.toolProficiencies||[]).join(", ")}`:"",
        specD.languages?.length?`Languages: ${specD.languages.join(", ")}`:"",
        (char.extraLanguages||[]).length?`Extra languages: ${(char.extraLanguages||[]).join(", ")}`:"",
        char.languages?`Notes: ${char.languages}`:"",
      ].filter(Boolean);
      profLines.forEach((l,i)=>txt(p1,l,profX+3,profY-13-i*11,{size:7.5,maxWidth:324}));

      // ── Features & Traits ────────────────────────────────────────────────────
      const ftX=242;
      const ftY=profY-profLines.length*11-22;
      hdr(p1,"FEATURES & TRAITS",ftX,ftY,330);
      const featsText=(char.feats||[]).map(f=>FEAT_DB[f]?`${f}: ${FEAT_DB[f].benefit}`:"").filter(Boolean).join(" | ");
      const specTraits=(specD.traits||[]).map(t=>typeof t==="object"?`${t.name}: ${t.desc}`:t).join(" | ");
      const ftContent=[featsText,specTraits,char.classFeatures||""].filter(Boolean).join("\n");
      // Simple wrap
      let ftWords=ftContent.replace(/\n/g," ● ").split(" "); let ftLine=""; let ftLY=ftY-12;
      ftWords.forEach(w=>{
        const test=ftLine?ftLine+" "+w:w;
        if(regFont.widthOfTextAtSize(test,7.5)>324){txt(p1,ftLine,ftX+3,ftLY,{size:7.5,maxWidth:324});ftLine=w;ftLY-=11;}
        else ftLine=test;
        if(ftLY<30){return;}
      });
      if(ftLine&&ftLY>30) txt(p1,ftLine,ftX+3,ftLY,{size:7.5,maxWidth:324});

      // ── Personality ──────────────────────────────────────────────────────────
      const perX=20, perY=skY-skillList.length*13-22;
      [["PERSONALITY TRAITS",char.traits||""],["IDEALS",char.ideals||""],["BONDS",char.bonds||""],["FLAWS",char.flaws||""]].forEach(([lbl,val],i)=>{
        const py=perY-i*42;
        hdr(p1,lbl,perX,py,215);
        box(p1,perX,py-30,215,30,{fill:WHITE});
        txt(p1,val||"",perX+3,py-10,{size:7.5,maxWidth:209});
      });

      // ── Page 1 footer ────────────────────────────────────────────────────────
      txt(p1,`Generated by DnD 2024 Character Sheet  ·  ${char.name||""}  ·  ${char.class||""} ${lvl}`,W/2-180,12,{size:7,color:MID});

      // ════════════════════════════════════════════════════════════════════════
      // PAGE 2 — Spells (only if caster)
      // ════════════════════════════════════════════════════════════════════════
      const cInfo=CLASS_SPELLS[char.class];
      if(cInfo&&(char.spells||[]).length>0){
        const p2=drawPage();
        p2.drawRectangle({x:0,y:H-38,width:W,height:38,color:RED});
        txt(p2,"SPELLCASTING",W/2-boldFont.widthOfTextAtSize("SPELLCASTING",13)/2,H-25,{size:13,font:boldFont,color:WHITE});
        txt(p2,`${char.name||""}  ·  ${char.class||""}  ·  Level ${lvl}`,W/2-120,H-36,{size:8,color:rgb(1,0.8,0.7)});

        // Spellcasting stats
        const castMod=abMod(ab[cInfo.casting]||10);
        const sCoreY=H-75;
        [["Spellcasting Ability",cInfo.casting,70],
         ["Spell Save DC",String(8+castMod+PBval),180],
         ["Spell Attack Bonus",fmtM(castMod+PBval),290],
         ["Max Spell Level",String(maxSpellLevel(char.class,lvl)||"—"),400],
        ].forEach(([lbl,val,x])=>statBox(p2,lbl,val,x,sCoreY,100,38));

        // Spell slots
        const sTable=cInfo.slots==="full"?FULL_SLOTS:cInfo.slots==="half"?HALF_SLOTS:cInfo.slots==="third"?THIRD_SLOTS:cInfo.slots==="pact"?PACT_SLOTS:null;
        if(sTable){
          const slotRow=sTable[lvl]||[];
          hdr(p2,"SPELL SLOTS",20,sCoreY-18,555);
          slotRow.forEach((total,i)=>{
            if(!total) return;
            statBox(p2,`Level ${i+1}`,String(total),20+i*62,sCoreY-60,58,36);
          });
        }

        // Spell list
        const spellsByLevel={};
        (char.spells||[]).forEach(sp=>{
          if(!spellsByLevel[sp.level]) spellsByLevel[sp.level]=[];
          spellsByLevel[sp.level].push(sp);
        });
        let spY=sCoreY-80;
        Object.keys(spellsByLevel).sort((a,b)=>+a-+b).forEach(lvlKey=>{
          if(spY<40) return;
          const lvlLabel=+lvlKey===0?"Cantrips":`Level ${lvlKey} Spells`;
          hdr(p2,lvlLabel,20,spY,555);
          spY-=14;
          // Column headers
          txt(p2,"Name",24,spY,{size:7,color:MID,font:boldFont});
          txt(p2,"School",180,spY,{size:7,color:MID,font:boldFont});
          txt(p2,"Cast Time",250,spY,{size:7,color:MID,font:boldFont});
          txt(p2,"Range",330,spY,{size:7,color:MID,font:boldFont});
          txt(p2,"Duration",400,spY,{size:7,color:MID,font:boldFont});
          txt(p2,"Prep",540,spY,{size:7,color:MID,font:boldFont});
          spY-=11;
          spellsByLevel[lvlKey].forEach((sp,idx)=>{
            if(spY<30) return;
            const sd=SPELL_DETAILS[sp.name]||{};
            const rowFill=idx%2===0?WHITE:rgb(0.96,0.92,0.84);
            box(p2,20,spY-2,555,13,{fill:rowFill,stroke:rgb(0.88,0.82,0.7),strokeWidth:0.3});
            txt(p2,sp.name,24,spY,{size:8,font:sp.prepared?boldFont:regFont,color:sp.prepared?RED:DARK,maxWidth:152});
            txt(p2,sd.school||"",180,spY,{size:7.5,maxWidth:65});
            txt(p2,sd.cast||"",250,spY,{size:7.5,maxWidth:75});
            txt(p2,sd.range||"",330,spY,{size:7.5,maxWidth:65});
            txt(p2,sd.duration||"",400,spY,{size:7.5,maxWidth:130});
            if(sp.prepared&&+lvlKey>0) txt(p2,"★",545,spY,{size:9,color:RED,font:boldFont});
            spY-=13;
          });
          spY-=6;
        });

        txt(p2,"★ = Prepared  ·  Bold name = Prepared spell",20,22,{size:7,color:MID});
        txt(p2,`Generated by DnD 2024 Character Sheet  ·  ${char.name||""}`,W-220,12,{size:7,color:MID});
      }

      // ── Download ─────────────────────────────────────────────────────────────
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], {type: "application/pdf"});
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${(char.name||"Character").replace(/\s+/g,"_")}_DnD2024.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch(err) {
      console.error("PDF export error:", err);
      setExportError(err.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 120);
  };
  const [arrayAssignments,setArrayAssignments] = useState({STR:null,DEX:null,CON:null,INT:null,WIS:null,CHA:null});
  const [arrayPickTarget,setArrayPickTarget] = useState(null); // which ability slot is being filled

  const saveToStorage = (chars) => { if(onChange) onChange(chars); };

  const saveChar = (c) => {
    if (!c) return;
    let updated;
    if (c.id) { updated = characters.map(x=>x.id===c.id?c:x); }
    else { const nc={...c,id:Date.now()}; updated=[...characters,nc]; setChar(nc); setActiveId(nc.id); }
    setCharacters(updated);
    saveToStorage(updated);
  };
  const loadChar = id => { const c=characters.find(x=>x.id===id); if(c){setChar(JSON.parse(JSON.stringify(c)));setActiveId(id);setTab("stats");} };
  const delChar = id => { const u=characters.filter(x=>x.id!==id); setCharacters(u); saveToStorage(u); if(activeId===id){setChar(null);setActiveId(null);} };
  const newC = () => { setChar(JSON.parse(JSON.stringify(defaultChar))); setActiveId(null); setTab("stats"); };

  // ── Smart class change: auto-apply saving throws, hit dice, speed, tools ──
  const handleClassChange = (cls) => {
    const cd = CLASS_DATA[cls] || {};
    const saves = cd.savingThrows || [];
    const newSaves = {STR:false,DEX:false,CON:false,INT:false,WIS:false,CHA:false};
    saves.forEach(s => { newSaves[s] = true; });
    const hitDieStr = cls ? `${char?.level||1}${cd.hitDie||"d8"}` : char?.hitDice?.total || "1d8";
    // Fixed class tools (non-choice ones)
    const fixedTools = (cd.tools||[]).filter(t => !t.startsWith("One") && !t.startsWith("Three") && !t.startsWith("two") && !t.startsWith("Any"));
    setChar(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.class = cls;
      next.subclass = "";
      next.classSkills = [];
      next.savingThrows = newSaves;
      next.hitDice = { ...next.hitDice, total: hitDieStr };
      // Merge fixed class tools in, remove old class tools
      const oldClassTools = (CLASS_DATA[prev.class]?.tools||[]).filter(t => !t.startsWith("One") && !t.startsWith("Three") && !t.startsWith("two") && !t.startsWith("Any"));
      const bgTools = (BACKGROUND_DATA[next.background]?.tools||[]).filter(t => !t.startsWith("One") && !t.startsWith("Three"));
      const existingExtra = (next.toolProficiencies||[]).filter(t => !oldClassTools.includes(t) && !bgTools.includes(t));
      next.toolProficiencies = [...new Set([...fixedTools, ...bgTools, ...existingExtra])];
      return next;
    });
  };

  // ── Smart background change: auto-apply fixed tools ───────────────────────
  const handleBackgroundChange = (bg) => {
    const bd = BACKGROUND_DATA[bg] || {};
    const fixedTools = (bd.tools||[]).filter(t => !t.startsWith("One") && !t.startsWith("Any"));
    setChar(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.background = bg;
      const oldBgTools = (BACKGROUND_DATA[prev.background]?.tools||[]).filter(t => !t.startsWith("One") && !t.startsWith("Any"));
      const classTools = (CLASS_DATA[next.class]?.tools||[]).filter(t => !t.startsWith("One") && !t.startsWith("Three") && !t.startsWith("two") && !t.startsWith("Any"));
      const existingExtra = (next.toolProficiencies||[]).filter(t => !oldBgTools.includes(t) && !classTools.includes(t));
      next.toolProficiencies = [...new Set([...classTools, ...fixedTools, ...existingExtra])];
      return next;
    });
  };

  // ── Smart species change ───────────────────────────────────────────────────
  const handleSpeciesChange = (sp) => {
    setChar(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.species = sp;
      next.speciesSkills = [];
      return next;
    });
  };

  // ── Level change: keep hit dice in sync ───────────────────────────────────
  const handleLevelChange = (lvl) => {
    const n = Math.max(1, Math.min(20, +lvl));
    setChar(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.level = n;
      const hitDie = CLASS_DATA[next.class]?.hitDie || "d8";
      next.hitDice = { ...next.hitDice, total: `${n}${hitDie}`, used: Math.min(next.hitDice?.used||0, n) };
      return next;
    });
  };

  const upd = (path, value) => {
    setChar(prev=>{
      const next=JSON.parse(JSON.stringify(prev));
      const keys=path.split(".");
      let obj=next;
      for(let i=0;i<keys.length-1;i++) obj=obj[keys[i]];
      obj[keys[keys.length-1]]=value;
      return next;
    });
  };

  // ── AUTO-CALC DERIVED VALUES ──────────────────────────────────────────────
  const PB = char ? pb(char.level) : 2;
  const aMod = ab => char ? mod(char.abilities[ab]) : 0;

  // Granted (non-choice) skills from species + background
  const grantedSkillSet = useMemo(() =>
    char ? getGrantedSkills(char.class, char.species, char.background) : new Set(),
    [char?.class, char?.species, char?.background]
  );

  // Class saving throw proficiencies (auto)
  const classSaveSet = useMemo(() =>
    new Set(char ? getClassSavingThrows(char.class) : []),
    [char?.class]
  );

  // Class skill config
  const classSkillConfig = useMemo(() => CLASS_DATA[char?.class] || null, [char?.class]);

  // Valid class skill choices (excluding already-granted skills)
  const classSkillPool = useMemo(() => {
    if (!classSkillConfig) return [];
    return classSkillConfig.skillChoices.filter(s => !grantedSkillSet.has(s));
  }, [classSkillConfig, grantedSkillSet]);

  // How many class skills still need to be chosen
  const classSkillsNeeded = useMemo(() => {
    if (!classSkillConfig) return 0;
    const chosen = (char?.classSkills||[]).length;
    return classSkillConfig.skillCount - chosen;
  }, [classSkillConfig, char?.classSkills]);

  // Extra skills from species (Half-Elf +2, Human +1, Kenku +2, etc.)
  const speciesSkillBonus = SPECIES_DATA[char?.species]?.skillBonus || 0;
  const speciesSkillsNeeded = speciesSkillBonus - (char?.speciesSkills||[]).length;

  // Full effective proficiency for a skill (granted OR class-chosen OR species-chosen OR manually toggled)
  const isSkillProficient = name => {
    if (!char) return false;
    if (grantedSkillSet.has(name)) return true;
    if ((char.classSkills||[]).includes(name)) return true;
    if ((char.speciesSkills||[]).includes(name)) return true;
    return char.skills[name]?.proficient || false;
  };
  const isSkillExpert = name => char?.skills[name]?.expert || false;

  const skBonus = name => {
    if (!char) return 0;
    const sk = char.skills[name];
    const b = aMod(sk.ability);
    if (isSkillExpert(name)) return b + PB * 2;
    if (isSkillProficient(name)) return b + PB;
    return b;
  };

  // Saving throw: auto from class, or manual override
  const isSaveProficient = ab => {
    if (!char) return false;
    if (classSaveSet.has(ab)) return true;
    return char.savingThrows[ab] || false;
  };
  const svBonus = ab => {
    if (!char) return 0;
    const b = aMod(ab);
    return isSaveProficient(ab) ? b + PB : b;
  };

  // Validation warnings
  const warnings = useMemo(() => {
    const w = [];
    if (!char) return w;
    if (char.class) {
      const cd = CLASS_DATA[char.class];
      if (cd) {
        const chosen = (char.classSkills||[]).length;
        if (chosen < cd.skillCount) w.push(`Choose ${cd.skillCount - chosen} more skill${cd.skillCount-chosen>1?"s":""} from your ${char.class} class options.`);
        if (chosen > cd.skillCount) w.push(`Too many class skills selected — ${char.class}s choose ${cd.skillCount}.`);
      }
    }
    if (speciesSkillsNeeded > 0 && speciesSkillBonus > 0) {
      w.push(`Choose ${speciesSkillsNeeded} more skill${speciesSkillsNeeded>1?"s":""} from your ${char.species} species bonus.`);
    }
    if (!char.class) w.push("No class selected.");
    if (!char.species) w.push("No species selected.");
    if (!char.background) w.push("No background selected.");
    return w;
  }, [char, speciesSkillsNeeded, speciesSkillBonus]);

  // ── EQUIPMENT DERIVED ──────────────────────────────────────────────────────
  // Depend on the full equipment array serialised so any equipped-flag change triggers recalc
  const equippedItems = useMemo(() => {
    return (char?.equipment||[]).filter(i=>i.equipped);
  }, [char]);

  const derivedAC = useMemo(() => {
    if (!char) return null;
    const dex     = mod(char.abilities?.DEX ?? 10);
    const equipped = (char.equipment||[]).filter(i => i.equipped);
    const fromEquip = calcEquippedAC(equipped, dex);
    if (fromEquip === null) return (char.ac ?? 10);          // nothing equipped
    if (fromEquip?.shieldOnly) return (char.ac ?? 10) + fromEquip.bonus; // shield only: +2 to base
    return fromEquip;
  }, [char]);

  // Auto max HP: level 1 = max hit die + CON mod; each level after = ½ hit die (rounded up) + CON mod
  const derivedMaxHP = useMemo(() => {
    if (!char?.class) return null;
    const hitDieStr = CLASS_DATA[char.class]?.hitDie; // e.g. "d10"
    if (!hitDieStr) return null;
    const faces = parseInt(hitDieStr.replace("d",""), 10);
    const lvl    = Math.max(1, char.level || 1);
    const conMod = mod(char.abilities?.CON ?? 10);
    // Level 1: max die face. Levels 2+: average = floor(faces/2) + 1
    const avg = Math.floor(faces / 2) + 1;
    return faces + (lvl - 1) * avg + lvl * conMod;
  }, [char?.class, char?.level, char?.abilities?.CON]);

  const equippedWeapons = useMemo(() => {
    const equipped = (char?.equipment||[]).filter(i=>i.equipped);
    const weapons = equipped.filter(i => {
      const d = EQUIPMENT_DB[i.name] || EQUIPMENT_DB[i.baseName];
      return d?.type === "weapon";
    });
    const hasShield = equipped.some(i => {
      const d = EQUIPMENT_DB[i.name] || EQUIPMENT_DB[i.baseName];
      return d?.armorType === "shield";
    });
    const soloWeapon = weapons.length === 1 && !hasShield;
    return weapons.map(w => {
      const d = EQUIPMENT_DB[w.name] || EQUIPMENT_DB[w.baseName];
      return { ...w, twoHanded: !!d?.versatileDmg && soloWeapon };
    });
  }, [char]);

  // Toggle equip/unequip — derivedAC is fully reactive so no need to write back to char.ac
  const toggleEquip = (id) => {
    setChar(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const item = next.equipment.find(i=>i.id===id);
      if (!item) return prev;
      item.equipped = !item.equipped;
      return next;
    });
  };

  const addEquipmentItem = (name, qty=1) => {
    const db = EQUIPMENT_DB[name];
    setChar(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.equipment = next.equipment || [];
      next.equipment.push({
        id: Date.now() + Math.random(),
        name,
        baseName: name,
        qty,
        weight: db?.weight || 0,
        equipped: false,
        notes: "",
      });
      return next;
    });
  };

  const removeEquipmentItem = (id) => {
    setChar(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.equipment = (next.equipment||[]).filter(i=>i.id!==id);
      return next;
    });
  };

  const loadStartingPack = (packItems) => {
    packItems.forEach(raw => {
      // Handle "4× Handaxe" style
      const m = raw.match(/^(\d+)[×x]\s*(.+)$/);
      const qty = m ? parseInt(m[1]) : 1;
      const name = m ? m[2].trim() : raw.trim();
      addEquipmentItem(name, qty);
    });
  };

  // Origin feat from background
  const originFeat = char?.background ? ORIGIN_FEATS[char.background] : null;

  // Spell data derived from class+level
  const casterInfo = useMemo(() => {
    if (!char?.class) return null;
    const cd = CLASS_SPELLS[char.class];
    if (!cd || !cd.slots) return null;
    if (cd.subclassOnly && char.subclass !== cd.subclassOnly) return null;
    return cd;
  }, [char?.class, char?.subclass]);

  const slotTable = useMemo(() => char ? getSlots(char.class, char.level) : null, [char?.class, char?.level]);
  const availableSpells = useMemo(() => char ? getAvailableSpells(char.class, char.level) : {}, [char?.class, char?.level]);
  const castAbility = casterInfo?.casting || "INT";
  const spellAttack = char ? aMod(castAbility) + PB : 0;
  const spellDC = char ? 8 + aMod(castAbility) + PB : 0;
  const maxSL = char ? maxSpellLevel(char.class, char.level) : 0;

  const knownSpellNames = useMemo(() => new Set((char?.spells||[]).map(s=>s.name)), [char?.spells]);
  const preparedSpellNames = useMemo(() => new Set((char?.spells||[]).filter(s=>s.prepared).map(s=>s.name)), [char?.spells]);

  // ── SPELL LIMITS ─────────────────────────────────────────────────────────────
  const spellLimitInfo = useMemo(() => {
    if (!char?.class || !casterInfo) return null;
    const lvl = char.level || 1;
    const lim = SPELL_LIMITS[char.class];
    if (!lim) return null; // class not in limits (shouldn't happen for casters)
    const learnedNonCantrip = (char.spells||[]).filter(s=>s.level>0).length;
    const learnedCantrip    = (char.spells||[]).filter(s=>s.level===0).length;
    const idx = lvl - 1;
    if (lim.type === "known") {
      const maxKnown    = lim.known[idx]    ?? lim.known[lim.known.length-1];
      const maxCantrips = lim.cantrips[idx] ?? lim.cantrips[lim.cantrips.length-1];
      return { type:"known", maxKnown, maxCantrips, learnedNonCantrip, learnedCantrip,
               atMax: learnedNonCantrip >= maxKnown, atMaxCantrips: learnedCantrip >= maxCantrips };
    }
    if (lim.type === "prepare" || lim.type === "book") {
      const castMod = Math.floor(((char.abilities?.[lim.castingMod]||10) - 10) / 2);
      const prepLimit = lim.halfCaster
        ? Math.max(1, Math.floor(lvl/2) + castMod)
        : Math.max(1, lvl + castMod);
      const maxCantrips = lim.cantrips ? (lim.cantrips[idx] ?? lim.cantrips[lim.cantrips.length-1]) : null;
      const prepared = (char.spells||[]).filter(s=>s.level>0&&s.prepared).length;
      return { type: lim.type, prepLimit, prepared, learnedNonCantrip, learnedCantrip,
               maxCantrips, atMaxCantrips: maxCantrips ? learnedCantrip >= maxCantrips : false,
               atPrepLimit: prepared >= prepLimit };
    }
    return null;
  }, [char, casterInfo]);

  const learnSpell = name => {
    if (knownSpellNames.has(name)) return;
    const d = SPELL_DETAILS[name];
    const isCantrip = (d?.lvl ?? 0) === 0;
    // Enforce limits for known casters
    if (spellLimitInfo?.type === "known") {
      if (isCantrip && spellLimitInfo.atMaxCantrips) return;
      if (!isCantrip && spellLimitInfo.atMax) return;
    }
    // Wizard: can always add to spellbook; cantrip cap still applies
    if (spellLimitInfo?.type === "book" && isCantrip && spellLimitInfo.atMaxCantrips) return;
    upd("spells", [...(char.spells||[]), {name, level: d?.lvl??0, school: d?.school||"", prepared: d?.lvl===0, id: Date.now()}]);
  };
  const forgetSpell = name => upd("spells", (char.spells||[]).filter(s=>s.name!==name));
  const togglePrepared = name => upd("spells", (char.spells||[]).map(s=>s.name===name?{...s,prepared:!s.prepared}:s));

  // ── RENDERS ──────────────────────────────────────────────────────────────────
  const renderStats = () => !char ? null : (
    <div>
      {/* Validation Warnings */}
      {warnings.length > 0 && (
        <div className="warn-box">
          <div className="warn-title">⚔ Character Sheet Incomplete</div>
          {warnings.map((w,i)=><div className="warn-item" key={i}>{w}</div>)}
        </div>
      )}

      {/* Identity */}
      <div className="pg">
        <div className="st">Character Identity</div>
        <div className="idg">
          {[["name","Name","text"],["playerName","Player","text"]].map(([k,l,t])=>(
            <div className="f" key={k}><label>{l}</label><input className="si" type={t} value={char[k]} onChange={e=>upd(k,e.target.value)}/></div>
          ))}
          <div className="f"><label>Class</label>
            <select className="si" value={char.class} onChange={e=>handleClassChange(e.target.value)}>
              <option value="">—</option>{CLASSES.map(c=><option key={c}>{c}</option>)}
            </select></div>
          <div className="f"><label>Subclass</label>
            <select className="si" value={char.subclass} onChange={e=>upd("subclass",e.target.value)}>
              <option value="">—</option>{(SUBCLASSES[char.class]||[]).map(s=><option key={s}>{s}</option>)}
            </select></div>
          <div className="f"><label>Level</label><input className="si" type="number" min="1" max="20" value={char.level} onChange={e=>handleLevelChange(e.target.value)}/></div>
          <div className="f"><label>Background</label>
            <select className="si" value={char.background} onChange={e=>handleBackgroundChange(e.target.value)}>
              <option value="">—</option>{BACKGROUNDS.map(b=><option key={b}>{b}</option>)}
            </select></div>
          <div className="f"><label>Species</label>
            <select className="si" value={char.species} onChange={e=>handleSpeciesChange(e.target.value)}>
              <option value="">—</option>{SPECIES.map(s=><option key={s}>{s}</option>)}
            </select></div>
          <div className="f"><label>Alignment</label>
            <select className="si" value={char.alignment} onChange={e=>upd("alignment",e.target.value)}>
              <option value="">—</option>{ALIGNMENTS.map(a=><option key={a}>{a}</option>)}
            </select></div>
          <div className="f"><label>XP</label><input className="si" type="number" min="0" value={char.xp} onChange={e=>upd("xp",+e.target.value)}/></div>
        </div>
      </div>

      {/* Class Features */}
      {char.class && CLASS_FEATURES[char.class] && (
        <div className="pg">
          <div className="st">
            Class Features — {char.class} {char.subclass ? `· ${char.subclass}` : ""} (Level {char.level||1})
          </div>
          {Array.from({length: char.level||1}, (_,i) => i+1)
            .filter(l => {
              const cf = CLASS_FEATURES[char.class][l]?.length;
              const sf = char.subclass && SUBCLASS_FEATURES[char.class]?.[char.subclass]?.[l]?.length;
              return cf || sf;
            })
            .map(l => {
              const classFeats = CLASS_FEATURES[char.class][l] || [];
              const subFeats = (char.subclass && SUBCLASS_FEATURES[char.class]?.[char.subclass]?.[l]) || [];
              // Filter out generic "Subclass Feature" placeholders when we have real subclass data
              const filteredClassFeats = subFeats.length > 0
                ? classFeats.filter(f => !f.startsWith("Subclass Feature") && !f.startsWith("Sorcerous Origin"))
                : classFeats;
              return (
                <div key={l}>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:2,color:"var(--gold)",textTransform:"uppercase",padding:"6px 11px 2px",opacity:.8}}>
                    ── Level {l} ──
                  </div>
                  <div className="trait-grid">
                    {filteredClassFeats.map((feat,i) => (
                      <div className="trait-card" key={`c${i}`}>
                        <div className="trait-name">{feat}</div>
                      </div>
                    ))}
                    {subFeats.map((feat,i) => (
                      <div className="trait-card" key={`s${i}`} style={{borderColor:"var(--crimson)",boxShadow:"0 0 6px rgba(139,0,0,0.25)"}}>
                        <div className="trait-name" style={{color:"var(--crimson)"}}>{feat}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          }
          {char.subclass && SUBCLASS_FEATURES[char.class]?.[char.subclass] && (
            <div style={{fontFamily:"'IM Fell English',serif",fontSize:9,color:"var(--crimson)",opacity:.7,textAlign:"center",padding:"4px 0 2px",letterSpacing:1}}>
              ✦ Crimson cards = {char.subclass} subclass features ✦
            </div>
          )}
          {char.subclass && !SUBCLASS_FEATURES[char.class]?.[char.subclass] && (
            <div style={{fontFamily:"'IM Fell English',serif",fontSize:9,color:"var(--ink)",opacity:.5,textAlign:"center",padding:"4px 0 2px",letterSpacing:1}}>
              Subclass feature details for {char.subclass} not yet in database
            </div>
          )}
        </div>
      )}

      {/* Ability Scores */}
      <div className="pg">
        <div className="st">Ability Scores</div>

        {/* Method row */}
        <div className="ab-method-row">
          <span className="ab-method-lbl">Method:</span>
          <span style={{fontFamily:"'IM Fell English',serif",fontSize:12,color:"var(--ink)"}}>Standard Array</span>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--br)",letterSpacing:1,marginLeft:4}}>(15 · 14 · 13 · 12 · 10 · 8)</span>
          {char.class && CLASS_ABILITY_SUGGESTIONS[char.class] && (
            <button
              style={{marginLeft:"auto",padding:"4px 13px",fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:1.5,
                background:showSuggestions?"var(--gold)":"rgba(200,149,42,.12)",
                color:showSuggestions?"#1a0a00":"var(--gold)",
                border:"1.5px solid var(--gold)",borderRadius:3,cursor:"pointer",
                transition:"all .15s",textTransform:"uppercase"}}
              onClick={()=>setShowSuggestions(s=>!s)}>
              {showSuggestions?"▲ Hide Suggestions":"✦ Suggested for "+char.class}
            </button>
          )}
          {!char.class && (
            <span style={{marginLeft:"auto",fontFamily:"'Cinzel',serif",fontSize:9,color:"rgba(92,51,23,.4)",fontStyle:"italic",letterSpacing:0,fontFamily:"'IM Fell English',serif"}}>
              Select a class to see suggested scores
            </span>
          )}
        </div>

        {/* Suggestions panel */}
        {showSuggestions && char.class && CLASS_ABILITY_SUGGESTIONS[char.class] && (() => {
          const sug = CLASS_ABILITY_SUGGESTIONS[char.class];
          return (
            <div style={{padding:"10px 11px",borderBottom:"1px solid rgba(92,51,23,.14)"}}>
              <div className="sug-panel">
                <div className="sug-header">
                  <span className="sug-class-name">{char.class}</span>
                  <span className="sug-build">— {sug.label}</span>
                </div>
                <div className="sug-scores">
                  {AB_ORDER.map(ab => {
                    const val = sug.spread[ab];
                    return (
                      <div key={ab} className="sug-score-item">
                        <div className="sug-score-ab">{ab}</div>
                        <div className="sug-score-val">{val}</div>
                        <div className="sug-score-mod">{fmt(mod(val))}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="sug-rationale">
                  {AB_ORDER.map(ab => (
                    <div key={ab} className="sug-rat-item">
                      <span className="sug-rat-ab">{ab}</span>
                      <span className="sug-rat-desc">{sug.rationale[ab]}</span>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
                  <button className="sug-apply-btn" onClick={()=>{
                    const s = CLASS_ABILITY_SUGGESTIONS[char.class].spread;
                    AB_ORDER.forEach(ab => upd(`abilities.${ab}`, s[ab]));
                    setArrayAssignments({...s});
                    setArrayPickTarget(null);
                    setShowSuggestions(false);
                  }}>
                    ✦ Apply these scores
                  </button>
                  <button className="sug-close-btn" onClick={()=>setShowSuggestions(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Standard Array tray */}
        <div className="array-tray">
          <span className="array-tray-lbl">Array:</span>
          {STANDARD_ARRAY.map(val => {
            const usedBy = Object.entries(arrayAssignments).find(([,v])=>v===val);
            const isSelected = arrayPickTarget !== null && arrayAssignments[arrayPickTarget] === val;
            return (
              <div
                key={val}
                className={`array-pip${usedBy?" used":""}${isSelected?" selected":""}`}
                title={usedBy ? `Assigned to ${usedBy[0]}` : `Click an ability box, then click this to assign ${val}`}
                onClick={()=>{
                  if (!arrayPickTarget) return;
                  // Assign this value to the target ability
                  const prev = {...arrayAssignments};
                  // If another ability already had this value, unassign it
                  const prevHolder = Object.keys(prev).find(k=>prev[k]===val);
                  if (prevHolder) prev[prevHolder] = null;
                  prev[arrayPickTarget] = val;
                  setArrayAssignments(prev);
                  upd(`abilities.${arrayPickTarget}`, val);
                  // Auto-advance to next unassigned ability
                  const next = AB_ORDER.find(ab=>!prev[ab]);
                  setArrayPickTarget(next||null);
                }}>
                {val}
              </div>
            );
          })}
          {arrayPickTarget && (
            <span style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--cr)",letterSpacing:1,animation:"pulse .9s ease-in-out infinite",marginLeft:4}}>
              → Assigning to {arrayPickTarget}
            </span>
          )}
        </div>

        {/* Ability score boxes */}
        <div className="abr">
          {AB_ORDER.map(ab=>{
            const assigned = arrayAssignments[ab] !== null;
            const isTarget = arrayPickTarget === ab;
            return (
              <div
                key={ab}
                className={`ab${isTarget?" target":assigned?" assigned":""}`}
                onClick={()=>setArrayPickTarget(isTarget?null:ab)}
                title={isTarget?"Click to deselect":"Click to assign a value from the array above"}>
                {assigned && (
                  <button className="ab-clear" onClick={e=>{
                    e.stopPropagation();
                    setArrayAssignments(prev=>({...prev,[ab]:null}));
                    upd(`abilities.${ab}`,10);
                  }} title="Clear assignment">✕</button>
                )}
                {isTarget && <div className="ab-pick-hint">pick ▲</div>}
                <div className="abl">{ab}</div>
                <input
                  className="abs"
                  type="number" min="1" max="30"
                  value={char.abilities[ab]}
                  onClick={e=>e.stopPropagation()}
                  onChange={e=>{
                    upd(`abilities.${ab}`,+e.target.value);
                    // If manually editing, clear array assignment for this slot
                    setArrayAssignments(prev=>({...prev,[ab]:null}));
                  }}/>
                <div className="abm">{fmt(aMod(ab))}</div>
              </div>
            );
          })}
        </div>

        {/* Progress / reset row */}
        <div className="ab-apply-row">
          {(() => {
            const assigned = Object.values(arrayAssignments).filter(v=>v!==null).length;
            const allDone = assigned === 6;
            return (
              <>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:9,color:allDone?"#2d6a2d":"var(--br)",letterSpacing:1}}>
                  {allDone?"✦ All 6 values assigned":`${assigned}/6 values assigned`}
                </span>
                <button
                  style={{marginLeft:"auto",padding:"3px 11px",fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:1,
                    background:"transparent",color:"var(--br)",border:"1px solid rgba(92,51,23,.3)",
                    borderRadius:2,cursor:"pointer",transition:"all .15s"}}
                  onClick={()=>{
                    setArrayAssignments({STR:null,DEX:null,CON:null,INT:null,WIS:null,CHA:null});
                    setArrayPickTarget(null);
                    AB_ORDER.forEach(ab=>upd(`abilities.${ab}`,10));
                  }}>
                  ↺ Reset
                </button>
              </>
            );
          })()}
        </div>

        {char.species && SPECIES_DATA[char.species]?.extraNotes && (
          <div style={{padding:"4px 11px 8px",fontSize:10,fontStyle:"italic",color:"var(--br)",borderTop:"1px solid rgba(92,51,23,.12)"}}>
            💡 {SPECIES_DATA[char.species].extraNotes}
          </div>
        )}
      </div>

      {/* Species Traits */}
      {char.species && SPECIES_DATA[char.species] && (
        <div className="pg">
          <div className="st" style={{cursor:"pointer"}} onClick={()=>setShowTraits(t=>!t)}>
            {char.species} Traits
            <button className="toggle-btn" style={{marginLeft:8,fontSize:7}}>{showTraits?"▲ Hide":"▼ Show"}</button>
          </div>
          <div className="species-meta">
            <div className="species-meta-item"><div className="species-meta-lbl">Speed</div><div className="species-meta-val">{SPECIES_DATA[char.species].speed} ft</div></div>
            <div className="species-meta-item"><div className="species-meta-lbl">Size</div><div className="species-meta-val">{SPECIES_DATA[char.species].size}</div></div>
            <div className="species-meta-item"><div className="species-meta-lbl">Darkvision</div><div className="species-meta-val">{SPECIES_DATA[char.species].darkvision>0?`${SPECIES_DATA[char.species].darkvision} ft`:"None"}</div></div>
            <div className="species-meta-item">
              <div className="species-meta-lbl">Resistances</div>
              <div>{SPECIES_DATA[char.species].resistances.length>0
                ? SPECIES_DATA[char.species].resistances.map(r=><span key={r} className="resist-tag">{r}</span>)
                : <span style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"var(--br)"}}>—</span>}
              </div>
            </div>
            <div className="species-meta-item">
              <div className="species-meta-lbl">Languages</div>
              <div style={{fontSize:10,color:"var(--ink)"}}>{SPECIES_DATA[char.species].languages.join(", ")}</div>
            </div>
          </div>
          {showTraits && (
            <div className="trait-grid">
              {SPECIES_DATA[char.species].traits.map(t=>(
                <div className="trait-card" key={t.name}>
                  <div className="trait-name">{t.name}</div>
                  <div className="trait-desc">{t.desc}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Saving Throws — auto from class, manual extras shown */}
      <div className="pg">
        <div className="pbr">
          <span className="pbl">Prof. Bonus</span><span className="pbv">{fmt(PB)}</span>
          <span className="pbl" style={{marginLeft:8}}>Passive Perc.</span><span className="pbv">{10+skBonus("Perception")}</span>
          <div className="ib">
            <span className="pbl">Inspiration</span>
            <button className={`it${char.inspiration?" on":""}`} onClick={()=>upd("inspiration",!char.inspiration)}>★</button>
          </div>
        </div>
        <div className="prof-section" style={{borderBottom:"1px solid rgba(92,51,23,.16)"}}>
          <div className="prof-lbl">
            Saving Throws
            {char.class && <span style={{fontSize:10,fontStyle:"italic",color:"var(--br)",fontFamily:"'IM Fell English',serif",letterSpacing:0}}>
              {char.class}s are proficient in {(CLASS_DATA[char.class]?.savingThrows||[]).join(" & ")}
            </span>}
          </div>
          <div className="save-grid">
            {Object.keys(char.savingThrows).map(ab=>{
              const isAuto = classSaveSet.has(ab);
              const isManual = char.savingThrows[ab];
              const active = isAuto || isManual;
              return (
                <div key={ab}
                  className={`save-chip${isAuto?" auto":isManual?" manual active":" manual"}`}
                  onClick={()=>{ if(!isAuto) upd(`savingThrows.${ab}`,!isManual); }}
                  title={isAuto?`${ab} save proficiency from ${char.class} class`:"Click to toggle manual proficiency"}>
                  <div style={{width:10,height:10,borderRadius:"50%",border:`1.5px solid ${active?"var(--cr)":"var(--br)"}`,background:active?"var(--cr)":"transparent",flexShrink:0,transition:"all .15s"}}/>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:1,flex:1}}>{ab}</span>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:11,fontWeight:700,color:"var(--cr)"}}>{fmt(svBonus(ab))}</span>
                  {isAuto && <span style={{fontSize:7,fontFamily:"'Cinzel',serif",color:"var(--cr)",opacity:.6}}>AUTO</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Skill Proficiencies */}
        <div className="prof-section">
          {/* Class skill choices */}
          {char.class && classSkillConfig && (
            <div style={{marginBottom:10}}>
              <div className="prof-lbl">
                {char.class} Skills — Choose {classSkillConfig.skillCount}
                <span className={`prof-count${(char.classSkills||[]).length===classSkillConfig.skillCount?" ok":(char.classSkills||[]).length>classSkillConfig.skillCount?" over":""}`}>
                  {(char.classSkills||[]).length}/{classSkillConfig.skillCount}
                </span>
              </div>
              <div className="skill-grid">
                {classSkillPool.map(name=>{
                  const chosen = (char.classSkills||[]).includes(name);
                  const bg = BACKGROUND_DATA[char.background];
                  const bgGranted = bg?.skills?.includes(name);
                  return (
                    <div key={name}
                      className={`skill-chip${chosen?" chosen":""}`}
                      onClick={()=>{
                        if (bgGranted) return; // can't double-dip background skill
                        const cur = char.classSkills||[];
                        if (chosen) { upd("classSkills",cur.filter(s=>s!==name)); }
                        else if (cur.length < classSkillConfig.skillCount) { upd("classSkills",[...cur,name]); }
                      }}>
                      <div className={`chip-dot${chosen?" chosen":""}`}/>
                      <span className="chip-ab">{char.skills[name]?.ability}</span>
                      <span style={{flex:1}}>{name}</span>
                      <span className="chip-bonus">{fmt(skBonus(name))}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Species bonus skill choices (Half-Elf +2, Human +1, etc.) */}
          {speciesSkillBonus > 0 && (
            <div style={{marginBottom:10}}>
              <div className="prof-lbl">
                {char.species} Bonus Skills — Choose {speciesSkillBonus}
                <span className={`prof-count${(char.speciesSkills||[]).length===speciesSkillBonus?" ok":(char.speciesSkills||[]).length>speciesSkillBonus?" over":""}`}>
                  {(char.speciesSkills||[]).length}/{speciesSkillBonus}
                </span>
              </div>
              <div className="skill-grid">
                {Object.keys(char.skills).map(name=>{
                  const chosen = (char.speciesSkills||[]).includes(name);
                  const alreadyHave = grantedSkillSet.has(name)||(char.classSkills||[]).includes(name);
                  if (alreadyHave && !chosen) return null;
                  return (
                    <div key={name}
                      className={`skill-chip${chosen?" spec-chosen":""}`}
                      onClick={()=>{
                        const cur = char.speciesSkills||[];
                        if (chosen) { upd("speciesSkills",cur.filter(s=>s!==name)); }
                        else if (cur.length < speciesSkillBonus) { upd("speciesSkills",[...cur,name]); }
                      }}>
                      <div className={`chip-dot${chosen?" spec":""}`}/>
                      <span className="chip-ab">{char.skills[name]?.ability}</span>
                      <span style={{flex:1}}>{name}</span>
                      <span className="chip-bonus">{fmt(skBonus(name))}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Full skill list */}
          <div>
            <div className="prof-lbl" style={{marginBottom:4}}>
              All Skills
              <span style={{fontSize:9,fontStyle:"italic",color:"var(--br)",fontFamily:"'IM Fell English',serif",letterSpacing:0}}>
                Green = granted · Red = class choice · Gold = species · Double-click for expertise
              </span>
            </div>
            <div className="skill-grid">
              {Object.entries(char.skills).map(([name,sk])=>{
                const granted = grantedSkillSet.has(name);
                const classChosen = (char.classSkills||[]).includes(name);
                const specChosen = (char.speciesSkills||[]).includes(name);
                const expert = sk.expert;
                const prof = isSkillProficient(name);
                const dotClass = expert?"expert":classChosen?"chosen":specChosen?"spec":granted?"granted":"";
                const chipClass = expert?" expert":classChosen?" chosen":specChosen?" spec-chosen":granted?" granted":"";
                return (
                  <div key={name} className={`skill-chip${chipClass}`}
                    onClick={()=>{
                      // Manual proficiency toggle (only if not already granted/chosen)
                      if (!granted && !classChosen && !specChosen) {
                        if (!sk.proficient && !expert) { upd(`skills.${name}.proficient`,true); }
                        else if (sk.proficient && !expert) { upd(`skills.${name}.expert`,true); }
                        else { upd(`skills.${name}.proficient`,false); upd(`skills.${name}.expert`,false); }
                      } else if (prof && !expert) {
                        // Already proficient by grant — allow expertise
                        upd(`skills.${name}.expert`,true);
                      } else if (expert) {
                        upd(`skills.${name}.expert`,false);
                      }
                    }}>
                    <div className={`chip-dot ${dotClass}`}/>
                    <span className="chip-ab">{sk.ability}</span>
                    <span style={{flex:1,fontSize:10}}>{name}</span>
                    {expert && <span style={{fontSize:7,fontFamily:"'Cinzel',serif",color:"var(--gold)",marginRight:2}}>EXP</span>}
                    <span className="chip-bonus">{fmt(skBonus(name))}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Combat */}
      <div className="pg">
        <div className="st">Combat</div>
        <div className="cbr">
          <div className="cb">
            <div className="cbl">Armour Class</div>
            <div className="cbi" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:19,fontWeight:700,color:"var(--cr)"}}>{derivedAC ?? char.ac}</span>
              {equippedItems.some(i=>(EQUIPMENT_DB[i.name]||EQUIPMENT_DB[i.baseName])?.type==="armor") &&
                <span style={{fontSize:7,fontFamily:"'Cinzel',serif",color:"var(--gold)",opacity:.7}}>AUTO</span>}
            </div>
            <div style={{fontSize:7,fontFamily:"'Cinzel',serif",color:"var(--br)",marginTop:2,textAlign:"center"}}>
              {!equippedItems.some(i=>(EQUIPMENT_DB[i.name]||EQUIPMENT_DB[i.baseName])?.type==="armor") &&
                <input type="number" value={char.ac} onChange={e=>upd("ac",+e.target.value)}
                  style={{width:40,background:"transparent",border:"none",borderBottom:"1px solid var(--br)",outline:"none",fontFamily:"'Cinzel Decorative',serif",fontSize:18,textAlign:"center",color:"var(--ink)"}}/>
              }
            </div>
          </div>
          {[["initiative","Initiative"],["speed","Speed (ft)"]].map(([k,l])=>(
            <div className="cb" key={k}><div className="cbl">{l}</div>
              <input className="cbi" type="number" value={char[k]} onChange={e=>upd(k,+e.target.value)}/>
            </div>
          ))}
          <div className="cb"><div className="cbl">Hit Dice</div>
            <input className="cbi" style={{fontSize:12,width:60}} value={char.hitDice.total} onChange={e=>upd("hitDice.total",e.target.value)}/>
            <div style={{fontSize:9,fontFamily:"'Cinzel',serif",color:"var(--br)",marginTop:3}}>
              Used <input type="number" value={char.hitDice.used} onChange={e=>upd("hitDice.used",+e.target.value)} style={{width:26,background:"transparent",border:"none",borderBottom:"1px solid var(--br)",outline:"none",fontFamily:"'Cinzel',serif",fontSize:9,textAlign:"center"}}/>
            </div>
          </div>
        </div>
        {/* Equipped weapon attack summary */}
        {equippedWeapons.length > 0 && (
          <div style={{borderTop:"1px solid rgba(92,51,23,.12)",paddingTop:6,paddingBottom:4}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:2,color:"var(--br)",textTransform:"uppercase",padding:"0 11px 4px"}}>Attack Rolls</div>
            {equippedWeapons.map(item=>{
              const d = EQUIPMENT_DB[item.name]||EQUIPMENT_DB[item.baseName];
              if (!d) return null;
              const bonus = calcAttackBonus(item, aMod("STR"), aMod("DEX"), PB);
              const abilityUsed = d.finesse ? (aMod("DEX")>=aMod("STR")?"DEX":"STR") : d.weaponType==="ranged"?"DEX":"STR";
              const dmg = item.twoHanded && d.versatileDmg ? d.versatileDmg : d.damage;
              return (
                <div key={item.id} className="atk-card">
                  <span className="atk-name">
                    {item.name}
                    {item.twoHanded && d.versatileDmg && (
                      <span style={{fontSize:8,fontFamily:"'Cinzel',serif",color:"#1a6a8b",marginLeft:5,letterSpacing:.5}}>2H</span>
                    )}
                  </span>
                  <span className="atk-bonus">{fmt(bonus)}</span>
                  <span className="atk-dmg">{dmg} {d.damageType.slice(0,4)}. ({abilityUsed})</span>
                </div>
              );
            })}
          </div>
        )}
        {char.class && CLASS_DATA[char.class] && (
          <div style={{padding:"4px 11px 8px",fontSize:10,color:"var(--br)",borderTop:"1px solid rgba(92,51,23,.1)"}}>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:1,textTransform:"uppercase",marginRight:6}}>Proficiencies:</span>
            {[...(CLASS_DATA[char.class].armor.length?[CLASS_DATA[char.class].armor.join(", ")]:[]),
              CLASS_DATA[char.class].weapons.join(", "),
              ...((char.toolProficiencies||[]).length?[(char.toolProficiencies||[]).join(", ")]:[])
            ].join(" · ")}
          </div>
        )}
        <div className="hps">
          <div className="hpb">
            <div className="hpl">Hit Points</div>
            {/* Max HP — auto from hit dice, or manual override */}
            {derivedMaxHP !== null && !char.hpManual ? (
              <div style={{textAlign:"center",marginBottom:4}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,marginBottom:2}}>
                  <span style={{fontFamily:"'Cinzel Decorative',serif",fontSize:22,color:"var(--cr)",lineHeight:1}}>
                    {Math.max(1, derivedMaxHP)}
                  </span>
                  <span style={{fontSize:9,color:"var(--br)",fontFamily:"'Cinzel',serif",lineHeight:1.2,textAlign:"left"}}>
                    Max HP<br/>
                    <span style={{fontSize:8,opacity:.7}}>
                      {(() => {
                        const faces = parseInt((CLASS_DATA[char.class]?.hitDie||"d8").replace("d",""),10);
                        const avg = Math.floor(faces/2)+1;
                        const conMod = mod(char.abilities?.CON??10);
                        const lvl = char.level||1;
                        return `${faces}+(${lvl-1}×${avg})+${lvl}×CON(${conMod>=0?"+":""}${conMod})`;
                      })()}
                    </span>
                  </span>
                </div>
                <button onClick={()=>upd("hpManual",true)}
                  style={{fontSize:8,fontFamily:"'Cinzel',serif",background:"transparent",border:"1px solid rgba(92,51,23,.25)",borderRadius:2,padding:"2px 7px",color:"var(--br)",cursor:"pointer",letterSpacing:.5}}>
                  Override
                </button>
              </div>
            ) : (
              <div style={{textAlign:"center",marginBottom:4}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,marginBottom:2}}>
                  <input className="hpn" type="number" value={char.hp.max} onChange={e=>upd("hp.max",+e.target.value)}/>
                  <span style={{fontSize:9,color:"var(--br)",fontFamily:"'Cinzel',serif"}}>Max HP</span>
                </div>
                {char.hpManual && derivedMaxHP !== null && (
                  <button onClick={()=>{upd("hpManual",false);upd("hp.max", Math.max(1,derivedMaxHP));}}
                    style={{fontSize:8,fontFamily:"'Cinzel',serif",background:"transparent",border:"1px solid rgba(92,51,23,.25)",borderRadius:2,padding:"2px 7px",color:"var(--br)",cursor:"pointer",letterSpacing:.5}}>
                    ↩ Use Auto ({Math.max(1,derivedMaxHP)})
                  </button>
                )}
              </div>
            )}
            {/* Current HP */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginBottom:4}}>
              <input className="hpn" type="number" value={char.hp.current} onChange={e=>upd("hp.current",+e.target.value)}/>
              <span style={{fontSize:11,color:"var(--br)",fontFamily:"'Cinzel',serif"}}>/</span>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:13,color:"var(--br)"}}>
                {char.hpManual ? char.hp.max : Math.max(1, derivedMaxHP ?? char.hp.max)}
              </span>
            </div>
            <div style={{marginTop:2,fontSize:9,fontFamily:"'Cinzel',serif",color:"var(--br)",textAlign:"center"}}>
              Current HP
            </div>
            <div style={{marginTop:6,fontSize:9,fontFamily:"'Cinzel',serif",color:"var(--br)",textAlign:"center"}}>
              Temp HP <input type="number" value={char.hp.temp} onChange={e=>upd("hp.temp",+e.target.value)} style={{width:34,background:"transparent",border:"none",borderBottom:"1px solid var(--br)",outline:"none",fontFamily:"'Cinzel',serif",fontSize:9,textAlign:"center"}}/>
            </div>
            {/* Hit Dice */}
            {char.class && CLASS_DATA[char.class] && (
              <div style={{marginTop:7,fontSize:9,fontFamily:"'Cinzel',serif",color:"var(--br)",textAlign:"center",borderTop:"1px solid rgba(92,51,23,.15)",paddingTop:5}}>
                Hit Dice: {char.level||1}{CLASS_DATA[char.class].hitDie}
                <span style={{marginLeft:8,opacity:.6}}>Used:</span>
                <input type="number" min="0" max={char.level||1}
                  value={char.hitDice?.used||0}
                  onChange={e=>upd("hitDice.used", Math.min(+e.target.value, char.level||1))}
                  style={{width:28,background:"transparent",border:"none",borderBottom:"1px solid var(--br)",outline:"none",fontFamily:"'Cinzel',serif",fontSize:9,textAlign:"center",marginLeft:4}}/>
              </div>
            )}
          </div>
          <div className="pg" style={{margin:0,flex:1,minWidth:130}}>
            <div className="st">Death Saves</div>
            <div style={{padding:"8px 11px"}}>
              {["successes","failures"].map(type=>(
                <div style={{display:"flex",alignItems:"center",gap:7,margin:"5px 0"}} key={type}>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:9,textTransform:"capitalize",width:66,color:"var(--ink)"}}>{type}</span>
                  {[1,2,3].map(i=>(
                    <div key={i} className={`pip ${type==="successes"?"s":"f"}${char.deathSaves[type]>=i?" on":""}`}
                      onClick={()=>upd(`deathSaves.${type}`,char.deathSaves[type]>=i?i-1:i)}/>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feats */}
      <div className="pg">
        <div className="st">Feats</div>
        <div style={{padding:"10px 11px"}}>
          {/* Origin feat from background */}
          {originFeat ? (
            <div className="feat-origin">
              <div className="feat-origin-lbl">✦ Origin Feat — {char.background} Background</div>
              <div className="feat-origin-name" onClick={()=>setFeatModal(originFeat)}>{originFeat}</div>
              <div className="feat-origin-benefit">{FEAT_DB[originFeat]?.benefit}</div>
            </div>
          ) : (
            <div style={{fontSize:11,color:"var(--br)",fontStyle:"italic",marginBottom:8}}>
              Select a background to unlock your Origin Feat.
            </div>
          )}
          {/* General feats (available at levels 4, 8, 12, 16, 19) */}
          <div style={{marginBottom:8}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:2,color:"var(--br)",textTransform:"uppercase",marginBottom:6,display:"flex",alignItems:"center",gap:8}}>
              General Feats
              {char.level >= 4 && <span style={{fontSize:9,background:"rgba(139,26,26,.1)",color:"var(--cr)",border:"1px solid rgba(139,26,26,.25)",borderRadius:2,padding:"1px 6px"}}>
                {Math.floor([4,8,12,16,19].filter(l=>l<=char.level).length)} available at Lv {char.level}
              </span>}
              {char.level < 4 && <span style={{fontSize:9,fontStyle:"italic",color:"rgba(92,51,23,.5)",letterSpacing:0,fontFamily:"'IM Fell English',serif"}}>unlocks at level 4</span>}
            </div>
            {/* Currently selected general feats */}
            {(char.feats||[]).filter(f=>FEAT_DB[f]?.type==="general").length > 0 && (
              <div className="feat-grid" style={{marginBottom:8}}>
                {(char.feats||[]).filter(f=>FEAT_DB[f]?.type==="general").map(f=>(
                  <div key={f} className="feat-card active" onClick={()=>setFeatModal(f)}>
                    <div className="feat-card-name">{f}</div>
                    <div className="feat-card-benefit">{FEAT_DB[f]?.benefit}</div>
                    <button onClick={e=>{e.stopPropagation();upd("feats",(char.feats||[]).filter(x=>x!==f));}}
                      style={{marginTop:5,fontSize:9,fontFamily:"'Cinzel',serif",color:"var(--cr)",background:"none",border:"none",cursor:"pointer",padding:0,letterSpacing:.5}}>
                      ✕ Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Feat browser (general feats only, unlocked at 4+) */}
            {char.level >= 4 && (
              <details style={{marginTop:4}}>
                <summary style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:1,color:"var(--gold)",cursor:"pointer",padding:"4px 0",listStyle:"none",display:"flex",alignItems:"center",gap:6}}>
                  ▼ Browse General Feats
                </summary>
                <div className="feat-grid" style={{marginTop:8}}>
                  {Object.entries(FEAT_DB).filter(([n,f])=>f.type==="general"&&!(char.feats||[]).includes(n)).map(([name,feat])=>(
                    <div key={name} className="feat-card" onClick={()=>setFeatModal(name)}>
                      <div className="feat-card-name">{name}</div>
                      {feat.prereq!=="None"&&<div className="feat-card-prereq">Requires: {feat.prereq}</div>}
                      <div className="feat-card-benefit">{feat.benefit}</div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      </div>

      <div className="pg">
        <div className="st">Proficiencies & Languages</div>
        <div style={{padding:"11px",display:"flex",flexDirection:"column",gap:12}}>
          {/* ── Armor & Weapons (auto from class) ── */}
          {char.class && CLASS_DATA[char.class] && (() => {
            const cd = CLASS_DATA[char.class];
            const armorStr = cd.armor?.join(", ") || "None";
            const weaponStr = cd.weapons?.join(", ") || "None";
            return (
              <div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:1.5,color:"var(--gold)",textTransform:"uppercase",marginBottom:4}}>Armour &amp; Weapons</div>
                <div style={{fontSize:10,color:"var(--ink)",lineHeight:1.6}}>
                  <span style={{opacity:.6}}>Armour: </span>{armorStr}<br/>
                  <span style={{opacity:.6}}>Weapons: </span>{weaponStr}
                </div>
              </div>
            );
          })()}

          {/* ── Tool Proficiencies ── */}
          {(() => {
            const cd = CLASS_DATA[char.class] || {};
            const bd = BACKGROUND_DATA[char.background] || {};
            // Which class tools are flexible (choice-based)
            const flexClassTools = (cd.tools||[]).filter(t => t.startsWith("One") || t.startsWith("Three") || t.startsWith("two") || t.startsWith("Any"));
            const flexBgTools = (bd.tools||[]).filter(t => t.startsWith("One") || t.startsWith("Any"));
            const autoTools = (char.toolProficiencies||[]);
            const ALL_TOOLS = [
              "Alchemist's Supplies","Brewer's Supplies","Calligrapher's Supplies","Carpenter's Tools",
              "Cartographer's Tools","Cobbler's Tools","Cook's Utensils","Glassblower's Tools",
              "Jeweler's Tools","Leatherworker's Tools","Mason's Tools","Painter's Supplies",
              "Potter's Tools","Smith's Tools","Tinker's Tools","Weaver's Tools","Woodcarver's Tools",
              "Disguise Kit","Forgery Kit","Herbalism Kit","Navigator's Tools","Poisoner's Kit",
              "Thieves' Tools","Healer's Kit",
              "Dice Set","Dragonchess Set","Playing Card Set","Three-Dragon Ante Set",
              "Bagpipes","Drum","Dulcimer","Flute","Lute","Lyre","Horn","Pan Flute","Shawm","Viol",
              "Vehicles (land)","Vehicles (water)","Vehicles (air)"
            ];
            const hasFlexChoice = flexClassTools.length > 0 || flexBgTools.length > 0;
            return (
              <div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:1.5,color:"var(--gold)",textTransform:"uppercase",marginBottom:4}}>Tool Proficiencies</div>
                {/* Fixed auto tools as chips */}
                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:hasFlexChoice?8:4}}>
                  {autoTools.map(t => (
                    <span key={t} style={{
                      background:"rgba(139,90,43,0.12)",border:"1px solid var(--br)",
                      borderRadius:3,padding:"1px 7px",fontSize:9,fontFamily:"'Cinzel',serif",
                      color:"var(--ink)",display:"flex",alignItems:"center",gap:4
                    }}>
                      {t}
                      <button onClick={()=>upd("toolProficiencies",(char.toolProficiencies||[]).filter(x=>x!==t))}
                        style={{background:"none",border:"none",cursor:"pointer",color:"var(--br)",fontSize:9,padding:0,lineHeight:1}}>✕</button>
                    </span>
                  ))}
                  {autoTools.length === 0 && <span style={{fontSize:9,color:"var(--ink)",opacity:.4,fontStyle:"italic"}}>None yet</span>}
                </div>
                {/* Flexible choice prompt */}
                {hasFlexChoice && (
                  <div style={{fontSize:9,color:"var(--crimson)",fontStyle:"italic",marginBottom:5,opacity:.8}}>
                    {flexClassTools.length>0 && <span>Class grants: {flexClassTools.join("; ")}. </span>}
                    {flexBgTools.length>0 && <span>Background grants: {flexBgTools.join("; ")}. </span>}
                    Choose below:
                  </div>
                )}
                {/* Tool picker */}
                <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                  <select style={{fontSize:9,padding:"2px 4px",background:"var(--parchment)",border:"1px solid var(--br)",fontFamily:"'Cinzel',serif",color:"var(--ink)",borderRadius:3}}
                    value="" onChange={e=>{
                      if(!e.target.value) return;
                      const cur = char.toolProficiencies||[];
                      if(!cur.includes(e.target.value)) upd("toolProficiencies",[...cur,e.target.value]);
                    }}>
                    <option value="">+ Add tool…</option>
                    {ALL_TOOLS.filter(t=>!(char.toolProficiencies||[]).includes(t)).map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            );
          })()}

          {/* ── Languages (auto from species + background + extras) ── */}
          {(() => {
            const speciesLangs = SPECIES_DATA[char.species]?.languages || [];
            const bgLangs = []; // backgrounds don't grant specific languages in 2024 by default
            const extras = char.extraLanguages || [];
            const ALL_LANGUAGES = ["Common","Elvish","Dwarvish","Halfling","Gnomish","Orc","Draconic",
              "Giant","Infernal","Celestial","Abyssal","Sylvan","Undercommon","Deep Speech",
              "Primordial","Auran","Aquan","Ignan","Terran","Thieves' Cant","Druidic",
              "One language of your choice"];
            const autoLangs = [...new Set([...speciesLangs, ...bgLangs])];
            return (
              <div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:1.5,color:"var(--gold)",textTransform:"uppercase",marginBottom:4}}>Languages</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>
                  {autoLangs.map(l=>(
                    <span key={l} style={{background:"rgba(139,90,43,0.12)",border:"1px solid var(--br)",borderRadius:3,padding:"1px 7px",fontSize:9,fontFamily:"'Cinzel',serif",color:"var(--ink)",opacity:.8}}>{l}</span>
                  ))}
                  {extras.map(l=>(
                    <span key={l} style={{background:"rgba(139,0,0,0.08)",border:"1px solid var(--crimson)",borderRadius:3,padding:"1px 7px",fontSize:9,fontFamily:"'Cinzel',serif",color:"var(--ink)",display:"flex",alignItems:"center",gap:4}}>
                      {l}
                      <button onClick={()=>upd("extraLanguages",(char.extraLanguages||[]).filter(x=>x!==l))}
                        style={{background:"none",border:"none",cursor:"pointer",color:"var(--br)",fontSize:9,padding:0,lineHeight:1}}>✕</button>
                    </span>
                  ))}
                  {autoLangs.length===0 && extras.length===0 && <span style={{fontSize:9,color:"var(--ink)",opacity:.4,fontStyle:"italic"}}>None yet</span>}
                </div>
                <select style={{fontSize:9,padding:"2px 4px",background:"var(--parchment)",border:"1px solid var(--br)",fontFamily:"'Cinzel',serif",color:"var(--ink)",borderRadius:3}}
                  value="" onChange={e=>{
                    if(!e.target.value) return;
                    const cur = char.extraLanguages||[];
                    if(!cur.includes(e.target.value) && !autoLangs.includes(e.target.value))
                      upd("extraLanguages",[...cur,e.target.value]);
                  }}>
                  <option value="">+ Add language…</option>
                  {ALL_LANGUAGES.filter(l=>![...(char.extraLanguages||[]),...autoLangs].includes(l)).map(l=><option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            );
          })()}

          {/* ── Other Proficiencies (freetext) ── */}
          <div className="f"><label>Other Notes</label><textarea className="ta" placeholder="Any additional proficiencies, notes…" value={char.proficiencies} onChange={e=>upd("proficiencies",e.target.value)}/></div>
        </div>
      </div>
    </div>
  );

  const renderSpells = () => {
    if (!char) return null;
    if (!isCaster(char.class, char.subclass)) {
      const needsSub = CLASS_SPELLS[char.class]?.subclassOnly;
      return (
        <div className="pg">
          <div className="nocast">
            {!char.class ? <span>Select a class on the <b>Attributes</b> tab to see spells.</span>
              : needsSub ? <span><b>{char.class}s</b> only gain spellcasting via the <b>{needsSub}</b> subclass.<br/>Set your subclass on the Attributes tab to unlock spells.</span>
              : <span><b>{char.class}s</b> do not have spellcasting in the 2024 Player's Handbook.</span>}
          </div>
        </div>
      );
    }
    const isPact = CLASS_SPELLS[char.class].slots === "pact";
    const slotLevels = slotTable ? Object.keys(slotTable).filter(k=>k!=="pL").map(Number).filter(k=>k>0&&slotTable[k]>0).sort((a,b)=>a-b) : [];
    const pactLevel = slotTable?.pL;
    const allAvailLevels = Object.keys(availableSpells).map(Number).sort((a,b)=>a-b);

    // Spell browser: filter by selected level tab + search
    const browseLvl = spellTab;
    const levelSpells = availableSpells[browseLvl] || [];
    const filtered = spellSearch ? levelSpells.filter(n=>n.toLowerCase().includes(spellSearch.toLowerCase())) : levelSpells;

    return (
      <div>
        {/* Spellcasting stats */}
        <div className="pg">
          <div className="st">Spellcasting</div>
          <div className="cmeta">
            <div className="cms"><div className="cml">Ability</div><div className="cmv">{castAbility}</div></div>
            <div className="cms"><div className="cml">Spell Save DC</div><div className="cmv">{spellDC}</div></div>
            <div className="cms"><div className="cml">Spell Attack</div><div className="cmv">{fmt(spellAttack)}</div></div>
            <div className="cms"><div className="cml">Max Spell Level</div><div className="cmv">{maxSL===0?"—":maxSL}</div></div>
          </div>
          {isPact && pactLevel && (
            <div className="pact-note">⚡ Pact Magic — All slots are level {pactLevel} · Regain on Short or Long Rest</div>
          )}
          {slotLevels.length > 0 && (
            <div className="slotg">
              {slotLevels.map(lvl=>{
                const total = slotTable[lvl];
                const used = char.slotsUsed?.[lvl]||0;
                const isPactSlot = isPact;
                return (
                  <div className="slb" key={lvl}>
                    <div className="sll">{isPactSlot?"Pact Slots":`Level ${lvl}`}</div>
                    <div className="slps">
                      {Array.from({length:total},(_,i)=>(
                        <div key={i} className={`slp${isPactSlot?" p":""}${i<used?" u":""}`}
                          onClick={()=>upd(`slotsUsed.${lvl}`,i<used?used-1:used+1<=total?used+1:used)}/>
                      ))}
                    </div>
                    <div className="slc">{used}/{total} used</div>
                  </div>
                );
              })}
            </div>
          )}
          {maxSL === 0 && <div style={{padding:"8px 11px",fontSize:11,color:"var(--br)",fontStyle:"italic",textAlign:"center"}}>Gain spell slots by levelling up.</div>}
        </div>

        {/* Spell Browser */}
        {allAvailLevels.length > 0 && (
          <div className="pg">
            <div className="st">Spell Browser</div>
            <div className="spbr">
              <div className="sbrow">
                {allAvailLevels.map(l=>(
                  <button key={l} className={`sbtab${spellTab===l?" ac":""}`} onClick={()=>setSpellTab(l)}>
                    {l===0?"Cantrips":`Level ${l}`}
                  </button>
                ))}
              </div>
              <input value={spellSearch} onChange={e=>setSpellSearch(e.target.value)}
                placeholder="Search spells..."
                style={{width:"100%",background:"transparent",border:"none",borderBottom:"1px solid rgba(92,51,23,.32)",fontFamily:"'IM Fell English',serif",fontSize:12,color:"var(--ink)",padding:"3px 2px",outline:"none",marginBottom:8}}/>
              <div style={{fontSize:9,fontFamily:"'Cinzel',serif",color:"var(--br)",marginBottom:6,letterSpacing:.5}}>
                Click a spell to view details · <span style={{color:"var(--cr)"}}>Red border</span> = known · <span style={{color:"#c8952a"}}>Gold</span> = prepared
              </div>
              <div className="spg">
                {filtered.map(name=>{
                  const d = SPELL_DETAILS[name];
                  const school = d?.school || "";
                  const col = SCHOOL_COL[school] || "#888";
                  const known = knownSpellNames.has(name);
                  const prepared = preparedSpellNames.has(name);
                  return (
                    <div key={name} className={`spc${prepared?" pr":known?" kn":""}`}
                      onClick={()=>setSelectedSpell(name)}>
                      <div className="dot" style={{background:col}}/>
                      <div>
                        <span className="spni">{name}</span>
                        <span className="spsch">{school}</span>
                        {d && <span className="spbadge" style={{background:col}}>{d.cast}</span>}
                      </div>
                    </div>
                  );
                })}
                {filtered.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",color:"var(--br)",fontStyle:"italic",fontSize:12,padding:"12px 0"}}>No spells found.</div>}
              </div>
            </div>
          </div>
        )}

        {/* Known Spells */}
        <div className="pg">
          <div className="st" style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
            <span>Known & Prepared Spells</span>
            {spellLimitInfo && (
              <span style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:.5,color:"var(--br)",display:"flex",gap:10}}>
                {spellLimitInfo.type==="known" && <>
                  <span style={{color: spellLimitInfo.atMaxCantrips?"var(--cr)":"inherit"}}>
                    Cantrips {spellLimitInfo.learnedCantrip}/{spellLimitInfo.maxCantrips}
                  </span>
                  <span style={{color: spellLimitInfo.atMax?"var(--cr)":"inherit"}}>
                    Spells {spellLimitInfo.learnedNonCantrip}/{spellLimitInfo.maxKnown}
                  </span>
                </>}
                {(spellLimitInfo.type==="prepare"||spellLimitInfo.type==="book") && <>
                  {spellLimitInfo.maxCantrips && (
                    <span style={{color: spellLimitInfo.atMaxCantrips?"var(--cr)":"inherit"}}>
                      Cantrips {spellLimitInfo.learnedCantrip}/{spellLimitInfo.maxCantrips}
                    </span>
                  )}
                  <span style={{color: spellLimitInfo.atPrepLimit?"var(--cr)":"inherit"}}>
                    Prepared {spellLimitInfo.prepared}/{spellLimitInfo.prepLimit}
                  </span>
                  {spellLimitInfo.type==="book" && (
                    <span>In Spellbook {spellLimitInfo.learnedNonCantrip}</span>
                  )}
                </>}
              </span>
            )}
          </div>
          <div className="ksl">
            {(!char.spells||char.spells.length===0) && (
              <div style={{textAlign:"center",padding:"16px",color:"var(--br)",fontStyle:"italic",fontSize:12}}>
                Browse spells above and click to add them to your spell list.
              </div>
            )}
            {[...char.spells||[]].sort((a,b)=>a.level-b.level||a.name.localeCompare(b.name)).map(sp=>{
              const col = SCHOOL_COL[sp.school] || "#888";
              return (
                <div className="ksi" key={sp.id} onClick={()=>setSelectedSpell(sp.name)}>
                  {sp.level > 0 && (
                    <div className={`ksprep${sp.prepared?" pr":""}`}
                      onClick={e=>{e.stopPropagation();togglePrepared(sp.name);}}/>
                  )}
                  <span className="kslvl" style={{background:col}}>{sp.level===0?"C":sp.level}</span>
                  <span className="ksn">{sp.name}</span>
                  <span className="kssch">{sp.school}</span>
                  <button className="bd" onClick={e=>{e.stopPropagation();forgetSpell(sp.name);}}>✕</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderInv = () => !char ? null : (
    <div>
      <div className="pg">
        <div className="st">Coin Purse</div>
        <div className="cr">
          {[["cp","Copper"],["sp","Silver"],["ep","Electrum"],["gp","Gold"],["pp","Platinum"]].map(([k,l])=>(
            <div className="cub" key={k}><div className="cul">{l}</div>
              <input className="cui" type="number" min="0" value={char[k]} onChange={e=>upd(k,+e.target.value)}/>
            </div>
          ))}
        </div>
      </div>
      <div className="pg">
        <div className="st">Equipment & Inventory</div>
        <div className="ita">
          <div className="f"><label>Item Name</label><input className="si" value={newItem.name} onChange={e=>setNewItem(p=>({...p,name:e.target.value}))} placeholder="e.g. Longsword +1"/></div>
          <div className="f"><label>Qty</label><input className="si" type="number" min="1" value={newItem.qty} onChange={e=>setNewItem(p=>({...p,qty:+e.target.value}))}/></div>
          <div className="f"><label>&nbsp;</label>
            <button style={{padding:"4px 10px",fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:1,background:"var(--br)",color:"var(--vel)",border:"1px solid var(--brl)",borderRadius:3,cursor:"pointer",textTransform:"uppercase"}}
              onClick={()=>{if(!newItem.name)return;upd("inventory",[...(char.inventory||[]),{...newItem,id:Date.now()}]);setNewItem({name:"",qty:1,weight:0});}}>
              + Add Item
            </button></div>
        </div>
        {(char.inventory||[]).map(item=>(
          <div className="itr" key={item.id}>
            <span className="itq">×{item.qty}</span>
            <span className="itn">{item.name}</span>
            <button className="bd" onClick={()=>upd("inventory",(char.inventory||[]).filter(i=>i.id!==item.id))}>✕</button>
          </div>
        ))}
        {(!char.inventory||char.inventory.length===0)&&<div style={{textAlign:"center",padding:"14px",color:"var(--br)",fontStyle:"italic",fontSize:12}}>Pack is empty...</div>}
      </div>
    </div>
  );

  const renderNotes = () => !char ? null : (
    <div>
      <div className="pg">
        <div className="st">Personality</div>
        <div className="ng">
          {[["traits","Personality Traits"],["ideals","Ideals"],["bonds","Bonds"],["flaws","Flaws"]].map(([k,l])=>(
            <div className="f" key={k}><label>{l}</label><textarea className="ta" value={char[k]} onChange={e=>upd(k,e.target.value)}/></div>
          ))}
        </div>
      </div>
      <div className="pg">
        <div className="st">Features & Traits</div>
        <div style={{padding:11}}><textarea className="ta" style={{minHeight:110}} value={char.features} onChange={e=>upd("features",e.target.value)} placeholder="Class features, racial traits, feats..."/></div>
      </div>
      <div className="pg">
        <div className="st">Notes & Journal</div>
        <div style={{padding:11}}><textarea className="ta" style={{minHeight:140}} value={char.notes} onChange={e=>upd("notes",e.target.value)} placeholder="Campaign notes, NPCs, plot hooks..."/></div>
      </div>
    </div>
  );

  // ── PROPERTY TAG COMPONENT ──────────────────────────────────────────────────
  const PropTag = ({name}) => {
    const def = PROPERTY_DEFS[name] || PROPERTY_DEFS[name?.split(" ")[0]];
    const color = def?.color || "#5c3317";
    const desc = def?.desc || "";
    const shortName = name?.replace(/\s*\(.*\)/,""); // strip parenthetical for display
    return (
      <span className="prop-tooltip">
        <span className="prop-tag" style={{background:color}}>{shortName}</span>
        {desc && <span className="tt"><strong>{name}</strong><br/>{desc}</span>}
      </span>
    );
  };

  // ── EQUIPMENT TAB ───────────────────────────────────────────────────────────
  const renderEquipment = () => !char ? null : (
    <div>
      {/* Starting Equipment */}
      {CLASS_EQUIPMENT[char.class] && (char.equipment||[]).length === 0 && (
        <div className="pg">
          <div className="st">Starting Equipment</div>
          <div className="eq-mode-row">
            <span style={{fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:2,color:"var(--br)",textTransform:"uppercase"}}>Choose method:</span>
            <button className={`eq-mode-btn${char.equipMode==="packs"?" ac":""}`} onClick={()=>upd("equipMode","packs")}>Equipment Packs</button>
            <button className={`eq-mode-btn${char.equipMode==="gold"?" ac":""}`} onClick={()=>upd("equipMode","gold")}>Start with Gold</button>
          </div>
          {char.equipMode==="packs" && CLASS_EQUIPMENT[char.class].packs.map((pack,i)=>(
            <div key={i} className="pack-option">
              <div className="pack-label">{pack.label}</div>
              <div className="pack-items">{pack.items.join(", ")}</div>
              <button className="pack-load-btn" onClick={()=>loadStartingPack(pack.items)}>
                ✦ Take this equipment
              </button>
            </div>
          ))}
          {char.equipMode==="gold" && (
            <div className="gold-start">
              <div className="gold-start-val">{CLASS_EQUIPMENT[char.class].gold}</div>
              <div className="gold-start-lbl">Starting Gold Pieces</div>
              <button className="gold-start-btn" onClick={()=>{
                upd("gp", (char.gp||0) + CLASS_EQUIPMENT[char.class].gold);
              }}>✦ Add to coin purse ✦</button>
            </div>
          )}
        </div>
      )}

      {/* AC & Attack summary */}
      {(char.equipment||[]).length > 0 && (
        <div className="pg">
          <div className="st">Combat Stats (from Equipment)</div>
          <div style={{display:"flex",gap:14,padding:"10px 13px",flexWrap:"wrap",alignItems:"flex-start"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:2,color:"var(--br)",textTransform:"uppercase",marginBottom:3}}>Armour Class</div>
              <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:32,color:"var(--cr)",lineHeight:1}}>{derivedAC ?? char.ac}</div>
              <div style={{fontSize:9,fontFamily:"'Cinzel',serif",color:"var(--br)",marginTop:2}}>
                {equippedItems.find(i=>(EQUIPMENT_DB[i.name]||EQUIPMENT_DB[i.baseName])?.type==="armor"&&(EQUIPMENT_DB[i.name]||EQUIPMENT_DB[i.baseName])?.armorType!=="shield")?.name || "No armor"}
              </div>
            </div>
            {equippedWeapons.length > 0 && (
              <div style={{flex:1,minWidth:180}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:2,color:"var(--br)",textTransform:"uppercase",marginBottom:4}}>Attack Rolls</div>
                {equippedWeapons.map(item=>{
                  const d = EQUIPMENT_DB[item.name]||EQUIPMENT_DB[item.baseName];
                  if (!d) return null;
                  const bonus = calcAttackBonus(item, aMod("STR"), aMod("DEX"), PB);
                  const dmg = item.twoHanded && d.versatileDmg ? d.versatileDmg : d.damage;
                  return (
                    <div key={item.id} className="atk-card" style={{margin:"3px 0"}}>
                      <span className="atk-name">
                        {item.name}
                        {item.twoHanded && d.versatileDmg && (
                          <span style={{fontSize:8,fontFamily:"'Cinzel',serif",color:"#1a6a8b",marginLeft:5,letterSpacing:.5}}>2H</span>
                        )}
                      </span>
                      <span className="atk-bonus">{fmt(bonus)}</span>
                      <span className="atk-dmg">{dmg} {d.damageType.slice(0,4)}.</span>
                      {d.range && <span style={{fontSize:9,color:"var(--br)",fontFamily:"'Cinzel',serif"}}>{d.range}</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inventory list */}
      <div className="pg">
        <div className="st">⚔ Equipped & Carried</div>
        {(char.equipment||[]).length === 0
          ? <div style={{padding:"18px",textAlign:"center",color:"var(--br)",fontSize:12,fontStyle:"italic"}}>No equipment yet. Use starting equipment above or browse below.</div>
          : (char.equipment||[]).map(item=>{
              const d = EQUIPMENT_DB[item.name]||EQUIPMENT_DB[item.baseName];
              return (
                <div key={item.id} className={`eq-item${item.equipped?" equipped":""}`} style={{flexDirection:"column",alignItems:"flex-start",gap:4,padding:"7px 11px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,width:"100%"}}>
                    <div className={`equip-toggle${item.equipped?" on":""}`} onClick={()=>toggleEquip(item.id)} title={item.equipped?"Unequip":"Equip"}>
                      {item.equipped?"⚔":"○"}
                    </div>
                    <div className="eq-item-body">
                      <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                        <span className="eq-name" style={item.equipped?{color:"var(--cr)"}:{}}>{item.qty>1?`${item.qty}× `:""}{item.name}</span>
                        {(() => {
                          const d = EQUIPMENT_DB[item.name]||EQUIPMENT_DB[item.baseName];
                          if (!d) return null;
                          if (d.type==="armor" && d.armorType!=="shield") return <span className="eq-tag armor">{d.armorType} armor</span>;
                          if (d.armorType==="shield") return <span className="eq-tag shield">Shield +2</span>;
                          if (d.type==="weapon") return <span className="eq-tag weapon">{d.category||"Weapon"}</span>;
                          if (d.type==="gear") return <span className="eq-tag gear">{d.category||"Gear"}</span>;
                        })()}
                        {d?.stealthDis && <span style={{fontSize:7,fontFamily:"'Cinzel',serif",color:"#8b4a00",background:"rgba(139,74,0,.1)",border:"1px solid rgba(139,74,0,.3)",padding:"1px 4px",borderRadius:2}}>Stealth ⚠</span>}
                      </div>
                      {/* Stats row for weapons */}
                      {(() => {
                        const d = EQUIPMENT_DB[item.name]||EQUIPMENT_DB[item.baseName];
                        if (!d || d.type!=="weapon") return null;
                        const abilityUsed = d.finesse ? (aMod("DEX")>=aMod("STR")?"DEX":"STR") : d.weaponType==="ranged"?"DEX":"STR";
                        const bonus = calcAttackBonus(item, aMod("STR"), aMod("DEX"), PB);
                        const dmg = item.twoHanded && d.versatileDmg ? d.versatileDmg : d.damage;
                        const isVers = !!d.versatileDmg;
                        return (
                          <div className="eq-item-stats">
                            <span style={{fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:700,color:"var(--cr)"}}>{fmt(bonus)} to hit</span>
                            <span className="dmg-badge"
                              style={item.twoHanded && isVers ? {background:"rgba(26,106,139,.14)",color:"#1a6a8b",borderColor:"rgba(26,106,139,.35)"} : {}}>
                              {dmg} {d.damageType}
                              {item.twoHanded && isVers && <span style={{marginLeft:4,fontSize:8,opacity:.8}}>(two-handed)</span>}
                            </span>
                            {isVers && !item.twoHanded && (
                              <span className="dmg-badge" style={{background:"rgba(26,106,139,.08)",color:"rgba(26,106,139,.6)",borderColor:"rgba(26,106,139,.2)",fontSize:8}}>
                                {d.versatileDmg} with two hands
                              </span>
                            )}
                            {d.range && <span style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"var(--br)"}}>Range {d.range}</span>}
                            <span style={{fontSize:9,color:"var(--br)",fontFamily:"'Cinzel',serif"}}>{abilityUsed}{d.finesse?" (Finesse)":""}</span>
                          </div>
                        );
                      })()}
                      {/* Stats row for armor */}
                      {(() => {
                        const d = EQUIPMENT_DB[item.name]||EQUIPMENT_DB[item.baseName];
                        if (!d || d.type!=="armor" || d.armorType==="shield") return null;
                        const dex = aMod("DEX");
                        const isClothing = d.armorType==="clothing";
                        const isLight    = d.armorType==="light";
                        const isMedium   = d.armorType==="medium";
                        // Clothing and light both use full DEX
                        const acVal = (isLight||isClothing) ? d.acBase + dex
                                    : isMedium              ? d.acBase + Math.min(dex, 2)
                                    :                         d.acBase;
                        const formula = (isLight||isClothing) ? `${d.acBase} + DEX (${fmt(dex)})`
                                      : isMedium               ? `${d.acBase} + DEX max+2 (${fmt(Math.min(dex,2))})`
                                      :                          `${d.acBase} (no DEX)`;
                        return (
                          <div className="eq-item-stats">
                            <span style={{fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:700,color:"var(--cr)"}}>AC {item.equipped ? derivedAC : acVal}</span>
                            <span style={{fontSize:9,color:"var(--br)",fontFamily:"'Cinzel',serif"}}>{formula}</span>
                            {d.stealthDis && <span style={{fontSize:9,fontFamily:"'Cinzel',serif",color:"#8b4a00"}}>Stealth Disadvantage</span>}
                            {d.strReq>0 && <span style={{fontSize:9,fontFamily:"'Cinzel',serif",color:"var(--br)"}}>STR {d.strReq}+ required</span>}
                          </div>
                        );
                      })()}
                      {/* Properties */}
                      {(() => {
                        const d = EQUIPMENT_DB[item.name]||EQUIPMENT_DB[item.baseName];
                        if (!d?.properties?.length) return null;
                        return (
                          <div className="eq-db-props">
                            {d.properties.map(p=><PropTag key={p} name={p}/>)}
                          </div>
                        );
                      })()}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0}}>
                      {(() => {const d=EQUIPMENT_DB[item.name]||EQUIPMENT_DB[item.baseName]; return d?.weight?<span className="eq-stat" style={{fontSize:9}}>{d.weight}lb</span>:null;})()}
                      <button className="eq-del" onClick={()=>removeEquipmentItem(item.id)}>✕</button>
                    </div>
                  </div>
                </div>
              );
            })}
        }
      </div>

      {/* Equipment Browser */}
      <div className="pg">
        <div className="st">Browse & Add Equipment</div>
        <div className="eq-browser">
          {/* Type filter row */}
          <div className="eq-search-row">
            <input className="eq-search" placeholder="Search name…" value={eqSearch} onChange={e=>{setEqSearch(e.target.value);setEqCategory("all");}}/>
            {[["all","All"],["armor","Armour"],["weapon","Weapons"],["gear","Gear"]].map(([f,lbl])=>(
              <button key={f} className={`eq-filt${eqFilter===f?" ac":""}`} onClick={()=>{setEqFilter(f);setEqCategory("all");}}>
                {lbl}
              </button>
            ))}
          </div>
          {/* Category sub-filter — only when in Weapons or Gear */}
          {eqFilter==="weapon" && (
            <div className="eq-cat-row">
              <span className="eq-cat-lbl">Category:</span>
              {["all","Simple Melee","Simple Ranged","Martial Melee","Martial Ranged"].map(c=>(
                <button key={c} className={`eq-filt${eqCategory===c?" ac":""}`} style={{fontSize:7,padding:"2px 7px"}} onClick={()=>setEqCategory(c)}>
                  {c==="all"?"All":c}
                </button>
              ))}
            </div>
          )}
          {eqFilter==="gear" && (
            <div className="eq-cat-row">
              <span className="eq-cat-lbl">Category:</span>
              {["all","Packs","Ammunition","Container","Light","Combat","Medicine","Tools","Spellcasting","Scholar","Clothing","Artisan Tools","Musical Instrument","Potion","Gaming Set","Supplies","Comfort"].map(c=>(
                <button key={c} className={`eq-filt${eqCategory===c?" ac":""}`} style={{fontSize:7,padding:"2px 7px"}} onClick={()=>setEqCategory(c)}>
                  {c==="all"?"All":c}
                </button>
              ))}
            </div>
          )}
          {/* Grid */}
          <div className="eq-grid">
            {Object.entries(EQUIPMENT_DB)
              .filter(([name,d])=>{
                if (eqFilter!=="all" && d.type!==eqFilter) return false;
                if (eqCategory!=="all" && d.category!==eqCategory) return false;
                if (eqSearch && !name.toLowerCase().includes(eqSearch.toLowerCase()) &&
                    !(d.category||"").toLowerCase().includes(eqSearch.toLowerCase())) return false;
                return true;
              })
              .sort(([a],[b])=>a.localeCompare(b))
              .map(([name,d])=>{
                const dmgColor = d.damageType==="Slashing"?"#c0392b":d.damageType==="Piercing"?"#8e44ad":d.damageType==="Bludgeoning"?"#2980b9":"#7f8c8d";
                const isVersatile = d.properties?.includes("Versatile");
                const isFinesse   = d.finesse || d.properties?.includes("Finesse");
                const isReach     = d.properties?.includes("Reach");
                const isThrown    = d.properties?.some(p=>p.startsWith("Thrown"));
                const acDisplay   = d.armorType==="shield"?"+2 (Shield)":
                                    (d.armorType==="clothing"||d.armorType==="light")?`${d.acBase} + DEX (light)`:
                                    d.armorType==="medium"?`${d.acBase} + DEX max+2 (med)`:
                                    d.acBase!=null?`${d.acBase} (heavy)`:"";
                return (
                  <div key={name} className="eq-db-item" onClick={()=>addEquipmentItem(name)}>
                    {d.category && <div className="eq-db-cat">{d.category}</div>}
                    <div className="eq-db-name">{name}</div>

                    {/* Weapon stats line */}
                    {d.type==="weapon" && (
                      <div className="eq-db-sub" style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                        <span style={{color:dmgColor,fontWeight:700}}>{d.damage}</span>
                        <span style={{color:dmgColor,opacity:.85}}>{d.damageType}</span>
                        {d.versatileDmg && <span style={{color:"#1a6a8b",fontStyle:"italic"}}>({d.versatileDmg} 2H)</span>}
                        <span style={{opacity:.7}}>·</span>
                        <span>{d.range ? `⟵ ${d.range}` : "Melee"}</span>
                        <span style={{opacity:.6}}>· {d.cost}</span>
                        {d.weight?<span style={{opacity:.5}}>· {d.weight}lb</span>:null}
                      </div>
                    )}

                    {/* Armour stats line */}
                    {d.type==="armor" && (
                      <div className="eq-db-sub">
                        <span style={{color:"var(--cr)",fontWeight:700}}>{acDisplay}</span>
                        <span style={{opacity:.6}}> · {d.cost}</span>
                        {d.stealthDis&&<span style={{color:"#8b4a00"}}> · Stealth ⚠</span>}
                        {d.strReq>0&&<span style={{opacity:.6}}> · STR {d.strReq}+</span>}
                      </div>
                    )}

                    {/* Gear description line */}
                    {d.type==="gear" && (
                      <div className="eq-db-sub" style={{lineHeight:1.4,fontFamily:"'IM Fell English',serif",fontSize:10,fontStyle:"italic",opacity:.85}}>
                        {d.desc?.length>80?d.desc.slice(0,78)+"…":d.desc}
                        <span style={{fontStyle:"normal",fontFamily:"'Cinzel',serif",opacity:.7}}> · {d.cost}{d.weight?` · ${d.weight}lb`:""}</span>
                      </div>
                    )}

                    {/* Property chips */}
                    {d.properties?.length>0 && (
                      <div className="eq-db-props">
                        {isFinesse  && <PropTag name="Finesse"/>}
                        {isVersatile&& <PropTag name="Versatile"/>}
                        {isReach    && <PropTag name="Reach"/>}
                        {isThrown   && <PropTag name={d.properties.find(p=>p.startsWith("Thrown"))}/>}
                        {d.properties.filter(p=>!["Finesse","Versatile","Reach"].includes(p)&&!p.startsWith("Thrown")&&!p.startsWith("Versatile (")).map(p=><PropTag key={p} name={p}/>)}
                      </div>
                    )}
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>

      {/* Coin purse */}
      <div className="pg">
        <div className="st">Coin Purse</div>
        <div className="cr">
          {[["cp","CP"],["sp","SP"],["ep","EP"],["gp","GP"],["pp","PP"]].map(([k,l])=>(
            <div key={k} className="cub">
              <div className="cul">{l}</div>
              <input className="cui" type="number" min="0" value={char[k]||0} onChange={e=>upd(k,+e.target.value)}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── FEAT MODAL ──────────────────────────────────────────────────────────────
  const renderFeatModal = () => {
    if (!featModal) return null;
    const feat = FEAT_DB[featModal];
    if (!feat) return null;
    const hasIt = (char?.feats||[]).includes(featModal);
    const isOrigin = feat.type === "origin";
    return (
      <div className="modal-overlay" onClick={()=>setFeatModal(null)}>
        <div className="feat-modal" onClick={e=>e.stopPropagation()}>
          <div className="feat-modal-hdr">
            <div>
              <div className="feat-modal-title">{featModal}</div>
              <span className={`feat-modal-type ${feat.type}`}>{isOrigin?"Origin Feat":"General Feat"}</span>
            </div>
            <button className="modal-close" onClick={()=>setFeatModal(null)}>✕</button>
          </div>
          {feat.prereq && feat.prereq!=="None" && (
            <div className="feat-modal-prereq">Prerequisite: {feat.prereq}</div>
          )}
          <div className="feat-modal-desc">{feat.desc}</div>
          {!isOrigin && char && (
            <div className="feat-modal-actions">
              {!hasIt
                ? <button className="btn-modal btn-learn" onClick={()=>{upd("feats",[...(char.feats||[]),featModal]);setFeatModal(null);}}>
                    ✦ Take this Feat
                  </button>
                : <button className="btn-modal btn-forget" onClick={()=>{upd("feats",(char.feats||[]).filter(f=>f!==featModal));setFeatModal(null);}}>
                    ✕ Remove Feat
                  </button>
              }
              <button className="btn-modal" style={{background:"transparent",border:"1px solid rgba(92,51,23,.3)",color:"var(--br)"}} onClick={()=>setFeatModal(null)}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── SPELL MODAL ────────────────────────────────────────────────────────────
  const renderModal = () => {
    if (!selectedSpell) return null;
    const d = SPELL_DETAILS[selectedSpell];
    const known = knownSpellNames.has(selectedSpell);
    const prepared = preparedSpellNames.has(selectedSpell);
    const school = d?.school || "";
    const col = SCHOOL_COL[school] || "#888";
    const canLearn = !!char && !!casterInfo;
    return (
      <div className="modal-overlay" onClick={()=>setSelectedSpell(null)}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div className="modal-hdr">
            <div>
              <div className="modal-title">{selectedSpell}</div>
              {d && <span className="school-badge" style={{background:col,marginTop:4}}>{school} · {d.lvl===0?"Cantrip":`Level ${d.lvl}`}</span>}
            </div>
            <button className="modal-close" onClick={()=>setSelectedSpell(null)}>✕</button>
          </div>
          {d && (
            <div className="modal-meta">
              {[["Casting Time",d.cast],["Range",d.range],["Duration",d.duration]].map(([l,v])=>(
                <div className="modal-meta-item" key={l}>
                  <span className="modal-meta-lbl">{l}</span>
                  <span className="modal-meta-val">{v}</span>
                </div>
              ))}
            </div>
          )}
          {d && <div className="modal-desc">{d.desc}</div>}
          {d?.upcast && <div className="modal-upcast"><span className="modal-upcast-lbl">At Higher Levels</span>{d.upcast}</div>}
          {canLearn && (
            <div className="modal-actions">
              {(() => {
                const d2 = SPELL_DETAILS[selectedSpell];
                const isCantrip = (d2?.lvl ?? 0) === 0;
                const lim = spellLimitInfo;
                const cantripBlocked = isCantrip && lim?.atMaxCantrips;
                const spellBlocked   = !isCantrip && lim?.type==="known" && lim?.atMax;
                const blocked = cantripBlocked || spellBlocked;
                const blockMsg = cantripBlocked
                  ? `Cantrip limit reached (${lim.learnedCantrip}/${lim.maxCantrips})`
                  : spellBlocked
                  ? `Spells known limit reached (${lim.learnedNonCantrip}/${lim.maxKnown})`
                  : null;
                return !known ? (
                  <>
                    <button className="btn-modal btn-learn"
                      disabled={!!blocked}
                      style={blocked?{opacity:.45,cursor:"not-allowed"}:{}}
                      onClick={()=>{ if(!blocked){learnSpell(selectedSpell);setSelectedSpell(null);} }}>
                      ✦ Learn Spell
                    </button>
                    {blockMsg && <div style={{fontSize:10,color:"var(--cr)",fontFamily:"'Cinzel',serif",textAlign:"center",marginTop:4}}>{blockMsg}</div>}
                  </>
                ) : (
                  <button className="btn-modal btn-forget" onClick={()=>{forgetSpell(selectedSpell);setSelectedSpell(null);}}>✕ Forget Spell</button>
                );
              })()}
              {known && d?.lvl > 0 && spellLimitInfo?.type !== "known" && (
                // Prepare/book casters toggle preparation; known casters auto-prepare on learn
                <button className="btn-modal btn-prep"
                  disabled={!prepared && !!spellLimitInfo?.atPrepLimit}
                  style={(!prepared && spellLimitInfo?.atPrepLimit)?{opacity:.45,cursor:"not-allowed"}:{}}
                  onClick={()=>{ if(prepared || !spellLimitInfo?.atPrepLimit) togglePrepared(selectedSpell); }}>
                  {prepared ? "★ Unprepare" : `☆ Prepare (${spellLimitInfo?.prepared??0}/${spellLimitInfo?.prepLimit??0})`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{CSS}</style>
      {/* Mobile overlay */}
      <div className={`roster-overlay${rosterOpen?" open":""}`} onClick={()=>setRosterOpen(false)}/>
      <div className="app">
        <div className={`roster${rosterOpen?" open":""}`}>
          <div className="rt" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 10px 7px"}}>
            <span>⚔ The Company ⚔</span>
            <button onClick={()=>setRosterOpen(false)} style={{background:"none",border:"none",color:"var(--gold)",fontSize:16,cursor:"pointer",padding:"0 2px",lineHeight:1}}>✕</button>
          </div>
          <div className="rorn">✦ ✦ ✦</div>
          <div className="rl">
            {characters.length===0&&<div style={{textAlign:"center",padding:"16px 9px",color:"rgba(200,149,42,.3)",fontStyle:"italic",fontSize:10,fontFamily:"'IM Fell English',serif"}}>No adventurers yet...</div>}
            {characters.map(c=>(
              <div key={c.id} className={`ri${activeId===c.id?" ac":""}`} onClick={()=>{loadChar(c.id);setRosterOpen(false);}}>
                <div className="rin">{c.name||"Unnamed Hero"}</div>
                <div className="ris">{c.species&&c.class?`${c.species} ${c.class}`:c.class||c.species||"—"}{c.level>1?` · Lv ${c.level}`:""}</div>
                <button className="rdel" onClick={e=>{e.stopPropagation();delChar(c.id);}}>✕</button>
              </div>
            ))}
          </div>
          <button className="bnew" onClick={()=>{newC();setRosterOpen(false);}}>✦ New Character ✦</button>
        </div>
        <div className="main">
          {char ? (
            <>
              <div className="hdr">
                <button className="mob-menu-btn" onClick={()=>setRosterOpen(true)} aria-label="Open character roster">☰</button>
                <span className="htitle">{char.name||"New Character"}</span>
                {char.class&&<span style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"var(--gold)",opacity:.6,letterSpacing:1.5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"30vw"}}>{char.class}{char.subclass?` · ${char.subclass}`:""}{char.level>0?` Lv ${char.level}`:""}</span>}
                <div style={{marginLeft:"auto",display:"flex",gap:7,alignItems:"center",flexShrink:0}}>
                  {exportError && (
                    <span style={{fontFamily:"'Cinzel',serif",fontSize:8,color:"var(--cr)",letterSpacing:.5,maxWidth:180,textAlign:"right"}} title={exportError}>
                      ⚠ {exportError.slice(0,60)}{exportError.length>60?"…":""}
                    </span>
                  )}
                  <button className="hprint" onClick={handleExportPDF} disabled={exporting}
                    style={{background:"rgba(200,149,42,.12)",borderColor:"var(--gold)",color:"var(--gold)",opacity:exporting?.6:1}}>
                    {exporting ? "⏳ Exporting…" : "⬇ Export PDF"}
                  </button>
                  <button className="hprint hprint-print" onClick={handlePrint} style={{fontSize:8,padding:"4px 10px",opacity:.6}}>🖨 Print</button>
                </div>
                <button className="hsave" onClick={()=>saveChar(char)}>✦ Save ✦</button>
              </div>
              <div className="tabs no-print">
                {[["stats","⚔ Attrs"],["spells","✦ Spells"],["equipment","⚜ Gear"],["notes","📜 Notes"]].map(([id,l])=>(
                  <button key={id} className={`tb${tab===id?" ac":""}`} onClick={()=>setTab(id)}>{l}</button>
                ))}
              </div>
              <div className="cnt">
                {printMode ? (
                  // Print mode: render all sections stacked
                  <>
                    {/* Print-only character header */}
                    <div style={{padding:"10px 14px 8px",borderBottom:"2px solid var(--gold)",marginBottom:8,display:"flex",alignItems:"baseline",gap:14,flexWrap:"wrap"}}>
                      <span style={{fontFamily:"'UnifrakturMaguntia',cursive",fontSize:28,color:"var(--gold)"}}>{char.name||"Unnamed Hero"}</span>
                      {char.class&&<span style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"var(--br)",letterSpacing:1}}>{char.species} {char.class}{char.subclass?` — ${char.subclass}`:""}{char.level?` · Level ${char.level}`:""}</span>}
                      {char.background&&<span style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"rgba(92,51,23,.6)",letterSpacing:.5}}>Background: {char.background}</span>}
                    </div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:3,color:"var(--br)",textTransform:"uppercase",padding:"6px 14px 2px",borderBottom:"1px solid rgba(92,51,23,.2)"}}>⚔ Attributes</div>
                    {renderStats()}
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:3,color:"var(--br)",textTransform:"uppercase",padding:"10px 14px 2px",borderBottom:"1px solid rgba(92,51,23,.2)"}}>⚜ Equipment</div>
                    {renderEquipment()}
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:3,color:"var(--br)",textTransform:"uppercase",padding:"10px 14px 2px",borderBottom:"1px solid rgba(92,51,23,.2)"}}>✦ Spells</div>
                    {renderSpells()}
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:3,color:"var(--br)",textTransform:"uppercase",padding:"10px 14px 2px",borderBottom:"1px solid rgba(92,51,23,.2)"}}>📜 Notes</div>
                    {renderNotes()}
                  </>
                ) : (
                  <>
                    {tab==="stats"&&renderStats()}
                    {tab==="spells"&&renderSpells()}
                    {tab==="equipment"&&renderEquipment()}
                    {tab==="notes"&&renderNotes()}
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="es">
              <div className="er">𝔻</div>
              <div className="et">Begin your legend</div>
              <div style={{marginTop:9,fontFamily:"'IM Fell English',serif",fontSize:12,fontStyle:"italic",opacity:.5}}>Create or select a character</div>
              <button className="bnew" style={{marginTop:18}} onClick={newC}>✦ Create New Character ✦</button>
              <button className="mob-menu-btn" style={{marginTop:10,display:"block",fontSize:13,fontFamily:"'Cinzel',serif",letterSpacing:1,color:"var(--gold)",opacity:.7}} onClick={()=>setRosterOpen(true)}>☰ Open Roster</button>
            </div>
          )}
        </div>
      </div>
      {renderModal()}
      {renderFeatModal()}
    </>
  );
}
