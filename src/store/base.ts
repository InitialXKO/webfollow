// stores/counter.js
import { defineStore } from 'pinia'
import { onMounted, reactive, Reactive } from 'vue'
import { Marked, listSavedIds, listUnreadIds, read as read0, unread as unread0, save as save0, unsave as unsave0 } from '@/service'

export const useBaseStore = defineStore('base', () => {
    const saved_item_ids: Reactive<Set<number>> = reactive(new Set(JSON.parse(localStorage.getItem('sids')||"[]")))
    const unread_item_ids: Reactive<Set<number>> = reactive(new Set())

    async function read(id: number, marked: Marked, before?: number) {
        await read0(id, marked, before)
        if (marked == Marked.ITEM) {
            unread_item_ids.delete(id)
        } else {
            unread_item_ids.clear();
            (await listUnreadIds()).forEach((item: number) => unread_item_ids.add(item));
        }
    }

    async function unread(id: number, marked: Marked, before?: number) {
        await unread0(id, marked, before)
        if (marked == Marked.ITEM) {
            unread_item_ids.add(id)
        } else {
            unread_item_ids.clear();
            (await listUnreadIds()).forEach((item: number) => unread_item_ids.add(item));
        }
    }

    async function save(id: number) {
        await save0(id)
        saved_item_ids.add(id)
        localStorage.setItem('sids', JSON.stringify(Array.from(saved_item_ids)))
    }

    async function unsave(id: number) {
        await unsave0(id)
        saved_item_ids.delete(id)
        localStorage.setItem('sids', JSON.stringify(Array.from(saved_item_ids)))
    }

    onMounted(async () => {
        initData(await listUnreadIds(), await listSavedIds())
    })

    async function initData(uids: number[], sids: number[]) {
        sids.forEach((item: number) => saved_item_ids.add(item));
        uids.forEach((item: number) => unread_item_ids.add(item));
        localStorage.setItem('sids', JSON.stringify(sids))
    }

    async function refresh(cb: ()=>{}) {
        const d = await listUnreadIds()
        if (d.length != unread_item_ids.size) {
            unread_item_ids.clear()
            saved_item_ids.clear()
            initData(d, await listSavedIds())
            await cb()
        }

    }

    return { saved_item_ids, unread_item_ids, read, unread, save, unsave, refresh }
})

