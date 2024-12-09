<template>

    <div class="sidebar" v-bind="$attrs">
        <v-list nav class="sidebar-list">
            <div class="sidebar-top">
                <slot name="top"></slot>
                <v-list-item prepend-icon="mdi-inbox" value="all" title="全部文章" to="/all">
                    <template v-slot:append>
                        <small v-if="appStore.unReadQty" v-text="appStore.unReadQty"></small> 
                    </template>
                </v-list-item>
                <v-list-item prepend-icon="mdi-format-list-bulleted" value="next" title="稍后阅读" to="/next">
                    <template v-slot:append>
                        <small v-if="appStore.savedQty" v-text="appStore.savedQty"></small>
                    </template>
                </v-list-item>
                <v-list-item prepend-icon=" mdi-rocket-launch-outline" value="recom" title="猜你喜欢" to="/recom">
                    <template v-slot:append>
                        <small v-if="appStore.unReadQty" v-text="appStore.unReadQty"></small>
                    </template>
                </v-list-item>
            </div>
            <v-list-subheader>FEEDS</v-list-subheader>
            <template v-for="gItem in feedStore.subscriptions">
            <v-list-group   v-if="gItem.feeds.length">
                <template v-slot:activator="{ isOpen, props }">
                    <v-list-item v-bind="props" :title="gItem.title">
                        <template #prepend>
                            <v-icon :icon="isOpen ? 'mdi-chevron-up' : ' mdi-chevron-down'">
                            </v-icon>
                        </template>
                        <template #append>
                            <small v-if="gItem.unreadQty" v-text="gItem.unreadQty"></small>
                        </template>
                    </v-list-item>
                </template>
                <v-list-item title="全部" :value="'/c/' + gItem.id" :to="'/c/' + gItem.id"> </v-list-item>
                <v-list-item v-for="subItem in gItem.feeds" :key="gItem.id+'-'+subItem.id" :value="gItem.id+'-'+subItem.id" :class="subItem.isFailure?'text-red-accent-3':''"
                    :to="'/f/' + subItem.id" @contextmenu.prevent="showContextMenu($event, subItem)">
                    <template #prepend>
                        <img :src="subItem.icon" onerror="this.src='/logo.svg'" width="16">
                        </img>
                    </template>
                    <v-list-item-title  v-text="subItem.title">
                    </v-list-item-title>
                    <template v-slot:append>
                        <small v-if="subItem.unreadQty" v-text="subItem.unreadQty"></small>
                    </template>
                </v-list-item>
            </v-list-group>
            </template>
        </v-list>

        <div v-if="mobile" class="plus mx-auto">
            <v-btn color="surface-variant" to="/subscribe" icon="mdi-plus"></v-btn>
            <v-btn class="ml-2" variant="flat" to="/download">下载app</v-btn>
        </div>

        <v-card v-show="contextMenuVisible" style="position: fixed; z-index: 10000"
            :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }">
            <v-list nav>
                <v-list-item prepend-icon="mdi-pencil-box-outline" @click="handleAction('edit')">编辑订阅源</v-list-item>
                <v-list-item prepend-icon="mdi-delete-outline" @click="handleAction('delete')">取消订阅</v-list-item>
            </v-list>
        </v-card>
    </div>

   


    <v-dialog v-model="editable" max-width="500">
        <v-card  prepend-icon="mdi-pencil-box-outline" title="编辑订阅源">
            <v-card-text>
                <v-form ref="form">
                    <v-text-field label="标题" disabled required v-model="currentItem.title"></v-text-field>
                    <v-text-field label="rss地址" disabled required v-model="currentItem.url"></v-text-field>
                    <v-text-field label="网站地址" disabled required v-model="currentItem.siteUrl"></v-text-field>
                    <v-select label="分组" v-model="currentItem.groupName" required :items="feedStore.groups.map(g => g.title)"
                        :rules="[v => !!v || '分组是必填']"></v-select>


                    <v-btn class="mt-4" block :loading="loading" color="primary" @click="onUpdate">
                        保存
                    </v-btn>
                </v-form>
            </v-card-text>

        </v-card>
    </v-dialog>

    <v-dialog
      v-model="deleteDialog"
      width="auto"
    >
      <v-card
        width="400"
        prepend-icon="mdi-delete-outline"
        text="确认取消订阅?"
        title="取消订阅"
      >
      <v-card-text>
        <v-btn
          :loading="loading"
          block
          color="error"
            text="确认"
            @click="onDelete"
          ></v-btn>
      </v-card-text>
     
      </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, Ref } from "vue";
import { useFeedsStore, useAppStore } from "@/store";
import { useDisplay } from "vuetify";

const { mobile } = useDisplay();
const feedStore = useFeedsStore();
const appStore = useAppStore();
const editable = ref(false)
const deleteDialog = ref(false)
const form: Ref<any> = ref()
const currentItem: Ref<any> = ref({ title: undefined })
const loading = ref(false)

onMounted(() => {
    document.addEventListener("click", hideContextMenu);
});

onBeforeUnmount(() => {
    document.removeEventListener("click", hideContextMenu);
});

const hideContextMenu = () => {
    contextMenuVisible.value = false; // 隐藏菜单
};

const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

const showContextMenu = (event: any, item: any) => {
    contextMenuX.value = event.clientX;
    contextMenuY.value = event.clientY;
    contextMenuVisible.value = true;
    item.groupName = feedStore.groups.filter(g=>g.id==item.groupId)[0].title
    currentItem.value = item
};

const handleAction = (action: string) => {
    contextMenuVisible.value = false;
    if (action === "edit") {
        editable.value = true
    } else if (action === "delete") {
        deleteDialog.value = true
    }
};


async function onUpdate() {
    loading.value = true
    if(!currentItem.value.groupName){
        alert('请选择分组')
    }
    const group_id = feedStore.groups.filter(g=>g.title==currentItem.value.groupName)[0].id
    await feedStore.updateFeed(currentItem.value.id, group_id)
    loading.value = false
    editable.value=false
}



async function onDelete() {
    loading.value = true
    await feedStore.deleteFeed(currentItem.value.id)
    loading.value = false
    deleteDialog.value=false
}
</script>
<style scoped>
.sidebar-list {
    position: relative;
    max-height: 100vh;
    overflow: auto;
    /* background-color: rgb(var(--v-theme-background)); */
    background-color: transparent;
    padding-top: 0;
    min-height: 100vh;
}

.sidebar-top {
    padding-top: 0.5rem;
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: rgb(var(--sidbar-bg)); /** rgb(var(--v-theme-background)); */
    /* border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); */
}

.plus {
    display: inline-block;
    position: fixed;
    bottom: 0;
    padding: 1rem;
    z-index: 1000;
}
</style>