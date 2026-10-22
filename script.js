// ========================================================
// قاعدة بيانات المدن والإحداثيات وطرق الحساب
// ==========================================
const CITIES = {
    // مدن العراق
    karbala: { name: "كربلاء المقدسة", country: "العراق", lat: 32.61603, lon: 44.02488, method: 0 },
    najaf: { name: "النجف الأشرف", country: "العراق", lat: 31.9959, lon: 44.3148, method: 0 },
    baghdad: { name: "بغداد", country: "العراق", lat: 33.3152, lon: 44.3661, method: 0 },
    basra: { name: "البصرة", country: "العراق", lat: 30.5081, lon: 47.7835, method: 0 },
    erbil: { name: "أربيل", country: "العراق", lat: 36.1911, lon: 44.0091, method: 3 },
    mosul: { name: "الموصل", country: "العراق", lat: 36.3400, lon: 43.1300, method: 3 },
    samarra: { name: "سامراء", country: "العراق", lat: 34.1983, lon: 43.8742, method: 0 },
    hilla: { name: "بابل (الحلة)", country: "العراق", lat: 32.4637, lon: 44.4196, method: 0 },
    nasiriyah: { name: "ذي قار (الناصرية)", country: "العراق", lat: 31.0579, lon: 46.2573, method: 0 },
    sulaymaniyah: { name: "السليمانية", country: "العراق", lat: 35.5606, lon: 45.4338, method: 3 },
    kirkuk: { name: "كركوك", country: "العراق", lat: 35.4681, lon: 44.3922, method: 3 },

    // مدن وعواصم إسلامية
    makkah: { name: "مكة المكرمة", country: "السعودية", lat: 21.4225, lon: 39.8262, method: 4 },
    madinah: { name: "المدينة المنورة", country: "السعودية", lat: 24.4686, lon: 39.6142, method: 4 },
    jerusalem: { name: "القدس الشريف", country: "فلسطين", lat: 31.7683, lon: 35.2137, method: 3 },
    damascus: { name: "دمشق", country: "سوريا", lat: 33.5138, lon: 36.2765, method: 3 },
    beirut: { name: "بيروت", country: "لبنان", lat: 33.8938, lon: 35.5018, method: 0 },
    amman: { name: "عمان", country: "الأردن", lat: 31.9539, lon: 35.9106, method: 3 },
    cairo: { name: "القاهرة", country: "مصر", lat: 30.0444, lon: 31.2357, method: 5 },
    kuwait: { name: "الكويت", country: "الكويت", lat: 29.3759, lon: 47.9774, method: 4 },
    riyadh: { name: "الرياض", country: "السعودية", lat: 24.7136, lon: 46.6753, method: 4 },
    dubai: { name: "دبي", country: "الإمارات", lat: 25.2048, lon: 55.2708, method: 4 },
    tehran: { name: "طهران", country: "إيران", lat: 35.6892, lon: 51.3890, method: 7 },
    mashhad: { name: "مشهد المقدسة", country: "إيران", lat: 36.2972, lon: 59.6067, method: 7 },
    istanbul: { name: "إسطنبول", country: "تركيا", lat: 41.0082, lon: 28.9784, method: 13 }
};

// ==========================================
// إدارة حالة النظام والتفضيلات (State & Storage)
// ==========================================
const DEFAULT_ANNOUNCEMENT = "مرحباً بكم في الشاشة الذكية • نسألكم الدعاء • أهلاً بكم في كربلاء المقدسة";

let state = {
    cityKey: localStorage.getItem('smartScreen_city') || 'karbala',
    theme: localStorage.getItem('smartScreen_theme') || 'emerald',
    announcement: localStorage.getItem('smartScreen_announcement') || DEFAULT_ANNOUNCEMENT,
    audioEnabled: localStorage.getItem('smartScreen_audio_enabled') === 'true',
    volume: parseFloat(localStorage.getItem('smartScreen_volume') || '0.35')
};

// ========================================================
// 1. نظام الصوت الهادئ التوليدي (Web Audio Ambient Engine)
// يعمل 100% دون الحاجة إلى ملفات خارجية أو إنترنت سريع!
// ========================================================
let audioCtx = null;
let masterGain = null;
let ambientInterval = null;
let isAudioPlaying = false;

function initAudioSystem() {
    if (audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(state.volume, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);
}

// توليد نغمة دافئة وهادئة تماثل الأجواء الروحانية الهادئة
function playHarmonicChime() {
    if (!audioCtx || !isAudioPlaying) return;

    // درجات مقام خماسي هادئ (Pentatonic Scale) مريح جداً للأذن
    const notes = [196.00, 220.00, 261.63, 293.66, 329.63, 392.00]; 
    const freq = notes[Math.floor(Math.random() * notes.length)];

    const osc = audioCtx.createOscillator();
    const noteGain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    // فلتر ناعم لتقليل الحدة
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600, audioCtx.currentTime);

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // صعود وهبوط تدريجي ناعم جداً للنغمة
    const now = audioCtx.currentTime;
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(0.2, now + 2);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 7);

    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 7.5);
}

function startAmbientSound() {
    initAudioSystem();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    isAudioPlaying = true;
    updateAudioUI(true);

    // عزف أول نغمة، ثم تكرار نغمات هادئة كل 4 إلى 8 ثوانٍ
    playHarmonicChime();
    if (ambientInterval) clearInterval(ambientInterval);
    ambientInterval = setInterval(() => {
        if (isAudioPlaying) {
            playHarmonicChime();
        }
    }, 5500);
}

function stopAmbientSound() {
    isAudioPlaying = false;
    if (ambientInterval) clearInterval(ambientInterval);
    if (audioCtx) {
        audioCtx.suspend();
    }
    updateAudioUI(false);
}

function toggleAudio() {
    if (isAudioPlaying) {
        stopAmbientSound();
        state.audioEnabled = false;
    } else {
        startAmbientSound();
        state.audioEnabled = true;
    }
    localStorage.setItem('smartScreen_audio_enabled', state.audioEnabled);
}

function setVolume(val) {
    state.volume = val;
    localStorage.setItem('smartScreen_volume', val);
    if (masterGain && audioCtx) {
        masterGain.gain.setValueAtTime(val, audioCtx.currentTime);
    }
}

function updateAudioUI(isPlaying) {
    const mainIcon = document.getElementById('audio-icon');
    const mainLabel = document.getElementById('audio-label');
    const mainBtn = document.getElementById('audio-toggle-btn');
    const modalIcon = document.getElementById('modal-audio-icon');
    const modalText = document.getElementById('modal-audio-text');

    if (isPlaying) {
        mainIcon.textContent = '🔊';
        mainLabel.textContent = 'الصوت: يعمل';
        mainBtn.classList.add('active-sound');
        modalIcon.textContent = '🔊';
        modalText.textContent = 'إيقاف الصوت الهادئ';
    } else {
        mainIcon.textContent = '🔇';
        mainLabel.textContent = 'الصوت: صامت';
        mainBtn.classList.remove('active-sound');
        modalIcon.textContent = '🔇';
        modalText.textContent = 'تشغيل النغمات الهادئة';
    }
}

// ========================================================
// 2. تحديث الساعة والتاريخ الحي
// ========================================================
function updateClockAndDate() {
    const now = new Date();

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    const formattedHours = String(hours).padStart(2, '0');

    document.getElementById('live-clock').textContent = `${formattedHours}:${minutes}:${seconds} ${ampm}`;

    // التاريخ الميلادي
    const gregorianOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('gregorian-date').textContent = now.toLocaleDateString('ar-IQ', gregorianOptions);

    // التاريخ الهجري
    try {
        const hijriOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', hijriOptions);
        document.getElementById('hijri-date').textContent = hijriFormatter.format(now);
    } catch (e) {
        document.getElementById('hijri-date').textContent = "التاريخ الهجري";
    }
}

// ========================================================
// 3. أوقات الصلاة والعد التنازلي
// ========================================================
let prayerTimesToday = null;

async function fetchPrayerTimes() {
    const city = CITIES[state.cityKey] || CITIES.karbala;
    try {
        const today = new Date();
        const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
        const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${city.lat}&longitude=${city.lon}&method=${city.method}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.code === 200) {
            prayerTimesToday = data.data.timings;
            displayPrayerTimes(prayerTimesToday);
            updateNextPrayer();
        }
    } catch (error) {
        console.error("خطأ في جلب أوقات الصلاة:", error);
    }
}

function formatTo12Hour(timeStr) {
    if (!timeStr) return "--:--";
    const [h, m] = timeStr.split(':').map(Number);
    const suffix = h >= 12 ? 'م' : 'ص';
    const hours12 = h % 12 || 12;
    return `${hours12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function displayPrayerTimes(timings) {
    const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    prayers.forEach(prayer => {
        const el = document.getElementById(`time-${prayer}`);
        if (el && timings[prayer]) {
            el.textContent = formatTo12Hour(timings[prayer]);
        }
    });
}

function updateNextPrayer() {
    if (!prayerTimesToday) return;

    const now = new Date();
    const prayerNamesArabic = {
        'Fajr': 'صلاة الفجر',
        'Sunrise': 'شروق الشمس',
        'Dhuhr': 'صلاة الظهر',
        'Asr': 'صلاة العصر',
        'Maghrib': 'صلاة المغرب',
        'Isha': 'صلاة العشاء'
    };

    const prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    let nextPrayerKey = null;
    let nextPrayerDate = null;

    for (let key of prayerOrder) {
        const [h, m] = prayerTimesToday[key].split(':').map(Number);
        const pDate = new Date();
        pDate.setHours(h, m, 0, 0);

        if (pDate > now) {
            nextPrayerKey = key;
            nextPrayerDate = pDate;
            break;
        }
    }

    if (!nextPrayerKey) {
        nextPrayerKey = 'Fajr';
        const [h, m] = prayerTimesToday['Fajr'].split(':').map(Number);
        nextPrayerDate = new Date();
        nextPrayerDate.setDate(nextPrayerDate.getDate() + 1);
        nextPrayerDate.setHours(h, m, 0, 0);
    }

    document.querySelectorAll('.prayer-box').forEach(box => box.classList.remove('active'));
    const currentBox = document.getElementById(`box-${nextPrayerKey}`);
    if (currentBox) {
        currentBox.classList.add('active');
    }

    document.getElementById('next-prayer-name').textContent = prayerNamesArabic[nextPrayerKey];

    const diffMs = nextPrayerDate - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, '0');
    document.getElementById('next-prayer-countdown').textContent = 
        `متبقي: ${pad(diffHours)}:${pad(diffMins)}:${pad(diffSecs)}`;
}

// ========================================================
// 4. جلب الطقس المباشر
// ========================================================
const weatherCodeMap = {
    0: "صافٍ تماماً", 1: "صافٍ غالباً", 2: "غائم جزئياً", 3: "غائم",
    45: "ضباب خفيف", 48: "ضباب كثيف", 51: "رذاذ مطر خفيف", 53: "رذاذ مطر معتدل",
    61: "أمطار خفيفة", 63: "أمطار معتدلة", 65: "أمطار غزيرة",
    80: "زخات مطر خفيفة", 81: "زخات مطر معتدلة", 82: "أمطار رعدية",
    95: "عواصف رعدية", 96: "عواصف رعدية وبرَد"
};

async function fetchWeather() {
    const city = CITIES[state.cityKey] || CITIES.karbala;
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.current) {
            const temp = Math.round(data.current.temperature_2m);
            const humidity = data.current.relative_humidity_2m;
            const wind = Math.round(data.current.wind_speed_10m);
            const wCode = data.current.weather_code;

            document.getElementById('weather-temp').textContent = temp;
            document.getElementById('weather-condition').textContent = weatherCodeMap[wCode] || "طقس معتدل";
            document.getElementById('weather-humidity').textContent = `${humidity}%`;
            document.getElementById('weather-wind').textContent = `${wind} كم/س`;
        }
    } catch (error) {
        console.error("خطأ في جلب بيانات الطقس:", error);
        document.getElementById('weather-condition').textContent = "تعذر جلب الطقس";
    }
}

// ========================================================
// 5. إدارة المظهر (السكنات) والإعلانات والمدينة
// ========================================================
function applyTheme(themeName) {
    state.theme = themeName;
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('smartScreen_theme', themeName);

    // تحديث البطاقة النشطة في النافذة
    document.querySelectorAll('.theme-card').forEach(card => {
        if (card.dataset.theme === themeName) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

function applyCity(cityKey) {
    if (!CITIES[cityKey]) return;
    state.cityKey = cityKey;
    localStorage.setItem('smartScreen_city', cityKey);

    const city = CITIES[cityKey];
    document.getElementById('display-city-name').textContent = `${city.country} - ${city.name}`;
    document.getElementById('city-selector').value = cityKey;

    // إعادة جلب المواقيت والطقس للمدينة الجديدة
    fetchPrayerTimes();
    fetchWeather();
}

function applyAnnouncement(text) {
    state.announcement = text;
    localStorage.setItem('smartScreen_announcement', text);
    document.getElementById('announcement-text').textContent = text;
    document.getElementById('announcement-input').value = text;
}

// ========================================================
// 6. تهيئة نافذة الإعدادات والأحداث
// ========================================================
function setupEventListeners() {
    const modal = document.getElementById('settings-modal');
    const openBtn = document.getElementById('settings-open-btn');
    const closeBtn = document.getElementById('settings-close-btn');
    const saveBtn = document.getElementById('save-settings-btn');
    const audioToggleBtn = document.getElementById('audio-toggle-btn');
    const modalAudioBtn = document.getElementById('modal-audio-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.getElementById('volume-value');

    // أزرار الصوت
    audioToggleBtn.addEventListener('click', toggleAudio);
    modalAudioBtn.addEventListener('click', toggleAudio);

    volumeSlider.value = Math.round(state.volume * 100);
    volumeValue.textContent = `${volumeSlider.value}%`;

    volumeSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        volumeValue.textContent = `${val}%`;
        setVolume(val / 100);
    });

    // فتح وإغلاق النافذة
    openBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    // اختيار السكن
    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => {
            applyTheme(card.dataset.theme);
        });
    });

    // حفظ الإعدادات
    saveBtn.addEventListener('click', () => {
        const selectedCity = document.getElementById('city-selector').value;
        const newAnnouncement = document.getElementById('announcement-input').value.trim();

        if (selectedCity !== state.cityKey) {
            applyCity(selectedCity);
        }

        if (newAnnouncement) {
            applyAnnouncement(newAnnouncement);
        }

        modal.classList.add('hidden');
    });
}

// ========================================================
// بدء التشغيل
// ========================================================
window.addEventListener('DOMContentLoaded', () => {
    // تطبيق السكن والمدينة والإعلان المحفوظ
    applyTheme(state.theme);
    applyCity(state.cityKey);
    applyAnnouncement(state.announcement);

    // إعداد مستمعي الأحداث
    setupEventListeners();

    // الساعة
    updateClockAndDate();
    setInterval(updateClockAndDate, 1000);

    // أوقات الصلاة والعد التنازلي
    setInterval(updateNextPrayer, 1000);
    setInterval(fetchPrayerTimes, 6 * 60 * 60 * 1000); // تحديث المواقيت كل 6 ساعات

    // الطقس
    setInterval(fetchWeather, 20 * 60 * 1000); // تحديث الطقس كل 20 دقيقة
});
