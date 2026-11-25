declare module 'alpina:content' {
  export const guides: Record<string, string>
  export const usageNotes: Record<string, string>
  export const sources: Record<string, string>
  export const exampleCss: string
  export const sourceFiles: Record<string, string>
  export const loadPostalSource: () => Promise<string>
  export const componentFiles: Record<string, string[]>
  export const directorySources: import('./directory-source.js').DirectoryFile[]
  export const apiReference: Record<string, import('./api-reference.js').ApiEntry[]>
  export const release: { name: string; bytes: number; data: string }
  export const version: string
}
declare module 'alpina:atelier' {
  export function AtelierDirectory(): import('react').ReactElement
}
