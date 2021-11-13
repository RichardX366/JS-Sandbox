import { createState } from '@hookstate/core';
import { Persistence } from '@hookstate/persistence';
import { IUser } from './types';

const globalNotifications = createState<{
  show: boolean;
  title: string;
  description?: string;
  duration?: number;
  type: 'error' | 'success' | 'warning';
}>({
  show: false,
  title: '',
  description: '',
  duration: 0,
  type: 'success',
});

const globalUser = createState<IUser | null>(null);
console.log(window.localStorage);

export { globalNotifications, globalUser };
