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

function extractCardContent(columns, hasImage) {
  const contentColumns = hasImage ? columns.slice(1) : columns;
  const [first, second, third] = contentColumns;
  const firstText = first?.textContent?.trim() || '';

  // Expected new shape: [backgroundColor, title, body].
  if (contentColumns.length >= 3) {
    return {
      backgroundColor: firstText,
      title: second?.textContent?.trim() || '',
      body: third?.innerHTML?.trim() || '',
    };
  }

  // Graceful fallback for partially-authored cards.
  if (contentColumns.length === 2) {
    return {
      backgroundColor: firstText,
      title: '',
      body: second?.innerHTML?.trim() || '',
    };
  }

  if (contentColumns.length === 1) {
    return {
      backgroundColor: '',
      title: '',
      body: first?.innerHTML?.trim() || '',
    };
  }

  return { backgroundColor: '', title: '', body: '' };
}

export default function decorate(block) {
  // Change to semantic list markup and normalize both legacy and new card authoring.
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const columns = [...row.children];
    if (!columns.length) return;

    const li = document.createElement('li');

    const imageColumn = columns[0];
    const hasImage = Boolean(imageColumn?.querySelector('picture'));

    if (hasImage) {
      imageColumn.className = 'cards-card-image';
      li.append(imageColumn);
    }

    const { backgroundColor, title, body } = extractCardContent(columns, hasImage);
    if (backgroundColor) li.style.backgroundColor = backgroundColor;

    // Legacy schema with image + richtext body remains supported.
    if (hasImage && columns.length === 2) {
      const legacyBody = columns[1];
      legacyBody.className = 'cards-card-body';
      const legacyTitle = legacyBody.querySelector('h1, h2, h3, h4, h5, h6');
      if (legacyTitle) legacyTitle.classList.add('cards-card-title');
      li.append(legacyBody);
      ul.append(li);
      return;
    }

    li.append(createCardBody({ title, body }));

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
