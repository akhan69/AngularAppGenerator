
export class EvidenceInstance {

	contstructor (
   public instanceId: number,
   public taskId: number,
   public dueDate: Date,
   public status: number,
   public closeDate: Date,
   public lastUpdate: Date,
   public isPretest: string,
   public isPass: string,
   public lastUpdateUserId: number,
   public closedByUserId: number

	) {}
}
