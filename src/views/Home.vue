<template>
  <v-responsive @contextmenu.prevent>
    <v-app :theme="themeMode">
      <v-navigation-drawer class="sidebar-warp" v-if="mobile" v-model="show">
        <SideBar>
          <template #top>
            <div class="mb-2 d-flex justify-space-between align-center">
              <v-list-item
                :title="appStore.authInfo.username"
                @click="router.push('/login')"
              >
                <template #prepend>
                  <v-avatar
                    size="30px"
                    color="secondary"
                    :title="appStore.authInfo.username"
                  >
                    {{ appStore.authInfo.username.substring(0, 2) }}
                  </v-avatar>
                </template>
                <template #append>
                  <v-icon size="16px">mdi-exit-to-app</v-icon>
                </template>
              </v-list-item>

              <c-btn @click="settingable = true" icon=" mdi-cog-outline">
              </c-btn>
            </div>
            <v-divider class="mb-2"></v-divider>
          </template>
          <template #footer>
            <div style="height: 5rem"></div>
          </template>
        </SideBar>
      </v-navigation-drawer>
      <v-navigation-drawer v-else :model-value="!hideSide" rail>
        <v-list-item
          class="my-2"
          prepend-avatar="/logo.svg"
          title="webfollow"
          @click="router.push('/')"
        >
        </v-list-item>
        <v-divider></v-divider>

        <v-list-item
          class="mt-1"
          prepend-icon="mdi-plus"
          title="添加"
          @click="router.push('/subscribe')"
        ></v-list-item>
        <v-list-item
          class="mt-1"
          prepend-icon="mdi-professional-hexagon"
          value="combo"
          @click="router.push('/combo')"
        ></v-list-item>
        <v-list-item
          class="mt-1"
          prepend-icon="mdi-download"
          value="app"
          @click="router.push('/download')"
        ></v-list-item>

        <div class="bottom">
          <v-list-item value="play" @click="showPlayList = !showPlayList">
            <template #prepend>
              <v-icon :class="{ spinner: playListStore.isPlaying }">
                {{
                  playListStore.isPlaying
                    ? "mdi-music-circle-outline"
                    : "mdi-headphones"
                }}
              </v-icon>
            </template>
          </v-list-item>
          <v-list-item class="text-center" href="https://i.webfollow.cc">
            回到老版
          </v-list-item>
        </div>
      </v-navigation-drawer>
      <v-navigation-drawer width="320" temporary v-model="showPlayList">
        <PlayList></PlayList>
      </v-navigation-drawer>
      <v-main :class="{ cols: !mobile, hideside: hideSide || mobile }">
        <v-slide-x-transition>
          <div v-show="!mobile && !hideSide">
            <SideBar>
              <template #top>
                <div class="mb-2 d-flex justify-space-between align-center">
                  <c-btn
                    variant="text"
                    icon="mdi-backburger"
                    @click="hideSide = !hideSide"
                    title="关闭边栏"
                  ></c-btn>
                  <c-btn @click="settingable = true" icon>
                    <v-avatar
                      size="26px"
                      color="secondary"
                      :title="appStore.authInfo.username"
                    >
                      {{ appStore.authInfo.username.substring(0, 2) }}
                    </v-avatar>
                  </c-btn>
                </div>
              </template>
            </SideBar>
          </div>
        </v-slide-x-transition>
        <div class="flexible">
          <c-btn
            class="ma-2 menu-warp"
            icon="mdi-menu"
            v-if="mobile"
            @click="show = !show"
          ></c-btn>
          <v-img
            v-else-if="hideSide"
            src="/logo.svg"
            class="ma-4 menu-warp"
            width="26"
            title="打开边栏"
            @click="hideSide = !hideSide"
          ></v-img>
          <!-- <c-btn
            v-else-if="hideSide"
            class="ma-2 menu-warp"
            variant="text"
            icon="mdi-menu"
            title="打开边栏"
            @click="hideSide = !hideSide"
          ></c-btn> -->

          <router-view></router-view>
        </div>
        <v-btn
          v-show="mobile && playListStore.playlist.length"
          icon
          color="primary"
          class="podcast-player"
          @click="showPlayList = !showPlayList"
        >
          <v-icon :class="{ spinner: playListStore.isPlaying }">
            {{
              playListStore.isPlaying
                ? "mdi-music-circle-outline"
                : "mdi-headphones"
            }}
          </v-icon>
        </v-btn>
      </v-main>
      <v-dialog max-width="960px" v-model="settingable">
        <Settings @onclose="settingable = false"></Settings>
      </v-dialog>
    </v-app>
  </v-responsive>
</template>
<script setup async>
import { useDisplay } from "vuetify";
import { useRoute, useRouter } from "vue-router";
import { onBeforeMount, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import {
  useAppStore,
  useSettingsStore,
  useFeedsStore,
  usePlayListStore,
} from "@/store";
import Settings from "./settings/Settings.vue";
import SideBar from "./sub/SideBar.vue";
import PlayList from "./sub/PlayList.vue";

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const feedStore = useFeedsStore();
const playListStore = usePlayListStore();
const { mobile } = useDisplay();
const { appearance } = storeToRefs(settingsStore);
const router = useRouter();
const route = useRoute();
const title = ref("");
const hideSide = ref(false);
const settingable = ref(false);
const showPlayList = ref(false);
const show = ref(false);

const themeMode = ref(appearance.value.themeMode);

// 监听系统主题变化
watch(
  () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  (isDark) => {
    if (appearance.value.themeMode == "system") {
      themeMode.value = isDark ? "dark" : "light";
    }
  },
  { immediate: true }
);

watch(
  () => appearance.value.themeMode,
  () => {
    themeMode.value = appearance.value.themeMode;
    if (appearance.value.themeMode == "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      themeMode.value = isDark ? "dark" : "light";
    }
  }
);

watch(hideSide, () => {
  settingsStore.appearance.hideSidebar = hideSide.value;
  settingsStore.saveToLocalStorage();
});
onBeforeMount(() => {
  hideSide.value = settingsStore.appearance.hideSidebar;
});

onMounted(() => {
  // 默认启动页
  let startPage = settingsStore.general.startPage;
  if (route.fullPath == "/") {
    if (startPage == "all") {
      router.push("/all");
    } else if (startPage == "recom") {
      router.push("/recom");
    } else if (startPage == "next") {
      router.push("/next");
    } else if (startPage == "firstfolder") {
      if (feedStore.subscriptions.length) {
        const gid = feedStore.subscriptions[0].id;
        router.push("/c/" + gid);
      } else {
        setTimeout(() => {
          if (feedStore.subscriptions.length) {
            const gid = feedStore.subscriptions[0].id;
            router.push("/c/" + gid);
          }
        }, 1500);
      }
    }
  }
});
</script>
<style lang="scss" scoped>
.cols {
  display: grid;
  grid-template-columns: auto 1fr;
  :deep(.sidebar) {
    position: relative;
    border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    overflow: auto;
    resize: horizontal;
    min-width: 230px;
    width: 260px;
    max-width: 36vw;
  }
}
.hideside {
  grid-template-columns: 1fr;
}

.toogle {
  position: absolute;
  top: 30vh;
  z-index: 10000;
}
.bottom {
  position: absolute;
  bottom: 1rem;
  width: 100%;
}
.sidebar-warp :deep(.sidebar) {
  --sidbar-bg: var(--v-theme-background);
}
:deep(.sidebar) {
  background-color: rgb(var(--sidbar-bg));
}
.menu-warp {
  position: absolute;
  top: 0;
  z-index: 100;
  // background-color: rgb(var(--sidbar-bg));
  // border-radius: 50%;
}
.podcast-player {
  position: fixed;
  bottom: 1.5rem;
  left: 1.5rem;
}
</style>
<style lang="scss">
.flexible {
  flex: 1;
}
.hideside {
  .top-bar .v-app-bar-title {
    margin-left: 3rem;
  }
}
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.spinner {
  animation: rotate 2s linear infinite;
}
.spinner-2 {
  animation: rotate 20s linear infinite;
}
</style>
