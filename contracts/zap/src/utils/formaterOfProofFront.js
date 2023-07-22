import { Field, PrivateKey } from 'snarkyjs';

function generateKeyPair() {
  const privateKey = PrivateKey.random();
  const publicKey = privateKey.toPublicKey();
  return { privateKey, publicKey };
}

/**
 * generate a base64 object that contains the hash of the route, the condition type, the target value and the sender
 *
 * @param hashRoute
 * @param conditionType
 * @param targetValue
 * @param sender
 */
const generateBase64Attestation = (
  hashRoute,
  conditionType,
  targetValue,
  sender
) => {
  const concatFields = `${hashRoute};${conditionType};${targetValue};${sender}`;
  let buff = Buffer.from(concatFields, 'utf-8');
  let base64Data = buff.toString('base64');
  return base64Data;
};

/**
 * decode the base64 object that contains the hash of the route, the condition type, the target value and the sender
 * @param base64String
 */
const decodeBase64Attestation = (base64String) => {
  let buff = Buffer.from(base64String, 'base64');
  let originalData = buff.toString('utf-8');
  return originalData;
};

const routeAPI = '/balance/:0xdac17f958d2ee523a2206206994597c13d831ec7';
const conditionType = '>=';
const targetValue = 100;
const sender = generateKeyPair().publicKey;

const res = generateBase64Attestation(
  routeAPI,
  conditionType,
  targetValue,
  sender
);

console.log('encoded', res);

console.log('decoded', decodeBase64Attestation(res));

export { generateBase64Attestation, decodeBase64Attestation };