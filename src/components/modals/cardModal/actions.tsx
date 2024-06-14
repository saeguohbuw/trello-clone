import { Skeleton } from "@/src/components/shadcn-ui/skeleton";
import { CardWithList } from "@/src/types/prisma";
import { Button } from "@/src/components/shadcn-ui/button";
import { Copy, Trash } from "lucide-react";
import { useAction } from "@/src/hooks/useAction";
import { copyCard } from "@/src/lib/actions/copy-card";
import { deleteCard } from "@/src/lib/actions/delete-card";
import { useParams } from "next/navigation";
import { useCardModal } from "@/src/hooks/useCardModal";
import { useToast } from "../../shadcn-ui/use-toast";

// Interface for the props expected by ModalActions component
interface ActionsProps {
  data?: CardWithList;
}

const Actions = ({ data }: ActionsProps) => {
  const params = useParams();
  const cardModal = useCardModal();
  const { toast } = useToast();

  const { execute: executeCopyCard, isLoading: isLoadingCopy } =
    useAction(copyCard, {
      onSuccess: (data) => {
        toast ({description: (
          <div className={"flex flex-row items-center "}>
            Card copied
          </div>
        ),
      });
    }
    });
  
  const { execute: executeDeleteCard, isLoading: isLoadingDelete } =
  useAction(deleteCard, {
    onSuccess: (data) => {
      toast ({description: (
        <div className={"flex flex-row items-center "}>
          Card deleted
        </div>
      ),
    });
    cardModal.onClose();
  }
  });

  const onCopy = () => {
    const boardId = params.boardId as string;

    executeCopyCard({
      id: data.id, 
      boardId,
    });
  };

  const onDelete = () => {
    const boardId = params.boardId as string;

    executeDeleteCard({
      id: data.id,
      boardId,
    });
  };

  return (
    <div className={"mt-2 space-y-2"}>
      <p className={"text-xs font-semibold"}>Actions</p>
      <Button
        onClick={onCopy}
        disabled={isLoadingCopy}
        size={"inline"}
        variant={"gray"}
        className={"w-full justify-start"}
      >
        <Copy className={"mr-2 h-4 w-4"} />
        Copy
      </Button>
      <Button
        onClick={onDelete}
        disabled={isLoadingDelete}
        size={"inline"}
        variant={"gray"}
        className={"w-full justify-start"}
      >
        <Trash className={"mr-2 h-4 w-4"} />
        Delete
      </Button>
    </div>
  );
};
export default Actions;

// Skeleton component to display loading state
Actions.Skeleton = function ActionsSkeleton() {
  return (
    <div className={"mt-2 space-y-2"}>
      <Skeleton className={"h-4 w-20 bg-neutral-200 "} />
      <Skeleton className={"h-8 w-full bg-neutral-200 "} />
      <Skeleton className={"h-8 w-full bg-neutral-200 "} />
    </div>
  );
};
