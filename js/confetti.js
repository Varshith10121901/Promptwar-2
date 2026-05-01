// Simple confetti implementation for celebration effects
export function initConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let particles = [];
  let animationId = null;

  const colors = ['#1A73E8', '#34A853', '#FBBC05', '#EA4335', '#8AB4F8'];

  function createParticles() {
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2 + 100,
        r: Math.random() * 6 + 2,
        dx: Math.random() * 10 - 5,
        dy: Math.random() * -10 - 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10,
        tiltAngle: 0,
        tiltAngleInc: (Math.random() * 0.07) + 0.05
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, index) => {
      p.tiltAngle += p.tiltAngleInc;
      p.y += (Math.cos(p.tiltAngle) + 1 + p.r / 2) / 2;
      p.x += Math.sin(p.tiltAngle) * 2;

      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
      ctx.stroke();

      if (p.y > canvas.height) particles.splice(index, 1);
    });

    if (particles.length > 0) {
      animationId = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  return {
    fire: () => {
      cancelAnimationFrame(animationId);
      particles = [];
      createParticles();
      draw();
    }
  };
}
