
export class PasswordReset {

	contstructor (
   public id: number,
   public userId: number,
   public email: string,
   public token: string,
   public createDate: string,
   public expireDate: string

	) {}
}
