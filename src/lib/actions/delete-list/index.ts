"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/src/lib/database/db";
import createSafeAction from "@/src/lib/actions/createSafeAction";
import { deleteListSchema } from "@/src/lib/actions/delete-list/schema";
import { InputType, ReturnType } from "@/src/lib/actions/delete-list/types";
import { createAuditLog } from "../../create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

// Handler function for deleting a list
const handler = async (data: InputType): Promise<ReturnType> => {
  // Authenticating the user and extracting their ID
  const { userId, orgId } = auth();

  // Checking if the user is unauthorized
  if (!userId || !orgId)
    return {
      error: "Unauthorized.", // Returning an error message if user is unauthorized
    };

  // Extracting id from data
  const { id, boardId } = data;

  // Creating a new list
  let list;

  try {
    // Deleting the list in the database with the provided data
    list = await db.list.delete({
      where: { id, boardId, board: { orgId } },
    });

    await createAuditLog({
      entityTitle: list.title,
      entityId: list.id,
      entityType: ENTITY_TYPE.LIST,
      action: ACTION.DELETE
    })
  } catch (e) {
    // Handling errors if list delete fails
    return { error: "Failed to delete." };
  }

  // Revalidating the cache for the board path
  revalidatePath(`/board/${boardId}`);

  return { data: list };
};

export const deleteList = createSafeAction(deleteListSchema, handler);
