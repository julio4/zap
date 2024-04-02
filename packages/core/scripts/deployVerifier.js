/**
 * Script to deploy ZAP Verifier to Mina
 */

import { PrivateKey, Mina, AccountUpdate, fetchAccount } from 'o1js';
import { Verifier } from '../src/verifier/Verifier.js';

import * as dotenv from 'dotenv';
dotenv.config();

let newPrivateKey = PrivateKey.random();
console.log('to use:', newPrivateKey.toBase58());

const feePayerPrivateKey = process.env.FEE_PAYER_PRIVATE_KEY;
if (!feePayerPrivateKey) {
  throw Error('Please set the FEE_PAYER_PRIVATE_KEY environment variable.');
}
const verifierPrivateKey = process.env.VERIFIER_PRIVATE_KEY;
if (!verifierPrivateKey) {
  throw Error('Please set the VERIFIER_PRIVATE_KEY environment variable.');
}

let Berkeley = Mina.Network('https://proxy.berkeley.minaexplorer.com/graphql');
Mina.setActiveInstance(Berkeley);

let feePayerKey = PrivateKey.fromBase58(feePayerPrivateKey);
let feePayerAddress = feePayerKey.toPublicKey();
let response = await fetchAccount({ publicKey: feePayerAddress });
if (response.error) throw Error(response.error.statusText);
let { nonce, balance } = response.account;
console.log(`Using fee payer account with nonce ${nonce}, balance ${balance}`);

let zkappKey = PrivateKey.fromBase58(verifierPrivateKey);
let zkappAddress = zkappKey.toPublicKey();

let transactionFee = 100_000_000;

// Compile Verifier smart contract
console.log('Compiling Verifier smart contract...');
let { verificationKey } = await Verifier.compile();
let zkapp = new Verifier(zkappAddress);

// if the zkapp is not deployed yet, create a deploy transaction
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
console.log(transaction.toGraphqlQuery());

// send the transaction to the graphql endpoint
console.log('Sending the transaction...');
await transaction.sign([feePayerKey, zkappKey]).send();
