
export class EvidenceTask {

	contstructor (
   public taskId: number,
   public accountId: number,
   public description: string,
   public taskUUID: string,
   public taskcode: string,
   public active: string,
   public warnwindow: string,
   public criticalwindow: string,
   public notifyon: number,
   public lastgeneration: Date,
   public frequency: string,
   public startdate: Date,
   public currentstate: string,
   public pretestadvancedays: number,
   public ispassfail: string,
   public pretest: string,
   public needattestation: string

	) {}
}
