"use client";

import { useEffect, useState } from "react";
import { reorder } from "@/src/lib/reorder";
import { ListWithCards } from "@/src/types/prisma";
import {
  DragDropContext,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import ListForm from "./ListForm";
import ListItem from "./ListItem";
import { useAction } from "@/src/hooks/useAction";
import { updateListOrder } from "@/src/lib/actions/update-list-order";
import { updateCardOrder } from "@/src/lib/actions/update-card-order";
import { useToast } from "@/src/components/shadcn-ui/use-toast";
import { Check, X } from "lucide-react";

// Interface for the props expected by ListContainer component
interface ListContainerProps {
  boardId: string;
  data: ListWithCards[];
}

// Component to render lists and handle drag-and-drop functionality
const ListContainer = ({ boardId, data }: ListContainerProps) => {
  // State for storing ordered lists
  const [orderedData, setOrderedData] = useState<ListWithCards[]>(data);

  // hook for using toast notifications
  const { toast } = useToast();

  // Update state when initial data changes
  useEffect(() => {
    setOrderedData(data);
  }, [data]);

  // Function for displaying toast messages
  const showToast = (message: string, isError = false) => {
    toast({
      description: (
        <div className="flex items-center">
          {isError ? (
            <X className="mr-2" />
          ) : (
            <Check className="mr-2" />
          )}
          {message}
        </div>
      ),
    });
  };

  // Hook for executing updateListOrder action
  const { execute: updateList } = useAction(updateListOrder, {
    onSuccess: () => showToast("List reordered"),
    onError: (error) => showToast(error, true),
  });

  // Hook for executing updateCardOrder action
  const { execute: updateCard } = useAction(updateCardOrder, {
    onSuccess: () => showToast("Card reordered"),
    onError: (error) => showToast(error, true),
  });

  // Handler for drag end event
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, type } = result;

    // Exit if there's no destination
    if (!destination) return;

    // Exit if item dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Handle list reordering
    if (type === "list") {
      const reorderedLists = reorder(
        orderedData,
        source.index,
        destination.index
      ).map((item, index) => ({
        ...item,
        order: index,
      }));

      // Update local state
      setOrderedData(reorderedLists);

      // Sync with backend
      await updateList({ items: reorderedLists, boardId });
      return;
    }

    // Handle card reordering
    if (type === "card") {
      // Create deep copy of lists and cards to avoid mutation
      const newData = orderedData.map((list) => ({
        ...list,
        cards: list.cards ? [...list.cards] : [],
      }));

      // Find source and destination lists
      const sourceList = newData.find(
        (list) => list.id === source.droppableId
      );
      const destinationList = newData.find(
        (list) => list.id === destination.droppableId
      );

      // Exit if lists are not found
      if (!sourceList || !destinationList) return;

      // Moving card inside the same list
      if (sourceList.id === destinationList.id) {
        const reorderedCards = reorder(
          sourceList.cards,
          source.index,
          destination.index
        ).map((card, index) => ({
          ...card,
          order: index,
        }));

        // Update list cards
        sourceList.cards = reorderedCards;

        // Update state
        setOrderedData(newData);

        // Sync with backend
        await updateCard({ items: reorderedCards, boardId });
      } else {
        // Moving card between different lists

        const sourceCards = [...sourceList.cards];
        const destinationCards = [...destinationList.cards];

        // Remove card from source list
        const [movedCard] = sourceCards.splice(source.index, 1);

        // Update card with new listId
        const updatedCard = {
          ...movedCard,
          listId: destinationList.id,
        };

        // Insert card into destination list
        destinationCards.splice(destination.index, 0, updatedCard);

        // Recalculate order for both lists
        const updatedSourceCards = sourceCards.map((card, index) => ({
          ...card,
          order: index,
        }));

        const updatedDestinationCards = destinationCards.map(
          (card, index) => ({
            ...card,
            order: index,
          })
        );

        // Update lists
        sourceList.cards = updatedSourceCards;
        destinationList.cards = updatedDestinationCards;

        // Update state
        setOrderedData(newData);

        // Sync destination list with backend
        await updateCard({ items: updatedDestinationCards, boardId });
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable
        droppableId="lists"
        type="list"
        direction="horizontal"
      >
        {(provided) => (
          <ol
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex h-full gap-x-3"
          >
            {/* Render all lists */}
            {orderedData.map((list, index) => (
              <ListItem key={list.id} index={index} data={list} />
            ))}

            {provided.placeholder}

            {/* Form for adding new list */}
            <ListForm boardId={boardId} />

            {/* Spacer */}
            <div className="w-1 flex-shrink-0" />
          </ol>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ListContainer;