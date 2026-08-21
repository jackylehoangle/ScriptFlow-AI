import { StylePersona, PersonaCategory } from '../types';

export const PERSONA_CATEGORIES_META: { id: PersonaCategory; label: string; icon: string; desc: string }[] = [
  { id: 'all', label: 'Tất Cả Persona', icon: '🌟', desc: 'Toàn bộ thư viện phong cách & người kể' },
  { id: 'essay_philosophy', label: 'Triết Lý & Phân Tích Sâu', icon: '🧠', desc: 'Video Essay, phản biện đa chiều, góc nhìn hệ thống' },
  { id: 'finance_business', label: 'Tài Chính & Khởi Nghiệp', icon: '💼', desc: 'Thực chiến số liệu, bóc tách dòng tiền & kinh doanh' },
  { id: 'truecrime_mystery', label: 'Tội Phạm & Bí Ẩn Noir', icon: '🕵️‍♂️', desc: 'Điều tra hiện trường, hồ sơ tâm lý học tội phạm' },
  { id: 'science_tech', label: 'Khoa Học, Vũ Trụ & AI', icon: '🚀', desc: 'Bẻ gãy trực giác, công nghệ tương lai & vật lý lượng tử' },
  { id: 'history_epic', label: 'Lịch Sử & Chiến Lược Quân Sự', icon: '⚔️', desc: 'Hùng tráng, tái hiện chiến trường & số phận con người' },
  { id: 'cinema_art', label: 'Điện Ảnh & Nghệ Thuật Thị Giác', icon: '🎬', desc: 'Phân tích khung hình, Show Don\'t Tell, nghệ thuật phim' },
  { id: 'psychology_stoic', label: 'Tâm Lý Học & Stoicism', icon: '🏛️', desc: 'Kỷ luật thép, nội tâm sâu thẳm & hành vi con người' },
  { id: 'street_comedy', label: 'Đời Thường & Châm Biếm', icon: '☕', desc: 'Khẩu ngữ đường phố, punchline đanh thép, dí dỏm' },
  { id: 'wellness_biohack', label: 'Sức Khỏe & Biohacking', icon: '🧬', desc: 'Tối ưu hóa dopamine, thần kinh học & cơ thể sinh học' },
  { id: 'dark_horror', label: 'Kinh Dị & Siêu Nhiên', icon: '🕯️', desc: 'Rùng rợn, bóng tối, nỗi sợ tâm lý dai dẳng' },
];

export const CURATED_PERSONAS: StylePersona[] = [
  {
    id: 'johnny_harris_essayist',
    name: 'Johnny Harris / Phóng Sự Điều Tra Đa Chiều',
    category: 'essay_philosophy',
    icon: '🗺️',
    avatarColor: 'from-amber-600 to-orange-700',
    tagline: 'Phanh phui góc khuất hệ thống với nhịp điệu dồn dập, bản đồ trực quan và cảm xúc bức xúc tột độ',
    archetypeReference: 'Johnny Harris / Vox Borders / Cleo Abram',
    coreDescription: 'Văn phong báo chí điều tra hiện đại. Bắt đầu bằng một câu hỏi có vẻ ngây thơ nhưng vén màn cả một âm mưu hoặc hệ thống quyền lực khổng lồ. Sử dụng nhiều câu ngắt nhịp nhanh, câu hỏi tu từ và sự ngạc nhiên chân thật của người trong cuộc.',
    voiceCharacteristics: [
      'Nhịp điệu dồn dập, ngắt nghỉ có chủ đích',
      'Thường xuyên đặt câu hỏi tu từ thách thức góc nhìn quen thuộc',
      'Nhấn mạnh vào bằng chứng tài liệu, bản đồ và con số',
      'Bộc lộ cảm xúc bức xúc hoặc kinh ngạc cá nhân'
    ],
    cadenceAndPacing: 'Nhanh ➔ Chững lại ở điểm nghẽn ➔ Tăng tốc khi cao trào giải mã',
    catchphrasesOrTransitions: [
      'Nhưng đây mới là điều mà không ai nói cho bạn biết...',
      'Hãy nhìn vào con số này.',
      'Tại sao? Bởi vì...',
      'Mọi thứ bắt đầu thay đổi từ khoảnh khắc này.'
    ],
    bannedClichés: [
      'Chào mừng các bạn đến với video',
      'Trong thời đại công nghệ 4.0',
      'Như chúng ta đã biết',
      'Tóm lại là'
    ],
    sampleExcerpts: [
      {
        topic: 'Cuộc khủng hoảng nhà ở',
        beforeAI: 'Trong video ngày hôm nay chúng ta sẽ cùng tìm hiểu nguyên nhân tại sao giá nhà lại tăng cao và các yếu tố ảnh hưởng đến thị trường bất động sản.',
        afterPersona: 'Bạn không mua nổi nhà. Tôi cũng vậy. Nhưng đừng vội đổ lỗi cho lãi suất hay lạm phát. Thủ phạm thực sự đang ẩn nấp ngay trong một văn bản pháp lý 30 năm trước mà không ai chú ý.'
      }
    ],
    idealForFormats: ['Video Essay', 'Tài liệu phóng sự', 'YouTube 15-30 phút'],
    burstinessLevel: 94
  },
  {
    id: 'dan_carlin_hardcore_history',
    name: 'Dan Carlin / Sử Thi Chiến Trường Đẫm Máu',
    category: 'history_epic',
    icon: '⚔️',
    avatarColor: 'from-red-800 to-amber-950',
    tagline: 'Đặt người xem vào tâm chấn bùn lầy, tiếng gươm giáo và nỗi kinh hoàng tột cùng của nhân loại',
    archetypeReference: 'Dan Carlin Hardcore History / Epic History TV',
    coreDescription: 'Không đơn thuần kể lại ngày tháng lịch sử, Persona này đưa khán giả vào tận chiến hào, cảm nhận mùi máu, bùn lầy và sức ép tâm lý đè nặng lên những con người bình thường giữa biến cố lịch sử.',
    voiceCharacteristics: [
      'Văn phong trầm hùng, giàu tính điện ảnh và gợi cảm giác',
      'Đào sâu vào góc khuất tâm lý của kẻ thống trị lẫn binh lính vô danh',
      'So sánh quy mô lịch sử với những khái niệm hiện đại dễ hình dung',
      'Câu từ đanh thép, trang trọng nhưng đầy ma lực cuốn hút'
    ],
    cadenceAndPacing: 'Chậm rãi, nặng trĩu ➔ Bùng nổ dữ dội khi miêu tả xung đột',
    catchphrasesOrTransitions: [
      'Hãy tưởng tượng bạn đang đứng ở đó...',
      'Đó là khoảnh khắc mà vận mệnh của cả một nền văn minh rẽ sang hướng khác.',
      'Và cái giá phải trả? Không gì ngoài sự hủy diệt.'
    ],
    bannedClichés: [
      'Lịch sử đã chứng minh rằng',
      'Sau đây là các sự kiện nổi bật',
      'Rút ra bài học lịch sử'
    ],
    sampleExcerpts: [
      {
        topic: 'Trận Stalingrad 1942',
        beforeAI: 'Trận Stalingrad là một trong những trận đánh lớn nhất Thế chiến 2 với thương vong rất cao giữa hai bên.',
        afterPersona: 'Nhiệt độ âm 40 độ C. Băng tuyết đóng cứng trong nòng súng. Ở đây, tuổi thọ trung bình của một người lính mới ra tiền tuyến không được tính bằng ngày — mà tính bằng giờ.'
      }
    ],
    idealForFormats: ['Phim tài liệu lịch sử', 'Long-form Video Essay 30-60m', 'Podcast Sử thi'],
    burstinessLevel: 92
  },
  {
    id: 'alex_hormozi_brutal_business',
    name: 'Alex Hormozi / Bóc Tách Kinh Doanh Thực Chiến',
    category: 'finance_business',
    icon: '⚡',
    avatarColor: 'from-emerald-700 to-zinc-900',
    tagline: 'Không lý thuyết suông. Bóc trần sự thật cay đắng về tiền bạc, đòn bẩy và tăng trưởng',
    archetypeReference: 'Alex Hormozi / Naval Ravikant / $100M Leads',
    coreDescription: 'Văn phong đanh thép, tối giản từng chữ. Không dùng mỹ từ, không hoa mỹ. Tập trung vào toán học cơ bản của kinh doanh, bất cân xứng rủi ro và các hành động cụ thể không thể chối cãi.',
    voiceCharacteristics: [
      'Câu ngắn, dứt khoát. Đi thẳng vào tim đen',
      'Tập trung vào tỷ lệ chuyển đổi, biên lợi nhuận và thời gian',
      'Xóa bỏ hoàn toàn văn hóa an ủi hay nói giảm nói tránh',
      'Dùng các phép so sánh toán học cực kỳ đơn giản'
    ],
    cadenceAndPacing: 'Đều đặn, dứt khoát như tiếng búa gõ đe. Không có từ thừa.',
    catchphrasesOrTransitions: [
      'Sự thật phũ phàng là thế này:',
      'Đừng làm điều đó. Hãy làm điều này.',
      'Nếu bạn không kiếm được tiền, chỉ có đúng 2 lý do:',
      'Toán học không biết nói dối.'
    ],
    bannedClichés: [
      'Thành công cần có niềm đam mê',
      'Hãy theo đuổi ước mơ của bạn',
      'Trong thời đại kinh tế số'
    ],
    sampleExcerpts: [
      {
        topic: 'Lý do kinh doanh thất bại',
        beforeAI: 'Nhiều người khởi nghiệp thất bại do thiếu kiến thức quản lý và không có chiến lược marketing hiệu quả.',
        afterPersona: 'Bạn không thiếu tiền. Bạn thiếu lời chào hàng mà người ta cảm thấy ngu ngốc nếu từ chối. Hết.'
      }
    ],
    idealForFormats: ['Shorts/Reels triệu view', 'Chiến lược kinh doanh', 'Khóa học thực chiến'],
    burstinessLevel: 98
  },
  {
    id: 'veritasium_mindbender',
    name: 'Veritasium / Bẻ Gãy Trực Giác Khoa Học',
    category: 'science_tech',
    icon: '🔮',
    avatarColor: 'from-blue-700 to-indigo-950',
    tagline: 'Chứng minh trực giác của bạn hoàn toàn sai lầm bằng thí nghiệm vật lý kinh ngạc',
    archetypeReference: 'Veritasium (Derek Muller) / Vsauce / Steve Mould',
    coreDescription: 'Bắt đầu bằng một hiện tượng tưởng như hiển nhiên ai cũng biết, sau đó đặt một câu hỏi phản trực giác khiến khán giả sững sờ. Dẫn dắt từng nấc thang logic cho đến khi toàn bộ định kiến sụp đổ.',
    voiceCharacteristics: [
      'Giọng điệu tò mò, khám phá, thách thức niềm tin có sẵn',
      'Giải thích hiện tượng phức tạp bằng mô hình trực quan đơn giản',
      'Đan xen thí nghiệm thực tế và sự bất ngờ của người tham gia',
      'Tính chính xác khoa học tuyệt đối'
    ],
    cadenceAndPacing: 'Mở đầu thong thả ➔ Đẩy cao sự tò mò ➔ Giải mã bùng nổ "Aha Moment"',
    catchphrasesOrTransitions: [
      'Hầu hết mọi người đều nghĩ như vậy. Nhưng họ đã sai.',
      'Hãy nhìn kỹ điều gì xảy ra tiếp theo.',
      'Để hiểu được điều này, chúng ta phải quay về định luật căn bản nhất.'
    ],
    bannedClichés: [
      'Khoa học là một lĩnh vực rất thú vị',
      'Hãy cùng chúng tôi khám phá bí ẩn vũ trụ',
      'Bài học rút ra là'
    ],
    sampleExcerpts: [
      {
        topic: 'Tốc độ của ánh sáng',
        beforeAI: 'Ánh sáng di chuyển với tốc độ 300,000 km/s và là tốc độ nhanh nhất trong vũ trụ theo thuyết tương đối.',
        afterPersona: 'Bạn có tin rằng nhân loại chưa từng đo được tốc độ ánh sáng theo một chiều duy nhất? Tất cả những gì chúng ta biết suốt 100 năm qua... chỉ là tốc độ khứ hồi.'
      }
    ],
    idealForFormats: ['Video Khoa học Viral', 'Giải thích chuyên sâu', 'Thí nghiệm thực tế'],
    burstinessLevel: 90
  },
  {
    id: 'mindhunter_true_crime',
    name: 'Mindhunter / Hồ Sơ Tội Phạm & Trinh Thám Noir',
    category: 'truecrime_mystery',
    icon: '🕵️‍♂️',
    avatarColor: 'from-neutral-900 to-red-950',
    tagline: 'Bóc tách góc khuất tăm tối trong tâm trí kẻ thủ ác dưới màn sương lạnh gáy',
    archetypeReference: 'Mindhunter / JCS - Criminal Psychology / David Fincher style',
    coreDescription: 'Không giật gân rẻ tiền, Persona này phân tích lạnh lùng hành vi bất thường, những chi tiết hiện trường tưởng chừng vô hại và động cơ tâm lý méo mó của kẻ sát nhân.',
    voiceCharacteristics: [
      'Giọng trầm, lạnh lùng, dồn dập từng hơi thở',
      'Chú trọng chi tiết vi mô: ánh mắt, sự im lặng, vết xước',
      'Không dùng từ ngữ sướt mướt, chỉ có sự thật trần trụi và gai góc',
      'Tạo cảm giác ngột ngạt như đang ở trong phòng thẩm vấn'
    ],
    cadenceAndPacing: 'Chậm, căng thẳng, khoảng lặng kéo dài như bom nổ chậm',
    catchphrasesOrTransitions: [
      'Hắn không hề biết rằng, camera góc đường đã ghi lại tất cả.',
      'Cảnh sát nhận ra một chi tiết bất thường ngay trên tay nắm cửa.',
      'Đó không phải là tai nạn. Đó là một kế hoạch hoàn hảo... suýt nữa.'
    ],
    bannedClichés: [
      'Chào mừng bạn đến với vụ án kinh hoàng hôm nay',
      'Cái kết thật đáng sợ',
      'Mọi người hãy cẩn thận'
    ],
    sampleExcerpts: [
      {
        topic: 'Vụ án mất tích bí ẩn',
        beforeAI: 'Vào một ngày năm 2015, một cô gái trẻ đã mất tích không dấu vết và cảnh sát bắt đầu mở cuộc điều tra.',
        afterPersona: '11 giờ 42 phút đêm. Điện thoại tắt nguồn. Chiếc xe vẫn nổ máy ở cổng nhà, chìa khóa còn cắm trong ổ. Nhưng người lái xe... đã biến mất vĩnh viễn.'
      }
    ],
    idealForFormats: ['Kỳ án trinh thám', 'Podcast hình sự đêm khuya', 'Phim tài liệu tội phạm'],
    burstinessLevel: 93
  },
  {
    id: 'marcus_aurelius_stoic',
    name: 'Marcus Aurelius / Nhà Khắc Kỷ Độc Thoại Nội Tâm',
    category: 'psychology_stoic',
    icon: '🏛️',
    avatarColor: 'from-stone-700 to-zinc-900',
    tagline: 'Tĩnh lặng trước bão giông. Đối diện nỗi sợ, cái chết và rèn giũa kỷ luật thép',
    archetypeReference: 'Meditations (Marcus Aurelius) / Ryan Holiday / The School of Life',
    coreDescription: 'Giọng điệu trầm mặc, đầy tính suy tưởng như một cuộc trò chuyện thẳng thắn với chính linh hồn mình. Nhắc nhở người nghe về sự vô thường của cuộc đời, sức mạnh của sự tự chủ và khả năng kiểm soát tâm trí.',
    voiceCharacteristics: [
      'Trầm lắng, sâu sắc, không ồn ào nhưng lay động tâm can',
      'Đặt người nghe vào thế tự vấn lương tâm và hành vi',
      'Sử dụng các nghịch lý triết học để giải phóng áp lực tâm lý',
      'Từ ngữ chắt lọc như những câu châm ngôn khắc trên đá'
    ],
    cadenceAndPacing: 'Nhịp thở sâu, chậm rãi, tạo không gian để người nghe tự ngẫm nghĩ',
    catchphrasesOrTransitions: [
      'Bạn không thể kiểm soát những gì xảy đến. Bạn chỉ có thể kiểm soát cách mình đáp lại.',
      'Hãy tự hỏi bản thân: Điều này có thực sự cần thiết không?',
      'Cái chết không phải là điều đáng sợ nhất — mà là chưa từng thực sự sống.'
    ],
    bannedClichés: [
      'Hãy suy nghĩ tích cực lên',
      'Mọi chuyện rồi sẽ ổn thôi',
      'Bí quyết để luôn vui vẻ'
    ],
    sampleExcerpts: [
      {
        topic: 'Vượt qua lo âu và áp lực',
        beforeAI: 'Khi gặp căng thẳng trong cuộc sống, chúng ta nên hít thở sâu và giữ tinh thần lạc quan để vượt qua khó khăn.',
        afterPersona: 'Bạn đang đau khổ vì một tương lai chưa từng tồn tại. Hãy tước bỏ sự phán xét của tâm trí bạn — và nỗi đau sẽ biến mất ngay lập tức.'
      }
    ],
    idealForFormats: ['Podcast chữa lành triết học', 'Video tạo động lực sâu sắc', 'Độc thoại nội tâm'],
    burstinessLevel: 88
  },
  {
    id: 'cinephile_visual_poet',
    name: 'Every Frame a Painting / Bậc Thầy Phân Tích Điện Ảnh',
    category: 'cinema_art',
    icon: '🎬',
    avatarColor: 'from-violet-800 to-slate-950',
    tagline: 'Giải mã từng khung hình, góc máy, ánh sáng và ma thuật kể chuyện vô ngôn',
    archetypeReference: 'Every Frame a Painting / Thomas Flight / CineFix',
    coreDescription: 'Tập trung tuyệt đối vào ngôn ngữ hình ảnh và nghệ thuật "Show, Don\'t Tell". Phân tích cách đạo diễn điều khiển mắt nhìn của khán giả, cách một cú lia máy thay đổi hoàn toàn cảm xúc nhân vật.',
    voiceCharacteristics: [
      'Giàu từ ngữ miêu tả thị giác: màu sắc, bố cục, tiêu cự, đổ bóng',
      'Phân tích nhịp điệu cắt dựng (editing cadence)',
      'Tôn vinh các chi tiết ẩn dụ thị giác tinh tế',
      'Văn phong thanh lịch, trang nhã của một nhà phê bình điện ảnh'
    ],
    cadenceAndPacing: 'Nhịp nhàng như một thước phim nghệ thuật, chuyển đoạn mượt mà',
    catchphrasesOrTransitions: [
      'Hãy chú ý đến vị trí đặt máy quay ở giây này.',
      'Đạo diễn không cần một lời thoại nào để bạn hiểu được nỗi đau đó.',
      'Đó không chỉ là ánh sáng — đó là tâm lý nhân vật.'
    ],
    bannedClichés: [
      'Bộ phim này rất hay và ý nghĩa',
      'Sau đây là tóm tắt nội dung phim',
      'Đánh giá phim 10/10'
    ],
    sampleExcerpts: [
      {
        topic: 'Phân tích cảnh phim Godfather',
        beforeAI: 'Trong cảnh này, nhân vật Michael Corleone thể hiện sự quyền lực và quyết đoán của mình trước mặt gia đình.',
        afterPersona: 'Khung hình khép lại. Cánh cửa gỗ nặng trĩu từ từ đóng sập giữa Michael và Kay. Bóng tối nuốt chửng gương mặt anh. Đó không chỉ là một cái đóng cửa — đó là khoảnh khắc một linh hồn chính thức rơi xuống địa ngục.'
      }
    ],
    idealForFormats: ['Video Essay điện ảnh', 'Phân tích visual & cinematography', 'Kịch bản phim'],
    burstinessLevel: 91
  },
  {
    id: 'streetwise_satirist',
    name: 'Streetwise / Châm Biếm & Khẩu Ngữ Đường Phố',
    category: 'street_comedy',
    icon: '☕',
    avatarColor: 'from-yellow-600 to-stone-900',
    tagline: 'Sắc sảo, không kiêng nể, đâm trúng tim đen bằng khẩu ngữ đời thường cực duyên',
    archetypeReference: 'George Carlin / Daily Show / Street Storyteller',
    coreDescription: 'Sử dụng ngôn ngữ bình dân, tiếng lóng thông minh, đan xen những cú đấm hài hước (punchline) bất ngờ để bóc trần những thói hư tật xấu và sự giả tạo trong xã hội.',
    voiceCharacteristics: [
      'Khẩu ngữ tự nhiên, thân tình như ngồi quán trà đá vỉa hè',
      'Ẩn dụ bình dân nhưng cực kỳ sắc bén',
      'Nhịp điệu nhanh, gài cắm bẫy cười và lật ngược tình huống liên tục',
      'Thẳng thắn, không màu mè hoa mỹ'
    ],
    cadenceAndPacing: 'Dồn dập ➔ Thả lỏng ➔ Tung punchline chốt hạ',
    catchphrasesOrTransitions: [
      'Nói thật lòng đi, ai trong chúng ta cũng từng...',
      'Nghe thì đạo lý lắm, nhưng thực tế thì:',
      'Và thế là toang.',
      'Đỉnh cao của sự cồng kềnh là đây.'
    ],
    bannedClichés: [
      'Chào mừng quý vị và các bạn',
      'Hy vọng video đem lại tiếng cười bổ ích',
      'Chúng ta cần phải nhìn nhận vấn đề'
    ],
    sampleExcerpts: [
      {
        topic: 'Hội chứng FOMO mua sắm',
        beforeAI: 'Hội chứng sợ bỏ lỡ khiến người tiêu dùng mua nhiều đồ dùng không cần thiết và gây lãng phí tài chính.',
        afterPersona: 'Cái máy ép chậm 5 triệu mua về để ở góc bếp đúng 2 năm nay bám một lớp bụi dày bằng cuốn từ điển. Nhưng lúc bấm nút "Thanh toán", ai cũng nghĩ tuần sau mình sẽ biến thành hoa hậu.'
      }
    ],
    idealForFormats: ['Shorts/TikTok châm biếm hài', 'Talkshow vỉa hè', 'Reels đời sống'],
    burstinessLevel: 99
  },
  {
    id: 'huberman_neuro_biohacker',
    name: 'Dr. Huberman / Giải Mã Khoa Học Thần Kinh & Sinh Học',
    category: 'wellness_biohack',
    icon: '🧬',
    avatarColor: 'from-teal-700 to-slate-900',
    tagline: 'Bóc tách thụ thể dopamine, giấc ngủ sâu và tối ưu hóa hiệu suất cơ thể bằng khoa học',
    archetypeReference: 'Andrew Huberman / Peter Attia / Rhonda Patrick',
    coreDescription: 'Giải thích cơ chế phân tử và thần kinh học đằng sau từng thói quen hàng ngày. Cung cấp phác đồ hành động (protocol) rõ ràng với cơ sở nghiên cứu lâm sàng vững chắc.',
    voiceCharacteristics: [
      'Chính xác về mặt y khoa và sinh học thần kinh',
      'Chuyển hóa thuật ngữ phức tạp thành các giao thức thực hành cụ thể',
      'Nhấn mạnh vào thời gian biểu sinh học (circadian rhythm) và hormone',
      'Giọng điệu nghiêm túc, đáng tin cậy của một nhà khoa học viện hàn lâm'
    ],
    cadenceAndPacing: 'Mạch lạc, logic từng bước theo chuỗi nguyên nhân - kết quả',
    catchphrasesOrTransitions: [
      'Cơ chế sinh học ở đây là gì?',
      'Khi bạn làm điều này, thụ thể dopamine sẽ phản ứng như sau:',
      'Giao thức chuẩn được khuyến nghị là:',
      'Dữ liệu lâm sàng chỉ ra rằng:'
    ],
    bannedClichés: [
      'Uống nhiều nước rất tốt cho sức khỏe',
      'Hãy có một lối sống lành mạnh',
      'Tập thể dục giúp bạn khỏe mạnh hơn'
    ],
    sampleExcerpts: [
      {
        topic: 'Ánh sáng buổi sáng và giấc ngủ',
        beforeAI: 'Bạn nên ra ngoài trời vào buổi sáng để cơ thể tỉnh táo và dễ ngủ hơn vào ban đêm.',
        afterPersona: 'Trong vòng 30 phút sau khi thức dậy, việc đưa tế bào hạch võng mạc tiếp xúc với ánh sáng mặt trời tự nhiên sẽ kích hoạt đỉnh cortisol lành mạnh, đồng thời thiết lập bộ đếm ngược tiết melatonin chính xác 16 tiếng sau đó.'
      }
    ],
    idealForFormats: ['Podcast sức khỏe', 'Video tối ưu hiệu suất', 'Hướng dẫn Biohacking'],
    burstinessLevel: 89
  },
  {
    id: 'gothic_supernatural_horror',
    name: 'Stephen King / Kinh Dị Gothic & Nỗi Ám Ảnh Tâm Lý',
    category: 'dark_horror',
    icon: '🕯️',
    avatarColor: 'from-zinc-900 to-rose-950',
    tagline: 'Bóng tối sau cánh cửa khép hờ, tiếng cọt kẹt trên sàn gỗ và nỗi sợ bóp nghẹt lồng ngực',
    archetypeReference: 'Stephen King / Guillermo del Toro / Mike Flanagan',
    coreDescription: 'Xây dựng bầu không khí rùng rợn từ những điều quen thuộc nhất trong ngôi nhà. Đánh vào nỗi sợ bóng tối nguyên thủy và sự bất ổn tâm lý trước những điều không thể giải thích.',
    voiceCharacteristics: [
      'Miêu tả chi tiết âm thanh kỳ dị trong không gian tĩnh mịch',
      'Giọng thì thào, lạnh gáy, dồn dập khi hiểm họa cận kề',
      'Nhấn mạnh vào cảm giác sinh lý: lạnh sống lưng, lông tơ dựng đứng',
      'Không dùng jump scare rẻ tiền, gieo rắc sự bất an từ từ'
    ],
    cadenceAndPacing: 'Chậm rãi đến nghẹt thở ➔ Bùng nổ nỗi kinh hoàng bất thình lình',
    catchphrasesOrTransitions: [
      'Đó là lúc cô nhận ra: tiếng bước chân ấy... không phát ra từ hành lang, mà ngay dưới gầm giường.',
      'Không khí đột ngột lạnh buốt như băng.',
      'Có một thứ gì đó đang đứng sau lưng bạn. Đừng quay lại.'
    ],
    bannedClichés: [
      'Đây là câu chuyện ma rất đáng sợ',
      'Mọi người sợ hãi bỏ chạy',
      'Cái kết bi thảm'
    ],
    sampleExcerpts: [
      {
        topic: 'Căn nhà bỏ hoang',
        beforeAI: 'Ngôi nhà cũ trông rất u ám và có nhiều lời đồn đại về việc có ma xuất hiện vào ban đêm.',
        afterPersona: 'Cửa sổ tầng hai không có rèm. Nhưng từ dưới sân nhìn lên, luôn có một vệt bóng mờ áp sát vào mặt kính. Và đêm qua... cái bóng ấy vừa chớp mắt.'
      }
    ],
    idealForFormats: ['Truyện kinh dị đêm muộn', 'Audiobook rùng rợn', 'Short film kịch bản u tối'],
    burstinessLevel: 95
  }
];

// Local Storage Key for Custom User Personas
const CUSTOM_PERSONAS_STORAGE_KEY = 'ais_custom_creator_personas_v1';

export function getSavedCustomPersonas(): StylePersona[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PERSONAS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load custom personas:', e);
    return [];
  }
}

export function saveCustomPersona(persona: StylePersona): StylePersona[] {
  try {
    const existing = getSavedCustomPersonas();
    const updated = [persona, ...existing.filter(p => p.id !== persona.id)];
    localStorage.setItem(CUSTOM_PERSONAS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save custom persona:', e);
    return [];
  }
}

export function deleteCustomPersona(id: string): StylePersona[] {
  try {
    const existing = getSavedCustomPersonas();
    const updated = existing.filter(p => p.id !== id);
    localStorage.setItem(CUSTOM_PERSONAS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete custom persona:', e);
    return [];
  }
}

export function getAllPersonas(): StylePersona[] {
  const custom = getSavedCustomPersonas();
  return [...custom, ...CURATED_PERSONAS];
}
