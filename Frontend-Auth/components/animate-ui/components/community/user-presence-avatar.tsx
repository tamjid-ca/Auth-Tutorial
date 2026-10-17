'use client';

import * as React from 'react';
import { motion, LayoutGroup } from 'motion/react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/animate-ui/components/animate/tooltip';
import { cn } from '@/lib/utils';

export type PresenceUser = {
  id: number;
  src?: string;
  fallback: string;
  tooltip: string;
  online: boolean;
};

const DEFAULT_USERS: PresenceUser[] = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    fallback: 'AK',
    tooltip: 'Arham (Admin - Active)',
    online: true,
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    fallback: 'SK',
    tooltip: 'Skyleen (Lead Dev - Active)',
    online: true,
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    fallback: 'CN',
    tooltip: 'Sophia (Security - Active)',
    online: true,
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    fallback: 'AW',
    tooltip: 'Adam (Auditor - Offline)',
    online: false,
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    fallback: 'GR',
    tooltip: 'Grace (Backend - Offline)',
    online: false,
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    fallback: 'JH',
    tooltip: 'John (DevOps - Offline)',
    online: false,
  },
];

const AVATAR_MOTION_TRANSITION = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
} as const;

const GROUP_CONTAINER_TRANSITION = {
  type: 'spring',
  stiffness: 150,
  damping: 20,
} as const;

interface UserPresenceAvatarProps {
  initialUsers?: PresenceUser[];
  className?: string;
  size?: 'sm' | 'default';
  showStatusLabel?: boolean;
}

function UserPresenceAvatar({
  initialUsers = DEFAULT_USERS,
  className,
  size = 'default',
  showStatusLabel = false,
}: UserPresenceAvatarProps) {
  const [users, setUsers] = React.useState<PresenceUser[]>(initialUsers);
  const [togglingGroup, setTogglingGroup] = React.useState<
    'online' | 'offline' | null
  >(null);

  React.useEffect(() => {
    if (initialUsers) {
      setUsers(initialUsers);
    }
  }, [initialUsers]);

  const online = users.filter((u) => u.online);
  const offline = users.filter((u) => !u.online);

  const toggleStatus = (id: number) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    setTogglingGroup(user.online ? 'online' : 'offline');
    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === id);
      if (idx === -1) return prev;
      const updated = [...prev];
      const target = updated[idx];
      if (!target) return prev;
      updated.splice(idx, 1);
      updated.push({ ...target, online: !target.online });
      return updated;
    });
    setTimeout(() => setTogglingGroup(null), 500);
  };

  const avatarSizeClass = size === 'sm' ? 'size-8 text-[11px]' : 'size-11 text-xs';
  const containerHeightClass = size === 'sm' ? 'h-9 -space-x-2' : 'h-12 -space-x-3';

  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      <LayoutGroup>
        <TooltipProvider>
          {online.length > 0 && (
            <motion.div
              layout
              className={cn(
                'bg-emerald-500/20 dark:bg-emerald-500/10 border border-emerald-500/30 p-1 rounded-full shadow-xs',
                togglingGroup === 'online' ? 'z-5' : 'z-10',
              )}
              transition={GROUP_CONTAINER_TRANSITION}
            >
              <div
                key={online.map((u) => u.id).join('_') + '-online'}
                className={cn("flex items-center", containerHeightClass)}
              >
                {online.map((user) => (
                  <Tooltip key={user.id}>
                    <TooltipTrigger asChild>
                      <motion.div
                        layoutId={`avatar-${user.id}`}
                        className="cursor-pointer relative"
                        onClick={() => toggleStatus(user.id)}
                        animate={{
                          filter: 'grayscale(0)',
                          scale: 1,
                        }}
                        transition={AVATAR_MOTION_TRANSITION}
                        initial={false}
                      >
                        <Avatar className={cn(avatarSizeClass, "border-2 border-background shadow-xs hover:scale-105 transition-transform")}>
                          {user.src && <AvatarImage src={user.src} alt={user.tooltip} />}
                          <AvatarFallback>{user.fallback}</AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{user.tooltip}</p>
                      <p className="text-[10px] text-emerald-400">Click to set offline</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </motion.div>
          )}

          {offline.length > 0 && (
            <motion.div
              layout
              className={cn(
                'bg-muted/60 border border-border/40 p-1 rounded-full shadow-xs opacity-75 hover:opacity-100 transition-opacity',
                togglingGroup === 'offline' ? 'z-5' : 'z-10',
              )}
              transition={GROUP_CONTAINER_TRANSITION}
            >
              <div
                key={offline.map((u) => u.id).join('_') + '-offline'}
                className={cn("flex items-center", containerHeightClass)}
              >
                {offline.map((user) => (
                  <Tooltip key={user.id}>
                    <TooltipTrigger asChild>
                      <motion.div
                        layoutId={`avatar-${user.id}`}
                        className="cursor-pointer relative"
                        onClick={() => toggleStatus(user.id)}
                        animate={{
                          filter: 'grayscale(0.85)',
                          scale: 1,
                        }}
                        transition={AVATAR_MOTION_TRANSITION}
                        initial={false}
                      >
                        <Avatar className={cn(avatarSizeClass, "border-2 border-background shadow-xs hover:scale-105 transition-transform")}>
                          {user.src && <AvatarImage src={user.src} alt={user.tooltip} />}
                          <AvatarFallback>{user.fallback}</AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 size-2 rounded-full bg-muted-foreground ring-1 ring-background" />
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{user.tooltip}</p>
                      <p className="text-[10px] text-amber-400">Click to set online</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </motion.div>
          )}
        </TooltipProvider>
      </LayoutGroup>

      {showStatusLabel && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            {online.length} online
          </span>
          <span>•</span>
          <span>{offline.length} away</span>
        </div>
      )}
    </div>
  );
}

export { UserPresenceAvatar };
