import assert from 'node:assert/strict';

import {
  buildVariantImageSet,
  findBestMatchingVariation,
  findBestMediaVariation,
} from '../lib/utils/product-variant-selection.ts';

const variations = [
  {
    id: 'black-s',
    attributes: { color: 'Black', size: 'S' },
    image: '/black-main.jpg',
    gallery: ['/black-2.jpg', '/black-3.jpg'],
  },
  {
    id: 'white-s',
    attributes: { color: 'White', size: 'S' },
    image: '/white-main.jpg',
    gallery: ['/white-2.jpg', '/white-3.jpg'],
  },
  {
    id: 'white-m',
    attributes: { color: 'White', size: 'M' },
    image: '/black-main.jpg',
    gallery: ['/black-2.jpg'],
  },
  {
    id: 'pink-m',
    attributes: { color: 'Pink', size: 'M' },
    image: '/pink-main.jpg',
    gallery: ['/pink-2.jpg'],
  },
];

const runCase = (name: string, assertion: () => void) => {
  try {
    assertion();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

runCase('exact variation matching returns the selected size row', () => {
  const variation = findBestMatchingVariation(variations, {
    color: 'White',
    size: 'M',
  });

  assert.equal(variation?.id, 'white-m');
});

runCase('media selection stays on the selected color even if the chosen size row carries the wrong media', () => {
  const variation = findBestMediaVariation(variations, {
    color: 'White',
    size: 'M',
  });

  assert.equal(variation?.id, 'white-s');
});

runCase('exact selected size media wins when it is equally rich within the same color', () => {
  const variation = findBestMediaVariation(
    [
      {
        id: 'white-s',
        attributes: { color: 'White', size: 'S' },
        image: '/white-s-main.jpg',
        gallery: ['/white-s-2.jpg'],
      },
      {
        id: 'white-m',
        attributes: { color: 'White', size: 'M' },
        image: '/white-m-main.jpg',
        gallery: ['/white-m-2.jpg'],
      },
    ],
    {
      color: 'White',
      size: 'M',
    }
  );

  assert.equal(variation?.id, 'white-m');
});

runCase('exact variation media wins when it exists', () => {
  const variation = findBestMediaVariation(variations, {
    color: 'Pink',
    size: 'M',
  });

  assert.equal(variation?.id, 'pink-m');
});

runCase('base gallery is used when no variation media exists', () => {
  const imageSet = buildVariantImageSet({
    heroImage: '/product-hero.jpg',
    images: ['/product-gallery-1.jpg', '/product-gallery-2.jpg'],
    mediaVariation: null,
  });

  assert.deepEqual(imageSet, [
    '/product-hero.jpg',
    '/product-gallery-1.jpg',
    '/product-gallery-2.jpg',
  ]);
});

runCase('variation gallery replaces the base gallery when variant media exists', () => {
  const imageSet = buildVariantImageSet({
    heroImage: '/product-hero.jpg',
    images: ['/product-gallery-1.jpg', '/product-gallery-2.jpg'],
    mediaVariation: variations[1],
  });

  assert.deepEqual(imageSet, [
    '/white-main.jpg',
    '/white-2.jpg',
    '/white-3.jpg',
  ]);
});
