import Vue from 'vue'

interface CustomProps {}

declare module 'vue/types/vue' {
  interface Vue extends CustomProps {}
}

declare module 'vuex/types/index' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Store<S> extends CustomProps {}
}

declare module '@nuxt/types' {
  interface Context extends CustomProps {}
  interface NuxtAppOptions extends CustomProps {}
}

declare module '*.vue' {
  export default Vue
}
