import type { ClientRequest } from 'http';
import { Server } from 'socket.io';

const students: { [key: string]: { name: string; code: string } } = {};

const ioHandler = (req: ClientRequest, res: any) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, { path: '/io/' });

    io.on('connection', (socket) => {
      const removeStudent = () => {
        io.to('teachers').emit('removeStudent', socket.id);
        delete students[socket.id];
      };
      const newStudent = ({ name }: { name: string }) => {
        students[socket.id] = { name: name, code: '' };
        io.to('teachers').emit('newStudent', {
          student: socket.id,
          name: name,
        });
      };
      socket.on('init', (user) => {
        if (user.name === process.env.TEACHER_NAME) {
          socket.join('teachers');
          socket.emit('init', students);
        } else {
          newStudent(user);
        }
      });
      socket.on('changeName', (fullName) => {
        if (fullName === process.env.TEACHER_NAME) {
          removeStudent();
          socket.join('teachers');
          socket.emit('init', students);
          socket.emit('makeTeacher');
        } else {
          if (!students[socket.id]) {
            socket.leave('teachers');
            socket.emit('makeStudent');
            newStudent({ name: fullName });
          } else {
            io.to('teachers').emit('nameChange', {
              student: socket.id,
              name: fullName,
            });
          }
        }
      });
      socket.on('teacherChangeCode', ({ id, code }) => {
        students[id].code = code;
        io.to(id).emit('studentCodeUpdate', code);
        io.to('teachers').emit('teacherCodeUpdate', {
          student: id,
          code: code,
        });
      });
      socket.on('studentChangeCode', (code) => {
        students[socket.id].code = code;
        io.to('teachers').emit('teacherCodeUpdate', {
          student: socket.id,
          code: code,
        });
      });
      socket.on('disconnect', removeStudent);
    });
    res.socket.server.io = io;
  }
  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default ioHandler;
