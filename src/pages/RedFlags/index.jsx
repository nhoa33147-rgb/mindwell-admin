import React, { useState, useEffect } from 'react';
import { 
  Table, Tag, Space, Button, Input, Card, Typography, 
  Modal, Select, message, Avatar, Timeline, Form, Drawer, Row, Col
} from 'antd';
import { 
  AlertOutlined, CheckCircleOutlined, 
  SafetyCertificateOutlined, UserOutlined, SendOutlined, HistoryOutlined, WarningOutlined,
  LockOutlined, PhoneOutlined, MailOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import useAuthStore from '../../store/authStore';
import axiosClient from '../../services/axiosClient';

const { Title, Text } = Typography;
const { Option } = Select;

const RedFlags = () => {
  const mindWellColor = '#1a6d5d';
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [historyTickets, setHistoryTickets] = useState([]);

  const fetchRedFlags = async () => {
    setLoading(true);
    try {
      // 1. Gọi API qua axiosClient (tự động gắn link Localhost và Token)
      const response = await axiosClient.get('/reports/red-flags');
      
      // 2. Axios lưu dữ liệu trả về trong response.data
      const data = response.data; 

      // 3. BỎ LUÔN response.ok đi, Axios tự bắt lỗi vào catch rồi!
      if (data && Array.isArray(data)) {
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const formatted = sortedData.map(item => ({
          id: item._id,
          studentCode: item.user?.studentCode || 'N/A',
          studentName: item.user?.name || 'Ẩn danh',
          studentPhone: item.user?.phone || 'Chưa cập nhật',
          studentEmail: item.user?.email || 'Chưa cập nhật',
          testName: item.testTitle,
          score: item.score,
          status: item.status || 'pending',
          logs: item.logs || [
            { time: new Date(item.createdAt).toLocaleString(), action: `Hệ thống phát hiện mức độ: ${item.result}`, user: 'System' }
          ]
        }));
        setTickets(formatted);
      }
    } catch (error) {
      console.error("Lỗi fetchRedFlags:", error);
      message.error('Không thể kết nối danh sách cảnh báo!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedFlags();
  }, []);

  useEffect(() => {
    if (isModalVisible && currentTicket) {
      form.setFieldsValue({
        note: '',
        newStatus: currentTicket.status === 'pending' ? 'in_progress' : currentTicket.status
      });
    }
  }, [isModalVisible, currentTicket, form]);

  const filteredTickets = tickets.filter(t => statusFilter === 'all' || t.status === statusFilter);

  const openTicketModal = (record) => {
    setCurrentTicket(record);
    setIsModalVisible(true);
  };

  const closeTicketModal = () => {
    setIsModalVisible(false);
    setCurrentTicket(null);
    form.resetFields();
  };

  const handleAssignTicket = async () => {
    try {
      const response = await fetch(`https://mindwell-server.vercel.app/api/reports/red-flags/${currentTicket?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: "Đã tiếp nhận xử lý ca báo động này.",
          newStatus: 'in_progress',
          adminName: user?.fullName || user?.name || 'Chuyên viên Tâm lý'
        })
      });

      if (response.ok) {
        message.success('Bạn đã tiếp nhận ca này. Vui lòng liên hệ sinh viên ngay!');
        fetchRedFlags(); 
        closeTicketModal();
      } else {
        message.error('Lỗi khi tiếp nhận ca!');
      }
    } catch (error) {
      message.error('Lỗi kết nối máy chủ!');
    }
  };

  const handleUpdateTicket = async (values) => {
    try {
      const response = await fetch(`https://mindwell-server.vercel.app/api/reports/red-flags/${currentTicket?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: values.note,
          newStatus: values.newStatus,
          adminName: user?.fullName || user?.name || 'Admin MindWell'
        })
      });

      if (response.ok) {
        message.success('Đã lưu lịch sử can thiệp vào hệ thống!');
        fetchRedFlags(); 
        closeTicketModal();
      } else {
        message.error('Lỗi khi lưu can thiệp!');
      }
    } catch (error) {
      message.error('Không thể lưu lịch sử!');
    }
  };

  const fetchHistoryTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://mindwell-server.vercel.app/api/reports/red-flags');
      const data = await response.json();
      if (response.ok) {
        const sortedData = data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        const resolvedOnly = sortedData.filter(t => t.status === 'resolved').map(item => ({
          id: item._id,
          studentName: item.user?.name || 'Ẩn danh',
          studentPhone: item.user?.phone || 'Chưa cập nhật', 
          studentEmail: item.user?.email || 'Chưa cập nhật',
          testName: item.testTitle,
          score: item.score,
          resolvedAt: item.updatedAt,
          assignee: item.logs && item.logs.length > 0 ? item.logs[item.logs.length - 1].user : 'Admin',
          logs: item.logs || [] 
        }));
        
        setHistoryTickets(resolvedOnly);
        setIsHistoryVisible(true);
      }
    } catch (error) {
      message.error('Không thể tải lịch sử lưu trữ!');
    } finally {
      setLoading(false);
    }
  };

  // 👇 HỆ THỐNG TỰ ĐỘNG ĐỔI MÀU GIAO DIỆN THEO BỘ LỌC
  const getHeaderStyle = () => {
    switch (statusFilter) {
      case 'in_progress':
        return {
          bg: '#fffbe6', border: '#d48806', iconBg: '#faad14', titleColor: '#d48806', textColor: '#ad6800',
          title: 'CA ĐANG TRONG QUÁ TRÌNH CAN THIỆP',
          desc: 'Hồ sơ đang được chuyên viên tiếp nhận, liên hệ và hỗ trợ tâm lý.',
          icon: <ClockCircleOutlined style={{ fontSize: '24px', color: '#fff' }} />,
          btnDanger: false, btnType: 'default', btnStyle: { borderColor: '#d48806', color: '#d48806' }
        };
      case 'resolved':
        return {
          bg: '#f6ffed', border: '#52c41a', iconBg: '#52c41a', titleColor: '#389e0d', textColor: '#237804',
          title: 'HỒ SƠ ĐÃ ĐÓNG (AN TOÀN)',
          desc: 'Các trường hợp đã can thiệp thành công, tình trạng sinh viên đã ổn định.',
          icon: <CheckCircleOutlined style={{ fontSize: '24px', color: '#fff' }} />,
          btnDanger: false, btnType: 'default', btnStyle: { borderColor: '#389e0d', color: '#389e0d' }
        };
      case 'all':
       return {
          bg: '#e6f0ed', border: mindWellColor, iconBg: mindWellColor, titleColor: mindWellColor, textColor: '#114236',
          title: 'TỔNG HỢP TẤT CẢ CẢNH BÁO',
          desc: 'Xem toàn bộ danh sách cảnh báo khẩn cấp từ trước đến nay.',
          icon: <SafetyCertificateOutlined style={{ fontSize: '24px', color: '#fff' }} />,
          btnDanger: false, btnType: 'primary', btnStyle: { backgroundColor: mindWellColor }
        };
      case 'pending':
      default:
        return {
          bg: '#fff1f0', border: '#cf1322', iconBg: '#cf1322', titleColor: '#cf1322', textColor: '#a8071a',
          title: 'TRUNG TÂM CẢNH BÁO KHẨN CẤP',
          desc: 'Hệ thống tự động phát hiện và chuyển tiếp các trường hợp có rủi ro tâm lý cao.',
          icon: <AlertOutlined style={{ fontSize: '24px', color: '#fff' }} />,
          btnDanger: true, btnType: 'primary', btnStyle: { backgroundColor: '#cf1322' }
        };
    }
  };

  const headerStyle = getHeaderStyle();

  const columns = [
    {
      title: 'Mã Cảnh Báo',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <Text strong style={{ color: '#cf1322', fontSize: '15px' }}>#{text?.slice(-6)?.toUpperCase()}</Text>,
    },
    {
      title: 'Sinh viên',
      key: 'student',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#e6f0ed', color: mindWellColor }} />
          <div>
            <div style={{ fontWeight: 800, color: '#111827', fontSize: '15px' }}>{record.studentName}</div>
            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>{record.studentCode}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Nguồn báo động',
      key: 'trigger',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <div style={{ fontWeight: 700, color: '#cf1322' }}>{record.testName}</div>
          <Text type="danger" strong>Điểm/Dấu hiệu: {record.score}</Text>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      dataIndex: 'status',
      render: (status) => {
        if (status === 'pending') return <Tag color="#cf1322" style={{ padding: '6px 14px', fontSize: '13px', fontWeight: 800, borderRadius: '6px' }}>🚨 CẦN XỬ LÝ NGAY</Tag>;
        if (status === 'in_progress') return <Tag color="#d48806" style={{ padding: '6px 14px', fontSize: '13px', fontWeight: 800, borderRadius: '6px' }}>⏳ ĐANG CAN THIỆP</Tag>;
        return <Tag color="#389e0d" style={{ padding: '6px 14px', fontSize: '13px', fontWeight: 800, borderRadius: '6px' }}>✅ ĐÃ AN TOÀN</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button 
          type={record.status === 'pending' ? 'primary' : 'default'} 
          danger={record.status === 'pending'}
          onClick={() => openTicketModal(record)}
          style={{ fontWeight: 800, borderRadius: '6px', height: '36px' }}
        >
          {record.status === 'pending' ? 'Xử lý ngay' : 'Xem hồ sơ'}
        </Button>
      ),
    },
  ];

  return (
    <Card bordered={false} style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)', borderRadius: '16px' }}>
      
      {/* 👇 HEADER TỰ ĐỘNG ĐỔI MÀU THÔNG MINH 👇 */}
      <div style={{ 
        padding: '20px 24px', 
        backgroundColor: headerStyle.bg, 
        borderLeft: `8px solid ${headerStyle.border}`, 
        borderRadius: '12px', 
        marginBottom: '24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '16px',
        transition: 'all 0.3s ease' // Thêm hiệu ứng chuyển màu mượt mà
      }}>
        <Space align="center" size="middle">
          <div style={{ width: '48px', height: '48px', backgroundColor: headerStyle.iconBg, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.3s ease' }}>
            {headerStyle.icon}
          </div>
          <div>
            <Title level={3} style={{ color: headerStyle.titleColor, margin: 0, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {headerStyle.title}
            </Title>
            <Text style={{ color: headerStyle.textColor, fontWeight: 600 }}>
              {headerStyle.desc}
            </Text>
          </div>
        </Space>
        
        <Button 
          type={headerStyle.btnType}
          danger={headerStyle.btnDanger}
          icon={<HistoryOutlined />} 
          onClick={fetchHistoryTickets}
          style={{ borderRadius: '8px', fontWeight: 800, height: '45px', padding: '0 24px', ...headerStyle.btnStyle }}
        >
          Lịch sử cảnh báo
        </Button>
      </div>
      {/* 👆 KẾT THÚC HEADER 👆 */}

      <div style={{ marginBottom: '24px' }}>
        <Select defaultValue="all" size="large" style={{ width: 300, fontWeight: 600 }} value={statusFilter} onChange={setStatusFilter}>
          <Option value="pending">🚨 Cần xử lý khẩn cấp (Chưa nhận)</Option>
          <Option value="in_progress">⏳ Đang trong quá trình can thiệp</Option>
          <Option value="resolved">✅ Đã chốt hồ sơ (An toàn)</Option>
          <Option value="all">Tất cả cảnh báo</Option>
        </Select>
      </div>

      <Table columns={columns} dataSource={filteredTickets} rowKey="id" loading={loading} scroll={{ x: 1000 }} />

      <Modal
        title={<Space style={{ fontSize: '18px', fontWeight: 900, color: '#cf1322' }}><SafetyCertificateOutlined /> Hồ sơ Can thiệp Tâm lý: #{currentTicket?.id?.slice(-6)?.toUpperCase()}</Space>}
        open={isModalVisible}
        onCancel={closeTicketModal}
        footer={null}
        width={750}
        maskClosable={false}
        centered
      >
        {currentTicket && (
          <div style={{ marginTop: '20px' }}>
            
            <div style={{ border: '1px solid #ffccc7', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 4px 12px rgba(207, 19, 34, 0.05)' }}>
              <div style={{ backgroundColor: '#fff1f0', padding: '12px 20px', borderBottom: '1px solid #ffccc7', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <LockOutlined style={{ color: '#cf1322', fontSize: '18px' }} />
                <span style={{ fontWeight: 800, color: '#cf1322', fontSize: '15px' }}>THÔNG TIN GIẢI MÃ (BẢO MẬT CẤP 1)</span>
              </div>
              
              <div style={{ padding: '20px', backgroundColor: '#fff' }}>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                      <Space>
                        <UserOutlined style={{ color: '#8c8c8c', fontSize: '16px' }} />
                        <Text type="secondary" style={{ fontWeight: 600 }}>Họ tên sinh viên</Text>
                      </Space>
                      <Text strong style={{ fontSize: '16px', color: '#111827' }}>{currentTicket.studentName}</Text>
                    </div>
                  </Col>
                  
                  <Col span={24}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', backgroundColor: '#fffcfb', borderRadius: '8px', border: '1px solid #ffa39e', boxShadow: 'inset 0 0 0 1px #fff1f0' }}>
                      <Space>
                        <PhoneOutlined style={{ color: '#cf1322', fontSize: '16px' }} />
                        <Text style={{ fontWeight: 700, color: '#cf1322' }}>SĐT Khẩn cấp (Gọi ngay)</Text>
                      </Space>
                      <Text copyable strong style={{ color: '#cf1322', fontSize: '20px', fontWeight: 900 }}>{currentTicket.studentPhone}</Text>
                    </div>
                  </Col>
                  
                  <Col span={24}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                      <Space>
                        <MailOutlined style={{ color: '#8c8c8c', fontSize: '16px' }} />
                        <Text type="secondary" style={{ fontWeight: 600 }}>Email sinh viên</Text>
                      </Space>
                      <Text strong style={{ color: '#111827' }}>{currentTicket.studentEmail}</Text>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>

            <Title level={5} style={{ fontWeight: 800 }}>Lịch sử thao tác</Title>
            <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #e8e8e8', marginBottom: '24px' }}>
              <Timeline>
                {currentTicket?.logs?.map((log, idx) => (
                  <Timeline.Item key={idx} color={log.user === 'System' ? 'red' : 'blue'}>
                    <Text type="secondary" style={{ fontSize: '12px', fontWeight: 600 }}>{log.time}</Text>
                    <br />
                    <Text strong style={{ color: log.user === 'System' ? '#cf1322' : '#096dd9' }}>{log.user}: </Text>
                    <Text>{log.action}</Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>

            {currentTicket.status === 'pending' ? (
              <div style={{ textAlign: 'center', padding: '32px 20px', backgroundColor: '#fffbe6', border: '2px dashed #ffe58f', borderRadius: '12px' }}>
                <WarningOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
                <Title level={4} style={{ color: '#d48806', fontWeight: 900 }}>Chưa có chuyên viên nào nhận ca này!</Title>
                <Text style={{ display: 'block', marginBottom: '24px', fontWeight: 600 }}>Hãy tiếp nhận ca để chịu trách nhiệm liên hệ và hỗ trợ sinh viên này ngay lập tức.</Text>
                <Button type="primary" size="large" onClick={handleAssignTicket} style={{ backgroundColor: '#cf1322', fontWeight: 800, height: '50px', padding: '0 40px', borderRadius: '8px' }}>
                  Tiếp nhận ca cấp cứu này
                </Button>
              </div>
            ) : currentTicket.status === 'in_progress' ? (
              <Form form={form} layout="vertical" onFinish={handleUpdateTicket} initialValues={{ newStatus: currentTicket.status }}>
                <Form.Item label={<span style={{ fontWeight: 700 }}>Ghi chú sau khi liên hệ / Hành động đã làm</span>} name="note" rules={[{ required: true, message: 'Vui lòng nhập nội dung can thiệp!' }]}>
                  <Input.TextArea rows={4} placeholder="Ví dụ: Đã gọi điện cho phụ huynh, sinh viên hiện tại đã bình tĩnh..." style={{ borderRadius: '8px' }} />
                </Form.Item>
                <Form.Item label={<span style={{ fontWeight: 700 }}>Đánh giá tình trạng (Cập nhật Ticket)</span>} name="newStatus">
                  <Select size="large">
                    <Option value="in_progress">⏳ Vẫn đang theo dõi (In Progress)</Option>
                    <Option value="resolved">✅ Đã an toàn / Đóng hồ sơ (Resolved)</Option>
                  </Select>
                </Form.Item>
                <div style={{ textAlign: 'right', marginTop: '24px' }}>
                  <Button htmlType="button" size="large" onClick={closeTicketModal} style={{ marginRight: '12px', borderRadius: '8px', fontWeight: 600 }}>Hủy</Button>
                  <Button type="primary" htmlType="submit" size="large" icon={<SendOutlined />} style={{ backgroundColor: mindWellColor, borderRadius: '8px', fontWeight: 800 }}>Lưu lịch sử</Button>
                </div>
              </Form>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 20px', backgroundColor: '#f6ffed', border: '2px solid #b7eb8f', borderRadius: '12px' }}>
                <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                <Title level={4} style={{ color: '#389e0d', fontWeight: 900 }}>HỒ SƠ ĐÃ ĐÓNG (AN TOÀN)</Title>
                <Text style={{ fontWeight: 600 }}>Ca cảnh báo này đã được xử lý xong và đưa vào kho lưu trữ.</Text>
                <div style={{ marginTop: '24px' }}>
                  <Button size="large" onClick={closeTicketModal} style={{ fontWeight: 600, borderRadius: '8px' }}>Đóng cửa sổ</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Drawer
        title={<Space style={{ fontWeight: 900, color: mindWellColor, fontSize: '18px' }}><HistoryOutlined /> Hồ sơ Cảnh báo đã lưu trữ</Space>}
        placement="right"
        width={900}
        onClose={() => setIsHistoryVisible(false)}
        open={isHistoryVisible}
      >
        <Table 
          dataSource={historyTickets}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          columns={[
            { 
              title: 'Mã số', 
              dataIndex: 'id', 
              render: id => <Text strong style={{ color: '#cf1322' }}>#{id?.slice(-6)?.toUpperCase()}</Text> 
            },
            { 
              title: 'Sinh viên', 
              dataIndex: 'studentName', 
              render: name => <Text strong style={{ color: '#111827' }}>{name}</Text> 
            },
            { title: 'Bài Test', dataIndex: 'testName' },
            { 
              title: 'Điểm', 
              dataIndex: 'score', 
              render: s => <Tag color="#cf1322" style={{ fontWeight: 700 }}>{s}</Tag> 
            },
            { 
              title: 'Người chốt', 
              dataIndex: 'assignee', 
              render: a => <Tag color="blue" style={{ fontWeight: 700 }}>{a}</Tag> 
            },
            { 
              title: 'Ngày đóng', 
              dataIndex: 'resolvedAt', 
              render: d => <Text strong style={{ color: '#6B7280' }}>{new Date(d).toLocaleDateString('vi-VN')}</Text> 
            },
            { 
              title: 'Thao tác', 
              render: (_, record) => (
                <Button 
                  type="primary" 
                  ghost 
                  style={{ fontWeight: 700, borderRadius: '6px' }}
                  onClick={() => { 
                    setIsHistoryVisible(false); 
                    openTicketModal(record); 
                  }}
                >
                  Xem Log
                </Button>
              ) 
            }
          ]}
        />
      </Drawer>
    </Card>
  );
};

export default RedFlags;