import { fetchProductData, setEndpoint } from '@dropins/storefront-pdp/api.js';
import { readBlockConfig } from '../../scripts/aem.js';
import { CS_FETCH_GRAPHQL, getProductLink } from '../../scripts/commerce.js';

const IMAGE_SIZE = 280;

function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', 'yes', '1', 'on'].includes(normalized)) return true;
    if (['false', 'no', '0', 'off', ''].includes(normalized)) return false;
  }
  return fallback;
}

function getConfigValue(config, ...keys) {
  const matchedKey = keys.find((key) => config[key] !== undefined);
  return matchedKey !== undefined ? config[matchedKey] : undefined;
}

function getBlockConfig(block) {
  const config = readBlockConfig(block);

  return {
    sku: (config.sku || '').trim(),
    backgroundColor: (getConfigValue(config, 'background-color', 'backgroundcolor', 'backgroundColor') || '').trim(),
    showDetailsButton: normalizeBoolean(
      getConfigValue(config, 'details-button', 'detailsbutton', 'detailsButton'),
      true,
    ),
    showCartButton: normalizeBoolean(
      getConfigValue(config, 'cart-button', 'cartbutton', 'cartButton'),
      true,
    ),
  };
}

function applyBackgroundColor(block, color) {
  if (color) {
    block.style.setProperty('--product-teaser-v2-background', color);
  } else {
    block.style.removeProperty('--product-teaser-v2-background');
  }
}

function createPicture(image, alt, size = IMAGE_SIZE) {
  const imageUrl = image?.url;
  if (!imageUrl) {
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder';
    return placeholder;
  }

  const createUrlForWidth = (url, width, useWebply = true) => {
    const generatedUrl = new URL(url, window.location);
    if (useWebply) {
      generatedUrl.searchParams.set('format', 'webply');
      generatedUrl.searchParams.set('optimize', 'medium');
    } else {
      generatedUrl.searchParams.delete('format');
    }
    generatedUrl.searchParams.set('width', width);
    generatedUrl.searchParams.delete('quality');
    generatedUrl.searchParams.delete('dpr');
    generatedUrl.searchParams.delete('bg-color');
    return generatedUrl.toString();
  };

  const createSrcSet = (url, width, useWebply = true) => (
    `${createUrlForWidth(url, width, useWebply)} 1x, `
    + `${createUrlForWidth(url, width * 2, useWebply)} 2x, `
    + `${createUrlForWidth(url, width * 3, useWebply)} 3x`
  );

  const picture = document.createElement('picture');
  const webpSource = document.createElement('source');
  webpSource.srcset = createSrcSet(imageUrl, size, true);
  picture.append(webpSource);

  const fallbackSource = document.createElement('source');
  fallbackSource.srcset = createSrcSet(imageUrl, size, false);
  picture.append(fallbackSource);

  const img = document.createElement('img');
  img.src = createUrlForWidth(imageUrl, size, false);
  img.alt = alt || image?.label || '';
  img.width = size;
  img.height = size;
  img.loading = 'eager';
  picture.append(img);

  return picture;
}

function formatMoney(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
}

function createPriceSpan(className, text) {
  const span = document.createElement('span');
  span.className = className;
  span.textContent = text;
  return span;
}

function renderPrice(prices = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'price';

  const final = prices.final || {};
  const regular = prices.regular || {};
  const currency = final.currency || regular.currency || 'USD';

  const finalAmount = Number.isFinite(final.amount) ? final.amount : undefined;
  const finalMin = Number.isFinite(final.minimumAmount) ? final.minimumAmount : finalAmount;
  const finalMax = Number.isFinite(final.maximumAmount) ? final.maximumAmount : finalAmount;
  const regularAmount = Number.isFinite(regular.amount) ? regular.amount : undefined;
  const regularMin = Number.isFinite(regular.minimumAmount) ? regular.minimumAmount : regularAmount;
  const regularMax = Number.isFinite(regular.maximumAmount) ? regular.maximumAmount : regularAmount;

  const hasFinalRange = Number.isFinite(finalMin) && Number.isFinite(finalMax) && finalMin !== finalMax;
  const showRegular = regular.variant === 'strikethrough'
    || (Number.isFinite(regularAmount) && Number.isFinite(finalAmount) && regularAmount > finalAmount)
    || (Number.isFinite(regularMin) && Number.isFinite(finalMin) && regularMin > finalMin)
    || (Number.isFinite(regularMax) && Number.isFinite(finalMax) && regularMax > finalMax);

  if (hasFinalRange) {
    const range = document.createElement('div');
    range.className = 'price-range';

    if (showRegular && Number.isFinite(regularMin)) {
      const regularText = Number.isFinite(regularMax) && regularMax !== regularMin
        ? `${formatMoney(regularMin, currency)} - ${formatMoney(regularMax, currency)}`
        : formatMoney(regularMin, currency);
      range.append(createPriceSpan('price-regular', regularText));
    }

    range.append(createPriceSpan('price-from', formatMoney(finalMin, currency)));
    range.append(createPriceSpan('price-from', formatMoney(finalMax, currency)));
    wrapper.append(range);
    return wrapper;
  }

  if (showRegular && Number.isFinite(regularAmount)) {
    wrapper.append(createPriceSpan('price-regular', formatMoney(regularAmount, currency)));
  }

  if (Number.isFinite(finalAmount)) {
    wrapper.append(createPriceSpan('price-final', formatMoney(finalAmount, currency)));
  }

  return wrapper;
}

function renderPlaceholder(block, config) {
  applyBackgroundColor(block, config.backgroundColor);
  block.replaceChildren();

  const image = document.createElement('div');
  image.className = 'image';
  image.append(createPicture(null, '', IMAGE_SIZE));

  const details = document.createElement('div');
  details.className = 'details';

  const heading = document.createElement('h2');
  heading.className = 'title';
  details.append(heading);

  const price = document.createElement('div');
  price.className = 'price';
  details.append(price);

  const description = document.createElement('div');
  description.className = 'description';
  details.append(description);

  const actions = document.createElement('div');
  actions.className = 'actions';

  if (config.showDetailsButton) {
    const detailsButton = document.createElement('a');
    detailsButton.className = 'button primary disabled';
    detailsButton.href = '#';
    detailsButton.textContent = 'Details';
    actions.append(detailsButton);
  }

  if (config.showCartButton) {
    const cartButton = document.createElement('button');
    cartButton.className = 'button secondary';
    cartButton.disabled = true;
    cartButton.type = 'button';
    cartButton.textContent = 'Add to Cart';
    actions.append(cartButton);
  }

  if (actions.childElementCount > 0) {
    details.append(actions);
  }

  block.append(image, details);
}

function canAddDirectlyToCart(product) {
  return !!product?.addToCartAllowed && (!product?.options || product.options.length === 0);
}

function renderProduct(block, product, config) {
  applyBackgroundColor(block, config.backgroundColor);
  block.replaceChildren();

  const image = document.createElement('div');
  image.className = 'image';
  image.append(createPicture(product.images?.[0], product.name, IMAGE_SIZE));

  const details = document.createElement('div');
  details.className = 'details';

  const title = document.createElement('h2');
  title.className = 'title';
  title.textContent = product.name || product.sku;
  details.append(title);

  details.append(renderPrice(product.prices));

  const descriptionHtml = (product.shortDescription || product.description || '').trim();
  if (descriptionHtml) {
    const description = document.createElement('div');
    description.className = 'description';
    description.innerHTML = descriptionHtml;
    details.append(description);
  }

  const actions = document.createElement('div');
  actions.className = 'actions';

  if (config.showDetailsButton) {
    const detailsLink = document.createElement('a');
    detailsLink.className = 'button primary';
    detailsLink.href = getProductLink(product.urlKey, product.sku);
    detailsLink.textContent = 'Details';
    actions.append(detailsLink);
  }

  if (config.showCartButton && canAddDirectlyToCart(product)) {
    const cartButton = document.createElement('button');
    cartButton.className = 'button secondary add-to-cart';
    cartButton.type = 'button';
    cartButton.textContent = 'Add to Cart';
    cartButton.addEventListener('click', async () => {
      const values = [{
        optionsUIDs: [],
        quantity: 1,
        sku: product.sku,
      }];
      const { addProductsToCart } = await import('@dropins/storefront-cart/api.js');
      window.adobeDataLayer = window.adobeDataLayer || [];
      window.adobeDataLayer.push({ productContext: { productId: 0, ...product } });
      addProductsToCart(values);
    });
    actions.append(cartButton);
  }

  if (actions.childElementCount > 0) {
    details.append(actions);
  }

  block.append(image, details);
}

export default async function decorate(block) {
  const config = getBlockConfig(block);
  renderPlaceholder(block, config);

  if (!config.sku) {
    console.warn('product-teaser-v2: missing SKU');
    return;
  }

  try {
    setEndpoint(CS_FETCH_GRAPHQL);
    const product = await fetchProductData(config.sku, { skipTransform: true });

    if (!product?.sku) {
      console.warn(`product-teaser-v2: product not found for SKU "${config.sku}"`);
      return;
    }

    renderProduct(block, product, config);
  } catch (error) {
    console.error('product-teaser-v2: failed to load product', error);
  }
}
