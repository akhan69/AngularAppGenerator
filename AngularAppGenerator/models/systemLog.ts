
export class SystemLog {

	contstructor (
   public logId: number,
   public accountId: number,
   public datetime: string,
   public severity: number,
   public source: string,
   public category: string,
   public message: string

	) {}
}
