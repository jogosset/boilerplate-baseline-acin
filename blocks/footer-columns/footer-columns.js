export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  // Get breakpoint from CSS custom property
  const getBreakpoint = () => {
    const breakpoint = getComputedStyle(block).getPropertyValue('--footer-breakpoint-mobile').trim();
    return parseInt(breakpoint, 10) || 768;
  };

  // First row contains column headers
  const headerRow = rows[0];
  const headers = [...headerRow.children];

  // Create container for all columns
  const columnsContainer = document.createElement('div');
  columnsContainer.className = 'footer-columns-grid';
  columnsContainer.setAttribute('role', 'navigation');
  columnsContainer.setAttribute('aria-label', 'Footer navigation');

  // Create each column
  headers.forEach((header, colIndex) => {
    const column = document.createElement('div');
    column.className = 'footer-column';

    // Add column header
    const headerDiv = document.createElement('div');
    headerDiv.className = 'footer-column-header';
    headerDiv.innerHTML = header.innerHTML;

    // Add click handler for accordion (only functional on mobile via CSS)
    const toggleAccordion = () => {
      // Only toggle if screen is mobile size
      const breakpoint = getBreakpoint();
      if (window.innerWidth <= breakpoint) {
        const isExpanded = column.classList.toggle('expanded');
        headerDiv.setAttribute('aria-expanded', isExpanded.toString());
      }
    };

    headerDiv.addEventListener('click', toggleAccordion);

    // Add keyboard support (Enter and Space)
    headerDiv.addEventListener('keydown', (e) => {
      const breakpoint = getBreakpoint();
      if ((e.key === 'Enter' || e.key === ' ') && window.innerWidth <= breakpoint) {
        e.preventDefault();
        toggleAccordion();
      }
    });

    column.appendChild(headerDiv);

    // Create list for column links
    const linksList = document.createElement('ul');
    linksList.className = 'footer-column-links';
    const headerText = header.textContent.trim();
    if (headerText) {
      linksList.setAttribute('aria-label', `${headerText} links`);
    }

    // Collect all links for this column from subsequent rows
    for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex];
      const cells = [...row.children];
      const cell = cells[colIndex];

      // Skip empty cells
      if (!cell || !cell.textContent.trim()) {
        // eslint-disable-next-line no-continue
        continue;
      }

      // Create list item
      const listItem = document.createElement('li');
      listItem.innerHTML = cell.innerHTML;
      linksList.appendChild(listItem);
    }

    // Only add the list if it has items
    if (linksList.children.length > 0) {
      column.appendChild(linksList);
    }

    columnsContainer.appendChild(column);
  });

  // Replace block content with new structure
  block.textContent = '';
  block.appendChild(columnsContainer);

  // Handle window resize - reset accordion state when switching to desktop
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    // Get debounce duration from CSS custom property
    const debounceDuration = getComputedStyle(block).getPropertyValue('--footer-resize-debounce').trim();
    const debounceMs = parseInt(debounceDuration, 10) || 250;

    resizeTimer = setTimeout(() => {
      const breakpoint = getBreakpoint();
      if (window.innerWidth > breakpoint) {
        // Remove expanded class and reset aria attributes on desktop
        columnsContainer.querySelectorAll('.footer-column').forEach((col) => {
          col.classList.remove('expanded');
          const header = col.querySelector('.footer-column-header');
          if (header) {
            header.removeAttribute('aria-expanded');
          }
        });
      }
    }, debounceMs);
  });
}
