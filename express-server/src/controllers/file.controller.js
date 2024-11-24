const { upload, processVideoUpload } = require('../services/file.service');

// Hàm xử lý upload video
const uploadVideo = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Không có video được tải lên' });
  }

  try {
    const videoPath = processVideoUpload(req.file); // Gọi hàm xử lý từ service

    // Trả về kết quả sau khi xử lý
    res.status(200).json({ message: 'Video đã được tải lên thành công', videoPath });
  } catch (error) {
    console.error('Có lỗi xảy ra:', error);
    res.status(500).json({ message: 'Lỗi trong quá trình xử lý video' });
  }
};

module.exports = {
  uploadVideo
};
