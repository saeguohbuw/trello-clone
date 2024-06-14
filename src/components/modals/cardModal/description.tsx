"use client";

import { CardWithList } from "@/src/types/prisma";
import { Skeleton } from "../../shadcn-ui/skeleton";
import { AlignLeft } from "lucide-react";
import { useState, useRef, ElementRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { set } from "lodash";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import { FormTextarea } from "../../form/FormTextarea";
import FormSubmitButton from "../../form/FormSubmitButton";
import { Button } from "../../shadcn-ui/button";
import { useAction } from "@/src/hooks/useAction";
import { UpdateCard } from "@/src/lib/actions/update-card/schema";
import { toast } from "sonner";
import { updateCard } from "@/src/lib/actions/update-card";

interface DescriptionProps {
  data: CardWithList;
}

export const Description = ({ data }: DescriptionProps) => {
  const params = useParams();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);

  const textareaRef = useRef<ElementRef<"textarea">>(null);
  const formRef = useRef<ElementRef<"form">>(null);

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
  };

  useEventListener("keydown", onKeyDown);
  useOnClickOutside(formRef, disableEditing);

  const { execute, fieldErrors } = useAction(updateCard, {
    onSuccess: (data) => {
        queryClient.invalidateQueries({
            queryKey: ["card", data.id],
        })

        queryClient.invalidateQueries({
          queryKey: ["card-logs", data.id]
      });

        toast.success(`Card "${data.title}" updated`);
        disableEditing();
    },
    onError: (error) => {
        toast.error(error);
    }
  })

  const onSubmit = (formData: FormData) => {
    const description = formData.get("description") as string;
    const boardId = params.boardId as string;

    execute({
        id: data.id, description, boardId,
    })
  };

  return (
    <div className="flex w-full items-start gap-x-3">
      <AlignLeft className="mt-0.5 h-5 w-5 text-neutral-700" />
      <div className="w-full">
        <p className="mb-2 font-semibold text-neutral-700">Description</p>
        {isEditing ? (
          <form action={onSubmit} ref={formRef} className="space-y-2">
            <FormTextarea
              id="description"
              className="mt-2 w-full"
              placeHolder="You can add description here"
              defaultValue={data.description || undefined}
              errors={fieldErrors}
              ref={textareaRef}
            />
            <div className="flex items-center gap-x-2">
              <FormSubmitButton>Save</FormSubmitButton>
              <Button onClick={disableEditing} size="sm" variant="ghost">
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div
            onClick={enableEditing}
            role="button"
            className="min-h-[78px] rounded-md bg-neutral-200 px-3.5 py-3 text-sm font-medium"
          >
            {data.description || "You can add description here"}
          </div>
        )}
      </div>
    </div>
  );
};

Description.Skeleton = function DescriptionSkeleton() {
  return (
    <div className="flex w-full items-start gap-x-3">
      <Skeleton className="h-6 w-6 bg-neutral-200" />
      <div className="w-full">
        <Skeleton className="mb-2 h-6 w-24 bg-neutral-200" />
        <Skeleton className="h-[72px] w-full bg-neutral-200" />
      </div>
    </div>
  );
};
