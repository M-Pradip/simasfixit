ALTER TABLE "Operator"
ADD COLUMN "simCost" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Order"
ADD COLUMN "simUnitCost" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "subtotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "amountDue" INTEGER NOT NULL DEFAULT 0;

UPDATE "Order" AS o
SET "simUnitCost" = op."simCost",
    "subtotal" = op."simCost" * o."quantity",
    "amountDue" = GREATEST(op."simCost" * o."quantity" - o."commissionUsed", 0)
FROM "Operator" AS op
WHERE o."operatorId" = op."id";
