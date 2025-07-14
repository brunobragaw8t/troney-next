ALTER TABLE "activation_tokens" DROP CONSTRAINT "activation_tokens_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "activation_tokens" ADD CONSTRAINT "activation_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;