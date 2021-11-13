import { useHookstate } from '@hookstate/core';
import Head from 'next/head';
import { FC, useEffect } from 'react';
import { PlayIcon, UploadIcon, TrashIcon } from '@heroicons/react/solid';
import { globalUser } from '../helpers/state';

const Home: FC = () => {
  const runCode = (code: string) => {
    try {
      if (code.replaceAll(' ', '').replaceAll('\n', '')) {
        newLog(eval(code.replaceAll('console.log', 'newLog')));
      }
    } catch (e: any) {
      console.error(e);
      const err = e.stack.split('\n');
      const location = err[1].split(':');
      fakeConsole.merge([
        {
          isCustomError: true,
          top: err[0],
          location: [
            location[location.length - 2],
            location[location.length - 1].replace(')', ''),
          ],
        },
      ]);
    }
  };
  const newLog = (...args: any) => {
    console.log(...args);
    fakeConsole.merge(args);
  };
  const handleConsoleScroll = (e: React.UIEvent<HTMLElement>) => {
    e.preventDefault();
  };
  const user = useHookstate(globalUser);
  const inputs = useHookstate({ name: '', code: '' });
  const fakeConsole = useHookstate<any[]>([]);
  useEffect(() => {}, []);

  return (
    <>
      <Head>
        <title>JS Sandbox</title>
      </Head>

      <div className='fixed inset-0 bg-gray-800 shadow-sm p-3 h-16 z-10'>
        <div className='flex justify-between'>
          <input
            type='text'
            className='text-white bg-gray-900 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-64 sm:text-sm border-gray-600 rounded-md'
            placeholder='Full Name'
          />
          <div className='grid grid-cols-2 gap-3'>
            <button
              type='button'
              className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              Send Code
              <UploadIcon className='ml-3 -mr-1 h-5 w-5' aria-hidden='true' />
            </button>
            <button
              onClick={() => runCode(inputs.code.value)}
              type='button'
              className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
            >
              Run Code
              <PlayIcon className='ml-3 -mr-1 h-5 w-5' aria-hidden='true' />
            </button>
          </div>
        </div>
      </div>

      <div className='fixed w-full h-full bg-gray-500 p-4'>
        <div className='grid grid-cols-2 w-full h-full pt-16 gap-4'>
          <textarea
            rows={18}
            className='bg-gray-700 w-full text-white resize-none font-mono text-2xl shadow-sm focus:ring-blue-500 focus:border-blue-500 block rounded-md'
            value={inputs.code.value}
            onChange={(e) => inputs.code.set(e.target.value)}
            onKeyPress={(e) => (e.ctrlKey ? runCode(inputs.code.value) : null)}
            data-gramm='false'
            data-gramm_editor='false'
            data-enable-grammarly='false'
          />
          <div
            onScroll={handleConsoleScroll}
            className='w-full bg-gray-700 rounded-md text-white divide-solid divide-y-2 divide-gray-400 overflow-y-scroll'
          >
            <div className='flex justify-between align-center text-3xl p-2 pl-4 border-b-2 border-gray-400'>
              <span className='pt-3'>Model Console:</span>
              <button
                onClick={() => fakeConsole.set([])}
                type='button'
                className='inline-flex items-center m-2 p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
              >
                <TrashIcon className='h-6 w-6' aria-hidden='true' />
              </button>
            </div>
            {fakeConsole.value.map((x, i) => (
              <div
                className={`${
                  x?.isCustomError ? 'bg-opacity-50 bg-red-900 ' : ''
                }py-2 px-3`}
                key={i}
              >
                {x?.isCustomError ? (
                  <>
                    {x.top}
                    <br />
                    &nbsp;&nbsp;
                    {`At line ${x.location[0]}, column ${x.location[1]}`}
                  </>
                ) : x === null ? (
                  <span className='text-blue-300 font-bold'>null</span>
                ) : x === undefined ? (
                  <span className='text-blue-300 font-bold'>undefined</span>
                ) : typeof x === 'boolean' || typeof x === 'function' ? (
                  <span className='text-blue-300 font-bold'>
                    {x.toString()}
                  </span>
                ) : typeof x === 'string' ? (
                  <span className='text-yellow-200'>{x}</span>
                ) : typeof x === 'number' ? (
                  <span className='text-green-200'>{x}</span>
                ) : typeof x === 'bigint' ? (
                  <span className='text-green-200'>{x.toString()}n</span>
                ) : (
                  JSON.stringify(x)
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
