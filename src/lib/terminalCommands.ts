export type CommandResult =
  | { type: 'text'; content: string }
  | { type: 'clear' }
  | { type: 'ai' }

const COMMANDS: Record<string, () => CommandResult> = {
  help: () => ({
    type: 'text',
    content: `Available commands:
  help        Show this help message
  whoami      Display owner info
  ls          List portfolio contents
  skills      List technical skills
  projects    List projects
  contact     Show contact info
  clear       Clear terminal

Any other input is sent to the AI assistant.`,
  }),

  whoami: () => ({
    type: 'text',
    content: 'Demetre Nutsubidze — Front End Developer\ndemetrenutsubidze423@gmail.com',
  }),

  ls: () => ({
    type: 'text',
    content: `drwxr-xr-x  projects/
drwxr-xr-x  skills/
-rw-r--r--  resume.pdf        (124 KB)
-rw-r--r--  about_me.txt      (1.2 KB)
-rw-r--r--  contact.lnk`,
  }),

  skills: () => ({
    type: 'text',
    content: `Frontend:  React · Angular · Next.js · TypeScript · JavaScript
Styling:   HTML · CSS · Tailwind CSS
Animation: Framer Motion · Three.js
Tools:     Git · npm · VS Code`,
  }),

  projects: () => ({
    type: 'text',
    content: `[1] project_one/      — placeholder
[2] project_two/      — placeholder
[3] project_three/    — placeholder

Double-click "My Projects" icon to browse.`,
  }),

  contact: () => ({
    type: 'text',
    content: 'Email: demetrenutsubidze423@gmail.com\nDouble-click the "Contact" icon to send a message.',
  }),

  clear: () => ({ type: 'clear' }),
}

export function runCommand(input: string): CommandResult {
  const cmd = input.trim().toLowerCase().split(' ')[0]
  if (cmd in COMMANDS) return COMMANDS[cmd]()
  return { type: 'ai' }
}
