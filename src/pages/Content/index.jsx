import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Table, Tag, Space, Button, Input, Card, Typography, 
  Tooltip, Select, message, Drawer, Form, Divider, Popconfirm, Modal
} from 'antd';
import { 
  SearchOutlined, EditOutlined, DeleteOutlined, 
  PlusOutlined, FileTextOutlined, BulbOutlined, CodeOutlined 
} from '@ant-design/icons';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; 

import axiosClient from '../../services/axiosClient'; 

const { Title, Text } = Typography;
const { Option } = Select;

const ContentManagement = () => {
  const mindWellColor = '#1a6d5d';
  const [form] = Form.useForm();
  
  const quillRef = useRef(null);
  
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false); // 👇 THÊM STATE ĐỂ NÚT LƯU XOAY XOAY
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [isJsonModalVisible, setIsJsonModalVisible] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  const fetchContents = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/content');
      const data = response.data || response; 
      
      setContents(Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []));
      
    } catch (error) {
      console.error("Lỗi lấy Content:", error);
      message.error('Không thể tải dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const filteredContents = contents.filter((item) => {
    const matchType = typeFilter === 'all' || item.type === typeFilter;
    const matchText = item.title?.toLowerCase().includes(searchText.toLowerCase());
    return matchType && matchText;
  });

  const openDrawer = (record = null) => {
    if (record) {
      setEditingId(record._id); 
      form.setFieldsValue(record); 
    } else {
      setEditingId(null);
      form.resetFields();
      form.setFieldsValue({ type: 'tip', status: 'draft' });
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    form.resetFields();
  };

  const handleImportJson = () => {
    try {
      const parsedData = JSON.parse(jsonInput);
      
      form.setFieldsValue({
        type: parsedData.type || 'tip',
        category: parsedData.category || 'Stress',
        status: parsedData.status || 'published',
        title: parsedData.title || '',
        description: parsedData.description || '',
        imageUrl: parsedData.imageUrl || '',
        author: parsedData.author || 'MindWell',
        bodyContent: parsedData.bodyContent || ''
      });

      message.success("Đã tự động điền nội dung bài viết thành công!");
      setIsJsonModalVisible(false);
      setJsonInput('');
    } catch (error) {
      console.error("Lỗi parse JSON:", error);
      message.error("Định dạng JSON không hợp lệ! Vui lòng copy đúng cấu trúc.");
    }
  };

  // 👇 ĐÂY RỒI: HÀM LƯU DỮ LIỆU ĐÃ ĐƯỢC FIX LỖI "IM RU"
  const handleSave = async (values) => {
    setSubmitting(true); // Bật hiệu ứng xoay xoay
    try {
      if (editingId) {
        await axiosClient.put(`/content/${editingId}`, values);
      } else {
        await axiosClient.post('/content', values);
      }

      // CHÌA KHÓA Ở ĐÂY: Chỉ cần chạy qua được 2 dòng trên mà không bị văng lỗi (catch)
      // Thì mặc định là Backend đã lưu thành công! Không cần đợi chữ success.
      
      message.success(editingId ? 'Đã cập nhật nội dung!' : 'Đã tạo nội dung mới!');
      
      fetchContents(); // Tự động load lại bảng luôn và ngay
      closeDrawer();   // Đóng ngăn kéo lại

    } catch (error) {
      console.error("Lỗi Save:", error);
      message.error('Lỗi khi lưu nội dung. Vui lòng kiểm tra lại!');
    } finally {
      setSubmitting(false); // Tắt hiệu ứng xoay xoay
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/content/${id}`);
      
      // Xóa dứt khoát, không chờ success
      message.success('Đã xóa nội dung thành công!');
      setContents(prevContents => prevContents.filter(c => c._id !== id));
      
    } catch (error) {
      console.error("Lỗi xóa Content:", error);
      message.error('Không thể xóa nội dung!');
    }
  };

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/png, image/jpeg, image/jpg');
    input.click();

    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        return message.error('Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.');
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result; 
        
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection(true);
        
        quill.insertEmbed(range.index, 'image', base64Image);
        quill.setSelection(range.index + 1);
        
        message.success('Đã chèn ảnh thật thành công!');
      };
      
      reader.readAsDataURL(file); 
    };
  };

  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'], 
        [{ 'color': [] }, { 'background': [] }],   
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image', 'video'],                
        ['clean']                                         
      ],
      handlers: { image: imageHandler }
    }
  }), []);

  const columns = [
    {
      title: 'Tiêu đề nội dung',
      key: 'title',
      // Dùng minWidth để chữ không bao giờ bị ép dẹp lép
      render: (_, record) => {
        const isTip = record.type === 'tip'; 
        return (
        <div style={{ display: 'flex', gap: '12px', minWidth: '300px' }}> {/* Dùng div thay Space cho chắc */}
          <div style={{ backgroundColor: isTip ? '#fffbe6' : '#e6f4ff', padding: '10px', borderRadius: '8px', height: 'fit-content' }}>
            {isTip ? <BulbOutlined style={{ fontSize: '20px', color: '#faad14' }} /> : <FileTextOutlined style={{ fontSize: '20px', color: '#1890ff' }} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: '#333', marginBottom: '4px' }}>{record.title}</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Tag color={isTip ? 'gold' : 'blue'} style={{ margin: 0 }}>{isTip ? 'TIP' : 'NEWS'}</Tag>
              <Text type="secondary" style={{ fontSize: '12px' }}>Tác giả: {record.author}</Text>
            </div>
          </div>
        </div>
      )},
    },
    { title: 'Chủ đề', dataIndex: 'category', render: (c) => <Tag color="purple">{c}</Tag> },
    { title: 'Lượt xem', dataIndex: 'views', render: (v) => `${v?.toLocaleString() || 0}` },
    { title: 'Trạng thái', dataIndex: 'status', render: (s) => <Tag color={s === 'published' ? 'green' : 'default'}>{s === 'published' ? 'XUẤT BẢN' : 'BẢN NHÁP'}</Tag> },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa"><Button type="text" icon={<EditOutlined style={{ color: '#1890ff' }} />} onClick={() => openDrawer(record)} /></Tooltip>
          <Popconfirm title="Xóa nội dung này?" onConfirm={() => handleDelete(record._id)} okText="Xóa" cancelText="Hủy">
            <Tooltip title="Xóa"><Button type="text" danger icon={<DeleteOutlined />} /></Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
         <Title level={3} style={{ color: mindWellColor, margin: 0, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Quản Lý Nội Dung
      </Title>
        <Button type="primary" icon={<PlusOutlined />} style={{ backgroundColor: mindWellColor }} onClick={() => openDrawer()}>
          Thêm Nội dung mới
        </Button>
      </div>

      {/* 👇 BỌC THÊM FLEXWRAP VÀO ĐÂY ĐỂ TRÁNH RỚT DÒNG LỘN XỘN 👇 */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <Input placeholder="Tìm kiếm tiêu đề..." prefix={<SearchOutlined />} style={{ width: 300, flexGrow: 1, maxWidth: '100%' }} value={searchText} onChange={(e) => setSearchText(e.target.value)} allowClear />
        <Select defaultValue="all" style={{ width: 180 }} value={typeFilter} onChange={setTypeFilter}>
          <Option value="all">Tất cả định dạng</Option>
          <Option value="tip">Gợi ý ngắn (Tip)</Option>
          <Option value="news">Tin bài (News)</Option>
        </Select>
      </div>

      {/* 👇 THÊM THUỘC TÍNH SCROLL X ĐỂ CHỐNG ÉP GIÒ BẢNG 👇 */}
      <Table columns={columns} dataSource={filteredContents} rowKey="_id" loading={loading} scroll={{ x: 'max-content' }} />

      <Drawer 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <strong style={{ color: mindWellColor, fontSize: '18px' }}>
              {editingId ? "Chỉnh sửa Nội dung" : "Đăng tải Nội dung mới"}
            </strong>
            {!editingId && (
              <Button type="dashed" icon={<CodeOutlined />} onClick={() => setIsJsonModalVisible(true)}>
                Nhập nhanh 
              </Button>
            )}
          </div>
        }
        width={800} 
        onClose={closeDrawer} 
        open={isDrawerOpen} 
        maskClosable={false}
        extra={
          <Space>
            <Button onClick={closeDrawer}>Hủy</Button>
            <Button type="primary" onClick={() => form.submit()} loading={submitting} style={{ backgroundColor: mindWellColor }}>
              Lưu
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          {/* 👇 FORM ĐƯỢC BỌC FLEXWRAP ĐỂ RESPONSIVE TỐT HƠN 👇 */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Form.Item label="Phân loại hiển thị" name="type" style={{ minWidth: '150px', flex: 1 }}>
              <Select>
                <Option value="tip">Gợi ý ngắn (Tip)</Option>
                <Option value="news">Tin bài (News)</Option>
              </Select>
            </Form.Item>
            
            <Form.Item label="Chủ đề" name="category" style={{ minWidth: '150px', flex: 2 }} rules={[{ required: true }]}>
              <Select placeholder="Chọn chủ đề">
                <Option value="Stress">Áp lực / Stress</Option>
                <Option value="Trầm cảm">Trầm cảm</Option>
                <Option value="Lo âu">Lo âu</Option>
                <Option value="Mất ngủ">Mất ngủ</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Trạng thái" name="status" style={{ minWidth: '150px', flex: 1 }}>
              <Select>
                <Option value="draft">Bản nháp</Option>
                <Option value="published">Xuất bản</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item label="Tiêu đề" name="title" rules={[{ required: true, message: 'Nhập tiêu đề!' }]}>
            <Input size="large" />
          </Form.Item>

          <Form.Item label="Mô tả ngắn (Hiển thị trên App)" name="description" rules={[{ required: true, message: 'Nhập mô tả ngắn!' }]}>
            <Input.TextArea rows={2} placeholder="Nhập 1-2 câu tóm tắt..." />
          </Form.Item>

          <Form.Item label="Link Ảnh Bìa (Thumbnail)" name="imageUrl" rules={[{ required: true, message: 'Nhập link ảnh!' }]}>
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item label="Tác giả" name="author" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Divider />

          <Form.Item name="bodyContent" label="Nội dung chi tiết" rules={[{ required: true, message: 'Nội dung không được để trống!' }]}>
            <ReactQuill ref={quillRef} theme="snow" modules={quillModules} style={{ height: '350px', marginBottom: '50px' }} />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal 
        title="Nhập nhanh Nội dung từ JSON" 
        open={isJsonModalVisible} 
        onOk={handleImportJson} 
        onCancel={() => setIsJsonModalVisible(false)}
        okText="Tự động điền Form"
        cancelText="Hủy"
        width={600}
      >
        <p style={{color: '#666', marginBottom: 15}}>
          Dán đoạn mã JSON chứa thông tin bài viết vào đây. Hệ thống sẽ tự động điền vào các ô trống.
        </p>
        <Input.TextArea 
          rows={15} 
          placeholder='{"title": "Cách xả stress...", ...}' 
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          style={{ fontFamily: 'monospace' }}
        />
      </Modal>

    </Card>
  );
};

export default ContentManagement;