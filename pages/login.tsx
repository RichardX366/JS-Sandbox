import Head from 'next/head';
import { LockClosedIcon } from '@heroicons/react/solid';
import { useState } from '@hookstate/core';
import AuthService from '../services/auth';
import { globalUser } from '../helpers/state';
import { useRouter } from 'next/router';
import { FC, MouseEvent } from 'react';

const Login: FC = () => {
  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <div className='min-h-screen flex items-start justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'></div>
      </div>
    </>
  );
};

export default Login;
