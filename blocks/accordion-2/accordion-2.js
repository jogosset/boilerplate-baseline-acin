/*
 * Accordion Block
 * Recreate an accordion-2
 * https://www.hlx.live/developer/block-collection/accordion-2
 */

export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate accordion-2 item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-2-item-label';
    summary.append(...label.childNodes);
    // decorate accordion-2 item body
    const body = row.children[1];
    body.className = 'accordion-2-item-body';
    // decorate accordion-2 item
    const details = document.createElement('details');
    details.className = 'accordion-2-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
