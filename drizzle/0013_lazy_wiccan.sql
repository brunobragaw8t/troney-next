CREATE TABLE "earning_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"earning_id" uuid NOT NULL,
	"bucket_id" uuid,
	"value" numeric(10, 2) NOT NULL,
	"bucket_percentage" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT NULL
);
--> statement-breakpoint
ALTER TABLE "earning_allocations" ADD CONSTRAINT "earning_allocations_earning_id_earnings_id_fk" FOREIGN KEY ("earning_id") REFERENCES "public"."earnings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "earning_allocations" ADD CONSTRAINT "earning_allocations_bucket_id_buckets_id_fk" FOREIGN KEY ("bucket_id") REFERENCES "public"."buckets"("id") ON DELETE cascade ON UPDATE no action;