const multer = require("multer");
const path = require("path");

// Cấu hình lưu trữ file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Thư mục lưu trữ video
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    cb(null, Date.now() + fileExtension); // Tạo tên file duy nhất
  },
});

// Sử dụng multer để xử lý upload
const upload = multer({ storage: storage });

// Logic xử lý video sau khi upload
const processVideoUpload = (file) => {
  const videoPath = file.path; // Đường dẫn video sau khi upload
  console.log("Video đã được tải lên:", videoPath);

  // Thực hiện các bước xử lý khác nếu cần
  // (Ví dụ: gọi mô hình AI để nhận diện ngôn ngữ ký hiệu, lưu vào database, v.v.)
  return videoPath; // Trả về đường dẫn video đã upload
};

module.exports = {
  upload,
  processVideoUpload,
};
