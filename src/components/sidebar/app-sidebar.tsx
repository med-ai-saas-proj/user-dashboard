'use client';

import {
  Book,
  ClipboardPlusIcon,
  GalleryVerticalEnd,
  KeyRound,
  PillIcon,
} from 'lucide-react';
import type * as React from 'react';
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
      name: 'API keys',
      url: '/api-keys',
      icon: KeyRound,
    },
    {
      name: 'API Reference',
      url: '/api-reference',
      icon: Book,
    },
  ],
  playground: [
    {
      name: 'EHR Summary',
      url: '/ehr-summary',
      icon: ClipboardPlusIcon,
    },
    {
      name: 'Rx Advisor',
      url: '/rx-advisor',
      icon: PillIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.management} label="Management" />
        <NavProjects projects={data.playground} label="Playground" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
