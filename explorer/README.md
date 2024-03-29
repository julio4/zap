# Mina zkApp: Explorer

Allowing to store and retrieve data Sources, with offchain storage and onchain proofs. Simple UI to display the data and register new data sources.

Using https://github.com/plus3-labs/o1js-merkle rather than [experimental-zkapp-offchain-storage library](https://github.com/o1-labs/docs2/tree/main/examples/zkapps/06-offchain-storage/experimental-zkapp-offchain-storage).

Syncing offchain storage thanks to [Actions](https://docs.minaprotocol.com/zkapps/o1js/actions-and-reducer) rather than events (more reliable + makes it provable).

UI is a simple React app for now, start with `pnpm run dev` in the `ui` folder.