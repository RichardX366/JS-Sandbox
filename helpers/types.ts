export interface IUser {
  name: string;
  role: 'student' | 'teacher';
  code?: string;
}
