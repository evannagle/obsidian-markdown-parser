import { Token } from "src/Token";
import { Expression } from "./Expression";

export class PrimaryExpression extends Expression {
	constructor(public token: Token) {
		super();
	}
}
