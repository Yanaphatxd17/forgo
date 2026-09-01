document.addEventListener('DOMContentLoaded', () => {
    const speakButtons = document.querySelectorAll('.ai-speech-btn');
    const topicSpeakBtn = document.getElementById('topicSpeakBtn');
    let activeSpeechButton = null;
    let lastSpeechTimer = null;
    let speechSessionToken = 0;

    function setSpeechButtonState(button, isSpeaking) {
        if (!button) return;
        button.classList.toggle('is-speaking', isSpeaking);
        button.innerHTML = isSpeaking ? '⏸️ หยุด AI' : '🤖 AI พูด';
    }

    function getSpeechText(title, fullHistory, rawHighlights) {
        const highlights = rawHighlights ? rawHighlights.split('||').map(item => item.trim()).filter(Boolean) : [];
        const combined = highlights.length ? ` จุดเด่นสำคัญคือ ${highlights.join(', ')}.` : '';
        return `${title}. ${fullHistory}${combined}`;
    }

    function resolveThaiVoice() {
        if (!('speechSynthesis' in window)) return null;
        const voices = window.speechSynthesis.getVoices();
        const thaiVoice = voices.find(voice => /th|thai/i.test(voice.lang) || /thai/i.test(voice.name));
        return thaiVoice || voices[0] || null;
    }

    function stopSpeech() {
        speechSessionToken += 1;

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        if (activeSpeechButton) {
            setSpeechButtonState(activeSpeechButton, false);
            activeSpeechButton = null;
        }
        if (lastSpeechTimer) {
            clearTimeout(lastSpeechTimer);
            lastSpeechTimer = null;
        }
    }

    function clearSpeechRestartTimer() {
        if (lastSpeechTimer) {
            clearTimeout(lastSpeechTimer);
            lastSpeechTimer = null;
        }
    }

    function buildSpeechChunks(text) {
        const cleaned = text.replace(/\s+/g, ' ').trim();
        const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
        const chunks = [];
        let current = '';

        sentences.forEach(sentence => {
            const candidate = current ? `${current} ${sentence}` : sentence;
            if (candidate.length <= 180) {
                current = candidate;
            } else {
                if (current) chunks.push(current);
                const parts = sentence.match(/.{1,160}/g) || [sentence];
                current = parts.join(' ');
            }
        });

        if (current) chunks.push(current);
        return chunks.length ? chunks : [cleaned];
    }

    function speakTopicText(title, fullHistory, rawHighlights, button) {
        if (!('speechSynthesis' in window)) {
            alert('เบราว์เซอร์นี้ไม่รองรับข้อความอ่านเสียง AI กรุณาใช้ Chrome หรือ Edge');
            return;
        }

        const text = getSpeechText(title, fullHistory, rawHighlights);
        const voice = resolveThaiVoice();

        if (button && button.classList.contains('is-speaking')) {
            stopSpeech();
            return;
        }

        if (activeSpeechButton && activeSpeechButton !== button) {
            setSpeechButtonState(activeSpeechButton, false);
        }

        clearSpeechRestartTimer();
        const sessionToken = ++speechSessionToken;
        activeSpeechButton = button || null;
        window.speechSynthesis.cancel();

        const chunks = buildSpeechChunks(text);
        let chunkIndex = 0;

        const playNextChunk = () => {
            if (sessionToken !== speechSessionToken) {
                return;
            }

            if (chunkIndex >= chunks.length) {
                if (button) setSpeechButtonState(button, false);
                activeSpeechButton = null;
                return;
            }

            const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
            utterance.lang = 'th-TH';
            utterance.rate = 0.9;
            utterance.pitch = 1.18;
            utterance.volume = 1;

            if (voice) {
                utterance.voice = voice;
            }

            if (voice && /th|thai/i.test(voice.lang || voice.name)) {
                utterance.rate = 0.88;
                utterance.pitch = 1.2;
            }

            utterance.onboundary = () => {
                if (speechSynthesis && speechSynthesis.paused) {
                    speechSynthesis.resume();
                }
            };

            utterance.onend = () => {
                if (sessionToken !== speechSessionToken) {
                    return;
                }
                chunkIndex += 1;
                playNextChunk();
            };

            utterance.onerror = () => {
                if (sessionToken !== speechSessionToken) {
                    return;
                }
                chunkIndex += 1;
                playNextChunk();
            };

            if (button) {
                setSpeechButtonState(button, true);
            }

            window.speechSynthesis.speak(utterance);
        };

        playNextChunk();
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
            if (!voices.length) return;
            if (activeSpeechButton) {
                const currentButton = activeSpeechButton;
                const currentSessionToken = speechSessionToken;
                const currentTitle = currentButton.getAttribute('data-title') || document.getElementById('topicTitle')?.innerText || '';
                const currentText = currentButton.getAttribute('data-full-history') || document.getElementById('topicFullHistory')?.innerText || '';
                const currentHighlights = currentButton.getAttribute('data-highlights') || Array.from(document.querySelectorAll('#topicHighlightsList li')).map(li => li.innerText.trim()).join('||');
                clearSpeechRestartTimer();
                lastSpeechTimer = setTimeout(() => {
                    if (activeSpeechButton === currentButton && currentSessionToken === speechSessionToken) {
                        speakTopicText(currentTitle, currentText, currentHighlights, currentButton);
                    }
                }, 150);
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
