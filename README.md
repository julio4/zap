# ZAP - Zero-Knowledge Attestation Protocol

## About ZAP

TODO

## What's inside?

This repo includes the following packages/apps:

### Apps and Packages

- `zap`: the main [Snarkyjs](#) contract that implements the logic of ZAP
- `oracle`: a koa app that acts as a source of truth with Airstack API integration
- `web`: a [Next.js](https://nextjs.org/) app with [Tailwind CSS](https://tailwindcss.com/)

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

## Getting Started

### Pnpm

This repo use turborepo and pnpm for easy, fast, and reliable dependency management. To get started, install [pnpm](https://pnpm.js.org/) and run `pnpm install` in the root of the repo.

Here's the full list of commands you can run from the root of the repo:
- build: build all packages
- dev: run the web app in development mode
- test: run all tests
- lint: run eslint on all packages
- clean: remove all build artifacts
- format: run prettier on all packages

You can further specify which packages to run a command on by using the `--filter` flag. For example, `pnpm build --filter "@packages/*"` will only build the packages in the `packages` directory, or `pnpm test --filter @contracts/zap` will only run the zap contract's tests.

### WARNING

This repo is still in active development and is not ready for production use. Use at your own risk.
It was made during the EthGlobal Paris Hackathon, so the architecture of the code was kinda rushed and not well thought out ;'(
