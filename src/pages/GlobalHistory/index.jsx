import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Tag, Space, Input } from 'antd';
import { HistoryOutlined, SearchOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const GlobalHistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://mindwell-server.vercel.app/api/reports/global-history');
        const result = await response.json();
        if (response.ok) setData(result);
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    };
    fetchHistory();
  }, []);

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'time',
      render: (t) => new Date(t).toLocaleString('vi-VN'),
      sorter: (a, b) => new Date(a.time) - new Date(b.time),
    },
    {
      title: 'Chuyên viên xử lý',
      dataIndex: 'adminName',
      render: (name) => <Tag color="blue">{name}</Tag>,
      filters: [...new Set(data.map(item => item.adminName))].map(name => ({ text: name, value: name })),
      onFilter: (value, record) => record.adminName === value,
    },
    {
      title: 'Sinh viên',
      dataIndex: 'studentName',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Nội dung can thiệp',
      dataIndex: 'action',
      width: '40%',
    },
    {
      title: 'Tình trạng lúc đó',
      dataIndex: 'result',
      render: (res) => <Tag color="red">{res}</Tag>,
    }
  ];

  return (
    <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <Space style={{ marginBottom: 24 }}>
        <HistoryOutlined style={{ fontSize: 24, color: '#1a6d5d' }} />
        <Title level={4} style={{ margin: 0 }}>Nhật ký Can thiệp Toàn hệ thống</Title>
      </Space>
      
      <Table 
        columns={columns} 
        dataSource={data} 
        loading={loading} 
        rowKey={(record) => record.time + record.studentName}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default GlobalHistory;