/*
 * KARYLGRAM CONTENT / ASSET REGISTRY
 * -------------------------------------------------------------
 * 이미지 파일은 제공될 때까지 모두 null입니다. 아래 예시 경로에
 * 파일을 GitHub 저장소에 업로드한 후, null을 경로 문자열로 바꾸세요.
 * 예: feedImage: 'assets/characters/sl00z/feed.jpg'
 * 음악은 저장소 music/ 디렉터리의 실재 MP3 파일명과 일치합니다.
 * 발매연도·수록앨범·가사는 검증된 정보가 없어 편집용 자리표시자로 둡니다.
 * -------------------------------------------------------------
 */
window.KHIPHOP_DATA = {
  event: {
    name: 'K-TRACE 2027', date: '2027.10.20',
    instagram: 'ktrace_official',
    posterImage: 'assets/karylgram/ktrace-poster.png', // K-TRACE 2027 메인 피드 이미지
    secretImage: 'assets/karylgram/secret-user-poster.png', // SECRET 피드 이미지
  },
  artists: [
    {
      id: 'sl00z', name: 'SL00Z', korean: '슬로즈', handle: 'sn00zesl00z',
      label: 'NARROWROOM RECORDS', genre: 'INDUSTRIAL / ALTERNATIVE',
      tagline: '인더스트리계 부뚜막 위의 얌전한 고양이', tone: '#a2a8b2', ink: '#24252e',
      stories: 2,
      feedImage: 'assets/karylgram/sl00z-poster.png', // Karylgram 라인업 공연 이미지
      avatarImage: 'assets/karylgram/profile/sl00z-profile-picture.png', // Karylgram story avatar
      artistImage: null, // 'assets/characters/sl00z/artist.jpg' (인스타 프사와 다름)
      storyImages: [], // 'assets/stories/sl00z/01.jpg', 'assets/stories/sl00z/02.jpg'
      tracks: [
        { title: 'STATIC IN THE JAW', file: 'music/SL00Z/STATIC IN THE JAW - SL00Z.mp3' },
        { title: '배기', file: 'music/SL00Z/배기 - SL00Z.mp3' },
        { title: '잠수', file: 'music/SL00Z/잠수 - SL00Z.mp3' }
      ],
      similar: [{ name: 'Lil Cherry', url: 'https://youtube.com/@lilcherrybigcherry' }, { name: 'soguum', url: 'https://youtube.com/playlist?list=PLeb2Hd9bOARTyBsQs-0AqCt5VOwarnNmC&si=g3TrJNNNcmpTL3N2' }]
    },
    {
      id: 'kayo', name: 'KAY KAYO', korean: '케이카요', handle: 'afrokkayo',
      label: 'KAYO WORKS', genre: 'AFRO-FUSION / DANCEHALL',
      tagline: '모두를 움직이게 만드는 아프로비트 최강자', tone: '#cc8b41', ink: '#573b24',
      stories: 1,
      feedImage: 'assets/karylgram/kaykayo-poster.png', // Karylgram 라인업 공연 이미지
      avatarImage: 'assets/karylgram/profile/kaykayo-profile-picture.png', // Karylgram story avatar
      artistImage: null, // 'assets/characters/kayo/artist.jpg'
      storyImages: [],
      tracks: [
        { title: 'DELLY', file: 'music/KAY KAYO/DELLY - KAY KAYO.mp3' },
        { title: 'ODOGWU', file: 'music/KAY KAYO/ODOGWU - KAY KAYO.mp3' },
        { title: 'Viper', file: 'music/KAY KAYO/Viper - KAY KAYO.mp3' }
      ],
      similar: [{ name: 'PENOMECO', url: 'https://www.youtube.com/@PENOMECO' }, { name: 'Burna Boy', url: 'https://www.youtube.com/@BurnaBoy' }]
    },
    {
      id: 'jaeone', name: 'JAE-ONE', korean: '재원', handle: 'groundwork_onejae',
      label: 'GROUNDWORK', genre: 'BOOM BAP / JAZZ RAP',
      tagline: '시간이 증명한 마이크의 무게.', tone: '#708078', ink: '#303b36',
      stories: 2,
      feedImage: 'assets/karylgram/jae-one-poster.png', // Karylgram 라인업 공연 이미지
      avatarImage: 'assets/karylgram/profile/jae-one-profile-picture.png', // Karylgram story avatar
      artistImage: null, // 'assets/characters/jaeone/artist.jpg'
      storyImages: [],
      tracks: [
        { title: '27신촌', file: 'music/JAE-ONE/27신촌 - JAE-ONE.mp3' },
        { title: 'BOSS THANG', file: 'music/JAE-ONE/BOSS THANG - JAE-ONE.mp3' },
        { title: 'FOUNDATION', file: 'music/JAE-ONE/FOUNDATION - JAE-ONE.mp3' }
      ],
      similar: [{ name: 'E SENS', url: 'https://www.youtube.com/@esensofficial0209' }, { name: 'Paloalto', url: 'https://www.youtube.com/@paloaltongue' }]
    },
    {
      id: 'janedoe', name: 'Jane Doe', korean: '제인 도', handle: 'notjanedoe',
      label: 'GROUNDWORK', genre: 'RAGE / HARDCORE TRAP',
      tagline: '비프만큼이나 비트도 Clean and 깔끔', tone: '#8b3d47', ink: '#2b1821',
      stories: 9,
      feedImage: 'assets/karylgram/janedoe_poster.png', // Karylgram 라인업 공연 이미지
      avatarImage: 'assets/karylgram/profile/janedoe-profile-picture.png', // Karylgram story avatar
      artistImage: null, // 'assets/characters/janedoe/artist.jpg'
      storyImages: [],
      tracks: [
        { title: 'FUCK UR CO-SIGN', file: 'music/Jane Doe/FUCK UR CO-SIGN - Jane Doe.mp3', explicit: true },
        { title: '개싸움 (Gasoline)', file: 'music/Jane Doe/개싸움 (Gasoline) - Jane Doe.mp3', explicit: true },
        { title: '먹이사슬', file: 'music/Jane Doe/먹이사슬 - Jane Doe.mp3', explicit: true }
      ],
      similar: [{ name: 'JUSTHIS', url: 'https://www.youtube.com/@THISISJUSTHIS' }, { name: 'NO:EL', url: 'https://www.youtube.com/@noel_officialchannel' }]
    },
    {
      id: 'soda', name: 'Lil Soda', korean: '릴 소다', handle: 'tabaccosuitai',
      label: 'NARROWROOM RECORDS', genre: 'EMO RAP / SHOEGAZE TRAP',
      tagline: '국힙 EMO 숭배자들의 종착지', tone: '#d56594', ink: '#49263d',
      stories: 5,
      feedImage: 'assets/karylgram/lilsoda_poster.png', // Karylgram 라인업 공연 이미지
      avatarImage: 'assets/karylgram/profile/lilsoda-profile-picture.png', // Karylgram story avatar
      artistImage: null, // 'assets/characters/soda/artist.jpg'
      storyImages: [],
      tracks: [
        { title: '수면제', file: 'music/Lil Soda/수면제 - Lil Soda.mp3' },
        { title: '푸른봄은썩었어', file: 'music/Lil Soda/푸른봄은썩었어 - Lil Soda.mp3' },
        { title: '새까만계이름', file: 'music/Lil Soda/새까만계이름 - Lil Soda.mp3', explicit: true }
      ],
      similar: [{ name: 'YANGHONGONE', url: 'https://www.youtube.com/channel/UCO4p2LbFEEF1HKm4HnUVjfg' }, { name: 'Scails', url: 'https://www.youtube.com/@xscails' }]
    },
    {
      id: 'nafi', name: 'NAFI', korean: '나피', handle: 'shinnafi',
      label: 'LAYER NINE ENTERTAINMENT / NAFI OFFICE', genre: 'ALTERNATIVE R&B / POP RAP',
      tagline: 'NAFI로도, 나희로도 빛나는 얼굴', tone: '#b09c88', ink: '#55483d',
      stories: 3,
      feedImage: 'assets/karylgram/nafi-poster.png', // Karylgram 라인업 공연 이미지
      avatarImage: 'assets/karylgram/profile/nafi-profile-picture.png', // Karylgram story avatar
      artistImage: null, // 'assets/characters/nafi/artist.jpg'
      storyImages: [],
      tracks: [
        { title: 'I am Technology', file: 'music/NAFI/I am Technology - NAFI.mp3' },
        { title: 'Silk Guillotine', file: 'music/NAFI/Silk Guillotine - NAFI.mp3' },
        { title: 'PANDUN (판돈)', file: 'music/NAFI/PANDUN (판돈) - NAFI.mp3' }
      ],
      similar: [{ name: 'BIBI', url: 'https://www.youtube.com/@naked_BIBI' }, { name: 'DEAN', url: 'https://www.youtube.com/@DEANTRBL' }]
    },
    {
      id: 'error', name: 'Young ERROR', korean: '영에러', handle: 'youngcitybanger',
      label: 'FILEBREEDS', genre: 'DIGICORE / NEO-RAGE',
      tagline: '뭘 고쳐 그냥 좋은데 ㅋㅋ Yarr', tone: '#809abd', ink: '#212e40',
      stories: 0,
      feedImage: 'assets/karylgram/youngerror-poster.png', // Karylgram 라인업 공연 이미지
      avatarImage: 'assets/karylgram/profile/youngerror-profile-picture.png', // Karylgram story avatar
      artistImage: null, // 'assets/characters/error/artist.jpg'
      storyImages: [],
      tracks: [
        { title: '404 BRAT', file: 'music/Young ERROR/404 BRAT - Young ERROR.mp3' },
        { title: 'Cred Pass!', file: 'music/Young ERROR/Cred Pass! - Young ERROR.mp3' },
        { title: 'FACE ID', file: 'music/Young ERROR/FACE ID - Young ERROR.mp3' }
      ],
      similar: [{ name: 'NOWIMYOUNG', url: 'https://www.youtube.com/@nowimyoung' }, { name: 'Effie', url: 'https://www.youtube.com/@effi3e' }]
    }
  ]
};

/*
 * 곡별 선택 입력 필드 예시:
 *   album: '실제 앨범명', year: '2027', explicit: true,
 *   cover: 'assets/covers/sl00z/01.jpg',
 *   lyrics: [{ time: 0, text: '첫 줄' }, { time: 12.5, text: '다음 줄' }]
 * 실제 가사를 입력하지 않는 한 가사 화면은 아름다운 플레이스홀더를 표시합니다.
 */
