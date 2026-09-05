import base64
import json
import os
import time
import urllib.request
import websocket

CDP = 'http://127.0.0.1:9223'
URL = 'http://127.0.0.1:3000/'
OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def http_json(url, method='GET'):
    request = urllib.request.Request(url, method=method)
    with urllib.request.urlopen(request) as response:
        return json.load(response)


def run_viewport(width, height, name):
    target = http_json(f'{CDP}/json/new?{URL}', method='PUT')
    ws = websocket.create_connection(target['webSocketDebuggerUrl'], timeout=15, origin='http://127.0.0.1:9223')
    counter = 0

    def command(method, params=None):
        nonlocal counter
        counter += 1
        ws.send(json.dumps({'id': counter, 'method': method, 'params': params or {}}))
        while True:
            message = json.loads(ws.recv())
            if message.get('id') == counter:
                if 'error' in message:
                    raise RuntimeError(f"{method}: {message['error']}")
                return message.get('result', {})

    command('Page.enable')
    command('Runtime.enable')
    command('Emulation.setDeviceMetricsOverride', {
        'width': width,
        'height': height,
        'deviceScaleFactor': 1,
        'mobile': width <= 720,
    })
    command('Page.navigate', {'url': URL})
    time.sleep(1.2)
    command('Runtime.evaluate', {
        'expression': 'document.fonts.ready',
        'awaitPromise': True,
        'returnByValue': True,
    })

    expression = """(() => ({
      viewport: [innerWidth, innerHeight],
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1: document.querySelectorAll('h1').length,
      optionCards: document.querySelectorAll('.option-card').length,
      scopeItems: document.querySelectorAll('#scopeItems li').length,
      activeOption: document.querySelector('.option-card.active')?.dataset.option,
      price: document.getElementById('scopePrice')?.textContent,
      imagesComplete: [...document.images].every(img => img.complete && img.naturalWidth > 0),
      title: document.title
    }))()"""
    metrics = command('Runtime.evaluate', {'expression': expression, 'returnByValue': True})['result']['value']

    interaction = command('Runtime.evaluate', {
        'expression': """(() => {
          document.querySelector('[data-option="code"]').click();
          return {
            activeOption: document.querySelector('.option-card.active')?.dataset.option,
            price: document.getElementById('scopePrice')?.textContent,
            items: document.querySelectorAll('#scopeItems li').length,
            decision: document.getElementById('decisionRoute')?.textContent,
            whatsapp: document.getElementById('whatsappCta')?.href
          };
        })()""",
        'returnByValue': True,
    })['result']['value']

    screenshot = command('Page.captureScreenshot', {
        'format': 'png',
        'captureBeyondViewport': False,
        'fromSurface': True,
    })
    screenshot_path = os.path.join(OUT, f'qa-{name}.png')
    with open(screenshot_path, 'wb') as file:
        file.write(base64.b64decode(screenshot['data']))

    command('Runtime.evaluate', {
        'expression': "document.documentElement.style.scrollBehavior='auto'; document.querySelector('#opciones').scrollIntoView({behavior:'auto'}); true",
        'returnByValue': True,
    })
    time.sleep(1.0)
    options_shot = command('Page.captureScreenshot', {
        'format': 'png',
        'captureBeyondViewport': False,
        'fromSurface': True,
    })
    options_path = os.path.join(OUT, f'qa-{name}-options.png')
    with open(options_path, 'wb') as file:
        file.write(base64.b64decode(options_shot['data']))

    command('Runtime.evaluate', {
        'expression': "document.querySelector('.scope-card').scrollIntoView({behavior:'auto'}); true",
        'returnByValue': True,
    })
    time.sleep(1.0)
    scope_shot = command('Page.captureScreenshot', {
        'format': 'png',
        'captureBeyondViewport': False,
        'fromSurface': True,
    })
    scope_path = os.path.join(OUT, f'qa-{name}-scope.png')
    with open(scope_path, 'wb') as file:
        file.write(base64.b64decode(scope_shot['data']))

    ws.close()
    urllib.request.urlopen(urllib.request.Request(f"{CDP}/json/close/{target['id']}", method='PUT')).read()
    return {
        'metrics': metrics,
        'interaction': interaction,
        'screenshots': {'hero': screenshot_path, 'options': options_path, 'scope': scope_path},
    }


results = {
    'desktop': run_viewport(1440, 1000, 'desktop'),
    'mobile': run_viewport(390, 844, 'mobile'),
}

for key, result in results.items():
    metrics = result['metrics']
    interaction = result['interaction']
    assert metrics['overflow'] == 0, f'{key}: overflow={metrics["overflow"]}'
    assert metrics['h1'] == 1, f'{key}: h1={metrics["h1"]}'
    assert metrics['optionCards'] == 2, f'{key}: optionCards={metrics["optionCards"]}'
    assert metrics['scopeItems'] == 6, f'{key}: scopeItems={metrics["scopeItems"]}'
    assert metrics['imagesComplete'], f'{key}: broken image'
    assert interaction['activeOption'] == 'code', f'{key}: option toggle failed'
    assert interaction['price'] == '$ 3.500.000', f'{key}: price update failed: {interaction["price"]}'
    assert interaction['items'] == 6, f'{key}: code scope items={interaction["items"]}'
    assert interaction['decision'] == 'Desarrollo completo en código', f'{key}: decision did not update'
    assert 'wa.me/573216424600' in interaction['whatsapp'], f'{key}: whatsapp URL failed'

print(json.dumps(results, ensure_ascii=False, indent=2))
