/*
 * Accordion Block
 * Recreate an accordion-1
 * https://www.hlx.live/developer/block-collection/accordion-1
 */

export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate accordion-1 item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-1-item-label';
    summary.append(...label.childNodes);
    // decorate accordion-1 item body
    const body = row.children[1];
    body.className = 'accordion-1-item-body';
    // decorate accordion-1 item
    const details = document.createElement('details');
    details.className = 'accordion-1-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
