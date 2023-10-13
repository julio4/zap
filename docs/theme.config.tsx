import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span>ZAP</span>,
  project: {
    link: 'https://github.com/julio4/zap',
  },
  docsRepositoryBase: 'https://github.com/julio4/zap',
  footer: {
    text: 'ZAP - Zero-Knowledge Attestation Protocol',
  },
  editLink: {
    component: ({ ...props }) => (
      <a
        {...props}
        href={config.docsRepositoryBase + "/edit/main/docs/" + props.filePath}
      >
        { props.children }
      </a>
    )
  }
}

export default config
