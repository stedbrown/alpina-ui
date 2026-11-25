import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { chromium } from 'playwright-core'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Select } from 'alpina-ui'
import { openPublicPage, publicRoutes, siteOrigin } from './public-pages.mjs'

// Inspect painted controls. A clipped, focusable file input is deliberately kept
// in the accessibility tree. Authored Swiss-language examples are legitimate.
function browserChrome() {
  function painted(el) {
    if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false
    const css = getComputedStyle(el)
    const rect = el.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0 &&
      !(rect.width <= 1 && rect.height <= 1 && (css.clipPath !== 'none' || css.clip !== 'auto'))
  }
  const leaks = []
  for (const el of document.querySelectorAll('input,select,details,form')) {
    if (el instanceof HTMLFormElement) {
      if (!el.noValidate && [...el.elements].some(input => input.willValidate && (input.required ||
        ['email', 'url', 'number'].includes(input.type) || input.pattern))) leaks.push('native validation bubble')
      continue
    }
    if (!painted(el)) continue
    if (el instanceof HTMLSelectElement) {
      if (!el.multiple && el.size <= 1 && getComputedStyle(el).appearance !== 'base-select') leaks.push('system popup select')
    } else if (el instanceof HTMLDetailsElement) {
      if (!el.querySelector(':scope > summary')) leaks.push('default disclosure label')
    } else if (['date', 'datetime-local', 'month', 'time', 'week', 'file', 'color'].includes(el.type)) {
      leaks.push('visible native ' + el.type)
    } else if (['submit', 'reset'].includes(el.type) && !el.hasAttribute('value')) {
      leaks.push('default ' + el.type + ' label')
    } else if (el.type === 'number' && getComputedStyle(el).appearance !== 'textfield') {
      leaks.push('native number arrows')
    }
  }
  return leaks
}

function shadowText(node) {
  return [node.nodeType === 3 ? node.nodeValue : '', ...(node.children ?? []).flatMap(shadowText),
    ...(node.shadowRoots ?? []).flatMap(shadowText)].filter(Boolean)
}

async function languageProbe(page, language) {
  await page.setContent('<html lang="en"><form><input required><input type="file"></form></html>')
  const cdp = await page.context().newCDPSession(page)
  const { root } = await cdp.send('DOM.getDocument', { depth: -1, pierce: true })
  await cdp.detach()
  const words = shadowText(root).join(' ')
  const validity = await page.locator('[required]').evaluate(el => el.validationMessage)
  assert.match(words, language === 'de' ? /Datei.*(auswählen|wählen)/i : /choisir un fichier/i,
    'Full Chromium must actually paint its file chooser in ' + language + ': ' + words)
  assert.match(validity, language === 'de' ? /feld/i : /champ/i)
  assert.deepEqual(await page.evaluate(browserChrome), ['native validation bubble', 'visible native file'])
}

// Playwright's small headless shell can report a localized navigator.language
// while loading English UI resources. Use the full Chromium with its .pak files.
for (const language of ['de', 'fr']) {
  const configured = process.env.ALPINA_LOCALE_CHROMIUM
  const browser = await chromium.launch({
    ...(configured ? { executablePath: configured } : { channel: existsSync(chromium.executablePath()) ? 'chromium' : 'chrome' }),
    args: ['--lang=' + language],
    env: { ...process.env, LANGUAGE: language, LANG: language + '_' + language.toUpperCase() + '.UTF-8' },
  })
  try {
    const page = await openPublicPage(browser)
    await languageProbe(page, language)
    const routes = await publicRoutes()
    for (const route of routes) {
      await page.goto(siteOrigin + route)
      if (/^\/docs\/components\/.+\/$/.test(route)) await page.locator('.al-preview-content > *').first().waitFor()
      if (route.startsWith('/docs/') || route === '/catalog.html') {
        const edition = /^\/docs\/guides\/(?:start|swiss)\/(de|fr|it)\/$/.exec(route)
        assert.equal(await page.locator('html').getAttribute('lang'), edition?.[1] ?? 'en', route)
      }
      assert.deepEqual(await page.evaluate(browserChrome), [], language + ' · ' + route)
    }

    await page.goto(siteOrigin + '/catalog.html#qr-bill-scanner')
    await page.locator('.al-preview-content input[type=file]').first().waitFor({ state: 'attached' })
    assert.deepEqual(await page.evaluate(browserChrome), [], language + ' · offline scanner')
    await page.goto(siteOrigin + '/themes/')
    const unit = page.getByLabel('Grid unit')
    await unit.click()
    assert.ok(await unit.evaluate(el => el.matches(':open') &&
      getComputedStyle(el, '::picker(select)').appearance === 'base-select'))
    await page.keyboard.press('Escape')
    const color = page.getByLabel('Accent color')
    await color.fill('#12')
    await color.press('Tab')
    await page.getByText('Enter a color in the form #rrggbb.').waitFor()
    assert.doesNotMatch(await page.getByLabel('CSS variables').inputValue(), /#12[;}]/)
    await color.fill('#123456')
    assert.match(await page.getByLabel('CSS variables').inputValue(), /#123456/)
    await page.goto(siteOrigin + '/blocks/login/')
    const login = page.getByRole('form', { name: 'Account sign-in' })
    await login.getByLabel('Email address').fill('invalid')
    await login.getByRole('button', { name: 'Sign in', exact: true }).click()
    await login.getByText('Enter a valid email address.').waitFor()
    assert.equal(await login.getByLabel('Email address').evaluate(el => el === document.activeElement), true)
    await login.getByLabel('Email address').fill('test@example.org')
    await login.getByRole('button', { name: 'Sign in', exact: true }).click()
    await login.getByText('Enter your password.').waitFor()

    // Force the older-picker JS branch while keeping Chromium's native keyboard
    // listbox implementation. The source control must keep submitting its value.
    await page.addInitScript(() => {
      const supports = CSS.supports.bind(CSS)
      CSS.supports = (...args) => args.join(' ').includes('base-select') ? false : supports(...args)
    })
    await page.goto(siteOrigin + '/themes/')
    await page.waitForLoadState('networkidle')
    await unit.focus()
    await unit.press('ArrowDown')
    const list = page.getByRole('listbox', { name: 'Grid unit' })
    await list.waitFor()
    await list.press('End')
    await list.press('Escape')
    assert.equal(await unit.inputValue(), '4')
    await unit.press('Space')
    await list.press('End')
    await list.press('Enter')
    assert.equal(await unit.inputValue(), '6')
    assert.match(await page.getByLabel('CSS variables').inputValue(), /0\.375rem/)
    assert.ok(await unit.evaluate(el => document.activeElement === el))
    await page.evaluate(() => {
      const form = document.createElement('form')
      form.innerHTML = '<button type="button">Previous field</button><label for="paper">Paper size</label><select id="paper" name="paper" class="al-select">' +
        '<option selected>A5</option><optgroup label="Unavailable" disabled><option>A4</option></optgroup>' +
        '<option>A3</option></select><button type="button">Next field</button>'
      document.body.append(form)
    })
    const paper = page.getByLabel('Paper size', { exact: true })
    await paper.click()
    const options = page.getByRole('listbox', { name: 'Paper size' })
    assert.equal(await options.getByRole('option', { name: 'A4' }).isDisabled(), true)
    await options.press('ArrowDown')
    await options.press('Tab')
    assert.equal(await paper.evaluate(el => new FormData(el.form).get('paper')), 'A3')
    assert.ok(await page.getByRole('button', { name: 'Next field' }).evaluate(el => document.activeElement === el))
    await paper.press('Space')
    await options.press('Shift+Tab')
    assert.ok(await page.getByRole('button', { name: 'Previous field' }).evaluate(el => document.activeElement === el))
    await paper.evaluate(el => el.form.reset())
    assert.equal(await paper.inputValue(), 'A5')

    // A hydrated controlled CantonSelect must receive the same committed change.
    await page.goto(siteOrigin + '/docs/components/canton-select/')
    await page.waitForLoadState('networkidle')
    const canton = page.getByRole('combobox', { name: 'Canton', exact: true })
    await canton.press('Space')
    const cantons = page.getByRole('listbox', { name: 'Canton', exact: true })
    await cantons.press('Home')
    assert.equal(await canton.inputValue(), 'TI')
    await cantons.press('Escape')
    assert.equal(await canton.inputValue(), 'TI')
    await canton.press('ArrowDown')
    await cantons.press('End')
    await cantons.press('Enter')
    assert.equal(await canton.inputValue(), 'JU')
    await page.locator('.al-preview-content output').filter({ hasText: /^Giura$/ }).waitFor()

    // Raw HTML from an SSR page submits and resets with JavaScript disabled.
    const plain = await browser.newPage({ javaScriptEnabled: false })
    await plain.setContent(renderToStaticMarkup(createElement('form', null,
      createElement('label', null, 'Region', createElement(Select, { name: 'region' },
        createElement('option', null, 'Zürich'), createElement('option', null, 'Genève'))))))
    await plain.getByLabel('Region').selectOption('Genève')
    assert.equal(await plain.locator('form').evaluate(form => new FormData(form).get('region')), 'Genève')
    await plain.close()
    await page.close()
    console.log(language + ': verified Chromium UI resources, ' + routes.length + ' public routes, both pickers and authored validation.')
  } finally {
    await browser.close()
  }
}
