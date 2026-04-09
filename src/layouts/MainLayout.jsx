import React, { useState } from 'react';
import { Layout, Menu, theme, Button, Avatar, ConfigProvider } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
  BarChartOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
  SettingOutlined,
  AlertOutlined,
  SafetyCertificateOutlined 
} from '@ant-design/icons';
import { MdEco } from "react-icons/md";
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const { Header, Content, Sider } = Layout;

// 👇 HÀM RANDOM MÀU AVATAR
const avatarColors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#1890ff', '#52c41a', '#eb2f96', '#13c2c2'];
const getAvatarColor = (name) => {
  if (!name) return '#165C51'; 
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return avatarColors[sum % avatarColors.length];
};

const getInitial = (name) => {
  if (!name) return 'U';
  const nameParts = name.trim().split(' ');
  const lastName = nameParts[nameParts.length - 1]; 
  return lastName.charAt(0).toUpperCase();
};

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore(); 

  const mindWellColor = '#165C51'; 

  // 👇 LOGIC LẤY CÂU CHÀO THEO BUỔI TRONG NGÀY
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  const lastName = user?.fullName ? user.fullName.trim().split(' ').pop() : 'bạn';

  const menuItems = [
    { key: '/admin/dashboard', icon: <BarChartOutlined />, label: 'Thống kê & báo cáo' },
    ...(user?.role === 'super_admin' ? [
      { key: '/admin/users', icon: <UserOutlined />, label: 'Quản lý người dùng' }
    ] : []),
    { key: '/admin/tests', icon: <CheckSquareOutlined />, label: 'Quản lý bài test' },
    { key: '/admin/content', icon: <FileTextOutlined />, label: 'Quản lý nội dung' },
    ...(user?.role === 'super_admin' ? [
      { key: '/admin/accounts', icon: <SafetyCertificateOutlined />, label: 'Quản lý nhân sự' }
    ] : []),
    { key: '/admin/settings', icon: <SettingOutlined />, label: 'Cài đặt cá nhân' },
    { key: '/admin/red-flags', icon: <AlertOutlined style={{ color: '#cf1322' }} />, label: 'Cảnh báo khẩn cấp' },
  ];

  const handleLogout = () => {
    logout(); 
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login'); 
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} collapsible collapsed={collapsed} theme="light" 
        style={{ boxShadow: '2px 0 20px 0 rgba(22,92,81,0.05)', zIndex: 10, borderRight: 'none' }}
      >
        {/* LOGO */}
        <div style={{ height: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '16px' }}>
          <div style={{ 
            backgroundColor: mindWellColor, width: collapsed ? '40px' : '48px', height: collapsed ? '40px' : '48px', 
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
            transform: 'rotate(45deg)', boxShadow: '0 8px 16px rgba(22, 92, 81, 0.2)'
          }}>
            <div style={{ transform: 'rotate(-45deg)' }}>
              <MdEco size={collapsed ? 24 : 28} color="#FFF" />
            </div>
          </div>
          {!collapsed && <div style={{ color: '#333', fontWeight: '900', marginTop: '12px', fontSize: '18px', letterSpacing: '-0.5px' }}>MindWell</div>}
        </div>
        
        <ConfigProvider
          theme={{ components: { Menu: { itemSelectedBg: '#E6EFEA', itemSelectedColor: '#165C51' } } }}
        >
          <Menu mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={(e) => navigate(e.key)} style={{ borderRight: 0, marginTop: '10px' }} />
        </ConfigProvider>
      </Sider>

      <Layout>
        <Header style={{ 
          padding: 0, 
          background: 'rgba(253, 251, 247, 0.8)', 
          backdropFilter: 'blur(10px)',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          paddingRight: '24px',
          height: '80px', 
          lineHeight: 'normal',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
          zIndex: 9
        }}>
          
          {/* 👇 KHU VỰC TRÁI (LỜI CHÀO): THÊM KỸ THUẬT CẮT CHỮ NẾU MÀN HÌNH QUÁ NHỎ 👇 */}
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, paddingRight: '16px' }}>
            <div 
              onClick={() => setCollapsed(!collapsed)} 
              style={{ fontSize: '20px', padding: '0 16px', cursor: 'pointer', color: '#666', flexShrink: 0 }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#333', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {greeting}, {lastName} 👋
              </div>
              <div style={{ fontSize: '13px', color: '#888', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Chúc bạn một ngày làm việc thật an lành và hiệu quả.
              </div>
            </div>
          </div>
          
          {/* 👇 KHU VỰC PHẢI (AVATAR & LOGOUT): KHÓA CỨNG KHÔNG CHO RỚT DÒNG VÀ TEO NHỎ 👇 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
            
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '4px 12px', borderRadius: '30px', transition: 'all 0.3s' }} onClick={() => navigate('/admin/settings')} className="hover-user-bg">
              <Avatar 
                size="large"
                style={{ backgroundColor: getAvatarColor(user?.fullName), verticalAlign: 'middle', fontWeight: '800', fontSize: '16px', flexShrink: 0 }} 
              >
                {getInitial(user?.fullName)}
              </Avatar>
              <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '10px' }}>
                <span style={{ fontWeight: 700, color: '#333', fontSize: '14px', whiteSpace: 'nowrap' }}>{user?.fullName || 'Đang tải...'}</span>
                <span style={{ fontSize: '11px', color: '#888', fontWeight: 600, whiteSpace: 'nowrap' }}>Quản trị viên</span>
              </div>
            </div>
            
            <Button type="primary" icon={<LogoutOutlined />} onClick={handleLogout} style={{ backgroundColor: '#fff', color: '#EF7A73', border: '1px solid #f8c3c0', fontWeight: 600, boxShadow: 'none' }}>
              Đăng xuất
            </Button>
          </div>
          
        </Header>

        <Content style={{ margin: '24px 24px 0', overflow: 'initial' }}>
          <div style={{ padding: 0, minHeight: '80vh' }}>
            <Outlet /> 
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;