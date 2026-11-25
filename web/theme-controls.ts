import { defaultTheme, themeValues } from './theme-values.js'

const tools = document.querySelector<HTMLTemplateElement>('#theme-tools')!
tools.replaceWith(tools.content)
const copyTools = document.querySelector<HTMLTemplateElement>('#theme-copy')!
const copy = copyTools.content.querySelector('button')!
copyTools.replaceWith(copyTools.content)
const accent = document.querySelector<HTMLInputElement>('#theme-accent')!
const unit = document.querySelector<HTMLSelectElement>('#theme-unit')!
const mode = document.querySelector<HTMLSelectElement>('#theme-mode')!
const preview = document.querySelector<HTMLElement>('#theme-preview')!
const css = document.querySelector<HTMLTextAreaElement>('#theme-css')!
const feedback = document.querySelector<HTMLElement>('#copy-feedback')!
const reset = document.querySelector<HTMLButtonElement>('#theme-reset')!
const forcedColors = window.matchMedia('(forced-colors: active)')
const darkScheme = window.matchMedia('(prefers-color-scheme: dark)')
let useDefaultAccent = true

function score(ratio: number) {
  return ratio.toFixed(2) + ':1 · ' + (ratio >= 4.5 ? 'Pass' : 'Fail')
}
function update() {
  const theme = themeValues({ accent: accent.value, unit: Number(unit.value), mode: mode.value }, darkScheme.matches, useDefaultAccent)
  accent.value = theme.values['--al-accent']
  preview.dataset.alTheme = mode.value
  for (const [key, value] of Object.entries(theme.values)) {
    if (forcedColors.matches) preview.style.removeProperty(key)
    else preview.style.setProperty(key, value)
  }
  document.getElementById('button-contrast')!.textContent = score(theme.button)
  document.getElementById('text-contrast')!.textContent = score(theme.text)
  css.value = theme.css
  feedback.textContent = ''
  reset.disabled = accent.value === defaultTheme.accent && Number(unit.value) === defaultTheme.unit && mode.value === defaultTheme.mode
}
accent.addEventListener('input', () => { useDefaultAccent = false; update() })
unit.addEventListener('change', update)
mode.addEventListener('change', update)
forcedColors.addEventListener('change', update)
darkScheme.addEventListener('change', update)
reset.addEventListener('click', () => {
  accent.value = defaultTheme.accent
  useDefaultAccent = true
  unit.value = String(defaultTheme.unit)
  mode.value = defaultTheme.mode
  update()
  accent.focus()
})
copy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(css.value)
    feedback.textContent = 'CSS copied'
  } catch {
    css.focus()
    css.select()
    feedback.textContent = 'CSS selected. Use your device’s copy command.'
  }
})
update()
