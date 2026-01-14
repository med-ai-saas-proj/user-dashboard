'use client';

import {
  Book,
  BotIcon,
  ClipboardPlusIcon,
  GalleryVerticalEnd,
  KeyRound,
  PillIcon,
  SearchIcon,
} from 'lucide-react';
import type * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/shadcn/sidebar';
import { NavProjects } from '@/components/sidebar/nav-projects';
import { NavUser } from '@/components/sidebar/nav-user';
import { TeamSwitcher } from '@/components/sidebar/team-switcher';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation('sidebar');

  const data = {
    teams: [
      {
        name: 'Acme Inc',
        logo: GalleryVerticalEnd,
        plan: 'Enterprise',
      },
    ],
    user: {
      name: 'Tom Cook',
      email: 'tom.cook@example.com',
      avatar: 'TC',
    },
    management: [
      {
        name: t('management.apiKeys.title'),
        url: '/api-keys',
        icon: KeyRound,
      },
      {
        name: t('management.apiReference.title'),
        url: '/api-reference',
        icon: Book,
      },
    ],
    playground: [
      {
        name: t('playground.ehrSummary.title'),
        url: '/ehr-summary',
        icon: ClipboardPlusIcon,
      },
      {
        name: t('playground.rxAdvisor.title'),
        url: '/rx-advisor',
        icon: PillIcon,
      },
      {
        name: t('playground.chatBot.title'),
        url: '/chat',
        icon: BotIcon,
      },
      {
        name: t('playground.aiSearch.title'),
        url: '/ai-search',
        icon: SearchIcon,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.management} label={t('management.title')} />
        <NavProjects projects={data.playground} label={t('playground.title')} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
