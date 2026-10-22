// ==========================================
// إعدادات الشاشة الذكية - كربلاء المقدسة
// ==========================================
const CONFIG = {
    city: "Karbala",
    country: "Iraq",
    latitude: 32.61603,
    longitude: 44.02488,
    // طريقة الحساب لأوقات الصلاة: 0 = الشيعة الإثنا عشرية (معهد لواء قم - المعتمدة في العراق)
    prayerMethod: 0, 
    // الرسائل الإعلانية التي يمكن تدويرها
    announcements: [
        "مرحباً بكم في شاشة العرض الذكية • أهلاً بكم في كربلاء المقدسة",
        "نسألكم الدعاء لجميع المؤمنين والمؤمنات • الصلاة عمود الدين",
        "إعلان: يمكنكم تخصيص هذا الشريط لعرض أي تنبيه أو مناسبة خاصة بسهولة!"
    ]
};

// ==========================================
// 1. الساعة والتاريخ الحي
// ==========================================
function updateClockAndDate() {
    const now = new Date();

    // تحديث الساعة بتنسيق 12 ساعة مع AM/PM أو 24 ساعة (هنا 12 ساعة مريحة للقراءة)
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12;
    hours = hours ? hours : 12; // الساعة 0 تصبح 12
    const formattedHours = String(hours).padStart(2, '0');

    document.getElementById('live-clock').textContent = `${formattedHours}:${minutes}:${seconds} ${ampm}`;

    // التاريخ الميلادي بالعربية
    const gregorianOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const gregorianStr = now.toLocaleDateString('ar-IQ', gregorianOptions);
    document.getElementById('gregorian-date').textContent = gregorianStr;

    // التاريخ الهجري باستخدام ميزة التقويم الإسلامي في المتصفح
    try {
        const hijriOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', hijriOptions);
        document.getElementById('hijri-date').textContent = hijriFormatter.format(now);
    } catch (e) {
        // بديل إذا لم يدعم المتصفح
        document.getElementById('hijri-date').textContent = "التاريخ الهجري";
    }
}

// ==========================================
// 2. جلب أوقات الصلاة (Aladhan API)
// ==========================================
let prayerTimesToday = null;

async function fetchPrayerTimes() {
    try {
        const today = new Date();
        const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
        const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${CONFIG.latitude}&longitude=${CONFIG.longitude}&method=${CONFIG.prayerMethod}`;

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

// تحويل وقت الصلاة من 24 إلى 12 ساعة
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

// حساب الصلاة القادمة والعد التنازلي
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

    // إذا انتهت كل صلوات اليوم، فالصلاة القادمة هي فجر الغد
    if (!nextPrayerKey) {
        nextPrayerKey = 'Fajr';
        const [h, m] = prayerTimesToday['Fajr'].split(':').map(Number);
        nextPrayerDate = new Date();
        nextPrayerDate.setDate(nextPrayerDate.getDate() + 1);
        nextPrayerDate.setHours(h, m, 0, 0);
    }

    // إزالة التمييز السابق وتحديد البوكس الحالي
    document.querySelectorAll('.prayer-box').forEach(box => box.classList.remove('active'));
    const currentBox = document.getElementById(`box-${nextPrayerKey}`);
    if (currentBox) {
        currentBox.classList.add('active');
    }

    // تحديث الاسم
    document.getElementById('next-prayer-name').textContent = prayerNamesArabic[nextPrayerKey];

    // حساب الفارق الزمني (العد التنازلي)
    const diffMs = nextPrayerDate - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, '0');
    document.getElementById('next-prayer-countdown').textContent = 
        `متبقي: ${pad(diffHours)}:${pad(diffMins)}:${pad(diffSecs)}`;
}

// ==========================================
// 3. جلب الطقس المباشر في كربلاء (Open-Meteo)
// ==========================================
const weatherCodeMap = {
    0: "صافٍ تماماً",
    1: "صافٍ غالباً",
    2: "غائم جزئياً",
    3: "غائم",
    45: "ضباب خفيف",
    48: "ضباب كثيف",
    51: "رذاذ مطر خفيف",
    53: "رذاذ مطر معتدل",
    61: "أمطار خفيفة",
    63: "أمطار معتدلة",
    65: "أمطار غزيرة",
    80: "زخات مطر خفيفة",
    81: "زخات مطر معتدلة",
    82: "أمطار رعدية غزيرة",
    95: "عواصف رعدية",
    96: "عواصف رعدية وبرَد"
};

async function fetchWeather() {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${CONFIG.latitude}&longitude=${CONFIG.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
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

// ==========================================
// 4. تدوير شريط الإعلانات
// ==========================================
let announcementIndex = 0;
function rotateAnnouncements() {
    const el = document.getElementById('announcement-text');
    if (!el || CONFIG.announcements.length === 0) return;
    
    // دمج الإعلانات في شريط واحد طويل متواصل
    el.textContent = CONFIG.announcements.join("  ★  ");
}

// ==========================================
// بدء التشغيل وتحديد فترات التحديث
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    // تحديث الساعة فورا ثم كل ثانية
    updateClockAndDate();
    setInterval(updateClockAndDate, 1000);

    // أوقات الصلاة: جلبها وتحديث العد التنازلي كل ثانية
    fetchPrayerTimes();
    setInterval(updateNextPrayer, 1000);
    // إعادة جلب المواقيت كل 6 ساعات للتأكد من اليوم الجديد
    setInterval(fetchPrayerTimes, 6 * 60 * 60 * 1000);

    // الطقس: جلبه فوراً ثم تحديثه كل 20 دقيقة
    fetchWeather();
    setInterval(fetchWeather, 20 * 60 * 1000);

    // تشغيل شريط الإعلانات
    rotateAnnouncements();
});
