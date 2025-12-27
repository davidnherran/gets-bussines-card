class BusinessCard extends HTMLElement {
  static get observedAttributes() {
    return [
      "brand",
      "subtitle",
      "name",
      "role",
      "phone",
      "email",
      "nit",
      "address",
      "logo",
      "variant",
      "show-qr",
      "floating",
      "position"
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  attributeChangedCallback(attr, _, value) {
    const prop = attr.replace(/-([a-z])/g, g => g[1].toUpperCase());
    this[prop] = value;
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  get showQr() {
    return this.hasAttribute("show-qr");
  }

  get floating() {
    return this.hasAttribute("floating");
  }

  get position() {
    return this.getAttribute("position") || "bottom-right";
  }

  get whatsappUrl() {
    return this.phone ? `https://wa.me/${this.phone}` : "";
  }
  
  qrSvg() {
    // Formato vCard 3.0 mejorado con saltos de línea CRLF y campos completos
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      this.name ? `FN:${this.name}` : null,
      this.name ? `N:${this.name.split(' ').reverse().join(';')};;;` : null,
      this.role ? `TITLE:${this.role}` : null,
      this.phone ? `TEL;TYPE=CELL:${this.phone.replace(/\D/g, '')}` : null,
      this.email ? `EMAIL;TYPE=INTERNET:${this.email}` : null,
      this.address ? `ADR;TYPE=WORK:;;${this.address};;;;` : null,
      'END:VCARD'
    ].filter(Boolean).join('\r\n');

    // Aumentar tamaño para mejor lectura y añadir margen
    return `<img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=4&data=${encodeURIComponent(vcard)}" style="width:72px;height:72px"/>`;
  }

  render() {
    const variant = this.variant || "wine";
    const position = this.position;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          font-family: system-ui, -apple-system;
        }

        .wine { --bg:#8e3b46; --fg:#fff; }
        .graphite { --bg:#2e2e2e; --fg:#fff; }
        .navy { --bg:#1f2a44; --fg:#fff; }
        .sand { --bg:#f2ede4; --fg:#1a1a1a; }

        .fab {
          position: fixed;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--bg);
          color: var(--fg);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 12px 30px rgba(0,0,0,.25);
          z-index: 9999;
          transition: transform 180ms cubic-bezier(.2,.8,.2,1);
        }

        .fab:hover {
          transform: scale(1.08);
        }

        .wrapper {
          position: fixed;
          opacity: 0;
          pointer-events: none;
          transform: translateY(10px) scale(.96);
          transition:
            opacity 200ms ease,
            transform 260ms cubic-bezier(.2,.8,.2,1);
          z-index: 9999;
        }

        .wrapper.open {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0) scale(1);
        }

        .pos-bottom-right { bottom: 24px; right: 24px; }
        .pos-bottom-left { bottom: 24px; left: 24px; }
        .pos-top-right { top: 24px; right: 24px; }
        .pos-top-left { top: 24px; left: 24px; }

        .wrapper.pos-bottom-right { bottom: 24px; right: 96px; }
        .wrapper.pos-bottom-left { bottom: 24px; left: 96px; }
        .wrapper.pos-top-right { top: 24px; right: 96px; }
        .wrapper.pos-top-left { top: 24px; left: 96px; }

        .card {
          width: 360px;
          height: 210px;
          perspective: 1000px;
        }

        .inner {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 420ms cubic-bezier(.2,.8,.2,1);
          will-change: transform;
        }

        .card:hover .inner,
        .card.open .inner {
          transform: rotateY(180deg) scale(1.015);
        }

        .face {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 18px;
          box-sizing: border-box;
          backface-visibility: hidden;
          background: var(--bg);
          color: var(--fg);
          box-shadow: 0 14px 40px rgba(0,0,0,.18);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .back {
          transform: rotateY(180deg);
          align-items: stretch;
        }

        .logo {
          max-width: 120px;
          max-height: 60px;
          margin-bottom: 12px;
        }

        .brand {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 1px;
          text-align: center;
        }

        .subtitle {
          font-size: 12px;
          opacity: .85;
          text-align: center;
        }

        .content {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          height: 100%;
        }

        .person strong {
          display: block;
          font-size: 16px;
        }

        .person span {
          font-size: 12px;
          opacity: .85;
        }

        .contact {
          font-size: 12px;
          line-height: 1.6;
        }

        .wa {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          color: inherit;
          font-weight: 600;
        }

        .wa svg {
          width: 14px;
          height: 14px;
          fill: currentColor;
        }

        .legal {
          font-size: 10px;
          opacity: .75;
          margin-top: auto;
        }

        .qr {
          width: 72px;
          height: 72px;
          background: #fff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      </style>

      ${this.floating ? `
        <div class="fab ${variant} pos-${position}" id="fab">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M17 8.5C17 5.73858 14.7614 3.5 12 3.5C9.23858 3.5 7 5.73858 7 8.5C7 11.2614 9.23858 13.5 12 13.5C14.7614 13.5 17 11.2614 17 8.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"></path>
            <path d="M19 20.5C19 16.634 15.866 13.5 12 13.5C8.13401 13.5 5 16.634 5 20.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"></path>
          </svg>
        </div>

        <div class="wrapper pos-${position}" id="wrapper">
          ${this.cardHtml(variant)}
        </div>
      ` : this.cardHtml(variant)}
    `;

    if (this.floating) {
      const fab = this.shadowRoot.getElementById("fab");
      const wrapper = this.shadowRoot.getElementById("wrapper");

      fab.onclick = () => wrapper.classList.toggle("open");

      document.addEventListener("click", e => {
        if (!this.contains(e.target)) wrapper.classList.remove("open");
      });
    }
  }

  cardHtml(variant) {
    return `
      <div class="card">
        <div class="inner ${variant}">
          <div class="face front ${variant}">
            ${this.logo ? `<img class="logo" src="${this.logo}">` : ""}
            ${this.brand ? `<div class="brand">${this.brand}</div>` : ""}
            ${this.subtitle ? `<div class="subtitle">${this.subtitle}</div>` : ""}
          </div>

          <div class="face back ${variant}">
            <div class="content">
              <div>
                ${this.name ? `<div class="person"><strong>${this.name}</strong>${this.role ? `<span>${this.role}</span>` : ""}</div>` : ""}
                <div class="contact">
                  ${this.phone ? `
                    <a class="wa" href="${this.whatsappUrl}" target="_blank">
                     <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" class="injected-svg" data-src="https://cdn.hugeicons.com/icons/whatsapp-duotone-standard.svg?v=1.0.1" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" color="#000000">
                        <path opacity="0.4" fill-rule="evenodd" clip-rule="evenodd" d="M12.002 1.99805C17.5259 1.99805 22.0039 6.47608 22.0039 12C22.0039 17.5239 17.5259 22.0019 12.002 22.002C10.1018 22.002 8.4856 21.5861 6.97266 20.666L2.00195 22L3.34375 17.0049C2.43381 15.4978 2 13.8889 2 12C2 6.47607 6.47803 1.99805 12.002 1.99805ZM11.6221 15.4209C13.1126 16.3912 14.9993 17 17 17V14L13.498 13.5L11.6221 15.4209ZM7 7C7.00021 8.76799 7.54961 10.6891 8.62305 12.374L10.4971 10.5L10 7H7Z" fill="#000000"></path>
                        <path d="M12.0019 22.002C17.5259 22.002 22.0039 17.5239 22.0039 12C22.0039 6.47607 17.5259 1.99805 12.0019 1.99805C6.47802 1.99805 2 6.47607 2 12C2 13.8889 2.43396 15.4979 3.34399 17.005L2.00177 22L6.97239 20.666C8.48539 21.5862 10.1017 22.002 12.0019 22.002Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                        <path d="M8.6175 12.4037L10.4966 10.5L10.0004 7H7C7.00036 10 8.58063 13.4407 11.6225 15.4209M11.6225 15.4209C13.1131 16.3912 14.9993 17 17 17V14L13.4982 13.5L11.6225 15.4209Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                      </svg>
                      ${this.phone}
                    </a>` : ""}
                  ${this.email ? `<div>${this.email}</div>` : ""}
                </div>
                <div class="legal">
                  ${this.nit ? `<div>${this.nit}</div>` : ""}
                  ${this.address ? `<div>${this.address}</div>` : ""}
                </div>
              </div>
              ${this.showQr ? `<div class="qr">${this.qrSvg()}</div>` : ""}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("business-card", BusinessCard);
