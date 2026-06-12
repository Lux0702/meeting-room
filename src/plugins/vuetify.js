import "@mdi/font/css/materialdesignicons.css";
import "@/styles/tailwind.css";
import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi-svg";
import { zhHans } from "vuetify/locale";
import {
  mdiAccountDetails,
  mdiChevronDoubleLeft,
  mdiChevronDoubleRight,
  mdiChevronDown,
  mdiChevronUp,
  mdiClose,
  mdiCog,
  mdiFeatureSearchOutline,
  mdiFileDownloadOutline,
  mdiFileRestore,
  mdiFullscreen,
  mdiFullscreenExit,
  mdiMagnify,
  mdiMenu,
  mdiPower,
  mdiReplay,
  mdiTranslate,
} from "@mdi/js";
export default createVuetify({
  locale: {
    messages: { zhHans },
  },
  icons: {
    defaultSet: "mdi",
    aliases: {
      ...aliases,
      cog: mdiCog,
      fullscreen: mdiFullscreen,
      fullscreenExit: mdiFullscreenExit,
      search: mdiFeatureSearchOutline,
      accountDetails: mdiAccountDetails,
      save: mdiFileDownloadOutline,
      power: mdiPower,
      prev: mdiChevronDoubleLeft,
      next: mdiChevronDoubleRight,
      close: mdiClose,
      translate: mdiTranslate,
      fileRestore: mdiFileRestore,
      replay: mdiReplay,
      menu: mdiMenu,
      magnify: mdiMagnify,
      chevronDown: mdiChevronDown,
      chevronUp: mdiChevronUp,
    },
    sets: {
      mdi,
    },
  },
});
