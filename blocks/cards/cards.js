import { createOptimizedPicture } from '../../scripts/aem.js';

function createCardBody({ title = '', body = '' }) {
  const bodyWrapper = document.createElement('div');
  bodyWrapper.className = 'cards-card-body';

  if (title) {
    const heading = document.createElement('h3');
    heading.className = 'cards-card-title';
    heading.textContent = title;
    bodyWrapper.append(heading);
  }

  if (body) {
    const content = document.createElement('div');
    content.className = 'cards-card-description';
    content.innerHTML = body;
    bodyWrapper.append(content);
  }

  return bodyWrapper;
}

export default function decorate(block) {
  // Change to semantic list markup and normalize both legacy and new card authoring.
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const columns = [...row.children];
    if (!columns.length) return;

    const li = document.createElement('li');

    const imageColumn = columns[0];
    if (imageColumn?.querySelector('picture')) {
      imageColumn.className = 'cards-card-image';
      li.append(imageColumn);
    }

    // New schema: [image, backgroundColor, title, body]
    if (columns.length >= 4) {
      const backgroundColor = columns[1]?.textContent?.trim();
      const title = columns[2]?.textContent?.trim();
      const body = columns[3]?.innerHTML?.trim();

      if (backgroundColor && CSS.supports('color', backgroundColor)) {
        li.style.setProperty('--cards-card-background-color', backgroundColor);
      }

      li.append(createCardBody({ title, body }));
      ul.append(li);
      return;
    }

    // Legacy schema: [image, richtext body]
    const legacyBody = columns[1];
    if (legacyBody) {
      legacyBody.className = 'cards-card-body';
      const legacyTitle = legacyBody.querySelector('h1, h2, h3, h4, h5, h6');
      if (legacyTitle) legacyTitle.classList.add('cards-card-title');
      li.append(legacyBody);
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
