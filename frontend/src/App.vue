<script setup lang="ts">
import { ref } from 'vue'
import { OverlayRoot, ToastProvider } from '@vyui/core'

import BottomNav, { type TabId } from './components/BottomNav.vue'
import QuickAddFab from './components/QuickAddFab.vue'
import SettingsDrawer from './components/SettingsDrawer.vue'
import Dashboard from './screens/Dashboard.vue'
import Transactions from './screens/Transactions.vue'
import Stats from './screens/Stats.vue'
import RecurringExpenses from './screens/RecurringExpenses.vue'
import Savings from './screens/Savings.vue'

const activeTab = ref<TabId>('home')
const settingsOpen = ref(false)

function navigate(tab: TabId) {
  activeTab.value = tab
}
</script>

<template>
  <view class="dark flex h-full flex-col bg-zinc-950">
    <ToastProvider>
      <view class="relative flex-1">
        <scroll-view scroll-orientation="vertical" class="h-full">
          <Dashboard v-if="activeTab === 'home'" @navigate="navigate" @open-settings="settingsOpen = true" />
          <Transactions v-else-if="activeTab === 'transazioni'" />
          <Stats v-else-if="activeTab === 'statistiche'" />
          <RecurringExpenses v-else-if="activeTab === 'ricorrenti'" />
          <Savings v-else-if="activeTab === 'risparmi'" />
        </scroll-view>
        <QuickAddFab />
      </view>
      <BottomNav :active="activeTab" @change="navigate" />
    </ToastProvider>
    <SettingsDrawer v-model:open="settingsOpen" />
    <!-- Portal target for VyModal/VyDrawer/VyPopover — must stay INSIDE the
         `.dark` scope, since portaled content only inherits CSS custom
         properties (--ui-bg, --ui-text, …) from its actual DOM ancestors,
         not from wherever <OverlayRoot/> happens to sit in the template. -->
    <OverlayRoot />
  </view>
</template>
