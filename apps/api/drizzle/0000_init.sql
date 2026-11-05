CREATE EXTENSION IF NOT EXISTS postgis;--> statement-breakpoint
CREATE TYPE "public"."adoption_status" AS ENUM('interesse', 'ativa', 'encerrada');--> statement-breakpoint
CREATE TYPE "public"."proposal_status" AS ENUM('rascunho', 'publicada', 'adotada', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."provider_status" AS ENUM('pendente', 'aprovado', 'recusado');--> statement-breakpoint
CREATE TYPE "public"."space_status" AS ENUM('reportado', 'com_proposta', 'em_obra', 'adotado');--> statement-breakpoint
CREATE TYPE "public"."space_type" AS ENUM('praca', 'muro', 'canteiro', 'fachada', 'jardim');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('morador', 'adotante', 'prestador', 'admin');--> statement-breakpoint
CREATE TYPE "public"."work_phase" AS ENUM('antes', 'durante', 'depois');--> statement-breakpoint
CREATE TYPE "public"."work_status" AS ENUM('planejada', 'em_andamento', 'concluida');--> statement-breakpoint
CREATE TABLE "adoptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"adopter_id" uuid NOT NULL,
	"starts_on" date,
	"ends_on" date,
	"status" "adoption_status" DEFAULT 'interesse' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"space_id" uuid NOT NULL,
	"scope" text NOT NULL,
	"budget_cents" integer NOT NULL,
	"deadline_days" integer NOT NULL,
	"status" "proposal_status" DEFAULT 'rascunho' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"crafts" text[] DEFAULT '{}' NOT NULL,
	"region" text,
	"bio" text,
	"status" "provider_status" DEFAULT 'pendente' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"space_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"description" text NOT NULL,
	"photos" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "space_type" NOT NULL,
	"location" geometry(point) NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"status" "space_status" DEFAULT 'reportado' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'morador' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "work_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_id" uuid NOT NULL,
	"phase" "work_phase" NOT NULL,
	"photos" text[] DEFAULT '{}' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_providers" (
	"work_id" uuid NOT NULL,
	"provider_id" uuid NOT NULL,
	CONSTRAINT "work_providers_work_id_provider_id_pk" PRIMARY KEY("work_id","provider_id")
);
--> statement-breakpoint
CREATE TABLE "works" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"status" "work_status" DEFAULT 'planejada' NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "adoptions" ADD CONSTRAINT "adoptions_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoptions" ADD CONSTRAINT "adoptions_adopter_id_users_id_fk" FOREIGN KEY ("adopter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_profiles" ADD CONSTRAINT "provider_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_entries" ADD CONSTRAINT "work_entries_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_providers" ADD CONSTRAINT "work_providers_work_id_works_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."works"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_providers" ADD CONSTRAINT "work_providers_provider_id_provider_profiles_user_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."provider_profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "works" ADD CONSTRAINT "works_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE no action ON UPDATE no action;