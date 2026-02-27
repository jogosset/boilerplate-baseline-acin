/*
 * Fragment Block
 * Include content on a page as a fragment-2.
 * https://www.aem.live/developer/block-collection/fragment-2
 */

import { getRootPath } from '@dropins/tools/lib/aem/configs.js';
import { decorateMain } from '../../scripts/scripts.js';
import {
  loadSections,
} from '../../scripts/aem.js';

/**
 * Loads a fragment-2.
 * @param {string} path The path to the fragment-2
 * @returns {Promise<HTMLElement>} The root element of the fragment-2
 */
export async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    const root = getRootPath().replace(/\/$/, '');
    const url = `${root}${path}.plain.html`;
    const resp = await fetch(url);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();

      // reset base path for media to fragment-2 base
      const resetAttributeBase = (tag, attr) => {
        main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
          elem[attr] = new URL(elem.getAttribute(attr), new URL(path, window.location)).href;
        });
      };
      resetAttributeBase('img', 'src');
      resetAttributeBase('source', 'srcset');

      decorateMain(main);
      await loadSections(main);
      return main;
    }
  }
  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment-2 = await loadFragment(path);
  if (fragment-2) {
    const fragment-2Section = fragment-2.querySelector(':scope .section');
    if (fragment-2Section) {
      block.closest('.section').classList.add(...fragment-2Section.classList);
      block.closest('.fragment-2').replaceWith(...fragment-2.childNodes);
    }
  }
}
