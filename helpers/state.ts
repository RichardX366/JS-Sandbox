import { createState } from '@hookstate/core';
import { IUser } from './types';

const globalUser = createState<IUser | null>(null);

export { globalUser };
