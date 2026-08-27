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

    // Gallery Lightbox Modal
    const imageModal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalCaption = document.getElementById('modalCaption');
    const modalClose = document.getElementById('modalClose');

    galleryCards.forEach(card => {
        card.addEventListener('click', () => {
            const img = card.querySelector('img').src;
            const title = card.querySelector('h3').innerText;
            const caption = card.querySelector('p').innerText;

            if (modalImg) modalImg.src = img;
            if (modalTitle) modalTitle.innerText = title;
            if (modalCaption) modalCaption.innerText = caption;
            if (imageModal) imageModal.classList.add('active');
        });
    });

    if (modalClose && imageModal) {
        modalClose.addEventListener('click', () => {
            imageModal.classList.remove('active');
        });
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                imageModal.classList.remove('active');
            }
        });
    }

    // Interactive Topic History Modal (Click to View Detailed Topic History)
    const topicModal = document.getElementById('topicDetailModal');
    const topicModalClose = document.getElementById('topicModalClose');
    const topicIcon = document.getElementById('topicIcon');
    const topicTitle = document.getElementById('topicTitle');
    const topicImg = document.getElementById('topicImg');
    const topicFullHistory = document.getElementById('topicFullHistory');
    const topicHighlightsList = document.getElementById('topicHighlightsList');

    const topicCards = document.querySelectorAll('.topic-card');

    topicCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.getAttribute('data-title') || '';
            const icon = card.getAttribute('data-icon') || '📜';
            const fullHistory = card.getAttribute('data-full-history') || '';
            const image = card.getAttribute('data-image') || '';
            const rawHighlights = card.getAttribute('data-highlights') || '';

            if (topicIcon) topicIcon.innerText = icon;
            if (topicTitle) topicTitle.innerText = title;
            if (topicImg) topicImg.src = image;
            if (topicFullHistory) topicFullHistory.innerText = fullHistory;

            if (topicHighlightsList) {
                topicHighlightsList.innerHTML = '';
                if (rawHighlights) {
                    const items = rawHighlights.split('||');
                    items.forEach(itemText => {
                        if (itemText.trim()) {
                            const li = document.createElement('li');
                            li.innerText = itemText.trim();
                            topicHighlightsList.appendChild(li);
                        }
                    });
                }
            }

            if (topicModal) topicModal.classList.add('active');
        });
    });

    if (topicModalClose && topicModal) {
        topicModalClose.addEventListener('click', () => {
            topicModal.classList.remove('active');
        });
        topicModal.addEventListener('click', (e) => {
            if (e.target === topicModal) {
                topicModal.classList.remove('active');
            }
        });
    }
});
