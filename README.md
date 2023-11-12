<a name="readme-top"></a>
[![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/julio4/zap)

<br />
<div align="center" display="flex" flex-direction="row" justify-content="center" align-items="center">
  <a href="https://minaprotocol.com/" style="margin-left: 55px">
    <img src="assets/mina-logo.png" alt="Mina Protocol" width="80" height="80">
  </a>
</div>

<p>
ZAP aims to be the first Zero-Knowledge Attestation Protocol on Mina, allowing protocols to verify statements about anything without revealing unnecessary information.
ZAP is module-based, meaning that anyone can plug in an "oracle", either centralized or decentralized, as a source of truth for the statement.
Currently, we have implemented a centralized oracle that queries AirStack's API to verify the statement, signs the result and returns it to the user, and we plan to release a decentralized version in the future alongside with others kind of data providers (such as web2 proof: email auths, social medias, ...).
</p>

## Additional Resources

For those interested in getting hands-on with ZAP or exploring more about the protocol, here are some quick links:

- **Full Documentation:** You can find the detailed documentation of ZAP [here](https://zap-docs.vercel.app/).
- **Video Example:** Watch a video demonstration of ZAP in action [here](https://zap-docs.vercel.app/guides/user).
- **Testing Locally:** For instructions on how to set up and test ZAP locally, please see our [Local Testing Guide](https://zap-docs.vercel.app/guides/localenv).
