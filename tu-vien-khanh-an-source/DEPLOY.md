# Xuất bản miễn phí trên Render

Game cần **Web Service Node.js có WebSocket**, không phải Static Site. Cấu hình `render.yaml` đã chọn gói Free và vùng Singapore. Không đặt cổng cố định: máy chủ dùng biến `PORT` của hosting và lắng nghe trên `0.0.0.0`.

## Các bước

1. Tạo một repository GitHub **riêng tư**, đưa mã nguồn dự án vào đó. Không tải `node_modules`, `dist`, file bí mật hoặc API key lên repository.
2. Đăng nhập Render và kết nối repository đó. Nếu dùng Blueprint, chọn **New → Blueprint**, chọn repository và triển khai cấu hình `render.yaml`.
3. Nếu tạo thủ công, chọn **New → Web Service**, kết nối repository, chọn Node và gói **Free**, vùng Singapore.
4. Build command: `npm ci --include=dev && npm run build`. Start command: `npm start`. Biến môi trường: `NODE_ENV=production`, `NODE_VERSION=22.16.0`. Health check: `/`.
5. Khi trạng thái là **Live**, lấy địa chỉ HTTPS `.onrender.com` mà Render cấp. Đây mới là địa chỉ chia sẻ cố định, không phụ thuộc máy cá nhân.

Không cần cấu hình URL WebSocket riêng: game tự kết nối `wss://<tên-host>/world` theo địa chỉ trang hiện tại. Mọi người mở cùng địa chỉ sẽ vào cùng máy chủ.

## Giới hạn miễn phí

- Theo tài liệu Render kiểm tra ngày 06/11/2026, dịch vụ Free ngủ sau 15 phút không có HTTP request hoặc tin nhắn WebSocket; lần mở tiếp theo có thể cần khoảng một phút để khởi động.
- Mỗi workspace có 750 giờ Free mỗi tháng, chia sẻ giữa các dịch vụ Free. Có hạn mức tài nguyên và băng thông; không phải dịch vụ 24/7 không giới hạn.
- Trạng thái người chơi đang online nằm trong RAM; khởi động lại/ngủ sẽ ngắt kết nối. Client tự kết nối lại; tiến độ nhiệm vụ và tên vẫn lưu riêng trên trình duyệt, không phải tài khoản đồng bộ.
- Không cần tải nhạc lên hosting: phần nhạc tiếp tục dùng YouTube.

Tài liệu chính thức: https://render.com/docs/free và https://render.com/docs/websocket .

## Xác minh sau triển khai

```sh
GAME_URL=https://TEN-HOST.onrender.com node scripts/check-character-labels.js
GAME_URL=https://TEN-HOST.onrender.com node scripts/check-hud-layout.js
GAME_URL=https://TEN-HOST.onrender.com node scripts/check-courtyard-leaves.js
```

Mở thêm hai trình duyệt/thiết bị để xác nhận nhìn thấy nhau và gửi chat đúng người. Không gọi link `trycloudflare.com` là bản xuất bản cố định; link đó chỉ là đường hầm tạm từ máy cá nhân.
