<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="10" md="8" lg="6">
      <v-card>
        <v-card-title class="headline"> Welkom! </v-card-title>
        <v-card-text>
          <p>
            Deze site is bedoeld om Engelse filmpjes met Nederlandse
            ondertiteling te downloaden van jw.org.
          </p>
          <p>
            De ondertiteling komt van de officiële website en wordt niet zelf
            gemaakt. Het kan dus zijn dat er geen ondertiteling beschikbaar is.
          </p>
          <p>
            Open het filmpje dat je wilt downloaden op jw.org of klik op 'deel
            link' in de JW Library app. Kopieer de url, plak die onderin en druk
            op zoeken.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-form
            ref="form"
            v-model="valid"
            style="width: 100%"
            lazy-validation
            @submit.prevent="search()"
          >
            <v-row>
              <v-col cols="8">
                <v-text-field
                  v-model="videoUrl"
                  label="Video URL"
                  clearable
                  :rules="[
                    (v) => !!v || 'URL is verplicht',
                    (v) =>
                      !v || v.includes('jw.org') || 'URL moet van jw.org zijn',
                  ]"
                  placeholder="https://www.jw.org/nl/bibliotheek/videos/#nl/mediaitems/StudioMonthlyPrograms/pub-jwb-094_1_VIDEO"
                />
              </v-col>
              <v-col cols="4">
                <v-select
                  v-model="res"
                  label="Resolutie"
                  :items="resolutions"
                />
              </v-col>
              <v-col cols="12" align="right">
                <v-btn type="submit" color="primary">Zoeken</v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col cols="12" />
    <v-col cols="12" sm="10" md="8" lg="6">
      <v-card v-if="loading || video">
        <v-card-title class="headline">{{ resultTitle }}</v-card-title>
        <div id="video-container" />
        <v-card-text v-if="loading | loadingVid" class="d-flex justify-center">
          <v-progress-circular indeterminate color="primary" />
        </v-card-text>
        <v-card-actions v-if="!loading">
          <v-row>
            <v-col cols="12" sm="6" align="left">
              <v-btn color="primary" @click="download(video.url)">
                Download filmpje
              </v-btn>
            </v-col>
            <v-col cols="12" sm="6" :align="size === 'xs' ? 'left' : 'right'">
              <v-btn color="primary" @click="download(video.subtitles)">
                Download ondertiteling
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import { MediaItemResult } from '~/types'
interface Video {
  title: string
  url: string
  subtitles: string
}
export default defineComponent({
  name: 'IndexPage',
  data() {
    return {
      valid: true,
      videoUrl: '',
      res: '720p',
      loading: false,
      loadingVid: false,
      video: null as null | Video,
      resolutions: ['360p', '480p', '720p'] as string[],
    }
  },
  computed: {
    size() {
      // @ts-ignore
      return this.$vuetify.breakpoint.name
    },
    videoId(): string {
      if (!this.videoUrl) return ''
      const params = new URLSearchParams(this.videoUrl)
      const lank = params.get('lank')
      const item = params.get('item')
      if (lank && lank.endsWith('_VIDEO')) return lank
      if (item && item.endsWith('_VIDEO')) return item
      if (this.videoUrl.endsWith('_VIDEO')) {
        return this.videoUrl.split('/').pop() ?? ''
      }
      return ''
    },
    resultTitle(): string {
      return this.loading ? 'Zoeken...' : this.video?.title ?? 'Geen resultaat'
    },
  },
  methods: {
    download(url: string) {
      window.open(url, '_blank')
    },
    async search() {
      // @ts-ignore
      if (!this.$refs.form?.validate()) {
        return
      }

      this.loading = true
      this.loadingVid = true
      this.video = null
      document.querySelectorAll('video').forEach((v) => v.remove())
      try {
        if (!this.videoId) {
          throw new Error('Vul een geldige URL in voor een filmpje van jw.org')
        }

        const result = await Promise.allSettled([
          this.$axios.$get(`E/${this.videoId}`) as Promise<MediaItemResult>,
          this.$axios.$get(`O/${this.videoId}`) as Promise<MediaItemResult>,
        ])

        const english =
          result[0].status === 'fulfilled' ? result[0].value : null
        const dutch = result[1].status === 'fulfilled' ? result[1].value : null
        if (!english || !dutch) {
          throw new Error('Er is iets fout gegaan. Probeer het later opnieuw.')
        }
        if (dutch.media.length === 0 || english.media.length === 0) {
          throw new Error('Kon geen media vinden. Zorg dat de url klopt.')
        }

        const video = dutch.media[0]
        const englishVid = english.media[0]
        const file = video.files.find((m) => m.label === this.res)

        const englishFile = englishVid.files.find((m) => m.label === this.res)
        if (!file || !englishFile) {
          throw new Error(
            'Kon geen filmpje vinden voor de gekozen resolutie. Probeer een andere resolutie.'
          )
        }

        const subtitles = file.subtitles?.url
        if (!subtitles) {
          throw new Error('Kon geen ondertiteling vinden voor dit filmpje.')
        }

        this.video = {
          title: video.title,
          url: englishFile.progressiveDownloadURL,
          subtitles,
        }

        this.loading = false

        const subs = await axios.get(
          `https://api.allorigins.win/get?url=${encodeURIComponent(subtitles)}`
        )

        const container = document.getElementById(
          'video-container'
        ) as HTMLDivElement
        const videoEl = document.createElement('video')
        videoEl.src = this.video.url
        videoEl.poster = video.images.wss.lg
        videoEl.controls = true
        videoEl.style.width = '100%'

        const track = document.createElement('track')
        track.kind = 'subtitles'
        track.src = URL.createObjectURL(
          new Blob([subs.data.contents], { type: 'text/vtt' })
        )
        track.label = 'Nederlands'
        track.srclang = 'nl'
        track.default = true

        videoEl.appendChild(track)
        container.appendChild(videoEl)
        videoEl.load()
      } catch (e: any) {
        console.error(e)
        alert(
          e.message ?? 'Er is iets fouts gegaan. Probeer het later opnieuw.'
        )
      } finally {
        this.loading = false
        this.loadingVid = false
      }
    },
  },
})
</script>
