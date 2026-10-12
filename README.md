# Summer Training Report, animated deck

Built on the Saudi Energy identity: the brand wave flows live in the background (canvas) and reshapes on every slide, with the se logo fixed in the corner.

## Run

Open `index.html` directly, or run `npm start` and open http://localhost:3000

## Edit the copy

Open `content.js` and edit the `SLIDES` array:

```js
{ layout: "statement", wave: { y: .66, amp: .2 }, title: "Your headline", body: "Your text" }
```

Layouts: `cover`, `bleed`, `numbers`, `journey`, `split`, `bento`, `statement`, `factors`, `takeaways`, `honor`, `recs`, `end`. Photos live in `assets/photos/`.

Files: `app.js` rendering and navigation, `wave.js` the live wave, `styles.css` layout, `motion.css` animation, `mobile.css` phones and tablets.

Keys: Right, Down, Space or Page Down for the next slide; Left, Up or Page Up for the previous one; Home and End jump to the first and last slide.
