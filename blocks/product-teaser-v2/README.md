# Product Teaser V2 Block

## Overview

`product-teaser-v2` is a key/value commerce block that loads a product by SKU and renders:

- product image
- product name
- product price
- product short description or full description from the commerce catalog
- optional Details and Add to Cart actions

It also supports an author-controlled card background color in DA.live.

## Authoring

Create a block using:

`product-teaser-v2`

Supported fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `sku` | text | Yes | Catalog SKU to load |
| `details-button` | boolean | No | Defaults to `true` |
| `cart-button` | boolean | No | Defaults to `true` |
| `background-color` | text | No | Any valid CSS color value |
