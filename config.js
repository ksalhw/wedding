/**
 * Modern Minimal Wedding Invitation Configuration
 *
 * Edit the values below to customize your wedding invitation.
 * Image files should be placed in the corresponding images/ subfolders
 * using sequential filenames (1.jpg, 2.jpg, ...).
 * The code auto-detects images by trying sequential filenames.
 *
 * Image folder conventions:
 * images/hero/1.jpg       - Main wedding photo (single file)
 * images/story/1.jpg, ... - Story section photos (auto-detected)
 * images/gallery/1.jpg, . - Gallery photos (auto-detected)
 * images/location/1.jpg   - Venue/map image (single file)
 * images/og/1.jpg         - Kakao share thumbnail (single file)
 */

const CONFIG = {
  // ── 초대장 열기 ──
  useCurtain: false,  // 초대장 열기 화면 사용 여부 (true: 사용, false: 바로 본문 표시)

  // ── 메인 (히어로) ──
  groom: {
    name: "이현우",
    nameEn: "HYUNWOO",
    father: "이종성",
    mother: "김현숙",
    fatherDeceased: false,
    motherDeceased: false
  },

  bride: {
    name: "강신애",
    nameEn: "SINAE",
    father: "강주봉",
    mother: "이상은",
    fatherDeceased: false,
    motherDeceased: false
  },

  wedding: {
    date: "2026-08-08",
    time: "14:30",
    venue: "한국기독교연합회관 연합웨딩홀",
    hall: "3층 아가페홀",
    address: "서울특별시 종로구 김상옥로 30",
    tel: "02-708-4040",
    mapLinks: {
      kakao: "https://kko.to/rZxgL6DasI",
      naver: "https://naver.me/FzSifb7D"
    }
  },

  // ── 인사말 ──
  invitation: {
    title: "소중한 분들을 초대합니다",
    message: "그런즉 이제 둘이 아니요 한 몸이니\n그러므로 하나님이 짝지어 주신 것을 \n사람이 나누지 못할지니라 하시니라.\n마태복음 19:6"
  },

  // ── 우리의 이야기 ──
  story: {
    title: "우리의 이야기",
    content: "하나님의 은혜 가운데 두 사람이 한 가정을 이루게 되었습니다.\n서로에게 가장 귀한 돕는 배필이 되어 사랑하며 살아가겠습니다.\n귀한 걸음으로 오셔서 축복해 주시면 감사하겠습니다."
  },

  // ── 오시는 길 ──
  // (mapLinks는 wedding 객체 내에 포함)


  // ──  연락처 ──
  contacts: {
    groom: [
      
      { role: "아버지", name: "이종성", tel: "010-0000-0000" },
      { role: "어머니", name: "김현숙", tel: "010-0000-0000" },
      { role: "신랑", name: "이현우", tel: "010-0000-0000" }
    ],
    bride: [
      { role: "아버지", name: "강주봉", tel: "010-0000-0000" },
      { role: "어머니", name: "이상은", tel: "010-0000-0000" },
      { role: "신부", name: "강신애", tel: "010-0000-0000" }
    ]
  },


  // ── 마음 전하실 곳 ──
  accounts: {
    groom: [
      { role: "아버지", name: "이종성", bank: "OO은행", number: "000-000-000000" },
      { role: "어머니", name: "김현숙", bank: "OO은행", number: "000-000-000000" },
      { role: "신랑", name: "이현우", bank: "OO은행", number: "000-000-000000" }
    ],
    bride: [
      { role: "아버지", name: "강주봉", bank: "OO은행", number: "000-000-000000" },
      { role: "어머니", name: "이상은", bank: "OO은행", number: "000-000-000000" },
      { role: "신부", name: "강신애", bank: "OO은행", number: "000-000-000000" }
    ]
  },

  // ── 링크 공유 시 나타나는 문구 ──
  kakaoShare: {
    jsKey: "",
    title: "결혼식에 초대합니다",
    description: ""
  }
};
