'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Sidebar } from '@/components/layout/sidebar'
import { TopBar } from '@/components/layout/topbar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Footer } from '@/components/layout/footer'
import { HomeView } from '@/components/views/home-view'
import { CommunitiesView } from '@/components/views/communities-view'
import { ChatView } from '@/components/views/chat-view'
import { StreamHubView } from '@/components/views/stream-hub-view'
import { StoreView } from '@/components/views/store-view'
import { ProfileView } from '@/components/views/profile-view'
import { Skeleton } from '@/components/ui/skeleton'

export function AppShell() {
  const view = useAppStore((s) => s.view)
  const currentUser = useAppStore((s) => s.currentUser)
  const refreshUser = useAppStore((s) => s.refreshUser)

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <TopBar />
          <main className="flex-1 pb-20 md:pb-0">
            {!currentUser ? (
              <div className="flex items-center justify-center p-12">
                <div className="space-y-4 w-full max-w-md">
                  <Skeleton className="h-64 w-full rounded-2xl" />
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ) : view === 'home' ? (
              <HomeView />
            ) : view === 'communities' ? (
              <CommunitiesView />
            ) : view === 'chat' ? (
              <ChatView />
            ) : view === 'streams' ? (
              <StreamHubView />
            ) : view === 'store' ? (
              <StoreView />
            ) : view === 'profile' ? (
              <ProfileView />
            ) : null}
          </main>
          <Footer />
        </div>
      </div>
      <MobileNav />
    </div>
  )
}
