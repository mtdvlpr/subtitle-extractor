import colors from 'vuetify/es5/util/colors'

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Ondertiteling downloader',
    htmlAttrs: {
      lang: 'nl',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/stylelint
    '@nuxtjs/stylelint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
    '@aceforth/nuxt-netlify',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    baseURL: 'https://b.jw-cdn.org/apis/mediator/v1/media-items/',
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
  },

  netlify: {
    mergeSecurityHeaders: false,
    headers: {
      '/*': [
        'X-Frame-Options: DENY',
        'X-Content-Type-Options: nosniff',
        'X-XSS-Protection: 1; mode=block',
        'Referrer-Policy: no-referrer-when-downgrade',
        'Permissions-Policy: camera=(), display-capture=(), document-domain=(), geolocation=(), microphone=(), payment=(), usb=()',
      ],
    },
  },

  generate: {
    fallback: true,
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    babel: {
      // envName: server, client, modern
      presets({ envName }) {
        const envTargets = {
          client: { browsers: ['last 3 versions'] },
          server: { node: 'current' },
        }
        return [
          [
            '@nuxt/babel-preset-app',
            {
              corejs: { version: '3.26' },
              useBuiltIns: 'usage',
              shippedProposals: true,
              targets: envTargets[envName],
            },
          ],
        ]
      },
    },
  },
}
