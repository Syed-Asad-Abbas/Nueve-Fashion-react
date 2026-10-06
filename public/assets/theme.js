/**
 * Goal: Keep the displayed product price aligned with the chosen variant.
 * Method: Read the selected option's server-rendered price and availability data.
 * Inputs/Outputs: Accepts a product form element and updates nearby page elements; returns nothing.
 */
function updateSelectedVariant(form) {
  const select = form.querySelector('[data-variant-select]');
  if (!select) return;

  const option = select.selectedOptions[0];
  const price = form.closest('.product-info').querySelector('[data-product-price]');
  const button = form.querySelector('[data-add-button]');
  price.textContent = option.dataset.price;
  button.disabled = option.dataset.available !== 'true';
}

/**
 * Goal: Connect every product variant picker to its price and availability display.
 * Method: Attach one change listener to each product form after the page loads.
 * Inputs/Outputs: Takes no arguments and returns nothing.
 */
function initializeVariantPickers() {
  document.querySelectorAll('.product-form').forEach((form) => {
    form.addEventListener('change', () => updateSelectedVariant(form));
  });
}

initializeVariantPickers();

const catalogRequests = new WeakMap();

document.addEventListener('click', async (event) => {
  const link = event.target.closest('[data-catalog-link]');
  const panel = link?.closest('[data-catalog-panel]');
  if (!panel || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault();
  catalogRequests.get(panel)?.abort();
  const controller = new AbortController();
  catalogRequests.set(panel, controller);
  panel.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch(link.href, { signal: controller.signal });
    if (!response.ok) throw new Error('Catalog request failed');
    const document = new DOMParser().parseFromString(await response.text(), 'text/html');
    const source = document.querySelector('[data-catalog-source] [data-catalog-results]');
    if (!source) throw new Error('Catalog results missing');
    const results = panel.querySelector('[data-catalog-results]');
    const cards = [...source.querySelectorAll('.product-card')];
    const limit = Number(panel.dataset.catalogLimit) || 6;
    results.replaceChildren(...(cards.length ? cards.slice(0, limit) : [...source.children]));
    panel.querySelectorAll('[data-catalog-link]').forEach(tab => {
      const active = tab === link;
      tab.classList.toggle('is-active', active);
      if (active) tab.setAttribute('aria-current', 'true');
      else tab.removeAttribute('aria-current');
    });
    const more = panel.querySelector('[data-catalog-more]');
    if (more) more.href = link.href;
    const status = panel.querySelector('[data-catalog-status]');
    if (status) status.textContent = document.querySelector('[data-catalog-count]')?.textContent || source.textContent;
  } catch (error) {
    if (error.name !== 'AbortError') window.location.assign(link.href);
  } finally {
    if (catalogRequests.get(panel) === controller) panel.removeAttribute('aria-busy');
  }
});

document.querySelectorAll('[data-catalog-source] [data-catalog-link]').forEach(link => {
  const target = new URL(link.href);
  const active = target.pathname === location.pathname && target.search === location.search;
  link.classList.toggle('is-active', active);
  if (active) link.setAttribute('aria-current', 'true');
  else link.removeAttribute('aria-current');
});
