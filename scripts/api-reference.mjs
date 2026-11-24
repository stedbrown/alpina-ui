import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const project = fileURLToPath(new URL('../', import.meta.url))
const concise = (node) => node.getText().replace(/\s+/g, ' ').trim()

function ownSymbol(checker, node) {
  const symbol = checker.getSymbolAtLocation(node)
  return symbol && symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol
}

// Resolve Alpina base interfaces and aliases while preserving React's Omit exclusions.
function nativeContracts(node, checker, local, seen = new Set()) {
  if (!node || seen.has(node)) return []
  seen.add(node)
  if (ts.isIntersectionTypeNode(node))
    return node.types.flatMap((part) => nativeContracts(part, checker, local, seen))
  const name = node.typeName ?? node.expression ?? node.qualifier
  if (!name) return []
  const key = name.getText()
  const args = node.typeArguments ?? []
  if (key === 'ForwardRefExoticComponent') return nativeContracts(args[0], checker, local, seen)
  if (key === 'RefAttributes') return []
  if (key === 'Omit' || key === 'Pick') {
    return nativeContracts(args[0], checker, local, seen).map(
      (base) => key + '<' + base + ', ' + concise(args[1]) + '>',
    )
  }
  if (key === 'ComponentPropsWithoutRef' || /HTMLAttributes$|^DetailedHTMLProps$/.test(key))
    return [concise(node).replaceAll('import("react").', '')]
  for (const decl of ownSymbol(checker, name)?.declarations ?? []) {
    if (!local(decl)) continue
    if (ts.isInterfaceDeclaration(decl))
      return (decl.heritageClauses ?? []).flatMap((clause) =>
        clause.types.flatMap((base) => nativeContracts(base, checker, local, seen)),
      )
    if (ts.isTypeAliasDeclaration(decl)) return nativeContracts(decl.type, checker, local, seen)
  }
  return []
}

// Read only defaults assigned literally by the exported component. Values derived from shared state
// or supplied by a caller remain unspecified. This also covers named functions inside forwardRef.
function componentDefaults(source) {
  const all = new Map()
  function visit(node) {
    let name, impl
    if (ts.isFunctionDeclaration(node)) {
      name = node.name?.text
      impl = node
    }
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      name = node.name.text
      const value = node.initializer
      if (value && ts.isCallExpression(value) && value.expression.getText() === 'forwardRef')
        impl = value.arguments[0]
      else if (value && ts.isArrowFunction(value)) impl = value
    }
    if (name && impl?.parameters?.[0] && ts.isObjectBindingPattern(impl.parameters[0].name)) {
      const defaults = new Map()
      for (const binding of impl.parameters[0].name.elements) {
        if (
          binding.initializer &&
          /^(?:true|false|null|'[^']*'|"[^"]*"|-?\d+(?:\.\d+)?|\[\])$/.test(
            binding.initializer.getText(),
          )
        )
          defaults.set((binding.propertyName ?? binding.name).getText(), binding.initializer.getText())
      }
      all.set(name, defaults)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return all
}

const help = {
  open: 'Apertura controllata dal chiamante.',
  defaultOpen: 'Apertura iniziale in modalità non controllata.',
  onOpenChange: 'Riceve il nuovo stato di apertura.',
  initialFocusRef: 'Assegna il focus iniziale a questo elemento quando è montato nella finestra.',
  'Toast.duration':
    'Durata in millisecondi. Il conto alla rovescia si ferma al passaggio del puntatore, con il focus e quando la pagina è nascosta.',
  'Tooltip.delay':
    'Attesa in millisecondi al passaggio del puntatore. Il focus da tastiera mostra subito il suggerimento.',
  'SwissDate.timeZone': 'Si applica alle istanze Date. Una data civile conserva il giorno indicato.',
  'CantonSelect.placeholder':
    'Aggiunge un’opzione vuota e disabilitata. Con required il modulo richiede una selezione.',
  'LocaleSelect.placeholder':
    'Aggiunge un’opzione vuota e disabilitata. Con required il modulo richiede una selezione.',
  'SwissAddressForm.onSave':
    'Riceve l’indirizzo validato. Restituisci fieldErrors per associare un messaggio ai singoli campi. È supportato anche il salvataggio asincrono.',
  'DataTable.rowKey': 'Restituisce una chiave stabile per ciascuna riga.',
  'DataTable.defaultSort': 'Ordinamento applicato inizialmente.',
  'Field.children': 'Passa al controllo gli attributi che collegano etichetta, istruzioni ed errore.',
}

function relatedTypes(declarations, checker, local) {
  const definitions = new Map()
  function collect(node) {
    if (ts.isTypeReferenceNode(node)) {
      const target = ownSymbol(checker, node.typeName)
      const decl = target?.declarations?.find(
        (d) => local(d) && (ts.isInterfaceDeclaration(d) || ts.isTypeAliasDeclaration(d)),
      )
      if (decl && !definitions.has(decl)) {
        const name = decl.name.text
        definitions.set(decl, null)
        let definition
        if (ts.isInterfaceDeclaration(decl)) {
          const fields = checker
            .getPropertiesOfType(checker.getDeclaredTypeOfSymbol(target))
            .flatMap((prop) => {
              const field = prop.declarations?.find((d) => local(d) && ts.isPropertySignature(d))
              if (!field?.type) return []
              collect(field.type)
              return ['  ' + concise(field)]
            })
          const generic = decl.typeParameters
            ? '<' + decl.typeParameters.map(concise).join(', ') + '>'
            : ''
          definition = 'interface ' + name + generic + ' {\n' + fields.join('\n') + '\n}'
        } else {
          const type = checker.getTypeFromTypeNode(decl.type)
          const literals =
            type.isUnion() && type.types.every((t) => t.isStringLiteral() || t.isNumberLiteral())
          const body = literals
            ? type.types.map((t) => checker.typeToString(t)).join(' | ')
            : concise(decl.type)
          definition = 'type ' + name + ' = ' + body
          if (!literals) collect(decl.type)
        }
        definitions.set(decl, { name, definition })
      }
    }
    ts.forEachChild(node, collect)
  }
  declarations.forEach(collect)
  return [...definitions.values()]
}

export async function buildApiReference() {
  const { items } = JSON.parse(await readFile(path.join(project, 'registry.json'), 'utf8'))
  const dist = path.join(project, 'dist')
  const file = (entry) => path.join(dist, entry.replace(/\.tsx$/, '.d.ts'))
  const program = ts.createProgram(
    items.map((item) => file(item.entry)),
    {
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      strict: true,
      target: ts.ScriptTarget.ES2022,
      skipLibCheck: true,
    },
  )
  const checker = program.getTypeChecker()
  const local = (node) => !path.relative(dist, node.getSourceFile().fileName).startsWith('..')
  const entries = {}
  for (const item of items) {
    const module = program.getSourceFile(file(item.entry))
    if (!module) throw new Error('Dichiarazione mancante per ' + item.name + '. Eseguire la build.')
    const source = await readFile(path.join(project, 'src', item.entry), 'utf8')
    const defaults = componentDefaults(
      ts.createSourceFile(item.entry, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX),
    )
    const components = []
    for (const symbol of checker.getExportsOfModule(checker.getSymbolAtLocation(module))) {
      if (!/^[A-Z]/.test(symbol.name) || !(symbol.flags & ts.SymbolFlags.Value)) continue
      const decl = symbol.valueDeclaration
      const call = checker.getTypeOfSymbolAtLocation(symbol, decl).getCallSignatures()[0]
      if (!call?.parameters[0]) continue
      const props = checker.getTypeOfSymbolAtLocation(call.parameters[0], decl)
      const fields = []
      const propertyTypes = []
      for (const prop of checker.getPropertiesOfType(props)) {
        const field = prop.declarations?.find((d) => local(d) && ts.isPropertySignature(d))
        if (!field?.type) continue
        const description =
          help[symbol.name + '.' + prop.name] ??
          help[prop.name] ??
          ts.displayPartsToString(prop.getDocumentationComment(checker))
        fields.push({
          name: prop.name,
          type: concise(field.type),
          required: !(prop.flags & ts.SymbolFlags.Optional),
          defaultValue: defaults.get(symbol.name)?.get(prop.name),
          description: description || undefined,
        })
        propertyTypes.push(field.type)
      }
      const syntax = ts.isFunctionDeclaration(decl) ? decl.parameters[0].type : decl.type
      let ref
      function findRef(node) {
        if ((node.qualifier ?? node.typeName)?.getText() === 'RefAttributes')
          ref = node.typeArguments?.[0]?.getText()
        ts.forEachChild(node, findRef)
      }
      findRef(syntax)
      components.push({
        name: symbol.name,
        props: fields,
        native: nativeContracts(syntax, checker, local),
        ref,
        generic: decl.typeParameters?.map(concise).join(', '),
        types: relatedTypes(propertyTypes, checker, local),
      })
    }
    if (!components.length) throw new Error('Nessuna firma React per ' + item.name)
    entries[item.name] = components
  }
  return entries
}
