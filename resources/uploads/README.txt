R MAGIC CHARMS — AUTOMATIC IMAGE UPLOADS
=========================================

Copy images into the folder matching where they should appear:

  home\       Home page, after selected wedding stories
  about\      Studio & Enquiries page, after the About introduction
  portfolio\  Work page, after the configured couple stories

Supported formats: JPG, JPEG, PNG, WEBP, AVIF.

Refresh the website after copying files. Images are displayed newest first
according to their file modified time. No JavaScript change is required.

FILENAME
--------
The filename becomes the visible title:

  behind-the-scenes-lighting.jpg  ->  Behind The Scenes Lighting

Use readable names without camera codes when possible.

OPTIONAL CAPTIONS AND CREDITS
-----------------------------
Each folder may contain a metadata.json file. Add an entry matching the exact
image filename:

{
  "my-photo.jpg": {
    "title": "A title shown below the image",
    "alt": "An accessible description of the image",
    "credit": "Photographer / licence",
    "creditUrl": "https://example.com/source"
  }
}

Deleting or replacing an image and refreshing removes or updates it on the
website automatically.
