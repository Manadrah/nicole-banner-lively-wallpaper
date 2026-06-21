const audio = document.getElementById("bg-audio");
if (audio) {
    audio.volume = 0.15;
}

let currentHourRotation = 0;
let currentMinuteRotation = 0;

$(document).ready(function () {
    setupDots();
    setupGears();

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const totalMinutes = (hours * 60) + minutes + (seconds / 60);

    let targetHourRotation = ((totalMinutes - 720) / 1440) * 360;
    while (targetHourRotation < 0) {
        targetHourRotation += 360;
    }

    let targetMinuteRotation = targetHourRotation * 24;

    currentHourRotation = targetHourRotation;
    currentMinuteRotation = targetMinuteRotation;

    $('.needle-pivot').css({
        'transform': `rotate(${currentHourRotation}deg)`,
        'transition': 'none'
    });
    $('.minute-needle-pivot').css({
        'transform': `rotate(${currentMinuteRotation}deg)`,
        'transition': 'none'
    });

    setInterval(updateClock, 1000);
    updateClock();
    updateDate(now);
});

function updateDate(now) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    $('.date').text(`${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`);
}

function setupDots() {
    const ring = $('#marker-ring');
    const radius = 160;

    for (let i = 0; i < 24; i++) {
        // -90 degrees puts "12:00" at the top
        let angle = (i * 15) - 90;
        let x = 300 + radius * Math.cos(angle * Math.PI / 180);
        let y = 300 + radius * Math.sin(angle * Math.PI / 180);

        let dotClass = "dot";

        // Logical Mapping: 
        // Image Top = 12:00 (Noon)
        // Image Bottom = 0:00 (Midnight)
        if (i === 0) dotClass += " dot-special dot-12"; // Noon
        if (i === 6) dotClass += " dot-special dot-18"; // Sunset (Right)
        if (i === 12) dotClass += " dot-special dot-0"; // Midnight (Bottom)
        if (i === 18) dotClass += " dot-special dot-6"; // Sunrise (Left)

        ring.append(`<div class="${dotClass}" style="left:${x}px; top:${y}px"></div>`);
    }
}

function setupGears() {
    $('#gear-central').attr('d', generateGearPath(200, 200, 24, 38, 44, 28));
    $('#gear-left').attr('d', generateGearPath(116, 152, 30, 50, 56, 38));
    $('#gear-right').attr('d', generateGearPath(284, 152, 30, 50, 56, 38));
    $('#gear-bottom').attr('d', generateGearPath(200, 297, 30, 50, 56, 38));
    $('#gear-outer').attr('d', generateCircleRingPath(200, 200, 155, 161));
    $('#fancy-outer-ring').attr('d', generateFancyRingPath(250, 250, 220, false));
    $('#fancy-outer-ring-outward').attr('d', generateFancyRingPath(250, 250, 220, true));
}

function generateGearPath(cx, cy, numTeeth, innerRadius, outerRadius, holeRadius) {
    let path = "";
    const angleStep = (2 * Math.PI) / numTeeth;

    for (let i = 0; i < numTeeth; i++) {
        const baseAngle = i * angleStep;

        // 4 points of each tooth: base-left, tip-left, tip-right, base-right
        const a0 = baseAngle;
        const a1 = baseAngle + angleStep * 0.25;
        const a2 = baseAngle + angleStep * 0.45;
        const a3 = baseAngle + angleStep * 0.70;

        const r0 = innerRadius;
        const r1 = outerRadius;

        const x0 = cx + r0 * Math.cos(a0);
        const y0 = cy + r0 * Math.sin(a0);
        const x1 = cx + r1 * Math.cos(a1);
        const y1 = cy + r1 * Math.sin(a1);
        const x2 = cx + r1 * Math.cos(a2);
        const y2 = cy + r1 * Math.sin(a2);
        const x3 = cx + r0 * Math.cos(a3);
        const y3 = cy + r0 * Math.sin(a3);

        if (i === 0) {
            path += `M ${x0.toFixed(2)} ${y0.toFixed(2)} `;
        } else {
            path += `L ${x0.toFixed(2)} ${y0.toFixed(2)} `;
        }
        path += `L ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} `;
    }
    path += "Z ";

    if (holeRadius > 0) {
        // Draw inner hole in reverse direction for proper fill cutting
        path += `M ${cx} ${cy - holeRadius} `;
        for (let a = 0; a <= 360; a += 10) {
            const rad = (a * Math.PI) / 180;
            const x = cx + holeRadius * Math.sin(rad);
            const y = cy - holeRadius * Math.cos(rad);
            path += `L ${x.toFixed(2)} ${y.toFixed(2)} `;
        }
        path += "Z";
    }

    return path;
}

function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const totalMinutes = (hours * 60) + minutes + (seconds / 60);

    let newHourRotation = ((totalMinutes - 720) / 1440) * 360;

    // Ensure continuous forward rotation for the hour hand
    while (newHourRotation < currentHourRotation - 180) newHourRotation += 360;

    // Mechanically link minute hand to hour hand
    let newMinuteRotation = newHourRotation * 24;

    currentHourRotation = newHourRotation;
    currentMinuteRotation = newMinuteRotation;

    $('.needle-pivot').css('transform', `rotate(${currentHourRotation}deg)`);
    $('.minute-needle-pivot').css('transform', `rotate(${currentMinuteRotation}deg)`);

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    $('.digital-time').text(`${formattedHours}:${formattedMinutes}`);

    updateDate(now);
}

function generateCircleRingPath(cx, cy, innerRadius, outerRadius) {
    let path = `M ${cx} ${cy - outerRadius} A ${outerRadius} ${outerRadius} 0 1 1 ${cx} ${cy + outerRadius} A ${outerRadius} ${outerRadius} 0 1 1 ${cx} ${cy - outerRadius} Z `;
    if (innerRadius > 0) {
        path += `M ${cx} ${cy - innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy + innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy - innerRadius} Z`;
    }
    return path;
}

function generateFancyRingPath(cx, cy, R, isOutward = false) {
    let path = "";

    const craterR = 36;
    const d_c = (craterR * craterR) / (2 * R);
    const y_c = Math.sqrt(craterR * craterR - d_c * d_c);
    const delta_theta_c = Math.asin(y_c / R);

    const caveDepth = 15;
    const delta_theta_v = 4 * Math.PI / 180;

    let startA = delta_theta_c;
    path += `M ${(cx + R * Math.cos(startA)).toFixed(2)} ${(cy + R * Math.sin(startA)).toFixed(2)} `;

    for (let i = 0; i < 8; i++) {
        let featureAngle = i * 45 * Math.PI / 180;
        let isCrater = (i % 2 === 0);

        let nextFeatureIndex = (i + 1) % 8;
        let nextFeatureAngle = nextFeatureIndex * 45 * Math.PI / 180;
        if (nextFeatureAngle < featureAngle) nextFeatureAngle += 2 * Math.PI;

        let isNextCrater = (nextFeatureIndex % 2 === 0);
        let next_delta = isNextCrater ? delta_theta_c : delta_theta_v;

        let endArcAngle = nextFeatureAngle - next_delta;

        let endX = cx + R * Math.cos(endArcAngle);
        let endY = cy + R * Math.sin(endArcAngle);

        let diff = endArcAngle - (featureAngle + (isCrater ? delta_theta_c : delta_theta_v));
        let largeArc = diff > Math.PI ? 1 : 0;

        path += `A ${R} ${R} 0 ${largeArc} 1 ${endX.toFixed(2)} ${endY.toFixed(2)} `;

        if (isNextCrater) {
            let craterEndX = cx + R * Math.cos(nextFeatureAngle + delta_theta_c);
            let craterEndY = cy + R * Math.sin(nextFeatureAngle + delta_theta_c);
            if (isOutward) {
                path += `A ${craterR} ${craterR} 0 1 1 ${craterEndX.toFixed(2)} ${craterEndY.toFixed(2)} `;
            } else {
                path += `A ${craterR} ${craterR} 0 0 0 ${craterEndX.toFixed(2)} ${craterEndY.toFixed(2)} `;
            }
        } else {
            let tipX = cx + (R - caveDepth) * Math.cos(nextFeatureAngle);
            let tipY = cy + (R - caveDepth) * Math.sin(nextFeatureAngle);

            let caveEndX = cx + R * Math.cos(nextFeatureAngle + delta_theta_v);
            let caveEndY = cy + R * Math.sin(nextFeatureAngle + delta_theta_v);

            path += `L ${tipX.toFixed(2)} ${tipY.toFixed(2)} L ${caveEndX.toFixed(2)} ${caveEndY.toFixed(2)} `;
        }
    }

    path += "Z";
    return path;
}

let isLivelyLoaded = false;

function onLivelyLoad() {
    if (isLivelyLoaded) return;
    isLivelyLoaded = true;

    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 500);
    }

    if (audio) audio.play().catch(e => console.log(e));

    const video = document.getElementById("bg-video");
    if (video) video.play().catch(e => console.log(e));
}

// Fallback for normal browser preview
setTimeout(onLivelyLoad, 500);

function livelyPropertyListener(name, val) {
    onLivelyLoad();

    if (name === "bgMusicVolume") {
        if (audio) {
            audio.volume = val / 100;
        }
    }

    if (name === "videoQuality") {
        const video = document.getElementById("bg-video");
        if (video) {
            const time = video.currentTime;
            const newSrc = val === 0 ? "assets/img/bg-video.mp4" : "assets/img/bg-video-1080p.mp4";
            if (!video.src.endsWith(newSrc)) {
                video.src = newSrc;
                video.currentTime = time;
                video.play().catch(e => console.log(e));
            }
        }
    }
}
