import { useState } from '@hookstate/core';
import Head from 'next/head';
import Link from 'next/link';
import { FC, useEffect } from 'react';

const Home: FC = () => {
  return (
    <div className='container'>
      <Head>
        <title>JS Sandbox</title>
      </Head>
    </div>
  );
};

export default Home;
