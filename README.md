# ramhoj.github.io

Personal homepage for Nicklas Ramhöj Holtryd. Hosted at https://ramhoj.github.io.

## Structure

```
index.html               # Main page (hero, about, presentations, writing, contact)
site.css                 # Homepage layout and components
styles.css               # Shared design tokens and base styles
assets/                  # Images and static files
presentations/           # Slide decks (each in its own subdirectory)
blog/                    # Long-form writing (each post in its own subdirectory)
```

## Adding a presentation

1. Create a directory under `presentations/` (e.g. `presentations/my-talk/`)
2. Add an `index.html` with the slide content
3. Add a card in the `#presentations` section of `index.html`

## Adding a blog post

1. Create a directory under `blog/` (e.g. `blog/my-post/`)
2. Add an `index.html` with the post content
3. Add a card in the `#writing` section of `index.html`

## Design

- **Font**: Inter
- **Primary color**: `#F43F85` (pink)
- **Dark theme**: grey scale from `#1c1c1e` to `#f8f8f9`

## Hosting

Deployed via GitHub Pages from the `main` branch.
