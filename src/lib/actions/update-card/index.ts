"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/src/lib/database/db";
import { InputType, ReturnType } from "@/src/lib/actions/update-card/types";
import createSafeAction from "@/src/lib/actions/createSafeAction";
import { UpdateCard } from "@/src/lib/actions/update-card/schema";
import { createAuditLog } from "../../create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

// Handler function for updating a card
const handler = async (data: InputType): Promise<ReturnType> => {
  // Authenticating the user and extracting their ID
  const { userId, orgId } = auth();

  // Checking if the user is unauthorized
  if (!userId || !orgId)
    return {
      error: "Unauthorized.", // Returning an error message if user is unauthorized
    };

  // Extracting title from input data
  const { id, boardId, ...values } = data;
  let card;

  try {
    // Updating the card in the database with the provided data
    card = await db.card.update({
      where: {
        id,
        list: {
          board: {
            orgId,
          },
        },
      },
      data: { ...values },
    });

    await createAuditLog({
      entityTitle: card.title,
      entityId: card.id,
      entityType: ENTITY_TYPE.CARD,
      action: ACTION.UPDATE
    })
  } catch (e) {
    // Handling errors if card update fails
    return { error: "Failed to update." };
  }

  // Revalidating the cache for the card path
  revalidatePath(`/board/${id}`);

  return { data: card };
};

export const updateCard = createSafeAction(UpdateCard, handler);
