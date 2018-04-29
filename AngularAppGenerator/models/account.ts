
export class Account {

	contstructor (
   public accountId: number,
   public name: string,
   public createdate: Date,
   public apitoken: string,
   public billingaccount: string,
   public paidthrough: Date

	) {}
}
