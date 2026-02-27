/**
 * loads and decorates the hero-1
 * @param {Element} block The hero-1 block element
 */

export default async function decorate(block) {
  const imageEl = block.querySelector('img');
  imageEl.removeAttribute('loading'); // Lighthouse recommendation: remove lazy-loading
  imageEl.setAttribute('loading', 'eager');

  // Target the second child div
  const secondChildDiv = block.children[0];
  [...secondChildDiv.children].forEach((child) => {
    const pictureElement = child.querySelector('picture');

    if (pictureElement) {
      child.className = 'hero-1-image';
    } else {
      child.className = 'hero-1-desc-wrapper';
      const buttonLink = child.querySelector('.button-container a');
      buttonLink?.classList.remove('button', 'button-primary');
      buttonLink?.classList.add('button-primary');
    }
  });
}
