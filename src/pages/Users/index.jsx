import React, { useState, useEffect } from 'react';
import { 
  Table, Tag, Space, Button, Input, Card, Typography, 
  Tooltip, Modal, Select, message, Avatar, Form, Drawer, Divider, Row, Col 
} from 'antd'; 
import { 
  SearchOutlined, LockOutlined, 
  UnlockOutlined, DeleteOutlined, UserOutlined, PlusOutlined, EyeOutlined,
  ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons'; 

const { Title, Text } = Typography;
const { Option } = Select;

const removeVietnameseTones = (str) => {
  if (!str) return '';
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str.toLowerCase().trim();
};

const Users = () => {
  const mindWellColor = '#165C51';
  const [form] = Form.useForm();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Biến quản lý Drawer Thêm Sinh Viên
  const [isAddDrawerVisible, setIsAddDrawerVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://mindwell-server-c802.onrender.com/api/users/admin/all');
      const data = await response.json();
      const formattedUsers = data.map(u => ({
        id: u._id, name: u.name, email: u.email, 
        status: u.status || 'active', 
        joinDate: new Date(u.createdAt).toLocaleDateString('vi-VN'),
        avatar: u.avatar
      }));
      setUsers(formattedUsers);
    } catch (error) { message.error('Lỗi tải danh sách sinh viên.'); } 
    finally { setLoading(false); }
  };

  // 👇 HÀM MỚI: XỬ LÝ THÊM SINH VIÊN
  const handleAddUser = async (values) => {
    setIsAdding(true);
    try {
      // Giả định API tạo user của sếp là /api/users/admin/create (Sếp có thể sửa lại nếu URL khác nhé)
      const response = await fetch('https://mindwell-server-c802.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          studentCode: values.studentCode,
          role: 'student' // Mặc định role
        })
      });

      const data = await response.json();

      if (response.ok) {
        message.success('Thêm sinh viên thành công!');
        setIsAddDrawerVisible(false); // Đóng ngăn kéo
        form.resetFields(); // Xóa trắng form
        fetchUsers(); // Tải lại danh sách
      } else {
        message.error(data.message || 'Lỗi khi thêm sinh viên!');
      }
    } catch (error) {
      message.error('Lỗi kết nối máy chủ!');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleStatus = async (record) => {
    try {
      const response = await fetch(`https://mindwell-server-c802.onrender.com/api/users/admin/user/${record.id}/status`, { method: 'PUT' });
      const data = await response.json();
      if (response.ok) {
        message.success(data.message);
        setUsers(users.map(u => u.id === record.id ? { ...u, status: data.status } : u));
      } else { message.error(data.message); }
    } catch (error) { message.error('Lỗi mạng khi thay đổi trạng thái!'); }
  };

  const handleDelete = (id, name) => {
    Modal.confirm({
      title: 'Xác nhận xóa vĩnh viễn?',
      content: `Tài khoản của "${name}" sẽ bị xóa khỏi hệ thống. Thao tác này không thể hoàn tác.`,
      okText: 'Xóa vĩnh viễn', okType: 'danger', cancelText: 'Hủy',
      onOk: async () => {
        try {
          const response = await fetch(`https://mindwell-server-c802.onrender.com/api/users/admin/user/${id}`, { method: 'DELETE' });
          if (response.ok) {
            message.success('Đã xóa thành công!');
            setUsers(users.filter(u => u.id !== id));
          } else { message.error('Không thể xóa tài khoản này.'); }
        } catch (error) { message.error('Lỗi mạng!'); }
      }
    });
  };

  const getCategorizedProgress = () => {
    if (userHistory.length === 0) return [];
    const groups = {};
    userHistory.forEach(item => {
      if (!groups[item.testTitle]) groups[item.testTitle] = [];
      groups[item.testTitle].push(item);
    });
    return Object.keys(groups).map(title => {
      const tests = [...groups[title]].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const first = tests[0];
      const latest = tests[tests.length - 1];
      const diff = first.score - latest.score;
      const percent = first.score > 0 ? Math.round((Math.abs(diff) / first.score) * 100) : 0;
      return {
        title, first, latest, count: tests.length, percent: percent > 100 ? 100 : percent,
        isImprove: diff >= 0, status: diff > 0 ? 'Cải thiện' : diff < 0 ? 'Tệ đi' : 'Ổn định',
        color: diff > 0 ? '#059669' : diff < 0 ? '#DC2626' : '#4B5563',
        bg: diff > 0 ? '#ECFDF5' : diff < 0 ? '#FFF1F0' : '#F3F4F6'
      };
    });
  };

  const categories = getCategorizedProgress();

  const openHistoryDrawer = async (record) => {
    setSelectedUser(record);
    setIsDrawerVisible(true);
    setLoadingHistory(true);
    try {
      const response = await fetch(`https://mindwell-server-c802.onrender.com/api/test-results/admin/user/${record.id}`);
      const data = await response.json();
      setUserHistory(data);
    } catch (error) { message.error("Lỗi khi tải lịch sử bài test."); } 
    finally { setLoadingHistory(false); }
  };

  const filteredUsers = users.filter((user) => {
    const matchStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchText = removeVietnameseTones(user.name).includes(removeVietnameseTones(searchText)) || 
                      removeVietnameseTones(user.email).includes(removeVietnameseTones(searchText));
    return matchStatus && matchText;
  });

  const columns = [
    {
      title: 'Sinh viên',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} style={{ backgroundColor: mindWellColor }} />
          <div>
            <div style={{ fontWeight: 700, color: '#111827' }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    { title: 'Ngày tham gia', dataIndex: 'joinDate', key: 'joinDate' },
    {
      title: 'Trạng thái',
      render: (record) => (
        <Tag color={record.status === 'active' ? 'success' : 'error'} style={{ borderRadius: '6px', fontWeight: 600 }}>
          {record.status === 'active' ? 'HOẠT ĐỘNG' : 'ĐÃ KHÓA'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem tiến trình">
            <Button type="text" icon={<EyeOutlined style={{ color: '#3B82F6', fontSize: '18px' }} />} onClick={() => openHistoryDrawer(record)} />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? "Khóa tài khoản" : "Mở khóa"}>
            <Button 
              type="text" 
              onClick={() => handleToggleStatus(record)} 
              icon={record.status === 'active' ? <LockOutlined style={{ color: '#F59E0B' }} /> : <UnlockOutlined style={{ color: '#10B981' }} />} 
            />
          </Tooltip>
          <Tooltip title="Xóa tài khoản">
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id, record.name)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card bordered={false} style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.03)', borderRadius: '16px' }}>
      
      {/* 👇 CHỐNG VỠ LAYOUT HEADER 👇 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <Title level={3} style={{ color: mindWellColor, margin: 0, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Quản Lý Người Dùng
        </Title>
        <Button type="primary" icon={<PlusOutlined />} style={{ backgroundColor: mindWellColor, borderRadius: '8px' }} onClick={() => setIsAddDrawerVisible(true)}>
          Thêm sinh viên
        </Button>
      </div>

      {/* 👇 CHỐNG VỠ LAYOUT THANH TÌM KIẾM 👇 */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} style={{ width: 300, flexGrow: 1, maxWidth: '100%', borderRadius: '8px' }} value={searchText} onChange={e => setSearchText(e.target.value)} allowClear />
        <Select defaultValue="all" style={{ width: 170 }} value={statusFilter} onChange={setStatusFilter}>
          <Option value="all">Tất cả trạng thái</Option>
          <Option value="active">Đang hoạt động</Option>
          <Option value="banned">Đã khóa</Option>
        </Select>
      </div>

      {/* 👇 CHỐNG ÉP GIÒ BẢNG CHÍNH 👇 */}
      <Table columns={columns} dataSource={filteredUsers} rowKey="id" loading={loading} pagination={{ pageSize: 8 }} scroll={{ x: 'max-content' }} />

      {/* DRAWER XEM LỊCH SỬ TIẾN TRÌNH */}
      <Drawer 
        title={<div style={{ fontWeight: 800, fontSize: '18px' }}>Hồ sơ tâm lý: {selectedUser?.name}</div>} 
        width={700} open={isDrawerVisible} onClose={() => setIsDrawerVisible(false)}
      >
        <div style={{ marginBottom: 32 }}>
          <Title level={5} style={{ marginBottom: 16, fontWeight: 800 }}>Phân tích tiến trình theo hạng mục</Title>
          {categories.length > 0 ? (
            <Row gutter={[16, 16]}>
              {categories.map((cat, index) => (
                <Col span={24} key={index}>
                  {/* 👇 CHỐNG VỠ LAYOUT CARD TIẾN TRÌNH 👇 */}
                  <div style={{ padding: '20px', backgroundColor: '#FFF', borderRadius: '16px', border: `1px solid ${cat.color}20`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                      <Tag color="blue" style={{ marginBottom: '8px', borderRadius: '4px', fontWeight: 600 }}>{cat.title}</Tag>
                      <div style={{ display: 'flex', gap: '32px', marginTop: '12px', flexWrap: 'wrap' }}>
                        <div><Text type="secondary" style={{ fontSize: '11px', fontWeight: 700 }}>LẦN ĐẦU</Text><div style={{ fontSize: '20px', fontWeight: 800, color: '#6B7280' }}>{cat.first.score}</div></div>
                        <div style={{ borderLeft: '1px solid #F3F4F6', paddingLeft: '32px' }}><Text type="secondary" style={{ fontSize: '11px', fontWeight: 700 }}>HIỆN TẠI</Text><div style={{ fontSize: '20px', fontWeight: 800, color: cat.color }}>{cat.latest.score}</div></div>
                        <div style={{ borderLeft: '1px solid #F3F4F6', paddingLeft: '32px' }}><Text type="secondary" style={{ fontSize: '11px', fontWeight: 700 }}>SỐ LẦN</Text><div style={{ fontSize: '20px', fontWeight: 800 }}>{cat.count}</div></div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '130px', padding: '10px', backgroundColor: cat.bg, borderRadius: '12px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 900, color: cat.color }}>{cat.isImprove ? <ArrowDownOutlined /> : <ArrowUpOutlined />}{cat.percent}%</div>
                      <Text strong style={{ color: cat.color, fontSize: '12px' }}>{cat.status.toUpperCase()}</Text>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center', backgroundColor: '#F9FAFB', borderRadius: '12px' }}><Text type="secondary">Chưa đủ dữ liệu bài test.</Text></div>
          )}
        </div>
        <Divider orientation="left" style={{ fontWeight: 800 }}>Lịch sử đánh giá chi tiết</Divider>
        
        {/* 👇 CHỐNG ÉP GIÒ BẢNG LỊCH SỬ 👇 */}
        <Table size="small" dataSource={userHistory} rowKey="_id" loading={loadingHistory} scroll={{ x: 'max-content' }}
          columns={[
            { title: 'Bài Test', dataIndex: 'testTitle' },
            { title: 'Điểm', dataIndex: 'score', align: 'center', render: s => <Text strong>{s}</Text> },
            { title: 'Kết quả', render: (_, r) => <Tag color={r.result.includes('Nặng') ? 'red' : 'green'}>{r.result}</Tag> },
            { title: 'Ngày', render: (_, r) => new Date(r.createdAt).toLocaleDateString('vi-VN') }
          ]} 
        />
      </Drawer>

      {/* DRAWER THÊM SINH VIÊN */}
      <Drawer
        title={<div style={{ fontWeight: 800, fontSize: '18px' }}>Tạo tài khoản Sinh viên mới</div>}
        width={400}
        onClose={() => {
          setIsAddDrawerVisible(false);
          form.resetFields();
        }}
        open={isAddDrawerVisible}
      >
        <Form form={form} layout="vertical" onFinish={handleAddUser}>
          <Form.Item name="name" label={<span style={{ fontWeight: 600 }}>Họ và tên</span>} rules={[{ required: true, message: 'Vui lòng nhập họ tên sinh viên!' }]}>
            <Input placeholder="Nguyễn Văn A" size="large" />
          </Form.Item>

          <Form.Item name="studentCode" label={<span style={{ fontWeight: 600 }}>Mã sinh viên</span>} rules={[{ required: true, message: 'Vui lòng nhập mã sinh viên!' }]}>
            <Input placeholder="VD: SE123456" size="large" />
          </Form.Item>

          <Form.Item name="email" label={<span style={{ fontWeight: 600 }}>Email</span>} rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}>
            <Input placeholder="email@fpt.edu.vn" size="large" />
          </Form.Item>

          <Form.Item name="password" label={<span style={{ fontWeight: 600 }}>Mật khẩu khởi tạo</span>} rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
            <Input.Password placeholder="Nhập mật khẩu cho sinh viên" size="large" />
          </Form.Item>

          <div style={{ marginTop: '32px' }}>
            <Button type="primary" htmlType="submit" loading={isAdding} block size="large" style={{ backgroundColor: mindWellColor, borderRadius: '8px', fontWeight: 600 }}>
              Xác nhận Tạo tài khoản
            </Button>
          </div>
        </Form>
      </Drawer>

    </Card>
  );
};

export default Users;