# Article images

Use the admin's primary image field for the article cover and catalog card.
Inside the HTML body, insert any number of figures between paragraphs:

```html
<figure>
  <img src="https://your-approved-media-host.example/photo.webp"
       alt="Describe what this image shows" width="1200" height="800">
  <figcaption>Optional caption and required credit.</figcaption>
</figure>
```

Upload images through the media library and use their public URLs. Use the real
image dimensions to reserve space and avoid layout shifts. Supply descriptive
alt text; use an empty alt only for decorative images. Use images you have
permission to publish. Body images load lazily and shrink to fit the page.

HTML and internal CSS render directly in the page. CSS is scoped to the article;
scripts, event handlers, external CSS imports, CSS network requests, embedded
frames and forms are removed. The article uses the page's title, canonical URL
and structured metadata; do not paste separate SEO metadata or scripts into it.
