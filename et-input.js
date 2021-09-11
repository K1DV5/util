const firstChars = {
    h: 'ሀ',
    l: 'ለ',
    H: 'ሐ',
    m: 'መ',
    S: 'ሠ',
    r: 'ረ',
    s: 'ሰ',
    q: 'ቀ',
    b: 'በ',
    t: 'ተ',
    c: 'ቸ',
    n: 'ነ',
    N: 'ኘ',
    x: 'አ',
    k: 'ከ',
    w: 'ወ',
    X: 'ዐ',
    z: 'ዘ',
    Z: 'ዠ',
    Y: 'የ',
    d: 'ደ',
    j: 'ጀ',
    g: 'ገ',
    T: 'ጠ',
    C: 'ጨ',
    P: 'ጰ',
    f: 'ፈ',
    p: 'ፐ',
    v: 'ቨ',
}
const capsChars = {  // lower cases are when shift is held as well
    S: 'ሸ',
    H: 'ኀ',
    h: 'ኸ',
    T: 'ጸ',
    t: 'ፀ',
}
const afterChars = {
    'LWA': 'ሏ', 
    'hWA': 'ሗ', 
    'MWA': 'ሟ', 
    'RWA': 'ሯ', 
    'SWA': 'ሷ', 
    'sWA': 'ሿ', 
    'QWA': 'ቋ', 
    'BWA': 'ቧ', 
    'TWA': 'ቷ', 
    'CWA': 'ቿ', 
    'HWA': 'ኋ', 
    'NWA': 'ኗ', 
    'nWA': 'ኟ', 
    'KWA': 'ኳ', 
    'ZWA': 'ዟ', 
    'zWA': 'ዧ', 
    'DWA': 'ዷ', 
    'JWA': 'ጇ', 
    'GWA': 'ጓ', 
    'tWA': 'ጧ', 
    'cWA': 'ጯ', 
    'pWA': 'ጷ', 
    'twA': 'ጿ', 
    'FWA': 'ፏ', 
    'PWA': 'ፗ', 
}
const vowels = {
    u: 1,
    i: 2,
    a: 3,
    y: 4,
    e: 5,
    o: 6,
    U: 1,
    I: 2,
    A: 3,
    Y: 4,
    E: 5,
    O: 6,
}

customElements.define('et-input', class extends HTMLInputElement {
    static get observedAttributes() {
        return ['data-on']
    }

    constructor() {
        super()
        if (this.type !== 'text') return
        this.lastChars = ''
    }

    attributeChangedCallback(name, old, anew) {
        if (old == null || old == 'false') {
            if (anew == 'true') {
                this.addEventListener('keydown', this.onKeyDown)
            }
        } else if (anew == 'false') {
            this.removeEventListener('keydown', this.onKeyDown)
        }
    }

    arrangeLast(newChar, capsOn) {
        const max = capsOn ? 3 : 2
        this.lastChars += newChar
        if (this.lastChars.length > max) {
            this.lastChars = this.lastChars.slice(1)
        }
    }

    onKeyDown(e) {
        if (e.keyCode < 65 || e.keyCode > 90 || e.ctrlKey || e.modKey || !e.getModifierState) return
        let char = e.key, capsOn = e.getModifierState('CapsLock')
        this.arrangeLast(char, capsOn)
        let firsts = capsOn ? capsChars : firstChars
        if (firsts[char]) {
            this.insertChar(firsts[char])
        } else if (vowels[char]) {
            if (afterChars[this.lastChars]) {
                if (capsChars[this.lastChars[0]]) {
                    this.selectionStart -= 1
                }
                this.insertChar(afterChars[this.lastChars])
            } else {
                let lastChar = this.lastChars.slice(-2, -1)
                let lastCode = firsts[lastChar]?.charCodeAt(0)
                if (lastCode) {
                    this.selectionStart -= 1
                    this.insertChar(String.fromCharCode(lastCode + vowels[char]))
                }
            }
        }
        e.preventDefault()
    }

    insertChar(char) {
        let start = this.selectionStart
        let end = this.selectionEnd
        let old = this.value
        this.value = old.slice(0, start) + char + old.slice(end)
        this.selectionStart = this.selectionEnd = start + 1
    }
}, {extends: 'input'})
