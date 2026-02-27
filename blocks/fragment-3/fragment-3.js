/*
 * Fragment Block
 * Include content on a page as a fragment-3.
 * https://www.aem.live/developer/block-collection/fragment-3
 */

import { getRootPath } from '@dropins/tools/lib/aem/configs.js';
import { decorateMain } from '../../scripts/scripts.js';
import {
  loadSections,
} from '../../scripts/aem.js';

/**
 * Loads a fragment-3.
 * @param {string} path The path to the fragment-3
 * @returns {Promise<HTMLElement>} The root element of the fragment-3
 */
export async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    const root = getRootPath().replace(/\/$/, '');
    const url = `${root}${path}.plain.html`;
    const resp = await fetch(url);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();

      // reset base path for media to fragment-3 base
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
  const fragment-3 = await loadFragment(path);
  if (fragment-3) {
    const fragment-3Section = fragment-3.querySelector(':scope .section');
    if (fragment-3Section) {
      block.closest('.section').classList.add(...fragment-3Section.classList);
      block.closest('.fragment-3').replaceWith(...fragment-3.childNodes);
    }
  }
}
