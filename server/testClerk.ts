import { verifyToken } from '@clerk/backend';
import { env } from './src/config/env';

async function test() {
  console.log("verifyToken:", typeof verifyToken);
}

test();
