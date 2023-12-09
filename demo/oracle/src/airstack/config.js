const AIRSTACK_ENDPOINT = process.env['AIRSTACK_ENDPOINT'] || 'https://api.airstack.xyz/gql/';

const defaultBlockchain = 'ethereum';

// pagination limits, API keys, etc.

module.exports = {
  AIRSTACK_ENDPOINT,
  defaultBlockchain,
};