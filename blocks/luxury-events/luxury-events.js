export default function decorate(block) {
  // Get the header section (title and subtitle)
  const headerRow = block.querySelector(':scope > div:first-child');
  if (headerRow) {
    headerRow.classList.add('luxury-events-header');
    const [titleCell, subtitleCell] = headerRow.children;

    if (titleCell) {
      titleCell.classList.add('luxury-events-title');
    }
    if (subtitleCell) {
      subtitleCell.classList.add('luxury-events-subtitle');
    }
  }

  // Create container for event cards
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'luxury-events-cards';

  // Process each event card (skip the header row)
  const eventRows = [...block.children].slice(1);

  eventRows.forEach((row) => {
    const [imageCell, titleCell, descriptionCell, linkCell] = row.children;

    // Create card wrapper
    const card = document.createElement('div');
    card.className = 'luxury-events-card';

    // Process image
    if (imageCell) {
      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'luxury-events-card-image';

      // Preserve original picture element to maintain UE instrumentation
      if (imageCell.querySelector('picture, img')) {
        imageWrapper.innerHTML = imageCell.innerHTML;
      }
      card.appendChild(imageWrapper);
    }

    // Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'luxury-events-card-content';

    // Process title
    if (titleCell) {
      const titleDiv = document.createElement('div');
      titleDiv.className = 'luxury-events-card-title';
      titleDiv.textContent = titleCell.textContent.trim();
      contentWrapper.appendChild(titleDiv);
    }

    // Process description
    if (descriptionCell) {
      const descriptionDiv = document.createElement('div');
      descriptionDiv.className = 'luxury-events-card-description';
      descriptionDiv.textContent = descriptionCell.textContent.trim();
      contentWrapper.appendChild(descriptionDiv);
    }

    // Process link
    if (linkCell) {
      const link = linkCell.querySelector('a');
      if (link) {
        const linkWrapper = document.createElement('div');
        linkWrapper.className = 'luxury-events-card-link';
        const readMoreLink = document.createElement('a');
        readMoreLink.href = link.href;
        readMoreLink.textContent = link.textContent || 'Read more +';
        readMoreLink.className = 'luxury-events-link';
        linkWrapper.appendChild(readMoreLink);
        contentWrapper.appendChild(linkWrapper);
      } else {
        // If no link element found, check if there's text content
        const linkText = linkCell.textContent.trim();
        if (linkText) {
          const linkWrapper = document.createElement('div');
          linkWrapper.className = 'luxury-events-card-link';
          const readMoreLink = document.createElement('a');
          readMoreLink.href = '#';
          readMoreLink.textContent = linkText;
          readMoreLink.className = 'luxury-events-link';
          linkWrapper.appendChild(readMoreLink);
          contentWrapper.appendChild(linkWrapper);
        }
      }
    }

    card.appendChild(contentWrapper);
    cardsContainer.appendChild(card);
    row.remove();
  });

  // Append cards container to block
  block.appendChild(cardsContainer);
}
