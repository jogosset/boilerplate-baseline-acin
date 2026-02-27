import { fetchPlaceholders } from '../../scripts/commerce.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide
    .querySelectorAll('a')
    .forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  const slideObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) updateActiveSlide(entry.target);
      });
    },
    { threshold: 0.5 },
  );
  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function startAutoplay(block, interval = 6000) {
  const slides = block.querySelectorAll('.carousel-slide');

  if (slides.length < 2) return;
  let currentIndex = parseInt(block.dataset.activeSlide || '0', 10);
  setInterval(() => {
    const nextIndex = (currentIndex + 1) % slides.length;
    showSlide(block, nextIndex);
    currentIndex = nextIndex;
  }, interval);
}

function toBoolean(value) {
  if (typeof value !== 'string') return false;
  return ['true', 'yes', '1', 'on'].includes(value.trim().toLowerCase());
}

function createStructuredSlideContent(row, slideIndex, carouselInstanceId) {
  const columns = [...row.querySelectorAll(':scope > div')];
  const content = document.createElement('div');
  content.classList.add('carousel-slide-content');

  const textBoxBackgroundColor = columns[1]?.textContent?.trim();
  const textColor = columns[2]?.textContent?.trim();
  const title = columns[3]?.textContent?.trim();
  const titleColor = columns[4]?.textContent?.trim();
  const titleBold = toBoolean(columns[5]?.textContent);
  const body = columns[6]?.innerHTML?.trim();
  const bodyColor = columns[7]?.textContent?.trim();
  const bodyBold = toBoolean(columns[8]?.textContent);

  if (textBoxBackgroundColor) content.style.backgroundColor = textBoxBackgroundColor;
  if (textColor) content.style.color = textColor;

  if (title) {
    const heading = document.createElement('h2');
    heading.classList.add('carousel-slide-title');
    heading.setAttribute('id', `carousel-${carouselInstanceId}-slide-${slideIndex}-title`);
    heading.textContent = title;
    if (titleColor) heading.style.color = titleColor;
    if (titleBold) heading.style.fontWeight = '700';
    content.append(heading);
  }

  if (body) {
    const bodyEl = document.createElement('div');
    bodyEl.classList.add('carousel-slide-body');
    bodyEl.innerHTML = body;
    if (bodyColor) bodyEl.style.color = bodyColor;
    if (bodyBold) bodyEl.style.fontWeight = '700';
    content.append(bodyEl);
  }

  return content;
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  const columns = [...row.querySelectorAll(':scope > div')];
  const imageColumn = columns[0];
  if (imageColumn) {
    imageColumn.classList.add('carousel-slide-image');
    slide.append(imageColumn);
  }

  // New structured schema:
  // [image, textBoxBackgroundColor, textColor, title, titleColor, titleBold, body, bodyColor, bodyBold]
  if (columns.length >= 9) {
    slide.append(createStructuredSlideContent(row, slideIndex, carouselId));
  } else if (columns[1]) {
    // Legacy schema: [image, richtext text]
    columns[1].classList.add('carousel-slide-content');
    slide.append(columns[1]);
  }

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  const rows = Array.from(block.querySelectorAll(':scope > div'));
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute(
    'aria-roledescription',
    placeholders.carousel || 'Carousel',
  );

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute(
      'aria-label',
      placeholders.carouselSlideControls || 'Carousel Slide Controls',
    );
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);
  }

  shuffleArray(rows);

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${
        placeholders.showSlide || 'Show Slide'
      } ${idx + 1} ${placeholders.of || 'of'} ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);
  if (!isSingleSlide) {
    bindEvents(block);
    startAutoplay(block);
  }
}
