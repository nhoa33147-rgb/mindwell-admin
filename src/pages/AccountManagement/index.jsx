import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, Tag, message, Typography, Tooltip, Avatar } from 'antd';
import { UserAddOutlined, EditOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import axiosClient from '../../services/axiosClient';

const { Title, Text } = Typography;
const { Option } = Select;

// 👇 HỆ THỐNG TẠO AVATAR CHỮ CÁI CÓ MÀU (Bê từ trang Settings sang)
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
// 👆 ========================================================

const AccountManagement = () => {
  const mindWellColor = '#1a6d5d';
  const [form] = Form.useForm();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [admins, setAdmins] = useState([]); 

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/users/admin/list-admins'); 
      setAdmins(response.data || response); 
    } catch (error) {
      message.error('Không thể tải danh sách nhân sự!');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (record = null) => {
    if (record) {
      setEditingId(record._id);
      form.setFieldsValue(record);
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      if (editingId) {
        await axiosClient.put(`/users/admin/user/${editingId}`, values);
        message.success('Cập nhật thông tin thành công!');
      } else {
        await axiosClient.post('/users/create-admin', values);
        message.success('Tạo tài khoản thành công! Mật khẩu mặc định là: Mindwell@123');
      }
      fetchAdmins(); 
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || 'Thao tác thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (record) => {
    try {
      await axiosClient.put(`/users/admin/user/${record._id}/status`);
      message.success('Đã thay đổi trạng thái tài khoản!');
      fetchAdmins();
    } catch (error) {
      message.error('Lỗi khi thay đổi trạng thái!');
    }
  };

  const columns = [
    { 
      title: 'Họ và tên', 
      key: 'name', 
      width: 250, 
      render: (_, record) => (
        <Space style={{ display: 'flex', alignItems: 'center' }}>
          {/* 👇 ĐÃ TÁCH BẠCH RÕ RÀNG: CÓ ẢNH DÙNG ẢNH, KHÔNG ẢNH DÙNG CHỮ */}
          {record.avatar ? (
            <Avatar 
              src={record.avatar} 
              style={{ filter: record.status === 'banned' ? 'grayscale(100%) opacity(50%)' : 'none' }} 
            />
          ) : (
            <Avatar 
              style={{ 
                backgroundColor: record.status === 'banned' ? '#f5f5f5' : getAvatarColor(record.name), 
                color: record.status === 'banned' ? '#bfbfbf' : '#fff',
                fontWeight: '900', // Cho chữ in đậm hẳn lên
                fontSize: '14px'
              }} 
            >
              {getInitial(record.name)}
            </Avatar>
          )}
          
          <Text strong style={{ color: record.status === 'banned' ? '#bfbfbf' : '#111827', whiteSpace: 'nowrap' }}>
            {record.name}
          </Text>
        </Space>
      ) 
    },
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email',
      width: 250 
    },
    { 
      title: 'Phân quyền', 
      dataIndex: 'role', 
      key: 'role',
      width: 180,
      render: role => {
        if (role === 'super_admin') return <Tag color="red">Super Admin</Tag>;
        if (role === 'psychologist') return <Tag color="blue">Chuyên viên Tâm lý</Tag>;
        return <Tag color="green">Quản trị Nội dung</Tag>;
      }
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status', 
      width: 150,
      render: (status) => (
        <Tag color={status === 'banned' ? 'error' : 'success'} style={{ fontWeight: 600 }}>
          {status === 'banned' ? 'ĐÃ KHÓA' : 'ĐANG HOẠT ĐỘNG'}
        </Tag>
      ) 
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button type="text" icon={<EditOutlined style={{ color: '#1890ff', fontSize: '18px' }} />} onClick={() => showModal(record)} />
          </Tooltip>
          <Tooltip title={record.status === 'banned' ? "Mở khóa" : "Khóa"}>
            <Button 
              type="text" 
              danger={record.status !== 'banned'}
              icon={record.status === 'banned' ? <UnlockOutlined style={{ color: '#52c41a', fontSize: '18px' }} /> : <LockOutlined style={{ fontSize: '18px' }} />}
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: '16px' }}>
        <Space>
          <Title level={3} style={{ color: mindWellColor, margin: 0, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Quản Lý Nhân Sự
          </Title>
        </Space>
        
        <Button 
          type="primary" 
          icon={<UserAddOutlined />} 
          style={{ backgroundColor: mindWellColor, borderRadius: '8px', height: '40px', fontWeight: 600 }}
          onClick={() => showModal()} 
        >
          Cấp tài khoản mới
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={admins} 
        rowKey="_id" 
        loading={loading} 
        scroll={{ x: 'max-content' }} 
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title={<div style={{ fontWeight: 800, fontSize: '18px', color: mindWellColor }}>{editingId ? "Cập nhật tài khoản Admin" : "Cấp tài khoản Admin mới"}</div>}
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
        footer={null}
        maskClosable={false}
        width={550}
        centered
      >
        {!editingId && (
          <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#fffbe6', borderRadius: 8, border: '1px solid #ffe58f' }}>
            <Text type="secondary">
              Mật khẩu mặc định sẽ là: <Text strong type="danger">Mindwell@123</Text>. 
              Yêu cầu nhân viên đổi mật khẩu ngay sau khi đăng nhập lần đầu.
            </Text>
          </div>
        )}

        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item label={<span style={{ fontWeight: 600 }}>Họ và tên nhân viên</span>} name="name" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
            <Input placeholder="VD: Nguyễn Thị B" size="large" style={{ borderRadius: '6px' }} />
          </Form.Item>
          
          <Form.Item label={<span style={{ fontWeight: 600 }}>Email công việc</span>} name="email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}>
            <Input placeholder="VD: nv.b@mindwell.vn" size="large" style={{ borderRadius: '6px' }} disabled={!!editingId} />
          </Form.Item>
          
          <Form.Item label={<span style={{ fontWeight: 600 }}>Số điện thoại</span>} name="phone">
            <Input placeholder="Nhập số điện thoại (Tùy chọn)" size="large" style={{ borderRadius: '6px' }} />
          </Form.Item>
          
          <Form.Item label={<span style={{ fontWeight: 600 }}>Vai trò / Phân quyền</span>} name="role" rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}>
            <Select placeholder="Chọn quyền hạn" size="large">
              <Option value="psychologist">Chuyên viên Tâm lý (Xử lý Cảnh báo)</Option>
              <Option value="content_creator">Quản trị Nội dung (Đăng Bài/Video)</Option>
              <Option value="super_admin">Quản lý Cấp cao (Toàn quyền)</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginTop: 32, marginBottom: 0 }}>
            <Button onClick={() => setIsModalOpen(false)} size="large" style={{ marginRight: 12, borderRadius: '6px' }}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading} size="large" style={{ backgroundColor: mindWellColor, borderRadius: '6px', fontWeight: 600, padding: '0 32px' }}>
              {editingId ? "Lưu thay đổi" : "Tạo tài khoản"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AccountManagement;