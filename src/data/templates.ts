import { ScriptTemplate } from "../types";
import { v4 as uuidv4 } from "uuid";

export const SAMPLE_TEMPLATES: ScriptTemplate[] = [
  {
    id: "tiktok-viral-60s",
    title: "⚡ TikTok / Shorts 60s Viral Formula",
    description: "Cấu trúc vàng giữ chân người xem 100%: 3s Hook sốc -> 10s Nỗi đau -> 30s Giải pháp bất ngờ -> 10s Kêu gọi Follow.",
    format: "short",
    platform: "tiktok",
    topic: "business",
    tone: "energetic_viral",
    targetDuration: "60s",
    previewHook: "90% người mới khởi nghiệp mất tiền chỉ vì bỏ qua quy luật 3 giây này!",
    shots: [
      {
        id: uuidv4(),
        shotNumber: 1,
        timeRange: "0:00 - 0:03",
        visual: "Cận cảnh Creator giơ tay làm động tác 'Stop', camera zoom nhanh dứt khoát.",
        audio: "90% người mới kinh doanh mất sạch vốn chỉ vì 1 sai lầm ngớ ngẩn này!",
        onScreenText: "DỪNG LẠI NẾU KHÔNG MUỐN MẤT TIỀN ❌",
        notes: "Nhạc nền drop beat ngay giây 0:01"
      },
      {
        id: uuidv4(),
        shotNumber: 2,
        timeRange: "0:03 - 0:12",
        visual: "Chuyển cảnh B-roll: Biểu đồ doanh thu tụt dốc, Creator chỉ tay vào màn hình phân tích.",
        audio: "Hầu hết mọi người chỉ chăm chăm nhập hàng trước, mà quên mất điều cốt lõi: Bạn đã có tệp khách hàng sẵn sàng chi tiền hay chưa?",
        onScreenText: "Sai lầm: Ôm hàng trước, tìm khách sau! 📉",
        notes: "Giọng nói đanh thép, năng lượng cao"
      },
      {
        id: uuidv4(),
        shotNumber: 3,
        timeRange: "0:12 - 0:35",
        visual: "Creator mở laptop, quay màn hình hiển thị 3 bước xác thực nhu cầu thị trường thực tế.",
        audio: "Thay vì vậy, hãy áp dụng quy tắc 'Bán trước khi có': Tạo một trang landing page thử nghiệm, đo lường phản hồi trong 48 giờ. Nếu có trên 50 người đăng ký, lúc đó mới bắt đầu nhập hàng!",
        onScreenText: "Chiến thuật: BÁN TRƯỚC - NHẬP SAU 💡",
        notes: "Thêm tiếng bấm bàn phím [SFX: Typing] và popup đồ họa từng bước"
      },
      {
        id: uuidv4(),
        shotNumber: 4,
        timeRange: "0:35 - 0:50",
        visual: "Góc quay trung (Medium shot), Creator chia sẻ trải nghiệm thực tế cứu nguy cho dự án cá nhân.",
        audio: "Chính công thức đơn giản này đã giúp team mình tiết kiệm hơn 200 triệu đồng tiền hàng tồn kho trong năm vừa rồi.",
        onScreenText: "Tiết kiệm hơn 200 Triệu Vốn 💰",
        notes: "Âm điệu chân thật, uy tín"
      },
      {
        id: uuidv4(),
        shotNumber: 5,
        timeRange: "0:50 - 0:60",
        visual: "Creator nở nụ cười tự tin, chỉ tay xuống nút Follow bên dưới.",
        audio: "Bấm Follow ngay nếu bạn muốn học thêm nhiều bí quyết kinh doanh thực chiến không màu mè!",
        onScreenText: "👉 BẤM FOLLOW ĐỂ KHÔNG BỎ LỠ!",
        notes: "Animation nút Subscribe/Follow nhấp nháy trên màn hình"
      }
    ]
  },
  {
    id: "youtube-deepdive-10m",
    title: "🎬 YouTube Long-form: Video Essay Phân Tích Chuyên Sâu",
    description: "Cấu trúc chuẩn kênh triệu sub (Vox, Johnny Harris, Kurzgesagt): Mở đầu bí ẩn -> 3 Luận điểm cốt lõi -> Đỉnh điểm nhận thức -> Kết luận sâu sắc.",
    format: "long",
    platform: "youtube_long",
    topic: "tech",
    tone: "expert_analytical",
    targetDuration: "10m",
    previewHook: "Điều gì sẽ xảy ra nếu Trí Tuệ Nhân Tạo vượt qua giới hạn năng lượng của loài người?",
    shots: [
      {
        id: uuidv4(),
        shotNumber: 1,
        timeRange: "0:00 - 0:45",
        visual: "Màn hình tối dần. Âm thanh radio rè. Dòng chữ 'Năm 2026' hiện lên. Cảnh siêu máy chủ nhấp nháy ánh đèn xanh.",
        audio: "[Voiceover trầm ấm, bí ẩn] Mỗi một câu lệnh bạn gõ vào AI tiêu tốn lượng điện năng gấp 10 lần một lượt tìm kiếm thông thường. Nhưng điều đáng sợ không nằm ở con số đó...",
        onScreenText: "THE HIDDEN COST OF AI ⚡",
        notes: "Nhạc nền Ambient điện tử tăng dần độ dồn dập"
      },
      {
        id: uuidv4(),
        shotNumber: 2,
        timeRange: "0:45 - 2:30",
        visual: "Đồ họa bản đồ thế giới hiển thị các trung tâm dữ liệu khổng lồ tại Mỹ và Châu Á.",
        audio: "Phần 1: Cơn khát năng lượng vô tận. Để duy trì cuộc đua AI, các tập đoàn công nghệ lớn nhất hành tinh đang bí mật tái khởi động các nhà máy điện hạt nhân cũ...",
        onScreenText: "CHƯƠNG 1: CUỘC ĐUA NĂNG LƯỢNG NGẦM",
        notes: "Chuyển sang nhạc nền phân tích tài liệu"
      },
      {
        id: uuidv4(),
        shotNumber: 3,
        timeRange: "2:30 - 6:00",
        visual: "Phỏng vấn các nhà khoa học, hình ảnh minh họa cơ chế hoạt động của chip bán dẫn thế hệ mới.",
        audio: "Phần 2: Nút thắt vật lý của loài người. Khi định luật Moore bắt đầu chậm lại, cách duy nhất để AI thông minh hơn là nhồi nhét hàng triệu con chip hoạt động cùng lúc...",
        onScreenText: "CHƯƠNG 2: GIỚI HẠN VẬT LÝ",
        notes: "Animation 3D mặt phẳng vi mạch"
      },
      {
        id: uuidv4(),
        shotNumber: 4,
        timeRange: "6:00 - 8:30",
        visual: "Cảnh quay tương lai: Năng lượng nhiệt hạch, trạm vũ trụ khai thác mặt trời.",
        audio: "Phần 3: Lối thoát duy nhất. Liệu chúng ta có kịp làm chủ công nghệ phản ứng nhiệt hạch trước khi lưới điện toàn cầu sụp đổ?",
        onScreenText: "CHƯƠNG 3: BÌNH MINH MỚI HAY HỐ SÂU?",
        notes: "Giai điệu hoành tráng, gợi mở"
      },
      {
        id: uuidv4(),
        shotNumber: 5,
        timeRange: "8:30 - 10:00",
        visual: "Host xuất hiện tại bàn làm việc trước micro, tổng kết góc nhìn và câu hỏi mở cho khán giả bình luận.",
        audio: "Tương lai của AI không chỉ phụ thuộc vào thuật toán, mà là cuộc chơi của nguồn điện. Bạn nghĩ AI sẽ cứu rỗi hay đẩy hành tinh vào khủng hoảng? Hãy để lại bình luận bên dưới và nhấn Đăng ký kênh để cùng mình khám phá tập tiếp theo!",
        onScreenText: "BẠN NGHĨ SAO? ĐỂ LẠI BÌNH LUẬN 👇",
        notes: "Hiện End Screen video đề xuất"
      }
    ]
  },
  {
    id: "tvc-ecommerce-sales",
    title: "🛍️ TVC Quảng Cáo / Video Bán Hàng Chuyển Đổi Cao",
    description: "Công thức PAS (Problem - Agitation - Solution) biến người xem thành khách hàng: Nêu vấn đề -> Khoét sâu nỗi đau -> Giới thiệu sản phẩm như vị cứu tinh -> Ưu đãi giới hạn.",
    format: "commercial",
    platform: "commercial_tvc",
    topic: "marketing_sales",
    tone: "persuasive_sales",
    targetDuration: "45s",
    previewHook: "Bạn mất hơn 2 tiếng mỗi ngày chỉ để dọn dẹp nhà cửa sau giờ làm việc mệt mỏi?",
    shots: [
      {
        id: uuidv4(),
        shotNumber: 1,
        timeRange: "0:00 - 0:05",
        visual: "Nhân vật chính về nhà sau giờ làm, ném cặp sách xuống ghế, vẻ mặt mệt mỏi nhìn sàn nhà bừa bộn bụi bặm.",
        audio: "Đi làm 8 tiếng đã quá mệt, về nhà lại phải còng lưng quét dọn lau chùi?",
        onScreenText: "MỆT MỎI VÌ DỌN NHÀ MỖI TỐI? 😩",
        notes: "Tone màu xám mệt mỏi, âm thanh thở dài [SFX: Sigh]"
      },
      {
        id: uuidv4(),
        shotNumber: 2,
        timeRange: "0:05 - 0:15",
        visual: "Robot hút bụi thông minh tự động lướt qua gầm giường, hút sạch lông thú cưng và bụi mịn chỉ trong 1 nốt nhạc.",
        audio: "Hãy để SmartClean Pro làm thay bạn! Với lực hút 6000Pa và cảm biến AI tránh vật cản thông minh.",
        onScreenText: "TỰ ĐỘNG HÚT BỤI & LAU SÀN 100% ✨",
        notes: "Tone màu bừng sáng rực rỡ, nhạc nền tươi vui hiện đại"
      },
      {
        id: uuidv4(),
        shotNumber: 3,
        timeRange: "0:15 - 0:30",
        visual: "Nhân vật chính thảnh thơi nằm sofa uống trà xem phim trong khi robot tự quay về trạm giặt giẻ tự động.",
        audio: "Không cần đụng tay, giẻ lau được tự động giặt sấy nhiệt 60 độ kháng khuẩn. Nhà luôn sạch bóng thơm mát!",
        onScreenText: "TỰ GIẶT & SẤY GIẺ KHÁNG KHUẨN 99.9%",
        notes: "Cận cảnh giọt nước lau sạch sáng bóng"
      },
      {
        id: uuidv4(),
        shotNumber: 4,
        timeRange: "0:30 - 0:45",
        visual: "Hình ảnh hộp sản phẩm sang trọng kèm tem bảo hành 24 tháng và banner quà tặng.",
        audio: "Chỉ duy nhất trong tuần này: Giảm ngay 30% kèm quà tặng bộ phụ kiện trị giá 1 triệu đồng. Nhấp ngay vào liên kết bên dưới!",
        onScreenText: "🔥 GIẢM 30% + QUÀ 1.000.000Đ - SỐ LƯỢNG CÓ HẠN!",
        notes: "Đồng hồ đếm ngược chốt sale ở góc màn hình"
      }
    ]
  },
  {
    id: "cinematic-film-script",
    title: "🎥 Phim Ngắn / Điện Ảnh: Kịch Bản 3 Hồi Chuẩn Hollywood",
    description: "Định dạng kịch bản phim điện ảnh chuyên nghiệp (Scene Heading, Action, Character, Dialogue) dành cho đạo diễn và diễn viên.",
    format: "screenplay",
    platform: "film",
    topic: "horror_mystery",
    tone: "cinematic_dramatic",
    targetDuration: "5m",
    previewHook: "Một cuộc gọi lúc nửa đêm từ số điện thoại của người đã mất 3 năm trước...",
    screenplayElements: [
      {
        id: uuidv4(),
        type: "SCENE_HEADING",
        text: "NỘI CẢNH. PHÒNG KHÁCH - ĐÊM"
      },
      {
        id: uuidv4(),
        type: "ACTION",
        text: "Căn phòng chìm trong bóng tối dày đặc. Tiếng mưa đập dồn dập vào ô cửa kính. Đồng hồ treo tường điểm 00:00."
      },
      {
        id: uuidv4(),
        type: "ACTION",
        text: "MINH (30 tuổi, vẻ mặt mệt mỏi, đôi mắt thâm quầng) đang ngồi trước ly cà phê đã nguội ngắt. Bất ngờ, chiếc điện thoại bàn cổ trên kệ phát ra tiếng chuông inh ỏi."
      },
      {
        id: uuidv4(),
        type: "CHARACTER",
        text: "MINH"
      },
      {
        id: uuidv4(),
        type: "PARENTHETICAL",
        text: "(thì thầm, tay run rẩy chạm vào ống nghe)"
      },
      {
        id: uuidv4(),
        type: "DIALOGUE",
        text: "Đường dây này... đã bị cắt 3 năm nay rồi mà..."
      },
      {
        id: uuidv4(),
        type: "ACTION",
        text: "Minh nhấc ống nghe áp vào tai. Ở đầu dây bên kia, chỉ có tiếng thở dài nặng nhọc kèm theo giai điệu hộp nhạc quen thuộc."
      },
      {
        id: uuidv4(),
        type: "CHARACTER",
        text: "GIỌNG NÓI TRONG ĐIỆN THOẠI (V.O.)"
      },
      {
        id: uuidv4(),
        type: "DIALOGUE",
        text: "Anh vẫn chưa quên món nợ năm xưa đúng không, Minh?"
      },
      {
        id: uuidv4(),
        type: "TRANSITION",
        text: "CẮT NHANH SANG:"
      }
    ]
  },
  {
    id: "tech-gadget-review",
    title: "📱 Review Công Nghệ & Trải Nghiệm Sản Phẩm",
    description: "Cấu trúc đánh giá khách quan, lôi cuốn: Mở hộp ấn tượng -> Trải nghiệm tính năng đỉnh -> Thử thách thực tế (Stress test) -> Lời khuyên mua sắm.",
    format: "short",
    platform: "youtube_shorts",
    topic: "tech",
    tone: "expert_analytical",
    targetDuration: "60s",
    previewHook: "Chiếc điện thoại này có thật sự đáng giá 30 triệu hay chỉ là chiêu trò marketing?",
    shots: [
      {
        id: uuidv4(),
        shotNumber: 1,
        timeRange: "0:00 - 0:04",
        visual: "Bóc seal hộp cực kỳ đã tai (ASMR), camera lia macro qua khung viền titan.",
        audio: "Sau đúng 1 tháng sử dụng làm máy chính, đây là 3 sự thật về siêu phẩm này mà reviewer khác ngại nói!",
        onScreenText: "SỰ THẬT SAU 30 NGÀY TRẢI NGHIỆM 📱",
        notes: "Âm thanh xé seal [SFX: Unboxing ASMR]"
      },
      {
        id: uuidv4(),
        shotNumber: 2,
        timeRange: "0:04 - 0:25",
        visual: "Test camera ngược sáng, quay màn hình chơi game nặng mượt mà ở 120 FPS.",
        audio: "Điểm cộng lớn nhất là khả năng quay video thiếu sáng khử nhiễu đỉnh cao. Tuy nhiên, nếu bạn mua máy về chỉ để chơi game liên tục thì hãy cẩn thận vì mặt lưng ấm lên khá nhanh sau 20 phút!",
        onScreenText: "Ưu: Camera đỉnh | Nhược: Nóng máy khi cày game ⚠️",
        notes: "Hiện biểu đồ nhiệt độ thực tế"
      },
      {
        id: uuidv4(),
        shotNumber: 3,
        timeRange: "0:25 - 0:50",
        visual: "Cân đo đong đếm thời lượng pin trên thực tế so sánh với đối thủ cạnh tranh.",
        audio: "Bù lại, thời lượng pin on-screen vượt mốc 7 tiếng rưỡi, đủ cho cả ngày dài làm việc không cần mang theo sạc dự phòng.",
        onScreenText: "Pin On-Screen: 7h30 Phút 🔋",
        notes: "Hiệu ứng pin nạp năng lượng"
      },
      {
        id: uuidv4(),
        shotNumber: 4,
        timeRange: "0:50 - 0:60",
        visual: "Host cầm máy trên tay, tổng kết kết luận chấm điểm 8.5/10.",
        audio: "Tóm lại: Đáng tiền cho người sáng tạo nội dung, còn dân cày game nên cân nhắc. Bạn nghĩ sao? Comment ý kiến bên dưới nhé!",
        onScreenText: "ĐIỂM: 8.5/10 - ĐÁNG MUA KHÔNG?",
        notes: "Gợi ý tương tác bình luận"
      }
    ]
  }
];
