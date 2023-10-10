# Markdown parser features

## Sections are defined by heading levels

Sections beginning with a heading block like the one above. The level of the section is denoted by the number of hashtags at the start of the heading, e.g. `# Section 1` is at level 1, and `###### Section 6` is at level six.

A section contains three child sections:

1. The **Heading**, which is a single line beginning with 1 - 6 hash tags.
2. The **Lede**, which is any content _after_ the heading and _before_ a subsection.
3. The **Subsections**, which are sections at a greater level than the current section.

### Sections live in a tree of sections and subsections

The current document, then, would be broken down into the following chunks. Note that I'm representing the document as XML, though

```json
{
	"heading": "Markdown parser features",
	"subsections": [
		{
			"heading": "Sections are defined by heading levels",
			"lede": "Sections beginning with a heading...",
			"subsections": [
				{
					"heading": "Sections live in a tree of sections and subsections",
					"lede": "The current document..."
				}
			]
		}
	]
}
```
