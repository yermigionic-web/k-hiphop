/* Karylgram — plain HTML/CSS/JS, no build tools or back-end required.
 * GitHub Pages friendly. All site data lives in data.js.
 * Photo placeholders intentionally use CSS/SVG; no artwork is bundled.
 */
(() => {
  'use strict';
  const DATA = window.KHIPHOP_DATA;
  const app = document.querySelector('#app');
  const playerRoot = document.createElement('div');
  playerRoot.id = 'player-root';
  playerRoot.className = 'player-root';
  document.body.appendChild(playerRoot);
  const overlayRoot = document.createElement('div');
  overlayRoot.id = 'overlay-root';
  document.body.appendChild(overlayRoot);
  const audio = document.querySelector('#shared-audio'); // ONE audio element throughout app
  const artists = DATA.artists;
  const getArtist = id => artists.find(a => a.id === id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cssColor = a => `--tone:${a.tone};--inkcolor:${a.ink};`;
  const moneyTime = n => Number.isFinite(n) ? `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2,'0')}` : '0:00';
  const img = (src, alt, eager = false) => src ? `<img src="${esc(encodeURI(src))}" alt="${esc(alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" />` : '';
  const imageLayer = (src, alt, eager = false) => `<div class="visual-asset">${img(src, alt, eager)}</div>`;
  const links = a => `#/artist/${a.id}`;
  const iconPaths = {
    heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    share:'<path d="m21 3-9 9"/><path d="M21 3 15 21l-4-8-8-4Z"/>',
    save:'<path d="M5 3.5h14v18l-7-5-7 5Z"/>',
    dots:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    chevronLeft:'<path d="m15 18-6-6 6-6"/>', chevronRight:'<path d="m9 18 6-6-6-6"/>',
    close:'<path d="m18 6-12 12M6 6l12 12"/>',
    play:'<path d="m8 5 11 7-11 7Z"/>', pause:'<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
    skip:'<path d="m5 4 10 8-10 8Z"/><path d="M19 5v14"/>', back:'<path d="m19 12-11 0M13 7l-5 5 5 5"/>',
    music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    add:'<path d="M12 5v14m-7-7h14"/>', at:'<circle cx="12" cy="12" r="4"/><path d="M16 8v4c0 2 3 2 3 0a7 7 0 1 0-3 6"/>',
    verified:'<path d="m9 12 2 2 4-4"/><path d="M12 2l2.2 2 3-.1.8 2.8 2.5 1.6-.8 3 1 3-2.8 1.4-.8 2.8-3-.1-2.1 2-2.2-2-3 .1-.8-2.8-2.5-1.6.8-3-1-3L6 6.8l.8-2.8 3 .1Z"/>',
    volume:'<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12"/>',
    arrowUpRight:'<path d="M7 17 17 7M8 7h9v9"/>',
    alien:'<path d="M12 3C6.8 3 3.7 7.3 4.3 12.3c.7 5.4 5.6 9 7.7 9s7-3.6 7.7-9C20.3 7.3 17.2 3 12 3Z" fill="currentColor" stroke="none"/><path d="M6.7 11.2c1.5.1 3.3 1 4 3.3-.6 1-2.2 1.2-3.4.3-1.4-1-1.8-2.6-.6-3.6Zm10.6 0c-1.5.1-3.3 1-4 3.3.6 1 2.2 1.2 3.4.3 1.4-1 1.8-2.6.6-3.6Z" fill="#b63b9f" stroke="none"/>'
  };
  const ico = (name, size = 22, solid = false) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" fill="${solid ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name] || ''}</svg>`;

  let slideIndex = 0, like = false, saved = false;
  let current = null; // {artistId, trackIndex} — exactly one current song
  let lyricsOpen = false;
  let story = null; // {artistId, index}
  let storyTimer = null, storyProgress = 0, storyPaused = false;
  let toastTimer = null;
  let currentLyric = -1;

  function route() {
    const path = decodeURIComponent(location.hash.replace(/^#/, '') || '/');
    if (path === '/karylgram') return {page:'instagram'};
    const match = path.match(/^\/artist\/([a-z0-9]+)$/i);
    if (match && getArtist(match[1])) return {page:'artist', id:match[1]};
    return {page:'landing'};
  }

  function handleMissingImages(scope = document) {
    scope.querySelectorAll('img').forEach(el => {
      el.addEventListener('error', () => {
        el.style.display = 'none';
        if (el.classList.contains('brand-logo')) document.querySelector('.brand-logo-fallback')?.style.setProperty('display','block');
      }, {once:true});
      // Handle cached/previously-failed images on browser history navigation.
      if (el.complete && el.naturalWidth === 0) el.dispatchEvent(new Event('error'));
      if (el.complete && el.naturalWidth > 0) el.closest('.visual-asset')?.classList.add('has-image');
      else el.addEventListener('load', () => el.closest('.visual-asset')?.classList.add('has-image'), {once:true});
    });
  }

  function render() {
    const r = route();
    document.title = r.page === 'artist' ? `${getArtist(r.id).name} — Karylgram Music` : (r.page === 'instagram' ? 'Karylgram · K-TRACE 2027' : '국힙은 여친이 필요해♡');
    if (r.page === 'landing') app.innerHTML = landingPage();
    if (r.page === 'instagram') app.innerHTML = instagramPage();
    if (r.page === 'artist') app.innerHTML = artistPage(getArtist(r.id));
    handleMissingImages(app);
    if (r.page === 'instagram') bindSwipe();
    window.scrollTo({top:0,behavior:'instant'});
    renderPlayer();
  }

  function landingPage() {
    // 메인 로고는 이미 저장소 assets/logo/에 존재하므로 참조합니다.
    return `<main class="landing view-enter">
      <span class="landing-corner corner-a"></span><span class="landing-corner corner-b"></span>
      <div class="landing-topline"><span><span class="live-pip"></span>SEOUL HIP-HOP ARCHIVE</span><span>EST. 2027</span></div>
      <div class="landing-inner"><div class="landing-eyebrow">THE SCENE IS CALLING</div>
        <img class="brand-logo" src="assets/logo/k-hiphop_main_logo.png" alt="국힙은 여친이 필요해♡ 메인 로고" />
        <div class="brand-logo-fallback">국힙은<br /><span>여친이</span><br />필요해♡</div>
        <div class="landing-sub">7 ARTISTS · 1 CITY · MANY BAD DECISIONS</div>
        <button class="enter-button" type="button" data-action="enter" aria-label="Karylgram 시작하기">
          <span class="enter-glyph">${ico('alien',49)}</span><span class="enter-label">TAP TO ENTER ↗</span>
        </button>
      </div>
      <div class="landing-bottom"><div><strong>NOT YOUR AVERAGE LOVE STORY.</strong>K-TRACE 2027 · OCT 20</div><div>01 / 03</div></div>
    </main>`;
  }

  function header() { return `<header class="ig-header"><a class="wordmark" href="#/karylgram" aria-label="Karylgram 홈">Karyl<i>gram</i><span class="brand-dot">.</span></a><div class="header-actions"><a class="icon-button" href="#/" aria-label="처음 화면">${ico('back',23)}</a><button class="icon-button" data-action="share" aria-label="공유">${ico('share',22)}</button></div></header>`; }
  function instagramPage() {
    return `<div class="app-background"><aside class="desktop-watermark">SEOUL / KARYLGRAM / OCT. 2027</aside><aside class="desktop-watermark right">AN INDEPENDENT MUSIC EXPERIENCE</aside>
      <main class="site-shell view-enter">${header()}
        <section class="ig-announce"><div class="ig-account"><div class="official-avatar">KT</div><div><div class="ig-username">ktrace_official <span class="verify">${ico('verified',14)}</span></div><div class="ig-location">K-TRACE 2027 · Seoul, Korea</div></div></div><button class="post-menu" aria-label="피드 옵션" data-action="post-info">•••</button></section>
        <section class="post-card"><div class="post-media" id="post-media">${slideHtml(slideIndex)}</div>
          <nav class="feed-actions"><div class="left"><button data-action="like" aria-label="좋아요">${ico('heart',26,like)}</button><button data-action="focus-caption" aria-label="소개글 보기">${ico('at',26)}</button><button data-action="share" aria-label="공유">${ico('share',26)}</button></div><button data-action="save" aria-label="저장">${ico('save',26,saved)}</button></nav>
          <div class="carousel-dots" id="carousel-dots">${dotsHtml()}</div><div class="feed-meta"><div class="like-count" id="like-count">${like ? '좋아요 24,828개' : '좋아요 24,827개'}</div><div class="caption-heading"><span class="at">ktrace_official</span> K-TRACE 2027. THE LINEUP IS HERE. 💗</div>
          <div class="caption-copy" id="caption">${captionHtml()}</div><div class="caption-footer">2027년 9월 12일 · 서울 · 댓글은 현재 비활성화되어 있습니다.</div></div>
        </section><div class="section-divider"></div>${storiesSection()}
        <footer class="ig-footer"><div class="footer-wordmark">KARYLGRAM · K-TRACE</div><div class="footer-text">A FICTIONAL SEOUL HIP-HOP UNIVERSE</div></footer>
      </main></div>`;
  }
  function handleLink(a) {return `<a class="handle-link" href="${links(a)}">@${esc(a.handle)}</a>`;}
  function captionHtml() {
    const a = Object.fromEntries(artists.map(x => [x.id,x]));
    return `<p>드디어 공개합니다. 한국 힙합의 지금을 한곳에서 만나는 <b>K-TRACE 2027</b>이 <b>10월 20일</b> 서울에서 열립니다. 작년에도 이 무대를 뜨겁게 만들어준 아티스트들과, 올해 처음 이름을 올리는 새로운 얼굴들까지. 올해 라인업은 조금, 아니 꽤 심각합니다. 🔥</p>
      <p>무대를 하나의 장르로 묶기보다, 서로 다른 음악을 만드는 사람들이 같은 날 같은 무대 위에 서는 것. K-TRACE가 지키고 싶은 건 바로 그 장면입니다. 공연은 물론 합동 작업과 컴필레이션, 특별 영상 프로젝트도 차례로 공개될 예정입니다.</p>
      <p>첫 번째 이름, <b>SL00Z</b> ${handleLink(a.sl00z)}. 관객을 설득하는 대신 자신의 소리를 끝까지 밀어붙이는 사람. 숨 막히게 정교한 노이즈와 짙은 저음, 그리고 라이브에서만 완성되는 공기를 올해도 놓치지 마세요.</p>
      <p>역시나 페스티벌에 빠지지 않는 <b>KAY KAYO</b> ${handleLink(a.kayo)}도 참여합니다. 작년 <b>ODOGWU</b>로 아프로비트 보스의 명맥을 제대로 보여준 그녀. 올해는 어떤 그루브로 바닥을 뒤집어놓을지, 벌써부터 스태프들이 워밍업 중입니다. (진짜로요.)</p>
      <p>GROUNDWORK의 중심이자 씬의 오래된 기준점 <b>JAE-ONE</b> ${handleLink(a.jaeone)}. 묵직한 붐뱁부터 사람 냄새 나는 이야기까지. 앨범으로 증명해온 시간이 무대 위에서 어떻게 들리는지 직접 확인할 차례입니다.</p>
      <p>그리고 이름만으로 온도를 올리는 <b>Jane Doe</b> ${handleLink(a.janedoe)}. 싸움 같은 벌스와 조금도 물러서지 않는 에너지. 사운드체크부터 이미 앞줄이 걱정되는 라인업이라는 사실만 전해드립니다.</p>
      <p>지금 가장 선명한 자기 팬덤을 가진 <b>Lil Soda</b> ${handleLink(a.soda)}도 합류합니다. 상처 입은 멜로디와 거친 기타, 너무 개인적이라 오히려 모두가 따라 부르는 노래들. 이번 무대는 이어폰 밖에서 만나주세요.</p>
      <p>음악과 연기, 두 개의 무대에서 모두 자기 이름을 만든 <b>NAFI</b> ${handleLink(a.nafi)}. 방송 화면에 담기지 않는 라이브의 결, 조금 더 솔직한 목소리를 준비하고 있습니다. 그날 카메라보다 먼저 귀를 열어주세요.</p>
      <p>그리고 새로운 파형. FILEBREEDS의 <b>Young ERROR</b> ${handleLink(a.error)}. 누군가에겐 아직 낯선 사운드, 누군가에겐 이미 미래인 그 소리. 설명은 짧게 할게요. 현장에서 들으면 압니다. 아마 본인은 “왜요?”라고 하겠지만요.</p>
      <p>마지막 <b>SECRET</b> 슬롯은 아직 공개할 수 없습니다. 힌트는 하나, <b>@user?</b>. 정체는 행사 당일에 확인해 주세요. 이미 알고 있는 사람도, 처음 마주칠 이름도 있을 겁니다.</p>
      <p>📍 <b>SEOUL</b>　 📅 <b>2027.10.20</b><br />추가 일정·입장 안내·컴필레이션 공개 소식은 이 계정에서 이어집니다. 오래 기다린 만큼, 제대로 만나겠습니다.</p>
      <p class="hashtag">#KTRACE2027 #KTRACE #한국힙합 #서울힙합 #Karylgram #LineupDrop</p>`;
  }

  const tagPositions = [null,{left:'9%',top:'21%'},{right:'8%',top:'28%'},{left:'7%',bottom:'20%'},{right:'8%',bottom:'21%'},{left:'12%',top:'40%'},{right:'10%',top:'19%'},{left:'8%',bottom:'31%'},{right:'13%',top:'67%'}];
  function positionStyle(n) { const p=tagPositions[n]; return p ? Object.entries(p).map(([k,v])=>`${k}:${v}`).join(';') : ''; }
  function slideHtml(n) {
    const count = `<span class="slide-count">${n+1} / 9</span>`;
    const arrows = `<button class="carousel-hit carousel-prev" data-action="slide-prev" aria-label="이전 피드">${ico('chevronLeft',25)}</button><button class="carousel-hit carousel-next" data-action="slide-next" aria-label="다음 피드">${ico('chevronRight',25)}</button>`;
    if (n === 0) return `<div class="poster-slide">${imageLayer(DATA.event.posterImage,'K-TRACE 2027 포스터',true)}<div class="slide-grid"></div><div class="poster-inner"><div class="poster-kicker">THE NEW WAVE OF KOREAN HIP-HOP</div><div class="poster-headline">K-<br /><span>TRACE</span><br />2027</div><div class="poster-info"><span>LINEUP REVEALED<br />SEOUL / LIVE + COMPILATION</span><b>10.20</b></div></div></div>${count}${arrows}`;
    if (n === 8) return `<div class="secret-slide">${imageLayer(DATA.event.secretImage,'비밀 출연진 포스터')}<div class="slide-grid"></div><div class="secret-mark">?</div><div class="secret-title">SECRET ARTIST</div><div class="secret-sub">THE FINAL NAME IS STILL UNDISCLOSED</div><button class="tagged-handle" style="right:10%;bottom:17%" data-action="secret" aria-label="비밀 아티스트 티저">${ico('at',15)}user?</button></div>${count}${arrows}`;
    const a = artists[n-1];
    return `<div class="artist-slide" style="${cssColor(a)}">${imageLayer(a.feedImage,`${a.name} K-TRACE 소개 사진`)}<div class="slide-grid"></div><span class="slide-number">K-TRACE / 0${n}</span><div class="slide-fallback"><div class="slide-genre">${esc(a.genre)}</div><div class="slide-stage-name">${esc(a.name)}</div><div class="slide-line">${esc(a.tagline)}</div></div><a href="${links(a)}" style="${positionStyle(n)}" class="tagged-handle">${ico('at',15)}${esc(a.handle)}</a></div>${count}${arrows}`;
  }
  function dotsHtml() {return Array.from({length:9},(_,i)=>`<button type="button" data-action="dot" data-index="${i}" aria-label="피드 ${i+1}번" class="${i===slideIndex?'selected':''}"></button>`).join('');}
  function updateCarousel(index) { slideIndex=(index+9)%9;const media=document.querySelector('#post-media');if(!media)return;media.innerHTML=slideHtml(slideIndex);document.querySelector('#carousel-dots').innerHTML=dotsHtml();handleMissingImages(media); }
  function bindSwipe() {
    const media=document.querySelector('#post-media');if(!media)return;
    let startX=null,startY=null;
    media.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;startX=e.touches[0].clientX;startY=e.touches[0].clientY;},{passive:true});
    media.addEventListener('touchend',e=>{if(startX===null)return;const dx=e.changedTouches[0].clientX-startX;const dy=e.changedTouches[0].clientY-startY;if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.15)updateCarousel(slideIndex+(dx<0?1:-1));startX=null;},{passive:true});
    let mouseX=null;media.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')mouseX=e.clientX;});media.addEventListener('pointerup',e=>{if(mouseX===null)return;const dx=e.clientX-mouseX;if(Math.abs(dx)>65)updateCarousel(slideIndex+(dx<0?1:-1));mouseX=null;});
  }

  function storiesSection() {
    const rows=artists.filter(a=>a.stories>0).map(a=>`<button class="story-item" type="button" data-action="story-open" data-artist="${a.id}" aria-label="${esc(a.name)} 스토리 ${a.stories}개 보기"><span class="story-ring" style="${cssColor(a)}"><span class="story-photo">${img(a.avatarImage,`${a.name} 프로필`,true)}${esc(a.name.slice(0,2).toUpperCase())}</span></span><span class="story-name">${esc(a.name)}</span></button>`).join('');
    return `<section class="stories-section"><div class="section-top"><span class="section-title">Stories <span style="color:var(--pink)">●</span></span><small>BEHIND THE SCENE</small></div><div class="story-row">${rows}</div><p class="story-note">작은 동그라미 뒤의 조금 더 솔직한 밤. · Young ERROR는 업로드 없음.</p></section>`;
  }

  function trackWithDefaults(t) {return { ...t, album: t.album || '앨범 정보 추가 예정', year:t.year || '—', cover:t.cover || null, lyrics:t.lyrics || [] };}
  function artistPage(a) {
    const tracks=a.tracks.map((raw,i)=>{const t=trackWithDefaults(raw);const disabled=!t.file;const playing=current?.artistId===a.id&&current.trackIndex===i;return `<button type="button" class="song-row ${playing?'is-playing':''}" data-action="play-track" data-artist="${a.id}" data-track="${i}" ${disabled?'disabled':''} aria-label="${disabled?'발매 예정':`${esc(a.name)} ${esc(t.title)} 재생`}"><div class="song-cover" style="--artist-tone:${a.tone};--artist-ink:${a.ink}">${imageLayer(t.cover,`${t.title} 앨범 커버`)}<span class="cover-letter">${i+1}</span></div><div class="song-copy"><div class="song-title">${esc(t.title)}</div><div class="song-meta">${t.explicit?'<span class="explicit" title="Explicit">E</span>':''}${disabled?'미공개 트랙':`${esc(t.album)} · ${esc(t.year)}`}</div></div><div class="track-trail">${disabled?'<span class="placeholder-song">추가 예정</span>':playing?ico('volume',20):ico('play',19)}</div></button>`;}).join('');
    const similar=a.similar.map(s=>`<a class="similar-card" target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/results?search_query=${encodeURIComponent(s+' official music')}" aria-label="YouTube에서 ${esc(s)} 음악 보기"><div class="similar-art"><b>${esc(s)}</b></div><div class="similar-title">${esc(s)}</div><div class="similar-sub">YouTube에서 보기 ${ico('arrowUpRight',12)}</div></a>`).join('');
    return `<div class="app-background"><aside class="desktop-watermark">APPLE MUSIC · ARTIST FILE</aside><aside class="desktop-watermark right">K-TRACE 2027 / ${esc(a.name)}</aside><main class="site-shell artist-page view-enter" style="--artist-tone:${a.tone};--artist-ink:${a.ink}">
      <nav class="artist-back"><a href="#/karylgram" aria-label="Karylgram 피드로 돌아가기">${ico('chevronLeft',25)} Karylgram</a><span class="artist-back-label">ARTIST</span><button class="icon-button" data-action="share" style="color:white" aria-label="공유">${ico('share',21)}</button></nav>
      <section class="artist-hero">${imageLayer(a.artistImage,`${a.name} 아티스트 프로필 촬영 이미지`,true)}<div class="hero-panel"><div class="hero-eyebrow">K-TRACE 2027 / FEATURED ARTIST</div><h1 class="hero-name">${esc(a.name)}</h1><div class="hero-sub">${esc(a.tagline)}<br />${esc(a.genre)}</div></div></section>
      <section class="artist-data"><div class="artist-data-top"><div class="apple-mark">${ico('music',21)}</div><div><strong>${esc(a.name)} <span style="color:#a2a0aa;font-weight:600">· ${esc(a.korean)}</span></strong><small>${esc(a.label)}</small></div></div><p class="artist-bio">서울의 같은 밤, 서로 다른 소리. K-TRACE의 무대에서 ${esc(a.name)}의 음악을 만나보세요. 아래에서 인기곡을 직접 감상할 수 있습니다.</p></section>
      <section><div class="music-heading"><h2>인기곡</h2><small>TOP SONGS · 03</small></div><div class="song-list">${tracks}</div></section><div class="section-divider" style="margin-top:25px"></div>
      <section class="similar-section"><div class="music-heading" style="padding:7px 0 19px"><h2>유사한 아티스트</h2>${ico('chevronRight',20)}</div><div class="similar-grid">${similar}</div></section>
      <footer class="artist-foot">KARYLGRAM MUSIC · K-TRACE 2027 · FAN CONCEPT</footer>
    </main></div>`;
  }

  /* Global audio — by design only one <audio> can play at once. */
  function activeInfo() { if(!current)return null;const a=getArtist(current.artistId);const t=a&&a.tracks[current.trackIndex];return t ? {a,t:trackWithDefaults(t)}:null; }
  async function playTrack(artistId,index) {
    const a=getArtist(artistId),t=a?.tracks[index];if(!t?.file)return;
    const same=current?.artistId===artistId && current.trackIndex===index;
    if(same){ if(audio.paused) await safePlay();else audio.pause();return;}
    audio.pause();audio.removeAttribute('src');audio.load();
    current={artistId,trackIndex:index};audio.src=encodeURI(t.file);audio.load();
    renderPlayer();
    // Existing page cards should immediately reflect the changed track.
    if(route().page==='artist') {document.querySelectorAll('.song-row').forEach((r,i)=>{r.classList.toggle('is-playing',Number(r.dataset.track)===index&&r.dataset.artist===artistId);const trail=r.querySelector('.track-trail');if(trail&&!r.disabled)trail.innerHTML=r.classList.contains('is-playing')?ico('volume',20):ico('play',19);});}
    await safePlay();if(lyricsOpen)renderLyrics();
  }
  async function safePlay(){try{await audio.play()}catch(err){if(err.name!=='AbortError')toast('재생하려면 재생 버튼을 다시 눌러 주세요.');}renderPlayer();}
  function togglePlay(){if(!current)return;if(audio.paused)safePlay();else audio.pause();}
  function skipNext(){const info=activeInfo();if(!info)return;const list=info.a.tracks.map((t,i)=>({t,i})).filter(v=>v.t.file);const n=list.findIndex(v=>v.i===current.trackIndex);const next=list[(n+1)%list.length];if(next)playTrack(info.a.id,next.i);}
  function renderPlayer(){
    const inf=activeInfo();if(!inf){playerRoot.innerHTML='';return;}
    const {a,t}=inf;playerRoot.innerHTML=`<div class="mini-player" style="${cssColor(a)}"><div class="mini-progress" style="width:${audio.duration?Math.min(100,100*audio.currentTime/audio.duration):0}%"></div><div class="mini-art">${esc(a.name.slice(0,2).toUpperCase())}</div><button class="mini-info" data-action="lyrics-open" aria-label="${esc(t.title)} 가사 화면 열기"><strong>${esc(t.title)}</strong><span>${esc(a.name)} · 가사 보기</span></button><div class="mini-controls"><button class="mini-control play" data-action="play-toggle" aria-label="${audio.paused?'재생':'일시정지'}">${ico(audio.paused?'play':'pause',28,true)}</button><button class="mini-control" data-action="next-track" aria-label="다음 곡">${ico('skip',21,true)}</button></div></div>`;
  }
  function updatePlayerProgress(){const line=document.querySelector('.mini-progress');if(line)line.style.width=(audio.duration?Math.min(100,100*audio.currentTime/audio.duration):0)+'%';const seek=document.querySelector('#lyrics-seek');if(seek){seek.max=String(Number.isFinite(audio.duration)?audio.duration:100);seek.value=String(audio.currentTime||0);}const p=document.querySelector('#time-now');if(p)p.textContent=moneyTime(audio.currentTime);const q=document.querySelector('#time-rest');if(q)q.textContent='-'+moneyTime(Math.max(0,(audio.duration||0)-audio.currentTime));updateLyricsActive();}
  function lyricsLines(t){return Array.isArray(t.lyrics)?t.lyrics.map((l,i)=>typeof l==='string'?{time:i*4,text:l}:l).filter(l=>l&&l.text):[];}
  function renderLyrics(){
    if(!lyricsOpen)return;const inf=activeInfo();if(!inf){closeOverlay();return;}
    const {a,t}=inf;const lines=lyricsLines(t);currentLyric=-1;
    overlayRoot.innerHTML=`<div class="overlay" data-overlay="lyrics"><section class="lyrics-sheet" style="${cssColor(a)}--tone:${a.tone};--inkcolor:${a.ink}" role="dialog" aria-modal="true" aria-label="${esc(t.title)} 가사">
       <header class="lyrics-header"><button class="close" data-action="lyrics-close" aria-label="가사 닫기">${ico('chevronLeft',23)}</button><div class="lyrics-label">NOW PLAYING · LYRICS</div><button class="close" data-action="lyrics-close" aria-label="닫기">${ico('close',19)}</button></header>
       <div class="lyrics-lines" id="lyrics-lines">${lines.length?lines.map((line,i)=>`<div class="lyric-line" data-line="${i}">${esc(line.text)}</div>`).join(''):`<div class="lyrics-empty"><div class="empty-kicker">THE WORDS WILL FOLLOW</div><h2>${esc(t.title)}</h2><p>아직 가사가 등록되지 않았어요.<br />추후 data.js의 해당 곡에 lyrics를 입력하면<br />이 공간에 가사가 표시됩니다.</p></div>`}</div>
       <div class="lyrics-ctrl"><div class="full-track"><div class="full-art">${esc(a.name.slice(0,2).toUpperCase())}</div><div><strong>${esc(t.title)}</strong><span>${esc(a.name)} · ${esc(t.album)}</span></div></div>
       <input id="lyrics-seek" class="seek-range" type="range" min="0" max="${Number.isFinite(audio.duration)?audio.duration:100}" value="${audio.currentTime||0}" step="0.1" aria-label="재생 위치" /><div class="time-pair"><span id="time-now">${moneyTime(audio.currentTime)}</span><span id="time-rest">-${moneyTime(Math.max(0,(audio.duration||0)-audio.currentTime))}</span></div>
       <div class="full-controls"><button class="full-control" data-action="lyrics-close" aria-label="플레이어 닫기">${ico('chevronLeft',26)}</button><button class="full-control play" data-action="play-toggle" aria-label="재생·일시정지">${ico(audio.paused?'play':'pause',28,true)}</button><button class="full-control" data-action="next-track" aria-label="다음 노래">${ico('skip',26,true)}</button></div></div>
      </section></div>`;
    document.body.classList.add('modal-open');updatePlayerProgress();
  }
  function updateLyricsActive(){if(!lyricsOpen)return;const inf=activeInfo();if(!inf)return;const lines=lyricsLines(inf.t);if(!lines.length)return;let index=-1;for(let i=0;i<lines.length;i++)if((Number(lines[i].time)||0)<=audio.currentTime)index=i;if(index===currentLyric)return;currentLyric=index;const nodes=document.querySelectorAll('.lyric-line');nodes.forEach((el,i)=>el.classList.toggle('active',i===index));if(index>=0)nodes[index]?.scrollIntoView({block:'center',behavior:'smooth'});}
  function closeOverlay(){lyricsOpen=false;story=null;stopStoryTimer();overlayRoot.innerHTML='';document.body.classList.remove('modal-open');}

  /* Instagram-like story viewer — uses fixed count but no unprovided image. */
  function storyArtists(){return artists.filter(a=>a.stories>0);}
  function openStory(id,index=0){if(!getArtist(id)?.stories)return;lyricsOpen=false;story={artistId:id,index};storyProgress=0;storyPaused=false;renderStory();}
  function stopStoryTimer(){if(storyTimer){clearInterval(storyTimer);storyTimer=null;}}
  function startStoryTimer(){stopStoryTimer();storyTimer=setInterval(()=>{if(storyPaused||!story)return;storyProgress+=100/5800;const prog=overlayRoot.querySelector('.story-segment.current span');if(prog)prog.style.width=`${Math.min(100,storyProgress*100)}%`;if(storyProgress>=1)nextStory(1);},100);}
  function nextStory(delta){if(!story)return;const a=getArtist(story.artistId);let index=story.index+delta;if(index>=0&&index<a.stories){story.index=index;}else{const group=storyArtists();let groupIndex=group.findIndex(x=>x.id===story.artistId)+delta;if(groupIndex<0){closeOverlay();return;}if(groupIndex>=group.length){closeOverlay();return;}const target=group[groupIndex];story.artistId=target.id;story.index=delta>0?0:target.stories-1;}storyProgress=0;renderStory();}
  function renderStory(){if(!story)return;const a=getArtist(story.artistId),n=story.index,src=a.storyImages?.[n]||null;
    overlayRoot.innerHTML=`<div class="overlay story-overlay" data-overlay="story"><section class="story-sheet" style="${cssColor(a)}" role="dialog" aria-modal="true" aria-label="${esc(a.name)} 스토리 ${n+1}/${a.stories}">
       ${imageLayer(src,`${a.name} 스토리 ${n+1}`)}
       <div class="story-progress">${Array.from({length:a.stories},(_,i)=>`<div class="story-segment ${i===n?'current':''}"><span style="width:${i<n?'100%':'0%'}"></span></div>`).join('')}</div>
       <div class="story-header"><div class="story-avatar">${esc(a.name.slice(0,2).toUpperCase())}</div><div class="story-name-info">${esc(a.handle)} <span>${n+1} / ${a.stories}</span></div><button class="story-close" data-action="story-close" aria-label="스토리 닫기">${ico('close',24)}</button></div>
       <div class="story-center"><div class="story-index">${String(n+1).padStart(2,'0')}</div><div class="story-main-label">${esc(a.name)}</div><div class="story-caption">STORY / ${String(n+1).padStart(2,'0')}</div></div>
       <button class="story-tap prev" data-action="story-prev" aria-label="이전 스토리"></button><button class="story-tap next" data-action="story-next" aria-label="다음 스토리"></button><div class="story-foot">메시지 보내기 · 소식 보기</div>
      </section></div>`;document.body.classList.add('modal-open');handleMissingImages(overlayRoot);startStoryTimer();}

  function toast(message){document.querySelector('.toast')?.remove();clearTimeout(toastTimer);const el=document.createElement('div');el.className='toast';el.textContent=message;document.body.appendChild(el);toastTimer=setTimeout(()=>el.remove(),3200);}
  async function share(){const url=location.href;if(navigator.share){try{await navigator.share({title:document.title,url});return;}catch(e){if(e.name==='AbortError')return;}}try{await navigator.clipboard.writeText(url);toast('현재 페이지 링크를 복사했어요.');}catch(e){toast('주소창의 링크를 공유해 주세요.');}}
  document.addEventListener('click',e=>{
    const el=e.target.closest('[data-action]');if(!el)return;const action=el.dataset.action;
    switch(action){
      case 'enter':location.hash='#/karylgram';break;
      case 'slide-prev':updateCarousel(slideIndex-1);break;
      case 'slide-next':updateCarousel(slideIndex+1);break;
      case 'dot':updateCarousel(Number(el.dataset.index));break;
      case 'like':like=!like;el.innerHTML=ico('heart',26,like);el.classList.toggle('is-liked',like);document.querySelector('#like-count').textContent=like?'좋아요 24,828개':'좋아요 24,827개';break;
      case 'save':saved=!saved;el.innerHTML=ico('save',26,saved);toast(saved?'피드를 저장했어요.':'저장을 취소했어요.');break;
      case 'focus-caption':document.querySelector('#caption')?.scrollIntoView({behavior:'smooth',block:'start'});break;
      case 'post-info':toast('K-TRACE 2027 공식 라인업 피드입니다.');break;
      case 'share':share();break;
      case 'secret':toast('SECRET 아티스트는 2027.10.20 공개됩니다.');break;
      case 'story-open':openStory(el.dataset.artist);break;
      case 'story-close':closeOverlay();break;
      case 'story-next':nextStory(1);break;
      case 'story-prev':nextStory(-1);break;
      case 'play-track':playTrack(el.dataset.artist,Number(el.dataset.track));break;
      case 'play-toggle':togglePlay();break;
      case 'next-track':skipNext();break;
      case 'lyrics-open':story=null;stopStoryTimer();lyricsOpen=true;renderLyrics();break;
      case 'lyrics-close':closeOverlay();break;
    }
  });
  overlayRoot.addEventListener('pointerdown',e=>{if(story&&e.target.closest('.story-sheet'))storyPaused=true;});
  overlayRoot.addEventListener('pointerup',()=>{storyPaused=false;});
  overlayRoot.addEventListener('pointercancel',()=>{storyPaused=false;});
  overlayRoot.addEventListener('input',e=>{if(e.target.id==='lyrics-seek'&&Number.isFinite(audio.duration))audio.currentTime=Number(e.target.value);});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&(story||lyricsOpen)){e.preventDefault();closeOverlay();return;}
    if(e.key==='ArrowRight'&&story){e.preventDefault();nextStory(1);return;}
    if(e.key==='ArrowLeft'&&story){e.preventDefault();nextStory(-1);return;}
    if(route().page==='instagram'&&!lyricsOpen&&!story&&['ArrowRight','ArrowLeft'].includes(e.key)&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();updateCarousel(slideIndex+(e.key==='ArrowRight'?1:-1));}
  });
  window.addEventListener('hashchange',()=>{if(story||lyricsOpen)closeOverlay();render();});
  audio.addEventListener('timeupdate',updatePlayerProgress);
  audio.addEventListener('loadedmetadata',updatePlayerProgress);
  audio.addEventListener('play',()=>{renderPlayer();const b=document.querySelector('.full-control.play');if(b)b.innerHTML=ico('pause',28,true);});
  audio.addEventListener('pause',()=>{renderPlayer();const b=document.querySelector('.full-control.play');if(b)b.innerHTML=ico('play',28,true);});
  audio.addEventListener('ended',skipNext);
  audio.addEventListener('error',()=>{if(current)toast('음원 파일을 불러올 수 없어요. 저장소의 파일 경로를 확인해 주세요.');});
  render();
})();
