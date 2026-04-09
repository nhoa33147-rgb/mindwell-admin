import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Spin, ConfigProvider } from 'antd'; // 👈 IMPORT THÊM ConfigProvider
import { MdEco } from "react-icons/md"; 
import axiosClient from './services/axiosClient';
import useAuthStore from './store/authStore';

import MainLayout from './layouts/MainLayout';
import PrivateRoute from './routes/PrivateRoute';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Users from './pages/Users';
import Tests from './pages/Tests';
import RedFlags from './pages/RedFlags';
import Content from './pages/Content';
import Dashboard from './pages/Dashboard';
import AccountManagement from './pages/AccountManagement'; 

const Unauthorized = () => <h2 style={{color: 'red'}}>403 - Bạn không có quyền truy cập!</h2>;

const App = () => {
  const { user, updateUser, isAuthLoading, setAuthLoading, logout } = useAuthStore();
  const mindWellColor = '#165C51'; // 👈 ĐỔI MÀU TEAL ĐẬM SANG TRỌNG

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const response = await axiosClient.get('/users/profile'); 
        updateUser({
          id: response.data._id,
          fullName: response.data.name,
          email: response.data.email,
          phone: response.data.phone || '', 
          role: response.data.role,
          avatar: response.data.avatar || ''
        });
        setAuthLoading(false);
      } catch (error) {
        logout();
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, [logout, setAuthLoading, updateUser]);

  if (isAuthLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#FDFBF7' }}>
        <Spin size="large" />
        <div style={{ color: mindWellColor, fontWeight: 'bold', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
          <MdEco size={24} /> Khởi động MindWell...
        </div>
      </div>
    );
  }

  return (
    // 👇 BỌC ConfigProvider VÀO ĐÂY ĐỂ ĐỔI MÀU TOÀN HỆ THỐNG
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#165C51', // Màu Deep Teal
          colorBgLayout: '#FDFBF7', // Nền Trắng Off-white ấm áp
          colorTextBase: '#4A4A4A', // Chữ xám đậm dịu mắt
          borderRadius: 12, // Bo góc toàn hệ thống
          fontFamily: "'Nunito', 'Inter', sans-serif", 
        },
        components: {
          Card: {
            borderRadiusLG: 20, // Card bo góc to mềm mại
          },
          Button: {
            borderRadius: 20, // Nút tròn trịa
          }
        }
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<PrivateRoute allowedRoles={['super_admin', 'admin', 'psychologist', 'content_creator']} />}>
            <Route path="/admin" element={<MainLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tests" element={<Tests />} />
              <Route path="content" element={<Content />} />
              <Route path="red-flags" element={<RedFlags />} />
              <Route path="settings" element={<Settings />} /> 

              <Route element={<PrivateRoute allowedRoles={['super_admin']} />}>
                <Route path="users" element={<Users />} />
                <Route path="accounts" element={<AccountManagement />} /> 
              </Route>
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;