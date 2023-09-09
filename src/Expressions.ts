import { Token } from "./Token";
import { TokenType } from "./TokenType";
import { Tokenizer } from "./Tokenizer";
import { Expression } from "./expressions/Expression";
import { TextExpression } from "./expressions/TextExpression";
import { PrimaryExpression } from "./expressions/PrimaryExpression";

export class Expressions {
	root: Expression;
	expression: Expression;
	tokens: Token[] = [];
	token: Token;
	start = 0;
	current = 0;

	constructor(content: string | Token[]) {
		if (typeof content === "string") {
			this.tokens = new Tokenizer(content).getTokens();
		} else {
			this.tokens = content;
		}

		this.root = this.expression = new Expression();
	}

	protected advance(steps = 1): Token {
		const nextIndex = this.current + steps;
		this.token = this.tokens[nextIndex - 1] as Token;
		this.current = nextIndex;
		return this.token;
	}

	protected eof(): boolean {
		return this.peek().type === TokenType.EOF;
	}

	public getExpressionTree(): Expression {
		let recursionValve = 100;

		this.advance();

		while (recursionValve-- > 0 && !this.eof()) {
			this.parseLine();
		}

		return this.root;
	}

	protected text() {
		this.push(new TextExpression());

		while (!this.eof() && this.peek().type !== TokenType.NL) {
			switch (this.token.type) {
				case TokenType.TEXT:
				case TokenType.SPACE:
				case TokenType.PUNCTUATION:
					this.pushAndPop(new PrimaryExpression(this.token));
					break;
			}
			this.advance();
		}
	}

	protected parseLine() {
		switch (this.token.type) {
			case TokenType.TEXT:
			case TokenType.SPACE:
			case TokenType.PUNCTUATION:
				return this.text();
			// return this.primary();
		}
	}

	protected peek(): Token {
		if (this.current >= this.tokens.length) {
			return this.tokens[this.tokens.length - 1] as Token;
		}

		return this.tokens[this.current] as Token;
	}

	protected peekNext(): Token {
		return this.peekFar(1);
	}

	protected peekFar(n: number): Token {
		if (this.current + n >= this.tokens.length) {
			return this.tokens[this.tokens.length - 1] as Token;
		}

		return this.tokens[this.current + n] as Token;
	}

	protected primary(): void {
		this.push(new PrimaryExpression(this.token));
	}

	protected pop(): Expression {
		const expression = this.expression;
		this.expression = this.expression.parent as Expression;
		return expression;
	}

	protected push(expression: Expression) {
		this.expression.push(expression);
		this.expression = expression;
		this.advance();
	}

	protected pushAndPop(expression: Expression) {
		this.expression.push(expression);
		this.advance();
	}
}
