import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer-1
 * @param {Element} block The footer-1 block element
 */
export default async function decorate(block) {
  const footer-1Meta = getMetadata('footer-1');
  block.textContent = '';

  // load footer-1 fragment
  const footer-1Path = footer-1Meta.footer-1 || '/footer-1';
  const fragment = await loadFragment(footer-1Path);

  // decorate footer-1 DOM
  const footer-1 = document.createElement('div');
  footer-1.classList.add('wrapper');
  while (fragment.firstElementChild) footer-1.append(fragment.firstElementChild);

  block.append(footer-1);
}
