require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối Supabase
// Đảm bảo bạn đã có file .env chứa SUPABASE_URL và SUPABASE_KEY nhé
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ============================================
// API 1: NHẬN DỮ LIỆU TỪ FORM (POST)
// ============================================
app.post('/api/submit', async (req, res) => {
    const { fullName, accessoryType, colorPreference } = req.body;

    // Validate đơn giản
    if (!fullName || !accessoryType || !colorPreference) {
        return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin!' });
    }

    try {
        const { data, error } = await supabase
            .from('user_preferences')
            .insert([
                { 
                    full_name: fullName, 
                    accessory_type: accessoryType, 
                    color_preference: colorPreference 
                }
            ]);

        if (error) throw error;

        res.status(200).json({ message: 'Lưu thành công!', data });
    } catch (error) {
        console.error("Lỗi khi lưu:", error);
        res.status(500).json({ error: 'Lỗi server khi lưu dữ liệu' });
    }
});

// ============================================
// API 2: LẤY TOÀN BỘ DANH SÁCH (Đã sửa đổi)
// ============================================
app.get('/api/stats', async (req, res) => {
    try {
        // Lấy tất cả các cột, sắp xếp người mới nhất lên đầu (order by id desc)
        const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        // Trả về nguyên danh sách cho Frontend tự xử lý
        res.json(data);

    } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
        res.status(500).json({ error: 'Lỗi server khi lấy dữ liệu' });
    }
});

// Khởi chạy Server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});