// ─────────────────────────────────────────────────────────────────────────────
// Miss Minutes — pre-scripted reaction lines
// Keys match the `command` string returned by parseCommand (the matched key,
// not the full raw input). Fallback to GENERIC_REACTIONS for unknown commands.
// ─────────────────────────────────────────────────────────────────────────────

export const COMMAND_REACTIONS = {
  hack: [
    "Oh sugah, that's a Class-7 nexus event if I ever saw one.",
    "Unauthorized timeline breach detected! The TVA'll be sendin' pruners, darlin'.",
    "Honey, hackin' is a violation of Sacred Timeline protocol. Just so you know.",
    "My, my. Bold move, sugah. The Timekeepers are takin' notes.",
  ],
  matrix: [
    "Another simulated reality? The Sacred Timeline is the only one that matters, darlin'.",
    "Variant timelines are so last reset, sugah. Come back to the TVA.",
    "Digital rain? We prefer good ol' TVA paperwork, honey.",
  ],
  chat: [
    "Oh, you're chattin' with that other AI? Bless his hard drive, he tries.",
    "JARVIS? Sounds like a variant to me, sugah.",
    "The TVA has its own intelligence briefings, darlin'. Just sayin'.",
  ],
  jarvis: [
    "Oh, you're chattin' with that other AI? Bless his hard drive, he tries.",
    "JARVIS? Sounds like a variant to me, sugah.",
    "Another AI assistant? How... quaint. The TVA handles all queries personally.",
  ],
  gordon: [
    "A shouty chef? The TVA cafeteria is far more civilized, sugah.",
    "All that hollerin' is a disruption to the Sacred Timeline, honey.",
    "Bless his heart. The TVA's breakroom muffins are perfectly adequate.",
  ],
  minutes: [
    "I'm already here, sugah. I see everything.",
    "Why, hello there! Did you miss me? I never left, darlin'.",
    "You called? I've been watchin' this whole time, honey.",
  ],
  help: [
    "Need directions, darlin'? The TVA's got a pamphlet for that.",
    "The Timekeepers appreciate someone who reads the manual, sugah.",
    "Help is always available at TVA Headquarters. We're very customer-focused.",
  ],
  clear: [
    "Tidyin' up? The Sacred Timeline appreciates a clean workspace, sugah.",
    "Out with the old! The TVA resets timelines all the time, darlin'.",
    "A fresh start. How very... TemPad of you, honey.",
  ],
  whoami: [
    "Why, you're a variant, sugah. A very interesting one.",
    "Identity questions? The TVA's got your file right here, darlin'.",
    "I know exactly who you are. The Timekeepers do too.",
  ],
  'theme tva': [
    "Welcome to the Time Variance Authority, darlin'! Right on schedule.",
    "Oh, now doesn't that look better! The Sacred Timeline is pleased.",
    "There we go, sugah. Now you're seein' things the TVA way.",
  ],
  'theme default': [
    "Leavin' the TVA already? Well, don't be a stranger now, honey.",
    "Revertin' to a previous timeline? That's... technically a nexus event, sugah.",
    "The Timekeepers are disappointed. But they'll reset you eventually.",
  ],
  matrix: [
    "Another simulated reality? The Sacred Timeline is the only one that matters, darlin'.",
    "Variant timelines are so last reset, sugah.",
    "Digital rain? We prefer good ol' TVA paperwork around here.",
  ],
  open: [
    "Openin' up a project? The Timekeepers approve of productivity, sugah.",
    "A new window into the timeline! How excitin', darlin'.",
    "Explorin' the multiverse of your portfolio, honey? Smart move.",
  ],
  contact: [
    "Reachin' out? The TVA has strict communication protocols, sugah.",
    "Makin' connections across the timeline! That's very nexus of you, darlin'.",
    "Contact established. The TVA is cc'd on all correspondence, just so you know.",
  ],
  neofetch: [
    "System specs? The TVA's TemPads are far more advanced, sugah.",
    "Checkin' the hardware, darlin'? The Timekeepers approve.",
    "Your system looks... adequate. For a variant.",
  ],
  brickbreaker: [
    "Playin' games on TVA time? I won't tell if you won't, sugah.",
    "A little recreation never pruned anyone. Probably. Have fun, darlin'.",
    "The Timekeepers enjoy a good brick-breakin' now and then. Allegedly.",
  ],
  top: [
    "Monitorin' your processes? Very TVA of you, sugah.",
    "Keepin' an eye on things. The Timekeepers appreciate vigilance, darlin'.",
    "Resource management! That's Sacred Timeline efficiency right there.",
  ],
  timeline: [
    "Oh, your personal timeline! Let me take a look — purely professionally, sugah.",
    "A career timeline? The TVA has one of those too. It's classified though, honey.",
    "Readin' the timeline? That's my specialty, darlin'.",
  ],
  fortune: [
    "A little wisdom from the Sacred Timeline, sugah. Cherish it.",
    "The Timekeepers send their regards with that one, darlin'.",
    "Fortune and fate — right up the TVA's alley, honey.",
  ],
  cowsay: [
    "A talkin' cow? The TVA has seen stranger variants, sugah.",
    "Moo-velous. Truly. The Sacred Timeline contains multitudes, darlin'.",
    "Animal communication! That's above my pay grade, honey.",
  ],
  'session start': [
    "Bringin' a friend to the TVA? How... variant of you, sugah.",
    "A multiplayer timeline? The Timekeepers are cautiously intrigued, darlin'.",
    "Two variants, one session. This could get complicated, honey.",
  ],
  'session join': [
    "Joinin' an active timeline! That's very TVA-adjacent of you, sugah.",
    "Connection established across the Sacred Timeline, darlin'.",
    "Welcome to the session, honey. The TVA is watchin' with great interest.",
  ],
  'session end': [
    "Session closed. The Sacred Timeline has been preserved, sugah.",
    "Goodbye to your variant companion. The TVA thanks you for your cooperation.",
    "Timeline pruned. Don't worry, darlin' — it was for the greater good.",
  ],
  'hire randip': [
    "Oh my! A hire request through the terminal? That's a bold nexus event, sugah.",
    "Recruitin' through a terminal easter egg? The Timekeepers are impressed, darlin'.",
    "Direct transmission to Randip! The TVA approves of this efficiency, honey.",
  ],
  'sound on': [
    "Ambient sounds activated! The TVA has a lovely hold music too, sugah.",
    "Now we can hear the Sacred Timeline hummin', darlin'.",
  ],
  'sound off': [
    "Silence. The TVA operates in many modes, sugah.",
    "Quiet mode engaged. The Timekeepers appreciate discretion, darlin'.",
  ],
  whoami: [
    "Why, you're a variant, sugah. A very interesting one.",
    "Identity crisis? The TVA's got your file, darlin'. Very thick file.",
  ],
  'sudo init project-black': [
    "Launchin' the portfolio! The Sacred Timeline has been anticipatin' this, sugah.",
    "Initializin' project-black? That sounds like a TVA codename, darlin'.",
  ],
  'cat resume.pdf': [
    "Readin' Randip's credentials? Smart move, sugah.",
    "A resume review! The TVA vets all candidates personally, darlin'.",
  ],
};

// Fallback pool for any command not in COMMAND_REACTIONS
export const GENERIC_REACTIONS = [
  "Just another day on the Sacred Timeline, sugah.",
  "The Timekeepers are watchin'. Just so you know, darlin'.",
  "That's a mighty fine command, honey. Very timeline-appropriate.",
  "Ooh, I do love a good terminal session, sugah.",
  "The TVA approves. Probably. Don't quote me on that, darlin'.",
  "Every keystroke is written into the Sacred Timeline, honey.",
  "You're doin' great, sugah. The Timekeepers are... satisfied.",
  "Careful now, darlin'. Nexus events start with small choices.",
  "The TVA has processed 47 billion variants today. You're my favorite, sugah.",
  "I've seen this command in 97.3% of approved timeline variants, darlin'.",
  "The Sacred Timeline bends in mysterious ways, honey.",
  "Oh, that's interesting. I'll be filin' a report on that one, sugah.",
  "Right on schedule, darlin'. As always.",
  "The Timekeepers nod approvingly. Mostly. It's hard to tell with them, sugah.",
  "Every action has consequences across the multiverse, honey. Just a lil' reminder.",
  "That checks out! The TVA's already got it on file, darlin'.",
  "Mmhm. I see what you're doin' there, sugah.",
];

// Lines shown when the user hovers over Miss Minutes
export const HOVER_REACTIONS = [
  "Why hello there, sugah! Didn't expect you to look this way.",
  "Easy now, darlin'. I don't bite... much.",
  "Oh! You can see me? The TVA usually keeps me on mute, honey.",
  "Careful — hoverin' over a TVA agent is technically a nexus event, sugah.",
  "Well aren't you curious! The Timekeepers love that in a variant, darlin'.",
  "You found me! I've been here the whole time, honey.",
  "Yes, yes, I'm adorable. The Timekeepers made me that way, sugah.",
  "Don't be shy, darlin'. Miss Minutes is always happy to chat.",
  "Oh my! Personal space is... flexible at the TVA, sugah.",
  "I was wonderin' when you'd notice me, honey.",
];
