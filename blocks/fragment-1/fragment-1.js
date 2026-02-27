/*
 * Fragment Block
 * Include content on a page as a fragment-1.
 * https://www.aem.live/developer/block-collection/fragment-1
 */

import {
  decorateMain,
} from '../../scripts/scripts.js';

import {
  loadBlocks,
} from '../../scripts/aem.js';

/**
 * Loads a fragment-1.
 * @param {string} path The path to the fragment-1
 * @returns {HTMLElement} The root element of the fragment-1
 */
export async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();

      // reset base path for media to fragment-1 base
      const resetAttributeBase = (tag, attr) => {
        main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
          elem[attr] = new URL(elem.getAttribute(attr), new URL(path, window.location)).href;
        });
      };
      resetAttributeBase('img', 'src');
      resetAttributeBase('source', 'srcset');

      decorateMain(main);
      await loadBlocks(main);
      return main;
    }
  }
  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment-1 = await loadFragment(path);
  if (fragment-1) {
    const fragment-1Section = fragment-1.querySelector(':scope .section');
    if (fragment-1Section) {
      block.closest('.section').classList.add(...fragment-1Section.classList);
      block.closest('.fragment-1').replaceWith(...fragment-1.childNodes);
    }
  }
}
