// TextStreamer with ChatGPT-style UI and animation + real input box
class TextStreamer {
  constructor(target, options = {}) {
    this.element = typeof target === "string" ? document.querySelector(target) : target;
    if (!this.element && typeof target === "string") {
      this.element = document.createElement("div");
      this.element.id = target.replace(/^#/, "");
      (options.appendTo || document.body).appendChild(this.element);
    }
    if (!this.element) throw new Error("Invalid element or selector provided.");

    if (typeof marked === "undefined") {
      console.warn("Marked.js is required. Include it via CDN or install it.");
    }

    this.options = {
      speed: options.speed || 20,
      cursorStyle: options.cursorStyle || "hidden",
      markdown: options.markdown !== false,
      fadeDuration: options.fadeDuration || 400,
      onStart: options.onStart || function () {},
      onPause: options.onPause || function () {},
      onResume: options.onResume || function () {},
      onComplete: options.onComplete || function () {},
      reset: options.reset || "reset"
    };

    this.queue = [];
    this.currentIndex = 0;
    this.typing = false;
    this.timeout = null;

    this.cursorElement = document.createElement("span");
    this.cursorElement.textContent = "|";
    this.applyCursorStyle();
    this.element.appendChild(this.cursorElement);
  }

  applyCursorStyle() {
    if (this.options.cursorStyle === "hidden") {
      this.cursorElement.style.display = "none";
    } else if (this.options.cursorStyle === "solid") {
      this.cursorElement.style.animation = "none";
    } else {
      this.cursorElement.style.animation = "blink 1s infinite";
    }
  }

  start(markdownText) {
    if (this.typing) this.stop();
    if (this.options.reset == "reset") this.element.innerHTML = "";

    const html = this.options.markdown && typeof marked !== "undefined"
      ? marked.parse(markdownText)
      : markdownText;

    const temp = document.createElement("div");
    temp.innerHTML = html;
    this.queue = [];
    this._buildQueue(temp, this.element);

    this.currentIndex = 0;
    this.typing = true;
    this.options.onStart();
    this._stream();
  }

  _buildQueue(sourceNode, parentNode) {
    sourceNode.childNodes.forEach(child => {
      if (child.nodeType === 3) {
        const parts = child.textContent.split(/(\s+)/);
        parts.forEach(part => {
          if (part.length > 0) {
            if (/^\s+$/.test(part)) {
              this.queue.push(() => {
                parentNode.appendChild(document.createTextNode(part));
              });
            } else {
              this.queue.push(() => {
                const span = document.createElement("span");
                span.textContent = part;
                span.style.opacity = "0";
                span.style.transition = `opacity ${this.options.fadeDuration}ms ease-in-out`;
                parentNode.appendChild(span);

                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    span.style.opacity = "1";
                    const entry = span.closest('.chat-entry');
                    if (entry) {
                      entry.scrollIntoView({ behavior: 'auto', block: 'start' });
                    }
                  });
                });
              });
            }
          }
        });
      } else if (child.nodeType === 1) {
        const newEl = document.createElement(child.tagName);
        [...child.attributes].forEach(attr => newEl.setAttribute(attr.name, attr.value));

        this.queue.push(() => {
          parentNode.appendChild(newEl);
        });

        this._buildQueue(child, newEl);
      }
    });
  }

  _stream() {
    if (!this.typing || this.currentIndex >= this.queue.length) {
      this._onComplete();
      return;
    }

    this.queue[this.currentIndex]();
    const scrollParent = this.element.closest('.chat-history');
    if (scrollParent) {
      scrollParent.scrollTo({ top: scrollParent.scrollHeight, behavior: 'smooth' });
    }
    this.element.scrollTop = this.element.scrollHeight;
    this.element.appendChild(this.cursorElement);
    this.currentIndex++;

    this.timeout = setTimeout(() => this._stream(), this.options.speed);
  }

  pause() {
    this.typing = false;
    clearTimeout(this.timeout);
    this.options.onPause();
  }

  resume() {
    if (!this.typing) {
      this.typing = true;
      this.options.onResume();
      this._stream();
    }
  }

  stop() {
    this.typing = false;
    clearTimeout(this.timeout);
    this.element.innerHTML = "";
    this.element.appendChild(this.cursorElement);
  }

  _onComplete() {
    this.typing = false;
    this.cursorElement.remove();
    this.options.onComplete();
  }
}

class widgetRenderer {
  constructor(target, options = {}) {
    this.element = typeof target === "string" ? document.querySelector(target) : target;
    if (!this.element && typeof target === "string") {
      this.element = document.createElement("div");
      this.element.id = target.replace(/^#/, "");
      (options.appendTo || document.body).appendChild(this.element);
    }
    if (!this.element) throw new Error("Invalid element or selector provided.");

    this.options = {
      type: options.type || 'chart',
      onStart: options.onStart || function () {},
      onPause: options.onPause || function () {},
      onResume: options.onResume || function () {},
      onComplete: options.onComplete || function () {},
    };
  }

  start() {
    const widget = document.createElement("div");
    widget.className = 'widget';
    this.element.appendChild(widget);

    const canvas = document.createElement("canvas");
    canvas.className = 'chart';
    widget.appendChild(canvas);

    console.log(this.options.type)
    if (this.options.type == 'chart') {
      new Chart(canvas, {
        type: 'bar',
        data: {
          labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
          datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }

    gsap.fromTo(widget, { opacity: 0, scale: 0.96 }, { delay: .4, opacity: 1, scale: 1, duration: .6, ease: "power2.out" });

    const scrollParent = this.element.closest('.chat-history');
    if (scrollParent) {
      scrollParent.scrollTo({ top: scrollParent.scrollHeight, behavior: 'smooth' });
    }
    this.element.scrollTop = this.element.scrollHeight;

    if (true) {
      this._onComplete();
      return;
    }
  }

  stop() {
  }

  _onComplete() {
    this.options.onComplete();
  }
}

// Load external stylesheet
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "style.css";
document.head.appendChild(link);

// Chat UI demo with real input
const chatExamples = [
  {
    q: "What is JavaScript?",
    a: [
      `**JavaScript** is a versatile, high-level programming language primarily used to enhance web pages and build interactive websites. It is one of the core technologies of the World Wide Web, alongside HTML and CSS. JavaScript enables the implementation of complex features such as real-time updates, interactive maps, animated graphics, and more.

Originally developed for client-side web development, JavaScript has since evolved into a robust, multi-paradigm language that can also be used on the server side (thanks to environments like Node.js). With an extensive ecosystem and widespread community support, JavaScript remains one of the most popular and essential programming languages in the world.`
, { type: 'chart' }
// , `**Markdown** is a lightweight markup language designed to be easy to write and read, using plain text formatting. It allows users to format text using simple syntax, which is then converted into HTML. For instance, surrounding a word with double asterisks (\*\*bold\*\*) will render it in bold.

// Markdown is commonly used in README files, documentation, blogs, and messaging platforms. Its simplicity and ease of use make it a preferred format for many writers and developers who want to produce rich formatted text without the complexity of HTML tags.`

    ]
  },
  {
    q: "How does Markdown work?",
    a: [
      `**Markdown** is a lightweight markup language designed to be easy to write and read, using plain text formatting. It allows users to format text using simple syntax, which is then converted into HTML. For instance, surrounding a word with double asterisks (\*\*bold\*\*) will render it in bold.

Markdown is commonly used in README files, documentation, blogs, and messaging platforms. Its simplicity and ease of use make it a preferred format for many writers and developers who want to produce rich formatted text without the complexity of HTML tags.`
    ]
  },
  {
    q: "What is the difference between `var`, `let`, and `const` in JavaScript?",
    a: [`JavaScript provides three ways to declare variables: \`var\`, \`let\`, and \`const\`. Each has its own scope rules and use cases.

- \`var\` is function-scoped and allows both redeclaration and reassignment. It's considered outdated due to hoisting issues.
- \`let\` is block-scoped and allows reassignment but not redeclaration in the same scope. It's the recommended option for mutable variables.
- \`const\` is also block-scoped and must be assigned at declaration. It does not allow reassignment, ensuring the variable reference remains constant.`
    ]
  },
  {
    q: "What is an API?",
    a: [`An **API** (Application Programming Interface) is a set of definitions and protocols that allows software programs to communicate with each other. APIs abstract the internal workings of a system and expose only those parts that are necessary for interaction.

APIs are used everywhere — from web services like REST APIs to operating system interfaces. They make it easier to develop software by providing reusable building blocks and enabling integration between different systems.`
    ]
  },
  {
    q: "Explain event delegation in JavaScript.",
    a: [`**Event delegation** is a pattern in JavaScript that uses event bubbling to efficiently handle events at a higher level in the DOM. Instead of attaching event listeners to each child element individually, a single event listener is added to a common parent.

When an event is triggered, it bubbles up from the target element to its ancestors. The parent element can then respond to events triggered by its children. This approach simplifies code and improves performance, especially in cases where many elements are dynamically added or removed.`
    ]
  }
];

let currentExampleIndex = 0;
const chatContainer = document.createElement("div");
chatContainer.className = "chat-box";

const history = document.createElement("div");
history.className = "chat-history zero";
history.style.display = "flex";
history.style.flexDirection = "column";

chatContainer.appendChild(history);

const inputWrap = document.createElement("form");
inputWrap.className = "chat-input";
const input = document.createElement("textarea");
input.placeholder = "Send a message...";
input.autocomplete = "off";
input.rows = 1;
input.style.overflow = 'hidden';
input.style.resize = 'none';
input.addEventListener("input", () => {
  input.style.height = 'auto';
  input.style.height = `${input.scrollHeight - 4}px`;
});
input.addEventListener("keydown", (e) => {
  document.body.classList.add("gradient");
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    inputWrap.requestSubmit();
  }
});
inputWrap.appendChild(input);

input.addEventListener("focus", () => {
  document.body.classList.add("gradient");
}, false);

input.addEventListener("blur", () => {
  document.body.classList.remove("gradient");
}, false);

inputWrap.onsubmit = (e) => {
  document.body.classList.remove("gradient");
  e.preventDefault();
  const userInput = input.value.trim();
  if (!userInput) return;

  const qaBlock = document.createElement("div");
  qaBlock.className = "chat-entry";

  const qaBlocks = document.querySelectorAll('.chat-entry');
  if (qaBlocks) {
    console.log(qaBlocks.length);
    for (let i = 0; i < qaBlocks.length; i++) {
      const b = qaBlocks[i];
      console.log(b);
      b.style.height = 'auto';
    }
  }

  const question = document.createElement("div");
  question.className = "question";
  question.textContent = userInput;
  qaBlock.appendChild(question);

  const answer = document.createElement("div");
  answer.className = "answer";
  qaBlock.appendChild(answer);

  if (history.classList.contains('zero')) {
    setTimeout(() => {
      const chatTitle = document.querySelector('#chatTitle');
      new TextStreamer(chatTitle, {
        speed: 100 
      }).start('Learn about JavaScript');
    }, 1000);
  }
  history.classList.remove('zero');
  history.appendChild(qaBlock);
  qaBlock.style.height = history.offsetHeight + 'px';
  qaBlock.scrollIntoView({ behavior: "smooth", block: "end" });

  // Demo answer logic
  const match = chatExamples.find(ex => ex.q.toLowerCase() === userInput.toLowerCase());
  const answerText = match
    ? match.a
    : [`**You asked:** ${userInput}

_This is a demo answer._`];

  // Add multi-step thinking before actual answer
  const thinkingSteps = match?.thinking || [
    "Analyzing question",
    "Retrieving knowledge",
    "Formulating response"
  ];
  const thinking = document.createElement("div");
  thinking.className = "thinking";
  thinking.style.position = "relative";
  thinking.style.minHeight = "1.5em";
  answer.appendChild(thinking);

  const anim = document.createElement('spline-viewer');
  anim.url = "https://prod.spline.design/VmyOo0Ti-SwyuDnP/scene.splinecode";
  anim.background = "transparent";
  thinking.appendChild(anim);
  gsap.fromTo(anim, { opacity: 0, scale: 0.4 }, { delay: .4, opacity: 0.7, scale: 0.75, duration: 1.6, ease: "power1.out" });
  setTimeout(() => {
    var style = document.createElement( 'style' )
    style.innerHTML = '#logo { display: none !important; }'
    anim.shadowRoot.appendChild( style );
  }, 1);

  let stepIndex = 0;

  function nextStep() {
    const stepText = thinkingSteps[stepIndex];
    const previous = thinking.querySelector('.fade-step:last-of-type');

    const showNewStep = () => {
      const fadeEl = document.createElement("div");
      fadeEl.className = "fade-step gradient-text";
      fadeEl.style.opacity = "0";
      fadeEl.innerHTML = `${stepText}<span class="thinking-dots"><span></span><span></span><span></span></span>`;
      fadeEl.style.whiteSpace = 'nowrap';
      fadeEl.style.transition = 'opacity 800ms ease';
      thinking.appendChild(fadeEl);

      requestAnimationFrame(() => {
        fadeEl.style.opacity = '1';
        const entry = fadeEl.closest('.chat-entry');
        if (entry) {
          entry.scrollIntoView({ behavior: 'auto', block: 'end' });
        }
      });

      const delay = 2400 + Math.random() * 600;

      var idxStreaming = 0;
      const startStreaming = () => {
        const e = answerText[idxStreaming];
        idxStreaming++;
        if (typeof(e) == 'string') {
          new TextStreamer(answer, {
            reset: "keep",
            onComplete: () => {
              if (answerText[idxStreaming]) {
                startStreaming();
              }
              else {
                document.body.classList.remove("gradient");
              }
            }
          }).start(e);
        }
        else {
          new widgetRenderer(answer, {
            type: e.type,
            onComplete: () => {
              if (answerText[idxStreaming]) {
                startStreaming();
              }
              else {
                document.body.classList.remove("gradient");
              }
            }
          }).start();
        }
      };
      
      const doneThinking = () => {
        fadeEl.remove();
        gsap.fromTo(anim, 
          { opacity: 1, scale: 0.75 }, 
          { opacity: 0, scale: 0.4, duration: 1, ease: "power2.out", onComplete: () => {
            thinking.innerHTML = "";

            let thoughts = document.createElement('div');
            thoughts.classList.add('reason');
            let btnThoughts = document.createElement('button');
            btnThoughts.innerHTML = "How I got this answer";
            btnThoughts.className = "expando";
            btnThoughts.style = "margin-left: -1rem;";
            btnThoughts.onclick = toggleExpando;
            thoughts.appendChild(btnThoughts);
            thinking.appendChild(thoughts);
            gsap.fromTo(thoughts, { opacity: 0 }, { opacity: 1, duration: .4, ease: "power2.out"});

            let steps = document.createElement('ol');
            steps.className = 'steps';
            thinkingSteps.forEach( (s) => {
              let step = document.createElement('li');
              let stepTitle = document.createElement('div');
              stepTitle.className = 'stepTitle';
              stepTitle.innerHTML = s;
              let stepDetail = document.createElement('div');
              stepDetail.className = 'stepDetail';
              stepDetail.innerHTML = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ';
              step.appendChild(stepTitle);
              step.appendChild(stepDetail);
              steps.appendChild(step);
            });
            let isThoughtsOn = false;
            btnThoughts.addEventListener('click', () => {
              if (isThoughtsOn) {
                gsap.timeline()
                .to(steps.querySelectorAll('li'), { duration: 0.4, delay: 0.1, opacity: 0, ease: "power3.inOut" })
                .to(steps, { duration: .4, opacity: 0, height: 0, marginTop: 0, marginBottom: 0, ease: "power3.inOut" });
                isThoughtsOn = false;
              }
              else {
                gsap.timeline()
                .to(steps, { duration: .6, delay: 0.1, opacity: 1, height: "auto", marginTop: "1rem", marginBottom: "1.5rem", ease: "power3.out" }) 
                .to(steps.querySelectorAll('li'), { duration: .6, opacity: 1, ease: "power3.inOut", stagger: 0.1 }, '-=0.4');
                isThoughtsOn = true;
              }
            });
            thinking.after(steps);
          } }
        );
        thinking.classList.add('done');
      };

      setTimeout(() => {
        stepIndex++;
        if (stepIndex < thinkingSteps.length) {
          nextStep();
        } else {
          // thinking.remove();
          doneThinking();
          startStreaming();
        }
      }, delay);
    };

    if (previous) {
      previous.style.transition = 'opacity 400ms ease';
      previous.style.opacity = '0';
      setTimeout(() => {
        previous.remove();
        showNewStep();
      }, 600);
    } else {
      showNewStep();
    }
  }

  nextStep();

  input.value = "";
};

chatContainer.appendChild(inputWrap);
document.querySelector('#demo').appendChild(chatContainer);
