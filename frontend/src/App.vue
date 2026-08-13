<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { OverlayRoot, ToastProvider } from '@vyui/core'

import BottomNav, { type TabId } from './components/BottomNav.vue'
import QuickAddFab from './components/QuickAddFab.vue'
import SettingsDrawer from './components/SettingsDrawer.vue'
import AuthFlow from './screens/auth/AuthFlow.vue'
import Dashboard from './screens/Dashboard.vue'
import Transactions from './screens/Transactions.vue'
import Stats from './screens/Stats.vue'
import RecurringExpenses from './screens/RecurringExpenses.vue'
import Savings from './screens/Savings.vue'
import { useAuthStore } from './stores/auth'
import { useFinanceStore } from './stores/finance'
import { useThemeStore } from './stores/theme'

const activeTab = ref<TabId>('home')
const settingsOpen = ref(false)

const auth = useAuthStore()
const finance = useFinanceStore()
const theme = useThemeStore()

function navigate(tab: TabId) {
  activeTab.value = tab
}

onMounted(() => {
  auth.fetchSession()
})

watch(
  () => auth.isAuthenticated,
  (authenticated) => {
    if (authenticated) {
      finance.fetchAll()
      theme.hydrateFromServer(auth.user?.accentColor ?? null)
    } else {
      finance.reset()
    }
  },
)
</script>

<template>
  <view class="dark flex h-full flex-col bg-zinc-950">
    <ToastProvider>
      <view v-if="!auth.sessionChecked" class="flex h-full items-center justify-center">
        <text class="text-sm text-zinc-500">Caricamento…</text>
      </view>

      <AuthFlow v-else-if="!auth.isAuthenticated" />

      <template v-else>
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
        <SettingsDrawer v-model:open="settingsOpen" />
      </template>
    </ToastProvider>
    <!-- Portal target for VyModal/VyDrawer/VyPopover — must stay INSIDE the
         `.dark` scope, since portaled content only inherits CSS custom
         properties (--ui-bg, --ui-text, …) from its actual DOM ancestors,
         not from wherever <OverlayRoot/> happens to sit in the template. -->
    <OverlayRoot />
  </view>
</template>
