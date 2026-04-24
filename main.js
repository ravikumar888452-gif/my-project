// --- FORM HANDLING (PRIORITIZED) ---
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Form submission started...");
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            
            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;

            const formData = new FormData(contactForm);
            
            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    alert('Thank you! Your message has been sent successfully.');
                    contactForm.reset();
                } else {
                    alert('Oops! There was a problem submitting your form. Please try again.');
                }
            } catch (error) {
                console.error("Submission error:", error);
                alert('Oops! There was a problem submitting your form. Please check your internet connection.');
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
        console.log("Form handler attached.");
    } else {
        console.error("Form not found: #contact-form");
    }
}

// Run initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
} else {
    initContactForm();
}

// --- REST OF THE SCRIPTS ---

// Initialize Lucide Icons
window.addEventListener('load', () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }, 1000);
    }
});

// --- Three.js Background Logic ---
try {
    const canvas = document.querySelector('#bg-canvas');
    if (canvas) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 2000;
        const posArray = new Float32Array(particlesCount * 3);
        for(let i = 0; i < particlesCount * 3; i++) { posArray[i] = (Math.random() - 0.5) * 10; }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const particlesMaterial = new THREE.PointsMaterial({ size: 0.005, color: '#00f2ff', transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        camera.position.z = 3;

        let mouseX = 0, mouseY = 0;
        window.addEventListener('mousemove', (e) => { mouseX = (e.clientX / window.innerWidth - 0.5) * 0.5; mouseY = (e.clientY / window.innerHeight - 0.5) * 0.5; });

        const animate = () => {
            const elapsedTime = new THREE.Clock().getElapsedTime();
            particlesMesh.rotation.y = elapsedTime * 0.05;
            particlesMesh.rotation.x = elapsedTime * 0.05;
            particlesMesh.position.x += (mouseX - particlesMesh.position.x) * 0.05;
            particlesMesh.position.y += (-mouseY - particlesMesh.position.y) * 0.05;
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
} catch (e) { console.error("Three.js error:", e); }

// --- GSAP Animations ---
try {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.reveal-image', { opacity: 0, scale: 0.5, duration: 1.5, delay: 1, ease: 'power4.out' });
    gsap.from('.reveal-text', { opacity: 0, y: 30, duration: 1, delay: 1.5, ease: 'power4.out' });
    gsap.from('.glitch-text', { opacity: 0, scale: 0.9, duration: 1.2, delay: 1.7, ease: 'power4.out' });
    gsap.from('.role-text', { opacity: 0, x: -30, duration: 1, delay: 2, ease: 'power4.out' });
    gsap.from('.tagline', { opacity: 0, duration: 1.5, delay: 2.2, ease: 'power2.out' });
    gsap.from('.hero-socials .social-btn', { opacity: 0, y: 20, stagger: 0.2, duration: 1, delay: 2.4, ease: 'back.out(1.7)' });
    gsap.from('.cta-group .btn', { opacity: 0, y: 20, stagger: 0.2, duration: 1, delay: 2.5, ease: 'back.out(1.7)' });

    document.querySelectorAll('.section-title').forEach(title => {
        gsap.from(title, { scrollTrigger: { trigger: title, start: 'top 80%' }, opacity: 0, y: 40, duration: 1, ease: 'power3.out' });
    });

    document.querySelectorAll('.stat-item').forEach(stat => {
        const bar = stat.querySelector('.progress');
        const target = stat.querySelector('.stat-number').getAttribute('data-target');
        const num = stat.querySelector('.stat-number');
        ScrollTrigger.create({
            trigger: stat,
            start: 'top 85%',
            onEnter: () => {
                gsap.to(bar, { width: target + '%', duration: 1.5, ease: 'power2.out' });
                let count = { val: 0 };
                gsap.to(count, { val: target, duration: 1.5, onUpdate: () => { num.innerText = Math.floor(count.val); } });
            }
        });
    });

    document.querySelectorAll('.project-card').forEach((project, index) => {
        gsap.from(project, { scrollTrigger: { trigger: project, start: 'top 90%' }, opacity: 0, y: 50, delay: index * 0.1, duration: 0.8, ease: 'power2.out' });
    });

} catch (e) { console.error("GSAP error:", e); }
