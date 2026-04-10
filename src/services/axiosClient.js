import axios from 'axios';

// 1. Khởi tạo ông shipper
const axiosClient = axios.create({
  baseURL: 'https://mindwell-server-c802.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
});

// 2. Lắp máy tự động (Interceptor) để nhét Token vào mọi chuyến hàng
axiosClient.interceptors.request.use(
  (config) => {
    // Tìm đúng cái tên 'accessToken' mà lúc Login chúng ta đã lưu
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      // Dán vé lên trán shipper (Vào Header Authorization)
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// (Tùy chọn) Máy chặn lỗi trả về: Nếu vé hết hạn (401), tự động đá ra Login
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Token hết hạn hoặc không hợp lệ!");
      // Có thể thêm lệnh: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;