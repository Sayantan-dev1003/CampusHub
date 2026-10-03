-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MEMBER', 'ADMIN', 'TREASURER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "MembershipPaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('MEMBER', 'NON_MEMBER');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('PENDING', 'PAID', 'USED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AnnouncementAudience" AS ENUM ('PUBLIC', 'MEMBERS');

-- CreateEnum
CREATE TYPE "AnnouncementStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OrderPaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FulfillmentMethod" AS ENUM ('PICKUP', 'DELIVERY');

-- CreateEnum
CREATE TYPE "InitiativeType" AS ENUM ('FUNDRAISER', 'GENERAL');

-- CreateEnum
CREATE TYPE "InitiativeStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REIMBURSED');

-- CreateEnum
CREATE TYPE "PaymentPurpose" AS ENUM ('MEMBERSHIP', 'TICKET', 'ORDER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentReferenceType" AS ENUM ('MEMBERSHIP', 'TICKET', 'ORDER');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "TransactionCategory" AS ENUM ('MEMBERSHIP', 'EVENT_TICKET', 'MERCHANDISE', 'FUNDRAISER', 'EVENT_COST', 'SUPPLIES', 'REIMBURSEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "TransactionReferenceType" AS ENUM ('MEMBERSHIP', 'TICKET', 'ORDER', 'INITIATIVE', 'EXPENSE', 'MANUAL');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('POSTED', 'VOID');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MEMBERSHIP', 'EVENT', 'TICKET', 'ORDER', 'ANNOUNCEMENT', 'TASK', 'EXPENSE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "is_volunteer" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "student_id" TEXT,
    "profile_image" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "notification_preferences" JSONB NOT NULL DEFAULT '{"eventReminders":true,"membershipReminders":true,"orderUpdates":true,"announcementAlerts":true,"taskNotifications":true,"financeNotifications":true}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fee" DECIMAL(12,2) NOT NULL,
    "duration_months" INTEGER NOT NULL,
    "ticket_discount_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "merch_discount_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "renewal_reminder_days" INTEGER NOT NULL,
    "grace_period_days" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "dues_amount" DECIMAL(12,2) NOT NULL,
    "payment_id" TEXT,
    "payment_status" "MembershipPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "status" "MembershipStatus" NOT NULL DEFAULT 'PENDING',
    "reminder_sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "member_price" DECIMAL(12,2) NOT NULL,
    "non_member_price" DECIMAL(12,2) NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "payment_id" TEXT,
    "ticket_type" "TicketType" NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "qr_token" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'PENDING',
    "hold_expires_at" TIMESTAMP(3),
    "checked_in_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "checked_in_at" TIMESTAMP(3) NOT NULL,
    "checked_in_by" TEXT NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "audience" "AnnouncementAudience" NOT NULL,
    "status" "AnnouncementStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "image_url" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "stock_quantity" INTEGER NOT NULL,
    "low_stock_threshold" INTEGER NOT NULL,
    "sku" TEXT,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "payment_id" TEXT,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "payment_status" "OrderPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "order_status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "fulfillment" "FulfillmentMethod" NOT NULL,
    "hold_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_variant_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "initiatives" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "InitiativeType" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "InitiativeStatus" NOT NULL DEFAULT 'PLANNED',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "initiatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "initiative_id" TEXT NOT NULL,
    "assigned_to" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "due_date" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "submitted_by" TEXT NOT NULL,
    "initiative_id" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "receipt_url" TEXT,
    "status" "ExpenseStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "reimbursed_at" TIMESTAMP(3),
    "transaction_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "purpose" "PaymentPurpose" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
    "razorpay_order_id" TEXT NOT NULL,
    "razorpay_payment_id" TEXT,
    "reference_type" "PaymentReferenceType" NOT NULL,
    "reference_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "payment_id" TEXT,
    "type" "TransactionType" NOT NULL,
    "category" "TransactionCategory" NOT NULL,
    "reference_type" "TransactionReferenceType" NOT NULL,
    "reference_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'POSTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_settings" (
    "id" TEXT NOT NULL,
    "organization_name" TEXT NOT NULL,
    "logo_url" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "website" TEXT,
    "social_links" JSONB NOT NULL DEFAULT '[]',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "date_format" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "default_event_capacity" INTEGER NOT NULL DEFAULT 100,
    "default_member_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "default_non_member_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "default_low_stock_threshold" INTEGER NOT NULL DEFAULT 5,
    "payment_hold_minutes" INTEGER NOT NULL DEFAULT 15,
    "pickup_enabled" BOOLEAN NOT NULL DEFAULT true,
    "delivery_enabled" BOOLEAN NOT NULL DEFAULT false,
    "notification_defaults" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_student_id_idx" ON "users"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_payment_id_key" ON "memberships"("payment_id");

-- CreateIndex
CREATE INDEX "memberships_user_id_idx" ON "memberships"("user_id");

-- CreateIndex
CREATE INDEX "memberships_status_idx" ON "memberships"("status");

-- CreateIndex
CREATE INDEX "memberships_end_date_idx" ON "memberships"("end_date");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "events"("status");

-- CreateIndex
CREATE INDEX "events_starts_at_idx" ON "events"("starts_at");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_payment_id_key" ON "tickets"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_qr_token_key" ON "tickets"("qr_token");

-- CreateIndex
CREATE INDEX "tickets_event_id_idx" ON "tickets"("event_id");

-- CreateIndex
CREATE INDEX "tickets_user_id_idx" ON "tickets"("user_id");

-- CreateIndex
CREATE INDEX "tickets_status_idx" ON "tickets"("status");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_ticket_id_key" ON "attendance"("ticket_id");

-- CreateIndex
CREATE INDEX "attendance_event_id_idx" ON "attendance"("event_id");

-- CreateIndex
CREATE INDEX "announcements_status_idx" ON "announcements"("status");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_product_id_idx" ON "product_variants"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_payment_id_key" ON "orders"("payment_id");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "orders_order_status_idx" ON "orders"("order_status");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "tasks_initiative_id_idx" ON "tasks"("initiative_id");

-- CreateIndex
CREATE INDEX "tasks_assigned_to_idx" ON "tasks"("assigned_to");

-- CreateIndex
CREATE UNIQUE INDEX "expenses_transaction_id_key" ON "expenses"("transaction_id");

-- CreateIndex
CREATE INDEX "expenses_submitted_by_idx" ON "expenses"("submitted_by");

-- CreateIndex
CREATE INDEX "expenses_status_idx" ON "expenses"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_razorpay_order_id_key" ON "payments"("razorpay_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_razorpay_payment_id_key" ON "payments"("razorpay_payment_id");

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_category_idx" ON "transactions"("category");

-- CreateIndex
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at");

-- CreateIndex
CREATE INDEX "transactions_payment_id_idx" ON "transactions"("payment_id");

-- CreateIndex
CREATE INDEX "transactions_reference_type_reference_id_idx" ON "transactions"("reference_type", "reference_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "membership_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_checked_in_by_fkey" FOREIGN KEY ("checked_in_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "initiatives" ADD CONSTRAINT "initiatives_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_initiative_id_fkey" FOREIGN KEY ("initiative_id") REFERENCES "initiatives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_initiative_id_fkey" FOREIGN KEY ("initiative_id") REFERENCES "initiatives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
