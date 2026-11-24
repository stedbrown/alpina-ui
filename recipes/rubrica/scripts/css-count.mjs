import {readFile} from 'node:fs/promises'
const source=await readFile(new URL('../src/rubrica.css',import.meta.url),'utf8')
const css=source.replace(/\/\*[\s\S]*?\*\//g,'')
const rules=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([,selector,body])=>({selector:selector.trim().replace(/\s+/g,' '),declarations:body.split(';').filter(s=>s.trim()).length}))
const lines=source.trimEnd().split(/\r?\n/).length
console.log(JSON.stringify({file:'src/rubrica.css',lines,rules:rules.length,declarations:rules.reduce((n,r)=>n+r.declarations,0),detail:rules},null,2))
