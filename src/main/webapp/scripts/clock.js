function runClock() {
    const hourHand = document.getElementById('hour-hand');
    const minuteHand = document.getElementById('minute-hand');
    let time = 0;
    let clockInterval;
    let droopAngle = 20;

    function updateClockHands(isDragging = false) {
        let now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let hourDegrees, minuteDegrees;
        if (isDragging) {
            hourDegrees = 180 + droopAngle;
            minuteDegrees = 180 + droopAngle;
            hourDegrees += (Math.random() - 0.5) * droopAngle;
            minuteDegrees += (Math.random() - 0.5) * droopAngle;
        } else {
            hourDegrees = (hours % 12 + minutes / 60) * 30;
            minuteDegrees = minutes * 6;
            time += 1;
        }
        hourHand.style.transform = `rotate(${hourDegrees}deg)`;
        minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
    }

    clockInterval = setInterval(updateClockHands, 1000);
    updateClockHands();

    return {
        startClock: function () {
            if (!clockInterval) clockInterval = setInterval(updateClockHands, 1000);
        },
        stopClock: function () {
            clearInterval(clockInterval);
            clockInterval = null;
        },
        updateHandsDrag: function () {
            updateClockHands(true);
        },
        updateHandsNormally: function () {
            updateClockHands(false);
        }
    };
}

function animateClock() {
    const clock = document.getElementById("clock-container");
    const points = [
        {x: window.innerWidth * 0.1, y: window.innerHeight * 0.4},
        {x: window.innerWidth * 0.55, y: window.innerHeight * 0.35},
        {x: window.innerWidth * 0.3, y: window.innerHeight * 0.32},
    ];
    const duration = 5000;
    const wobbleFrequency = 2;
    const wobbleAmplitude = 5;
    let animationFrameId;
    let startTime;
    let currentPointIndex = 0;

    clock.style.position = "absolute";
    clock.style.transformOrigin = "center center";

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        let progress = elapsed / duration;

        if (progress > 1) {
            startTime = timestamp;
            currentPointIndex = (currentPointIndex + 1) % points.length;
            progress = 0;
        }

        const currentPoint = points[currentPointIndex];
        const nextPoint = points[(currentPointIndex + 1) % points.length];

        const x = currentPoint.x + (nextPoint.x - currentPoint.x) * progress;
        const y = currentPoint.y + (nextPoint.y - currentPoint.y) * progress;

        const wobbleAngle = Math.sin(elapsed / 1000 * wobbleFrequency * 2 * Math.PI) * wobbleAmplitude;

        clock.style.left = `${x}px`;
        clock.style.top = `${y}px`;
        clock.style.transform = `rotate(${wobbleAngle}deg)`;

        animationFrameId = requestAnimationFrame(animate);
    }

    function startAnimation() {
        if (!animationFrameId) {
            clock.style.left = `${points[0].x}px`;
            clock.style.top = `${points[0].y}px`;
            animationFrameId = requestAnimationFrame(animate);
        }
    }

    function stopAnimation() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    startAnimation();
    return {
        startAnimation: startAnimation,
        stopAnimation: stopAnimation
    };
}

function setupDragAndShakeClock(clockController) {
    const clockElement = document.getElementById("clock-container");
    let isDragging = false;
    let offsetX, offsetY;

    clockElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - clockElement.offsetLeft;
        offsetY = e.clientY - clockElement.offsetTop;
        clockAnimationController.stopAnimation();
        clockController.stopClock();
        clockController.updateHandsDrag();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        clockElement.style.left = `${e.clientX - offsetX}px`;
        clockElement.style.top = `${e.clientY - offsetY}px`;

    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        clockAnimationController.startAnimation();
        clockController.startClock();
        clockController.updateHandsNormally();
    });

    document.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            clockAnimationController.startAnimation();
            clockController.startClock();
            clockController.updateHandsNormally();
        }
    });
}

// часы ходят
const clockController = runClock();
// часы летают
const clockAnimationController = animateClock();
// часы таскаются
setupDragAndShakeClock(clockController);
