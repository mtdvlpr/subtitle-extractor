<template>
  <v-app dark>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    <v-footer absolute padless app>
      <v-row justify="center" no-gutters>
        <v-col class="py-4 text-center white--text" cols="12">
          &copy; {{ new Date().getFullYear() }} —
          <strong>Manoah Tervoort</strong>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
}
</script>
