import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import 'tailwindcss/tailwind.css';
import Notification from '../components/Notification';
import { useRouter } from 'next/router';
import { globalUser } from '../helpers/state';

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  const router = useRouter(); /* 
  useEffect(() => {
    if (!globalUser.value) {
      router.push('login');
    }
  }, [globalUser]); */
  return (
    <>
      <Component {...pageProps} />
      <Notification />
    </>
  );
};

export default MyApp;
