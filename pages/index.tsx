import { none, useHookstate } from '@hookstate/core';
import Head from 'next/head';
import { FC, useEffect, useRef } from 'react';
import { PlayIcon, UploadIcon, TrashIcon } from '@heroicons/react/solid';
import socket from '../helpers/socket';
import { Persistence } from '@hookstate/persistence';

interface IStudent {
  id: string;
  name: string;
  code: string;
}

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
  const findStudentById = (id: string) =>
    students[students.value.findIndex((x) => x.id === id)];
  const students = useHookstate<IStudent[]>([]);
  const user = useHookstate<{
    name: string;
    role: 'student' | 'teacher';
  }>({ name: '', role: 'student' });
  const code = useHookstate('');
  const fakeConsole = useHookstate<any[]>([]);
  const consoleDiv = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const socketSetup = async () => {
      const io = await socket;
      io.on('makeTeacher', () => user.role.set('teacher'));
      io.on('makeStudent', () => {
        students.set([]);
        user.role.set('student');
        code.set('');
      });
      io.on('init', (data) =>
        students.set(
          Object.keys(data).map((x) => {
            console.log(data[x]);
            return { id: x, name: data[x].name, code: data[x].code };
          })
        )
      );
      io.emit('init', user.value);
      io.on(
        'newStudent',
        ({ student, name }: { student: string; name: string }) => {
          students.merge([
            {
              id: student,
              name: name,
              code: '',
            },
          ]);
        }
      );
      io.on('removeStudent', (student: string) =>
        findStudentById(student)?.set(none)
      );
      io.on(
        'teacherCodeUpdate',
        ({ student, code }: { student: string; code: string }) =>
          findStudentById(student).code.set(code)
      );
      io.on('studentCodeUpdate', (newCode: string) => code.set(newCode));
      io.on(
        'nameChange',
        ({ student, name }: { student: string; name: string }) =>
          findStudentById(student).name.set(name)
      );
    };
    user.attach(Persistence('user'));
    socketSetup();
  }, []);
  return (
    <>
      <Head>
        <title>JS Sandbox</title>
      </Head>

      <div className='fixed inset-0 bg-gray-800 shadow-sm p-3 h-16 z-10'>
        <div className='flex justify-between'>
          <input
            type={user.role.value === 'student' ? 'text' : 'password'}
            className='text-white bg-gray-900 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-64 sm:text-sm border-gray-600 rounded-md'
            placeholder='Full Name'
            onChange={async (e) => {
              user.name.set(e.target.value);
              (await socket).emit('changeName', e.target.value);
            }}
            value={user.name.value}
          />
          {user.role.value === 'student' ? (
            <button
              onClick={() => runCode(code.value)}
              type='button'
              className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
            >
              Run Code
              <PlayIcon className='ml-3 -mr-1 h-5 w-5' aria-hidden='true' />
            </button>
          ) : null}
        </div>
      </div>

      <div
        className={`fixed w-full h-full bg-gray-500 p-4${
          user.role.value === 'teacher' ? ' overflow-y-scroll' : ''
        }`}
      >
        {user.role.value === 'student' ? (
          <div className='grid grid-cols-2 w-full h-full pt-16 gap-4'>
            <textarea
              rows={18}
              className='bg-gray-700 w-full text-white resize-none font-mono text-2xl shadow-sm focus:ring-blue-500 focus:border-blue-500 block rounded-md'
              value={code.value}
              onChange={async (e) => {
                code.set(e.target.value);
                (await socket).emit('studentChangeCode', e.target.value);
              }}
              onKeyPress={(e) => (e.ctrlKey ? runCode(code.value) : null)}
              data-gramm='false'
              data-gramm_editor='false'
              data-enable-grammarly='false'
            />
            <div
              ref={consoleDiv}
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
                <>
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
                      <span className='text-yellow-200'>'{x}'</span>
                    ) : typeof x === 'number' ? (
                      <span className='text-green-200'>{x}</span>
                    ) : typeof x === 'bigint' ? (
                      <span className='text-green-200'>{x.toString()}n</span>
                    ) : (
                      JSON.stringify(x)
                    )}
                  </div>
                </>
              ))}
              {setTimeout(() =>
                consoleDiv.current?.scroll(0, consoleDiv.current.scrollHeight)
              ) && false}
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-2 mt-16 gap-4 bg-blue'>
            {students.value.length ? (
              students.value.map((student) => (
                <div key={student.id}>
                  <div className='border-box rounded-t-md flex justify-between bg-gray-700 text-white text-3xl p-4'>
                    {student.name || 'No Name Inputted'}
                    <button
                      onClick={() => runCode(student.code)}
                      type='button'
                      className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                    >
                      Run Code
                      <PlayIcon
                        className='ml-3 -mr-1 h-5 w-5'
                        aria-hidden='true'
                      />
                    </button>
                  </div>
                  <textarea
                    rows={18}
                    className='bg-gray-700 w-full text-white resize-none font-mono text-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 block rounded-b-md'
                    value={student.code}
                    onChange={async (e) => {
                      const x = e.target.value;
                      (await socket).emit('teacherChangeCode', {
                        id: student.id,
                        code: x,
                      });
                    }}
                    onKeyPress={(e) =>
                      e.ctrlKey ? runCode(student.code) : null
                    }
                    data-gramm='false'
                    data-gramm_editor='false'
                    data-enable-grammarly='false'
                  />
                </div>
              ))
            ) : (
              <div className='mt-48 col-span-2 text-white text-center text-9xl font-bold'>
                There are currently
                <br />
                no students
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
