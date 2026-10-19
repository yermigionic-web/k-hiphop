
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
  const audio = document.querySelector('#shared-audio');
  const artists = DATA.artists;
  const getArtist = id => artists.find(a => a.id === id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cssColor = a => `--tone:${a.tone};--inkcolor:${a.ink};`;
  const moneyTime = n => Number.isFinite(n) ? `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2,'0')}` : '0:00';
  const imagePool = new Map();
  const warmImage = src => {
    if (!src || imagePool.has(src)) return;
    const image = new Image();
    image.decoding = 'async';
    image.src = encodeURI(src);
    imagePool.set(src, image);
  };
  const warmSiteImages = () => {
    const paths = [DATA.event.posterImage, DATA.event.secretImage, ...artists.flatMap(a => [a.feedImage, a.avatarImage, a.artistImage, ...(a.storyImages || []), ...a.tracks.map(t => t.cover)])];
    paths.filter(Boolean).forEach(warmImage);
  };
  const img = (src, alt) => src ? `<img src="${esc(encodeURI(src))}" alt="${esc(alt)}" loading="eager" decoding="async" />` : '';
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
  let current = null;
  let lyricsOpen = false;
  let story = null;
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

      if (el.complete && el.naturalWidth === 0) el.dispatchEvent(new Event('error'));
      if (el.complete && el.naturalWidth > 0) el.closest('.visual-asset')?.classList.add('has-image');
      else el.addEventListener('load', () => el.closest('.visual-asset')?.classList.add('has-image'), {once:true});
    });
  }

  function render() {
    const r = route();
    document.title = r.page === 'artist' ? `${getArtist(r.id).name} — Karylgram Music` : (r.page === 'instagram' ? 'Karylgram · K-TRACE 2027' : '국힙은 여친이 필요해♡');
    document.body.classList.toggle('on-music-page', r.page === 'artist');
    if (r.page === 'landing') app.innerHTML = landingPage();
    if (r.page === 'instagram') app.innerHTML = instagramPage();
    if (r.page === 'artist') app.innerHTML = artistPage(getArtist(r.id));
    handleMissingImages(app);
    if (r.page === 'instagram') bindSwipe();
    window.scrollTo({top:0,behavior:'instant'});
    renderPlayer();
  }

  function landingPage() {

    return `<main class="landing view-enter">
      <span class="landing-corner corner-a"></span><span class="landing-corner corner-b"></span>
      <div class="landing-topline"><span>EST. 2027</span></div>
      <div class="landing-inner"><div class="landing-eyebrow">지금 래퍼 여친 구함!</div>
        <img class="brand-logo" src="assets/logo/k-hiphop_main_logo.png" alt="국힙은 여친이 필요해♡ 메인 로고" />
        <div class="brand-logo-fallback">국힙은<br /><span>여친이</span><br />필요해♡</div>
        <div class="landing-sub">7 ARTISTS · 1 CITY · MANY BAD DECISIONS</div>
        <button class="enter-button" type="button" data-action="enter" aria-label="Karylgram 시작하기">
          <span class="enter-glyph">${ico('alien',49)}</span><span class="enter-label">TAP TO ENTER ↗</span>
        </button>
      </div>
      <div class="landing-bottom"><div><strong>NOT YOUR AVERAGE LOVE STORY</strong>K-TRACE 2027 · OCT 20</div></div>
    </main>`;
  }

  function header() { return `<header class="ig-header"><a class="wordmark" href="#/karylgram" aria-label="Karylgram 홈">Karyl<i>gram</i><span class="brand-dot">.</span></a><div class="header-actions"><a class="icon-button" href="#/" aria-label="처음 화면">${ico('back',23)}</a><button class="icon-button" data-action="share" aria-label="공유">${ico('share',22)}</button></div></header>`; }
  function instagramPage() {
    return `<div class="app-background"><aside class="desktop-watermark">SEOUL / KARYLGRAM / OCT. 2027</aside><aside class="desktop-watermark right">AN INDEPENDENT MUSIC EXPERIENCE</aside>
      <main class="site-shell view-enter">${header()}
        ${storiesSection()}
        <section class="ig-announce"><div class="ig-account"><div class="official-avatar">KT</div><div><div class="ig-username">ktrace_official <span class="verify">${ico('verified',14)}</span></div><div class="ig-location">K-TRACE 2027 · Seoul, Korea</div></div></div><button class="post-menu" aria-label="피드 옵션" data-action="post-info">•••</button></section>
        <section class="post-card"><div class="post-media" id="post-media" aria-label="K-TRACE 2027 공식 피드 이미지 9장">${feedCarouselHtml()}</div>
          <nav class="feed-actions"><div class="left"><button data-action="like" aria-label="좋아요">${ico('heart',26,like)}</button><button data-action="focus-caption" aria-label="소개글 보기">${ico('at',26)}</button><button data-action="share" aria-label="공유">${ico('share',26)}</button></div><button data-action="save" aria-label="저장">${ico('save',26,saved)}</button></nav>
          <div class="carousel-dots" id="carousel-dots">${dotsHtml()}</div><div class="feed-meta"><div class="like-count" id="like-count">${like ? '좋아요 24,828개' : '좋아요 24,827개'}</div><div class="caption-heading"><span class="at">ktrace_official</span> K-TRACE 2027. THE LINEUP IS HERE. 💗</div>
          <div class="caption-copy" id="caption">${captionHtml()}</div><div class="caption-footer">2027년 9월 12일 · 서울 · 댓글은 현재 비활성화되어 있습니다.</div></div>
        </section>
        <footer class="ig-footer"><div class="footer-wordmark">KARYLGRAM · KKU</div><div class="footer-text">KOREAN HIPHOP NEEDS MORE WLW</div></footer>
      </main></div>`;
  }
  function handleLink(a) {return `<a class="handle-link" href="${links(a)}">@${esc(a.handle)}</a>`;}
  function captionHtml() {
    const a = Object.fromEntries(artists.map(x => [x.id,x]));
    return `<p>드디어 공개합니다. 한국 힙합의 지금을 한곳에서 만나는 <b>K-TRACE 2027</b>이 <b>10월 20일</b> 서울에서 열립니다. 작년에도 이 무대를 뜨겁게 만들어준 아티스트들과, 올해 처음 이름을 올리는 새로운 얼굴들까지. 올해 라인업은 조금, 아니 꽤 심각합니다. 🔥</p>
      <p>하나의 장르로 묶이지 않는 27시즌 힙합 씬, 서로 다른 음악을 만드는 사람들을 같은 날 같은 무대에서 맛보고 가시는 것이 K-TRACE의 목적이어 왔죠. 공연은 물론 합동 작업과 컴필레이션, 특별 영상 프로젝트도 근시일 내에 공개될 예정입니다.</p>
      <p>준비해 주신 래퍼 분들께 Shout-out을 보내며, 라이트한 힙합 팬분들부터 헤비 훌리건 분들에게까지 간략한 소개를 드리겠습니다!</p>
      <p>영광스러운 첫 번째는 바로 <b>SL00Z</b> ${handleLink(a.sl00z)}. 설득되기 이전에 압도되는, 인더스트리얼 장르의 핵심이죠. 숨 막히게 정교한 노이즈와 짙은 저음, 그리고 라이브에서만 완성되는 공기를 올해도 놓치지 마세요.</p>
      <p>힙합 페스티벌에 빠지지 않는 이름! <b>KAY KAYO</b> ${handleLink(a.kayo)}도 참여합니다. 작년 <b>ODOGWU</b>로 아프로비트 보스의 Steeze를 제대로 보여준 그녀. 올해는 어떤 그루브로 바닥을 뒤집어놓을지 기대되시지 않나요?</p>
      <p>현시점 핫한 레이블 하면 빠지지 않는 이름. GROUNDWORK의 중심이자 OG 대표주자 <b>JAE-ONE</b> ${handleLink(a.jaeone)}. 앨범으로 증명해온 레거시가 무대 위에서 어떻게 들리는지 직접 확인할 차례입니다.</p>
      <p>그리고 이름만으로 온도를 올리는 <b>Jane Doe</b> ${handleLink(a.janedoe)}. 연초부터 수많은 싱글 뱅어로 이름을 들으셨으리라고 믿습니다. 조금도 물러서지 않는 그녀만의 에너지! 사운드체크부터 이미 비프가 걱정되는 라인업이라는 사실만 전해드립니다.</p>
      <p>지금 가장 선명한 자기 팬덤을 가진 <b>Lil Soda</b> ${handleLink(a.soda)}가 첫 컴필레이션 참여 의사를 밝혀 주셨습니다. 상처 입은 멜로디와 거친 기타, 이번 무대는 톡톡 튀는 적나라함을 이어폰 밖에서 만나주세요.</p>
      <p>음악과 영화, 같지만 다른 두 무대에서 자신의 네임 밸류를 쌓아올린 <b>NAFI</b> ${handleLink(a.nafi)}. 방송 화면에 담기지 않는 엄청난 실력과 조금 더 솔직한 목소리를 준비하고 있습니다. 다재다능한 힙합 씬의 엔터테이너를 직접 만나보실 기회입니다.</p>
      <p>27년 들어 제일 떠오르는 크루인 FILEBREEDS의 수장, <b>Young ERROR</b> ${handleLink(a.error)}. 구시대의 EASY MESS를 보는 듯 트렌드를 만들어가는 그녀입니다. 설명은 짧게 할게요. 현장에서 직접 들어 보시면 바로 Mosh Pit이 펼쳐질 테니까요.</p>
      <p>마지막 <b>SECRET</b> 슬롯의 정체는 행사 당일에 확인해 주세요!</p>
      <p>📍 <b>SEOUL</b>　 📅 <b>2027.10.20</b><br />추가 일정·입장 안내·컴필레이션 공개 소식은 이 계정에서 이어집니다. 오래 기다린 만큼 더 많은 Banger로 준비해 드리겠습니다 🔥🔥</p>
      <p class="hashtag">#KTRACE2027 #KTRACE #한국힙합 #서울힙합 #Karylgram #LineupDrop</p>`;
  }
  const tagPositions = [null,{left:'9%',top:'21%'},{right:'8%',top:'28%'},{right:'8%',top:'23%'},{right:'8%',bottom:'21%'},{left:'12%',top:'40%'},{right:'10%',top:'19%'},{left:'9%',top:'21%'},{right:'13%',top:'67%'}];
  function positionStyle(n) { const p=tagPositions[n]; return p ? Object.entries(p).map(([k,v])=>`${k}:${v}`).join(';') : ''; }
  function slideHtml(n) {

    if (n === 0) return `<div class="poster-slide">${imageLayer(DATA.event.posterImage,'K-TRACE 2027 포스터',true)}<div class="slide-grid"></div><div class="poster-inner"><div class="poster-kicker">THE NEW WAVE OF KOREAN HIP-HOP</div><div class="poster-headline">K-<br /><span>TRACE</span><br />2027</div><div class="poster-info"><span>LINEUP REVEALED<br />SEOUL / LIVE + COMPILATION</span><b>10.20</b></div></div></div>`;
    if (n === 8) return `<div class="secret-slide">${imageLayer(DATA.event.secretImage,'비밀 출연진 포스터')}<div class="slide-grid"></div><div class="secret-mark">?</div><div class="secret-title">SECRET ARTIST</div><div class="secret-sub">THE FINAL NAME IS STILL UNDISCLOSED</div><button class="tagged-handle" style="right:10%;bottom:17%" data-action="secret" aria-label="비밀 아티스트 티저">${ico('at',15)}user?</button></div>`;
    const a = artists[n-1];
    return `<div class="artist-slide" style="${cssColor(a)}">${imageLayer(a.feedImage,`${a.name} K-TRACE 소개 사진`)}<div class="slide-grid"></div><span class="slide-number">K-TRACE / 0${n}</span><div class="slide-fallback"><div class="slide-genre">${esc(a.genre)}</div><div class="slide-stage-name">${esc(a.name)}</div><div class="slide-line">${esc(a.tagline)}</div></div><a href="${links(a)}" style="${positionStyle(n)}" class="tagged-handle">${ico('at',15)}${esc(a.handle)}</a></div>`;
  }
  function feedCarouselHtml() {
    const panels = Array.from({length:9},(_,n)=>`<div class="carousel-panel" data-carousel-index="${n}" aria-hidden="${n!==slideIndex}" ${n!==slideIndex?'inert':''}>${slideHtml(n)}</div>`).join('');
    return `<div class="carousel-track" id="carousel-track" style="transform:translate3d(-${slideIndex*100}%,0,0)">${panels}</div>
       <span class="slide-count" id="slide-count" aria-live="polite">${slideIndex+1} / 9</span>
       <button class="carousel-hit carousel-prev" data-action="slide-prev" aria-label="이전 피드" ${slideIndex===0?'disabled':''}>${ico('chevronLeft',25)}</button>
       <button class="carousel-hit carousel-next" data-action="slide-next" aria-label="다음 피드" ${slideIndex===8?'disabled':''}>${ico('chevronRight',25)}</button>`;
  }
  function dotsHtml() {return Array.from({length:9},(_,i)=>`<button type="button" data-action="dot" data-index="${i}" aria-label="피드 ${i+1}번" class="${i===slideIndex?'selected':''}"></button>`).join('');}
  function slideTransform(extraPx = 0, dragging = false) {
    const track=document.querySelector('#carousel-track');if(!track)return;
    track.classList.toggle('is-dragging',dragging);
    track.style.transform=`translate3d(calc(-${slideIndex*100}% + ${extraPx}px),0,0)`;
  }
  function updateCarousel(index) {
    slideIndex=Math.max(0,Math.min(8,index));
    slideTransform(0,false);
    const dots=document.querySelector('#carousel-dots');if(dots)dots.innerHTML=dotsHtml();
    const count=document.querySelector('#slide-count');if(count)count.textContent=`${slideIndex+1} / 9`;
    const previous=document.querySelector('.carousel-prev'),next=document.querySelector('.carousel-next');
    if(previous)previous.disabled=slideIndex===0;
    if(next)next.disabled=slideIndex===8;
    document.querySelectorAll('.carousel-panel').forEach((panel,n)=>{
      const visible=n===slideIndex;
      panel.setAttribute('aria-hidden',String(!visible));
      panel.inert=!visible;
    });
  }
  function bindSwipe() {
    const media=document.querySelector('#post-media');if(!media)return;
    let gesture=null,blockClick=false;
    const start=(x,y,id,type,target)=>{
      if(target.closest('a,button'))return;
      gesture={id,type,x,y,t:performance.now(),dragging:false};
    };
    const move=(x,y,id)=>{
      if(!gesture||gesture.id!==id)return false;
      const dx=x-gesture.x,dy=y-gesture.y;
      if(!gesture.dragging){
        if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){gesture=null;return false;}
        if(Math.abs(dx)<8||Math.abs(dx)<Math.abs(dy)*1.1)return false;
        gesture.dragging=true;
      }
      const edge=(slideIndex===0&&dx>0)||(slideIndex===8&&dx<0);
      slideTransform(edge?dx*.2:dx,true);
      return true;
    };
    const finish=(x,id,cancelled=false)=>{
      if(!gesture||gesture.id!==id)return;
      const g=gesture;gesture=null;
      if(!g.dragging)return;
      const dx=x-g.x,elapsed=Math.max(1,performance.now()-g.t);
      const advance=!cancelled&&(Math.abs(dx)>media.clientWidth*.16||(Math.abs(dx)>25&&Math.abs(dx)/elapsed>.45));
      if(advance)updateCarousel(slideIndex+(dx<0?1:-1));else slideTransform(0,false);
      blockClick=true;
      setTimeout(()=>{blockClick=false;},260);
    };
    media.addEventListener('touchstart',e=>{
      if(e.touches.length!==1)return;
      const t=e.touches[0];start(t.clientX,t.clientY,t.identifier,'touch',e.target);
    },{passive:true});
    media.addEventListener('touchmove',e=>{
      if(!gesture||gesture.type!=='touch')return;
      const t=Array.from(e.touches).find(t=>t.identifier===gesture.id);
      if(t&&move(t.clientX,t.clientY,t.identifier)&&e.cancelable)e.preventDefault();
    },{passive:false});
    media.addEventListener('touchend',e=>{
      if(!gesture||gesture.type!=='touch')return;
      const t=Array.from(e.changedTouches).find(t=>t.identifier===gesture.id);
      if(t)finish(t.clientX,t.identifier);
    },{passive:true});
    media.addEventListener('touchcancel',e=>{
      if(gesture?.type==='touch')finish(gesture.x,gesture.id,true);
    },{passive:true});
    media.addEventListener('pointerdown',e=>{
      if(e.pointerType==='touch'||!e.isPrimary||e.button!==0)return;
      start(e.clientX,e.clientY,e.pointerId,'pointer',e.target);
    });
    media.addEventListener('pointermove',e=>{
      if(!gesture||gesture.type!=='pointer'||gesture.id!==e.pointerId)return;
      const wasDragging=gesture.dragging;
      if(move(e.clientX,e.clientY,e.pointerId)&&!wasDragging)media.setPointerCapture?.(e.pointerId);
    });
    media.addEventListener('pointerup',e=>{if(gesture?.type==='pointer')finish(e.clientX,e.pointerId);});
    media.addEventListener('pointercancel',e=>{if(gesture?.type==='pointer')finish(e.clientX,e.pointerId,true);});
    media.addEventListener('lostpointercapture',e=>{if(gesture?.type==='pointer')finish(e.clientX,e.pointerId,true);});
    media.addEventListener('dragstart',e=>e.preventDefault());
    media.addEventListener('click',e=>{
      if(!blockClick)return;
      e.preventDefault();e.stopPropagation();blockClick=false;
    },true);
  }

  function storiesSection() {
    const rows=artists.map(a=>`<button class="story-item ${a.stories ? '' : 'no-stories'}" type="button" data-action="story-open" data-artist="${a.id}" aria-label="${esc(a.name)} ${a.stories ? `스토리 ${a.stories}개 보기` : '업로드한 스토리 없음'}"><span class="story-ring ${a.stories ? '' : 'seen'}" style="${cssColor(a)}"><span class="story-photo">${img(a.avatarImage,`${a.name} 프로필`,true)}${esc(a.name.slice(0,2).toUpperCase())}</span></span><span class="story-name">${esc(a.name)}</span></button>`).join('');
    return `<section class="stories-section" aria-label="아티스트 스토리"><div class="story-row">${rows}</div></section>`;
  }

  function trackWithDefaults(t) {return { ...t, album: t.album || '앨범 정보 추가 예정', year:t.year || '', cover:t.cover || null, lyrics:t.lyrics || [] };}
  function artistPage(a) {
    const tracks=a.tracks.map((raw,i)=>{const t=trackWithDefaults(raw);const disabled=!t.file;const playing=current?.artistId===a.id&&current.trackIndex===i;return `<button type="button" class="song-row ${playing?'is-playing':''}" data-action="play-track" data-artist="${a.id}" data-track="${i}" ${disabled?'disabled':''} aria-label="${disabled?'발매 예정':`${esc(a.name)} ${esc(t.title)} 재생`}"><div class="song-cover" style="--artist-tone:${a.tone};--artist-ink:${a.ink}">${imageLayer(t.cover,`${t.title} 앨범 커버`)}<span class="cover-letter">${i+1}</span></div><div class="song-copy"><div class="song-title">${esc(t.title)}</div><div class="song-meta">${t.explicit?'<span class="explicit" title="Explicit">E</span>':''}${disabled?'미공개 트랙':`${esc([t.album,t.year].filter(Boolean).join(' · '))}`}</div></div><div class="track-trail">${disabled?'<span class="placeholder-song">추가 예정</span>':playing?ico('volume',20):ico('play',19)}</div></button>`;}).join('');
    const similar=a.similar.map(s=>`<a class="similar-card" target="_blank" rel="noopener noreferrer" href="${esc(s.url)}" aria-label="YouTube에서 ${esc(s.name)} 음악 보기"><div class="similar-art"><b>${esc(s.name)}</b></div><div class="similar-title">${esc(s.name)}</div><div class="similar-sub">YouTube에서 보기 ${ico('arrowUpRight',12)}</div></a>`).join('');
    return `<div class="app-background music-background"><main class="site-shell artist-page view-enter" style="--artist-tone:${a.tone};--artist-ink:${a.ink}">
      <section class="artist-hero">${imageLayer(a.artistImage,`${a.name} 아티스트 프로필 촬영 이미지`,true)}<a class="artist-return" href="#/karylgram" aria-label="Karylgram 피드로 돌아가기">${ico('chevronLeft',26)}</a><div class="hero-panel"><h1 class="hero-name">${esc(a.name)}</h1></div></section>
      <section class="artist-data"><div class="artist-data-top"><div class="apple-mark">${ico('music',21)}</div><div><strong>${esc(a.name)} <span style="color:#a2a0aa;font-weight:600">· ${esc(a.korean)}</span></strong><small>${esc(a.label)}</small></div></div><p class="artist-bio">K-TRACE의 무대에서 ${esc(a.name)}의 음악을 만나보기 전, 인기곡을 직접 감상할 수 있습니다.</p></section>
      <section><div class="music-heading"><h2>인기곡</h2><small>TOP SONGS · 03</small></div><div class="song-list">${tracks}</div></section><div class="section-divider" style="margin-top:25px"></div>
      <section class="similar-section"><div class="music-heading" style="padding:7px 0 19px"><h2>유사한 아티스트</h2>${ico('chevronRight',20)}</div><div class="similar-grid">${similar}</div></section>
      <footer class="artist-foot">KARYL MUSIC 2027</footer>
    </main></div>`;
  }

  
  function activeInfo() { if(!current)return null;const a=getArtist(current.artistId);const t=a&&a.tracks[current.trackIndex];return t ? {a,t:trackWithDefaults(t)}:null; }
  async function playTrack(artistId,index) {
    const a=getArtist(artistId),t=a?.tracks[index];if(!t?.file)return;
    const same=current?.artistId===artistId && current.trackIndex===index;
    if(same){ if(audio.paused) await safePlay();else audio.pause();return;}
    audio.pause();audio.removeAttribute('src');audio.load();
    current={artistId,trackIndex:index};audio.src=encodeURI(t.file);audio.load();
    renderPlayer();

    if(route().page==='artist') {document.querySelectorAll('.song-row').forEach((r,i)=>{r.classList.toggle('is-playing',Number(r.dataset.track)===index&&r.dataset.artist===artistId);const trail=r.querySelector('.track-trail');if(trail&&!r.disabled)trail.innerHTML=r.classList.contains('is-playing')?ico('volume',20):ico('play',19);});}
    await safePlay();if(lyricsOpen)renderLyrics();
  }
  async function safePlay(){try{await audio.play()}catch(err){if(err.name!=='AbortError')toast('재생하려면 재생 버튼을 다시 눌러 주세요.');}renderPlayer();}
  function togglePlay(){if(!current)return;if(audio.paused)safePlay();else audio.pause();}
  function skipNext(){const info=activeInfo();if(!info)return;const list=info.a.tracks.map((t,i)=>({t,i})).filter(v=>v.t.file);const n=list.findIndex(v=>v.i===current.trackIndex);const next=list[(n+1)%list.length];if(next)playTrack(info.a.id,next.i);}
  function renderPlayer(){
    const inf=activeInfo();if(!inf){playerRoot.innerHTML='';return;}
    const {a,t}=inf;playerRoot.innerHTML=`<div class="mini-player" style="${cssColor(a)}"><div class="mini-progress" style="width:${audio.duration?Math.min(100,100*audio.currentTime/audio.duration):0}%"></div><div class="mini-art">${esc(a.name.slice(0,2).toUpperCase())}${t.cover?img(t.cover,`${t.title} 앨범 커버`):''}</div><button class="mini-info" data-action="lyrics-open" aria-label="${esc(t.title)} 가사 화면 열기"><strong>${esc(t.title)}</strong><span>${esc(a.name)} · 가사 보기</span></button><div class="mini-controls"><button class="mini-control play" data-action="play-toggle" aria-label="${audio.paused?'재생':'일시정지'}">${ico(audio.paused?'play':'pause',28,true)}</button><button class="mini-control" data-action="next-track" aria-label="다음 곡">${ico('skip',21,true)}</button></div></div>`;
  }
  function updatePlayerProgress(){const line=document.querySelector('.mini-progress');if(line)line.style.width=(audio.duration?Math.min(100,100*audio.currentTime/audio.duration):0)+'%';const seek=document.querySelector('#lyrics-seek');if(seek){seek.max=String(Number.isFinite(audio.duration)?audio.duration:100);seek.value=String(audio.currentTime||0);}const p=document.querySelector('#time-now');if(p)p.textContent=moneyTime(audio.currentTime);const q=document.querySelector('#time-rest');if(q)q.textContent='-'+moneyTime(Math.max(0,(audio.duration||0)-audio.currentTime));updateLyricsActive();}
  function lyricsLines(t){return Array.isArray(t.lyrics)?t.lyrics.map(l=>typeof l==='string'?{time:null,text:l}:l).filter(l=>l&&typeof l.text==='string'&&l.text.length>0):[];}
  function renderLyrics(){
    if(!lyricsOpen)return;const inf=activeInfo();if(!inf){closeOverlay();return;}
    const {a,t}=inf;const lines=lyricsLines(t);const synced=lines.some(line=>typeof line.time==="number"&&Number.isFinite(line.time));currentLyric=-1;
    overlayRoot.innerHTML=`<div class="overlay" data-overlay="lyrics"><section class="lyrics-sheet${t.cover?' has-art':''}" style="${cssColor(a)}" role="dialog" aria-modal="true" aria-label="${esc(t.title)} 가사">
       ${t.cover?`<div class="lyrics-art-bg" aria-hidden="true">${img(t.cover,'')}</div>`:''}
       <header class="lyrics-header"><button class="close" data-action="lyrics-close" aria-label="가사 닫기">${ico('chevronLeft',23)}</button><div class="lyrics-label">NOW PLAYING · LYRICS</div><button class="close" data-action="lyrics-close" aria-label="닫기">${ico('close',19)}</button></header>
       <div class="lyrics-lines ${synced?'is-synced':'is-unsynced'}" id="lyrics-lines">${lines.length?lines.map((line,i)=>`<div class="lyric-line${line.text.trim()===''?' is-break':''}" data-line="${i}">${esc(line.text)}</div>`).join(''):`<div class="lyrics-empty"><div class="empty-kicker">THE WORDS WILL FOLLOW</div><h2>${esc(t.title)}</h2><p>아직 가사가 등록되지 않았어요.<br />추후 data.js의 해당 곡에 lyrics를 입력하면<br />이 공간에 가사가 표시됩니다.</p></div>`}</div>
       <div class="lyrics-ctrl"><div class="full-track"><div class="full-art">${esc(a.name.slice(0,2).toUpperCase())}${t.cover?img(t.cover,`${t.title} 앨범 커버`):''}</div><div><strong>${esc(t.title)}</strong><span>${esc(a.name)} · ${esc(t.album)}</span></div></div>
       <input id="lyrics-seek" class="seek-range" type="range" min="0" max="${Number.isFinite(audio.duration)?audio.duration:100}" value="${audio.currentTime||0}" step="0.1" aria-label="재생 위치" /><div class="time-pair"><span id="time-now">${moneyTime(audio.currentTime)}</span><span id="time-rest">-${moneyTime(Math.max(0,(audio.duration||0)-audio.currentTime))}</span></div>
       <div class="full-controls"><button class="full-control" data-action="lyrics-close" aria-label="플레이어 닫기">${ico('chevronLeft',26)}</button><button class="full-control play" data-action="play-toggle" aria-label="재생·일시정지">${ico(audio.paused?'play':'pause',28,true)}</button><button class="full-control" data-action="next-track" aria-label="다음 노래">${ico('skip',26,true)}</button></div></div>
      </section></div>`;
    document.body.classList.add('modal-open');updatePlayerProgress();
  }
  function updateLyricsActive(){if(!lyricsOpen)return;const inf=activeInfo();if(!inf)return;const lines=lyricsLines(inf.t);if(!lines.length||!lines.some(l=>typeof l.time==='number'&&Number.isFinite(l.time)))return;let index=-1;for(let i=0;i<lines.length;i++)if((Number(lines[i].time)||0)<=audio.currentTime)index=i;if(index===currentLyric)return;currentLyric=index;const nodes=document.querySelectorAll('.lyric-line');nodes.forEach((el,i)=>el.classList.toggle('active',i===index));if(index>=0)nodes[index]?.scrollIntoView({block:'center',behavior:'smooth'});}
  function closeOverlay(){lyricsOpen=false;story=null;stopStoryTimer();overlayRoot.innerHTML='';document.body.classList.remove('modal-open');}

  
  function storyArtists(){return artists.filter(a=>a.stories>0);}
  function openStory(id,index=0){const a=getArtist(id);if(!a)return;lyricsOpen=false;if(!a.stories){stopStoryTimer();story=null;overlayRoot.innerHTML=`<div class="overlay story-overlay" data-overlay="story"><section class="story-sheet empty-story" role="dialog" aria-modal="true" aria-label="${esc(a.name)} 스토리 없음"><div class="story-header"><div class="story-avatar">${img(a.avatarImage,`${a.name} 프로필`,true)}</div><div class="story-name-info">${esc(a.handle)}</div><button class="story-close" data-action="story-close" aria-label="닫기">${ico('close',24)}</button></div><div class="story-empty-message">업로드한 Stories가 없습니다</div></section></div>`;document.body.classList.add('modal-open');handleMissingImages(overlayRoot);return;}story={artistId:id,index};storyProgress=0;storyPaused=false;renderStory();}
  function stopStoryTimer(){if(storyTimer){clearInterval(storyTimer);storyTimer=null;}}
  function startStoryTimer(){stopStoryTimer();storyTimer=setInterval(()=>{if(storyPaused||!story)return;storyProgress+=100/5800;const prog=overlayRoot.querySelector('.story-segment.current span');if(prog)prog.style.width=`${Math.min(100,storyProgress*100)}%`;if(storyProgress>=1)nextStory(1);},100);}
  function nextStory(delta){if(!story)return;const a=getArtist(story.artistId);let index=story.index+delta;if(index>=0&&index<a.stories){story.index=index;}else{const group=storyArtists();let groupIndex=group.findIndex(x=>x.id===story.artistId)+delta;if(groupIndex<0){closeOverlay();return;}if(groupIndex>=group.length){closeOverlay();return;}const target=group[groupIndex];story.artistId=target.id;story.index=delta>0?0:target.stories-1;}storyProgress=0;renderStory();}
  
  const STORY_LAYOUTS = {
    sl00z: [{text:'again.',position:'lower-left',style:'minimal'},{text:'04:13',position:'upper-right',style:'timestamp'}],
    kayo: [{text:'nice weather ☀️',position:'upper-center',style:'soft'}],
    jaeone: [{text:'@groundwork',position:'lower-left',style:'mention'},{text:'수고했다',position:'lower-center',style:'minimal'}],
    janedoe: [{text:'뭐',position:'upper-right',style:'minimal'},{text:'out.',position:'upper-center',style:'bold'},{text:'이게 맛있음',position:'lower-center',style:'minimal'},null,{text:'REC 🔴',position:'upper-right',style:'minimal'},{text:'ㅋㅋ',position:'lower-center',style:'bold'},null,null,{text:'야',position:'mid-center',style:'bold'}],
    soda: [{text:'03:47',position:'upper-right',style:'timestamp'},{music:{title:'Nirvana',artist:'Scails (feat. 고스트클럽)'},position:'mid-center'},{text:'곡 안 나옴',position:'lower-left',style:'minimal'},{text:'나만 진심이지',position:'mid-center',style:'minimal'},{text:'집 가기 싫다',position:'lower-center',style:'minimal'}],
    nafi: [{text:'thank you always ♡',position:'lower-center',style:'soft'},{text:'브랜드 행사',position:'upper-center',style:'soft'},{text:'오늘도 감사합니다 🤍',position:'lower-center',style:'soft'}]
  };
  function storyContent(artist,index,src){
    if(artist.id==='janedoe'&&index===3)return '<div class="story-plain-black"><span>클럽에서 봤다고 디엠좀하지마 ㅆ발<br>안간다</span></div>';
    if(!src)return `<div class="story-center"><div class="story-index">${String(index+1).padStart(2,'0')}</div><div class="story-main-label">${esc(artist.name)}</div><div class="story-caption">STORY / ${String(index+1).padStart(2,'0')}</div></div>`;
    const item=STORY_LAYOUTS[artist.id]?.[index];if(!item)return '';
    const content=item.music?`<span class="story-music-icon">♫</span><span class="story-music-copy"><strong>${esc(item.music.title)}</strong><small>${esc(item.music.artist)}</small></span>`:esc(item.text);
    return `<div class="story-editorial ${item.position||'mid-center'} ${item.music?'music':item.style||'minimal'}">${content}</div>`;
  }
  function renderStory(){if(!story)return;const a=getArtist(story.artistId),n=story.index,src=a.storyImages?.[n]||null;
    overlayRoot.innerHTML=`<div class="overlay story-overlay" data-overlay="story"><section class="story-sheet" style="${cssColor(a)}" role="dialog" aria-modal="true" aria-label="${esc(a.name)} 스토리 ${n+1}/${a.stories}">
       ${imageLayer(src,`${a.name} 스토리 ${n+1}`)}
       <div class="story-progress">${Array.from({length:a.stories},(_,i)=>`<div class="story-segment ${i===n?'current':''}"><span style="width:${i<n?'100%':'0%'}"></span></div>`).join('')}</div>
       <div class="story-header"><div class="story-avatar">${img(a.avatarImage,`${a.name} 프로필`,true)}<span class="story-avatar-fallback">${esc(a.name.slice(0,2).toUpperCase())}</span></div><div class="story-name-info">${esc(a.handle)} <span>${n+1} / ${a.stories}</span></div><button class="story-close" data-action="story-close" aria-label="스토리 닫기">${ico('close',24)}</button></div>
       ${storyContent(a,n,src)}
       <button class="story-tap prev" data-action="story-prev" aria-label="이전 스토리"></button><button class="story-tap next" data-action="story-next" aria-label="다음 스토리"></button><div class="story-foot">메세지 보내기</div>
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
  warmSiteImages();
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
  render();
})();
