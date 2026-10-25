import assert from 'node:assert/strict';

import { normalizeProductDocumentForClient } from '../lib/utils/product-serialization.ts';

const objectIdLike = {
  _bsontype: 'ObjectId',
  toHexString: () => '507f191e810c19729de860ea',
};

const normalized = normalizeProductDocumentForClient({
  additionalInfo: [
    {
      label: ' Brand ',
      value: ' Almina ',
      _id: objectIdLike,
    },
  ],
  specifications: [
    {
      label: ' Length ',
      value: ' Floor ',
      _id: objectIdLike,
    },
  ],
  orderDetails: [
    {
      label: ' Lead Time ',
      value: ' 10 Days ',
      _id: objectIdLike,
    },
  ],
  attributes: [
    {
      name: ' Color ',
      values: ['Black', ' Black ', 'White'],
      colorValues: new Map([
        ['Black', '#000000'],
        ['White', '#ffffff'],
      ]),
      _id: objectIdLike,
    },
  ],
  variations: [
    {
      id: ' var-black ',
      attributes: {
        Color: ' Black ',
        _id: objectIdLike,
      },
      price: '249',
      compareAtPrice: '299',
      sku: ' BLAZER-BLK ',
      stockCount: '4',
      image: ' /images/black.jpg ',
      gallery: [' /images/black-2.jpg ', '/images/black-3.jpg '],
      _id: objectIdLike,
    },
  ],
  images: [' /images/base.jpg '],
});

assert.deepEqual(normalized.additionalInfo, [
  { label: 'Brand', value: 'Almina' },
]);

assert.deepEqual(normalized.specifications, [
  { label: 'Length', value: 'Floor' },
]);

assert.deepEqual(normalized.orderDetails, [
  { label: 'Lead Time', value: '10 Days' },
]);

assert.deepEqual(normalized.attributes, [
  {
    name: 'Color',
    values: ['Black', 'White'],
    colorValues: {
      Black: '#000000',
      White: '#ffffff',
    },
  },
]);

assert.deepEqual(normalized.variations, [
  {
    id: 'var-black',
    attributes: { Color: 'Black' },
    price: 249,
    compareAtPrice: 299,
    sku: 'BLAZER-BLK',
    stockCount: 4,
    image: '/images/black.jpg',
    gallery: ['/images/black-2.jpg', '/images/black-3.jpg'],
  },
]);

assert.deepEqual(normalized.colors, ['Black', 'White']);
assert.deepEqual(normalized.gallery, ['/images/base.jpg']);
assert.equal('_id' in normalized.attributes[0], false);
assert.equal('_id' in normalized.variations[0], false);

console.log('product serialization tests passed');
