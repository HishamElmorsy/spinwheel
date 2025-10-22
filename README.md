# Spinwheel — Gift Project for **Windsurf**

> **Overview:** This project is an interactive **Spinwheel** app built using **HTML, CSS, JavaScript**, and **Bootstrap**. The right section contains a list of names that can be selected and added to the wheel. You can also add new names dynamically. The project is fully ready for **deployment** (Netlify / Vercel / GitHub Pages).

---

## 📌 Main Features

* A dynamic spinwheel that displays and selects names randomly.
* A right-hand section with a selectable list of names (check/uncheck).
* Ability to add new names through an input field and an “Add” button.
* A **Spin** button that rotates the wheel and randomly selects a winner.
* Built with Bootstrap for responsive and clean UI.
* Optional: Save and load names using **LocalStorage**.

---

## 🎯 Purpose

This project is a **gift for Windsurf** — a simple and fun tool for drawing names in giveaways, team games, or live sessions. It’s easy to use, visually clear, and quick to customize.

---

## 🗂️ Folder Structure

```
spinwheel-project/
├─ index.html
├─ README.md
├─ /css
│  └─ styles.css
├─ /js
│  └─ app.js
├─ /assets
│  ├─ logo.png
│  └─ (images/icons)
└─ /lib
   └─ bootstrap.min.css (or use CDN)
```

> Tip: You can use the Bootstrap CDN instead of hosting the files locally.

---

## 🛠️ Local Setup

1. **Clone or download** the project to your local environment.
2. Open `index.html` directly in your browser, or use **Live Server** in VSCode for auto-reload.
3. (Optional) Install Live Server → Open VSCode → Extensions → search for *“Live Server”* → click **Go Live**.

---

## 🚀 Deployment Guide

### GitHub Pages

1. Push the project to a GitHub repository.
2. Go to **Settings → Pages**, choose the `main` branch and root folder.
3. Wait for the site to publish → it’ll be available at `https://<username>.github.io/<repo>`.

### Netlify

1. Import the GitHub repository into Netlify.
2. Select the `main` branch and click **Deploy**.
3. You’ll get an instant preview URL with custom domain options.

### Vercel

1. Connect your GitHub repository to Vercel.
2. Click **Deploy** — Vercel will auto-detect and publish the site.

> If you’d like a ready `netlify.toml` configuration, I can add one.

---

## 💡 UI Layout Suggestion

* **Left Section (Main):**

  * The Spinwheel graphic (canvas or DOM element).
  * “Spin” button and winner display area.
* **Right Section:**

  * A list of names with checkboxes.
  * Input + Add button for new names.

Add smooth CSS or JS-based animations when the wheel spins.

---

## ✍️ Example JS API (Pseudo)

```js
addName(name)       // Add a name to the list
removeName(name)    // Remove a name
selectName(name)    // Toggle inclusion in the wheel
spin()              // Spin the wheel and return a random winner
```

---

## 🔧 Implementation Notes

* Store the names in an array:

  ```js
  let names = ["Mshmsh","Spy","Borkano","Zuksh","3soom","Vmoor","Gondi","Frank",];
  ```
* Re-render the wheel whenever names change.
* For random selection, generate a random angle and find the corresponding segment.
* Optional persistence via LocalStorage:

  ```js
  localStorage.setItem('spinwheel_names', JSON.stringify(names));
  ```

---

## ✅ Accessibility

* Ensure all buttons are keyboard-focusable (tabindex).
* Use semantic HTML (`<button>`, `<label for>` with checkboxes).
* Display winner text in a readable way for screen readers.

---

## 🧪 Manual Testing Checklist

* Add/remove/select names — verify they update correctly.
* Spin multiple times — check randomization.
* Test responsiveness on mobile/tablet/desktop.
* Refresh page — check if names persist (if using LocalStorage).

---

## 📦 Optional Future Enhancements

* Import names from a CSV file.
* Share results via link or social media.
* Theme customization (colors, logo, font).
* Add sound effects and animations when selecting a winner.

---

## 🧾 License

Use the **MIT License** if you want it to be open source.

---

## 🙏 Final Note — A Gift for Windsurf

A simple yet fun mini-project built with clarity and customization in mind. If you’d like, I can provide a **ready-to-deploy Netlify version** or even upgrade it into a **React app** later.

---

**Developer:** Hisham El Morsy
**Created on:** October 22, 2025
