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
    if (msg) {
      msg.textContent = c.invitation.message;
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
    if (countdownSection) {
      const calendarWrapper = document.createElement('div');
      calendarWrapper.className = 'wedding-calendar';
      
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
      
      countdownSection.insertBefore(calendarWrapper, countdownSection.firstChild);
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
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d
