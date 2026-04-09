import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null, // Đổi mặc định về null, không dùng dữ liệu cứng nữa
      isAuthLoading: true, // THÊM BIẾN NÀY: Mặc định vừa vào app là phải loading
      
      updateUser: (newInfo) => set((state) => ({
        user: { ...state.user, ...newInfo }
      })),

      // Đổi trạng thái loading
      setAuthLoading: (status) => set({ isAuthLoading: status }),

      logout: () => set({ user: null })
    }),
    {
      name: 'mindwell-auth-storage',
    }
  )
);

export default useAuthStore;