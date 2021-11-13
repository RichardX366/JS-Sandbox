import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import 'tailwindcss/tailwind.css';
import { globalUser } from '../helpers/state';
import { Persistence } from '@hookstate/persistence';

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  useEffect(() => {
    globalUser.attach(Persistence('state.user'));
  }, []);
  return <Component {...pageProps} />;
};

export default MyApp;
