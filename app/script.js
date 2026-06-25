/* ===========================================
   Zero-Touch Cloud Architecture Dashboard
   Interactive JavaScript Controller
   =========================================== */

// ── Background Canvas Animation ──
(function initCanvas() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.r = Math.random() * 1.5 + 0.5;
            this.alpha = Math.random() * 0.3 + 0.1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,212,255,${this.alpha})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < 60; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => { p.update(); p.draw(); });
        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0,212,255,${0.06 * (1 - dist / 150)})`;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
})();

// ── Theme Toggle ──
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') document.body.classList.add('light-mode');
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    });
}

// ── Navigation Active State ──
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');

function updateNav() {
    let current = '';
    sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 200) current = s.id;
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.section === current);
    });
}
window.addEventListener('scroll', updateNav);

// ── Stat Counter Animation ──
function animateCounters() {
    document.querySelectorAll('.stat-number').forEach(el => {
        const target = parseInt(el.dataset.count);
        const duration = 1500;
        const start = performance.now();
        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    });
}

// ── Scroll-Driven Pipeline Animation ──
function updatePipelineOnScroll() {
    const pipelineSection = document.getElementById('pipeline');
    const steps = document.querySelectorAll('.pipeline-step');
    const progress = document.getElementById('pipelineProgress');
    if (!pipelineSection || steps.length === 0) return;

    const rect = pipelineSection.getBoundingClientRect();
    const sectionHeight = pipelineSection.offsetHeight;
    const viewportHeight = window.innerHeight;

    // Calculate scroll progress through the pipeline section (0 to 1)
    // Starts when section enters viewport, ends when section leaves
    const scrollStart = rect.top - viewportHeight * 0.7;
    const scrollEnd = rect.bottom - viewportHeight * 0.3;
    const scrollRange = scrollEnd - scrollStart;
    const scrollProgress = Math.max(0, Math.min(1, (0 - scrollStart) / scrollRange));

    // Update progress bar
    if (progress) {
        progress.style.height = `${scrollProgress * 100}%`;
    }

    // Activate steps based on scroll progress
    const stepInterval = 1 / steps.length;
    steps.forEach((step, i) => {
        const stepThreshold = i * stepInterval;
        const isVisible = scrollProgress > stepThreshold;
        const isActive = scrollProgress > stepThreshold && scrollProgress <= (i + 1) * stepInterval;

        step.classList.toggle('visible', isVisible);
        step.classList.toggle('active', isActive || (i === steps.length - 1 && scrollProgress >= 1));
    });
}

window.addEventListener('scroll', updatePipelineOnScroll, { passive: true });

// ── Intersection Observer for Animations ──
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Hero stats counter
            if (entry.target.id === 'hero') animateCounters();
            // Security layers
            entry.target.querySelectorAll('.security-layer').forEach((el, i) => {
                setTimeout(() => el.classList.add('visible'), i * 200);
            });
            // Infra cards
            entry.target.querySelectorAll('.infra-card').forEach((el, i) => {
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, i * 100);
            });
        }
    });
}, { threshold: 0.2 });

sections.forEach(s => observer.observe(s));

// Initial fade-in for infra cards
document.querySelectorAll('.infra-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.5s ease';
});

// ── Architecture Info Panel ──
const NODE_INFO = {
    internet: {
        title: 'Internet (Public Traffic)',
        content: `<p>External traffic enters through the Internet Gateway on <strong>port 80 (HTTP)</strong>. The architecture does not expose any other ports to the public internet.</p>
        <div class="info-detail-row"><span class="info-detail-key">Protocol</span><span class="info-detail-val">HTTP</span></div>
        <div class="info-detail-row"><span class="info-detail-key">Port</span><span class="info-detail-val">80</span></div>
        <div class="info-detail-row"><span class="info-detail-key">Target</span><span class="info-detail-val">IGW → Nginx</span></div>`
    },
    igw: {
        title: 'Internet Gateway (IGW)',
        content: `<p>The VPC's Internet Gateway provides bi-directional internet access for the public subnet. It's the single entry point for all external traffic.</p>
        <div class="info-detail-row"><span class="info-detail-key">Resource</span><span class="info-detail-val">aws_internet_gateway</span></div>
        <div class="info-detail-row"><span class="info-detail-key">VPC</span><span class="info-detail-val">production_vpc</span></div>
        <div class="info-detail-row"><span class="info-detail-key">File</span><span class="info-detail-val">vpc.tf</span></div>
        <div class="info-code">resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.custom.id
  tags = { Name = "production-igw" }
}</div>`
    },
    nat: {
        title: 'NAT Gateway',
        content: `<p>Enables the private subnet's database server to make <strong>outbound-only</strong> internet requests (e.g., OS updates) without exposing it to inbound traffic.</p>
        <div class="info-detail-row"><span class="info-detail-key">Elastic IP</span><span class="info-detail-val">Allocated</span></div>
        <div class="info-detail-row"><span class="info-detail-key">Subnet</span><span class="info-detail-val">Public (10.0.1.0/24)</span></div>
        <div class="info-detail-row"><span class="info-detail-key">Direction</span><span class="info-detail-val">Outbound only</span></div>
        <div class="info-code">resource "aws_nat_gateway" "public_nat" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public_subnet.id
}</div>`
    },
    web: {
        title: 'Web Server — EC2 (Bastion Host)',
        content: `<p>The public-facing EC2 instance runs <strong>Nginx → Python</strong> via Docker Compose. Also serves as a Bastion/Jump Host for SSH access to the private database server.</p>
        <div class="info-detail-row"><span class="info-detail-key">AMI</span><span class="info-detail-val">Ubuntu 22.04</span></div>
        <div class="info-detail-row"><span class="info-detail-key">Type</span><span class="info-detail-val">t3.micro</span></div>
        <div class="info-detail-row"><span class="info-detail-key">Subnet</span><span class="info-detail-val">Public</span></div>
        <div class="info-detail-row"><span class="info-detail-key">Containers</span><span class="info-detail-val">Nginx + Python</span></div>
        <div class="info-detail-row"><span class="info-detail-key">Elastic IP</span><span class="info-detail-val">Yes (static)</span></div>
        <div class="info-code">services:
  web:
    build: app/.
    expose: ["8000"]
  nginx:
    image: nginx:latest
    ports: ["80:80"]</div>`
    },
    db: {
        title: 'Database Server — EC2 (Private)',
        content: `<p>Isolated in the private subnet with <strong>zero inbound internet access</strong>. Runs Redis cache on port 6379. Only accepts connections from the Web Server's Security Group.</p>
        <div class="info-detail-row"><span class="info-detail-key">AMI</span><span class="info-detail-val">Ubuntu 22.04</span></div>
        <div class="info-detail-row"><span class="info-detail-key">Type</span><span class="info-detail-val">t3.micro</span></div>
        <div class="info-detail-row"><span class="info-detail-key">Subnet</span><span class="info-detail-val">Private</span></div>
        <div class="info-detail-row"><span class="info-detail-key">Service</span><span class="info-detail-val">Redis :6379</span></div>
        <div class="info-detail-row"><span class="info-detail-key">Public IP</span><span class="info-detail-val">None</span></div>
        <div class="info-code">docker container run \\
  --name dbserver \\
  -p 6379:6379 \\
  --restart always \\
  -d redis:latest</div>`
    },
    github: {
        title: 'GitHub Actions — CI/CD Pipeline',
        content: `<p>The fully automated pipeline triggers on every push to <code>main</code>. It SSHs into the Web Server, pulls the latest code, injects environment variables, and runs Docker Compose.</p>
        <div class="info-detail-row"><span class="info-detail-key">Trigger</span><span class="info-detail-val">push → main</span></div>
        <div class="info-detail-row"><span class="info-detail-key">Runner</span><span class="info-detail-val">ubuntu-latest</span></div>
        <div class="info-detail-row"><span class="info-detail-key">SSH Action</span><span class="info-detail-val">appleboy/ssh-action</span></div>
        <div class="info-code">- name: Deploy
  uses: appleboy/ssh-action@v1
  with:
    host: \${{ secrets.EC2_HOST }}
    script: |
      cd ~/project && git pull
      echo "REDIS_HOST=$REDIS_HOST" > .env
      docker compose up -d --build</div>`
    }
};

document.querySelectorAll('.arch-node').forEach(node => {
    node.addEventListener('click', () => {
        const key = node.dataset.info;
        if (!key || !NODE_INFO[key]) return;

        document.querySelectorAll('.arch-node').forEach(n => n.classList.remove('selected'));
        node.classList.add('selected');

        const panel = document.getElementById('infoPanel');
        const title = document.getElementById('infoPanelTitle');
        const content = document.getElementById('infoPanelContent');
        if (title) title.textContent = NODE_INFO[key].title;
        if (content) content.innerHTML = NODE_INFO[key].content;
        if (panel) panel.style.borderColor = 'rgba(0,212,255,0.3)';
    });
});

document.getElementById('closeInfo')?.addEventListener('click', () => {
    document.querySelectorAll('.arch-node').forEach(n => n.classList.remove('selected'));
    const title = document.getElementById('infoPanelTitle');
    const content = document.getElementById('infoPanelContent');
    const panel = document.getElementById('infoPanel');
    if (title) title.textContent = 'Select a Component';
    if (content) content.innerHTML = '<p class="info-placeholder">Click any node in the architecture diagram to view detailed information about that component.</p>';
    if (panel) panel.style.borderColor = '';
});

// ── Smooth Scroll for Nav Links ──
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(link.dataset.section);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

// Initialize pipeline on load
updatePipelineOnScroll();

console.log('%c◆ ZeroDeploy Dashboard Loaded', 'color:#00d4ff;font-size:14px;font-weight:bold');
