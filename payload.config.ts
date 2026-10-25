import { buildConfig } from 'payload';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { fileURLToPath } from 'url';

import { Users } from './payload/collections/Users';
import { Products } from './payload/collections/Products';
import { Categories } from './payload/collections/Categories';
import { Orders } from './payload/collections/Orders';
import { Customers } from './payload/collections/Customers';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Products, Categories, Orders, Customers],
  editor: lexicalEditor({}),
  plugins: [
    // Add Cloudinary storage plugin here later once keys are verified
  ],
  secret: process.env.PAYLOAD_SECRET || 'fallback-secret',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || '',
  }),
});
