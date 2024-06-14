import { create } from "zustand";

interface CardModalStore {
  id?: string;
  isOpen: boolean; // Indicates whether the mobile sidebar is open or not
  onOpen: (id: string) => void; // Function to open the mobile sidebar
  onClose: () => void; // Function to close the mobile sidebar
}

export const useCardModal = create<CardModalStore>((set) => ({
  id: undefined,
  isOpen: false, // Initialize the sidebar as closed by default
  onOpen: (id: string) => set({ isOpen: true, id }), // Define the function to open the mobile sidebar
  onClose: () => set({ isOpen: false, id: undefined }), // Define the function to close the mobile sidebar
}));
