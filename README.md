# Karylgram · K-TRACE 2027

모바일(iPhone·Galaxy) 우선의 **정적 HTML/CSS/JavaScript** 체험형 웹사이트입니다. 별도 빌드·서버·API 없이 GitHub Pages에서 동작합니다. 음악 저작물과 이미지의 사용 권리는 업로드한 파일을 기준으로 확인해 주세요.

## 시작하기

이 폴더의 파일 **`index.html`, `styles.css`, `data.js`, `app.js`, `.nojekyll`**을 [yermigionic-web/k-hiphop](https://github.com/yermigionic-web/k-hiphop) 저장소 **최상위 경로**에 업로드하세요. 저장소에 이미 존재하는 `assets/logo/` 및 `music/`은 그대로 보존하세요.

GitHub 저장소 **Settings → Pages → Build and deployment → Deploy from a branch → main / (root) → Save**로 설정하면 일반적으로 `https://yermigionic-web.github.io/k-hiphop/`에서 열 수 있습니다. Pages 공개 상태는 저장소 설정에서 확인해야 합니다.

로컬 확인은 파일을 더블클릭하는 대신 정적 HTTP 서버를 권장합니다.

```bash
python -m http.server 8000
# http://localhost:8000/
```

## 화면 구조

- `#/` : 메인 로고 + 인스타그램 풍 외계인 시작 버튼
- `#/karylgram` : 9장 K-TRACE 피드, 터치/드래그/키보드 방향키, 7개 아티스트 링크, 소개글, 인스타 스토리
- `#/artist/sl00z` 등 : 7명의 아티스트 소개, 노래 3칸, 플레이어 및 가사 뷰, 유사한 아티스트
- 오디오: 사이트 전체에서 **단일 `<audio>` 요소**를 사용합니다. 새 곡을 누르면 이전 곡을 멈추고 교체합니다.

## 나중에 이미지 넣는 방법

현재 ZIP에는 **이미지 파일이 전혀 없습니다.** `data.js`의 `null`을 실제로 GitHub에 올린 이미지의 상대 경로 문자열로 바꾸세요. 파일명은 예시일 뿐이며 편한 이름으로 바꿔도 됩니다.

| 이미지 | 예시 경로 | 바꿀 변수 |
|---|---|---|
| 2027 K-TRACE 메인 포스터 | `assets/ktrace/ktrace-2027-poster.jpg` | `event.posterImage` |
| SECRET 피드 | `assets/ktrace/secret.jpg` | `event.secretImage` |
| 인스타 피드의 아티스트 한 장 | `assets/characters/sl00z/feed.jpg` | `artists[].feedImage` |
| 인스타 스토리 **원형 프사** | `assets/characters/sl00z/avatar.jpg` | `artists[].avatarImage` |
| Apple Music풍 **별도 아티스트 프로필 촬영 이미지** | `assets/characters/sl00z/artist.jpg` | `artists[].artistImage` |
| 개별 스토리 | `assets/stories/sl00z/01.jpg` | `artists[].storyImages` 배열 |
| 노래 커버 | `assets/covers/sl00z/01.jpg` | `artists[].tracks[].cover` |

SL00Z 대신 `kayo`, `jaeone`, `janedoe`, `soda`, `nafi`, `error`로 사용하세요. **시작 화면 메인 로고**는 이미 저장소에 존재하는 `assets/logo/k-hiphop_main_logo.png`를 참조하므로 교체할 필요가 없습니다. 해당 파일이 없으면 임시 글자 로고가 대신 표시됩니다.

**중요:** 앨범 커버 이미지는 각 곡마다 `cover` 속성을 추가해야 나타납니다. 인스타 프로필과 음악 프로필 이미지는 독립적으로 관리됩니다. 영에러의 스토리는 0개로 설정되어 스토리 링이 없습니다. 스토리 건수는 SL00Z 2, KAY KAYO 1, JAE-ONE 2, Jane Doe 9, Lil Soda 5, NAFI 3개입니다.

## 노래 3곡 및 가사

현재 저장소 실재 MP3를 참고해 `data.js`의 트랙에 정확한 파일 경로를 넣었습니다. KAY KAYO·Lil Soda·NAFI는 각각 **2개만 존재**하므로 세 번째 트랙은 재생 불가 `COMING SOON`으로 표시됩니다. 새 MP3를 `music/`에 업로드하고 해당 트랙의 `title`, `file`을 수정하면 재생됩니다.

`album`, `year`, `explicit`, `cover`도 곡마다 추가할 수 있습니다. 임의로 발매 정보나 가사를 창작하지 않았으므로 현재는 편집용 자리표시자입니다.

```js
{
  title: '곡 제목',
  file: 'music/ARTIST/filename.mp3',
  album: '앨범 이름',
  year: '2027',
  explicit: true,          // 아니면 false
  cover: 'assets/covers/artist/track.jpg',
  lyrics: [
    { time: 0.0, text: '가사 첫 줄' },
    { time: 12.5, text: '가사 다음 줄' },
  ],
}
```

가사 시간(`time`, 초 단위)을 지정하면 해당 재생 구간에 맞춰 하이라이트됩니다. 가사를 등록하지 않아도 전체 화면 가사 뷰 자체는 열립니다. 공개하려는 가사의 사용 권리를 확인하세요.

## 유사 아티스트 링크

`similar: ['...', '...']`에 들어간 이름은 현재 **YouTube 검색 결과**로 이동하도록 구현했습니다. 특정 뮤지션의 공식 채널 주소가 정해졌다면 `app.js`의 `similar` 링크 부분을 그 주소로 변경하세요. 확인되지 않은 공식 채널 URL을 추측해 넣지 않았습니다.

## 편집 및 주의

- 사이트는 **기기 프레임이 없으며** 520px 이내 읽기 폭으로 데스크톱 화면에도 대응합니다.
- 피드와 스토리는 실제 Instagram이 아닌 **Karylgram 팬 컨셉**입니다. 음악 페이지도 Apple Music과 유사한 분위기의 자체 UI입니다.
- UI 스타일은 `styles.css`, 데이터와 이미지 경로는 `data.js`, 터치·오디오·화면 전환은 `app.js`에서 바꾸세요.
- `assets` 폴더와 `music` 폴더는 변경하거나 삭제하지 마세요.
- 외부 폰트가 차단되면 기본 한글/영문 폰트로 자동 대체됩니다.
