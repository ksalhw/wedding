/**
 * Modern Minimal Wedding Invitation - Script
 */

(function () {
  'use strict';

  // ── Helpers ──
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[d.getDay()];
    return { year, month, day, dayName, date: d };
  }

  function formatTime(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h < 12 ? '오전' : '오후';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${period} ${hour12}시${m > 0 ? ' ' + m + '분' : ''}`;
  }

  // ── Image Loading ──
  function loadImagesFromFolder(folder, maxAttempts = 50) {
    return new Promise(resolve => {
        const images = [];
        let current = 1;
        let consecutiveFails = 0;

        function tryNext() {
            if (current > maxAttempts || consecutiveFails >= 3) {
                resolve(images);
                return;
            }
            const img = new Image();
            const path = `images/${folder}/${current}.jpg`;
            img.onload = function() {
                images.push(path);
                consecutiveFails = 0;
                current++;
                tryNext();
            };
            img.onerror = function() {
                consecutiveFails++;
                current++;
                tryNext();
            };
            img.src = path;
        }

        tryNext();
    });
  }

  // ── Toast ──
  let toastTimer = null;
  function showToast(message) {
    let toast = $('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    clearTimeout(toastTimer);
    toast.classList.remove('show');
    requestAnimationFrame(() => {
      toast.classList.add('show');
      toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
    });
  }

  // ── Copy to clipboard ──
  async function copyToClipboard(text, successMsg) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMsg || '복사되었습니다');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast(successMsg || '복사되었습니다');
    }
  }

  // ── Curtain / Intro Overlay ──
  function initCurtain(c, dateInfo, timeText) {
    const overlay = $('#curtain-overlay');
    if (!overlay) return;

    if (!c.useCurtain) {
      overlay.remove();
      return;
    }

    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const names = $('.curtain-names', overlay);
    const date = $('.curtain-date', overlay);
    if (names) names.textContent = `${c.groom.nameEn} & ${c.bride.nameEn}`;
    if (date) date.textContent = `${dateInfo.year}. ${String(dateInfo.month).padStart(2, '0')}. ${String(dateInfo.day).padStart(2, '0')}`;

    const btn = $('#curtain-open-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        overlay.classList.add('fade-out');
        document.body.style.overflow = '';
        overlay.addEventListener('transitionend', () => {
          overlay.remove();
        }, { once: true });
      });
    }
  }

  // ── Build Page ──
  async function init() {
    if (typeof CONFIG === 'undefined') return;

    const c = CONFIG;
    const dateInfo = formatDate(c.wedding.date);
    const timeText = formatTime(c.wedding.time);

    initCurtain(c, dateInfo, timeText);

    buildHero(c, dateInfo, timeText);
    buildInvitation(c, dateInfo, timeText);
    buildCountdown(c, dateInfo);
    buildStoryText(c);
    buildLocation(c);
    buildContact(c); 
    buildAccount(c);
    initScrollAnimations();
    initModal();

    showLoadingState();

    const [storyImages, galleryImages] = await Promise.all([
      loadImagesFromFolder('story'),
      loadImagesFromFolder('gallery')
    ]);

    buildStoryImages(storyImages);
    buildGallery(galleryImages);

    hideLoadingState();
    reobserveAnimations();
  }

  // ── Loading State ──
  function showLoadingState() {
    const storyImagesEl = $('.story-images');
    const galleryGrid = $('.gallery-grid');
    if (storyImagesEl) storyImagesEl.classList.add('loading');
    if (galleryGrid) galleryGrid.classList.add('loading');
  }

  function hideLoadingState() {
    const storyImagesEl = $('.story-images');
    const galleryGrid = $('.gallery-grid');
    if (storyImagesEl) storyImagesEl.classList.remove('loading');
    if (galleryGrid) galleryGrid.classList.remove('loading');
  }

  // ── Hero ──
  function buildHero(c, dateInfo, timeText) {
    const heroImg = $('.hero-image');
    if (heroImg) {
      heroImg.src = 'images/hero/1.jpg';
      heroImg.alt = `${c.groom.name} & ${c.bride.name}`;
    }

    const heroNames = $('.hero-names');
    if (heroNames) {
      heroNames.innerHTML = `${c.groom.nameEn}<span class="ampersand">&</span>${c.bride.nameEn}`;
    }

    const heroDate = $('.hero-date');
    if (heroDate) {
      heroDate.textContent = `${dateInfo.year}. ${String(dateInfo.month).padStart(2, '0')}. ${String(dateInfo.day).padStart(2, '0')}. ${dateInfo.dayName}요일 ${timeText}`;
    }

    const heroVenue = $('.hero-venue');
    if (heroVenue) {
      heroVenue.textContent = c.wedding.venue;
    }
  }

  // ── Invitation ──
  function buildInvitation(c, dateInfo, timeText) {
    const msg = $('.invitation-message');
    if (msg && c.invitation.message) {
      msg.innerHTML = c.invitation.message.replace(/\n/g, '<br>');
    }

    const parents = $('.invitation-parents');
    if (parents) {
      function parentLine(side) {
        const fatherName = side.father;
        const motherName = side.mother;
        const fatherDec = side.fatherDeceased ? ' class="deceased"' : '';
        const motherDec = side.motherDeceased ? ' class="deceased"' : '';
        const relation = side === c.groom ? '장남' : '장녀';
        
        return `<span${fatherDec}>${fatherName}</span> <span class="dot"></span> <span${motherDec}>${motherName}</span><span style="color:#999;margin-left:6px;margin-right:6px">${relation}</span> <strong>${side.name}</strong>`;
      }
      parents.innerHTML = `
        <div class="parent-line">${parentLine(c.groom)}</div>
        <div class="parent-line">${parentLine(c.bride)}</div>
      `;
    }
  }

  // ── Countdown & Calendar ──
  function buildCountdown(c, dateInfo) {
    const countdownSection = $('.section.countdown');
    const buttonsWrapper = $('.countdown-calendar-buttons');
    
    if (countdownSection && buttonsWrapper) {
      const calendarWrapper = document.createElement('div');
      calendarWrapper.className = 'wedding-calendar';
      calendarWrapper.style.width = '100%';
      calendarWrapper.style.order = '0';
      
      const year = dateInfo.date.getFullYear();
      const month = dateInfo.date.getMonth();
      const targetDay = dateInfo.date.getDate();
      
      const firstDayInstance = new Date(year, month, 1);
      const startDayIndex = firstDayInstance.getDay();
      const totalDays = new Date(year, month + 1, 0).getDate();
      
      const monthLabel = `${year}년 ${month + 1}월`;
      const daysHeaders = ['일', '월', '화', '수', '목', '금', '토'].map(d => `<span class="days-header">${d}</span>`).join('');
      
      let blankCells = '';
      for (let i = 0; i < startDayIndex; i++) {
        blankCells += '<span class="day-empty"></span>';
      }
      
      let dayCells = '';
      for (let day = 1; day <= totalDays; day++) {
        const isWedding = day === targetDay ? ' wedding-day' : '';
        dayCells += `<span class="day-num${isWedding}"><span>${day}</span></span>`;
      }
      
      calendarWrapper.innerHTML = `
        <div class="calendar-month">${monthLabel}</div>
        <div class="calendar-grid">
          ${daysHeaders}
          ${blankCells}
          ${dayCells}
        </div>
      `;
      
      countdownSection.insertBefore(calendarWrapper, buttonsWrapper);
    }

    const [h, m] = c.wedding.time.split(':').map(Number);
    const weddingDate = new Date(dateInfo.date);
    weddingDate.setHours(h, m, 0, 0);

    function update() {
      const now = new Date();
      const diff = weddingDate - now;

      const daysEl = $('#cd-days');
      const hoursEl = $('#cd-hours');
      const minsEl = $('#cd-mins');
      const secsEl = $('#cd-secs');
      const ddayEl = $('.countdown-dday');

      if (diff <= 0) {
        if (daysEl) daysEl.textContent = '0';
        if (hoursEl) hoursEl.textContent = '0';
        if (minsEl) minsEl.textContent = '0';
        if (secsEl) secsEl.textContent = '0';
        if (ddayEl) ddayEl.textContent = '결혼식 당일입니다';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (daysEl) daysEl.textContent = days;
      if (hoursEl) hoursEl.textContent = hours;
      if (minsEl) minsEl.textContent = mins;
      if (secsEl) secsEl.textContent = secs;

      if (ddayEl) {
        ddayEl.textContent = `결혼식까지 D-${days}`;
      }
    }

    update();
    setInterval(update, 1000);

    const gcalBtn = $('#btn-gcal');
    const icalBtn = $('#btn-ical');

    if (gcalBtn) {
      gcalBtn.addEventListener('click', () => {
        const start = formatGoogleDate(weddingDate);
        const end = formatGoogleDate(new Date(weddingDate.getTime() + 2 * 60 * 60 * 1000));
        const title = encodeURIComponent(`${c.groom.name} ♥ ${c.bride.name} 결혼식`);
        const location = encodeURIComponent(`${c.wedding.venue} ${c.wedding.address}`);
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${location}`;
        window.open(url, '_blank');
      });
    }

    if (icalBtn) {
      icalBtn.addEventListener('click', () => {
        const start = formatICSDate(weddingDate);
        const end = formatICSDate(new Date(weddingDate.getTime() + 2 * 60 * 60 * 1000));
        const ics = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//Wedding//Invitation//KO',
          'BEGIN:VEVENT',
          `DTSTART:${start}`,
          `DTEND:${end}`,
          `SUMMARY:${c.groom.name} ♥ ${c.bride.name} 결혼식`,
          `LOCATION:${c.wedding.venue} ${c.wedding.address}`,
          'END:VEVENT',
          'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'wedding.ics';
        link.click();
        URL.revokeObjectURL(link.href);
      });
    }
  }

  function formatGoogleDate(d) {
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  function formatICSDate(d) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  }

  // ── Story Text ──
  function buildStoryText(c) {
    const title = $('#story-title');
    if (title) title.textContent = c.story.title;

    const content = $('.story-content');
    if (content && c.story.content) {
      content.innerHTML = c.story.content.replace(/\n/g, '<br>');
    }
  }

  // ── Story Images ──
  function buildStoryImages(storyImages) {
    const container = $('.story-images');
    if (!container) return;

    if (storyImages.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.innerHTML = storyImages.map((src, i) =>
      `<div class="story-image-item">
        <img src="${src}" alt="Our story ${i + 1}" loading="lazy">
      </div>`
    ).join('');
  }

  // ── Gallery ──
  let galleryAllImages = [];

  function buildGallery(images) {
    const grid = $('.gallery-grid');
    if (!grid) return;

    galleryAllImages = images;

    if (images.length === 0) {
      const gallerySection = grid.closest('.gallery');
      if (gallerySection) gallerySection.style.display = 'none';
      return;
    }

    const initialCount = 6;

    function renderImages(count) {
      grid.innerHTML = images.slice(0, count).map((src, i) =>
        `<div class="gallery-item" data-index="${i}">
          <img src="${src}" alt="Gallery photo ${i + 1}" loading="lazy">
        </div>`
      ).join('');

      $$('.gallery-item', grid).forEach(item => {
        item.addEventListener('click', () => {
          openModal(images, parseInt(item.dataset.index));
        });
      });
    }

    renderImages(Math.min(initialCount, images.length));

    const moreBtn = $('.btn-gallery-more');
    if (moreBtn) {
      if (images.length <= initialCount) {
        moreBtn.parentElement.style.display = 'none';
      } else {
        let expanded = false;
        moreBtn.addEventListener('click', () => {
          if (!expanded) {
            renderImages(images.length);
            moreBtn.textContent = '접기';
            expanded = true;
          } else {
            renderImages(initialCount);
            moreBtn.textContent = '더보기';
            expanded = false;
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }
    }
  }

  // ── Photo Modal (스르륵 페이드 효과 포함) ──
  let currentModalImages = [];
  let currentModalIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;

  function initModal() {
    const overlay = $('.modal-overlay');
    if (!overlay) return;

    const closeBtn = $('.modal-close');
    const prevBtn = $('.modal-prev');
    const nextBtn = $('.modal-next');
    const swipeArea = $('.modal-swipe-area');

    closeBtn?.addEventListener('click', closeModal);
    prevBtn?.addEventListener('click', () => navigateModal(-1));
    nextBtn?.addEventListener('click', () => navigateModal(1));

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target === swipeArea) closeModal();
    });

    swipeArea?.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    swipeArea?.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        navigateModal(diff > 0 ? 1 : -1);
      }
    }, { passive: true });

    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('active')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') navigateModal(-1);
      if (e.key === 'ArrowRight') navigateModal(1);
    });
  }

  function openModal(images, index) {
    currentModalImages = images;
    currentModalIndex = index;

    const overlay = $('.modal-overlay');
    if (!overlay) return;

    updateModalImage(false);
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const overlay = $('.modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function navigateModal(dir) {
    currentModalIndex += dir;
    if (currentModalIndex < 0) currentModalIndex = currentModalImages.length - 1;
    if (currentModalIndex >= currentModalImages.length) currentModalIndex = 0;
    updateModalImage(true);
  }

  function updateModalImage(withFade = false) {
    const img = $('.modal-image');
    const counter = $('.modal-counter');
    
    if (!img) return;

    if (withFade) {
      img.classList.add('fade');
      setTimeout(() => {
        img.src = currentModalImages[currentModalIndex];
        img.alt = `Photo ${currentModalIndex + 1}`;
        img.classList.remove('fade');
      }, 200);
    } else {
      img.classList.remove('fade');
      img.src = currentModalImages[currentModalIndex];
      img.alt = `Photo ${currentModalIndex + 1}`;
    }

    if (counter) {
      counter.textContent = `${currentModalIndex + 1} / ${currentModalImages.length}`;
    }
  }

  // ── Location ──
  function buildLocation(c) {
    const venueName = $('.location-venue-name');
    const venueHall = $('.location-venue-hall');
    const address = $('.location-address');
    const tel = $('.location-tel');
    const mapImg = $('.location-map-image img');

    if (venueName) venueName.textContent = c.wedding.venue;
    if (venueHall) venueHall.textContent = c.wedding.hall;
    if (address) address.textContent = c.wedding.address;
    if (tel && c.wedding.tel) {
      tel.innerHTML = `<a href="tel:${c.wedding.tel}">${c.wedding.tel}</a>`;
    }
    if (mapImg) {
      mapImg.src = 'images/location/1.jpg';
      mapImg.alt = `${c.wedding.venue} 약도`;
    }

    const copyBtn = $('#btn-copy-address');
    copyBtn?.addEventListener('click', () => {
      copyToClipboard(c.wedding.address, '주소가 복사되었습니다');
    });

    const kakaoLink = $('#link-kakao-map');
    const naverLink = $('#link-naver-map');
    if (kakaoLink && c.wedding.mapLinks.kakao) {
      kakaoLink.href = c.wedding.mapLinks.kakao;
    }
    if (naverLink && c.wedding.mapLinks.naver) {
      naverLink.href = c.wedding.mapLinks.naver;
    }
  }

  // ── Contact ──
  function buildContact(c) {
    const groomList = c.contact?.groom || c.contacts?.groom;
    const brideList = c.contact?.bride || c.contacts?.bride;

    if (groomList) buildContactGroup('groom', groomList);
    if (brideList) buildContactGroup('bride', brideList);
  }

  function buildContactGroup(side, contactList) {
    const group = $(`#contact-${side}`);
    if (!group) return;

    const toggle = $('.account-group-toggle', group) || $('.contact-group-toggle', group);
    const list = $('.contact-list', group);

    if (toggle) {
      toggle.addEventListener('click', () => {
        if (group.classList.contains('open')) {
          group.classList.remove('open');
          if (list) list.style.maxHeight = '0';
        } else {
          group.classList.add('open');
          if (list) list.style.maxHeight = list.scrollHeight + 'px';
        }
      });
    }

    if (list && contactList) {
      list.innerHTML = contactList.map(person => {
        const phoneNumber = person.tel || person.phone;
        if (!phoneNumber) return ''; 
        return `
          <div class="contact-item">
            <div class="contact-info">
              <span class="contact-role">${person.role}</span>
              <div class="contact-detail"><span class="contact-name">${person.name}</span></div>
            </div>
            <div class="contact-buttons">
              <a href="tel:${phoneNumber}" class="btn-action-call">전화</a>
              <a href="sms:${phoneNumber}" class="btn-action-sms">문자</a>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // ── Account ──
  function buildAccount(c) {
    if (c.accounts?.groom) buildAccountGroup('groom', c.accounts.groom, `신랑측 계좌번호`);
    if (c.accounts?.bride) buildAccountGroup('bride', c.accounts.bride, `신부측 계좌번호`);
  }

  function buildAccountGroup(side, accounts, label) {
    const group = $(`#account-${side}`);
    if (!group) return;

    const toggle = $('.account-group-toggle', group);
    const list = $('.account-list', group);

    if (toggle) {
      const labelEl = toggle.querySelector('.toggle-label');
      if (labelEl) labelEl.textContent = label;

      toggle.addEventListener('click', () => {
        if (group.classList.contains('open')) {
          group.classList.remove('open');
          if (list) list.style.maxHeight = '0';
        } else {
          group.classList.add('open');
          if (list) list.style.maxHeight = list.scrollHeight + 'px';
        }
      });
    }

    if (list) {
      list.innerHTML = accounts.map(acc => {
        const cleanAccountNumber = acc.number.replace(/[^0-9-]/g, '');

        return `<div class="account-item">
          <div class="account-info">
            <div class="account-role">${acc.role}</div>
            <div class="account-detail">
              <span class="account-name">${acc.name}</span>
              ${acc.bank} ${acc.number}
            </div>
          </div>
          <button class="btn-copy-account" data-copy="${cleanAccountNumber}">복사</button>
        </div>`;
      }).join('');

      $$('.btn-copy-account', list).forEach(btn => {
        btn.addEventListener('click', () => {
          copyToClipboard(btn.dataset.copy, '계좌번호가 복사되었습니다');
        });
      });
    }
  }

  // ── Scroll Animations ──
  let scrollObserver = null;

  function initScrollAnimations() {
    scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            scrollObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    $$('.fade-in').forEach(el => scrollObserver.observe(el));
  }

  function reobserveAnimations() {
    if (!scrollObserver) return;
    $$('.fade-in:not(.visible)').forEach(el => scrollObserver.observe(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
