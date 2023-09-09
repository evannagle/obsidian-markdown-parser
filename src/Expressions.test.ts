import { expect, test } from "vitest";
import { Expressions } from "./Expressions";

/*

Task: CHECKBOX SPACE TASK_CONTENT


FRONTMATTER:            TRIPLE_DASH NL FRONTMATTER_ITEMS NL TRIPLE_DASH
FRONTMATTER_ITEMS:      FRONTMATTER_ITEM | FRONTMATTER_ITEMS
FRONTMATTER_ITEM:       WORD COLON SPACE FRONTMATTER_VALUE
FRONTMATTER_VALUE:      WORD | SPACE | PUNCTUATION | FRONTMATTER_VALUE | FRONTMATTER_LIST
FRONTMATTER_LIST:       NL DASH SPACE FRONTMATTER_VALUE | FRONTMATTER_LIST


CODE:                   BACKTICKBACKTICK





FRONTMATTER KEY:    

TASK_METADATA:          L_BRACKET WORD COLON_COLON CONTENT R_BRACKET SPACE

TASK_CONTENT:           CONTENT | TASK_METADATA | TASK_CONTENT
CONTENT:                WORD | SPACE | PUNCTUATION | CONTENT

EOL:                    NL | EOF




WORDS:                  WORD | SPACE | WORDS
EOL:                    NL | EOF    
*/

test("expressions are an array", () => {
	const expression = new Expressions(
		"here is a line of text"
	).getExpressionTree();

	console.log(expression.toString());
	// expect(expression[0]?.length).toBe(1);
});
