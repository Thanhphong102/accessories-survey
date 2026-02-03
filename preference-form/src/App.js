import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// ==========================================
// 1. COMPONENT: FORM NHẬP LIỆU (User) - Đã thêm UI thông báo đẹp
// ==========================================
function UserForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    accessoryType: '',
    colorPreference: ''
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // <--- Trạng thái mới

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('https://accessories-survey.onrender.com/api/submit', formData);
      
      // Thay vì alert, ta chuyển trạng thái để hiện giao diện cảm ơn
      setIsSubmitted(true); 
      
      // Reset form ngầm định
      setFormData({ fullName: '', accessoryType: '', colorPreference: '' });
    } catch (error) {
      console.error(error);
      alert('Lỗi kết nối Server!'); // Lỗi thì vẫn nên alert hoặc hiện text đỏ
    } finally {
      setLoading(false);
    }
  };

  // Hàm để quay lại nhập tiếp
  const handleReset = () => {
    setIsSubmitted(false);
  };

  return (
    <div className="form-container">
      
      {/* LOGIC HIỂN THỊ: Nếu đã gửi (isSubmitted = true) thì hiện thông báo, ngược lại hiện Form */}
      {isSubmitted ? (
        <div className="success-message">
          <div className="checkmark-circle">
            <div className="checkmark"></div>
          </div>
          <h2>Gửi thành công! 🎉</h2>
          <p>Cảm ơn bạn đã tham gia khảo sát.</p>
          <p>Thông tin của bạn đã được lưu lại.</p>
          
        
        </div>
      ) : (
        <>
          <h2>✨ Khảo sát Phụ Kiện ✨</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Họ và tên của bạn</label>
              <input 
                type="text" 
                name="fullName" 
                placeholder="Nhập tên..." 
                value={formData.fullName}
                onChange={handleChange}
                required 
                autoComplete="off"
              />
            </div>

            <div className="input-group">
              <label>Phụ kiện yêu thích</label>
              <div className="select-wrapper">
                <select 
                  name="accessoryType" 
                  value={formData.accessoryType} 
                  onChange={handleChange} 
                  required
                  className={!formData.accessoryType ? "placeholder-mode" : ""}
                >
                  <option value="" disabled hidden>Chọn phụ kiện...</option>
                  <option value="Vòng tay">Vòng tay</option>
                  <option value="Móc khóa">Móc khóa</option>
                  <option value="Dây treo điện thoại">Dây treo điện thoại</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Màu sắc / Tone màu ưa thích</label>
              <input 
                type="text" 
                name="colorPreference" 
                placeholder="Ví dụ: Pastel Blue, Đen nhám..." 
                value={formData.colorPreference}
                onChange={handleChange}
                required 
                autoComplete="off"
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi thông tin 🚀'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
// ==========================================
// 2. COMPONENT: DASHBOARD (ADMIN) - Đã nâng cấp
// ==========================================
function Dashboard() {
  const [users, setUsers] = useState([]); // Chứa danh sách người dùng
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://accessories-survey.onrender.com/api/stats')
      .then(res => {
        setUsers(res.data); // Lưu dữ liệu vào state
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading-text">⏳ Đang tải dữ liệu...</div>;

  // Tính toán nhanh số liệu để hiển thị ở trên (Client-side calculation)
  const stats = {
    total: users.length,
    bracelet: users.filter(u => u.accessory_type === 'Vòng tay').length,
    keychain: users.filter(u => u.accessory_type === 'Móc khóa').length,
    phoneStrap: users.filter(u => u.accessory_type === 'Dây treo điện thoại').length
  };

  return (
    <div className="form-container dashboard-container">
      <h2>📊 Quản Lý Đơn Hàng</h2>
      
      {/* 1. Phần thống kê tóm tắt */}
      <div className="stats-grid">
        <div className="stat-card"><h3>Tổng đơn</h3><p>{stats.total}</p></div>
        <div className="stat-card"><h3>Vòng tay</h3><p>{stats.bracelet}</p></div>
        <div className="stat-card"><h3>Móc khóa</h3><p>{stats.keychain}</p></div>
        <div className="stat-card"><h3>Dây treo</h3><p>{stats.phoneStrap}</p></div>
      </div>

      {/* 2. Phần bảng chi tiết (MỚI) */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Họ và Tên</th>
              <th>Phụ kiện</th>
              <th>Màu sắc</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr key={user.id || index}>
                  <td>{index + 1}</td>
                  <td style={{fontWeight: 'bold'}}>{user.full_name}</td>
                  <td>
                    <span className={`badge ${user.accessory_type === 'Vòng tay' ? 'blue' : user.accessory_type === 'Móc khóa' ? 'purple' : 'pink'}`}>
                      {user.accessory_type}
                    </span>
                  </td>
                  <td>{user.color_preference}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>Chưa có dữ liệu nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Link to="/">
        <button style={{marginTop: '20px', background: 'rgba(0,0,0,0.3)'}}>
          ⬅ Quay lại trang chủ
        </button>
      </Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<UserForm />} />
          <Route path="/admin-secret" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;