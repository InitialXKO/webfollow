<template>
  <div class="overflow" ref="readerRef">
    <div class="top-sider v-toolbar__content px-2">
      <div class="prepend-bar">
        <slot name="prepend-bar"></slot>
      </div>
      <div class="top-sider-title mx-auto w-100">
        <v-dialog-transition>
          <v-card-title
            class="text-truncate"
            v-show="scrollTop > 120 && !mobile"
            >{{ item.title }} | <small v-text="getSource()"></small>
          </v-card-title>
        </v-dialog-transition>
      </div>
      <div class="append-bar">
        <slot name="append-bar">
          <c-btn
            variant="text"
            icon
            title="稍后阅读"
            @click="toggleSaved"
            class="mr-2"
          >
            <v-icon>{{
              item.isSaved ? "mdi-playlist-minus" : "mdi-playlist-plus"
            }}</v-icon>
          </c-btn>
          <c-btn
            variant="text"
            :color="readerType == 'default' ? '' : 'primary'"
            title="内嵌网页"
            icon=" mdi-apple-safari"
            @click="readerType = readerType == 'default' ? 'HTML' : 'default'"
          >
          </c-btn>
          <!-- <c-btn
              variant="text"
              icon
              :title="item.feed?.title"
              :to="'/f/' + item?.feed?.id"
            >
              <img class="noclick" :src=" item?.feed?.icon" onerror="this.src='/logo.svg'" style="width:18px">
              </img>
            </c-btn> -->
          <c-btn
            size="small"
            variant="text"
            icon
            :title="item.isRead ? '未读' : '已读'"
            @click.stop="toggleRead"
          >
            <v-icon>{{
              item.isRead ? "mdi-radiobox-blank" : "mdi-radiobox-marked"
            }}</v-icon>
          </c-btn>

          <!-- <c-btn  variant="text" icon title="查看原文" :href="item.link">
              <v-icon> mdi-open-in-new</v-icon>
            </c-btn> -->
        </slot>
      </div>
    </div>
    <v-container class="reader-warp">
      <slot name="prepend"></slot>
      <slot>
        <iframe
          class="iframe"
          v-if="readerType == 'HTML'"
          :src="item.link"
          frameborder="0"
          referrerpolicy="origin"
          sandbox="allow-same-origin allow-popups allow-downloads allow-forms allow-scripts"
        ></iframe>
        <image-reader :item="item" v-else-if="item?.type == 'IMAGE'" />
        <basic-reader v-else-if="item?.type == 'BASIC'" :item="item" />
        <podcast-reader :item="item" v-else-if="item?.type == 'PODCAST'" />
        <video-reader :item="item" v-else-if="item.type == 'VIDEO'" />
      </slot>
    </v-container>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, watch, ref } from "vue";
import { useAppStore } from "@/store";
import { FeedItem } from "@/service/types";
import { useSideChapter } from "@/utils/useSideChapter";
import { useScroll } from "@/utils/scroll";
import { useDisplay } from "vuetify";
import BasicReader from "./BasicReader.vue";
import ImageReader from "./ImageReader.vue";
import VideoReader from "./VideoReader.vue";
import PodcastReader from "./PodcastReader.vue";
import { Marked } from "@/service";

const readerRef = ref();

const props = defineProps<{
  item: FeedItem;
}>();
const { scrollTop } = useScroll(readerRef);
const { mobile } = useDisplay();
const description = computed(() =>
  readerType.value == "default" ? props.item?.description || "" : ""
);
const readerType = ref("default");

useSideChapter(description, readerRef, {
  value: () => document.getElementById("chapters"),
});

watch(
  () => props.item.id,
  () => {
    setTimeout(() => {
      readerRef.value.scrollTop = 0;
    }, 100);
    if (!props.item.isRead && props.item.id) {
      appStore.read(
        Number(props.item.id),
        Marked.ITEM,
        appStore.lastRefeshTime,
        props.item.feedId
      );
    }
  }
);

const appStore = useAppStore();

onMounted(async () => {
  if (!props.item.isRead && props.item.id) {
    appStore.read(
      Number(props.item.id),
      Marked.ITEM,
      appStore.lastRefeshTime,
      props.item.feedId
    );
  }
});

function toggleSaved() {
  if (props.item.isSaved) {
    appStore.unsave(props.item.id);
  } else {
    appStore.save(props.item.id);
  }
}

function toggleRead() {
  if (props.item.isRead) {
    appStore.unread(props.item.id);
  } else {
    appStore.read(props.item.id);
  }
}

function getSource() {
  return props.item.feed?.title + " - " + props.item.author;
}
</script>
<style lang="scss" scoped>
.overflow {
  height: 100vh;
  overflow-y: scroll;
}
.top-sider {
  position: sticky !important;
  top: 0;
  z-index: 10;
  background-color: rgb(var(--v-theme-background));
  display: grid;
  grid-template-columns: auto minmax(5vw, 1fr) auto;
  align-items: center;
  padding: 0.5rem 0.3rem;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  height: 64px;
  > * {
    min-width: 120px;
    max-width: 760px;
  }
  a {
    text-decoration: none;
    color: rgb(var(--v-border-color));
  }
  .top-sider-title {
    text-align: center;
  }
}

.text-overflow {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.title {
  margin-bottom: 1rem;
}
.iframe {
  position: relative;
  width: 100%;
  height: calc(100vh - 102px);
  z-index: 10;
}

:deep(.reader-warp) .content {
  max-width: 730px;
  margin: 0 auto;
  padding: 0.5rem;
  line-height: var(--line-height);
  * {
    max-width: 100%;
  }
  h1,
  h2,
  h3,
  h4 {
    margin-top: var(--line-height);
    margin-bottom: 1rem;
  }
  p {
    padding: 0.8rem 0;
  }
  pre {
    margin-top: 1rem;
    margin-bottom: 1rem;
    background-color: rgba(var(--v-theme-on-code), 0.9);
    color: rgb(var(--v-theme-code));
    padding: 1rem;
    border-radius: 0.5rem;
    font-family: var(--code-font);
  }
}
</style>
