<template>
  <div class="basic-reader">
    <div class="title-container">
      <a class="title-warp" :href="item.link">
        <p class="text-h4 title">{{ item.title }}</p>
        <p class=" opacity-70 sub-ext">
          <span>
            <v-icon size="small" class="mr-2">
              <img :src="item?.feed?.icon" class="noclick" onerror="this.src='/logo.svg'"
                style="width:16px;border-radius: 3px; margin-top: -2px;">
              </img>
            </v-icon>
            <span>
              <router-link @click.stop="" class="a" title="前往订阅源" :to="'/f/' + item?.feed?.id"
                v-text="props.item.feed?.title"></router-link>
              <span v-text="getSource()"></span>
            </span>
          </span>

          <span>

            <v-icon size="small" class="mr-1">mdi-clipboard-text-clock-outline</v-icon>
            {{ getDate() }}
          </span>
        </p>

      </a>
    </div>
    <div class="chapter-warp">
      <slot></slot>
    </div>
    <div class="summary content bg-gradient" v-if="summary || summarizing">
      <div class="mb-2 d-flex align-center justify-space-between">
        <div class="d-flex align-center text-primary">
          <v-icon size="small" class="mr-2">mdi-creation-outline</v-icon>
          AI 总结
        </div>
        <c-btn v-if="!summarizing" icon size="small" variant="text" color="primary" title="强制刷新AI总结"
          @click="emit('forceRefresh')" class="ml-2">
          <v-icon>mdi-refresh</v-icon>
        </c-btn>
      </div>
      <v-skeleton-loader v-if="summarizing" type="article"></v-skeleton-loader>
      <div v-else v-html="md2html(summary || '')"></div>
    </div>
    <div class="content" v-html="item.html"></div>
  </div>
</template>
<script setup lang="ts">
import { computed, inject } from "vue";
import { FeedItem } from "@/service/types";
import { useSideChapter } from "@/utils/useSideChapter";
import { summarySymbol, summarizingSymbol } from "../InjectionSymbols";
import { md2html } from "@/utils/mdUtils";
const props = defineProps<{
  readonly item: FeedItem;
  readonly readerRef: HTMLElement | undefined;
}>();
const description = computed(() => props.item?.description || "");
const readerRef = computed(() => props.readerRef);
useSideChapter(description, readerRef, {
  value: () => document.getElementById("chapters"),
});
function getDate() {
  const options: any = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // 24小时制
  };
  const formattedDate = new Date(props.item.pubDate * 1000).toLocaleString(
    "zh-CN",
    options
  );
  return `${formattedDate}`;
}
function getSource() {
  return props.item.author ? " - " + props.item.author : "";
}
const summary: string | undefined = inject(summarySymbol);
const summarizing: boolean | undefined = inject(summarizingSymbol);
const emit = defineEmits<{
  (e: "forceRefresh"): void;
}>();
</script>
<style lang="scss" scoped>
.text-overflow {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title-container {
  margin: 0 auto 2rem;
  text-align: center;
  max-width: calc(var(--reader-main-max-width) + 42px);
  padding: 1.5rem;
  border-radius: 0.5rem;

  &:hover {
    background-color: rgb(var(--v-theme-surface-light));
  }

  a {
    text-decoration: none;
    color: rgb(var(--v-theme-surface-variant));
  }

  .title-warp {
    text-align: start;
  }

  .title {
    margin-bottom: 1rem;
    line-height: 3rem;
  }
}

.basic-reader {
  background-color: rgb(var(--v-theme-background));
}

.a {
  color: rgb(var(--v-theme-surface-variant));
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    color: rgb(var(--v-theme-primary));
  }
}

.chapter-warp {
  float: left;
  position: sticky;
  top: 10rem;
  left: calc(50% + var(--reader-main-max-width) / 2 + 2rem);
  max-width: 210px;
}

.summary {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding: 1rem !important;
  border-radius: 0.5rem;
  max-width: calc(var(--reader-main-max-width) + 2rem) !important;
}

.sub-ext {
  column-gap: 2rem;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

@media (max-width: 1280px) {
  .chapter-warp {
    position: static;
    float: none;
    right: 0;
    max-width: 100%;
  }

  .sub-ext {
    display: grid;
    grid-template-columns: 1fr;
    row-gap: 1rem;
  }
}
</style>
<style lang="scss">
.basic-reader {
  .bar-left {
    width: 150px;
  }

  .summary {

    ol,
    ul {
      padding-inline-start: 1rem;
    }
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    img {
      max-height: 2rem;
      margin-right: 1rem;
    }
  }

  ul {
    li {
      &::marker {
        color: rgb(var(--v-theme-primary));
        opacity: 1;
      }
    }
  }
}
</style>
