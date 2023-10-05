declare global {
  interface Window {
    mina: any;
    ethereum: any;
  }
}

window.mina = window.mina || {};
window.ethereum = window.ethereum || {};
