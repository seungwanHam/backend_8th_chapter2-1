export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export class User {
  userId: string;
  email: string;
  role: UserRole;

  constructor(props: {
    userId: string;
    email: string;
    role?: UserRole;
  }) {
    this.userId = props.userId;
    this.email = props.email;
    this.role = props.role || UserRole.USER;
  }

  /**
   * 관리자 여부 확인
   */
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }
}