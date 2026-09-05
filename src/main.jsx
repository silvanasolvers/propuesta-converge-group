import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion } from 'motion/react';
import './styles.css';

const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const views = [
  { id: 'value', label: 'Por qué' },
  { id: 'routes', label: 'Rutas' },
  { id: 'delivery', label: 'Entrega' },
  { id: 'decision', label: 'Decidir' },
];

const routes = {
  framer: {
    eyebrow: 'RUTA 01 · RECOMENDADA PARA SALIR YA',
    name: 'Finalizar en Framer',
    short: 'Aprovechar lo construido y ponerlo a trabajar.',
    price: 2_000_000,
    time: 'Hasta 7 días hábiles',
    revisions: '2 rondas',
    benefits: ['No pierden el avance actual', 'Menor inversión para publicar', 'Una experiencia lista en todos los tamaños'],
    deliverables: ['Cierre de páginas existentes', 'Responsive y navegación', 'Formularios, CTA y SEO esencial', 'Pruebas y publicación en Framer'],
    note: 'El plan de publicación de Framer se paga directamente a la plataforma.',
    message: 'Hola Solvers, queremos avanzar con la finalización en Framer para Converge Group Corp.',
  },
  code: {
    eyebrow: 'RUTA 02 · MAYOR CONTROL',
    name: 'Desarrollar en código',
    short: 'Convertir la dirección visual en un activo propio.',
    price: 3_500_000,
    time: 'Hasta 15 días hábiles',
    revisions: '3 rondas',
    benefits: ['Código y repositorio propios', 'Mejor base para crecer', 'Menos dependencia del editor visual'],
    deliverables: ['Todas las páginas definidas al inicio', 'Componentes responsive propios', 'Formularios, analítica y SEO técnico', 'Pruebas, repositorio y despliegue'],
    note: 'Puede usar hosting administrado por Solvers por $200.000 COP al año.',
    message: 'Hola Solvers, queremos avanzar con el desarrollo completo en código para Converge Group Corp.',
  },
};

function Arrow({ direction = 'right' }) {
  const rotate = direction === 'left' ? 180 : direction === 'down' ? 90 : 0;
  return <svg viewBox="0 0 24 24" aria-hidden="true" style={{ transform: `rotate(${rotate}deg)` }}><path d="M4 12h15M13 6l6 6-6 6" /></svg>;
}

function CheckIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>;
}

function ValueVisual() {
  return <div className="value-visual" aria-label="Diagrama: de página pendiente a página lista para operar">
    <svg viewBox="0 0 620 500" role="img">
      <title>De proyecto pendiente a presencia digital activa</title>
      <defs>
        <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" opacity=".18" /></pattern>
      </defs>
      <rect x="1" y="1" width="618" height="498" className="frame" />
      <rect x="1" y="1" width="618" height="498" fill="url(#dots)" />
      <text x="30" y="42" className="svg-micro">ESTADO / TRANSICIÓN</text>
      <g transform="translate(34 88)">
        <rect width="188" height="118" className="node muted-node" />
        <text x="18" y="27" className="svg-code">01 · HOY</text>
        <text x="18" y="67" className="svg-title">PENDIENTE</text>
        <path d="M18 87h98M18 99h65" className="muted-stroke" />
      </g>
      <motion.path d="M223 147H397" className="flow-line" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: 'easeInOut' }} />
      <motion.circle r="6" cy="147" className="pulse" animate={{ cx: [238, 382] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }} />
      <g transform="translate(398 88)">
        <rect width="188" height="118" className="node live-node" />
        <text x="18" y="27" className="svg-code live-text">02 · RESULTADO</text>
        <text x="18" y="67" className="svg-title">PUBLICADA</text>
        <path d="M18 87h98M18 99h132" className="live-stroke" />
      </g>
      <g transform="translate(34 254)">
        <rect width="552" height="188" className="benefit-box" />
        <text x="22" y="34" className="svg-code">LO QUE CAMBIA</text>
        <g transform="translate(22 62)">
          <circle cx="18" cy="18" r="18" className="benefit-icon" />
          <path d="M10 19h16M20 13l6 6-6 6" className="dark-stroke" />
          <text x="50" y="15" className="svg-benefit">PRESENTAR</text>
          <text x="50" y="34" className="svg-detail">una empresa terminada</text>
        </g>
        <g transform="translate(200 62)">
          <circle cx="18" cy="18" r="18" className="benefit-icon" />
          <path d="M10 18h16M18 10v16" className="dark-stroke" />
          <text x="50" y="15" className="svg-benefit">GENERAR</text>
          <text x="50" y="34" className="svg-detail">más confianza</text>
        </g>
        <g transform="translate(378 62)">
          <circle cx="18" cy="18" r="18" className="benefit-icon" />
          <path d="M10 25 17 14l6 5 8-12" className="dark-stroke" />
          <text x="50" y="15" className="svg-benefit">CAPTURAR</text>
          <text x="50" y="34" className="svg-detail">oportunidades</text>
        </g>
        <line x1="22" y1="130" x2="530" y2="130" className="muted-stroke" />
        <text x="22" y="161" className="svg-foot">DE PROYECTO ABIERTO</text>
        <text x="530" y="161" textAnchor="end" className="svg-foot live-text">A ACTIVO COMERCIAL</text>
      </g>
    </svg>
  </div>;
}

function RouteIcon({ type }) {
  if (type === 'framer') return <svg className="route-icon" viewBox="0 0 80 80" aria-hidden="true"><path d="M18 14h42L42 33h18L30 66V43H18z" /><path d="M18 14 42 33M30 66l12-33" /></svg>;
  return <svg className="route-icon" viewBox="0 0 80 80" aria-hidden="true"><path d="m29 20-19 20 19 20M51 20l19 20-19 20M46 12 34 68" /></svg>;
}

function ProcessVisual({ route }) {
  const labels = route === 'framer'
    ? ['ACCESO', 'CIERRE', 'REVISIÓN', 'PUBLICAR']
    : ['ALCANCE', 'CONSTRUIR', 'REVISIÓN', 'DESPLEGAR'];
  return <div className="process-visual">
    <svg viewBox="0 0 760 230" role="img" aria-label="Proceso de entrega en cuatro pasos">
      <path d="M88 112H672" className="process-line" />
      {labels.map((label, index) => {
        const x = 88 + index * 194.6;
        return <g key={label} transform={`translate(${x} 112)`}>
          <motion.circle r="29" className={index === 3 ? 'process-node final' : 'process-node'} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: index * .13 }} />
          <text y="5" textAnchor="middle" className="process-index">0{index + 1}</text>
          <text y="65" textAnchor="middle" className="process-label">{label}</text>
        </g>;
      })}
      <motion.circle r="5" cy="112" className="pulse" animate={{ cx: [88, 672] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }} />
    </svg>
  </div>;
}

function ValueView({ goNext }) {
  return <motion.section className="stage value-stage" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }} transition={{ duration: .42 }}>
    <div className="copy-block">
      <span className="eyebrow"><i /> PROPUESTA PARA CONVERGE GROUP CORP</span>
      <h1>Lo que ya construyeron tiene que empezar a <em>vender.</em></h1>
      <p className="lead">Terminar ahora protege lo invertido y convierte una página pendiente en una presencia lista para generar confianza y oportunidades.</p>
      <div className="benefit-pills">
        <span>Salir más rápido</span><span>No volver a empezar</span><span>Verse listos</span>
      </div>
      <button className="primary-action" onClick={goNext}>Ver las rutas <Arrow /></button>
    </div>
    <ValueVisual />
  </motion.section>;
}

function RoutesView({ selected, setSelected, goNext, openDetails }) {
  return <motion.section className="stage routes-stage" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }} transition={{ duration: .42 }}>
    <div className="compact-heading">
      <div><span className="eyebrow">02 / DOS RUTAS</span><h2>Elegir cuánto invertir.<br />No si la página sale.</h2></div>
      <p>La ruta directa cuida el presupuesto. La ruta propia compra más control.</p>
    </div>
    <div className="route-grid">
      {Object.entries(routes).map(([key, item]) => {
        const active = selected === key;
        return <motion.button layout className={`route-card ${active ? 'active' : ''}`} onClick={() => setSelected(key)} key={key} aria-pressed={active}>
          {active && <motion.span layoutId="activeRoute" className="active-outline" />}
          <div className="route-card-head"><RouteIcon type={key} /><span>{item.eyebrow}</span></div>
          <h3>{item.name}</h3>
          <p>{item.short}</p>
          <ul>{item.benefits.map((benefit) => <li key={benefit}><CheckIcon />{benefit}</li>)}</ul>
          <div className="route-bottom"><strong>{COP.format(item.price).replace('COP', '').trim()}</strong><span>COP</span><b>{active ? 'SELECCIONADA' : 'ELEGIR'}</b></div>
        </motion.button>;
      })}
    </div>
    <div className="stage-actions">
      <button className="text-action" onClick={openDetails}>Ver alcance completo</button>
      <button className="primary-action" onClick={goNext}>Continuar con {selected === 'framer' ? 'Framer' : 'código'} <Arrow /></button>
    </div>
  </motion.section>;
}

function DeliveryView({ selected, setSelected, goNext, openDetails }) {
  const item = routes[selected];
  return <motion.section className="stage delivery-stage" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }} transition={{ duration: .42 }}>
    <div className="compact-heading delivery-heading">
      <div><span className="eyebrow">03 / ENTREGA</span><h2>De pendiente a publicada.<br />Sin vueltas.</h2></div>
      <div className="route-switch" aria-label="Cambiar ruta">
        <button className={selected === 'framer' ? 'active' : ''} onClick={() => setSelected('framer')}>FRAMER</button>
        <button className={selected === 'code' ? 'active' : ''} onClick={() => setSelected('code')}>CÓDIGO</button>
      </div>
    </div>
    <ProcessVisual route={selected} />
    <div className="delivery-strip">
      <div><span>RUTA</span><strong>{item.name}</strong></div>
      <div><span>TIEMPO</span><strong>{item.time}</strong></div>
      <div><span>REVISIONES</span><strong>{item.revisions}</strong></div>
      <div><span>RESULTADO</span><strong>Página operativa</strong></div>
    </div>
    <div className="stage-actions">
      <button className="text-action" onClick={openDetails}>Qué recibimos exactamente</button>
      <button className="primary-action" onClick={goNext}>Ver inversión final <Arrow /></button>
    </div>
  </motion.section>;
}

function DecisionView({ selected, setSelected, hosting, setHosting, openDetails }) {
  const item = routes[selected];
  const hostingPrice = selected === 'code' && hosting ? 200_000 : 0;
  const total = item.price + hostingPrice;
  const firstPayment = item.price / 2;
  const message = `${item.message}${hostingPrice ? ' También queremos incluir el hosting administrado anual.' : ''}`;
  const whatsapp = `https://wa.me/573216424600?text=${encodeURIComponent(message)}`;
  return <motion.section className="stage decision-stage" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }} transition={{ duration: .42 }}>
    <div className="decision-copy">
      <span className="eyebrow">04 / DECIDIR</span>
      <h2>La inversión no compra páginas.<br />Compra una empresa <em>lista para mostrarse.</em></h2>
      <div className="mini-proof"><span><CheckIcon /> Protege el avance</span><span><CheckIcon /> Cierra pendientes</span><span><CheckIcon /> Activa la presencia</span></div>
    </div>
    <div className="checkout-card">
      <div className="checkout-head"><span>CONFIGURACIÓN ACTIVA</span><i /></div>
      <div className="checkout-routes">
        <button className={selected === 'framer' ? 'active' : ''} onClick={() => { setSelected('framer'); setHosting(false); }}>Finalizar en Framer</button>
        <button className={selected === 'code' ? 'active' : ''} onClick={() => setSelected('code')}>Desarrollar en código</button>
      </div>
      <div className="checkout-price"><span>INVERSIÓN</span><AnimatePresence mode="wait"><motion.strong key={total} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>{COP.format(total).replace('COP', '').trim()}</motion.strong></AnimatePresence><small>COP · PAGO ÚNICO</small></div>
      {selected === 'code' && <motion.label className="hosting-toggle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><input type="checkbox" checked={hosting} onChange={(event) => setHosting(event.target.checked)} /><span className="toggle-ui"><i /></span><span><b>Hosting administrado</b><small>+$200.000 COP / año</small></span></motion.label>}
      <div className="payment-line"><span>PARA INICIAR · 50%</span><strong>{COP.format(firstPayment).replace('COP', '').trim()}</strong></div>
      <a className="primary-action full" href={whatsapp} target="_blank" rel="noopener">Aprobar esta ruta <Arrow /></a>
      <button className="checkout-details" onClick={openDetails}>Revisar alcance y condiciones</button>
    </div>
  </motion.section>;
}

function DetailDrawer({ selected, close }) {
  const item = routes[selected];
  return <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
    <motion.aside className="drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 260 }} onClick={(event) => event.stopPropagation()} aria-modal="true" role="dialog" aria-label="Alcance completo">
      <button className="drawer-close" onClick={close} aria-label="Cerrar">×</button>
      <span className="eyebrow">ALCANCE / {selected === 'framer' ? 'RUTA 01' : 'RUTA 02'}</span>
      <h2>{item.name}</h2>
      <strong className="drawer-price">{COP.format(item.price).replace('COP', '').trim()} <small>COP</small></strong>
      <ul className="drawer-list">{item.deliverables.map((deliverable, index) => <li key={deliverable}><span>0{index + 1}</span><p>{deliverable}</p></li>)}</ul>
      <div className="drawer-facts"><div><span>TIEMPO</span><strong>{item.time}</strong></div><div><span>CAMBIOS</span><strong>{item.revisions}</strong></div></div>
      <p className="drawer-note">{item.note}</p>
      <div className="drawer-terms">
        <p><b>Pago:</b> 50% para iniciar y 50% antes de publicar.</p>
        <p><b>Inicio:</b> al recibir acceso privado, contenido y pago inicial.</p>
        <p><b>Vigencia:</b> hasta el 20 de septiembre de 2026.</p>
      </div>
    </motion.aside>
  </motion.div>;
}

function App() {
  const [viewIndex, setViewIndex] = useState(0);
  const [selected, setSelected] = useState('framer');
  const [hosting, setHosting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const view = views[viewIndex];
  const progress = useMemo(() => ((viewIndex + 1) / views.length) * 100, [viewIndex]);
  const goNext = () => setViewIndex((current) => Math.min(views.length - 1, current + 1));
  const goPrevious = () => setViewIndex((current) => Math.max(0, current - 1));

  return <main className="app-shell">
    <motion.div className="top-progress" animate={{ width: `${progress}%` }} />
    <header className="app-header">
      <a href="#" className="brand" onClick={(event) => { event.preventDefault(); setViewIndex(0); }}><img src="/assets/solvers-wordmark.svg" alt="Solvers" /><span>CGC-01</span></a>
      <nav aria-label="Secciones de la propuesta">{views.map((item, index) => <button key={item.id} className={view.id === item.id ? 'active' : ''} onClick={() => setViewIndex(index)}><span>0{index + 1}</span>{item.label}{view.id === item.id && <motion.i layoutId="navActive" />}</button>)}</nav>
      <button className="header-cta" onClick={() => setViewIndex(3)}>DECIDIR <Arrow /></button>
    </header>

    <div className="view-frame">
      <AnimatePresence mode="wait">
        {view.id === 'value' && <ValueView key="value" goNext={goNext} />}
        {view.id === 'routes' && <RoutesView key="routes" selected={selected} setSelected={setSelected} goNext={goNext} openDetails={() => setDrawerOpen(true)} />}
        {view.id === 'delivery' && <DeliveryView key="delivery" selected={selected} setSelected={setSelected} goNext={goNext} openDetails={() => setDrawerOpen(true)} />}
        {view.id === 'decision' && <DecisionView key="decision" selected={selected} setSelected={setSelected} hosting={hosting} setHosting={setHosting} openDetails={() => setDrawerOpen(true)} />}
      </AnimatePresence>
    </div>

    <footer className="app-footer">
      <span>PROPUESTA CONFIDENCIAL · CONVERGE GROUP CORP · 2026</span>
      <div className="view-controls"><button onClick={goPrevious} disabled={viewIndex === 0} aria-label="Sección anterior"><Arrow direction="left" /></button><span>{String(viewIndex + 1).padStart(2, '0')} / 04</span><button onClick={goNext} disabled={viewIndex === views.length - 1} aria-label="Siguiente sección"><Arrow /></button></div>
    </footer>

    <AnimatePresence>{drawerOpen && <DetailDrawer selected={selected} close={() => setDrawerOpen(false)} />}</AnimatePresence>
  </main>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
