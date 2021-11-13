import { globalNotifications } from './state';

export const msg = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  globalNotifications.set({
    show: true,
    title: title,
    description: description,
    duration: 3000,
    type: 'success',
  });
};

export const error = (description: string) => {
  globalNotifications.set({
    show: true,
    title: 'Error',
    description: description,
    duration: 3000,
    type: 'warning',
  });
};

export const warn = (description: string) => {
  globalNotifications.set({
    show: true,
    title: 'Warning',
    description: description,
    duration: 3000,
    type: 'warning',
  });
};
