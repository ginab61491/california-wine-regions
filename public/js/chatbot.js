// chatbot.js — AI sommelier chat interface with SSE streaming

class ChatBot {
  constructor() {
    this.messages = [];       // [{role, content}]
    this.isStreaming = false;
  }

  init() {
    this.messagesArea = document.getElementById('messages-area');
    this.chatInput    = document.getElementById('chat-input');
    this.sendBtn      = document.getElementById('send-btn');

    this.sendBtn.addEventListener('click', () => this.handleSend());
    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });

    // Auto-resize textarea
    this.chatInput.addEventListener('input', () => {
      this.chatInput.style.height = 'auto';
      this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 120) + 'px';
    });

    // Quick topic buttons
    document.querySelectorAll('.topic-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = btn.dataset.prompt;
        this.chatInput.value = prompt;
        this.chatInput.dispatchEvent(new Event('input'));
        this.handleSend();
      });
    });
  }

  handleSend() {
    const text = this.chatInput.value.trim();
    if (!text || this.isStreaming) return;

    this.chatInput.value = '';
    this.chatInput.style.height = 'auto';
    this.addUserMessage(text);
    this.streamAssistantResponse(text);
  }

  addUserMessage(text) {
    this.messages.push({ role: 'user', content: text });

    const el = document.createElement('div');
    el.className = 'message user-message';
    el.innerHTML = `
      <div class="message-avatar">You</div>
      <div class="message-content">
        <p>${this.escapeHtml(text).replace(/\n/g, '<br>')}</p>
      </div>
    `;
    this.messagesArea.appendChild(el);
    this.scrollToBottom();
  }

  addTypingIndicator() {
    const el = document.createElement('div');
    el.className = 'message assistant-message';
    el.id = 'typing-indicator';
    el.innerHTML = `
      <div class="message-avatar">🍷</div>
      <div class="message-content">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    this.messagesArea.appendChild(el);
    this.scrollToBottom();
    return el;
  }

  async streamAssistantResponse(userText) {
    this.isStreaming = true;
    this.sendBtn.disabled = true;

    const typingEl = this.addTypingIndicator();

    let fullResponse = '';
    let contentEl = null;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: this.messages }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Server error');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);

            if (parsed.error) {
              throw new Error(parsed.error);
            }

            if (parsed.text) {
              fullResponse += parsed.text;

              // Replace typing indicator with actual message on first token
              if (!contentEl) {
                typingEl.remove();
                const msgEl = document.createElement('div');
                msgEl.className = 'message assistant-message';
                msgEl.innerHTML = `
                  <div class="message-avatar">🍷</div>
                  <div class="message-content" id="streaming-content"></div>
                `;
                this.messagesArea.appendChild(msgEl);
                contentEl = document.getElementById('streaming-content');
              }

              // Render markdown-ish content incrementally
              contentEl.innerHTML = this.renderMarkdown(fullResponse) + '<span class="cursor">▋</span>';
              this.scrollToBottom();
            }
          } catch (parseErr) {
            if (parseErr.message !== 'Unexpected end of JSON input') {
              throw parseErr;
            }
          }
        }
      }

      // Final render without cursor
      if (contentEl) {
        contentEl.innerHTML = this.renderMarkdown(fullResponse);
      }

      // Save assistant message
      this.messages.push({ role: 'assistant', content: fullResponse });

    } catch (err) {
      typingEl.remove();
      const errEl = document.createElement('div');
      errEl.className = 'message assistant-message';
      errEl.innerHTML = `
        <div class="message-avatar">🍷</div>
        <div class="message-content">
          <p><strong>Sorry, something went wrong.</strong> ${this.escapeHtml(err.message)}</p>
          <p>Please check that your <code>ANTHROPIC_API_KEY</code> is set in the <code>.env</code> file and restart the server.</p>
        </div>
      `;
      this.messagesArea.appendChild(errEl);
    } finally {
      this.isStreaming = false;
      this.sendBtn.disabled = false;
      this.chatInput.focus();
      this.scrollToBottom();
    }
  }

  renderMarkdown(text) {
    return text
      // Bold **text** or __text__
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      // Italic *text* or _text_
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Headers ### and ##
      .replace(/^### (.*$)/gm, '<h4>$1</h4>')
      .replace(/^## (.*$)/gm, '<h3>$1</h3>')
      // Unordered lists
      .replace(/^\s*[-*•] (.+)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      // Numbered lists
      .replace(/^\s*\d+\. (.+)/gm, '<li>$1</li>')
      // Code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Paragraphs (double newline)
      .split(/\n\n+/)
      .map(para => {
        para = para.trim();
        if (!para) return '';
        if (para.startsWith('<h') || para.startsWith('<ul') || para.startsWith('<li')) return para;
        // Wrap list items
        if (para.includes('<li>')) {
          return '<ul>' + para + '</ul>';
        }
        return '<p>' + para.replace(/\n/g, '<br>') + '</p>';
      })
      .join('');
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  scrollToBottom() {
    this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
  }
}
