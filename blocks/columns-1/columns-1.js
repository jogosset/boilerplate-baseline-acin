export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-1-${cols.length}-cols`);

  // setup image columns-1
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-1-img-col');
        }
      }
    });
  });
}
