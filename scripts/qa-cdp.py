import base64
import json
import os
import time
import urllib.request
import websocket

CDP = os.environ.get('CDP_URL', 'http://127.0.0.1:9223')
URL = os.environ.get('QA_URL', 'http://127.0.0.1:3000/')
OUT = os.environ.get('QA_OUT', os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.makedirs(OUT, exist_ok=True)


def http_json(url, method='GET'):
    request = urllib.request.Request(url, method=method)
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def normalize(value):
    return (value or '').replace('\u00a0', ' ').strip()


def run_viewport(width, height, name):
    target = http_json(f'{CDP}/json/new?{URL}', method='PUT')
    origin = CDP.replace('http://', 'http://').replace('https://', 'https://')
    ws = websocket.create_connection(target['webSocketDebuggerUrl'], timeout=20, origin=origin)
    counter = 0
    runtime_errors = []

    def command(method, params=None):
        nonlocal counter
        counter += 1
        ws.send(json.dumps({'id': counter, 'method': method, 'params': params or {}}))
        while True:
            message = json.loads(ws.recv())
            if message.get('method') == 'Runtime.exceptionThrown':
                runtime_errors.append(message.get('params', {}))
            if message.get('id') == counter:
                if 'error' in message:
                    raise RuntimeError(f"{method}: {message['error']}")
                return message.get('result', {})

    def evaluate(expression):
        return command('Runtime.evaluate', {
            'expression': expression,
            'returnByValue': True,
            'awaitPromise': True,
        })['result'].get('value')

    def screenshot(label):
        shot = command('Page.captureScreenshot', {
            'format': 'png',
            'captureBeyondViewport': False,
            'fromSurface': True,
        })
        output = os.path.join(OUT, f'qa-v2-{name}-{label}.png')
        with open(output, 'wb') as file:
            file.write(base64.b64decode(shot['data']))
        return output

    command('Page.enable')
    command('Runtime.enable')
    command('Emulation.setDeviceMetricsOverride', {
        'width': width,
        'height': height,
        'deviceScaleFactor': 1,
        'mobile': width <= 680,
    })
    command('Page.navigate', {'url': URL})
    time.sleep(1.3)
    evaluate('document.fonts.ready')

    base = evaluate("""(() => ({
      title: document.title,
      h1: document.querySelectorAll('h1').length,
      navButtons: document.querySelectorAll('header nav button').length,
      svg: document.querySelectorAll('svg').length,
      overflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
      imagesComplete: [...document.images].every(img => img.complete && img.naturalWidth > 0),
      benefit: document.body.innerText.includes('No volver a empezar'),
      hero: document.querySelector('h1')?.innerText,
      offenders: [...document.querySelectorAll('*')].filter(el => { const r = el.getBoundingClientRect(); return r.right > innerWidth + 1 || r.left < -1; }).slice(0, 12).map(el => ({tag:el.tagName, cls:el.className?.baseVal || el.className || '', left:Math.round(el.getBoundingClientRect().left), right:Math.round(el.getBoundingClientRect().right), width:Math.round(el.getBoundingClientRect().width)}))
    }))()""")
    hero_shot = screenshot('hero')

    evaluate("document.querySelectorAll('header nav button')[1].click(); true")
    time.sleep(.65)
    routes_state = evaluate("""(() => ({
      cards: document.querySelectorAll('.route-card').length,
      selected: document.querySelector('.route-card.active h3')?.innerText,
      price2m: document.body.innerText.includes('$ 2.000.000'),
      price35m: document.body.innerText.includes('$ 3.500.000'),
      overflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
      offenders: [...document.querySelectorAll('*')].filter(el => { const r = el.getBoundingClientRect(); return r.right > innerWidth + 1 || r.left < -1; }).slice(0, 12).map(el => ({tag:el.tagName, cls:el.className?.baseVal || el.className || '', left:Math.round(el.getBoundingClientRect().left), right:Math.round(el.getBoundingClientRect().right), width:Math.round(el.getBoundingClientRect().width)}))
    }))()""")
    evaluate("document.querySelectorAll('.route-card')[1].click(); true")
    time.sleep(.35)
    selected_code = evaluate("document.querySelector('.route-card.active h3')?.innerText")
    routes_shot = screenshot('routes')

    evaluate("document.querySelector('.routes-stage .primary-action').click(); true")
    time.sleep(.65)
    delivery_state = evaluate("""(() => ({
      heading: document.querySelector('.delivery-stage h2')?.innerText,
      steps: document.querySelectorAll('.process-visual g').length,
      route: document.querySelector('.delivery-strip strong')?.innerText,
      overflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth)
    }))()""")

    evaluate("document.querySelector('.delivery-stage .primary-action').click(); true")
    time.sleep(.65)
    decision_before = evaluate("""(() => ({
      active: document.querySelector('.checkout-routes button.active')?.innerText,
      price: document.querySelector('.checkout-price strong')?.innerText,
      input: !!document.querySelector('.hosting-toggle input'),
      whatsapp: document.querySelector('.checkout-card a')?.href,
      overflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth)
    }))()""")
    evaluate("document.querySelector('.hosting-toggle input').click(); true")
    time.sleep(.35)
    decision_after = evaluate("""(() => ({
      price: document.querySelector('.checkout-price strong')?.innerText,
      checked: document.querySelector('.hosting-toggle input')?.checked,
      whatsapp: document.querySelector('.checkout-card a')?.href
    }))()""")
    decision_shot = screenshot('decision')

    evaluate("document.querySelector('.checkout-details').click(); true")
    time.sleep(.5)
    drawer = evaluate("""(() => ({
      open: !!document.querySelector('.drawer'),
      items: document.querySelectorAll('.drawer-list li').length,
      terms: document.querySelectorAll('.drawer-terms p').length,
      price: document.querySelector('.drawer-price')?.innerText
    }))()""")
    drawer_shot = screenshot('drawer')

    health = http_json(URL.rstrip('/') + '/health')
    result = {
        'base': base,
        'routes': routes_state,
        'selectedCode': selected_code,
        'delivery': delivery_state,
        'decisionBefore': decision_before,
        'decisionAfter': decision_after,
        'drawer': drawer,
        'health': health,
        'runtimeErrors': len(runtime_errors),
        'screenshots': {
            'hero': hero_shot,
            'routes': routes_shot,
            'decision': decision_shot,
            'drawer': drawer_shot,
        },
    }

    ws.close()
    urllib.request.urlopen(urllib.request.Request(f"{CDP}/json/close/{target['id']}", method='PUT'), timeout=15).read()
    return result


results = {
    'desktop': run_viewport(1440, 1000, 'desktop'),
    'mobile': run_viewport(390, 844, 'mobile'),
}

print(json.dumps(results, ensure_ascii=False, indent=2))

for name, result in results.items():
    assert result['base']['title'] == 'Converge Group Corp · Propuesta Solvers'
    assert result['base']['h1'] == 1
    assert result['base']['navButtons'] == 4
    assert result['base']['svg'] >= 4
    assert result['base']['overflow'] == 0
    assert result['base']['imagesComplete']
    assert result['base']['benefit']
    assert result['routes']['cards'] == 2
    assert result['routes']['price2m'] and result['routes']['price35m']
    assert result['routes']['overflow'] == 0
    assert result['selectedCode'] == 'Desarrollar en código'
    assert result['delivery']['steps'] == 4
    assert result['delivery']['route'] == 'Desarrollar en código'
    assert result['delivery']['overflow'] == 0
    assert result['decisionBefore']['active'] == 'Desarrollar en código'
    assert normalize(result['decisionBefore']['price']) == '$ 3.500.000'
    assert result['decisionBefore']['input']
    assert 'wa.me/573216424600' in result['decisionBefore']['whatsapp']
    assert normalize(result['decisionAfter']['price']) == '$ 3.700.000'
    assert result['decisionAfter']['checked']
    assert 'hosting%20administrado' in result['decisionAfter']['whatsapp']
    assert result['drawer']['open'] and result['drawer']['items'] == 4 and result['drawer']['terms'] == 3
    assert result['health'] == {'ok': True, 'service': 'propuesta-converge-group', 'version': 2}
    assert result['runtimeErrors'] == 0
