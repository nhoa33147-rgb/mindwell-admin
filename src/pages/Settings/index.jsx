import React, { useState } from 'react';
import { Form, Input, Button, Avatar, message, Card, Typography, Row, Col, Divider, Tag, Space } from 'antd';
import { UserOutlined, SaveOutlined, SafetyCertificateOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import axiosClient from '../../services/axiosClient'; 
import useAuthStore from '../../store/authStore'; 

const { Title, Text } = Typography;

// 👇 HỆ THỐNG AVATAR CHỮ CÁI
const avatarColors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#1890ff', '#52c41a', '#eb2f96', '#13c2c2'];

const getAvatarColor = (name) => {
  if (!name) return '#1a6d5d'; 
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

const Settings = () => {
  const { user, updateUser } = useAuthStore();
  const [passwordForm] = Form.useForm();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const mindWellColor = '#1a6d5d';

  const onFinishProfile = async (values) => {
    setLoadingProfile(true);
    try {
      await axiosClient.put('/users/profile', { 
        name: values.fullName, 
        phone: values.phone 
      });
      
      updateUser({ fullName: values.fullName, phone: values.phone });
      message.success('Cập nhật hồ sơ thành công!');
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu hồ sơ.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const onFinishPassword = async (values) => {
    setLoadingPassword(true);
    try {
      await axiosClient.put('/users/password', {
        oldPassword: values.currentPassword, 
        newPassword: values.newPassword
      });
      
      message.success('Đổi mật khẩu thành công!');
      passwordForm.resetFields(); 
    } catch (error) {
      message.error(error.response?.data?.message || 'Đổi mật khẩu thất bại! Vui lòng kiểm tra lại mật khẩu cũ.');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* 👇 ĐÃ ĐỔI THÀNH MÀU XANH VÀ IN ĐẬM 👇 */}
      <Title level={3} style={{ color: mindWellColor, marginBottom: '24px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Cài đặt Tài khoản
      </Title>

      {/* KHU VỰC 1: THÔNG TIN CÁ NHÂN (Đã tô đậm border và shadow) */}
      <Card bordered={false} style={{ borderRadius: '16px', boxShadow: '0 8px 24px rgba(26, 109, 93, 0.08)', marginBottom: '32px', border: '1px solid #e6f0ed' }}>
        <Row gutter={[32, 32]}>
          
          {/* Cột trái: Hiển thị Avatar & Tóm tắt */}
          <Col xs={24} md={9} style={{ borderRight: '2px dashed #f0f0f0', textAlign: 'center', padding: '20px' }}>
            <Avatar 
              size={110} 
              style={{ 
                backgroundColor: getAvatarColor(user?.fullName), 
                fontSize: '40px',
                fontWeight: '900',
                marginBottom: '16px',
                boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                border: '4px solid #fff'
              }}
            >
              {getInitial(user?.fullName)}
            </Avatar>
            <Title level={4} style={{ margin: 0, fontWeight: 800, color: '#111827' }}>{user?.fullName || 'Người dùng'}</Title>
            
            <div style={{ marginTop: '12px' }}>
              <Tag color={mindWellColor} style={{ borderRadius: '6px', fontWeight: 700, padding: '4px 16px', fontSize: '13px' }}>
                {user?.role === 'admin' ? 'QUẢN TRỊ VIÊN (ADMIN)' : 'CHUYÊN VIÊN TÂM LÝ'}
              </Tag>
            </div>
            
            {/* Box thông tin được đổ nền xanh mint nhẹ để tách biệt */}
            <div style={{ marginTop: '32px', textAlign: 'left', backgroundColor: '#f0f7f5', padding: '20px', borderRadius: '12px', border: '1px solid #cce3de' }}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text style={{ fontSize: '12px', fontWeight: 800, color: mindWellColor, letterSpacing: '0.5px' }}><MailOutlined /> EMAIL ĐĂNG NHẬP</Text>
                  <div style={{ fontWeight: 700, color: '#111827', marginTop: '6px', fontSize: '15px' }}>{user?.email}</div>
                </div>
                <div>
                  <Text style={{ fontSize: '12px', fontWeight: 800, color: mindWellColor, letterSpacing: '0.5px' }}><PhoneOutlined /> SỐ ĐIỆN THOẠI</Text>
                  <div style={{ fontWeight: 700, color: '#111827', marginTop: '6px', fontSize: '15px' }}>{user?.phone || 'Chưa cập nhật'}</div>
                </div>
              </Space>
            </div>
          </Col>

          {/* Cột phải: Form nhập liệu */}
          <Col xs={24} md={15} style={{ padding: '20px' }}>
            <Title level={4} style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px', color: mindWellColor, fontWeight: 800 }}>
              <UserOutlined style={{ fontSize: '24px' }} /> Cập nhật Hồ sơ
            </Title>

            <Form 
              layout="vertical" 
              initialValues={{ fullName: user?.fullName, phone: user?.phone }}
              onFinish={onFinishProfile}
            >
              <Form.Item label={<span style={{ fontWeight: 700, color: '#374151' }}>Họ và tên hiển thị</span>} name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                <Input size="large" style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 16px', fontWeight: 500 }} />
              </Form.Item>
              
              <Form.Item label={<span style={{ fontWeight: 700, color: '#374151' }}>Số điện thoại liên hệ</span>} name="phone" extra={<span style={{ fontWeight: 500, color: '#6b7280' }}>Số điện thoại này sẽ được dùng để sinh viên gọi khẩn cấp trong các trường hợp báo động đỏ.</span>}>
                <Input size="large" placeholder="Ví dụ: 0987654321" style={{ borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px 16px', fontWeight: 500 }} />
              </Form.Item>

              <div style={{ textAlign: 'right', marginTop: '24px' }}>
                <Button type="primary" htmlType="submit" size="large" loading={loadingProfile} icon={<SaveOutlined />} style={{ backgroundColor: mindWellColor, borderRadius: '8px', fontWeight: 700, padding: '0 32px', height: '45px' }}>
                  Lưu Thay Đổi
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Card>

      {/* KHU VỰC 2: ĐỔI MẬT KHẨU */}
      <Card bordered={false} style={{ borderRadius: '16px', boxShadow: '0 8px 24px rgba(207, 19, 34, 0.08)', border: '2px solid #ffa39e', backgroundColor: '#fffcfb' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '14px', backgroundColor: '#fff1f0', border: '1px solid #ffccc7', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
            <SafetyCertificateOutlined style={{ fontSize: '32px', color: '#cf1322' }} />
          </div>
          <div style={{ flex: 1 }}>
            <Title level={4} style={{ color: '#cf1322', margin: 0, fontWeight: 900 }}>Bảo mật & Mật khẩu</Title>
            <Text style={{ display: 'block', marginBottom: '32px', color: '#a8071a', fontWeight: 600 }}>
              Khu vực nhạy cảm. Đảm bảo mật khẩu mới phải khớp với ô xác nhận.
            </Text>
            
            <Form 
              form={passwordForm} 
              layout="vertical" 
              onFinish={onFinishPassword}
              onFinishFailed={() => message.warning("Vui lòng kiểm tra lại các ô mật khẩu!")} 
            >
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    label={<span style={{ fontWeight: 700, color: '#cf1322' }}>Mật khẩu hiện tại</span>} 
                    name="currentPassword" 
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}
                  >
                    <Input.Password size="large" placeholder="******" style={{ borderRadius: '8px', border: '1px solid #ffccc7' }} />
                  </Form.Item>
                </Col>
              </Row>
              
              
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    label={<span style={{ fontWeight: 700, color: '#374151' }}>Mật khẩu mới</span>} 
                    name="newPassword" 
                    rules={[
                      { required: true, message: 'Nhập mật khẩu mới!' },
                      { min: 6, message: 'Tối thiểu 6 ký tự!' }
                    ]}
                    hasFeedback
                  >
                    <Input.Password size="large" placeholder="Mật khẩu mới" style={{ borderRadius: '8px' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    label={<span style={{ fontWeight: 700, color: '#374151' }}>Xác nhận mật khẩu mới</span>} 
                    name="confirmPassword" 
                    dependencies={['newPassword']} 
                    hasFeedback
                    rules={[
                      { required: true, message: 'Vui lòng xác nhận lại!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Mật khẩu không khớp!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password size="large" placeholder="Nhập lại mật khẩu mới" style={{ borderRadius: '8px' }} />
                  </Form.Item>
                </Col>
              </Row>
              
              <div style={{ marginTop: '16px' }}>
                {/* 👇 ĐÃ ĐỔI THÀNH MÀU ĐỎ MẬN #cf1322 👇 */}
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large" 
                  loading={loadingPassword} 
                  icon={<SaveOutlined />} 
                  style={{ backgroundColor: '#cf1322', borderColor: '#cf1322', borderRadius: '8px', fontWeight: 800, padding: '0 32px', height: '45px' }}
                >
                  Cập Nhật Mật Khẩu
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;