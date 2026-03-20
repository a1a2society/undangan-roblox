const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  {
    threshold: 0.14,
  }
);

revealElements.forEach((element) => revealObserver.observe(element));

const bgMusic = document.getElementById('bg-music');

if (bgMusic) {
  bgMusic.volume = 0.45;

  const tryPlayMusic = async () => {
    try {
      await bgMusic.play();
      document.removeEventListener('pointerdown', tryPlayMusic);
      document.removeEventListener('keydown', tryPlayMusic);
      document.removeEventListener('touchstart', tryPlayMusic);
    } catch {
      // Keep listeners until browser allows audio playback.
    }
  };

  document.addEventListener('pointerdown', tryPlayMusic, { passive: true });
  document.addEventListener('keydown', tryPlayMusic);
  document.addEventListener('touchstart', tryPlayMusic, { passive: true });
}

const countdownPanel = document.querySelector('.countdown-panel');

if (countdownPanel) {
  const targetDate = new Date(countdownPanel.dataset.date).getTime();
  const days = document.getElementById('days');
  const hours = document.getElementById('hours');
  const minutes = document.getElementById('minutes');
  const seconds = document.getElementById('seconds');

  const toTwoDigits = (value) => String(value).padStart(2, '0');

  const updateCountdown = () => {
    const now = Date.now();
    const distance = targetDate - now;

    if (distance <= 0) {
      days.textContent = '00';
      hours.textContent = '00';
      minutes.textContent = '00';
      seconds.textContent = '00';
      return;
    }

    const dayMs = 1000 * 60 * 60 * 24;
    const hourMs = 1000 * 60 * 60;
    const minuteMs = 1000 * 60;

    const dayValue = Math.floor(distance / dayMs);
    const hourValue = Math.floor((distance % dayMs) / hourMs);
    const minuteValue = Math.floor((distance % hourMs) / minuteMs);
    const secondValue = Math.floor((distance % minuteMs) / 1000);

    days.textContent = toTwoDigits(dayValue);
    hours.textContent = toTwoDigits(hourValue);
    minutes.textContent = toTwoDigits(minuteValue);
    seconds.textContent = toTwoDigits(secondValue);
  };

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

const rsvpForm = document.getElementById('rsvp-form');

if (rsvpForm) {
  const guestNameInput = document.getElementById('guest-name');
  const guestCountInput = document.getElementById('guest-count');
  const attendanceInput = document.getElementById('attendance');
  const attendanceTimeInput = document.getElementById('attendance-time');
  const guestNoteInput = document.getElementById('guest-note');
  const waShareButton = document.getElementById('wa-share');
  const resultEl = document.getElementById('rsvp-result');
  const storageKey = 'fadil-bila-rsvp-premium';

  const setResult = (message, isError = false) => {
    resultEl.textContent = message;
    resultEl.classList.toggle('is-error', isError);
  };

  const toAttendanceLabel = (value) => (value === 'hadir' ? 'Hadir' : 'Berhalangan');

  const buildMessage = ({ name, count, attendance, time, note }) => {
    const header = `Halo, saya ${name}.`;
    const status = `Konfirmasi: ${toAttendanceLabel(attendance)}.`;
    const guestTotal = `Jumlah tamu: ${count} orang.`;
    const estimatedTime = `Estimasi hadir: ${time}.`;
    const event = 'Acara: resepsi Fadil & Bila di Mount Alora, Sabtu 21 Maret 2026.';
    const noteLine = note ? `Ucapan: ${note}` : '';

    return [header, status, guestTotal, estimatedTime, event, noteLine].filter(Boolean).join(' ');
  };

  const activateWhatsAppButton = (message) => {
    waShareButton.href = `https://wa.me/?text=${encodeURIComponent(message)}`;
    waShareButton.classList.remove('is-disabled');
    waShareButton.removeAttribute('aria-disabled');
  };

  const restoreSavedData = () => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      guestNameInput.value = parsed.name || '';
      guestCountInput.value = parsed.count || '';
      attendanceInput.value = parsed.attendance || '';
      attendanceTimeInput.value = parsed.time || '';
      guestNoteInput.value = parsed.note || '';

      if (parsed.name && parsed.count && parsed.attendance && parsed.time) {
        activateWhatsAppButton(buildMessage(parsed));
        setResult('Data konfirmasi terakhir berhasil dimuat.');
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
  };

  restoreSavedData();

  rsvpForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const payload = {
      name: guestNameInput.value.trim(),
      count: guestCountInput.value,
      attendance: attendanceInput.value,
      time: attendanceTimeInput.value,
      note: guestNoteInput.value.trim(),
    };

    if (!payload.name || !payload.count || !payload.attendance || !payload.time) {
      setResult('Mohon lengkapi nama, jumlah tamu, status, dan estimasi kehadiran.', true);
      return;
    }

    const message = buildMessage(payload);

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        ...payload,
        updatedAt: new Date().toISOString(),
      })
    );

    activateWhatsAppButton(message);
    setResult(`Terima kasih, ${payload.name}. Konfirmasi Anda sudah tersimpan.`);
  });
}
