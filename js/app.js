document.addEventListener("DOMContentLoaded", () => {
    const langBtns = document.querySelectorAll('.lang-btn');
    const elementsToTranslate = document.querySelectorAll('[data-i18n]');
    const aiChatInput = document.getElementById('ai-chat-input');
    const aiChatMessages = document.getElementById('ai-chat-messages');
    const aiChatBtn = document.getElementById('ai-chat-btn');

    // Language Switching logic
    function setLanguage(lang) {
        if (!translations[lang]) return;

        // Update active class on buttons
        langBtns.forEach(btn => {
            if (btn.dataset.lang === lang) {
                btn.classList.add('bg-blood', 'text-white', 'border-blood');
                btn.classList.remove('bg-transparent', 'text-ochre', 'border-ochre');
            } else {
                btn.classList.remove('bg-blood', 'text-white', 'border-blood');
                btn.classList.add('bg-transparent', 'text-ochre', 'border-ochre');
            }
        });

        // Update text content
        elementsToTranslate.forEach(el => {
            const key = el.dataset.i18n;
            if (translations[lang][key]) {
                if (el.tagName === 'INPUT' && el.type === 'text') {
                    el.placeholder = translations[lang][key];
                } else {
                    el.innerHTML = translations[lang][key]; 
                }
            }
        });
        
        // Update AI intro message
        const initialAiBubble = document.getElementById('initial-ai-bubble');
        if (initialAiBubble) {
            if (lang === 'ru') initialAiBubble.innerText = "Приветствую, путник. Я летописец хорезмской кампании. Какие тайны прошлого вы ищете?";
            else if (lang === 'kg') initialAiBubble.innerText = "Салам, саякатчы. Мен Хорезм кампаниясынын жылнаамачысымын. Өткөндүн кандай сырларын издеп жатасыз?";
            else initialAiBubble.innerText = "Greetings, traveler. I am the chronicler of the Khwarazmian campaign. What secrets of the past do you seek?";
        }

        // Update document lang
        document.documentElement.lang = lang;
    }

    // Event listeners for language toggle
    langBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.currentTarget.dataset.lang;
            setLanguage(lang);
        });
    });

    // AI Historian logic (Groq API)
    const groqApiKey = "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";
    let chatHistory = [];

    aiChatBtn.addEventListener('click', async () => {
        const text = aiChatInput.value.trim();
        if(!text) return;

        // User message
        const userMsg = document.createElement('div');
        userMsg.className = 'flex justify-end mb-4 chat-bubble';
        userMsg.innerHTML = `
            <div class="bg-ochre text-charcoal p-3 rounded-lg max-w-xs shadow font-sans text-sm font-medium">
                ${text}
            </div>
        `;
        aiChatMessages.appendChild(userMsg);
        aiChatInput.value = '';

        // Auto scroll
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

        // Loading state
        const lang = document.documentElement.lang || 'en';
        let loadingText = "...";
        if (lang === 'ru') loadingText = "Изучаю свитки...";
        else if (lang === 'kg') loadingText = "Санжыраларды кароодо...";
        else loadingText = "Consulting the scrolls...";

        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'flex justify-start mb-4 chat-bubble';
        loadingMsg.innerHTML = `
            <div class="bg-blood/60 text-white/70 p-3 rounded-lg max-w-xs shadow font-sans text-sm italic">
                ${loadingText}
            </div>
        `;
        aiChatMessages.appendChild(loadingMsg);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

        try {
            // Build the conversation payload
            const systemPrompt = `You are a medieval chronicler witnessing the Fall of the Khwarazm Empire to the Mongols (1219-1221). 
Respond accurately with historical facts. Be objective but gritty. 
IMPORTANT: You MUST respond in this language code: ${lang.toUpperCase()}`;
            
            chatHistory.push({ role: "user", content: text });

            const payload = {
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...chatHistory
                ]
            };

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${groqApiKey}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.text();
                throw new Error(`HTTP ${response.status}: ${errData}`);
            }
            
            const data = await response.json();
            const replyText = data.choices[0].message.content;
            
            // Save to history
            chatHistory.push({ role: "assistant", content: replyText });

            aiChatMessages.removeChild(loadingMsg);

            const aiMsg = document.createElement('div');
            aiMsg.className = 'flex justify-start mb-4 chat-bubble';
            // Convert simple markdown-like elements
            const formattedReply = replyText.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
            
            aiMsg.innerHTML = `
                <div class="bg-blood/90 text-white p-3 rounded-lg max-w-xs shadow font-sans text-sm">
                    ${formattedReply}
                </div>
            `;
            aiChatMessages.appendChild(aiMsg);
            aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

        } catch (error) {
            console.error("Groq Error:", error);
            aiChatMessages.removeChild(loadingMsg);
            
            const errorMsg = document.createElement('div');
            errorMsg.className = 'flex justify-start mb-4 chat-bubble';
            errorMsg.innerHTML = `
                <div class="bg-red-900/90 text-white p-3 rounded-lg max-w-xs shadow font-sans text-sm">
                    <strong>Error:</strong> ${error.message}
                </div>
            `;
            aiChatMessages.appendChild(errorMsg);
            aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
        }
    });

    // Enter key submit
    aiChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            aiChatBtn.click();
        }
    });

    // Initial setup
    setLanguage('en');
});
