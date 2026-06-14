# Browse Split Column Layout

This note explains how the browse panel creates the two-column layout, the center divider, and the horizontal line beside each topic heading.

## Split Columns

The split view is created by wrapping the columns in `.browse-columns` and rendering each column as `.browse-column`.

```html
<div class="browse-panel">
  <div class="browse-columns">
    <article class="browse-column">
      <!-- left column content -->
    </article>

    <article class="browse-column">
      <!-- right column content -->
    </article>
  </div>
</div>
```

The parent uses CSS Grid with two equal tracks:

```scss
.browse-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
```

`minmax(0, 1fr)` is important because it lets long text shrink inside the column instead of forcing overflow.

## Center Line

The center line is not a separate element. It is the left border of every column that follows another column.

```scss
.browse-column + .browse-column {
  border-left: 1px solid #dfe3e6;
}
```

This selector means: apply the border only to a `.browse-column` that directly follows another `.browse-column`. With two columns, that places one clean divider in the center.

The outer frame comes from `.browse-panel`:

```scss
.browse-panel {
  border: 1px solid #dfe3e6;
  border-radius: 3px;
  background: #fff;
}
```

## Responsive Stacking

On narrower screens, the layout becomes one column. The center divider changes into a top border between stacked columns.

```scss
@media (max-width: 980px) {
  .browse-columns {
    grid-template-columns: 1fr;
  }

  .browse-column + .browse-column {
    border-top: 1px solid #dfe3e6;
    border-left: 0;
  }
}
```

## Topic Header Horizontal Line

Each topic heading uses a three-column grid:

1. Chevron button
2. Topic title
3. Flexible horizontal rule

```html
<header class="topic-header">
  <button type="button" class="chevron-button">
    <span class="chevron" aria-hidden="true"></span>
  </button>
  <h3>Topic title</h3>
  <span class="topic-rule" aria-hidden="true"></span>
</header>
```

The grid reserves fixed space for the chevron, natural width for the title, and gives the remaining space to the rule:

```scss
.topic-header {
  display: grid;
  grid-template-columns: 34px auto minmax(32px, 1fr);
  align-items: center;
  column-gap: 12px;
}
```

The line itself is just a 1px-high span:

```scss
.topic-rule {
  display: block;
  height: 1px;
  background: #dfe3e6;
}
```

Because the third grid column is `minmax(32px, 1fr)`, the rule stretches to fill the available row width but never collapses completely.

## Mobile Header Adjustment

On small screens, the header spacing is reduced so long topic titles fit better.

```scss
@media (max-width: 640px) {
  .topic-header {
    grid-template-columns: 30px minmax(0, auto) minmax(20px, 1fr);
    column-gap: 8px;
  }
}
```

This keeps the same structure while making the chevron and rule more compact.
