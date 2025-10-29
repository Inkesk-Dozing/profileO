# Profile
<p align="center"><strong>The Echo Is Never Silent,<br>
Genesis Hums With Memory.</strong></p>

<p align="center">
Created by Inkesk<br>
Powered by OSKA<br>
Under ØSKA
</p>

<div align="center"><strong>.</strong></div>

---

# 🌐 Harsh Dev Jha — Personal Portfolio

Welcome!  
This is my assignment submission for building a *responsive personal portfolio website* using **semantic HTML5** and **external CSS**. The project demonstrates both technical and creative skills, following all required criteria (see “Objectives & Assignment Coverage” section below).

---

## 🎯 Objectives & Assignment Coverage

- **Use only semantic HTML5 tags:** `<header>`, `<nav>`, `<main>`, `<section>`, `<aside>`, `<footer>`, `<table>`, `<form>`, `<button>`, etc.
- **Separation of style and structure:** All styles are in an external CSS (`muscle.css`), no inline CSS.
- **Navigation bar** with background, links, hover/focus, and padding.
- **Consistent color theme:** Uses HEX/RGB colors, as required.
- **Fixed and responsive sections:** Utilizes box model (margin, padding, border, border-radius, box-shadow) for spacing and layout.
- **Styled table for skills:** Alternating row colors using `:nth-child` selector, bold headers, cell padding.
- **Styled buttons:** Custom color, padding, border-radius, and interaction effects on hover/focus.
- **CSS positioning:** Example: fixed contact bar (`.fixed` class) and relative positions for other UI elements.
- **Custom `<hr>` separators** for section clarity.
- **Accessibility:** Alt text for all images, semantic labels for forms, and Google Fonts for legibility.
- **Validation:** All form fields use `required` attributes.
- **Mobile responsiveness:** Layout adjusts via responsive units and tested on multiple device widths.
- **Fallbacks:** Profile and contact images have JS or HTML `onerror` fallback where needed.

---

## 🧠 About This Project

The website is structured around the following core ideas:
- **Clarity:** Each section—welcome, about, projects, skills, contact—has a clear role.  
- **Semantics:** HTML tag choice reflects the meaning and role of content, improving accessibility and SEO.
- **Separation:** All CSS is kept in a separate file for maintainability and assignment compliance.
- **Progressive enhancement:** Future JavaScript features (see `skin.js`) planned.

---

## 🧩 Site Structure

### 🏠 Header & Navigation
- `<header>` contains my name and navigation (`<nav>`) with easily clickable links for smooth section jumps.
- The search bar uses an `<input>` and `<button>`, styled for subtlety and functionality.

### 📜 Main Content (`<main>`)
- **Welcome Section**: Short introduction and project context.
- **About Me**: Profile image with `alt`, short bio, fallback image logic using the `onerror` attribute.
- **Projects**: Two example tools, listed in simple list elements.
- **Skills Table**: `<table>` with `<thead>`, `<tr>`, `<th>`, and `<td>`, styled for alternation, borders, and legibility.

### 🧾 Contact Form (inside `<aside>`)
- Contact form includes proper `<label>` for accessibility, input fields with `required` validation, and a “Go to Google” demo button.
- Reset and Send functionalities both present.

### 📌 Fixed Contact Panel
- The `.fixed` `<div>` is styled with CSS positioning for a persistent floating contact sidebar.
- Each contact icon uses `<img>` (with `alt`), clickable, and visually distinctive.

### 🧙 Footer
- `<footer>` closes the site with a copyright.

---

## 🛠 Technologies and Methods Used

- **HTML5** with all major semantic tags.
- **CSS3**: Element, class, and ID selectors for precise styling.
- **External CSS only**—no inline styles or embedded `<style>` tags.
- **Box model usage**: `margin`, `padding`, `border`, `border-radius`, and shadows for visual clarity and structure.
- **Pseudo-classes**: `:hover`, `:focus`, `:nth-child(even)` and `:nth-child(odd)` for accessibility and interactive behavior.
- **Responsive units**: `vw`, `%` and `clamp()` for font size and width.
- **Google Fonts integration** for clear, modern typography.
- **Proper file structure** for easy navigation and future extension.

---

## 👁️ Code and File Layout

```
/profileO/
├── index.html
├── static/
│   ├── muscle.css          # All styles, fully external
│   ├── skin.js             # Placeholder for interactive features
│   └── Assets/
│         ├── profile-image.jpg
│         ├── github.png
│         └── ...
└── README.md
```

**index.html**  
- Contains all semantic elements.  
- Scripts (like `skin.js`) referenced at the end for enhancements.

**muscle.css**  
- Grid/flex layouts, responsive containers, navigation bar, fixed contact bar, button styles, custom table styling, animated pseudo-classes.

---

## 💡 How the Code Is Written

- Structured with indentation and logical groupings for clarity
- Semantic elements mapped to content purpose (not just for effect)
- All JavaScript is isolated for optional enhancements (keeps core HTML/CSS clean)
- Each feature reflects an assignment criterion—no extraneous dependencies

---

## ✅ Assignment Checklist

- [x] External CSS
- [x] Semantic tags used throughout
- [x] Styled table with alternate row shading, bold headers
- [x] Custom nav bar and buttons
- [x] Visually distinct sections, separators with hr
- [x] Fixed sidebar/element using CSS positioning
- [x] Responsive/mobile friendly
- [x] Required validation on form
- [x] Accessible images and form labeling
- [x] Clean code organization, easy to extend/refactor

---

## 📄 License

**For personal educational/demo use only. Not open for direct reuse or redistribution.**

---

> *Thank you for viewing my portfolio project!*
