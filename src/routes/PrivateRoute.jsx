import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const PrivateRoute = ({ allowedRoles }) => {
  const { user } = useAuthStore();
  const token = localStorage.getItem('accessToken');

  // 1. KHÔNG CÓ VÉ HOẶC CHƯA ĐĂNG NHẬP -> Đuổi thẳng về trang Login
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // 2. CÓ VÉ NHƯNG SAI CHỨC VỤ -> Đá ra phòng báo lỗi 403
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. KHÁCH VIP ĐÚNG QUYỀN -> Mời vào phòng
  return <Outlet />;
};

export default PrivateRoute;