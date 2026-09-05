const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const options = {
  framer: {
    code: 'RUTA 01',
    title: 'Finalización en Framer',
    promise: 'Cerrar pendientes, corregir la experiencia y poner el sitio actual en condición de lanzamiento.',
    price: 2_000_000,
    time: 'Hasta 7 días hábiles',
    revisions: '2 rondas incluidas',
    items: [
      'Auditoría inicial de la estructura privada y lista final de pendientes.',
      'Terminación de páginas, secciones y componentes ya existentes.',
      'Ajustes responsive para escritorio, tableta y móvil.',
      'Corrección de navegación, enlaces, formularios y llamadas a la acción.',
      'Edición del copy disponible y configuración SEO esencial.',
      'Pruebas funcionales y acompañamiento para publicar en Framer.',
    ],
    whatsapp: 'Hola Solvers, queremos avanzar con la finalización en Framer para Converge Group Corp.',
  },
  code: {
    code: 'RUTA 02',
    title: 'Desarrollo completo en código',
    promise: 'Convertir la dirección visual de Converge en un sitio propio, rápido y preparado para crecer sin depender de un constructor visual.',
    price: 3_500_000,
    time: 'Hasta 15 días hábiles',
    revisions: '3 rondas incluidas',
    items: [
      'Arquitectura y desarrollo de todas las páginas definidas al inicio.',
      'Recreación de la dirección visual de referencia con componentes propios.',
      'Experiencia responsive para escritorio, tableta y móvil.',
      'Implementación de contenido, formularios y analítica base.',
      'SEO técnico, rendimiento y accesibilidad esencial.',
      'Repositorio, código fuente, pruebas y despliegue final.',
    ],
    whatsapp: 'Hola Solvers, queremos avanzar con el desarrollo completo en código para Converge Group Corp.',
  },
};

const cards = [...document.querySelectorAll('.option-card')];
const scopeItems = document.getElementById('scopeItems');
let activeOption = 'framer';

function renderOption(key) {
  const option = options[key];
  activeOption = key;
  cards.forEach((card) => {
    const active = card.dataset.option === key;
    card.classList.toggle('active', active);
    card.setAttribute('aria-selected', String(active));
  });

  document.getElementById('scopeCode').textContent = option.code;
  document.getElementById('scopeTitle').textContent = option.title;
  document.getElementById('scopePromise').textContent = option.promise;
  document.getElementById('scopeTime').textContent = option.time;
  document.getElementById('scopeRevisions').textContent = option.revisions;
  document.getElementById('scopePrice').textContent = COP.format(option.price).replace('COP', '').trim();
  document.getElementById('decisionRoute').textContent = option.title;
  document.getElementById('decisionPrice').textContent = `${COP.format(option.price).replace('COP', '').trim()} COP`;
  document.getElementById('whatsappCta').href = `https://wa.me/573216424600?text=${encodeURIComponent(option.whatsapp)}`;

  scopeItems.replaceChildren(...option.items.map((text, index) => {
    const item = document.createElement('li');
    item.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span><p>${text}</p>`;
    return item;
  }));
}

cards.forEach((card) => {
  card.addEventListener('click', () => renderOption(card.dataset.option));
});

document.getElementById('scopeCta').addEventListener('click', () => {
  document.getElementById('aceptar').scrollIntoView({ behavior: 'smooth' });
});

document.querySelector('.print-button').addEventListener('click', () => window.print());

const reveals = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach((element) => observer.observe(element));
} else {
  reveals.forEach((element) => element.classList.add('revealed'));
}

function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
  document.getElementById('progressBar').style.transform = `scaleX(${progress})`;
}
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);

renderOption(activeOption);
updateProgress();
