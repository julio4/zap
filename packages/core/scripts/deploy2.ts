/**
 * This is an example for interacting with the Berkeley QANet, directly from o1js.
 *
 * At a high level, it does the following:
 * -) try fetching the account corresponding to the `zkappAddress` from chain
 * -) if the account doesn't exist or is not a zkapp account yet, deploy a zkapp to it and initialize on-chain state
 * -) if the zkapp is already deployed, send a state-updating transaction which proves execution of the "update" method
 */

import {
  Field,
  state,
  State,
  method,
  PrivateKey,
  SmartContract,
  Mina,
  AccountUpdate,
  fetchAccount,
} from 'o1js';
import { Registry } from '../src/registry/Registry.js';

import * as dotenv from 'dotenv';
dotenv.config();

let newPrivateKey = PrivateKey.random();
console.log('to use:', newPrivateKey.toBase58());

const feePayerPrivateKey = process.env.FEE_PAYER_PRIVATE_KEY;
if (!feePayerPrivateKey) {
  throw Error('Please set the FEE_PAYER_PRIVATE_KEY environment variable.');
}
const zkappPrivateKey = process.env.ZKAPP_PRIVATE_KEY;
if (!zkappPrivateKey) {
  throw Error('Please set the ZKAPP_PRIVATE_KEY environment variable.');
}

let Berkeley = Mina.Network('https://proxy.berkeley.minaexplorer.com/graphql');
Mina.setActiveInstance(Berkeley);

let feePayerKey = PrivateKey.fromBase58(feePayerPrivateKey);
let feePayerAddress = feePayerKey.toPublicKey();
let response = await fetchAccount({ publicKey: feePayerAddress });
if (response.error) throw Error(response.error.statusText);
let { nonce, balance } = response.account;
console.log(`Using fee payer account with nonce ${nonce}, balance ${balance}`);

let zkappKey = PrivateKey.fromBase58(zkappPrivateKey);
let zkappAddress = zkappKey.toPublicKey();

let transactionFee = 100_000_000;
let initialState = Field(1);

// compile the SmartContract to get the verification key (if deploying) or cache the provers (if updating)
// this can take a while...
console.log('Compiling smart contract...');
let { verificationKey } = await Registry.compile();

// check if the zkapp is already deployed, based on whether the account exists and its first zkapp state is !== 0
let zkapp = new Registry(zkappAddress);
let storageServerPublicKey = await zkapp.storageServerPublicKey.get();
let isDeployed =
  storageServerPublicKey?.equals(zkappAddress).not().toBoolean() ?? false;

// if the zkapp is not deployed yet, create a deploy transaction
if (!isDeployed) {
  console.log(`Deploying zkapp for public key ${zkappAddress.toBase58()}.`);
  // the `transaction()` interface is the same as when testing with a local blockchain
  let transaction = await Mina.transaction(
    { sender: feePayerAddress, fee: transactionFee },
    async () => {
      AccountUpdate.fundNewAccount(feePayerAddress);
      await zkapp.deploy({ verificationKey });
    }
  );
  // if you want to inspect the transaction, you can print it out:
  // console.log(transaction.toGraphqlQuery());

  // send the transaction to the graphql endpoint
  console.log('Sending the transaction...');
  await transaction.sign([feePayerKey, zkappKey]).send();
}

// if the zkapp is not deployed yet, create an update transaction
if (isDeployed) {
  console.log('zkapp is already deployed');
}
