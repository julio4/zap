import { Verifier } from './contracts/Verifier.js';
import { Mina, PrivateKey, PublicKey } from 'o1js';
import { loopUntilAccountExists } from './utils.js';
import util from 'util';
import dotenv from 'dotenv';
dotenv.config();

const Berkeley = Mina.Network(
  'https://proxy.berkeley.minaexplorer.com/graphql'
);
Mina.setActiveInstance(Berkeley);

const transactionFee = 100_000_000;

const deployerPrivateKeyBase58 = process.env.PRIVATE_KEY;
if (!deployerPrivateKeyBase58) {
  throw new Error('PRIVATE_KEY environment variable must be set');
}

const verifierPublicKeyBase58 = process.env.VERIFIER_PUBLIC_KEY;
if (!verifierPublicKeyBase58) {
  throw new Error('VERIFIER_PUBLIC_KEY environment variable must be set');
}

const deployerPrivateKey = PrivateKey.fromBase58(deployerPrivateKeyBase58);
const deployerPublicKey = deployerPrivateKey.toPublicKey();


// ----------------------------------------------------

let account = await loopUntilAccountExists({
  account: deployerPublicKey,
  eachTimeNotExist: () => {
    console.log(
      'Deployer account does not exist. ' +
        'Request funds at faucet ' +
        'https://faucet.minaprotocol.com/?address=' +
        deployerPublicKey.toBase58()
    );
  },
  isZkAppAccount: false,
});

console.log(
  `Using fee payer account with nonce ${account.nonce}, balance ${account.balance}`
);

// ----------------------------------------------------

console.log('Compiling smart contract...');
let { verificationKey } = await Verifier.compile();

const zkAppPublicKey = PublicKey.fromBase58(verifierPublicKeyBase58);
let zkapp = new Verifier(zkAppPublicKey);

// let num = (await zkapp.num.fetch())!;
// console.log(`current value of num is ${num}`);

// // ----------------------------------------------------

// let transaction = await Mina.transaction(
//   { sender: deployerPublicKey, fee: transactionFee },
//   () => {
//     zkapp.update(num.mul(num));
//   }
// );

// // fill in the proof - this can take a while...
// console.log('Creating an execution proof...');
// let time0 = performance.now();
// await transaction.prove();
// let time1 = performance.now();
// console.log(`creating proof took ${(time1 - time0) / 1e3} seconds`);

// // sign transaction with the deployer account
// transaction.sign([deployerPrivateKey]);

// console.log('Sending the transaction...');
// let pendingTransaction = await transaction.send();

// // ----------------------------------------------------

// if (pendingTransaction.status === 'rejected') {
//   console.log('error sending transaction (see above)');
//   process.exit(0);
// }

// console.log(
//   `See transaction at https://berkeley.minaexplorer.com/transaction/${pendingTransaction.hash}
// Waiting for transaction to be included...`
// );
// await pendingTransaction.wait();

// console.log(`updated state! ${await zkapp.num.fetch()}`);
