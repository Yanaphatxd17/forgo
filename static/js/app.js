document.addEventListener('DOMContentLoaded', () => {
    // 3D Card Hover Tilt Effect
    const card3D = document.getElementById('card3d');
    if (card3D) {
        card3D.addEventListener('mousemove', (e) => {
            const rect = card3D.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 12;
            const rotateY = (centerX - x) / 12;
            
            card3D.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card3D.addEventListener('mouseleave', () => {
            card3D.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    }

    // Gallery Category Filter
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryCards = document.querySelectorAll('.gallery-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            
            galleryCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Lightbox Modal
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalCaption = document.getElementById('modalCaption');
    const modalClose = document.getElementById('modalClose');

    galleryCards.forEach(card => {
        card.addEventListener('click', () => {
            const img = card.querySelector('img').src;
            const title = card.querySelector('h3').innerText;
            const caption = card.querySelector('p').innerText;

            modalImg.src = img;
            modalTitle.innerText = title;
            modalCaption.innerText = caption;
            modal.classList.add('active');
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
});
