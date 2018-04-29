
export class Attachment {

	contstructor (
   public attachmentId: number,
   public iinstanceId: number,
   public description: string,
   public type: number,
   public filename: string,
   public createDate: Date,
   public pointer: string,
   public comment: string

	) {}
}
