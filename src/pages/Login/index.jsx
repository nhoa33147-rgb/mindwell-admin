import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { MdEco } from "react-icons/md";
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

// 🛑 BẮT BUỘC IMPORT AXIOS CLIENT ĐỂ GỌI API
import axiosClient from '../../services/axiosClient';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuthStore();
  
  const mindWellColor = '#165C51'; 
  const from = location.state?.from?.pathname || "/admin/dashboard";

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axiosClient.post('/auth/login', values);
      const responseData = response.data || response; 
      const userData = responseData.user || responseData; 
      const token = responseData.token;

      if (!userData.isAdmin) {
        message.error('Bạn không có quyền truy cập trang quản trị!');
        setLoading(false);
        return; 
      }

      localStorage.setItem('accessToken', token);

      updateUser({
        id: userData.id || userData._id, 
        fullName: userData.name || userData.fullName,
        email: userData.email,
        phone: userData.phone || '',
        role: userData.role, 
        avatar: userData.avatar || ''
      });

      message.success(`Chào mừng ${userData.name || userData.fullName || 'Admin'} trở lại!`);
      navigate(from, { replace: true });

    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Lỗi xử lý dữ liệu đăng nhập!';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw',
      position: 'relative', 
      overflow: 'hidden',
      backgroundColor: '#F8F6F2' 
    }}>
      
      {/* ========================================================= */}
      {/* LỚP 1: VIDEO NỀN (Nằm dưới cùng) */}
      {/* ========================================================= */}
      <video 
          autoPlay 
          loop 
          muted 
          playsInline
          style={{ 
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
              objectFit: 'cover', zIndex: 0,
              transform: 'scaleX(-1)'
          }}
      >
          {/* File video của sếp trong public folder */}
          <source src="/bg-video.mp4" type="video/mp4" />
      </video>

      {/* ========================================================= */}
      {/* LỚP 2: LỚP PHỦ GRADIENT (Tạo màu Xanh -> Vàng -> Kem y hệt ảnh) */}
      {/* ========================================================= */}
      <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          // Trộn màu từ Trái (Xanh đậm 85%) -> Giữa (Vàng cát 60%) -> Phải (Kem 95% che khuất video)
          background: 'linear-gradient(to right, rgba(22, 92, 81, 0.85) 0%, rgba(22, 92, 81, 0.5) 35%, rgba(232, 210, 161, 0.6) 65%, rgba(248, 246, 242, 0.95) 100%)',
          zIndex: 1
      }}></div>

      {/* ========================================================= */}
      {/* LỚP 3: NỘI DUNG (Chữ và Form Đăng Nhập) */}
      {/* ========================================================= */}
      <div style={{ 
          position: 'relative', zIndex: 2, width: '100%', height: '100vh',
          display: 'flex', flexDirection: 'row' 
      }}>
        
        {/* NỬA TRÁI: CHỮ GIỚI THIỆU */}
        <div 
          className="hide-on-mobile" 
          style={{
              flex: 1, display: 'flex', flexDirection: 'column', 
              justifyContent: 'center', paddingLeft: '8%' // Căn lề trái giống ảnh
          }}
        >
            <Title level={1} style={{ color: '#FFF', fontSize: '3.8rem', marginBottom: '20px', textShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                Hành trình<br/>Chữa lành
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1.2rem', lineHeight: '1.6', maxWidth: '500px', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                Chào mừng bạn đến với trung tâm quản trị MindWell. Nơi những hạt mầm sức khỏe tinh thần được gieo trồng và chăm sóc mỗi ngày.
            </Text>
        </div>

        {/* NỬA PHẢI: FORM ĐĂNG NHẬP */}
        <div style={{ 
          flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
        }}>
          <Card 
            style={{ 
                width: '100%', maxWidth: 450, 
                boxShadow: '0 20px 40px rgba(22, 92, 81, 0.08)',
                borderRadius: '24px', 
                border: '1px solid rgba(255, 255, 255, 0.8)', // Viền kính nhẹ
                padding: '20px 10px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)', // Form màu trắng đục nhẹ
                backdropFilter: 'blur(10px)'
            }}
            bordered={false}
          >
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ 
                backgroundColor: mindWellColor, width: '72px', height: '72px', 
                borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 20px', boxShadow: '0 10px 20px rgba(22, 92, 81, 0.2)',
                transform: 'rotate(45deg)' 
              }}>
                <div style={{ transform: 'rotate(-45deg)' }}><MdEco size={40} color="#FFF" /></div>
              </div>
              <Title level={2} style={{ color: '#333', margin: 0, fontWeight: 800 }}>MINDWELL</Title>
              <Text style={{ color: '#888', fontSize: '15px' }}>Đăng nhập để vào trang Quản trị</Text>
            </div>

            <Form name="login_form" layout="vertical" onFinish={onFinish} size="large">
              <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không đúng định dạng!' }]}>
                <Input prefix={<UserOutlined style={{color: mindWellColor, marginRight: 8}} />} placeholder="Email của bạn" style={{ borderRadius: '12px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.9)' }} />
              </Form.Item>

              <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                <Input.Password prefix={<LockOutlined style={{color: mindWellColor, marginRight: 8}} />} placeholder="Mật khẩu" style={{ borderRadius: '12px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.9)' }} />
              </Form.Item>

              <Form.Item style={{ marginTop: 30 }}>
                <Button type="primary" htmlType="submit" block loading={loading} style={{ backgroundColor: mindWellColor, height: '50px', borderRadius: '25px', fontSize: '16px', fontWeight: 600, boxShadow: '0 8px 16px rgba(22, 92, 81, 0.2)' }}>
                  Tiếp tục hành trình
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;