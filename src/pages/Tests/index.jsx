import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Typography, Tooltip, message, Card, Popconfirm, Drawer, Form, Input, InputNumber, Switch, Divider, Modal, Select } from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, MinusCircleOutlined, 
  CodeOutlined, SearchOutlined, FormOutlined, FireOutlined, BarChartOutlined 
} from '@ant-design/icons';
import axiosClient from '../../services/axiosClient';

const { Title, Text } = Typography;
const { TextArea } = Input;
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
  return str.toLowerCase().trim();
};

const TestManagement = () => {
  const mindWellColor = '#1a6d5d';
  
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm(); 
  const [editingId, setEditingId] = useState(null);

  const [isJsonModalVisible, setIsJsonModalVisible] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/tests');
      const resData = response.data || response; 
      if (resData && resData.success) {
        setTests(resData.data || []);
      } else if (Array.isArray(resData)) {
        setTests(resData);
      }
    } catch (error) {
      message.error('Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/tests/${id}`);
      message.success('Đã xóa bài test thành công!');
      setTests(tests.filter((test) => test._id !== id));
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa bài test!');
    }
  };

  const showDrawer = (record = null) => {
    if (record) {
      setEditingId(record._id); 
      form.setFieldsValue(record); 
    } else {
      setEditingId(null); 
      form.resetFields();
    }
    setIsDrawerVisible(true);
  };

  const onCloseDrawer = () => {
    setIsDrawerVisible(false);
    setEditingId(null);
    form.resetFields(); 
  };

  const handleImportJson = () => {
    try {
      const parsedData = JSON.parse(jsonInput);
      const formattedQuestions = parsedData.questions.map(q => ({
        questionText: q.text,
        options: parsedData.options.map(opt => ({
          optionText: opt.text,
          score: opt.score,
          isRedFlag: false
        }))
      }));
      form.setFieldsValue({
        code: parsedData.id,
        title: parsedData.title,
        description: parsedData.description,
        questions: formattedQuestions
      });
      message.success("Đã tự động điền dữ liệu thành công!");
      setIsJsonModalVisible(false);
      setJsonInput('');
    } catch (error) {
      message.error("Định dạng JSON không hợp lệ!");
    }
  };

  const handleFinishForm = async (values) => {
    setSubmitting(true);
    try {
      if (editingId) {
        await axiosClient.put(`/tests/${editingId}`, values);
      } else {
        await axiosClient.post('/tests', values);
      }
      message.success(editingId ? 'Cập nhật thành công!' : 'Tạo bài test thành công!');
      fetchTests(); 
      onCloseDrawer(); 
    } catch (error) {
      message.error('Thao tác thất bại, vui lòng kiểm tra lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTests = tests.filter((test) => {
    const matchStatus = statusFilter === 'all' || test.status === statusFilter;
    const matchText = removeVietnameseTones(test.title).includes(removeVietnameseTones(searchText)) || 
                      removeVietnameseTones(test.code).includes(removeVietnameseTones(searchText));
    return matchStatus && matchText;
  });

  const columns = [
    { 
      title: 'Thông tin Bài Test', 
      key: 'info', 
      render: (_, record) => (
        <Space size="middle">
          <div style={{ backgroundColor: '#e6f0ed', padding: '10px', borderRadius: '8px' }}>
            <FormOutlined style={{ fontSize: '18px', color: mindWellColor }} />
          </div>
          <div>
            {/* 👇 CHỮ ĐÃ ĐƯỢC LÀM THANH MẢNH LẠI 👇 */}
            <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>
              {record.title}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
              <Tag color="cyan" style={{ margin: 0, fontSize: '11px', fontWeight: 600 }}>{record.code}</Tag>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.questions?.length || 0} câu hỏi
              </Text>
            </div>
          </div>
        </Space>
      )
    },
    { 
      title: 'Lượt làm', 
      dataIndex: 'takes', 
      key: 'takes', 
      render: (takes) => (
        <Space>
          {takes > 100 ? <FireOutlined style={{ color: '#cf1322' }} /> : <BarChartOutlined style={{ color: '#1890ff' }} />}
          <Text style={{ fontWeight: 500 }}>
            {takes?.toLocaleString() || 0} lượt
          </Text>
        </Space>
      ) 
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status', 
      render: (status) => (
        <Tag color={status === 'published' ? 'success' : 'default'} style={{ fontWeight: 600 }}>
          {status === 'published' ? 'XUẤT BẢN' : 'BẢN NHÁP'}
        </Tag>
      ) 
    },
    {
      title: 'Thao tác', 
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button type="text" icon={<EditOutlined style={{ color: '#1890ff', fontSize: '16px' }} />} onClick={() => showDrawer(record)} />
          </Tooltip>
          <Popconfirm title="Xóa bài test này?" onConfirm={() => handleDelete(record._id)} okText="Xóa" cancelText="Hủy">
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined style={{ fontSize: '16px' }} />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          {/* 👇 TIÊU ĐỀ VỀ LẠI NÉT THANH NHƯ CŨ 👇 */}
          <Title level={3} style={{ 
            color: mindWellColor, 
            margin: 0, 
            fontWeight: 900, 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px'
          }}>
            Quản Lý Bài Test
          </Title>
          <Button 
            type="primary" 
            onClick={() => showDrawer()} 
            icon={<PlusOutlined />} 
            style={{ backgroundColor: mindWellColor, borderRadius: '6px', fontWeight: 600 }}
          >
            Tạo Bài Test Mới
          </Button>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <Input 
            placeholder="Tìm theo Tên hoặc Mã..." 
            prefix={<SearchOutlined />} 
            style={{ width: 300, borderRadius: '6px' }} 
            value={searchText} 
            onChange={e => setSearchText(e.target.value)} 
            allowClear 
          />
          <Select defaultValue="all" style={{ width: 170 }} value={statusFilter} onChange={setStatusFilter}>
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="published">Đã Xuất Bản</Option>
            <Option value="draft">Bản Nháp</Option>
          </Select>
        </div>

        <Table columns={columns} dataSource={filteredTests} rowKey="_id" loading={loading} scroll={{ x: 'max-content' }} />
      </Card>

      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ color: mindWellColor, fontSize: '17px', fontWeight: 800 }}>
              {editingId ? 'Chỉnh sửa Bộ Đề' : 'Tạo Bộ Đề Mới'}
            </strong>
            {!editingId && (
              <Button type="dashed" size="small" icon={<CodeOutlined />} onClick={() => setIsJsonModalVisible(true)}>
                Nhập nhanh
              </Button>
            )}
          </div>
        }
        width={800} 
        onClose={onCloseDrawer}
        open={isDrawerVisible}
        maskClosable={false} 
        extra={
          <Space>
            <Button onClick={onCloseDrawer}>Hủy</Button>
            <Button type="primary" onClick={() => form.submit()} loading={submitting} style={{ backgroundColor: mindWellColor, fontWeight: 600 }}>
              Lưu bài Test
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form} onFinish={handleFinishForm}>
          <Form.Item name="title" label="Tên bài test" rules={[{ required: true, message: 'Nhập tên bài test!' }]}>
            <Input placeholder="Ví dụ: Đánh giá Trầm cảm PHQ-9" />
          </Form.Item>
          <Form.Item name="code" label="Mã bài test (Viết liền)" rules={[{ required: true, message: 'Nhập mã!' }]}>
            <Input placeholder="PHQ9" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={2} placeholder="Mô tả ngắn về bài test..." />
          </Form.Item>

          <Divider orientation="left"><span style={{ color: mindWellColor, fontWeight: 700 }}>Câu hỏi</span></Divider>

          <Form.List name="questions">
            {(questionFields, { add: addQuestion, remove: removeQuestion }) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {questionFields.map((questionField, qIndex) => (
                  <Card 
                    key={questionField.key} 
                    size="small" 
                    title={<span style={{ fontWeight: 600 }}>Câu {qIndex + 1}</span>}
                    extra={<Button type="link" danger icon={<DeleteOutlined />} onClick={() => removeQuestion(questionField.name)} />}
                    style={{ background: '#f9f9f9', borderRadius: '8px' }}
                  >
                    <Form.Item name={[questionField.name, 'questionText']} rules={[{ required: true, message: 'Trống!' }]}>
                      <Input placeholder="Nội dung câu hỏi..." />
                    </Form.Item>

                    <div style={{ marginLeft: '15px', borderLeft: `2px solid #eee`, paddingLeft: '15px' }}>
                      <Form.List name={[questionField.name, 'options']}>
                        {(optionFields, { add: addOption, remove: removeOption }) => (
                          <>
                            {optionFields.map((optionField, oIndex) => (
                              <Space key={optionField.key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                                <Form.Item name={[optionField.name, 'optionText']} rules={[{ required: true }]} style={{ width: 300 }}>
                                  <Input placeholder={`Đáp án ${oIndex + 1}`} size="small" />
                                </Form.Item>
                                <Form.Item name={[optionField.name, 'score']} rules={[{ required: true }]}>
                                  <InputNumber placeholder="Điểm" size="small" />
                                </Form.Item>
                                <Form.Item name={[optionField.name, 'isRedFlag']} valuePropName="checked">
                                  <Switch size="small" checkedChildren="Đỏ" unCheckedChildren="-" />
                                </Form.Item>
                                <MinusCircleOutlined onClick={() => removeOption(optionField.name)} />
                              </Space>
                            ))}
                            <Button type="dashed" size="small" onClick={() => addOption()} block icon={<PlusOutlined />}>Thêm đáp án</Button>
                          </>
                        )}
                      </Form.List>
                    </div>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => addQuestion()} block icon={<PlusOutlined />} style={{ color: mindWellColor, borderColor: mindWellColor, height: '40px' }}>
                  Thêm câu hỏi
                </Button>
              </div>
            )}
          </Form.List>
        </Form>
      </Drawer>

      <Modal 
        title="Nhập nhanh JSON" 
        open={isJsonModalVisible} 
        onOk={handleImportJson} 
        onCancel={() => setIsJsonModalVisible(false)}
        okText="Điền Form"
        cancelText="Hủy"
      >
        <TextArea 
          rows={12} 
          placeholder='Dán JSON vào đây...' 
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          style={{ fontFamily: 'monospace', fontSize: '12px' }}
        />
      </Modal>
    </>
  );
};

export default TestManagement;