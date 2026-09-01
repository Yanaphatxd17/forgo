document.addEventListener('DOMContentLoaded', () => {
    const speakButtons = document.querySelectorAll('.ai-speech-btn');
    const topicSpeakBtn = document.getElementById('topicSpeakBtn');
    let activeSpeechButton = null;

    function setSpeechButtonState(button, isSpeaking) {
        if (!button) return;
        button.classList.toggle('is-speaking', isSpeaking);
        if (isSpeaking) {
            button.innerHTML = '⏸️ หยุด AI';
        } else {
            button.innerHTML = '🤖 AI พูด';
        }
    }

    function getSpeechText(title, fullHistory, rawHighlights) {
        const highlights = rawHighlights ? rawHighlights.split('||').map(item => item.trim()).filter(Boolean) : [];
        const combined = highlights.length ? ` จุดเด่นสำคัญคือ ${highlights.join(', ')}.` : '';
        return `${title}. ${fullHistory}${combined}`;
    }

    function speakTopicText(title, fullHistory, rawHighlights, button) {
        if (!('speechSynthesis' in window)) {
            alert('เบราว์เซอร์นี้ไม่รองรับฟีเจอร์อ่านเสียง AI กรุณาใช้เบราว์เซอร์ที่รองรับ');
            return;
        }

        const text = getSpeechText(title, fullHistory, rawHighlights);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'th-TH';
        utterance.rate = 0.95;
        utterance.pitch = 1;

        const voices = window.speechSynthesis.getVoices();
        const thaiVoice = voices.find(voice => /th/i.test(voice.lang) || /thai/i.test(voice.name));
        if (thaiVoice) {
            utterance.voice = thaiVoice;
        }

        if (activeSpeechButton && activeSpeechButton !== button) {
            setSpeechButtonState(activeSpeechButton, false);
        }

        activeSpeechButton = button || null;

        if (button && button.classList.contains('is-speaking')) {
            window.speechSynthesis.cancel();
            setSpeechButtonState(button, false);
            activeSpeechButton = null;
            return;
        }

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);

        if (button) {
            setSpeechButtonState(button, true);
        }

        utterance.onend = () => {
            if (button) {
                setSpeechButtonState(button, false);
            }
            if (activeSpeechButton === button) {
                activeSpeechButton = null;
            }
        };

        utterance.onerror = () => {
            if (button) {
                setSpeechButtonState(button, false);
            }
            if (activeSpeechButton === button) {
                activeSpeechButton = null;
            }
        };
    }

    speakButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const title = button.getAttribute('data-title') || '';
            const fullHistory = button.getAttribute('data-full-history') || '';
            const rawHighlights = button.getAttribute('data-highlights') || '';
            speakTopicText(title, fullHistory, rawHighlights, button);
        });
    });

    if (topicSpeakBtn) {
        topicSpeakBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            const title = document.getElementById('topicTitle')?.innerText || '';
            const fullHistory = document.getElementById('topicFullHistory')?.innerText || '';
            const rawHighlights = Array.from(document.querySelectorAll('#topicHighlightsList li')).map(li => li.innerText.trim()).join('||');
            speakTopicText(title, fullHistory, rawHighlights, topicSpeakBtn);
        });
    }

    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length && activeSpeechButton) {
                const currentButton = activeSpeechButton;
                const currentTitle = currentButton.getAttribute('data-title') || document.getElementById('topicTitle')?.innerText || '';
                const currentText = currentButton.getAttribute('data-full-history') || document.getElementById('topicFullHistory')?.innerText || '';
                const currentHighlights = currentButton.getAttribute('data-highlights') || Array.from(document.querySelectorAll('#topicHighlightsList li')).map(li => li.innerText.trim()).join('||');
                speakTopicText(currentTitle, currentText, currentHighlights, currentButton);
            }
        };
    }

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

            if (topicSpeakBtn) {
                topicSpeakBtn.setAttribute('data-title', title);
                topicSpeakBtn.setAttribute('data-full-history', fullHistory);
                topicSpeakBtn.setAttribute('data-highlights', rawHighlights);
                setSpeechButtonState(topicSpeakBtn, false);
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
