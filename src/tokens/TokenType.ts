export enum TokenType {
	// Foo
	// foo
	// foo-bar
	// foo_bar
	SYMBOL = "SYMBOL",

	// Foo#
	// -foo
	// _foo
	// 1foo
	// 1-foo
	// 1_foo
	// 1foo-bar
	// 1foo_bar
	// 1foo#
	// 1-foo#
	// 1_foo#
	RUNE = "RUNE",

	// 1
	// 1.0
	// +1
	// -1
	// 1.0e1
	// 1.0e+1
	// 1.0e-1
	// 1.0E1
	// 1.0E+1
	NUMBER = "NUMBER",

	// " "
	// \t
	SPACE = "SPACE",

	// \tTabs are at the start of the line
	TAB = "TAB",

	// \n
	BR = "BR",

	// :
	COLON = "COLON",

	// ::
	COLON_COLON = "COLON_COLON",

	FRONTMATTER_START = "FRONTMATTER_START",
	FRONTMATTER_END = "FRONTMATTER_END",
	FRONTMATTER_KEY = "FRONTMATTER_KEY",
	FRONTMATTER_BULLET = "FRONTMATTER_BULLET",
	FRONTMATTER_VALUE = "FRONTMATTER_VALUE",

	CODE_START = "CODE_START",
	CODE_LANGUAGE = "CODE_LANGUAGE",
	CODE_KEY = "CODE_KEY",
	CODE_VALUE = "CODE_VALUE",
	CODE_SOURCE = "CODE_SOURCE",
	CODE_END = "CODE_END",

	HHASH = "HHASH",
	HGTHAN = "HGTHAN",

	L_BRACKET = "L_BRACKET",
	LL_BRACKET = "LL_BRACKET",
	ILL_BRACKET = "ILL_BRACKET",
	R_BRACKET = "R_BRACKET",
	RR_BRACKET = "RR_BRACKET",

	// **
	ASTERISK = "ASTERISK",
	ASTERISK_ASTERISK = "ASTERISK_ASTERISK",

	// 1st
	// 2nd
	// 3rd
	ORDINAL = "ORDINAL",

	// |
	PIPE = "PIPE",

	// #tag
	// #tag-foo
	// #tag_foo
	// #tag1
	// #tag-1
	// #tag_1
	// #-tag1-foo
	TAG = "TAG",

	// ~~
	TILDE_TILDE = "TILDE_TILDE",

	// \"
	ESCAPE = "ESCAPE",

	// (
	L_PAREN = "L_PAREN",

	// )
	R_PAREN = "R_PAREN",

	// `
	BACKTICK = "BACKTICK",

	// $
	DOLLAR = "DOLLAR",

	// $$
	DOLLAR_DOLLAR = "DOLLAR_DOLLAR",

	// %% This is a comment %%
	PERCENT_PERCENT = "PERCENT_PERCENT",
	COMMENT = "COMMENT",

	// <html>
	// </html>
	// <div>
	// <div />
	// </div>
	HTML_TAG = "HTML_TAG",

	// ---
	// ___
	HR = "HR",

	// - foo
	// * foo
	// + foo
	BULLET = "BULLET",
	N_BULLET = "N_BULLET",

	// - [ ]
	// - [x]
	CHECKBOX = "CHECKBOX",

	// https://foo.com
	// http://foo.com
	URL = "URL",

	// end of file
	EOF = "EOF",
}
