/**
 * Reflection Templates for Emotional Checkout (Act 3)
 * Used by Context-Aware Reflection Engine
 */

export const REFLECTION_TEMPLATES = {
  NEGATIVE: [
    {
      id: 'NEG_01',
      template: "Nếu được phép tạm gác lại lo lắng về {anchor} trong 1 giờ tới, bạn sẽ cảm thấy thế nào?",
      trigger: "User nhắc đến nhiều task/lo lắng.",
      psychology: "Tạo khoảng nghỉ cho não bộ (Permission to pause)."
    },
    {
      id: 'NEG_02',
      template: "Bước nhỏ nhất, dễ nhất để xử lý {anchor} mà bạn có thể làm ngay ngày mai là gì?",
      trigger: "User tỏ ra bế tắc/quá tải.",
      psychology: "Phá vỡ sự trì hoãn bằng hành động nhỏ (Micro-step)."
    },
    {
      id: 'NEG_03',
      template: "Việc {anchor} đang chiếm bao nhiêu % tâm trí bạn lúc này? Viết nó xuống có giúp nhẹ bớt không?",
      trigger: "User viết rất dài (High Note Volume).",
      psychology: "Định lượng cảm xúc (Emotional Labeling)."
    }
  ],
  POSITIVE: [
    {
      id: 'POS_01',
      template: "Khoảnh khắc về {anchor} thật tuyệt. Ai hay điều gì đã giúp bạn có được nó?",
      trigger: "User nhắc đến thành tựu/kết nối.",
      psychology: "Biết ơn và nhận diện nguyên nhân (Causality)."
    },
    {
      id: 'POS_02',
      template: "Làm sao để bạn mang năng lượng từ {anchor} vào các đầu việc của ngày mai?",
      trigger: "User đang hào hứng (Excited).",
      psychology: "Chuyển hóa cảm xúc thành động lực (Momentum)."
    },
    {
      id: 'POS_03',
      template: "Nếu đặt tên cho chương này của cuộc đời dựa trên niềm vui về {anchor}, bạn sẽ đặt là gì?",
      trigger: "User cảm thấy tự hào.",
      psychology: "Tăng ý nghĩa cho trải nghiệm (Meaning Making)."
    }
  ],
  NEUTRAL: [
    {
      id: 'NEU_01',
      template: "Sau khoảng thời gian tập trung vào {anchor}, ý tưởng quan trọng nhất đọng lại là gì?",
      trigger: "User ở chế độ Focus/Work.",
      psychology: "Củng cố trí nhớ (Recall & Consolidation)."
    },
    {
      id: 'NEU_02',
      template: "Trong sự tĩnh lặng này, cảm giác nào đang hiện diện rõ nhất?",
      trigger: "User không viết gì (Zero notes) hoặc ít viết.",
      psychology: "Chánh niệm (Mindfulness Check-in)."
    },
    {
      id: 'NEU_03',
      template: "Bạn đã dành thời gian cho {anchor}. Nó có xứng đáng với năng lượng của bạn hôm nay không?",
      trigger: "User viết về công việc thường nhật.",
      psychology: "Đánh giá giá trị (Value Assessment)."
    }
  ]
};

