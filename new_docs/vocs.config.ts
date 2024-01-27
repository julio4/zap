import { defineConfig } from "vocs";

export default defineConfig({
  titleTemplate: "%s – ZAP",
  logoUrl: "⚡",
  iconUrl: "⚡",
  editLink: {
    pattern: "https://github.com/julio4/zap/edit/main/docs/:path",
    text: "Edit on GitHub",
  },

  // TODO: footer
  // todo: sidebar
  // todo: navbar
  sidebar: [
    {
      text: "What are (Zk)Oracles?",
      link: "/intro",
    },
    {
      text: "ZAP Overview",
      link: "/",
    },
    {
      text: "Project Milestones",
      link: "/milestone",
    },
    {
      text: "Protocol Concepts",
      collapsed: true,
      items: [
        {
          text: "Statement",
          link: "concepts/Statement",
        },
        {
          text: "Attestation",
          link: "concepts/Attestation",
        },
        {
          text: "ZAP Source",
          link: "concepts/ZAPSource",
        },
      ],
    },
    {
      text: "ZAP Protocol",
      link: "/protocol",
    },
    {
      text: "Technical Reference",
      collapsed: true,
      items: [
        {
          text: "ZAP Contract",
          link: "reference/ZapContract",
        },
      ],
    },
    {
      text: "Guides",
      collapsed: true,
      items: [
        {
          text: "User guide",
          link: "guides/user",
        },
        {
          text: "Test ZAP Locally",
          link: "guides/localenv",
        },
      ],
    },
  ],

  theme: {
    // accentColor: '#our-accent-color-is ????',
    variables: {},
  },

  rootDir: ".",
  description:
    "The first Zero-Knowledge Attestation Protocol leveraging zk-SNARKs on Mina Protocol",
  title: "ZAP",
});
